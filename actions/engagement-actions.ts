"use server";

import { db } from "@/db";
import { budgetLines, tasks, fiscalYears } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

interface CreateEngagementInput {
  activityId: number;
  adminUnitId?: number;
  description: string;
  paragraphCode: string;
  amount: number;
}

export async function createEngagementAction(data: CreateEngagementInput) {
  try {
    // Get or create active fiscal year
    const activeFiscalYear = await db
      .select()
      .from(fiscalYears)
      .where(eq(fiscalYears.isActive, true))
      .limit(1);

    let fiscalYearId: number;

    if (activeFiscalYear.length > 0) {
      fiscalYearId = activeFiscalYear[0].id;
    } else {
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

    // Create or find task
    let task = await db.query.tasks.findFirst({
      where: and(
        eq(tasks.activityId, data.activityId),
        eq(tasks.name, data.description.substring(0, 100)),
      ),
    });

    if (!task) {
      const inserted = await db
        .insert(tasks)
        .values({
          activityId: data.activityId,
          name: data.description.substring(0, 100),
          description: data.description,
        })
        .returning();
      task = inserted[0];
    }

    // Create budget line (engagement)
    await db.insert(budgetLines).values({
      fiscalYearId: fiscalYearId,
      taskId: task.id,
      adminUnitId: data.adminUnitId || null,
      paragraphCode: data.paragraphCode,
      paragraphName: data.description,
      ae: data.amount.toString(),
      cp: data.amount.toString(), // CP equals AE initially
      engaged: "0", // New engagement starts with 0 engaged
    });

    revalidatePath("/dashboard/budget");
    revalidatePath("/dashboard/overview");
    revalidatePath("/dashboard/programs");

    return {
      success: true,
      message: "Engagement created successfully",
      taskId: task.id,
    };
  } catch (error) {
    console.error("Create engagement error:", error);
    return {
      success: false,
      message: "Failed to create engagement",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

interface UpdateEngagementInput {
  id: number;
  engaged: number;
}

export async function updateEngagementAction(data: UpdateEngagementInput) {
  try {
    // Get current budget line to check limits
    const budgetLine = await db.query.budgetLines.findFirst({
      where: eq(budgetLines.id, data.id),
    });

    if (!budgetLine) {
      return { success: false, message: "Budget line not found" };
    }

    const ae = parseFloat(budgetLine.ae);

    // Validate engagement doesn't exceed authorized amount
    if (data.engaged > ae) {
      return {
        success: false,
        message: `Engagement (${data.engaged}) cannot exceed authorized amount (${ae})`,
      };
    }

    // Update engagement
    await db
      .update(budgetLines)
      .set({
        engaged: data.engaged.toString(),
      })
      .where(eq(budgetLines.id, data.id));

    revalidatePath("/dashboard/budget");
    revalidatePath("/dashboard/overview");
    revalidatePath("/dashboard/programs");

    return { success: true, message: "Engagement updated successfully" };
  } catch (error) {
    console.error("Update engagement error:", error);
    return { success: false, message: "Failed to update engagement" };
  }
}
