'use client';

import { useEffect, useState } from 'react';
import DashboardList from '@/components/DashboardList';
import { Loader2 } from 'lucide-react';

export default function DashboardOverviewPage() {
  const [dashboards, setDashboards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboards = async () => {
      try {
        const res = await fetch('/api/dashboards');
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
    fetchDashboards();
  }, []);

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-blue-500" /></div>;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
          Your Dashboards
        </h2>
        <p className="text-slate-400 mt-2">Manage your analytics projects</p>
      </div>
      
      <DashboardList dashboards={dashboards} />
    </div>
  );
}
