import PageContainer from "@/components/layout/page-container";
import { db } from "@/db";
import {
	budgetLines,
	programs,
	actions,
	activities,
	adminUnits,
	tasks
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { getFormOptions } from "@/actions/budget-actions";
import { BudgetUploader } from "@/views/dashboard/budget/budget-upload-button";
import { CreateBudgetForm } from "@/views/dashboard/budget/create-budget-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BudgetTable } from "./budget-table";
import { IconDatabase, IconFileSpreadsheet, IconTrendingUp, IconAlertTriangle } from "@tabler/icons-react";

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
	const highRiskLines = data.filter(item => item.executionRate > 90).length;

	const formOptions = await getFormOptions();

	const formatCompact = (n: number) =>
		new Intl.NumberFormat('fr-FR', {
			notation: 'compact',
			compactDisplay: 'short',
			maximumFractionDigits: 1
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
						<CreateBudgetForm
							programs={formOptions.programs}
							actions={formOptions.actions}
							activities={formOptions.activities}
							adminUnits={formOptions.adminUnits}
						/>
						<BudgetUploader />
					</div>
				</div>

				{/* Summary Cards */}
				<div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
					<Card className="border-border/50 hover:shadow-md transition-shadow">
						<CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
							<CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1.5 sm:gap-2">
								<IconDatabase className="h-3 w-3 sm:h-4 sm:w-4" />
								<span className="hidden xs:inline">Total Records</span>
								<span className="xs:hidden">Records</span>
							</CardTitle>
						</CardHeader>
						<CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
							<div className="text-xl sm:text-2xl font-bold tabular-nums">
								{data.length.toLocaleString('fr-FR')}
							</div>
							<p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
								Active budget lines
							</p>
						</CardContent>
					</Card>

					<Card className="border-border/50 hover:shadow-md transition-shadow">
						<CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
							<CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
								Total AE
							</CardTitle>
						</CardHeader>
						<CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
							<div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400 tabular-nums">
								{formatCompact(totalAE)}
							</div>
							<p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
								CP: {formatCompact(totalCP)}
							</p>
						</CardContent>
					</Card>

					<Card className="border-border/50 hover:shadow-md transition-shadow">
						<CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
							<CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1.5 sm:gap-2">
								<IconTrendingUp className="h-3 w-3 sm:h-4 sm:w-4" /> Engaged
							</CardTitle>
						</CardHeader>
						<CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
							<div className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400 tabular-nums">
								{formatCompact(totalEngaged)}
							</div>
							<p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
								{avgExecutionRate.toFixed(1)}% execution
							</p>
						</CardContent>
					</Card>

					<Card className="border-border/50 hover:shadow-md transition-shadow">
						<CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
							<CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1.5 sm:gap-2">
								<IconAlertTriangle className="h-3 w-3 sm:h-4 sm:w-4" />
								<span className="hidden xs:inline">High Risk</span>
								<span className="xs:hidden">Risk</span>
							</CardTitle>
						</CardHeader>
						<CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
							<div className={`text-xl sm:text-2xl font-bold tabular-nums ${highRiskLines > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
								{highRiskLines}
							</div>
							<p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
								Over 90% execution
							</p>
						</CardContent>
					</Card>
				</div>

				{/* Data Table */}
				<Card className="border-border/50 shadow-md">
					<CardHeader className="py-3 sm:py-5 border-b px-3 sm:px-6">
						<div className="flex items-center justify-between">
							<div>
								<CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
									<IconFileSpreadsheet className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
									<span className="hidden sm:inline">Budget Lines Database</span>
									<span className="sm:hidden">Budget Lines</span>
								</CardTitle>
								<CardDescription className="mt-1 text-xs sm:text-sm">
									<span className="hidden sm:inline">Click on any row to edit • Hover over row number to delete • Swipe left on mobile</span>
									<span className="sm:hidden">Tap to edit • Swipe left to delete</span>
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