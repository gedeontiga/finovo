"use client";

import { DataTable } from "@/components/ui/table/data-table";
import { DataTableToolbar } from "@/components/ui/table/data-table-toolbar";
import { useSimpleDataTable } from "@/hooks/use-simple-data-table";
import { ColumnDef } from "@tanstack/react-table";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Make the props generic using <TData, TValue>
interface BudgetTableProps<TData, TValue> {
    data: TData[];
    totalItems: number;
    columns: ColumnDef<TData, TValue>[];
}

export function BudgetTable<TData, TValue>({
    data: initialData,
    columns
}: BudgetTableProps<TData, TValue>) {
    const [data, setData] = useState(initialData);
    const router = useRouter();

    // Update local state when server data changes
    useEffect(() => {
        setData(initialData);
    }, [initialData]);

    // Use simple data table hook for client-side rendering
    const table = useSimpleDataTable({
        data,
        columns,
    });

    return (
        <DataTable table={table}>
            <DataTableToolbar table={table} />
        </DataTable>
    );
}