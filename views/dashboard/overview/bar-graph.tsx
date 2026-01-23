'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';

interface BarGraphProps {
  data: Array<{
    code: string;
    name: string;
    ae: number;
    cp: number;
    engaged: number;
  }>;
}

export function BarGraph({ data }: BarGraphProps) {
  const [activeChart, setActiveChart] = React.useState<'ae' | 'engaged'>('ae');

  const chartConfig: ChartConfig = {
    ae: {
      label: 'Authorized (AE)',
      color: 'var(--primary)'
    },
    engaged: {
      label: 'Engaged',
      color: 'var(--primary)'
    }
  };

  const chartData = data.map((item) => ({
    program: item.code,
    name: item.name,
    ae: item.ae,
    engaged: item.engaged
  }));

  const total = React.useMemo(
    () => ({
      ae: data.reduce((acc, curr) => acc + curr.ae, 0),
      engaged: data.reduce((acc, curr) => acc + curr.engaged, 0)
    }),
    [data]
  );

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('fr-FR', {
      notation: 'compact',
      compactDisplay: 'short',
      maximumFractionDigits: 1
    }).format(value);

  return (
    <Card className='@container/card shadow-md border-border/50'>
      <CardHeader className='flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row'>
        <div className='flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6'>
          <CardTitle className='text-lg'>Budget by Program</CardTitle>
          <CardDescription className='text-xs'>
            <span className='hidden @[540px]/card:block'>
              Showing authorized vs engaged amounts by program
            </span>
            <span className='@[540px]/card:hidden'>
              Programs comparison
            </span>
          </CardDescription>
        </div>
        <div className='flex'>
          {(['ae', 'engaged'] as const).map((key) => (
            <button
              key={key}
              data-active={activeChart === key}
              className='data-[active=true]:bg-muted/50 relative flex flex-1 flex-col justify-center gap-1.5 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6 transition-all hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm'
              onClick={() => setActiveChart(key)}
            >
              <span className='text-xs text-muted-foreground font-medium'>
                {chartConfig[key].label}
              </span>
              <span className='text-lg font-bold leading-none sm:text-3xl tabular-nums'>
                {formatCurrency(total[key])} FCFA
              </span>
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
        <ChartContainer
          config={chartConfig}
          className='aspect-auto h-70 w-full'
        >
          <BarChart
            data={chartData}
            margin={{
              left: 12,
              right: 12,
              top: 12,
              bottom: 12
            }}
          >
            <defs>
              <linearGradient id='fillBar' x1='0' y1='0' x2='0' y2='1'>
                <stop
                  offset='0%'
                  stopColor='var(--primary)'
                  stopOpacity={0.8}
                />
                <stop
                  offset='100%'
                  stopColor='var(--primary)'
                  stopOpacity={0.2}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              className="stroke-border/50"
            />
            <XAxis
              dataKey='program'
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `P${value}`}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => formatCurrency(value)}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className='w-52 border-border/50 shadow-lg'
                  labelFormatter={(value, payload) => {
                    const item = payload?.[0]?.payload;
                    return item ? `Program ${value}: ${item.name}` : value;
                  }}
                  formatter={(value) => formatCurrency(Number(value)) + ' FCFA'}
                />
              }
            />
            <Bar
              dataKey={activeChart}
              fill='url(#fillBar)'
              radius={[6, 6, 0, 0]}
              className="transition-all hover:opacity-80 cursor-pointer"
              animationDuration={500}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}