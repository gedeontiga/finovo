"use client";

import { DataTable } from "@/components/ui/table/data-table";
import { DataTableToolbar } from "@/components/ui/table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import { ColumnDef } from "@tanstack/react-table";

// Make the props generic using <TData, TValue>
interface BudgetTableProps<TData, TValue> {
    data: TData[];
    totalItems: number;
    columns: ColumnDef<TData, TValue>[];
}

export function BudgetTable<TData, TValue>({
    data,
    totalItems,
    columns
}: BudgetTableProps<TData, TValue>) {

    // The hook is usually generic, so we pass TData, TValue down
    const { table } = useDataTable({
        data,
        columns,
        pageCount: Math.ceil(totalItems / 10), // Adjust page size logic as needed
    });

    return (
        <DataTable table={table}>
            <DataTableToolbar table={table} />
        </DataTable>
    );
}