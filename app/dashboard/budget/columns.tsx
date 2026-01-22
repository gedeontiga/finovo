"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/ui/table/data-table-column-header";
import { cn } from "@/lib/utils";

export type BudgetLineRow = {
	id: number;
	program: string | null;
	programName: string | null;
	action: string | null;
	actionName: string | null;
	activity: string | null;
	activityName: string | null;
	taskName: string | null;
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

export const columns: ColumnDef<BudgetLineRow>[] = [
	{
		accessorKey: "program",
		header: ({ column }) => <DataTableColumnHeader column={column} title="Program" />,
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
			filterable: true,
			filterVariant: "text" as const,
		},
	},
	{
		accessorKey: "action",
		header: ({ column }) => <DataTableColumnHeader column={column} title="Action" />,
		cell: ({ row }) => {
			const action = row.original.action;
			const actionName = row.original.actionName;
			return (
				<div className="space-y-1 min-w-32">
					<span className="font-mono text-xs font-semibold block">
						{action || "-"}
					</span>
					<p
						className="text-xs text-muted-foreground truncate max-w-32"
						title={actionName || ""}
					>
						{actionName}
					</p>
				</div>
			);
		},
		enableSorting: true,
		enableColumnFilter: true,
		filterFn: 'includesString',
		meta: {
			label: "Action",
			filterable: true,
			filterVariant: "text" as const,
		},
	},
	{
		accessorKey: "activity",
		header: ({ column }) => <DataTableColumnHeader column={column} title="Activity" />,
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
			filterable: true,
			filterVariant: "text" as const,
		},
	},
	{
		accessorKey: "taskName",
		header: ({ column }) => <DataTableColumnHeader column={column} title="Task" />,
		cell: ({ row }) => {
			const taskName = row.original.taskName;
			return (
				<div className="min-w-32">
					<p
						className="text-xs truncate max-w-32"
						title={taskName || ""}
					>
						{taskName || "-"}
					</p>
				</div>
			);
		},
		enableSorting: true,
		enableColumnFilter: true,
		filterFn: 'includesString',
		meta: {
			label: "Task",
			filterable: true,
			filterVariant: "text" as const,
		},
	},
	{
		accessorKey: "adminCode",
		header: ({ column }) => <DataTableColumnHeader column={column} title="Admin Unit" />,
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
			filterable: true,
			filterVariant: "text" as const,
		},
	},
	{
		accessorKey: "paragraph",
		header: ({ column }) => <DataTableColumnHeader column={column} title="Paragraph" />,
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
			filterable: true,
			filterVariant: "text" as const,
		},
	},
	{
		accessorKey: "ae",
		header: ({ column }) => (
			<div className="text-right">
				<DataTableColumnHeader column={column} title="AE" />
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
				<DataTableColumnHeader column={column} title="CP" />
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
				<DataTableColumnHeader column={column} title="Engaged" />
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
						className={cn(
							"text-[10px] px-1.5 py-0",
							ratio > 90 && ratio <= 95 && "bg-amber-500/10 text-amber-700 dark:text-amber-400"
						)}
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
];