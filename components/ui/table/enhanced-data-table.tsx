"use client";

import { DataTable } from "@/components/ui/table/data-table";
import { DataTableToolbar } from "@/components/ui/table/data-table-toolbar";
import {
	ColumnDef,
	ColumnFiltersState,
	PaginationState,
	SortingState,
	VisibilityState,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";

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
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
		globalSearch: false, // Explicitly hide global search column
	});
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
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		onColumnVisibilityChange: setColumnVisibility,
		onRowSelectionChange: setRowSelection,
		onPaginationChange: setPagination,
		enableRowSelection,
		state: {
			sorting,
			columnFilters,
			columnVisibility,
			rowSelection,
			pagination,
		},
		// Ensure manual pagination state updates are respected
		manualPagination: false,
		pageCount: Math.ceil(data.length / pagination.pageSize),
	});

	const handleRowClick = (row: TData, e: React.MouseEvent) => {
		const target = e.target as HTMLElement;
		if (
			target.closest('button') ||
			target.closest('input') ||
			target.closest('[role="checkbox"]') ||
			target.closest('.delete-trigger') ||
			target.closest('[data-radix-collection-item]')
		) {
			return;
		}
		onRowClick?.(row);
	};

	return (
		<div className="flex flex-col gap-4 w-full">
			<DataTableToolbar
				table={table}
				searchKey={searchKey}
			/>
			<DataTable
				table={table}
				onRowClick={handleRowClick}
				onRowDelete={onRowDelete}
			/>
		</div>
	);
}