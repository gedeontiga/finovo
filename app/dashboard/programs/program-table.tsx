"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { EnhancedDataTable } from "@/components/ui/table/enhanced-data-table";
import { columns, type ProgramRow } from "./columns";
import { updateProgramAction, deleteProgramAction } from "@/actions/budget-actions";
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
import { ScrollArea } from "@/components/ui/scroll-area";

interface ProgramTableProps {
	data: ProgramRow[];
}

export function ProgramsTable({ data }: ProgramTableProps) {
	const router = useRouter();
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [selectedRow, setSelectedRow] = useState<ProgramRow | null>(null);
	const [loading, setLoading] = useState(false);

	const [code, setCode] = useState("");
	const [name, setName] = useState("");

	const handleRowClick = (row: ProgramRow) => {
		setSelectedRow(row);
		setCode(row.code);
		setName(row.name);
		setEditDialogOpen(true);
	};

	const handleRowDelete = async (row: ProgramRow) => {
		setLoading(true);
		const result = await deleteProgramAction(row.id);
		setLoading(false);

		if (result.success) {
			toast.success("Program deleted successfully");
			router.refresh();
		} else {
			toast.error(result.message || "Delete failed");
		}
	};

	const handleSave = async () => {
		if (!selectedRow) return;

		setLoading(true);
		const result = await updateProgramAction(selectedRow.id, { code, name });
		setLoading(false);

		if (result.success) {
			toast.success("Program updated successfully");
			setEditDialogOpen(false);
			router.refresh();
		} else {
			toast.error(result.message || "Update failed");
		}
	};

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
				<DialogContent className="w-[95vw] max-w-lg p-0 overflow-hidden">
					<DialogHeader className="p-6 pb-2">
						<DialogTitle>Edit Program</DialogTitle>
					</DialogHeader>
					<ScrollArea className="max-h-[60vh] px-6">
						<div className="grid gap-4 py-4">
							<div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
								<Label htmlFor="code" className="sm:text-right font-semibold">
									Code
								</Label>
								<Input
									id="code"
									value={code}
									onChange={(e) => setCode(e.target.value)}
									className="sm:col-span-3 font-mono"
									placeholder="e.g., P001"
								/>
							</div>
							<div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
								<Label htmlFor="name" className="sm:text-right font-semibold">
									Name
								</Label>
								<Input
									id="name"
									value={name}
									onChange={(e) => setName(e.target.value)}
									className="sm:col-span-3"
									placeholder="Program name"
								/>
							</div>
						</div>
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