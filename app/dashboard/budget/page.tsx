import PageContainer from "@/components/layout/page-container";
import { columns } from "./columns";
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
import { IconDatabase, IconFileSpreadsheet } from "@tabler/icons-react";

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
			taskName: tasks.name, // Added task name for context
			adminCode: adminUnits.code,
			adminName: adminUnits.name,
			paragraph: budgetLines.paragraphCode,
			paragraphName: budgetLines.paragraphName,
			ae: budgetLines.ae,
			cp: budgetLines.cp,
			engaged: budgetLines.engaged,
		})
		.from(budgetLines)
		.innerJoin(tasks, eq(budgetLines.taskId, tasks.id)) // 1. Join Task using taskId
		.innerJoin(activities, eq(tasks.activityId, activities.id)) // 2. Join Activity using task.activityId
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
	const totalEngaged = data.reduce((sum, item) => sum + item.engaged, 0);
	const avgExecutionRate = totalAE > 0 ? (totalEngaged / totalAE) * 100 : 0;

	const formOptions = await getFormOptions();

	const formatCompact = (n: number) =>
		new Intl.NumberFormat('fr-FR', {
			notation: 'compact',
			compactDisplay: 'short',
			maximumFractionDigits: 1
		}).format(n);

	return (
		<PageContainer>
			<div className="flex flex-col space-y-6">
				{/* Header */}
				<div className="flex items-start justify-between">
					<div>
						<h2 className="text-3xl font-bold tracking-tight bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
							Budget Management
						</h2>
						<p className="text-muted-foreground text-sm mt-1">
							Manage your budget lines and allocations
						</p>
					</div>
					<div className="flex items-center gap-2">
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
				<div className="grid gap-4 md:grid-cols-4">
					<Card className="border-border/50 hover:shadow-md transition-shadow">
						<CardHeader className="pb-3">
							<CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
								<IconDatabase className="h-4 w-4" /> Total Records
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold tabular-nums">
								{data.length.toLocaleString('fr-FR')}
							</div>
							<p className="text-xs text-muted-foreground mt-1">
								Active budget lines
							</p>
						</CardContent>
					</Card>

					<Card className="border-border/50 hover:shadow-md transition-shadow">
						<CardHeader className="pb-3">
							<CardTitle className="text-sm font-medium text-muted-foreground">
								Total AE
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-blue-600 dark:text-blue-400 tabular-nums">
								{formatCompact(totalAE)} XAF
							</div>
							<p className="text-xs text-muted-foreground mt-1">
								Authorized envelope
							</p>
						</CardContent>
					</Card>

					<Card className="border-border/50 hover:shadow-md transition-shadow">
						<CardHeader className="pb-3">
							<CardTitle className="text-sm font-medium text-muted-foreground">
								Total Engaged
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-green-600 dark:text-green-400 tabular-nums">
								{formatCompact(totalEngaged)} XAF
							</div>
							<p className="text-xs text-muted-foreground mt-1">
								Currently committed
							</p>
						</CardContent>
					</Card>

					<Card className="border-border/50 hover:shadow-md transition-shadow">
						<CardHeader className="pb-3">
							<CardTitle className="text-sm font-medium text-muted-foreground">
								Avg Execution
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className={`text-2xl font-bold tabular-nums ${avgExecutionRate > 90 ? 'text-red-600 dark:text-red-400' :
								avgExecutionRate > 70 ? 'text-amber-600 dark:text-amber-400' :
									'text-green-600 dark:text-green-400'
								}`}>
								{avgExecutionRate.toFixed(1)}%
							</div>
							<p className="text-xs text-muted-foreground mt-1">
								Average rate
							</p>
						</CardContent>
					</Card>
				</div>

				{/* Data Table */}
				<Card className="border-border/50 shadow-md">
					<CardHeader className="py-5 border-b">
						<div className="flex items-center justify-between">
							<div>
								<CardTitle className="text-lg font-semibold flex items-center gap-2">
									<IconFileSpreadsheet className="h-5 w-5 text-primary" /> Budget Lines Database
								</CardTitle>
								<CardDescription className="mt-1">
									Complete list of all budget allocations and their execution status
								</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent className="p-0">
						<BudgetTable columns={columns} data={data} totalItems={data.length} />
					</CardContent>
				</Card>
			</div>
		</PageContainer>
	);
}