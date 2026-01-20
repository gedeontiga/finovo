"use server";

import { db } from "@/db";
import {
  budgetLines,
  programs,
  actions,
  activities,
  adminUnits,
} from "@/db/schema";
import { sql, eq, desc } from "drizzle-orm";

export async function getBudgetSummary() {
  const result = await db
    .select({
      totalAE: sql<string>`COALESCE(SUM(CAST(${budgetLines.ae} AS NUMERIC)), 0)`,
      totalCP: sql<string>`COALESCE(SUM(CAST(${budgetLines.cp} AS NUMERIC)), 0)`,
      totalEngaged: sql<string>`COALESCE(SUM(CAST(${budgetLines.engaged} AS NUMERIC)), 0)`,
      linesCount: sql<number>`count(*)`,
    })
    .from(budgetLines);

  const data = result[0];
  const ae = parseFloat(data.totalAE || "0");
  const cp = parseFloat(data.totalCP || "0");
  const engaged = parseFloat(data.totalEngaged || "0");

  // NOT (ae / engaged) which was causing 355.97%
  const executionRate = ae > 0 ? (engaged / ae) * 100 : 0;

  return {
    ae,
    cp,
    engaged,
    executionRate, // Now correctly calculated
    disponible: ae - engaged, // Available budget
    linesCount: Number(data.linesCount),
  };
}

/**
 * Get budget by program with correct calculations
 */
export async function getBudgetByProgram() {
  const result = await db
    .select({
      code: programs.code,
      name: programs.name,
      totalAE: sql<string>`COALESCE(SUM(CAST(${budgetLines.ae} AS NUMERIC)), 0)`,
      totalCP: sql<string>`COALESCE(SUM(CAST(${budgetLines.cp} AS NUMERIC)), 0)`,
      totalEngaged: sql<string>`COALESCE(SUM(CAST(${budgetLines.engaged} AS NUMERIC)), 0)`,
    })
    .from(budgetLines)
    .innerJoin(activities, eq(budgetLines.activityId, activities.id))
    .innerJoin(actions, eq(activities.actionId, actions.id))
    .innerJoin(programs, eq(actions.programId, programs.id))
    .groupBy(programs.id, programs.code, programs.name)
    .orderBy(desc(sql`SUM(CAST(${budgetLines.ae} AS NUMERIC))`));

  return result.map((r) => {
    const ae = parseFloat(r.totalAE || "0");
    const cp = parseFloat(r.totalCP || "0");
    const engaged = parseFloat(r.totalEngaged || "0");

    return {
      code: r.code || "Unknown",
      name: r.name || `Programme ${r.code}`,
      ae,
      cp,
      engaged,
      executionRate: ae > 0 ? (engaged / ae) * 100 : 0,
      disponible: ae - engaged,
    };
  });
}

/**
 * Get budget lines with proper data for table display
 */
export async function getBudgetLinesRaw(page = 1, pageSize = 100) {
  const offset = (page - 1) * pageSize;

  const data = await db
    .select({
      id: budgetLines.id,
      program: programs.code,
      programName: programs.name,
      action: actions.code,
      actionName: actions.name,
      activity: activities.code,
      activityName: activities.name,
      adminCode: adminUnits.code,
      adminName: adminUnits.name,
      paragraph: budgetLines.paragraphCode,
      paragraphName: budgetLines.paragraphName,
      ae: budgetLines.ae,
      cp: budgetLines.cp,
      engaged: budgetLines.engaged,
    })
    .from(budgetLines)
    .innerJoin(activities, eq(budgetLines.activityId, activities.id))
    .innerJoin(actions, eq(activities.actionId, actions.id))
    .innerJoin(programs, eq(actions.programId, programs.id))
    .leftJoin(adminUnits, eq(budgetLines.adminUnitId, adminUnits.id))
    .limit(pageSize)
    .offset(offset)
    .orderBy(programs.code, actions.code, activities.code);

  const total = await db
    .select({ count: sql<number>`count(*)` })
    .from(budgetLines);

  return {
    data: data.map((r) => {
      const ae = parseFloat(r.ae || "0");
      const cp = parseFloat(r.cp || "0");
      const engaged = parseFloat(r.engaged || "0");

      return {
        ...r,
        ae,
        cp,
        engaged,
        executionRate: ae > 0 ? (engaged / ae) * 100 : 0,
        disponible: ae - engaged,
      };
    }),
    total: Number(total[0].count),
  };
}

/**
 * FIXED: Programs summary with correct calculations
 */
export async function getProgramsSummary() {
  const rows = await db
    .select({
      id: programs.id,
      code: programs.code,
      name: programs.name,
      totalAE: sql<string>`COALESCE(SUM(CAST(${budgetLines.ae} AS NUMERIC)), 0)`,
      totalCP: sql<string>`COALESCE(SUM(CAST(${budgetLines.cp} AS NUMERIC)), 0)`,
      totalEngaged: sql<string>`COALESCE(SUM(CAST(${budgetLines.engaged} AS NUMERIC)), 0)`,
      lineCount: sql<number>`count(${budgetLines.id})`,
    })
    .from(programs)
    .leftJoin(actions, eq(actions.programId, programs.id))
    .leftJoin(activities, eq(activities.actionId, actions.id))
    .leftJoin(budgetLines, eq(budgetLines.activityId, activities.id))
    .groupBy(programs.id, programs.code, programs.name)
    .orderBy(programs.code);

  return rows.map((r) => {
    const ae = parseFloat(r.totalAE || "0");
    const cp = parseFloat(r.totalCP || "0");
    const engaged = parseFloat(r.totalEngaged || "0");

    // FIXED: Correct execution rate
    const executionRate = ae > 0 ? (engaged / ae) * 100 : 0;

    return {
      id: r.id,
      code: r.code,
      name: r.name,
      ae,
      cp,
      engaged,
      executionRate,
      disponible: ae - engaged,
      activitiesCount: Number(r.lineCount),
    };
  });
}

/**
 * Get admin unit statistics for pie chart
 */
export async function getAdminUnitStats() {
  const result = await db
    .select({
      name: adminUnits.name,
      code: adminUnits.code,
      value: sql<string>`COALESCE(SUM(CAST(${budgetLines.ae} AS NUMERIC)), 0)`,
    })
    .from(budgetLines)
    .innerJoin(adminUnits, eq(budgetLines.adminUnitId, adminUnits.id))
    .groupBy(adminUnits.id, adminUnits.name, adminUnits.code)
    .orderBy(desc(sql`SUM(CAST(${budgetLines.ae} AS NUMERIC))`))
    .limit(6);

  const totalResult = await db
    .select({
      total: sql<string>`COALESCE(SUM(CAST(${budgetLines.ae} AS NUMERIC)), 0)`,
    })
    .from(budgetLines)
    .innerJoin(adminUnits, eq(budgetLines.adminUnitId, adminUnits.id));

  const total = parseFloat(totalResult[0]?.total || "0");
  const topSum = result.reduce((sum, r) => sum + parseFloat(r.value || "0"), 0);
  const others = total - topSum;

  const chartData = result.slice(0, 5).map((r, i) => ({
    browser: r.code || "unknown",
    name: r.name || "Unknown",
    visitors: Math.round(parseFloat(r.value || "0")),
    fill: `hsl(var(--chart-${i + 1}))`, // Use theme colors
  }));

  if (others > 0) {
    chartData.push({
      browser: "others",
      name: "Autres",
      visitors: Math.round(others),
      fill: "hsl(var(--chart-6))",
    });
  }

  return chartData;
}
