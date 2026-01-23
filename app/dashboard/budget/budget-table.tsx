"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { EnhancedDataTable } from "@/components/ui/table/enhanced-data-table";
import { columns, type BudgetLineRow } from "./columns";
import { updateBudgetLineAction, deleteBudgetLineAction } from "@/actions/budget-actions";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

const formatCurrency = (value: number) =>
	new Intl.NumberFormat("fr-FR", {
		style: "decimal",
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(value);

interface BudgetTableProps {
	data: BudgetLineRow[];
}

export function BudgetTable({ data }: BudgetTableProps) {
	const router = useRouter();
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [selectedRow, setSelectedRow] = useState<BudgetLineRow | null>(null);
	const [loading, setLoading] = useState(false);

	const [ae, setAe] = useState(0);
	const [cp, setCp] = useState(0);
	const [engaged, setEngaged] = useState(0);

	const handleRowClick = (row: BudgetLineRow) => {
		setSelectedRow(row);
		setAe(row.ae);
		setCp(row.cp);
		setEngaged(row.engaged);
		setEditDialogOpen(true);
	};

	const handleRowDelete = async (row: BudgetLineRow) => {
		setLoading(true);
		const result = await deleteBudgetLineAction(row.id);
		setLoading(false);

		if (result.success) {
			toast.success("Budget line deleted successfully");
			router.refresh();
		} else {
			toast.error(result.message || "Delete failed");
		}
	};

	const handleSave = async () => {
		if (!selectedRow) return;

		setLoading(true);
		const result = await updateBudgetLineAction(selectedRow.id, {
			ae: Number(ae),
			cp: Number(cp),
			engaged: Number(engaged),
		});
		setLoading(false);

		if (result.success) {
			toast.success("Budget line updated successfully");
			setEditDialogOpen(false);
			router.refresh();
		} else {
			toast.error(result.message || "Update failed");
		}
	};

	const executionRate = ae > 0 ? (engaged / ae) * 100 : 0;
	const disponible = ae - engaged;

	return (
		<>
			<EnhancedDataTable
				data={data}
				columns={columns}
				onRowClick={handleRowClick}
				onRowDelete={handleRowDelete}
				searchKey="globalSearch"
				defaultPageSize={20}
				pageSizeOptions={[10, 20, 30, 50, 100]}
			/>

			<Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
				<DialogContent className="w-[95vw] max-w-2xl p-0 overflow-hidden">
					<DialogHeader className="p-6 pb-2">
						<DialogTitle>Edit Budget Line</DialogTitle>
					</DialogHeader>
					<ScrollArea className="max-h-[70vh] px-6">
						{selectedRow && (
							<div className="grid gap-6 py-4">
								<div className="space-y-4 rounded-lg bg-muted/50 p-4 border text-sm">
									<div className="grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-4">
										<Label className="font-semibold text-muted-foreground">Program</Label>
										<div className="sm:col-span-3">
											<span className="font-mono font-semibold mr-2">{selectedRow.program || "-"}</span>
											<span>{selectedRow.programName || "-"}</span>
										</div>
									</div>

									<div className="grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-4">
										<Label className="font-semibold text-muted-foreground">Action</Label>
										<div className="sm:col-span-3">
											<span className="font-mono font-semibold mr-2">{selectedRow.action || "-"}</span>
											<span>{selectedRow.actionName || "-"}</span>
										</div>
									</div>

									<div className="grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-4">
										<Label className="font-semibold text-muted-foreground">Activity</Label>
										<div className="sm:col-span-3">
											<span className="font-mono font-semibold mr-2">{selectedRow.activity || "-"}</span>
											<span>{selectedRow.activityName || "-"}</span>
										</div>
									</div>

									<div className="grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-4">
										<Label className="font-semibold text-muted-foreground">Paragraph</Label>
										<div className="sm:col-span-3">
											<span className="font-mono font-bold text-primary mr-2">{selectedRow.paragraph}</span>
											<span>{selectedRow.paragraphName}</span>
										</div>
									</div>
								</div>

								<div className="space-y-4">
									<div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
										<Label htmlFor="ae" className="sm:text-right">Authorized (AE)</Label>
										<Input
											id="ae"
											type="number"
											value={ae}
											onChange={(e) => setAe(Number(e.target.value))}
											className="sm:col-span-3 font-mono"
										/>
									</div>
									<div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
										<Label htmlFor="cp" className="sm:text-right">Credits (CP)</Label>
										<Input
											id="cp"
											type="number"
											value={cp}
											onChange={(e) => setCp(Number(e.target.value))}
											className="sm:col-span-3 font-mono"
										/>
									</div>
									<div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
										<Label htmlFor="engaged" className="sm:text-right">Engaged</Label>
										<Input
											id="engaged"
											type="number"
											value={engaged}
											onChange={(e) => setEngaged(Number(e.target.value))}
											className="sm:col-span-3 font-mono"
										/>
									</div>
								</div>

								<div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-muted/30 p-4 rounded-lg border">
									<div className="flex items-center gap-2">
										<span className="text-sm text-muted-foreground">Execution Rate:</span>
										<Badge
											variant={executionRate > 95 ? "destructive" : executionRate > 90 ? "default" : "secondary"}
											className="font-mono"
										>
											{executionRate.toFixed(2)}%
										</Badge>
									</div>
									<div className="flex items-center gap-2">
										<span className="text-sm text-muted-foreground">Available:</span>
										<span className="font-mono font-semibold text-sm">
											{formatCurrency(disponible)} FCFA
										</span>
									</div>
								</div>
							</div>
						)}
					</ScrollArea>
					<DialogFooter className="p-6 pt-2 border-t mt-auto">
						<Button variant="outline" onClick={() => setEditDialogOpen(false)}>
							Cancel
						</Button>
						<Button onClick={handleSave} disabled={loading}>
							{loading ? "Saving..." : "Save Changes"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}