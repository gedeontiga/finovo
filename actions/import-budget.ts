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

  // 1. Parse Excel (CPU Bound)
  // This returns a flat array of every row in the excel file
  const rawData = await parseBudgetExcel(buffer);

  if (rawData.length === 0) {
    return { success: false, message: "No valid data found in file." };
  }

  // --- Step A: Sync Programs ---
  // Get unique programs from file
  const uniquePrograms = Array.from(
    new Map(rawData.map((r) => [r.programCode, r])).values(),
  );

  if (uniquePrograms.length > 0) {
    await db
      .insert(programs)
      .values(
        uniquePrograms.map((p) => ({
          code: p.programCode,
          name: `Programme ${p.programCode}`, // Default name if not extracted, or enhance parser to get name
        })),
      )
      .onConflictDoNothing();
  }

  // Fetch all programs to get IDs
  const allPrograms = await db.select().from(programs);
  const programMap = new Map(allPrograms.map((p) => [p.code, p.id]));

  // --- Step B: Sync Actions ---
  // We need to link Actions to Program IDs
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
      name: `Action ${r.actionCode}`, // Default name
    }));

  if (actionsToInsert.length > 0) {
    await db.insert(actions).values(actionsToInsert).onConflictDoNothing();
  }

  // Fetch all relevant actions to get IDs
  // We construct a composite key map: "ProgramID-ActionCode" -> ActionID
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
      name: row.activityName || "Unknown Activity",
    });
  }

  if (activitiesToInsert.length > 0) {
    await db
      .insert(activities)
      .values(activitiesToInsert)
      .onConflictDoNothing();
  }

  // Fetch all activities
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

  // =========================================================
  // FINAL STEP: Bulk Insert Budget Lines
  // =========================================================

  const linesToInsert: (typeof budgetLines.$inferInsert)[] = [];

  for (const row of rawData) {
    // Resolve Hierarchy IDs
    const pId = programMap.get(row.programCode);
    if (!pId) continue;

    const actionId = actionMap.get(`${pId}-${row.actionCode}`);
    if (!actionId) continue;

    const activityId = activityMap.get(`${actionId}-${row.activityCode}`);
    if (!activityId) continue; // Skip if hierarchy is broken

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

  // Drizzle allows batch inserting
  // If the array is massive (>5000), you might want to chunk it, but for standard Excel files, this is fine.
  if (linesToInsert.length > 0) {
    await db.insert(budgetLines).values(linesToInsert);
  }

  revalidatePath("/dashboard");
  return { success: true, count: linesToInsert.length };
}
