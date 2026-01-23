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

// Global search filter - searches across all text fields
const globalFilterFn = (row: any, columnId: string, filterValue: string) => {
	const search = String(filterValue).toLowerCase();

	const searchableValues = [
		row.original.program,
		row.original.programName,
		row.original.action,
		row.original.actionName,
		row.original.activity,
		row.original.activityName,
		row.original.taskName,
		row.original.adminCode,
		row.original.adminName,
		row.original.paragraph,
		row.original.paragraphName,
		String(row.original.ae),
		String(row.original.cp),
		String(row.original.engaged),
	];

	return searchableValues.some(value =>
		String(value || '').toLowerCase().includes(search)
	);
};

export const columns: ColumnDef<BudgetLineRow>[] = [
	// Hidden global search column
	{
		id: "globalSearch",
		accessorFn: (row) =>
			`${row.program} ${row.programName} ${row.action} ${row.actionName} ${row.activity} ${row.activityName} ${row.taskName} ${row.adminCode} ${row.adminName} ${row.paragraph} ${row.paragraphName} ${row.ae} ${row.cp} ${row.engaged}`,
		filterFn: globalFilterFn,
		enableHiding: false, // Cannot be hidden/shown
		enableSorting: false,
	},
	{
		accessorKey: "program",
		header: ({ column }) => <DataTableColumnHeader column={column} title="Program" />,
		cell: ({ row }) => {
			const program = row.original.program ?? "-";
			const programName = row.original.programName ?? "-";
			return (
				<div className="space-y-1 min-w-35 max-w-50">
					<span className="font-mono text-xs font-semibold block whitespace-nowrap">
						{program}
					</span>
					<p className="text-xs text-muted-foreground line-clamp-2 wrap-break-word" title={programName}>
						{programName}
					</p>
				</div>
			);
		},
		enableSorting: true,
		enableHiding: true,
		meta: { label: "Program" },
	},
	{
		accessorKey: "action",
		header: ({ column }) => <DataTableColumnHeader column={column} title="Action" />,
		cell: ({ row }) => {
			const action = row.original.action ?? "-";
			const actionName = row.original.actionName ?? "-";
			return (
				<div className="space-y-1 min-w-35 max-w-50">
					<span className="font-mono text-xs font-semibold block whitespace-nowrap">
						{action}
					</span>
					<p className="text-xs text-muted-foreground line-clamp-2 wrap-break-word" title={actionName}>
						{actionName}
					</p>
				</div>
			);
		},
		enableSorting: true,
		enableHiding: true,
		meta: { label: "Action" },
	},
	{
		accessorKey: "activity",
		header: ({ column }) => <DataTableColumnHeader column={column} title="Activity" />,
		cell: ({ row }) => {
			const activity = row.original.activity ?? "-";
			const activityName = row.original.activityName ?? "-";
			return (
				<div className="space-y-1 min-w-37.5 max-w-55">
					<span className="font-mono text-xs font-semibold block whitespace-nowrap">
						{activity}
					</span>
					<p className="text-xs text-muted-foreground line-clamp-2 wrap-break-word" title={activityName}>
						{activityName}
					</p>
				</div>
			);
		},
		enableSorting: true,
		enableHiding: true,
		meta: { label: "Activity" },
	},
	{
		accessorKey: "adminCode",
		header: ({ column }) => <DataTableColumnHeader column={column} title="Admin Unit" />,
		cell: ({ row }) => {
			const code = row.original.adminCode ?? "-";
			const name = row.original.adminName ?? "-";
			return (
				<div className="space-y-1 min-w-30 max-w-45">
					<span className="font-mono text-xs font-semibold block whitespace-nowrap">
						{code}
					</span>
					<p className="text-xs text-muted-foreground line-clamp-2 wrap-break-word" title={name}>
						{name}
					</p>
				</div>
			);
		},
		enableSorting: true,
		enableHiding: true,
		meta: { label: "Admin" },
	},
	{
		accessorKey: "paragraph",
		header: ({ column }) => <DataTableColumnHeader column={column} title="Paragraph" />,
		cell: ({ row }) => {
			const paragraph = row.original.paragraph;
			const paragraphName = row.original.paragraphName;
			return (
				<div className="space-y-1 min-w-50 max-w-70">
					<span className="font-mono text-xs font-bold text-primary block whitespace-nowrap">
						{paragraph}
					</span>
					<p className="text-xs text-muted-foreground line-clamp-2 wrap-break-word" title={paragraphName}>
						{paragraphName}
					</p>
				</div>
			);
		},
		enableSorting: true,
		enableHiding: true,
		meta: { label: "Paragraph" },
	},
	{
		accessorKey: "ae",
		header: ({ column }) => (
			<div className="text-right">
				<DataTableColumnHeader column={column} title="AE" />
			</div>
		),
		cell: ({ row }) => (
			<div className="text-right font-mono text-xs text-blue-600 dark:text-blue-400 font-semibold min-w-25 whitespace-nowrap pr-4">
				{formatCurrency(row.original.ae)}
			</div>
		),
		enableHiding: true,
		meta: { label: "AE" },
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

			return (
				<div className="flex flex-col items-end space-y-1 min-w-30 pr-4">
					<span className="font-mono text-xs font-semibold whitespace-nowrap">
						{formatCurrency(val)}
					</span>
					<Badge
						variant={ratio > 95 ? "destructive" : "secondary"}
						className={cn(
							"text-[10px] px-1.5 py-0 whitespace-nowrap",
							ratio > 90 && ratio <= 95 && "bg-amber-500/10 text-amber-700 dark:text-amber-400"
						)}
					>
						{ratio.toFixed(1)}%
					</Badge>
				</div>
			);
		},
		enableHiding: true,
		meta: { label: "Engaged" },
	},
];