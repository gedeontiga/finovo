import PageContainer from '@/components/layout/page-container';
import { getBudgetSummary } from '@/actions/dashboard-analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IconCoin, IconActivity, IconChartPie } from '@tabler/icons-react';
import { Progress } from '@/components/ui/progress';
import { APP_TEXTS } from '@/lib/constants';

export default async function OverviewLayout({
  children,
  bar_stats
}: {
  children: React.ReactNode;
  bar_stats: React.ReactNode;
}) {
  const stats = await getBudgetSummary();

  const fmt = (n: number) => new Intl.NumberFormat('fr-FR', {
    style: 'currency', currency: 'XAF', maximumSignificantDigits: 3
  }).format(n);

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-center justify-between space-y-2'>
          <h2 className='text-2xl font-bold tracking-tight'>
            {APP_TEXTS.dashboard.overview.title}
          </h2>
        </div>

        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                {APP_TEXTS.dashboard.overview.ae.label}
              </CardTitle>
              <IconCoin className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{fmt(stats.ae)}</div>
              <p className='text-xs text-muted-foreground'>
                {APP_TEXTS.dashboard.overview.ae.description}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                {APP_TEXTS.dashboard.overview.cp.label}
              </CardTitle>
              <IconChartPie className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{fmt(stats.cp)}</div>
              <p className='text-xs text-muted-foreground'>
                {APP_TEXTS.dashboard.overview.cp.description}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                {APP_TEXTS.dashboard.overview.executed.label}
              </CardTitle>
              <IconActivity className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{stats.executionRate.toFixed(2)}%</div>
              <Progress value={stats.executionRate} className='mt-2 h-2' />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                {APP_TEXTS.dashboard.overview.lines.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{stats.linesCount}</div>
              <p className='text-xs text-muted-foreground'>
                {APP_TEXTS.dashboard.overview.lines.description}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Bar stats render here */}
        {bar_stats}
      </div>
    </PageContainer>
  );
}