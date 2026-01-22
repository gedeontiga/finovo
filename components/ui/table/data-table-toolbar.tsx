'use client';

import type { Table } from '@tanstack/react-table';
import * as React from 'react';

import { DataTableViewOptions } from '@/components/ui/table/data-table-view-options';
import { Button } from '@/components/ui/button';
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

  const onReset = React.useCallback(() => {
    table.resetColumnFilters();
    table.resetSorting();
    table.setPageIndex(0);
  }, [table]);

  return (
    <div
      className={cn('flex items-center justify-between gap-4', className)}
      {...props}
    >
      <div className='flex flex-1 items-center gap-2'>
        {isFiltered && (
          <Button
            aria-label='Reset filters'
            variant='outline'
            size='sm'
            onClick={onReset}
            className='gap-2'
          >
            <Cross2Icon className='h-4 w-4' />
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