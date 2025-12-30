'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardList from '@/components/ui/DashboardList';
import { Loader2 } from 'lucide-react';

interface Dashboard {
  _id: string;
  name: string;
  description?: string;
  isDemo?: boolean;
  updatedAt: string;
  datasetId?: { name: string };
}

export default function DashboardOverviewPage() {
  const queryClient = useQueryClient();

  const { data: dashboards = [], isLoading, error } = useQuery<Dashboard[]>({
    queryKey: ['dashboards'],
    queryFn: async () => {
      const res = await fetch('/api/dashboards');
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      
      const tempDemo: Dashboard = {
        _id: 'demo',
        name: 'Instant Preview (Demo)',
        description: 'Try the dashboard and AI features without saving any data.',
        isDemo: true,
        updatedAt: new Date().toISOString(),
        datasetId: { name: 'Sample Sales Data' }
      };
      
      return [tempDemo, ...data];
    },
  });

  const deleteMutation = useMutation<string, Error, string, { previousDashboards: Dashboard[] | undefined }>({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/dashboards/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      return id;
    },
    // Optimistic Update
    onMutate: async (id) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['dashboards'] });
      // Snapshot the previous value
      const previousDashboards = queryClient.getQueryData<Dashboard[]>(['dashboards']);
      // Optimistically update to the new value
      queryClient.setQueryData(['dashboards'], (old: Dashboard[] | undefined) => 
        old ? old.filter((d) => d._id !== id) : []
      );
      // Return a context object with the snapshotted value
      return { previousDashboards };
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (_err, _id, context) => {
      if (context?.previousDashboards) {
        queryClient.setQueryData(['dashboards'], context.previousDashboards);
      }
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboards'] });
    },
  });

  const handleDeleteDashboard = (id: string) => {
    deleteMutation.mutate(id);
  };

  if (isLoading) return (
    <div className="flex h-64 items-center justify-center">
      <Loader2 className="animate-spin text-blue-500" />
    </div>
  );

  if (error) return (
    <div className="p-8 text-center text-red-400 bg-red-500/10 rounded-xl border border-red-500/20">
      Error loading dashboards. Please try again.
    </div>
  );

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
