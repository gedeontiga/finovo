import PageContainer from "@/components/layout/page-container";
import { columns } from "./columns";
import { db } from "@/db";
import { budgetLines, programs, actions, activities, adminUnits } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getFormOptions } from "@/actions/budget-actions";
import { BudgetUploader } from "@/views/dashboard/budget-upload-button";
import { CreateBudgetForm } from "@/views/dashboard/budget/create-budget-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BudgetTable } from "./budget-table";

export default async function BudgetPage() {
	// Fetch ALL data at once for client-side pagination
	const allData = await db
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
		.innerJoin(activities, eq(budgetLines.activityId, activities.id))
		.innerJoin(actions, eq(activities.actionId, actions.id))
		.innerJoin(programs, eq(actions.programId, programs.id))
		.leftJoin(adminUnits, eq(budgetLines.adminUnitId, adminUnits.id))
		.orderBy(programs.code, actions.code, activities.code);

	// Transform data
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

	const formOptions = await getFormOptions();

	return (
		<PageContainer>
			<div className="flex flex-col space-y-4">
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-2xl font-bold tracking-tight">Budget Management</h2>
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
							Total Records: {data.length.toLocaleString('fr-FR')}
						</CardTitle>
					</CardHeader>
					<Separator />
					<CardContent className="p-0">
						<BudgetTable columns={columns} data={data} totalItems={data.length} />
					</CardContent>
				</Card>
			</div>
		</PageContainer>
	);
}