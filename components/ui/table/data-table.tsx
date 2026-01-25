"use client";

import { type Table as TanstackTable, flexRender } from "@tanstack/react-table";
import { useState } from "react";
import { DataTablePagination } from "@/components/ui/table/data-table-pagination";
import { cn } from "@/lib/utils";
import { IconTrash } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
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

interface DataTableProps<TData> {
  table: TanstackTable<TData>;
  onRowClick?: (row: TData, e: React.MouseEvent) => void;
  onRowDelete?: (row: TData) => void;
  pageSizeOptions?: number[];
}

export function DataTable<TData>({
  table,
  onRowClick,
  onRowDelete,
  pageSizeOptions,
}: DataTableProps<TData>) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState<TData | null>(null);

  const handleDeleteRequest = (row: TData) => {
    setRowToDelete(row);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (rowToDelete && onRowDelete) {
      onRowDelete(rowToDelete);
    }
    setDeleteDialogOpen(false);
    setRowToDelete(null);
  };

  return (
    <>
      <div className="w-full space-y-4">
        <div className="rounded-md border">
          <div className="relative w-full overflow-auto max-h-[calc(100vh-20rem)]">
            <table className="w-full caption-bottom text-sm">
              <thead className="sticky top-0 z-10 bg-muted/95 backdrop-blur">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} className="border-b">
                    {onRowDelete && (
                      <th className="h-10 px-2 text-left align-middle font-medium w-12 sticky left-0 bg-muted/95 z-20">
                        <span className="sr-only">Actions</span>
                      </th>
                    )}
                    {headerGroup.headers
                      .filter((header) => header.column.getIsVisible())
                      .map((header) => (
                        <th
                          key={header.id}
                          className="h-10 px-2 text-left align-middle font-medium"
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                        </th>
                      ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className={cn(
                        "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
                        onRowClick && "cursor-pointer",
                      )}
                      onClick={(e) => onRowClick?.(row.original, e)}
                    >
                      {onRowDelete && (
                        <td className="p-2 w-12 sticky left-0 bg-background z-10">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteRequest(row.original);
                            }}
                          >
                            <IconTrash className="h-4 w-4" />
                          </Button>
                        </td>
                      )}
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="p-2 align-middle">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={
                        table.getAllColumns().length + (onRowDelete ? 1 : 0)
                      }
                      className="h-24 text-center"
                    >
                      <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                        <p className="text-sm font-medium">No results found</p>
                        <p className="text-xs">
                          Try adjusting your filters or search terms
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <DataTablePagination table={table} pageSizeOptions={pageSizeOptions} />
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
