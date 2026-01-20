'use client';

import * as React from 'react';
import { Label, Pie, PieChart } from 'recharts';
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

interface PieGraphProps {
  data: Array<{
    browser: string;
    visitors: number;
    fill: string;
  }>;
}

export function BudgetPieGraph({ data }: PieGraphProps) {
  const chartConfig: ChartConfig = {
    visitors: {
      label: 'Budget (XAF)'
    }
  };

  const totalVisitors = React.useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.visitors, 0);
  }, [data]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('fr-FR', {
      notation: 'compact',
      compactDisplay: 'short',
      maximumFractionDigits: 1
    }).format(value);

  return (
    <Card className='@container/card'>
      <CardHeader>
        <CardTitle>Budget by Administrative Unit</CardTitle>
        <CardDescription>
          <span className='hidden @[540px]/card:block'>
            Distribution of authorized budget across top units
          </span>
          <span className='@[540px]/card:hidden'>
            Unit distribution
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
        <ChartContainer
          config={chartConfig}
          className='mx-auto aspect-square h-62.5'
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value, name) => (
                    <>
                      <div className='text-xs text-muted-foreground'>
                        {String(name).toUpperCase()}
                      </div>
                      <div className='font-bold'>
                        {formatCurrency(Number(value))} XAF
                      </div>
                    </>
                  )}
                />
              }
            />
            <Pie
              data={data}
              dataKey='visitors'
              nameKey='browser'
              innerRadius={60}
              strokeWidth={2}
              stroke='hsl(var(--background))'
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor='middle'
                        dominantBaseline='middle'
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className='fill-foreground text-3xl font-bold'
                        >
                          {formatCurrency(totalVisitors)}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className='fill-muted-foreground text-sm'
                        >
                          Total XAF
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}