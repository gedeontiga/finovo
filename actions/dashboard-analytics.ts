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

// 1. KPI Summary - FIXED
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

  return {
    ae,
    cp,
    engaged,
    executionRate: ae > 0 ? (engaged / ae) * 100 : 0,
    linesCount: Number(data.linesCount),
  };
}

// 2. Bar Chart: Budget by Program - RETURNS REAL DATA
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
    .leftJoin(activities, eq(budgetLines.activityId, activities.id))
    .leftJoin(actions, eq(activities.actionId, actions.id))
    .leftJoin(programs, eq(actions.programId, programs.id))
    .groupBy(programs.id, programs.code, programs.name)
    .orderBy(desc(sql`SUM(CAST(${budgetLines.ae} AS NUMERIC))`));

  return result.map((r) => ({
    code: r.code || "Unknown",
    name: r.name || `Programme ${r.code}`,
    ae: parseFloat(r.totalAE || "0"),
    cp: parseFloat(r.totalCP || "0"),
    engaged: parseFloat(r.totalEngaged || "0"),
  }));
}

// 3. Grid Data with proper type conversion
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
    .leftJoin(activities, eq(budgetLines.activityId, activities.id))
    .leftJoin(actions, eq(activities.actionId, actions.id))
    .leftJoin(programs, eq(actions.programId, programs.id))
    .leftJoin(adminUnits, eq(budgetLines.adminUnitId, adminUnits.id))
    .limit(pageSize)
    .offset(offset)
    .orderBy(programs.code, actions.code, activities.code);

  const total = await db
    .select({ count: sql<number>`count(*)` })
    .from(budgetLines);

  return {
    data: data.map((r) => ({
      ...r,
      ae: parseFloat(r.ae || "0"),
      cp: parseFloat(r.cp || "0"),
      engaged: parseFloat(r.engaged || "0"),
    })),
    total: Number(total[0].count),
  };
}

// 4. Programs Summary - FIXED calculations
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
    return {
      id: r.id,
      code: r.code,
      name: r.name,
      ae,
      cp,
      engaged,
      executionRate: ae > 0 ? (engaged / ae) * 100 : 0,
      activitiesCount: Number(r.lineCount),
    };
  });
}

// 5. Admin Units for Pie Chart - REAL DATA
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
    visitors: Math.round(parseFloat(r.value || "0")),
    fill: `hsl(var(--chart-${i + 1}))`,
  }));

  if (others > 0) {
    chartData.push({
      browser: "others",
      visitors: Math.round(others),
      fill: "hsl(var(--chart-6))",
    });
  }

  return chartData;
}
