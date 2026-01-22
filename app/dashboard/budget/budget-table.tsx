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

const formatCurrency = (value: number) =>
	new Intl.NumberFormat("fr-FR", {
		style: "decimal",
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(value);

interface EnhancedBudgetTableProps {
	data: BudgetLineRow[];
}

export function BudgetTable({ data }: EnhancedBudgetTableProps) {
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
				searchKey="paragraph"
				defaultPageSize={20}
				pageSizeOptions={[10, 20, 30, 50, 100]}
			/>

			<Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
				<DialogContent className="sm:max-w-150">
					<DialogHeader>
						<DialogTitle>Edit Budget Line</DialogTitle>
					</DialogHeader>
					{selectedRow && (
						<div className="grid gap-4 py-4">
							{/* Read-only information */}
							<div className="grid grid-cols-4 items-center gap-4">
								<Label className="text-right font-semibold">Program</Label>
								<div className="col-span-3">
									<span className="font-mono text-xs font-semibold">
										{selectedRow.program}
									</span>
									<p className="text-sm text-muted-foreground">
										{selectedRow.programName}
									</p>
								</div>
							</div>

							<div className="grid grid-cols-4 items-center gap-4">
								<Label className="text-right font-semibold">Action</Label>
								<div className="col-span-3">
									<span className="font-mono text-xs font-semibold">
										{selectedRow.action}
									</span>
									<p className="text-sm text-muted-foreground">
										{selectedRow.actionName}
									</p>
								</div>
							</div>

							<div className="grid grid-cols-4 items-center gap-4">
								<Label className="text-right font-semibold">Activity</Label>
								<div className="col-span-3">
									<span className="font-mono text-xs font-semibold">
										{selectedRow.activity}
									</span>
									<p className="text-sm text-muted-foreground">
										{selectedRow.activityName}
									</p>
								</div>
							</div>

							{selectedRow.taskName && (
								<div className="grid grid-cols-4 items-center gap-4">
									<Label className="text-right font-semibold">Task</Label>
									<div className="col-span-3">
										<p className="text-sm">{selectedRow.taskName}</p>
									</div>
								</div>
							)}

							<div className="grid grid-cols-4 items-center gap-4">
								<Label className="text-right font-semibold">Paragraph</Label>
								<div className="col-span-3">
									<span className="font-mono text-xs font-bold text-primary">
										{selectedRow.paragraph}
									</span>
									<p className="text-xs text-muted-foreground">
										{selectedRow.paragraphName}
									</p>
								</div>
							</div>

							{selectedRow.adminCode && (
								<div className="grid grid-cols-4 items-center gap-4">
									<Label className="text-right font-semibold">Admin Unit</Label>
									<div className="col-span-3">
										<span className="font-mono text-xs font-semibold">
											{selectedRow.adminCode}
										</span>
										<p className="text-sm text-muted-foreground">
											{selectedRow.adminName}
										</p>
									</div>
								</div>
							)}

							<div className="border-t pt-4 space-y-4">
								<div className="grid grid-cols-4 items-center gap-4">
									<Label htmlFor="ae" className="text-right">
										AE (Authorized)
									</Label>
									<Input
										id="ae"
										type="number"
										value={ae}
										onChange={(e) => setAe(Number(e.target.value))}
										className="col-span-3 font-mono"
									/>
								</div>
								<div className="grid grid-cols-4 items-center gap-4">
									<Label htmlFor="cp" className="text-right">
										CP (Credits)
									</Label>
									<Input
										id="cp"
										type="number"
										value={cp}
										onChange={(e) => setCp(Number(e.target.value))}
										className="col-span-3 font-mono"
									/>
								</div>
								<div className="grid grid-cols-4 items-center gap-4">
									<Label htmlFor="engaged" className="text-right">
										Engaged
									</Label>
									<Input
										id="engaged"
										type="number"
										value={engaged}
										onChange={(e) => setEngaged(Number(e.target.value))}
										className="col-span-3 font-mono"
									/>
								</div>
							</div>

							{/* Calculated values */}
							<div className="border-t pt-4 space-y-3 bg-muted/30 p-4 rounded-lg">
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Execution Rate:</span>
									<div className="flex items-center gap-2">
										<Badge
											variant={executionRate > 95 ? "destructive" : executionRate > 90 ? "default" : "secondary"}
											className="font-mono"
										>
											{executionRate.toFixed(2)}%
										</Badge>
									</div>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Available (Disponible):</span>
									<span className="font-mono font-semibold text-sm">
										{formatCurrency(disponible)} XAF
									</span>
								</div>
							</div>
						</div>
					)}
					<DialogFooter>
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