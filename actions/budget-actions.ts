"use server";

import { db } from "@/db";
import {
  budgetLines,
  programs,
  actions,
  activities,
  adminUnits,
  fiscalYears,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateBudgetLineAction(
  id: number,
  data: { ae: number; cp: number; engaged: number },
) {
  try {
    await db
      .update(budgetLines)
      .set({
        ae: data.ae.toString(),
        cp: data.cp.toString(),
        engaged: data.engaged.toString(),
      })
      .where(eq(budgetLines.id, id));

    revalidatePath("/dashboard/budget");
    revalidatePath("/dashboard/overview");
    revalidatePath("/dashboard/programs");

    return { success: true, message: "Budget line updated successfully" };
  } catch (error) {
    console.error("Update error:", error);
    return { success: false, message: "Failed to update budget line" };
  }
}

export async function createBudgetLineAction(data: {
  activityId: number;
  adminUnitId?: number;
  paragraphCode: string;
  paragraphName: string;
  ae: number;
  cp: number;
  engaged: number;
}) {
  try {
    // Get the active fiscal year
    const activeFiscalYear = await db
      .select()
      .from(fiscalYears)
      .where(eq(fiscalYears.isActive, true))
      .limit(1);

    let fiscalYearId: number;

    if (activeFiscalYear.length > 0) {
      fiscalYearId = activeFiscalYear[0].id;
    } else {
      // Create a new active fiscal year if none exists
      const currentYear = new Date().getFullYear();
      const inserted = await db
        .insert(fiscalYears)
        .values({
          year: currentYear,
          name: `Budget ${currentYear}`,
          isActive: true,
        })
        .returning({ id: fiscalYears.id });

      fiscalYearId = inserted[0].id;
    }

    await db.insert(budgetLines).values({
      fiscalYearId: fiscalYearId,
      activityId: data.activityId,
      adminUnitId: data.adminUnitId || null,
      paragraphCode: data.paragraphCode,
      paragraphName: data.paragraphName,
      ae: data.ae.toString(),
      cp: data.cp.toString(),
      engaged: data.engaged.toString(),
    });

    revalidatePath("/dashboard/budget");
    revalidatePath("/dashboard/overview");
    revalidatePath("/dashboard/programs");

    return { success: true, message: "Budget line created successfully" };
  } catch (error) {
    console.error("Create error:", error);
    return { success: false, message: "Failed to create budget line" };
  }
}

export async function deleteBudgetLineAction(id: number) {
  try {
    await db.delete(budgetLines).where(eq(budgetLines.id, id));

    revalidatePath("/dashboard/budget");
    revalidatePath("/dashboard/overview");
    revalidatePath("/dashboard/programs");

    return { success: true, message: "Budget line deleted successfully" };
  } catch (error) {
    console.error("Delete error:", error);
    return { success: false, message: "Failed to delete budget line" };
  }
}

// Get options for form dropdowns - FIXED to return string values
export async function getFormOptions() {
  const [programsList, actionsList, activitiesList, adminUnitsList] =
    await Promise.all([
      db
        .select({ id: programs.id, code: programs.code, name: programs.name })
        .from(programs),
      db
        .select({
          id: actions.id,
          code: actions.code,
          name: actions.name,
          programId: actions.programId,
        })
        .from(actions),
      db
        .select({
          id: activities.id,
          code: activities.code,
          name: activities.name,
          actionId: activities.actionId,
        })
        .from(activities),
      db
        .select({
          id: adminUnits.id,
          code: adminUnits.code,
          name: adminUnits.name,
        })
        .from(adminUnits),
    ]);

  return {
    programs: programsList.map((p) => ({
      value: p.id.toString(),
      label: `${p.code} - ${p.name}`,
    })),
    actions: actionsList.map((a) => ({
      value: a.id.toString(),
      label: `${a.code} - ${a.name}`,
      programId: a.programId.toString(),
    })),
    activities: activitiesList.map((a) => ({
      value: a.id.toString(),
      label: `${a.code} - ${a.name}`,
      actionId: a.actionId.toString(),
    })),
    adminUnits: adminUnitsList.map((u) => ({
      value: u.id.toString(),
      label: `${u.code} - ${u.name}`,
    })),
  };
}

// Program Management Actions
export async function createProgramAction(data: {
  code: string;
  name: string;
}) {
  try {
    await db.insert(programs).values({
      code: data.code,
      name: data.name,
    });

    revalidatePath("/dashboard/programs");
    revalidatePath("/dashboard/budget");

    return { success: true, message: "Program created successfully" };
  } catch (error) {
    console.error("Create program error:", error);
    return { success: false, message: "Failed to create program" };
  }
}

export async function updateProgramAction(
  id: number,
  data: { code: string; name: string },
) {
  try {
    await db
      .update(programs)
      .set({
        code: data.code,
        name: data.name,
      })
      .where(eq(programs.id, id));

    revalidatePath("/dashboard/programs");
    revalidatePath("/dashboard/budget");

    return { success: true, message: "Program updated successfully" };
  } catch (error) {
    console.error("Update program error:", error);
    return { success: false, message: "Failed to update program" };
  }
}

export async function deleteProgramAction(id: number) {
  try {
    // Check if program has associated data
    const relatedActions = await db
      .select()
      .from(actions)
      .where(eq(actions.programId, id))
      .limit(1);

    if (relatedActions.length > 0) {
      return {
        success: false,
        message:
          "Cannot delete program with associated actions and budget data",
      };
    }

    await db.delete(programs).where(eq(programs.id, id));

    revalidatePath("/dashboard/programs");
    revalidatePath("/dashboard/budget");

    return { success: true, message: "Program deleted successfully" };
  } catch (error) {
    console.error("Delete program error:", error);
    return { success: false, message: "Failed to delete program" };
  }
}
