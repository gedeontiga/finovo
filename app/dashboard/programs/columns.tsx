"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Progress } from "@/components/ui/progress";

// Helper for formatting
const formatCurrency = (value: number) =>
	new Intl.NumberFormat("fr-FR", { style: "decimal", maximumFractionDigits: 0 }).format(value);

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
		header: "Code",
		cell: ({ row }) => <span className="font-bold">{row.getValue("code")}</span>,
	},
	{
		accessorKey: "name",
		header: "Program Name",
	},
	{
		accessorKey: "activitiesCount",
		header: "Lines",
		cell: ({ row }) => <span className="text-muted-foreground">{row.getValue("activitiesCount")}</span>,
	},
	{
		accessorKey: "ae",
		header: () => <div className="text-right">Auth (AE)</div>,
		cell: ({ row }) => <div className="text-right font-mono">{formatCurrency(row.getValue("ae"))}</div>,
	},
	{
		accessorKey: "engaged",
		header: () => <div className="text-right">Engaged</div>,
		cell: ({ row }) => <div className="text-right font-mono">{formatCurrency(row.getValue("engaged"))}</div>,
	},
	{
		accessorKey: "executionRate",
		header: "Execution",
		cell: ({ row }) => {
			const rate = row.getValue("executionRate") as number;
			return (
				<div className="w-25">
					<div className="flex justify-between text-xs mb-1">
						<span>{rate.toFixed(1)}%</span>
					</div>
					<Progress value={rate} className={`h-2 ${rate > 90 ? "bg-red-100" : ""}`} />
				</div>
			);
		},
	},
];