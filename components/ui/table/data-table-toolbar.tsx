'use client';

import type { Column, Table } from '@tanstack/react-table';
import * as React from 'react';

import { DataTableViewOptions } from '@/components/ui/table/data-table-view-options';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Cross2Icon } from '@radix-ui/react-icons';
import { ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DataTableToolbarProps<TData> extends React.ComponentProps<'div'> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({
  table,
  children,
  className,
  ...props
}: DataTableToolbarProps<TData>) {
  const [showFilters, setShowFilters] = React.useState(false);
  const isFiltered = table.getState().columnFilters.length > 0;

  const filterableColumns = React.useMemo(
    () => table.getAllColumns().filter((column) => {
      const meta = column.columnDef.meta as any;
      return column.columnDef.enableColumnFilter && meta?.filterable;
    }),
    [table]
  );

  const onReset = React.useCallback(() => {
    table.resetColumnFilters();
    table.resetSorting();
    table.setPageIndex(0);
  }, [table]);

  return (
    <div
      role='toolbar'
      aria-orientation='horizontal'
      className={cn('flex flex-col gap-4', className)}
      {...props}
    >
      {/* Top Action Bar */}
      <div className='flex w-full items-center justify-between gap-4'>
        <div className='flex flex-1 items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setShowFilters(!showFilters)}
            className='gap-2'
          >
            <SlidersHorizontal className='h-4 w-4' />
            Filters
            {showFilters ? (
              <ChevronUp className='h-4 w-4' />
            ) : (
              <ChevronDown className='h-4 w-4' />
            )}
            {isFiltered && (
              <Badge variant='secondary' className='ml-1 rounded-sm px-1'>
                {table.getState().columnFilters.length}
              </Badge>
            )}
          </Button>

          {isFiltered && (
            <Button
              aria-label='Reset filters'
              variant='outline'
              size='sm'
              onClick={onReset}
              className='gap-2'
            >
              <Cross2Icon className='h-4 w-4' />
              Clear All
            </Button>
          )}
        </div>

        <div className='flex items-center gap-2'>
          {children}
          <DataTableViewOptions table={table} />
        </div>
      </div>

      {/* Collapsible Filter Grid */}
      {showFilters && filterableColumns.length > 0 && (
        <div className='rounded-lg border bg-muted/50 p-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
            {filterableColumns.map((column) => (
              <DataTableColumnFilter key={column.id} column={column} table={table} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface DataTableColumnFilterProps<TData> {
  column: Column<TData>;
  table: Table<TData>;
}

function DataTableColumnFilter<TData>({
  column,
  table
}: DataTableColumnFilterProps<TData>) {
  const columnMeta = column.columnDef.meta as any;

  if (!columnMeta?.filterable) return null;

  const currentValue = (column.getFilterValue() as string) ?? '';

  const handleChange = (value: string) => {
    column.setFilterValue(value || undefined);
    // Reset to page 1 when filtering
    table.setPageIndex(0);
  };

  const handleClear = () => {
    column.setFilterValue(undefined);
    table.setPageIndex(0);
  };

  return (
    <div className='space-y-2'>
      <div className='flex items-center justify-between'>
        <label className='text-sm font-medium text-foreground'>
          {columnMeta.label}
        </label>
        {currentValue && (
          <Button
            variant='ghost'
            size='sm'
            onClick={handleClear}
            className='h-6 px-2 text-xs'
          >
            Clear
          </Button>
        )}
      </div>
      <Input
        type={columnMeta.filterVariant === 'number' ? 'number' : 'text'}
        placeholder={`Filter ${columnMeta.label?.toLowerCase()}...`}
        value={currentValue}
        onChange={(e) => handleChange(e.target.value)}
        className='h-9'
      />
    </div>
  );
}