"use client";

import { type Table as TanstackTable, flexRender } from '@tanstack/react-table';
import * as React from 'react';
import { useState, useRef, useCallback, useEffect } from 'react';
import { DataTablePagination } from '@/components/ui/table/data-table-pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { IconTrash, IconGripVertical } from '@tabler/icons-react';
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

interface DataTableProps<TData> extends React.ComponentProps<'div'> {
  table: TanstackTable<TData>;
  onRowClick?: (row: TData, e: React.MouseEvent) => void;
  onRowDelete?: (row: TData) => void;
}

// Separate component for swipeable row to isolate logic and performance
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
  const [offset, setOffset] = useState(0);
  const touchStart = useRef({ x: 0, y: 0 });
  const isSwiping = useRef(false);
  const isScrolling = useRef(false);
  const SWIPE_THRESHOLD = 80;
  const DELETE_THRESHOLD = 100;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile || !onRowDelete) return;
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    isSwiping.current = false;
    isScrolling.current = false;
    // Reset transition for direct manipulation
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

    // Determine gesture direction once
    if (!isSwiping.current) {
      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        isScrolling.current = true;
        return;
      }
      if (Math.abs(deltaX) > 10 && deltaX < 0) { // Only swipe left
        isSwiping.current = true;
      }
    }

    if (isSwiping.current) {
      // Prevent scrolling while swiping
      if (e.cancelable) e.preventDefault();

      // Calculate new offset with resistance
      const newOffset = Math.min(0, Math.max(-150, deltaX));

      // Direct DOM update for performance (no react render)
      if (rowRef.current) {
        rowRef.current.style.transform = `translateX(${newOffset}px)`;
      }
    }
  };

  const handleTouchEnd = () => {
    if (!isMobile || !onRowDelete) return;

    if (rowRef.current) {
      rowRef.current.style.transition = 'transform 0.3s ease-out';
      const currentTransform = new WebKitCSSMatrix(window.getComputedStyle(rowRef.current).transform).m41;

      if (currentTransform < -DELETE_THRESHOLD) {
        // Trigger delete confirm or state
        onRowDelete(row.original);
        rowRef.current.style.transform = 'translateX(0)';
      } else if (currentTransform < -SWIPE_THRESHOLD / 2) {
        // Maybe keep open? For now, snap back as we trigger delete dialog immediately
        rowRef.current.style.transform = 'translateX(0)';
      } else {
        rowRef.current.style.transform = 'translateX(0)';
      }
    }

    setOffset(0);
    isSwiping.current = false;
    isScrolling.current = false;
  };

  return (
    <TableRow
      ref={rowRef}
      data-state={row.getIsSelected() && 'selected'}
      className={cn(
        'group relative transition-colors duration-200',
        onRowClick && 'cursor-pointer hover:bg-muted/50 active:bg-muted'
      )}
      onClick={(e) => onRowClick?.(row.original, e)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {onRowDelete && (
        <TableCell className='w-12 p-0 sticky left-0 bg-background z-10'>
          <div className='flex items-center justify-center h-full'>
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100'
              onClick={(e) => {
                e.stopPropagation();
                onRowDelete(row.original);
              }}
            >
              <IconTrash className='h-4 w-4' />
            </Button>
          </div>
        </TableCell>
      )}
      {row.getVisibleCells().map((cell: any, cellIndex: number) => (
        <TableCell
          key={cell.id}
          className={cn(
            cellIndex === 0 && onRowDelete && 'sticky left-12 bg-background z-10'
          )}
        >
          {flexRender(
            cell.column.columnDef.cell,
            cell.getContext()
          )}
        </TableCell>
      ))}
    </TableRow>
  );
}

export function DataTable<TData>({
  table,
  onRowClick,
  onRowDelete,
  className
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

  const handleDeleteRequest = useCallback((row: TData) => {
    setRowToDelete(row);
    setDeleteDialogOpen(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (rowToDelete && onRowDelete) {
      onRowDelete(rowToDelete);
    }
    setDeleteDialogOpen(false);
    setRowToDelete(null);
  }, [rowToDelete, onRowDelete]);

  return (
    <>
      <div className='flex flex-col space-y-4 w-full'>
        <div className='rounded-md border bg-background'>
          <ScrollArea className='h-[calc(100vh-22rem)] w-full'>
            <div className="w-max min-w-full inline-block align-middle">
              <Table>
                <TableHeader className='bg-muted/80 backdrop-blur-sm sticky top-0 z-20 shadow-sm'>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id} className='hover:bg-transparent border-b'>
                      {onRowDelete && (
                        <TableHead className='w-12 sticky left-0 bg-muted/95 backdrop-blur z-30'>
                          <span className='sr-only'>Actions</span>
                        </TableHead>
                      )}
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id} colSpan={header.colSpan} className="whitespace-nowrap">
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
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
                    <TableRow>
                      <TableCell
                        colSpan={table.getAllColumns().length + (onRowDelete ? 1 : 0)}
                        className='h-24 text-center'
                      >
                        <div className='flex flex-col items-center justify-center gap-2 text-muted-foreground'>
                          <p className='text-sm font-medium'>No results found</p>
                          <p className='text-xs'>Try adjusting your filters or search terms</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <ScrollBar orientation='horizontal' />
          </ScrollArea>
        </div>

        <DataTablePagination table={table} />
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