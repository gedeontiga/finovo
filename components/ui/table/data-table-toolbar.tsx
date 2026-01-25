'use client';

import type { Table } from '@tanstack/react-table';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { X, Search, Settings2 } from 'lucide-react';
import { IconFilter, IconFilterOff } from '@tabler/icons-react';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DataTableToolbarProps<TData> extends React.ComponentProps<'div'> {
  table: Table<TData>;
  searchKey?: string;
}

export function DataTableToolbar<TData>({
  table,
  searchKey,
  children,
  className,
  ...props
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const [searchValue, setSearchValue] = React.useState('');

  const onReset = React.useCallback(() => {
    table.resetColumnFilters();
    table.resetSorting();
    table.setPageIndex(0);
    setSearchValue('');
  }, [table]);

  const handleSearch = React.useCallback((value: string) => {
    setSearchValue(value);
    if (searchKey) {
      table.getColumn(searchKey)?.setFilterValue(value);
    }
  }, [table, searchKey]);

  return (
    <div
      className={cn('flex flex-col gap-4', className)}
      {...props}
    >
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
        {searchKey && (
          <div className='relative flex-1 max-w-sm w-full sm:w-auto'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Search...'
              value={searchValue}
              onChange={(e) => handleSearch(e.target.value)}
              className='pl-9 h-9'
            />
            {searchValue && (
              <Button
                variant='ghost'
                size='icon'
                className='absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7'
                onClick={() => handleSearch('')}
              >
                <X className='h-3 w-3' />
              </Button>
            )}
          </div>
        )}

        <div className='flex items-center gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap'>
          {/* Column Visibility Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='outline'
                size='sm'
                className='h-9 gap-2'
              >
                <Settings2 className='h-4 w-4' />
                <span className='hidden sm:inline'>Columns</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-45'>
              <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== 'undefined' && column.getCanHide()
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className='capitalize'
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.columnDef.meta?.label || column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>

          {isFiltered && (
            <Button
              variant='outline'
              size='sm'
              onClick={onReset}
              className='h-9 gap-2'
            >
              <IconFilterOff className='h-4 w-4' />
              <span className='hidden sm:inline'>Reset</span>
            </Button>
          )}

          {children}
        </div>
      </div>

      {isFiltered && (
        <div className='flex flex-wrap items-center gap-2'>
          <div className='flex items-center gap-2 text-sm text-muted-foreground'>
            <IconFilter className='h-4 w-4' />
            <span>Active filters:</span>
          </div>
          {table.getState().columnFilters.map((filter) => {
            const column = table.getColumn(filter.id);
            const columnLabel = column?.columnDef.meta?.label || filter.id;

            return (
              <div
                key={filter.id}
                className='flex items-center gap-1 px-2 py-1 rounded-md bg-muted text-sm'
              >
                <span className='font-medium'>{columnLabel}:</span>
                <span className='text-muted-foreground truncate max-w-37.5'>{String(filter.value)}</span>
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-4 w-4 ml-1 hover:bg-background'
                  onClick={() => column?.setFilterValue(undefined)}
                >
                  <X className='h-3 w-3' />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}