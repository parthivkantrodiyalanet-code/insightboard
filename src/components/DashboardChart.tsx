'use client';

import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';

interface DashboardChartProps {
  chartData: any;
}

/* Component */
export default function DashboardChart({ chartData }: DashboardChartProps) {
  const { type, datasetId, xAxisKey, yAxisKey, color, title } = chartData;
  const data = datasetId?.data || [];
  
  /* Error Handling */
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-64 text-slate-500">No Data Available</div>;
  }

  /* Render Logic */
  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey={xAxisKey} stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
            />
            <Bar dataKey={yAxisKey} fill={color || '#3b82f6'} radius={[4, 4, 0, 0]} />
          </BarChart>
        );
      case 'line':
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey={xAxisKey} stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
            />
            <Line type="monotone" dataKey={yAxisKey} stroke={color || '#8b5cf6'} strokeWidth={3} dot={{r: 4, fill: '#1e293b'}} activeDot={{ r: 6 }} />
          </LineChart>
        );
       case 'area':
        return (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey={xAxisKey} stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
            />
            <Area type="monotone" dataKey={yAxisKey} stroke={color || '#f43f5e'} fill={color || '#f43f5e'} fillOpacity={0.3} />
          </AreaChart>
        );
      default:
        return <div className="text-center text-slate-500 mt-10">Unsupported Chart Type</div>;
    }
  };

  return (
    <div className="glass-card p-6 h-[400px] flex flex-col">
      <h3 className="text-lg font-semibold mb-4 text-slate-200">{title}</h3>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height={300}>
  {renderChart()}
</ResponsiveContainer>

      </div>
    </div>
  );
}
