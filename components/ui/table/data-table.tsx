"use client";

import { type Table as TanstackTable, flexRender } from '@tanstack/react-table';
import { useState, useRef, useEffect } from 'react';
import { DataTablePagination } from '@/components/ui/table/data-table-pagination';
import { cn } from '@/lib/utils';
import { IconTrash } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface DataTableProps<TData> {
  table: TanstackTable<TData>;
  onRowClick?: (row: TData, e: React.MouseEvent) => void;
  onRowDelete?: (row: TData) => void;
  pageSizeOptions?: number[];
}

function SwipeableTableRow<TData>({
  row,
  onRowClick,
  onRowDelete,
  isMobile
}: {
  row: any;
  onRowClick?: (row: TData, e: React.MouseEvent) => void;
  onRowDelete?: (row: TData) => void;
  isMobile: boolean;
}) {
  const rowRef = useRef<HTMLTableRowElement>(null);
  const touchStart = useRef({ x: 0, y: 0 });
  const isSwiping = useRef(false);
  const isScrolling = useRef(false);
  const DELETE_THRESHOLD = 100;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile || !onRowDelete) return;
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    isSwiping.current = false;
    isScrolling.current = false;
    if (rowRef.current) {
      rowRef.current.style.transition = 'none';
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isMobile || !onRowDelete || isScrolling.current) return;

    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = currentX - touchStart.current.x;
    const deltaY = currentY - touchStart.current.y;

    if (!isSwiping.current) {
      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        isScrolling.current = true;
        return;
      }
      if (Math.abs(deltaX) > 10 && deltaX < 0) {
        isSwiping.current = true;
      }
    }

    if (isSwiping.current && e.cancelable) {
      e.preventDefault();
      const newOffset = Math.min(0, Math.max(-150, deltaX));
      if (rowRef.current) {
        rowRef.current.style.transform = `translateX(${newOffset}px)`;
      }
    }
  };

  const handleTouchEnd = () => {
    if (!isMobile || !onRowDelete || !rowRef.current) return;

    rowRef.current.style.transition = 'transform 0.3s ease-out';
    const currentTransform = new WebKitCSSMatrix(
      window.getComputedStyle(rowRef.current).transform
    ).m41;

    if (currentTransform < -DELETE_THRESHOLD) {
      onRowDelete(row.original);
    }
    rowRef.current.style.transform = 'translateX(0)';
    isSwiping.current = false;
    isScrolling.current = false;
  };

  return (
    <tr
      ref={rowRef}
      data-state={row.getIsSelected() && 'selected'}
      className={cn(
        'group relative transition-colors duration-200 border-b hover:bg-muted/50 data-[state=selected]:bg-muted',
        onRowClick && 'cursor-pointer active:bg-muted'
      )}
      onClick={(e) => onRowClick?.(row.original, e)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {onRowDelete && (
        <td className='w-12 p-0 sticky left-0 bg-background z-10 border-r'>
          <div className='flex items-center justify-center h-full'>
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors'
              onClick={(e) => {
                e.stopPropagation();
                onRowDelete(row.original);
              }}
            >
              <IconTrash className='h-4 w-4' />
            </Button>
          </div>
        </td>
      )}
      {row.getVisibleCells().map((cell: any) => (
        <td key={cell.id} className='p-2 align-middle'>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </td>
      ))}
    </tr>
  );
}

export function DataTable<TData>({
  table,
  onRowClick,
  onRowDelete,
  pageSizeOptions,
}: DataTableProps<TData>) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState<TData | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
      <div className='w-full space-y-4'>
        <div className='relative w-full border rounded-md bg-background overflow-hidden'>
          <div className='overflow-x-auto overflow-y-auto max-h-[calc(100vh-22rem)] scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent'>
            <table className='w-full caption-bottom text-sm relative table-fixed md:table-auto'>
              <thead className='sticky top-0 z-20 bg-muted/95 backdrop-blur shadow-sm'>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} className='border-b hover:bg-transparent'>
                    {onRowDelete && (
                      <th className='w-12 sticky left-0 bg-muted/95 backdrop-blur z-30 border-r h-10 px-2 text-left align-middle font-medium'>
                        <span className='sr-only'>Actions</span>
                      </th>
                    )}
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        colSpan={header.colSpan}
                        className='text-foreground h-10 px-2 text-left align-middle font-medium'
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <SwipeableTableRow
                      key={row.id}
                      row={row}
                      onRowClick={onRowClick}
                      onRowDelete={handleDeleteRequest}
                      isMobile={isMobile}
                    />
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={table.getAllColumns().length + (onRowDelete ? 1 : 0)}
                      className='h-24 text-center p-2 align-middle'
                    >
                      <div className='flex flex-col items-center justify-center gap-2 text-muted-foreground'>
                        <p className='text-sm font-medium'>No results found</p>
                        <p className='text-xs'>Try adjusting your filters or search terms</p>
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
              This action cannot be undone. This will permanently delete this record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}