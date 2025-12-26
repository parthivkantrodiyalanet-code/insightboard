'use client';

import { useEffect, useState } from 'react';
import DashboardList from '@/components/DashboardList';
import { Loader2 } from 'lucide-react';

export default function DashboardOverviewPage() {
  const [dashboards, setDashboards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboards();
  }, []);

  const fetchDashboards = async () => {
    try {
      const res = await fetch('/api/dashboards', { method: 'GET' });
      console.log(res);
      if (res.ok) {
        const data = await res.json();
        setDashboards(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDashboard = async (id: string) => {
      try {
          await fetch(`/api/dashboards/${id}`, { method: 'DELETE' });
          // Ideally check for response ok
          setDashboards(dashboards.filter(d => d._id !== id));
      } catch (error) {
          console.error('Failed to delete', error);
      }
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-blue-500" /></div>;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
          Your Dashboards
        </h2>
        <p className="text-slate-400 mt-2">Manage your analytics projects</p>
      </div>
      
      <DashboardList dashboards={dashboards} onDelete={handleDeleteDashboard} />
    </div>
  );
}
