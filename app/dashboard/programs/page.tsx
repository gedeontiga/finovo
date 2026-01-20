import PageContainer from "@/components/layout/page-container";
import { getProgramsSummary } from "@/actions/dashboard-analytics";
import { BudgetTable } from "../budget/budget-table";
import { columns } from "./columns";
import { CreateProgramForm } from "@/views/dashboard/programs/create-program-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default async function ProgramsPage() {
	const data = await getProgramsSummary();

	// Calculate Global Total for the Header
	const globalAE = data.reduce((acc, curr) => acc + curr.ae, 0);
	const globalEngaged = data.reduce((acc, curr) => acc + curr.engaged, 0);
	const globalRate = globalAE > 0 ? (globalEngaged / globalAE) * 100 : 0;

	return (
		<PageContainer>
			<div className="space-y-4">
				<div className="flex justify-between items-center">
					<div>
						<h2 className="text-2xl font-bold tracking-tight">Program Management</h2>
						<p className="text-muted-foreground">Manage programs and analyze budget performance.</p>
					</div>
					<CreateProgramForm />
				</div>

				<div className="grid gap-4 md:grid-cols-3">
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium text-muted-foreground">
								Total Programs
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{data.length}</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium text-muted-foreground">
								Total Authorized
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold font-mono text-primary">
								{new Intl.NumberFormat('fr-FR', {
									notation: 'compact',
									compactDisplay: 'short',
									maximumSignificantDigits: 3
								}).format(globalAE)} XAF
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium text-muted-foreground">
								Global Execution
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{globalRate.toFixed(1)}%</div>
						</CardContent>
					</Card>
				</div>

				<Card>
					<CardHeader className="py-4">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							All Programs
						</CardTitle>
					</CardHeader>
					<Separator />
					<CardContent className="p-0">
						<BudgetTable
							columns={columns}
							data={data}
							totalItems={data.length}
						/>
					</CardContent>
				</Card>
			</div>
		</PageContainer>
	);
}