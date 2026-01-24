import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Heading } from '../ui/heading';
import type { InfobarContent } from '@/components/ui/infobar';
import { ShieldAlert } from 'lucide-react';

function PageSkeleton() {
  return (
    <div className='flex flex-1 animate-pulse flex-col gap-4 p-4 md:px-6'>
      <div className='flex items-center justify-between'>
        <div>
          <div className='bg-muted mb-2 h-8 w-48 rounded-lg' />
          <div className='bg-muted h-4 w-96 rounded-lg' />
        </div>
      </div>
      <div className='bg-muted/50 mt-6 h-40 w-full rounded-xl backdrop-blur' />
      <div className='bg-muted/50 h-40 w-full rounded-xl backdrop-blur' />
    </div>
  );
}

export default function PageContainer({
  children,
  scrollable = true,
  isloading = false,
  access = true,
  accessFallback,
  pageTitle,
  pageDescription,
  infoContent,
  pageHeaderAction
}: {
  children: React.ReactNode;
  scrollable?: boolean;
  isloading?: boolean;
  access?: boolean;
  accessFallback?: React.ReactNode;
  pageTitle?: string;
  pageDescription?: string;
  infoContent?: InfobarContent;
  pageHeaderAction?: React.ReactNode;
}) {
  if (!access) {
    return (
      <div className='flex flex-1 items-center justify-center p-4 md:px-6'>
        {accessFallback ?? (
          <div className='text-center space-y-4 max-w-md'>
            <div className='flex justify-center'>
              <ShieldAlert className='w-20 h-20 text-destructive' />
            </div>
            <div className='space-y-2'>
              <h3 className='text-2xl font-bold'>Access Denied</h3>
              <p className='text-muted-foreground text-lg'>
                You do not have permission to view this page.
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  const content = isloading ? <PageSkeleton /> : children;

  return scrollable ? (
    <ScrollArea className='h-[calc(100dvh-52px)]'>
      <div className='flex flex-1 flex-col p-4 md:px-6'>
        {/* Enhanced Page Header */}
        <div className='mb-6 flex items-start justify-between'>
          <div className='space-y-1'>
            <Heading
              title={pageTitle ?? ''}
              description={pageDescription ?? ''}
              infoContent={infoContent}
            />
          </div>
          {pageHeaderAction && (
            <div className='flex items-center gap-2'>
              {pageHeaderAction}
            </div>
          )}
        </div>

        {/* Page Content with subtle background */}
        <div className='relative'>
          {/* Subtle gradient background */}
          <div className='absolute inset-0 bg-linear-to-br from-primary/2 via-transparent to-accent/2 rounded-2xl -z-10' />
          {content}
        </div>
      </div>
    </ScrollArea>
  ) : (
    <div className='flex flex-1 flex-col p-4 md:px-6'>
      {/* Enhanced Page Header */}
      <div className='mb-6 flex items-start justify-between'>
        <div className='space-y-1'>
          <Heading
            title={pageTitle ?? ''}
            description={pageDescription ?? ''}
            infoContent={infoContent}
          />
        </div>
        {pageHeaderAction && (
          <div className='flex items-center gap-2'>
            {pageHeaderAction}
          </div>
        )}
      </div>

      {/* Page Content with subtle background */}
      <div className='relative'>
        {/* Subtle gradient background */}
        <div className='absolute inset-0 bg-linear-to-br from-primary/2 via-transparent to-accent/2 rounded-2xl -z-10' />
        {content}
      </div>
    </div>
  );
}