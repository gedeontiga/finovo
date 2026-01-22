import { type Table as TanstackTable, flexRender } from '@tanstack/react-table';
import type * as React from 'react';
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

export function DataTable<TData>({
  table,
  onRowClick,
  onRowDelete,
  className
}: DataTableProps<TData>) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState<TData | null>(null);
  const [swipedRowId, setSwipedRowId] = useState<string | null>(null);
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent, rowId: string) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent, rowId: string) => {
    if (!touchStartX.current) return;

    const touchEndX = e.touches[0].clientX;
    const touchEndY = e.touches[0].clientY;
    const deltaX = touchStartX.current - touchEndX;
    const deltaY = touchStartY.current - touchEndY;

    // Only trigger if horizontal swipe is more significant than vertical
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        setSwipedRowId(rowId);
      } else {
        setSwipedRowId(null);
      }
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    touchStartX.current = 0;
    touchStartY.current = 0;
  }, []);

  const handleDeleteClick = useCallback((row: TData, e: React.MouseEvent) => {
    e.stopPropagation();
    setRowToDelete(row);
    setDeleteDialogOpen(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (rowToDelete && onRowDelete) {
      onRowDelete(rowToDelete);
      setDeleteDialogOpen(false);
      setRowToDelete(null);
      setSwipedRowId(null);
    }
  }, [rowToDelete, onRowDelete]);

  return (
    <>
      <div className='flex flex-col space-y-4'>
        <div className='rounded-lg border overflow-hidden'>
          <ScrollArea className='h-[calc(100vh-28rem)] w-full'>
            <div className='min-w-full'>
              <Table>
                <TableHeader className='bg-muted/80 backdrop-blur-sm sticky top-0 z-20 shadow-sm'>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id} className='hover:bg-transparent'>
                      {onRowDelete && (
                        <TableHead className='w-12 sticky left-0 bg-muted/80 backdrop-blur-sm z-10'>
                          <div className='flex items-center justify-center'>
                            <IconGripVertical className='h-4 w-4 text-muted-foreground' />
                          </div>
                        </TableHead>
                      )}
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id} colSpan={header.colSpan}>
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
                    table.getRowModel().rows.map((row, index) => {
                      const rowId = `row-${index}`;
                      const isSwipedRow = swipedRowId === rowId;

                      return (
                        <TableRow
                          key={row.id}
                          data-state={row.getIsSelected() && 'selected'}
                          className={cn(
                            'group relative transition-all duration-200',
                            onRowClick && 'cursor-pointer hover:bg-muted/50 active:bg-muted',
                            isSwipedRow && '-translate-x-20'
                          )}
                          onClick={(e) => onRowClick?.(row.original, e)}
                          onTouchStart={(e) => isMobile && handleTouchStart(e, rowId)}
                          onTouchMove={(e) => isMobile && handleTouchMove(e, rowId)}
                          onTouchEnd={handleTouchEnd}
                        >
                          {onRowDelete && (
                            <TableCell className='w-12 p-0 sticky left-0 bg-background z-10'>
                              <div className='flex items-center justify-center h-full'>
                                <div className={cn(
                                  'flex items-center justify-center w-8 h-8 rounded text-muted-foreground',
                                  'transition-all duration-200',
                                  'md:opacity-0 md:group-hover:opacity-100',
                                  'hover:bg-destructive/10 hover:text-destructive'
                                )}>
                                  {isMobile ? (
                                    <span className='text-xs font-mono'>{index + 1}</span>
                                  ) : (
                                    <Button
                                      variant='ghost'
                                      size='icon'
                                      className='h-8 w-8 delete-trigger hover:bg-destructive/10 hover:text-destructive'
                                      onClick={(e) => handleDeleteClick(row.original, e)}
                                    >
                                      <IconTrash className='h-4 w-4' />
                                    </Button>
                                  )}
                                </div>
                              </div>
                              {isMobile && isSwipedRow && (
                                <div className='absolute left-full top-0 h-full w-20 flex items-center justify-center bg-destructive'>
                                  <Button
                                    variant='ghost'
                                    size='icon'
                                    className='h-full w-full text-destructive-foreground hover:bg-destructive hover:text-destructive-foreground'
                                    onClick={(e) => handleDeleteClick(row.original, e)}
                                  >
                                    <IconTrash className='h-5 w-5' />
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          )}
                          {row.getVisibleCells().map((cell, cellIndex) => (
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
                    })
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

        {isMobile && (
          <div className='text-xs text-muted-foreground text-center py-2 bg-muted/30 rounded-md'>
            <p className='flex items-center justify-center gap-2'>
              <span>💡</span>
              <span>Swipe left on a row to delete</span>
            </p>
          </div>
        )}

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