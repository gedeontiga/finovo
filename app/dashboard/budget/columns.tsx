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
	}).format(value || 0);

const safeString = (value: string | null | undefined, fallback: string = "N/A"): string => {
	if (value === null || value === undefined || value === '') return fallback;
	return String(value);
};

const safeNumber = (value: number | null | undefined): number => {
	if (value === null || value === undefined || isNaN(value)) return 0;
	return Number(value);
};

const globalFilterFn = (row: any, columnId: string, filterValue: string) => {
	const search = String(filterValue).toLowerCase();

	const searchableValues = [
		safeString(row.original.program, ''),
		safeString(row.original.programName, ''),
		safeString(row.original.action, ''),
		safeString(row.original.actionName, ''),
		safeString(row.original.activity, ''),
		safeString(row.original.activityName, ''),
		safeString(row.original.taskName, ''),
		safeString(row.original.adminCode, ''),
		safeString(row.original.adminName, ''),
		safeString(row.original.paragraph, ''),
		safeString(row.original.paragraphName, ''),
		String(safeNumber(row.original.ae)),
		String(safeNumber(row.original.cp)),
		String(safeNumber(row.original.engaged)),
	];

	return searchableValues.some(value =>
		String(value).toLowerCase().includes(search)
	);
};

export const columns: ColumnDef<BudgetLineRow>[] = [
	{
		id: "globalSearch",
		accessorFn: (row) =>
			`${safeString(row.program)} ${safeString(row.programName)} ${safeString(row.action)} ${safeString(row.actionName)} ${safeString(row.activity)} ${safeString(row.activityName)} ${safeString(row.taskName)} ${safeString(row.adminCode)} ${safeString(row.adminName)} ${safeString(row.paragraph)} ${safeString(row.paragraphName)}`,
		filterFn: globalFilterFn,
		enableHiding: false,
		enableSorting: false,
	},
	{
		accessorKey: "program",
		header: ({ column }) => <DataTableColumnHeader column={column} title="Program" />,
		cell: ({ row }) => {
			const program = safeString(row.original.program);
			const programName = safeString(row.original.programName);
			return (
				<div className="space-y-1 min-w-35 max-w-50">
					<span className="font-mono text-xs font-semibold block whitespace-nowrap">
						{program}
					</span>
					<p className="text-xs text-muted-foreground line-clamp-2" title={programName}>
						{programName}
					</p>
				</div>
			);
		},
		minSize: 140,
		size: 200,
		enableSorting: true,
		enableHiding: true,
		meta: { label: "Program" },
	},
	{
		accessorKey: "action",
		header: ({ column }) => <DataTableColumnHeader column={column} title="Action" />,
		cell: ({ row }) => {
			const action = safeString(row.original.action);
			const actionName = safeString(row.original.actionName);
			return (
				<div className="space-y-1 min-w-35 max-w-50">
					<span className="font-mono text-xs font-semibold block whitespace-nowrap">
						{action}
					</span>
					<p className="text-xs text-muted-foreground line-clamp-2" title={actionName}>
						{actionName}
					</p>
				</div>
			);
		},
		minSize: 140,
		size: 200,
		enableSorting: true,
		enableHiding: true,
		meta: { label: "Action" },
	},
	{
		accessorKey: "activity",
		header: ({ column }) => <DataTableColumnHeader column={column} title="Activity" />,
		cell: ({ row }) => {
			const activity = safeString(row.original.activity);
			const activityName = safeString(row.original.activityName);
			return (
				<div className="space-y-1 min-w-37.5 max-w-55">
					<span className="font-mono text-xs font-semibold block whitespace-nowrap">
						{activity}
					</span>
					<p className="text-xs text-muted-foreground line-clamp-2" title={activityName}>
						{activityName}
					</p>
				</div>
			);
		},
		minSize: 150,
		size: 220,
		enableSorting: true,
		enableHiding: true,
		meta: { label: "Activity" },
	},
	{
		accessorKey: "adminCode",
		header: ({ column }) => <DataTableColumnHeader column={column} title="Admin Unit" />,
		cell: ({ row }) => {
			const code = safeString(row.original.adminCode);
			const name = safeString(row.original.adminName);
			return (
				<div className="space-y-1 min-w-30 max-w-45">
					<span className="font-mono text-xs font-semibold block whitespace-nowrap">
						{code}
					</span>
					<p className="text-xs text-muted-foreground line-clamp-2" title={name}>
						{name}
					</p>
				</div>
			);
		},
		minSize: 120,
		size: 180,
		enableSorting: true,
		enableHiding: true,
		meta: { label: "Admin" },
	},
	{
		accessorKey: "paragraph",
		header: ({ column }) => <DataTableColumnHeader column={column} title="Paragraph" />,
		cell: ({ row }) => {
			const paragraph = safeString(row.original.paragraph);
			const paragraphName = safeString(row.original.paragraphName);
			return (
				<div className="space-y-1 min-w-50 max-w-70">
					<span className="font-mono text-xs font-bold text-primary block whitespace-nowrap">
						{paragraph}
					</span>
					<p className="text-xs text-muted-foreground line-clamp-2" title={paragraphName}>
						{paragraphName}
					</p>
				</div>
			);
		},
		minSize: 200,
		size: 280,
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
				{formatCurrency(safeNumber(row.original.ae))}
			</div>
		),
		minSize: 100,
		size: 120,
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
			const val = safeNumber(row.original.engaged);
			const ae = safeNumber(row.original.ae);
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
		minSize: 120,
		size: 140,
		enableHiding: true,
		meta: { label: "Engaged" },
	},
];