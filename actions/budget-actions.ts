"use server";

import { db } from "@/db";
import { budgetLines } from "@/db/schema";
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
    return { success: true, message: "Line updated" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to update" };
  }
}
