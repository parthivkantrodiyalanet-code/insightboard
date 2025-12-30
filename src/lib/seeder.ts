import connectToDatabase from './db';
import Dataset from '@/models/Dataset';
import Dashboard from '@/models/Dashboard';
import Widget from '@/models/Widget';

export async function seedDemoData(userId: string) {
  try {
    await connectToDatabase();

    // 1. Create Demo Dataset
    const demoData = [
      { Month: 'Jan', Sales: 4000, Orders: 240, Revenue: 12000 },
      { Month: 'Feb', Sales: 3000, Orders: 221, Revenue: 9000 },
      { Month: 'Mar', Sales: 5000, Orders: 229, Revenue: 15000 },
      { Month: 'Apr', Sales: 4500, Orders: 250, Revenue: 13500 },
      
      { Month: 'May', Sales: 6000, Orders: 310, Revenue: 18000 },
      { Month: 'Jun', Sales: 5500, Orders: 280, Revenue: 16500 },
    ];

    const dataset = await Dataset.create({
      userId,
      name: 'Demo Sales Dataset',
      data: demoData,
      insights: {
        keyInsights: [
          "Sales peaked in May reaching 6,000 units.",
          "Revenue shows a steady upward trend despite a dip in February.",
          "Orders are highly correlated with marketing spend in Q2."
        ],
        risks: [
          "February saw a 25% drop in sales volume.",
          "Order fulfillment speed slowed down in May due to high volume."
        ],
        recommendations: [
          "Increase inventory for peak months like May and March.",
          "Investigate the cause of the February slump to prevent future dips.",
          "Automate order processing to handle higher volumes in Q3."
        ],
        generatedAt: new Date()
      }
    });

    // 2. Create Demo Dashboard
    const dashboard = await Dashboard.create({
      userId,
      datasetId: dataset._id,
      name: 'Demo Business Dashboard',
      description: 'Pre-configured business dashboard with key metrics.',
      isDemo: true,
    });

    // 3. Create Demo Widgets
    const widgets = [
      {
        dashboardId: dashboard._id,
        title: 'Sales by Month',
        type: 'bar',
        config: { xAxisKey: 'Month', yAxisKey: 'Sales', color: '#6366f1' },
      },
      {
        dashboardId: dashboard._id,
        title: 'Orders Trend',
        type: 'line',
        config: { xAxisKey: 'Month', yAxisKey: 'Orders', color: '#ec4899' },
      },
      {
        dashboardId: dashboard._id,
        title: 'Total Revenue',
        type: 'kpi',
        config: { column: 'Revenue', operation: 'sum', label: 'Total Revenue' },
      },
      {
        dashboardId: dashboard._id,
        title: 'Average Order Value',
        type: 'kpi',
        config: { column: 'Sales', operation: 'avg', label: 'Avg Sales' },
      },
    ];

    await Widget.insertMany(widgets);

    return { dashboardId: dashboard._id };
  } catch (error) {
    console.error('Error seeding demo data:', error);
    throw error;
  }
}
