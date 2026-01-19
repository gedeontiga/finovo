import PageContainer from "@/components/layout/page-container";
import { getProgramsSummary } from "@/actions/dashboard-analytics";
import { BudgetTable } from "../budget/budget-table";
import { columns } from "./columns";

export default async function ProgramsPage() {
	const data = await getProgramsSummary();

	// Calculate Global Total for the Header
	const globalAE = data.reduce((acc, curr) => acc + curr.ae, 0);

	return (
		<PageContainer>
			<div className="space-y-4">
				<div className="flex justify-between items-center">
					<div>
						<h2 className="text-2xl font-bold tracking-tight">Program Analysis</h2>
						<p className="text-muted-foreground">Budget performance by Program.</p>
					</div>
					<div className="text-right">
						<p className="text-sm text-muted-foreground">Total Authorized</p>
						<p className="text-2xl font-bold font-mono text-primary">
							{new Intl.NumberFormat('fr-FR').format(globalAE)} XAF
						</p>
					</div>
				</div>

				<BudgetTable
					columns={columns}
					data={data}
					totalItems={data.length}
				/>
			</div>
		</PageContainer>
	);
}