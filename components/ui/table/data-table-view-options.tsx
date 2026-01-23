'use client';

import type { Table } from '@tanstack/react-table';
import { Settings2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>;
}

export function DataTableViewOptions<TData>({
  table
}: DataTableViewOptionsProps<TData>) {
  // Get all columns that can be hidden, excluding globalSearch
  const columns = table
    .getAllColumns()
    .filter(
      (column) =>
        column.getCanHide() &&
        column.id !== 'globalSearch' && // Explicitly exclude global search
        typeof column.accessorFn !== 'undefined'
    );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label='Toggle columns'
          variant='outline'
          size='sm'
          className='ml-auto h-9 flex gap-2'
        >
          <Settings2 className='h-4 w-4' />
          <span className="hidden sm:inline">View</span>
          <ChevronDown className='h-4 w-4 opacity-50' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-48'>
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {columns.length === 0 ? (
          <div className="p-2 text-sm text-muted-foreground text-center">
            No columns available
          </div>
        ) : (
          columns.map((column) => {
            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                className='capitalize'
                checked={column.getIsVisible()}
                onCheckedChange={(value) => {
                  column.toggleVisibility(!!value);
                }}
              >
                {column.columnDef.meta?.label ?? column.id}
              </DropdownMenuCheckboxItem>
            );
          })
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}