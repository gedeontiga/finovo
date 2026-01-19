// Create this new file to centralize all text constants

export const APP_TEXTS = {
  dashboard: {
    overview: {
      title: 'Budget Overview',
      ae: {
        label: 'Authorized (AE)',
        description: 'Total approved envelope'
      },
      cp: {
        label: 'Credits (CP)',
        description: 'Available payment credits'
      },
      executed: {
        label: 'Execution Rate',
        description: 'Budget execution percentage'
      },
      lines: {
        label: 'Budget Lines',
        description: 'Active items'
      }
    }
  },
  charts: {
    areaGraph: {
      title: 'Area Chart - Stacked',
      description: 'Showing total visitors for the last 6 months',
      footer: {
        trend: 'Trending up by 5.2% this month',
        period: 'January - June 2024'
      }
    },
    barGraph: {
      title: 'Bar Chart - Interactive',
      descriptionLong: 'Total for the last 3 months',
      descriptionShort: 'Last 3 months'
    },
    pieGraph: {
      title: 'Pie Chart - Donut with Text',
      descriptionLong: 'Total visitors by browser for the last 6 months',
      descriptionShort: 'Browser distribution',
      footer: {
        trend: 'Chrome leads with',
        period: 'Based on data from January - June 2024'
      }
    }
  },
  profile: {
    title: 'Dashboard : Profile'
  }
};