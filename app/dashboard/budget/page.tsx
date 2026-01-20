import PageContainer from "@/components/layout/page-container";
import { columns } from "./columns";
import { getBudgetLinesRaw } from "@/actions/dashboard-analytics";
import { getFormOptions } from "@/actions/budget-actions";
import { BudgetUploader } from "@/views/dashboard/budget-upload-button";
import { CreateBudgetForm } from "@/views/dashboard/budget/create-budget-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BudgetTable } from "./budget-table";

export default async function BudgetPage() {
	const { data, total } = await getBudgetLinesRaw(1, 100);
	const formOptions = await getFormOptions();

	return (
		<PageContainer>
			<div className="flex flex-col space-y-4">
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-2xl font-bold tracking-tight">Budget Database</h2>
						<p className="text-muted-foreground">
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

				<Card>
					<CardHeader className="py-4">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Total Records: {total}
						</CardTitle>
					</CardHeader>
					<Separator />
					<CardContent className="p-0">
						<BudgetTable columns={columns} data={data} totalItems={total} />
					</CardContent>
				</Card>
			</div>
		</PageContainer>
	);
}