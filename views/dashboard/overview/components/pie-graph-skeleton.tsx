import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function PieGraphSkeleton() {
  return (
    <Card>
      <CardHeader className='flex flex-col items-stretch space-y-0 border-b p-0'>
        <div className='flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6'>
          <Skeleton className='h-6 w-45' />
          <Skeleton className='h-4 w-62.5' />
        </div>
      </CardHeader>
      <CardContent className='p-6'>
        <div className='flex h-70 items-center justify-center'>
          {/* Circular skeleton for pie chart */}
          <Skeleton className='h-75 w-75 rounded-full' />
        </div>
      </CardContent>
    </Card>
  );
}
