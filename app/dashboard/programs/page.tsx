import PageContainer from "@/components/layout/page-container";
import { db } from "@/db";
import {
	programs,
	actions,
	activities,
	tasks, // Import tasks
	budgetLines
} from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { CreateProgramForm } from "@/views/dashboard/programs/create-program-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { IconApps, IconChartBar, IconCurrencyDollar, IconPercentage } from "@tabler/icons-react";
import { ProgramsTable } from "./program-table";

export default async function ProgramsPage() {
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
		.leftJoin(tasks, eq(tasks.activityId, activities.id)) // 1. Join Tasks
		.leftJoin(budgetLines, eq(budgetLines.taskId, tasks.id)) // 2. Join BudgetLines via taskId
		.groupBy(programs.id, programs.code, programs.name)
		.orderBy(programs.code);

	const data = rows.map((r) => {
		const ae = parseFloat(r.totalAE || "0");
		const cp = parseFloat(r.totalCP || "0");
		const engaged = parseFloat(r.totalEngaged || "0");
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

	const globalAE = data.reduce((acc, curr) => acc + curr.ae, 0);
	const globalEngaged = data.reduce((acc, curr) => acc + curr.engaged, 0);
	const globalRate = globalAE > 0 ? (globalEngaged / globalAE) * 100 : 0;

	const formatCompact = (n: number) =>
		new Intl.NumberFormat('fr-FR', {
			notation: 'compact',
			compactDisplay: 'short',
			maximumSignificantDigits: 3
		}).format(n);

	return (
		<PageContainer>
			<div className="space-y-6">
				{/* Header */}
				<div className="flex justify-between items-start">
					<div>
						<h2 className="text-3xl font-bold tracking-tight bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
							Program Management
						</h2>
						<p className="text-muted-foreground text-sm mt-1">
							Manage programs and analyze budget performance
						</p>
					</div>
					<CreateProgramForm />
				</div>

				{/* Summary Cards */}
				<div className="grid gap-4 md:grid-cols-4">
					<Card className="relative overflow-hidden border-border/50 hover:shadow-md transition-shadow">
						<div className='absolute top-0 right-0 w-24 h-24 bg-linear-to-br from-indigo-500/10 to-indigo-600/5 rounded-bl-full' />
						<CardHeader className="pb-3">
							<CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
								<IconApps className="h-4 w-4" /> Total Programs
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
								{data.length}
							</div>
							<p className="text-xs text-muted-foreground mt-1">
								Active programs
							</p>
						</CardContent>
					</Card>

					<Card className="relative overflow-hidden border-border/50 hover:shadow-md transition-shadow">
						<div className='absolute top-0 right-0 w-24 h-24 bg-linear-to-br from-blue-500/10 to-blue-600/5 rounded-bl-full' />
						<CardHeader className="pb-3">
							<CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
								<IconCurrencyDollar className="h-4 w-4" /> Total Authorized
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-blue-600 dark:text-blue-400 tabular-nums">
								{formatCompact(globalAE)} XAF
							</div>
							<p className="text-xs text-muted-foreground mt-1">
								Total AE across programs
							</p>
						</CardContent>
					</Card>

					<Card className="relative overflow-hidden border-border/50 hover:shadow-md transition-shadow">
						<div className='absolute top-0 right-0 w-24 h-24 bg-linear-to-br from-green-500/10 to-green-600/5 rounded-bl-full' />
						<CardHeader className="pb-3">
							<CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
								<IconChartBar className="h-4 w-4" /> Total Engaged
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-green-600 dark:text-green-400 tabular-nums">
								{formatCompact(globalEngaged)} XAF
							</div>
							<p className="text-xs text-muted-foreground mt-1">
								Total committed amount
							</p>
						</CardContent>
					</Card>

					<Card className="relative overflow-hidden border-border/50 hover:shadow-md transition-shadow">
						<div className={`absolute top-0 right-0 w-24 h-24 bg-linear-to-br rounded-bl-full ${globalRate > 90 ? 'from-red-500/10 to-red-600/5' :
							globalRate > 70 ? 'from-amber-500/10 to-amber-600/5' :
								'from-green-500/10 to-green-600/5'
							}`} />
						<CardHeader className="pb-3">
							<CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
								<IconPercentage className="h-4 w-4" /> Global Execution
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className={`text-2xl font-bold tabular-nums ${globalRate > 90 ? 'text-red-600 dark:text-red-400' :
								globalRate > 70 ? 'text-amber-600 dark:text-amber-400' :
									'text-green-600 dark:text-green-400'
								}`}>
								{globalRate.toFixed(1)}%
							</div>
							<p className="text-xs text-muted-foreground mt-1">
								Overall execution rate
							</p>
						</CardContent>
					</Card>
				</div>

				{/* Programs Table */}
				<Card className="border-border/50 shadow-md">
					<CardHeader className="py-5 border-b">
						<div>
							<CardTitle className="text-lg font-semibold flex items-center gap-2">
								<IconApps className="h-5 w-5 text-primary" /> All Programs
							</CardTitle>
							<CardDescription className="mt-1">
								Detailed view of program budgets and execution performance
							</CardDescription>
						</div>
					</CardHeader>
					<CardContent className="p-0">
						<ProgramsTable data={data} />
					</CardContent>
				</Card>
			</div>
		</PageContainer>
	);
}