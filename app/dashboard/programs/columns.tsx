"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Progress } from "@/components/ui/progress";
import { DataTableColumnHeader } from "@/components/ui/table/data-table-column-header";
import { cn } from "@/lib/utils";

const formatCurrency = (value: number) =>
	new Intl.NumberFormat("fr-FR", {
		style: "decimal",
		maximumFractionDigits: 0,
	}).format(value);

export type ProgramRow = {
	id: number;
	code: string;
	name: string;
	ae: number;
	cp: number;
	engaged: number;
	executionRate: number;
	activitiesCount: number;
};

export const columns: ColumnDef<ProgramRow>[] = [
	{
		accessorKey: "code",
		header: ({ column }) => <DataTableColumnHeader column={column} title="Code" />,
		cell: ({ row }) => {
			const code = row.original.code;
			return (
				<span className="font-bold font-mono text-primary min-w-15 block">
					{code}
				</span>
			);
		},
		enableSorting: true,
		enableColumnFilter: true,
		filterFn: "includesString",
		meta: {
			label: "Code",
			filterable: true,
			filterVariant: "text" as const,
		},
	},
	{
		accessorKey: "name",
		header: ({ column }) => <DataTableColumnHeader column={column} title="Program Name" />,
		cell: ({ row }) => {
			const name = row.original.name;
			return (
				<span className="text-sm min-w-50 block" title={name}>
					{name}
				</span>
			);
		},
		enableSorting: true,
		enableColumnFilter: true,
		filterFn: "includesString",
		meta: {
			label: "Program Name",
			filterable: true,
			filterVariant: "text" as const,
		},
	},
	{
		accessorKey: "activitiesCount",
		header: ({ column }) => (
			<div className="text-center">
				<DataTableColumnHeader column={column} title="Budget Lines" />
			</div>
		),
		cell: ({ row }) => {
			const count = row.original.activitiesCount;
			return (
				<span className="text-muted-foreground text-sm min-w-15 block text-center font-semibold">
					{count}
				</span>
			);
		},
		enableSorting: true,
		enableColumnFilter: false,
		sortingFn: 'basic',
		meta: {
			label: "Budget Lines",
		},
	},
	{
		accessorKey: "ae",
		header: ({ column }) => (
			<div className="text-right">
				<DataTableColumnHeader column={column} title="Auth (AE)" />
			</div>
		),
		cell: ({ row }) => {
			const value = row.original.ae;
			return (
				<div className="text-right font-mono text-sm min-w-30 text-blue-600 dark:text-blue-400 font-semibold">
					{formatCurrency(value)}
				</div>
			);
		},
		enableSorting: true,
		enableColumnFilter: false,
		sortingFn: 'basic',
		meta: {
			label: "Auth (AE)",
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
				<div className="text-right font-mono text-sm min-w-30 text-purple-600 dark:text-purple-400">
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
			const value = row.original.engaged;
			return (
				<div className="text-right font-mono text-sm min-w-30 text-green-600 dark:text-green-400 font-semibold">
					{formatCurrency(value)}
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
		accessorKey: "executionRate",
		header: ({ column }) => <DataTableColumnHeader column={column} title="Execution" />,
		cell: ({ row }) => {
			const rate = row.original.executionRate;
			const disponible = row.original.ae - row.original.engaged;

			return (
				<div className="min-w-32 space-y-2">
					<div className="flex justify-between text-xs mb-1.5">
						<span className={cn(
							"font-semibold",
							rate > 95 ? "text-red-600 dark:text-red-400" :
								rate > 90 ? "text-amber-600 dark:text-amber-400" :
									"text-green-600 dark:text-green-400"
						)}>
							{rate.toFixed(1)}%
						</span>
						<span className="text-muted-foreground text-[10px]">
							Disp: {formatCurrency(disponible)}
						</span>
					</div>
					<Progress
						value={Math.min(rate, 100)}
						className={cn(
							"h-2",
							rate > 95 ? "[&>div]:bg-red-600" :
								rate > 90 ? "[&>div]:bg-amber-500" :
									"[&>div]:bg-green-600"
						)}
					/>
				</div>
			);
		},
		enableSorting: true,
		enableColumnFilter: false,
		sortingFn: 'basic',
		meta: {
			label: "Execution",
		},
	},
];