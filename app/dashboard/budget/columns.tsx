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
import { Label } from "@/components/ui/label";
import { IconEdit } from "@tabler/icons-react";
import { useState } from "react";
import { updateBudgetLineAction } from "@/actions/budget-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

export type BudgetLineRow = {
	id: number;
	program: string | null;
	programName: string | null;
	action: string | null;
	actionName: string | null;
	activity: string | null;
	activityName: string | null;
	adminCode: string | null;
	adminName: string | null;
	paragraph: string;
	paragraphName: string;
	ae: number;
	cp: number;
	engaged: number;
};

const formatCurrency = (value: number) =>
	new Intl.NumberFormat("fr-FR", {
		style: "decimal",
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(value);

const EditCell = ({ row }: { row: BudgetLineRow }) => {
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	const [ae, setAe] = useState(row.ae);
	const [cp, setCp] = useState(row.cp);
	const [engaged, setEngaged] = useState(row.engaged);

	// Auto-calculate execution rate
	const executionRate = ae > 0 ? (engaged / ae) * 100 : 0;
	const disponible = ae - engaged;

	const handleSave = async () => {
		setLoading(true);
		const result = await updateBudgetLineAction(row.id, {
			ae: Number(ae),
			cp: Number(cp),
			engaged: Number(engaged)
		});
		setLoading(false);

		if (result.success) {
			toast.success("Budget line updated successfully");
			setOpen(false);
			router.refresh();
		} else {
			toast.error(result.message || "Update failed");
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="ghost" size="icon" className="h-8 w-8">
					<IconEdit className="h-4 w-4" />
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-125">
				<DialogHeader>
					<DialogTitle>Edit Budget Line</DialogTitle>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<div className="grid grid-cols-4 items-center gap-4">
						<Label className="text-right font-semibold">Program</Label>
						<span className="col-span-3 text-sm">{row.program} - {row.programName}</span>
					</div>
					<div className="grid grid-cols-4 items-center gap-4">
						<Label className="text-right font-semibold">Activity</Label>
						<span className="col-span-3 text-sm">{row.activity} - {row.activityName}</span>
					</div>
					<div className="grid grid-cols-4 items-center gap-4">
						<Label className="text-right font-semibold">Paragraph</Label>
						<span className="col-span-3 text-xs font-mono">{row.paragraph} - {row.paragraphName}</span>
					</div>

					<div className="border-t pt-4 space-y-4">
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="ae" className="text-right">AE (Authorized)</Label>
							<Input
								id="ae"
								type="number"
								value={ae}
								onChange={(e) => setAe(Number(e.target.value))}
								className="col-span-3 font-mono"
							/>
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="cp" className="text-right">CP (Credits)</Label>
							<Input
								id="cp"
								type="number"
								value={cp}
								onChange={(e) => setCp(Number(e.target.value))}
								className="col-span-3 font-mono"
							/>
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="engaged" className="text-right">Engaged</Label>
							<Input
								id="engaged"
								type="number"
								value={engaged}
								onChange={(e) => setEngaged(Number(e.target.value))}
								className="col-span-3 font-mono"
							/>
						</div>
					</div>

					<div className="border-t pt-4 space-y-2 bg-muted/50 p-4 rounded-lg">
						<div className="flex justify-between text-sm">
							<span className="text-muted-foreground">Execution Rate:</span>
							<span className={`font-semibold ${executionRate > 95 ? 'text-red-600' : 'text-green-600'}`}>
								{executionRate.toFixed(2)}%
							</span>
						</div>
						<div className="flex justify-between text-sm">
							<span className="text-muted-foreground">Available (Disponible):</span>
							<span className="font-mono font-semibold">
								{formatCurrency(disponible)} XAF
							</span>
						</div>
					</div>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={() => setOpen(false)}>
						Cancel
					</Button>
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
		header: "Program",
		cell: ({ row }) => (
			<div className="space-y-1">
				<span className="font-mono text-xs font-semibold">{row.getValue("program") || "-"}</span>
				<p className="text-xs text-muted-foreground truncate max-w-25" title={row.original.programName || ""}>
					{row.original.programName}
				</p>
			</div>
		),
	},
	{
		accessorKey: "activity",
		header: "Activity",
		cell: ({ row }) => (
			<div className="space-y-1">
				<span className="font-mono text-xs font-semibold">{row.getValue("activity") || "-"}</span>
				<p className="text-xs text-muted-foreground truncate max-w-37.5" title={row.original.activityName || ""}>
					{row.original.activityName}
				</p>
			</div>
		),
	},
	{
		accessorKey: "adminCode",
		header: "Admin Unit",
		cell: ({ row }) => {
			const code = row.getValue("adminCode") as string | null;
			const name = row.original.adminName;
			if (!code) return <span className="text-xs text-muted-foreground">-</span>;
			return (
				<div className="space-y-1">
					<span className="font-mono text-xs font-semibold">{code}</span>
					<p className="text-xs text-muted-foreground truncate max-w-25" title={name || ""}>
						{name}
					</p>
				</div>
			);
		},
	},
	{
		accessorKey: "paragraph",
		header: "Paragraph",
		cell: ({ row }) => (
			<div className="space-y-1">
				<span className="font-mono text-xs font-bold text-primary">{row.getValue("paragraph")}</span>
				<p className="text-xs text-muted-foreground truncate max-w-50" title={row.original.paragraphName}>
					{row.original.paragraphName}
				</p>
			</div>
		),
	},
	{
		accessorKey: "ae",
		header: () => <div className="text-right text-xs">AE (Authorized)</div>,
		cell: ({ row }) => (
			<div className="text-right font-mono text-xs text-blue-600 font-semibold">
				{formatCurrency(row.getValue("ae"))}
			</div>
		),
	},
	{
		accessorKey: "cp",
		header: () => <div className="text-right text-xs">CP (Credits)</div>,
		cell: ({ row }) => (
			<div className="text-right font-mono text-xs text-purple-600">
				{formatCurrency(row.getValue("cp"))}
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
			const disponible = ae - val;

			return (
				<div className="flex flex-col items-end space-y-1">
					<span className="font-mono text-xs font-semibold">{formatCurrency(val)}</span>
					<Badge variant={ratio > 95 ? "destructive" : "secondary"} className="text-[10px] px-1.5 py-0">
						{ratio.toFixed(1)}%
					</Badge>
					<span className="text-[10px] text-muted-foreground">
						Disp: {formatCurrency(disponible)}
					</span>
				</div>
			);
		},
	},
	{
		id: "actions",
		header: "Actions",
		cell: ({ row }) => <EditCell row={row.original} />
	}
];