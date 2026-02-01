"use server";

import { db } from "@/db";
import {
  programs,
  actions,
  activities,
  tasks, // NEW
  adminUnits,
  budgetLines,
  fiscalYears,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { parseBudgetFile } from "@/lib/excel-parser"; // Fixed Import Name
import { revalidatePath } from "next/cache";

export async function importBudgetAction(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    if (!file) throw new Error("No file provided");

    const buffer = await file.arrayBuffer();
    const parsedData = await parseBudgetFile(buffer);
    const yearRegex = /(19|20)\d{2}/; // matches 1900–2099
    const match = file.name.match(yearRegex);

    let currentYear = new Date().getFullYear();
    if (match) {
      const year = Number(match[0]);

      // Optional sanity check (adjust range as needed)
      if (year >= 2000 && year <= currentYear + 2) {
        currentYear = year;
      }
    }
    let fiscalYear = await db.query.fiscalYears.findFirst({
      where: eq(fiscalYears.year, currentYear),
    });

    if (!fiscalYear) {
      const inserted = await db
        .insert(fiscalYears)
        .values({
          year: currentYear,
          name: `Budget ${currentYear}`,
          isActive: true,
        })
        .returning();
      fiscalYear = inserted[0];
    }

    // Cache to minimize DB hits
    const programCache = new Map<string, number>();
    const actionCache = new Map<string, number>();
    const activityCache = new Map<string, number>();
    const taskCache = new Map<string, number>(); // NEW
    const adminCache = new Map<string, number>();

    for (const line of parsedData) {
      // 1. Program
      if (!programCache.has(line.programCode)) {
        let prog = await db.query.programs.findFirst({
          where: eq(programs.code, line.programCode),
        });
        if (!prog) {
          const res = await db
            .insert(programs)
            .values({
              code: line.programCode,
              name: line.programName || `Programme ${line.programCode}`,
            })
            .returning();
          prog = res[0];
        }
        programCache.set(line.programCode, prog.id);
      }
      const programId = programCache.get(line.programCode)!;

      // 2. Action
      const actionKey = `${programId}-${line.actionCode}`;
      if (!actionCache.has(actionKey)) {
        let action = await db.query.actions.findFirst({
          where: and(
            eq(actions.programId, programId),
            eq(actions.code, line.actionCode),
          ),
        });
        if (!action) {
          const res = await db
            .insert(actions)
            .values({
              programId,
              code: line.actionCode,
              name: line.actionName || `Action ${line.actionCode}`,
            })
            .returning();
          action = res[0];
        }
        actionCache.set(actionKey, action.id);
      }
      const actionId = actionCache.get(actionKey)!;

      // 3. Activity
      const activityKey = `${actionId}-${line.activityCode}`;
      if (!activityCache.has(activityKey)) {
        let activity = await db.query.activities.findFirst({
          where: and(
            eq(activities.actionId, actionId),
            eq(activities.code, line.activityCode),
          ),
        });
        if (!activity) {
          const res = await db
            .insert(activities)
            .values({
              actionId,
              code: line.activityCode,
              name: line.activityName || `Activité ${line.activityCode}`,
            })
            .returning();
          activity = res[0];
        }
        activityCache.set(activityKey, activity.id);
      }
      const activityId = activityCache.get(activityKey)!;

      // 4. Task (NEW STEP)
      // Use a default name if task is missing in Excel
      const taskName = line.taskName || "Tâche par défaut";
      const taskKey = `${activityId}-${taskName}`;

      if (!taskCache.has(taskKey)) {
        let task = await db.query.tasks.findFirst({
          where: and(
            eq(tasks.activityId, activityId),
            eq(tasks.name, taskName),
          ),
        });
        if (!task) {
          const res = await db
            .insert(tasks)
            .values({
              activityId,
              name: taskName,
              description: "Imported from Excel",
            })
            .returning();
          task = res[0];
        }
        taskCache.set(taskKey, task.id);
      }
      const taskId = taskCache.get(taskKey)!;

      // 5. Admin Unit
      let adminUnitId: number | undefined = undefined;
      if (line.adminUnitCode) {
        if (!adminCache.has(line.adminUnitCode)) {
          let admin = await db.query.adminUnits.findFirst({
            where: eq(adminUnits.code, line.adminUnitCode),
          });
          if (!admin) {
            const res = await db
              .insert(adminUnits)
              .values({
                code: line.adminUnitCode,
                name: line.adminUnitName || `Unit ${line.adminUnitCode}`,
              })
              .returning();
            admin = res[0];
          }
          adminCache.set(line.adminUnitCode, admin.id);
        }
        adminUnitId = adminCache.get(line.adminUnitCode);
      }

      // 6. Budget Line
      await db.insert(budgetLines).values({
        fiscalYearId: fiscalYear.id,
        taskId, // CHANGED: activityId -> taskId
        adminUnitId,
        paragraphCode: line.paragraphCode,
        paragraphName: line.paragraphName,
        ae: line.ae.toString(),
        cp: line.cp.toString(),
        engaged: line.engaged.toString(),
      });
    }

    revalidatePath("/dashboard/budget");
    return { success: true, count: parsedData.length };
  } catch (err: any) {
    console.error("Import Error:", err);
    return { success: false, error: err.message };
  }
}
