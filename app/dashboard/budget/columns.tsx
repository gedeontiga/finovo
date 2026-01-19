"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogFooter,
} from "@/components/ui/dialog";
// FIX 1: Ensure Label comes from your UI folder, NOT 'recharts'
import { Label } from "@/components/ui/label";
import { IconEdit } from "@tabler/icons-react";
import { useState } from "react";
import { updateBudgetLineAction } from "@/actions/budget-actions";
import { toast } from "sonner";
// FIX 2: Use next/navigation for App Router
import { useRouter } from "next/navigation";

export type BudgetLineRow = {
	id: number;
	program: string | null;
	action: string | null;
	activity: string | null;
	paragraph: string;
	paragraphName: string;
	ae: number;
	cp: number;
	engaged: number;
};

// Helper for formatting currency
const formatCurrency = (value: number) =>
	new Intl.NumberFormat("fr-FR", {
		style: "decimal",
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(value);

const EditCell = ({ row }: { row: BudgetLineRow }) => {
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const router = useRouter(); // Now this will have .refresh()

	const [ae, setAe] = useState(row.ae);
	const [cp, setCp] = useState(row.cp);
	const [engaged, setEngaged] = useState(row.engaged);

	const handleSave = async () => {
		setLoading(true);
		// Ensure we send plain numbers
		const result = await updateBudgetLineAction(row.id, { ae: Number(ae), cp: Number(cp), engaged: Number(engaged) });
		setLoading(false);

		if (result.success) {
			toast.success("Updated successfully");
			setOpen(false);
			router.refresh();
		} else {
			toast.error("Update failed");
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="ghost" size="icon" className="h-8 w-8">
					<IconEdit className="h-4 w-4" />
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit Budget Line</DialogTitle>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<div className="grid grid-cols-4 items-center gap-4">
						<Label className="text-right">Code</Label>
						<span className="col-span-3 font-mono text-sm">{row.paragraph}</span>
					</div>
					<div className="grid grid-cols-4 items-center gap-4">
						<Label className="text-right">Name</Label>
						<span className="col-span-3 text-xs text-muted-foreground">{row.paragraphName}</span>
					</div>
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="ae" className="text-right">AE</Label>
						<Input
							id="ae"
							type="number"
							value={ae}
							onChange={(e) => setAe(Number(e.target.value))}
							className="col-span-3"
						/>
					</div>
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="cp" className="text-right">CP</Label>
						<Input
							id="cp"
							type="number"
							value={cp}
							onChange={(e) => setCp(Number(e.target.value))}
							className="col-span-3"
						/>
					</div>
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="engaged" className="text-right">Engaged</Label>
						<Input
							id="engaged"
							type="number"
							value={engaged}
							onChange={(e) => setEngaged(Number(e.target.value))}
							className="col-span-3"
						/>
					</div>
				</div>
				<DialogFooter>
					<Button onClick={handleSave} disabled={loading}>
						{loading ? "Saving..." : "Save Changes"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export const columns: ColumnDef<BudgetLineRow>[] = [
	{
		accessorKey: "program",
		header: "Prog",
		cell: ({ row }) => <span className="font-mono text-xs">{row.getValue("program") || "-"}</span>,
	},
	{
		accessorKey: "activity",
		header: "Activ",
		cell: ({ row }) => <span className="font-mono text-xs">{row.getValue("activity") || "-"}</span>,
	},
	{
		accessorKey: "paragraph",
		header: "Para",
		cell: ({ row }) => <span className="font-mono text-xs font-semibold">{row.getValue("paragraph")}</span>,
	},
	{
		accessorKey: "paragraphName",
		header: "Description",
		cell: ({ row }) => (
			<div className="max-w-62.5 truncate text-xs font-medium" title={row.getValue("paragraphName")}>
				{row.getValue("paragraphName")}
			</div>
		),
	},
	{
		accessorKey: "ae",
		header: () => <div className="text-right text-xs">Auth (AE)</div>,
		cell: ({ row }) => (
			<div className="text-right font-mono text-xs text-blue-600">
				{formatCurrency(row.getValue("ae"))}
			</div>
		),
	},
	{
		accessorKey: "engaged",
		header: () => <div className="text-right text-xs">Engaged</div>,
		cell: ({ row }) => {
			const val = row.getValue("engaged") as number;
			const ae = row.original.ae;
			const ratio = ae > 0 ? (val / ae) * 100 : 0;
			return (
				<div className="flex flex-col items-end">
					<span className="font-mono text-xs">{formatCurrency(val)}</span>
					<span className={`text-[10px] ${ratio > 95 ? "text-red-500" : "text-green-600"}`}>
						{ratio.toFixed(1)}%
					</span>
				</div>
			);
		},
	},
	{
		id: "actions",
		cell: ({ row }) => <EditCell row={row.original} />
	}
];