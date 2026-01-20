"use server";

import { db } from "@/db";
import {
  programs,
  actions,
  activities,
  budgetLines,
  adminUnits,
} from "@/db/schema";
import { parseBudgetExcel } from "@/lib/excel-parser";
import { revalidatePath } from "next/cache";

export async function uploadBudgetFile(formData: FormData) {
  const file = formData.get("file") as File;
  if (!file) throw new Error("No file uploaded");

  const buffer = await file.arrayBuffer();

  // Parse Excel
  const rawData = await parseBudgetExcel(buffer);

  if (rawData.length === 0) {
    return { success: false, message: "No valid data found in file." };
  }

  console.log(`Processing ${rawData.length} budget lines...`);

  // --- Step A: Sync Programs ---
  const uniquePrograms = Array.from(
    new Map(rawData.map((r) => [r.programCode, r])).values(),
  );

  if (uniquePrograms.length > 0) {
    await db
      .insert(programs)
      .values(
        uniquePrograms.map((p) => ({
          code: p.programCode,
          name: p.programName,
        })),
      )
      .onConflictDoNothing();
  }

  const allPrograms = await db.select().from(programs);
  const programMap = new Map(allPrograms.map((p) => [p.code, p.id]));

  // --- Step B: Sync Actions ---
  const uniqueActions = Array.from(
    new Map(
      rawData.map((r) => [`${r.programCode}-${r.actionCode}`, r]),
    ).values(),
  );

  const actionsToInsert = uniqueActions
    .filter((r) => programMap.has(r.programCode))
    .map((r) => ({
      programId: programMap.get(r.programCode)!,
      code: r.actionCode,
      name: r.actionName,
    }));

  if (actionsToInsert.length > 0) {
    await db.insert(actions).values(actionsToInsert).onConflictDoNothing();
  }

  const allActions = await db.select().from(actions);
  const actionMap = new Map(
    allActions.map((a) => [`${a.programId}-${a.code}`, a.id]),
  );

  // --- Step C: Sync Activities ---
  const uniqueActivities = Array.from(
    new Map(
      rawData.map((r) => [
        `${r.programCode}-${r.actionCode}-${r.activityCode}`,
        r,
      ]),
    ).values(),
  );

  const activitiesToInsert: (typeof activities.$inferInsert)[] = [];

  for (const row of uniqueActivities) {
    const pId = programMap.get(row.programCode);
    if (!pId) continue;

    const aId = actionMap.get(`${pId}-${row.actionCode}`);
    if (!aId) continue;

    activitiesToInsert.push({
      actionId: aId,
      code: row.activityCode,
      name: row.activityName,
    });
  }

  if (activitiesToInsert.length > 0) {
    await db
      .insert(activities)
      .values(activitiesToInsert)
      .onConflictDoNothing();
  }

  const allActivities = await db.select().from(activities);
  const activityMap = new Map(
    allActivities.map((a) => [`${a.actionId}-${a.code}`, a.id]),
  );

  // --- Step D: Sync Admin Units ---
  const uniqueAdmins = Array.from(
    new Map(rawData.map((r) => [r.adminUnitCode, r])).values(),
  ).filter((r) => r.adminUnitCode);

  if (uniqueAdmins.length > 0) {
    await db
      .insert(adminUnits)
      .values(
        uniqueAdmins.map((r) => ({
          code: r.adminUnitCode,
          name: r.adminUnitName || "Admin Unit",
        })),
      )
      .onConflictDoNothing();
  }

  const allAdmins = await db.select().from(adminUnits);
  const adminMap = new Map(allAdmins.map((a) => [a.code!, a.id]));

  // --- Step E: Bulk Insert Budget Lines ---
  const linesToInsert: (typeof budgetLines.$inferInsert)[] = [];

  for (const row of rawData) {
    const pId = programMap.get(row.programCode);
    if (!pId) {
      console.warn(`Program not found: ${row.programCode}`);
      continue;
    }

    const actionId = actionMap.get(`${pId}-${row.actionCode}`);
    if (!actionId) {
      console.warn(`Action not found: ${pId}-${row.actionCode}`);
      continue;
    }

    const activityId = activityMap.get(`${actionId}-${row.activityCode}`);
    if (!activityId) {
      console.warn(`Activity not found: ${actionId}-${row.activityCode}`);
      continue;
    }

    const adminId = row.adminUnitCode ? adminMap.get(row.adminUnitCode) : null;

    linesToInsert.push({
      activityId: activityId,
      adminUnitId: adminId || null,
      paragraphCode: row.paragraphCode,
      paragraphName: row.paragraphName,
      ae: row.ae.toString(),
      cp: row.cp.toString(),
      engaged: row.engaged.toString(),
    });
  }

  if (linesToInsert.length > 0) {
    // Insert in batches to avoid overwhelming the database
    const batchSize = 1000;
    for (let i = 0; i < linesToInsert.length; i += batchSize) {
      const batch = linesToInsert.slice(i, i + batchSize);
      await db.insert(budgetLines).values(batch);
      console.log(
        `Inserted batch ${i / batchSize + 1} (${batch.length} lines)`,
      );
    }
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/budget");
  revalidatePath("/dashboard/overview");
  revalidatePath("/dashboard/programs");

  return {
    success: true,
    count: linesToInsert.length,
    message: `Successfully imported ${linesToInsert.length} budget lines`,
  };
}
