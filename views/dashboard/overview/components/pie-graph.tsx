'use client';

import * as React from 'react';
import { IconTrendingUp } from '@tabler/icons-react';
import { Label, Pie, PieChart } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import { APP_TEXTS } from '@/lib/constants';
import { useThemeConfig } from '@/components/active-theme';

const chartData = [
  { browser: 'chrome', visitors: 275, fill: 'var(--primary)' },
  { browser: 'safari', visitors: 200, fill: 'var(--primary)' },
  { browser: 'firefox', visitors: 287, fill: 'var(--primary)' },
  { browser: 'edge', visitors: 173, fill: 'var(--primary)' },
  { browser: 'other', visitors: 190, fill: 'var(--primary)' }
];

const chartConfig = {
  visitors: {
    label: 'Visitors'
  },
  chrome: {
    label: 'Chrome',
    color: 'var(--primary)'
  },
  safari: {
    label: 'Safari',
    color: 'var(--primary)'
  },
  firefox: {
    label: 'Firefox',
    color: 'var(--primary)'
  },
  edge: {
    label: 'Edge',
    color: 'var(--primary)'
  },
  other: {
    label: 'Other',
    color: 'var(--primary)'
  }
} satisfies ChartConfig;

export function PieGraph() {
  const { activeTheme } = useThemeConfig();

  const totalVisitors = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.visitors, 0);
  }, []);

  return (
    <Card className='@container/card'>
      <CardHeader>
        <CardTitle>{APP_TEXTS.charts.pieGraph.title}</CardTitle>
        <CardDescription>
          <span className='hidden @[540px]/card:block'>
            {APP_TEXTS.charts.pieGraph.descriptionLong}
          </span>
          <span className='@[540px]/card:hidden'>
            {APP_TEXTS.charts.pieGraph.descriptionShort}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
        <ChartContainer
          config={chartConfig}
          className='mx-auto aspect-square h-62.5'
        >
          <PieChart>
            <defs>
              {['chrome', 'safari', 'firefox', 'edge', 'other'].map(
                (browser, index) => (
                  <linearGradient
                    key={browser}
                    id={`fill${browser}`}
                    x1='0'
                    y1='0'
                    x2='0'
                    y2='1'
                  >
                    <stop
                      offset='0%'
                      stopColor='var(--primary)'
                      stopOpacity={1 - index * 0.12}
                    />
                    <stop
                      offset='100%'
                      stopColor='var(--primary)'
                      stopOpacity={0.75 - index * 0.12}
                    />
                  </linearGradient>
                )
              )}
            </defs>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData.map((item, index) => ({
                ...item,
                fill: `url(#fill${item.browser})`
              }))}
              dataKey='visitors'
              nameKey='browser'
              innerRadius={60}
              strokeWidth={2}
              stroke='var(--background)'
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
                          {totalVisitors.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className='fill-muted-foreground text-sm'
                        >
                          Total Visitors
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
      <CardFooter className='flex-col gap-2 text-sm'>
        <div className='flex items-center gap-2 leading-none font-medium'>
          {APP_TEXTS.charts.pieGraph.footer.trend}{' '}
          <IconTrendingUp className='h-4 w-4' />
        </div>
        <div className='text-muted-foreground leading-none'>
          {APP_TEXTS.charts.pieGraph.footer.period}
        </div>
      </CardFooter>
    </Card>
  );
}