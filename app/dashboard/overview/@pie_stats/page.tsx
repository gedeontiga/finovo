import { getAdminUnitStats } from "@/actions/dashboard-analytics";
import { BudgetPieGraph } from "@/views/dashboard/overview/pie-graph";

export default async function PieStats() {
  const data = await getAdminUnitStats();
  return <BudgetPieGraph data={data} />;
}