export const homeLayoutStorageKey = 'direct-sales-dashboard-home-layout'

export const defaultHomeLayout = {
  grid: { cols: 4, rows: 6 },
  items: [
    {
      cellId: '0,0',
      componentId: 'metric-overview',
      componentName: '经营概览',
      component: 'BSCOverview',
      width: 4,
      height: 1
    },
    {
      cellId: '0,1',
      componentId: 'metric-finance',
      componentName: '核心财务指标',
      component: 'CoreFinanceCards',
      width: 4,
      height: 3
    },
    {
      cellId: '0,4',
      componentId: 'metric-customer',
      componentName: '核心客户指标',
      component: 'CoreCustomerMetrics',
      width: 2,
      height: 2
    },
    {
      cellId: '2,4',
      componentId: 'chart-alert',
      componentName: '预警中心',
      component: 'AlertCenter',
      width: 2,
      height: 2
    }
  ]
}

export const cloneHomeLayout = (layout = defaultHomeLayout) => JSON.parse(JSON.stringify(layout))

