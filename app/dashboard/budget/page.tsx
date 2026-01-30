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
import { eq, sql } from "drizzle-orm";
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
import { IconFileSpreadsheet } from "@tabler/icons-react";
import { EngagementPieChart } from "@/views/dashboard/budget/pie-graph";
import { ProgramEngagementTable } from "@/views/dashboard/programs/components/program-engagement-table";
import { CreateEngagementForm } from "@/views/dashboard/budget/create-budget-form";

export default async function BudgetPage({
  searchParams,
}: {
  searchParams: Promise<{ programId?: string }>;
}) {
  const resolvedParams = await searchParams;
  const programId = resolvedParams.programId
    ? parseInt(resolvedParams.programId)
    : undefined;

  // Fetch all programs for the selector
  const allPrograms = await db
    .select({
      id: programs.id,
      code: programs.code,
      name: programs.name,
    })
    .from(programs)
    .orderBy(programs.code);

  // Fetch the selected program info (or first program if none selected)
  const selectedProgram = programId
    ? await db.query.programs.findFirst({
        where: eq(programs.id, programId),
      })
    : allPrograms[0] || null;

  // Fetch budget data for the selected program
  const programBudgetData = selectedProgram
    ? await db
        .select({
          totalAE: sql<string>`COALESCE(SUM(CAST(${budgetLines.ae} AS NUMERIC)), 0)`,
          totalEngaged: sql<string>`COALESCE(SUM(CAST(${budgetLines.engaged} AS NUMERIC)), 0)`,
        })
        .from(budgetLines)
        .innerJoin(tasks, eq(budgetLines.taskId, tasks.id))
        .innerJoin(activities, eq(tasks.activityId, activities.id))
        .innerJoin(actions, eq(activities.actionId, actions.id))
        .where(eq(actions.programId, selectedProgram.id))
    : [];

  const programAE = parseFloat(programBudgetData[0]?.totalAE || "0");
  const programEngaged = parseFloat(programBudgetData[0]?.totalEngaged || "0");

  // Fetch all budget lines for the selected program
  const budgetLinesData = selectedProgram
    ? await db
        .select({
          id: budgetLines.id,
          program: actions.code,
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
        .where(eq(actions.programId, selectedProgram.id))
    : [];

  // Convert string values to numbers
  const data = budgetLinesData.map((line) => ({
    ...line,
    ae: parseFloat(line.ae),
    cp: parseFloat(line.cp),
    engaged: parseFloat(line.engaged),
  }));

  // Prepare engagement table data (only for selected program)
  const engagementTableData = selectedProgram
    ? [
        {
          program: selectedProgram.code || "",
          programName: selectedProgram.name || "",
          ae: programAE,
          engaged: programEngaged,
        },
      ]
    : [];

  const formOptions = await getFormOptions();

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
          <div className="flex justify-between gap-2 w-full sm:w-auto">
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
          <EngagementPieChart
            totalAE={programAE}
            totalEngaged={programEngaged}
            programCode={selectedProgram?.code}
            programName={selectedProgram?.name}
          />
          <ProgramEngagementTable
            data={engagementTableData}
            allPrograms={allPrograms}
            programId={selectedProgram?.id}
          />
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
