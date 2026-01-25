import PageContainer from "@/components/layout/page-container";
import { db } from "@/db";
import {
  budgetLines,
  programs,
  actions,
  activities,
  adminUnits,
  tasks,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { getFormOptions } from "@/actions/budget-actions";
import { BudgetUploader } from "@/views/dashboard/budget/budget-upload-button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { BudgetTable } from "./budget-table";
import {
  IconDatabase,
  IconFileSpreadsheet,
  IconTrendingUp,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { EngagementPieChart } from "@/views/dashboard/budget/pie-graph";
import { ProgramEngagementTable } from "@/views/dashboard/programs/components/program-engagement-table";
import { CreateEngagementForm } from "@/views/dashboard/budget/create-budget-form";

export default async function BudgetPage() {
  const allData = await db
    .select({
      id: budgetLines.id,
      program: programs.code,
      programName: programs.name,
      action: actions.code,
      actionName: actions.name,
      activity: activities.code,
      activityName: activities.name,
      taskName: tasks.name,
      adminCode: adminUnits.code,
      adminName: adminUnits.name,
      paragraph: budgetLines.paragraphCode,
      paragraphName: budgetLines.paragraphName,
      ae: budgetLines.ae,
      cp: budgetLines.cp,
      engaged: budgetLines.engaged,
    })
    .from(budgetLines)
    .innerJoin(tasks, eq(budgetLines.taskId, tasks.id))
    .innerJoin(activities, eq(tasks.activityId, activities.id))
    .innerJoin(actions, eq(activities.actionId, actions.id))
    .innerJoin(programs, eq(actions.programId, programs.id))
    .leftJoin(adminUnits, eq(budgetLines.adminUnitId, adminUnits.id))
    .orderBy(programs.code, actions.code, activities.code);

  const data = allData.map((r) => {
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
  });

  const totalAE = data.reduce((sum, item) => sum + item.ae, 0);
  const totalCP = data.reduce((sum, item) => sum + item.cp, 0);
  const totalEngaged = data.reduce((sum, item) => sum + item.engaged, 0);
  const avgExecutionRate = totalAE > 0 ? (totalEngaged / totalAE) * 100 : 0;
  const highRiskLines = data.filter((item) => item.executionRate > 90).length;

  const formOptions = await getFormOptions();

  const formatCompact = (n: number) =>
    new Intl.NumberFormat("fr-FR", {
      notation: "compact",
      compactDisplay: "short",
      maximumFractionDigits: 1,
    }).format(n);

  return (
    <PageContainer>
      <div className="flex flex-col space-y-4 sm:space-y-6 px-2 sm:px-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
          <div className="w-full sm:w-auto">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Budget Management
            </h2>
            <p className="text-muted-foreground text-xs sm:text-sm mt-1">
              Manage budget lines with advanced filtering and sorting
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <CreateEngagementForm
              programs={formOptions.programs}
              actions={formOptions.actions}
              activities={formOptions.activities}
              adminUnits={formOptions.adminUnits}
            />
            <BudgetUploader />
          </div>
        </div>

        {/* Engagement Overview */}
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
          <EngagementPieChart totalAE={totalAE} totalEngaged={totalEngaged} />
          <ProgramEngagementTable data={data} />
        </div>

        {/* Data Table */}
        <Card className="border-border/50 shadow-md">
          <CardHeader className="py-3 sm:py-5 border-b px-3 sm:px-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
                  <IconFileSpreadsheet className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  <span className="hidden sm:inline">
                    Budget Lines Database
                  </span>
                  <span className="sm:hidden">Budget Lines</span>
                </CardTitle>
                <CardDescription className="mt-1 text-xs sm:text-sm">
                  <span className="hidden sm:inline">
                    Click on any row to edit • Hover over row number to delete •
                    Swipe left on mobile
                  </span>
                  <span className="sm:hidden">
                    Tap to edit • Swipe left to delete
                  </span>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <BudgetTable data={data} />
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
