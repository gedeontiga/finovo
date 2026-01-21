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
import { IconEdit, IconArrowUp, IconArrowDown, IconSelector } from "@tabler/icons-react";
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

	const executionRate = ae > 0 ? (engaged / ae) * 100 : 0;
	const disponible = ae - engaged;

	const handleSave = async () => {
		setLoading(true);
		const result = await updateBudgetLineAction(row.id, {
			ae: Number(ae),
			cp: Number(cp),
			engaged: Number(engaged),
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
						<span className="col-span-3 text-sm">
							{row.program} - {row.programName}
						</span>
					</div>
					<div className="grid grid-cols-4 items-center gap-4">
						<Label className="text-right font-semibold">Activity</Label>
						<span className="col-span-3 text-sm">
							{row.activity} - {row.activityName}
						</span>
					</div>
					<div className="grid grid-cols-4 items-center gap-4">
						<Label className="text-right font-semibold">Paragraph</Label>
						<span className="col-span-3 text-xs font-mono">
							{row.paragraph} - {row.paragraphName}
						</span>
					</div>

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

					<div className="border-t pt-4 space-y-2 bg-muted/50 p-4 rounded-lg">
						<div className="flex justify-between text-sm">
							<span className="text-muted-foreground">Execution Rate:</span>
							<span
								className={`font-semibold ${executionRate > 95 ? "text-red-600" : "text-green-600"
									}`}
							>
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

// Sortable Header Component
const SortableHeader = ({ column, children }: { column: any; children: React.ReactNode }) => {
	if (!column.getCanSort()) {
		return <div className="font-medium">{children}</div>;
	}

	return (
		<Button
			variant="ghost"
			size="sm"
			className="-ml-3 h-8 data-[state=open]:bg-accent hover:bg-accent/50"
			onClick={column.getToggleSortingHandler()}
		>
			<span className="font-medium">{children}</span>
			{column.getIsSorted() === 'asc' ? (
				<IconArrowUp className="ml-2 h-4 w-4" />
			) : column.getIsSorted() === 'desc' ? (
				<IconArrowDown className="ml-2 h-4 w-4" />
			) : (
				<IconSelector className="ml-2 h-4 w-4 opacity-50" />
			)}
		</Button>
	);
};

export const columns: ColumnDef<BudgetLineRow>[] = [
	{
		accessorKey: "program",
		header: ({ column }) => <SortableHeader column={column}>Program</SortableHeader>,
		cell: ({ row }) => {
			const program = row.original.program;
			const programName = row.original.programName;
			return (
				<div className="space-y-1 min-w-32">
					<span className="font-mono text-xs font-semibold block">
						{program || "-"}
					</span>
					<p
						className="text-xs text-muted-foreground truncate max-w-32"
						title={programName || ""}
					>
						{programName}
					</p>
				</div>
			);
		},
		enableSorting: true,
		enableColumnFilter: true,
		filterFn: 'includesString',
		meta: {
			label: "Program",
		},
	},
	{
		accessorKey: "activity",
		header: ({ column }) => <SortableHeader column={column}>Activity</SortableHeader>,
		cell: ({ row }) => {
			const activity = row.original.activity;
			const activityName = row.original.activityName;
			return (
				<div className="space-y-1 min-w-37.5">
					<span className="font-mono text-xs font-semibold block">
						{activity || "-"}
					</span>
					<p
						className="text-xs text-muted-foreground truncate max-w-37.5"
						title={activityName || ""}
					>
						{activityName}
					</p>
				</div>
			);
		},
		enableSorting: true,
		enableColumnFilter: true,
		filterFn: 'includesString',
		meta: {
			label: "Activity",
		},
	},
	{
		accessorKey: "adminCode",
		header: ({ column }) => <SortableHeader column={column}>Admin Unit</SortableHeader>,
		cell: ({ row }) => {
			const code = row.original.adminCode;
			const name = row.original.adminName;
			if (!code) {
				return (
					<span className="text-xs text-muted-foreground min-w-25 block">-</span>
				);
			}
			return (
				<div className="space-y-1 min-w-25">
					<span className="font-mono text-xs font-semibold block">{code}</span>
					<p
						className="text-xs text-muted-foreground truncate max-w-25"
						title={name || ""}
					>
						{name}
					</p>
				</div>
			);
		},
		enableSorting: true,
		enableColumnFilter: true,
		filterFn: 'includesString',
		meta: {
			label: "Admin Unit",
		},
	},
	{
		accessorKey: "paragraph",
		header: ({ column }) => <SortableHeader column={column}>Paragraph</SortableHeader>,
		cell: ({ row }) => {
			const paragraph = row.original.paragraph;
			const paragraphName = row.original.paragraphName;
			return (
				<div className="space-y-1 min-w-50">
					<span className="font-mono text-xs font-bold text-primary block">
						{paragraph}
					</span>
					<p
						className="text-xs text-muted-foreground truncate max-w-50"
						title={paragraphName}
					>
						{paragraphName}
					</p>
				</div>
			);
		},
		enableSorting: true,
		enableColumnFilter: true,
		filterFn: 'includesString',
		meta: {
			label: "Paragraph",
		},
	},
	{
		accessorKey: "ae",
		header: ({ column }) => (
			<div className="text-right">
				<SortableHeader column={column}>AE</SortableHeader>
			</div>
		),
		cell: ({ row }) => {
			const value = row.original.ae;
			return (
				<div className="text-right font-mono text-xs text-blue-600 dark:text-blue-400 font-semibold min-w-25">
					{formatCurrency(value)}
				</div>
			);
		},
		enableSorting: true,
		enableColumnFilter: false,
		sortingFn: 'basic',
		meta: {
			label: "AE (Authorized)",
		},
	},
	{
		accessorKey: "cp",
		header: ({ column }) => (
			<div className="text-right">
				<SortableHeader column={column}>CP</SortableHeader>
			</div>
		),
		cell: ({ row }) => {
			const value = row.original.cp;
			return (
				<div className="text-right font-mono text-xs text-purple-600 dark:text-purple-400 min-w-25">
					{formatCurrency(value)}
				</div>
			);
		},
		enableSorting: true,
		enableColumnFilter: false,
		sortingFn: 'basic',
		meta: {
			label: "CP (Credits)",
		},
	},
	{
		accessorKey: "engaged",
		header: ({ column }) => (
			<div className="text-right">
				<SortableHeader column={column}>Engaged</SortableHeader>
			</div>
		),
		cell: ({ row }) => {
			const val = row.original.engaged;
			const ae = row.original.ae;
			const ratio = ae > 0 ? (val / ae) * 100 : 0;
			const disponible = ae - val;

			return (
				<div className="flex flex-col items-end space-y-1 min-w-30">
					<span className="font-mono text-xs font-semibold">
						{formatCurrency(val)}
					</span>
					<Badge
						variant={ratio > 95 ? "destructive" : "secondary"}
						className="text-[10px] px-1.5 py-0"
					>
						{ratio.toFixed(1)}%
					</Badge>
					<span className="text-[10px] text-muted-foreground">
						Disp: {formatCurrency(disponible)}
					</span>
				</div>
			);
		},
		enableSorting: true,
		enableColumnFilter: false,
		sortingFn: 'basic',
		meta: {
			label: "Engaged",
		},
	},
	{
		id: "actions",
		header: () => <div className="text-center">Actions</div>,
		cell: ({ row }) => (
			<div className="flex justify-center">
				<EditCell row={row.original} />
			</div>
		),
		enableSorting: false,
		enableHiding: false,
	},
];