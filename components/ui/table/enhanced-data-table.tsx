'use client';

import { DataTable } from "@/components/ui/table/data-table";
import { DataTableToolbar } from "@/components/ui/table/data-table-toolbar";
import { ColumnDef, ColumnFiltersState, PaginationState, SortingState, VisibilityState, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { useState, useCallback } from "react";

interface EnhancedDataTableProps<TData, TValue> {
	data: TData[];
	columns: ColumnDef<TData, TValue>[];
	onRowClick?: (row: TData) => void;
	onRowDelete?: (row: TData) => void;
	searchKey?: string;
	defaultPageSize?: number;
	pageSizeOptions?: number[];
	enableRowSelection?: boolean;
}

export function EnhancedDataTable<TData, TValue>({
	data,
	columns,
	onRowClick,
	onRowDelete,
	searchKey,
	defaultPageSize = 10,
	pageSizeOptions = [10, 20, 30, 50, 100],
	enableRowSelection = false,
}: EnhancedDataTableProps<TData, TValue>) {
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
	const [rowSelection, setRowSelection] = useState({});
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: defaultPageSize,
	});

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		state: {
			sorting,
			columnFilters,
			columnVisibility,
			rowSelection,
			pagination,
		},
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		onColumnVisibilityChange: setColumnVisibility,
		onRowSelectionChange: setRowSelection,
		onPaginationChange: setPagination,
		enableRowSelection,
	});

	const handleRowClick = useCallback((row: TData, e: React.MouseEvent) => {
		const target = e.target as HTMLElement;
		if (
			target.closest('button') ||
			target.closest('input') ||
			target.closest('[role="checkbox"]') ||
			target.closest('.delete-trigger')
		) {
			return;
		}
		onRowClick?.(row);
	}, [onRowClick]);

	return (
		<div className="flex flex-col gap-4">
			<DataTableToolbar
				table={table}
				searchKey={searchKey}
				pageSizeOptions={pageSizeOptions}
			/>
			<DataTable
				table={table}
				onRowClick={handleRowClick}
				onRowDelete={onRowDelete}
			/>
		</div>
	);
}