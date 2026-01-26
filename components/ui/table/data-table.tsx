"use client";

import {
  DataTable,
  DataTableColumn,
  DataTableSortStatus,
} from "mantine-datatable";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface MantineDataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  onRowClick?: (record: T) => void;
  onRowDelete?: (record: T) => void;
  searchable?: boolean;
  searchKeys?: (keyof T)[];
  defaultPageSize?: number;
  pageSizeOptions?: number[];
  minHeight?: number;
  striped?: boolean;
  highlightOnHover?: boolean;
  withBorder?: boolean;
}

export function MantineDataTable<T extends Record<string, any>>({
  data,
  columns,
  onRowClick,
  onRowDelete,
  searchable = true,
  searchKeys = [],
  defaultPageSize = 20,
  pageSizeOptions = [10, 20, 30, 50, 100],
  minHeight = 200,
  striped = true,
  highlightOnHover = true,
  withBorder = true,
}: MantineDataTableProps<T>) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus<T>>({
    columnAccessor: columns[0]?.accessor as keyof T,
    direction: "asc",
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<T | null>(null);

  // Add delete column if onRowDelete is provided
  const enhancedColumns = useMemo(() => {
    if (!onRowDelete) return columns;

    const deleteColumn: DataTableColumn<T> = {
      accessor: "_actions" as keyof T,
      title: "",
      width: 60,
      textAlign: "center",
      render: (record) => (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            setRecordToDelete(record);
            setDeleteDialogOpen(true);
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    };

    return [deleteColumn, ...columns];
  }, [columns, onRowDelete]);

  // Global search filter
  const filteredData = useMemo(() => {
    if (!searchQuery || searchKeys.length === 0) return data;

    const query = searchQuery.toLowerCase();
    return data.filter((record) =>
      searchKeys.some((key) => {
        const value = record[key];
        return value?.toString().toLowerCase().includes(query);
      }),
    );
  }, [data, searchQuery, searchKeys]);

  // Sorting
  const sortedData = useMemo(() => {
    if (!sortStatus.columnAccessor) return filteredData;

    const sorted = [...filteredData].sort((a, b) => {
      const aValue = a[sortStatus.columnAccessor];
      const bValue = b[sortStatus.columnAccessor];

      // Handle null/undefined
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      // Handle numbers
      if (typeof aValue === "number" && typeof bValue === "number") {
        return aValue - bValue;
      }

      // Handle strings
      return String(aValue).localeCompare(String(bValue));
    });

    return sortStatus.direction === "desc" ? sorted.reverse() : sorted;
  }, [filteredData, sortStatus]);

  // Pagination
  const paginatedData = useMemo(() => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize;
    return sortedData.slice(from, to);
  }, [sortedData, page, pageSize]);

  const confirmDelete = () => {
    if (recordToDelete && onRowDelete) {
      onRowDelete(recordToDelete);
    }
    setDeleteDialogOpen(false);
    setRecordToDelete(null);
  };

  return (
    <>
      <div className="space-y-4">
        {searchable && searchKeys.length > 0 && (
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1); // Reset to first page on search
              }}
              className="pl-9"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}

        <DataTable<T>
          columns={enhancedColumns}
          records={paginatedData}
          totalRecords={sortedData.length}
          recordsPerPage={pageSize}
          page={page}
          onPageChange={setPage}
          recordsPerPageOptions={pageSizeOptions}
          onRecordsPerPageChange={setPageSize}
          sortStatus={sortStatus}
          onSortStatusChange={setSortStatus}
          onRowClick={
            onRowClick ? ({ record }) => onRowClick(record) : undefined
          }
          minHeight={minHeight}
          striped={striped}
          highlightOnHover={highlightOnHover}
          withTableBorder={withBorder}
          withColumnBorders={false}
          borderRadius="md"
          shadow="sm"
          styles={{
            header: {
              backgroundColor: "hsl(var(--muted) / 0.5)",
              backdropFilter: "blur(8px)",
            },
            pagination: {
              borderTop: "1px solid hsl(var(--border))",
              padding: "1rem",
            },
          }}
          rowClassName="cursor-pointer hover:bg-muted/50 transition-colors"
          paginationText={({ from, to, totalRecords }) =>
            `Showing ${from} to ${to} of ${totalRecords} entries`
          }
          noRecordsText="No records found"
          loadingText="Loading..."
        />
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
