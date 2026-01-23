import PageContainer from "@/components/layout/page-container";
import { db } from "@/db";
import {
	programs,
	actions,
	activities,
	tasks,
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
		.leftJoin(tasks, eq(tasks.activityId, activities.id))
		.leftJoin(budgetLines, eq(budgetLines.taskId, tasks.id))
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
			<div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
				{/* Header */}
				<div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
					<div className="w-full sm:w-auto">
						<h2 className="text-2xl sm:text-3xl font-bold tracking-tight bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
							Program Management
						</h2>
						<p className="text-muted-foreground text-xs sm:text-sm mt-1">
							Manage programs and analyze budget performance
						</p>
					</div>
					<CreateProgramForm />
				</div>

				{/* Summary Cards */}
				<div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-4">
					<Card className="relative overflow-hidden border-border/50 hover:shadow-md transition-shadow">
						<div className='absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 bg-linear-to-br from-indigo-500/10 to-indigo-600/5 rounded-bl-full' />
						<CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
							<CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1.5 sm:gap-2">
								<IconApps className="h-3 w-3 sm:h-4 sm:w-4" />
								<span className="hidden xs:inline">Total Programs</span>
								<span className="xs:hidden">Programs</span>
							</CardTitle>
						</CardHeader>
						<CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
							<div className="text-xl sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
								{data.length}
							</div>
							<p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
								Active programs
							</p>
						</CardContent>
					</Card>

					<Card className="relative overflow-hidden border-border/50 hover:shadow-md transition-shadow">
						<div className='absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 bg-linear-to-br from-blue-500/10 to-blue-600/5 rounded-bl-full' />
						<CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
							<CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1.5 sm:gap-2">
								<IconCurrencyDollar className="h-3 w-3 sm:h-4 sm:w-4" />
								<span className="hidden xs:inline">Total Auth</span>
								<span className="xs:hidden">Auth</span>
							</CardTitle>
						</CardHeader>
						<CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
							<div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400 tabular-nums">
								{formatCompact(globalAE)}
							</div>
							<p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
								Total AE
							</p>
						</CardContent>
					</Card>

					<Card className="relative overflow-hidden border-border/50 hover:shadow-md transition-shadow">
						<div className='absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 bg-linear-to-br from-green-500/10 to-green-600/5 rounded-bl-full' />
						<CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
							<CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1.5 sm:gap-2">
								<IconChartBar className="h-3 w-3 sm:h-4 sm:w-4" />
								<span className="hidden xs:inline">Total Engaged</span>
								<span className="xs:hidden">Engaged</span>
							</CardTitle>
						</CardHeader>
						<CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
							<div className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400 tabular-nums">
								{formatCompact(globalEngaged)}
							</div>
							<p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
								Committed
							</p>
						</CardContent>
					</Card>

					<Card className="relative overflow-hidden border-border/50 hover:shadow-md transition-shadow">
						<div className={`absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 bg-linear-to-br rounded-bl-full ${globalRate > 90 ? 'from-red-500/10 to-red-600/5' :
							globalRate > 70 ? 'from-amber-500/10 to-amber-600/5' :
								'from-green-500/10 to-green-600/5'
							}`} />
						<CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
							<CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1.5 sm:gap-2">
								<IconPercentage className="h-3 w-3 sm:h-4 sm:w-4" />
								<span className="hidden xs:inline">Global Exec</span>
								<span className="xs:hidden">Exec</span>
							</CardTitle>
						</CardHeader>
						<CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
							<div className={`text-xl sm:text-2xl font-bold tabular-nums ${globalRate > 90 ? 'text-red-600 dark:text-red-400' :
								globalRate > 70 ? 'text-amber-600 dark:text-amber-400' :
									'text-green-600 dark:text-green-400'
								}`}>
								{globalRate.toFixed(1)}%
							</div>
							<p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
								Overall rate
							</p>
						</CardContent>
					</Card>
				</div>

				{/* Programs Table */}
				<Card className="border-border/50 shadow-md">
					<CardHeader className="py-3 sm:py-5 border-b px-3 sm:px-6">
						<div>
							<CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
								<IconApps className="h-4 w-4 sm:h-5 sm:w-5 text-primary" /> All Programs
							</CardTitle>
							<CardDescription className="mt-1 text-xs sm:text-sm">
								<span className="hidden sm:inline">Detailed view of program budgets and execution performance</span>
								<span className="sm:hidden">Program budgets overview</span>
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