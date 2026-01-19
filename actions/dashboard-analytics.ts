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
import { sql, eq, desc } from "drizzle-orm";

// 1. KPI Summary
export async function getBudgetSummary() {
  const result = await db
    .select({
      totalAE: sql<number>`COALESCE(SUM(${budgetLines.ae}), 0)`,
      totalCP: sql<number>`COALESCE(SUM(${budgetLines.cp}), 0)`,
      totalEngaged: sql<number>`COALESCE(SUM(${budgetLines.engaged}), 0)`,
      linesCount: sql<number>`count(*)`,
    })
    .from(budgetLines);

  const data = result[0];
  const ae = Number(data.totalAE);
  const engaged = Number(data.totalEngaged);

  return {
    ae,
    cp: Number(data.totalCP),
    engaged,
    executionRate: ae > 0 ? (engaged / ae) * 100 : 0,
    linesCount: Number(data.linesCount),
  };
}

// 2. Bar Chart: Budget by Program
export async function getBudgetByProgram() {
  // complex join to aggregate by Program Code
  const result = await db
    .select({
      code: programs.code,
      name: programs.name,
      totalAE: sql<number>`SUM(${budgetLines.ae})`,
      totalEngaged: sql<number>`SUM(${budgetLines.engaged})`,
    })
    .from(budgetLines)
    .leftJoin(activities, eq(budgetLines.activityId, activities.id))
    .leftJoin(actions, eq(activities.actionId, actions.id))
    .leftJoin(programs, eq(actions.programId, programs.id))
    .groupBy(programs.id, programs.code, programs.name)
    .orderBy(desc(sql`SUM(${budgetLines.ae})`))
    .limit(10); // Top 10 programs

  return result.map((r) => ({
    name: `Prog ${r.code}`,
    fullName: r.name,
    ae: Number(r.totalAE),
    engaged: Number(r.totalEngaged),
  }));
}

// 3. Grid Data: The "Excel" View
export async function getBudgetLinesRaw(page = 1, pageSize = 50) {
  const offset = (page - 1) * pageSize;

  const data = await db
    .select({
      id: budgetLines.id,
      program: programs.code,
      action: actions.code,
      activity: activities.code,
      paragraph: budgetLines.paragraphCode,
      paragraphName: budgetLines.paragraphName,
      ae: budgetLines.ae,
      cp: budgetLines.cp,
      engaged: budgetLines.engaged,
    })
    .from(budgetLines)
    .leftJoin(activities, eq(budgetLines.activityId, activities.id))
    .leftJoin(actions, eq(activities.actionId, actions.id))
    .leftJoin(programs, eq(actions.programId, programs.id))
    .limit(pageSize)
    .offset(offset)
    .orderBy(programs.code, actions.code, activities.code);

  const total = await db
    .select({ count: sql<number>`count(*)` })
    .from(budgetLines);

  return {
    data: data.map((r) => ({
      ...r,
      ae: Number(r.ae),
      cp: Number(r.cp),
      engaged: Number(r.engaged),
    })),
    total: Number(total[0].count),
  };
}

// NEW: Get aggregated list of Programs
export async function getProgramsSummary() {
  // Use a Left Join strategy to ensure Programs show up even if budget is 0
  const rows = await db
    .select({
      id: programs.id,
      code: programs.code,
      name: programs.name,
      totalAE: sql<number>`COALESCE(SUM(${budgetLines.ae}), 0)`,
      totalEngaged: sql<number>`COALESCE(SUM(${budgetLines.engaged}), 0)`,
      lineCount: sql<number>`count(${budgetLines.id})`,
    })
    .from(programs)
    // Link hierarchy: Programs -> Actions -> Activities -> BudgetLines
    .leftJoin(actions, eq(actions.programId, programs.id))
    .leftJoin(activities, eq(activities.actionId, actions.id))
    .leftJoin(budgetLines, eq(budgetLines.activityId, activities.id))
    .groupBy(programs.id, programs.code, programs.name)
    .orderBy(programs.code);

  return rows.map((r) => {
    const ae = Number(r.totalAE);
    const engaged = Number(r.totalEngaged);
    return {
      id: r.id,
      code: r.code,
      name: r.name,
      ae: ae,
      cp: 0, // CP logic same as AE if needed
      engaged: engaged,
      executionRate: ae > 0 ? (engaged / ae) * 100 : 0,
      activitiesCount: Number(r.lineCount),
    };
  });
}

// NEW: Get Top Admin Units for Pie Chart
export async function getAdminUnitStats() {
  // This assumes you want to see who holds the most budget
  // Admin Units are often missing in some excel rows, so we filter nulls
  const result = await db
    .select({
      name: adminUnits.name,
      value: sql<number>`SUM(${budgetLines.ae})`,
    })
    .from(budgetLines)
    .innerJoin(adminUnits, eq(budgetLines.adminUnitId, adminUnits.id))
    .groupBy(adminUnits.name)
    .orderBy(desc(sql`SUM(${budgetLines.ae})`))
    .limit(5); // Top 5 units

  // Calculate "Others" if needed, but for now simple top 5
  return result.map((r) => ({
    name: r.name,
    value: Number(r.value),
    fill: `var(--primary)`, // We will handle colors in the component
  }));
}

export async function getCurrentFiscalYear() {
  const result = await db
    .select()
    .from(fiscalYears)
    .where(eq(fiscalYears.isActive, true))
    .limit(1);
  if (result.length > 0) return result[0].year;

  // Fallback: check any year
  const anyYear = await db.select().from(fiscalYears).limit(1);
  return anyYear.length > 0 ? anyYear[0].year : "N/A";
}
