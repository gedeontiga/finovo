'use client';

import type { Column, Table } from '@tanstack/react-table';
import * as React from 'react';

import { DataTableViewOptions } from '@/components/ui/table/data-table-view-options';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Cross2Icon } from '@radix-ui/react-icons';

interface DataTableToolbarProps<TData> extends React.ComponentProps<'div'> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({
  table,
  children,
  className,
  ...props
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  const columns = React.useMemo(
    () => table.getAllColumns().filter((column) => {
      const meta = column.columnDef.meta as any;
      return column.columnDef.enableColumnFilter && meta?.variant;
    }),
    [table]
  );

  const onReset = React.useCallback(() => {
    table.resetColumnFilters();
    table.resetSorting();
    table.resetPageIndex();
  }, [table]);

  return (
    <div
      role='toolbar'
      aria-orientation='horizontal'
      className={cn(
        'flex w-full items-center justify-between gap-4 p-4 bg-muted/50 rounded-lg border',
        className
      )}
      {...props}
    >
      <div className='flex flex-1 flex-wrap items-center gap-3'>
        {columns.map((column) => (
          <DataTableToolbarFilter key={column.id} column={column} table={table} />
        ))}
        {isFiltered && (
          <Button
            aria-label='Reset filters'
            variant='outline'
            size='sm'
            className='h-8'
            onClick={onReset}
          >
            <Cross2Icon className='mr-2' />
            Reset
          </Button>
        )}
      </div>
      <div className='flex items-center gap-2'>
        {children}
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}

interface DataTableToolbarFilterProps<TData> {
  column: Column<TData>;
  table: Table<TData>;
}

function DataTableToolbarFilter<TData>({
  column,
  table
}: DataTableToolbarFilterProps<TData>) {
  const columnMeta = column.columnDef.meta as any;

  if (!columnMeta?.variant) return null;

  const currentValue = (column.getFilterValue() as string) ?? '';

  const handleChange = (value: string) => {
    column.setFilterValue(value || undefined);
    // Reset page to 1 when filtering
    table.setPageIndex(0);
  };

  return (
    <div className='flex items-center gap-2'>
      <label className='text-xs font-medium text-muted-foreground whitespace-nowrap'>
        {columnMeta.label}:
      </label>
      <Input
        type={columnMeta.variant === 'number' ? 'number' : 'text'}
        placeholder={columnMeta.placeholder || 'Filter...'}
        value={currentValue}
        onChange={(e) => handleChange(e.target.value)}
        className='h-8 w-40'
      />
    </div>
  );
}
