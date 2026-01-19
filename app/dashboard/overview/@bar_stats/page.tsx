import { getBudgetByProgram } from "@/actions/dashboard-analytics";
import { BarGraph } from "@/views/dashboard/overview/components/bar-graph";

export default async function BarStatsPage() {
  const data = await getBudgetByProgram();
  return <BarGraph />;
}