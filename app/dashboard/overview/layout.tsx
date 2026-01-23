import PageContainer from '@/components/layout/page-container';
import { getBudgetSummary } from '@/actions/dashboard-analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IconCoin, IconActivity, IconChartPie, IconTrendingUp } from '@tabler/icons-react';
import { Progress } from '@/components/ui/progress';
import { APP_TEXTS } from '@/lib/constants';

export default async function OverviewLayout({
  bar_stats
}: {
  children: React.ReactNode;
  bar_stats: React.ReactNode;
}) {
  const stats = await getBudgetSummary();

  const fmt = (n: number) => new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'FCFA',
    maximumSignificantDigits: 3
  }).format(n);

  const fmtCompact = (n: number) => new Intl.NumberFormat('fr-FR', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1
  }).format(n);

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-6'>
        <div className='flex items-center justify-between space-y-2'>
          <div>
            <h2 className='text-3xl font-bold tracking-tight bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent'>
              {APP_TEXTS.dashboard.overview.title}
            </h2>
            <p className='text-muted-foreground text-sm mt-1'>
              Real-time budget monitoring and execution tracking
            </p>
          </div>
        </div>

        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
          {/* Authorized Envelope (AE) */}
          <Card className='relative overflow-hidden border-border/50 hover:shadow-lg transition-shadow'>
            <div className='absolute top-0 right-0 w-24 h-24 bg-linear-to-br from-blue-500/10 to-blue-600/5 rounded-bl-full' />
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                {APP_TEXTS.dashboard.overview.ae.label}
              </CardTitle>
              <div className='p-2 bg-blue-100 dark:bg-blue-950 rounded-lg'>
                <IconCoin className='h-4 w-4 text-blue-600 dark:text-blue-400' />
              </div>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-blue-600 dark:text-blue-400 tabular-nums'>
                {fmtCompact(stats.ae)} FCFA
              </div>
              <p className='text-xs text-muted-foreground mt-1'>
                {APP_TEXTS.dashboard.overview.ae.description}
              </p>
            </CardContent>
          </Card>

          {/* Payment Credits (CP) */}
          <Card className='relative overflow-hidden border-border/50 hover:shadow-lg transition-shadow'>
            <div className='absolute top-0 right-0 w-24 h-24 bg-linear-to-br from-purple-500/10 to-purple-600/5 rounded-bl-full' />
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                {APP_TEXTS.dashboard.overview.cp.label}
              </CardTitle>
              <div className='p-2 bg-purple-100 dark:bg-purple-950 rounded-lg'>
                <IconChartPie className='h-4 w-4 text-purple-600 dark:text-purple-400' />
              </div>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-purple-600 dark:text-purple-400 tabular-nums'>
                {fmtCompact(stats.cp)} FCFA
              </div>
              <p className='text-xs text-muted-foreground mt-1'>
                {APP_TEXTS.dashboard.overview.cp.description}
              </p>
            </CardContent>
          </Card>

          {/* Execution Rate */}
          <Card className='relative overflow-hidden border-border/50 hover:shadow-lg transition-shadow'>
            <div className={`absolute top-0 right-0 w-24 h-24 bg-linear-to-br rounded-bl-full ${stats.executionRate > 90
              ? 'from-red-500/10 to-red-600/5'
              : stats.executionRate > 70
                ? 'from-amber-500/10 to-amber-600/5'
                : 'from-green-500/10 to-green-600/5'
              }`} />
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                {APP_TEXTS.dashboard.overview.executed.label}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stats.executionRate > 90
                ? 'bg-red-100 dark:bg-red-950'
                : stats.executionRate > 70
                  ? 'bg-amber-100 dark:bg-amber-950'
                  : 'bg-green-100 dark:bg-green-950'
                }`}>
                <IconActivity className={`h-4 w-4 ${stats.executionRate > 90
                  ? 'text-red-600 dark:text-red-400'
                  : stats.executionRate > 70
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-green-600 dark:text-green-400'
                  }`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold tabular-nums ${stats.executionRate > 90
                ? 'text-red-600 dark:text-red-400'
                : stats.executionRate > 70
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-green-600 dark:text-green-400'
                }`}>
                {stats.executionRate.toFixed(2)}%
              </div>
              <Progress
                value={Math.min(stats.executionRate, 100)}
                className={`mt-2 h-2.5 ${stats.executionRate > 90
                  ? 'bg-red-100 dark:bg-red-950'
                  : stats.executionRate > 70
                    ? 'bg-amber-100 dark:bg-amber-950'
                    : 'bg-green-100 dark:bg-green-950'
                  }`}
              />
              <p className='text-xs text-muted-foreground mt-2'>
                {fmtCompact(stats.disponible)} FCFA available
              </p>
            </CardContent>
          </Card>

          {/* Budget Lines Count */}
          <Card className='relative overflow-hidden border-border/50 hover:shadow-lg transition-shadow'>
            <div className='absolute top-0 right-0 w-24 h-24 bg-linear-to-br from-indigo-500/10 to-indigo-600/5 rounded-bl-full' />
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                {APP_TEXTS.dashboard.overview.lines.label}
              </CardTitle>
              <div className='p-2 bg-indigo-100 dark:bg-indigo-950 rounded-lg'>
                <IconTrendingUp className='h-4 w-4 text-indigo-600 dark:text-indigo-400' />
              </div>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-indigo-600 dark:text-indigo-400 tabular-nums'>
                {stats.linesCount.toLocaleString('fr-FR')}
              </div>
              <p className='text-xs text-muted-foreground mt-1'>
                {APP_TEXTS.dashboard.overview.lines.description}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Bar stats render here */}
        <div className='space-y-4'>
          {bar_stats}
        </div>
      </div>
    </PageContainer>
  );
}