'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlusCircle, MoreVertical, Edit2, Trash2, Layout } from 'lucide-react';

export default function DashboardList({ dashboards }: { dashboards: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if(!confirm('Are you sure you want to delete this dashboard?')) return;
    
    await fetch(`/api/dashboards/${id}`, { method: 'DELETE' });
    router.refresh();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Create New Card */}
      <div 
        onClick={() => router.push('/dashboard/new')}
        className="glass-card p-6 flex flex-col items-center justify-center min-h-[200px] border-dashed border-2 border-slate-700 hover:border-blue-500 cursor-pointer group transition-colors"
      >
        <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform mb-4">
          <PlusCircle size={32} />
        </div>
        <h3 className="text-lg font-semibold text-slate-200">Create New Dashboard</h3>
        <p className="text-slate-500 text-sm mt-1">Start from scratch with Excel</p>
      </div>

      {dashboards.map((dash) => (
        <div 
          key={dash._id}
          onClick={() => router.push(`/dashboard/${dash._id}`)}
          className="glass-card p-6 flex flex-col justify-between min-h-[200px] cursor-pointer hover:bg-slate-800/50 transition-colors group relative"
        >
          <div className="flex justify-between items-start">
            <div className="p-3 bg-indigo-500/10 rounded-lg text-indigo-400">
              <Layout size={24} />
            </div>
            <div className="dropdown relative group-hover:block">
              {/* Simple action menu triggers could go here */}
               <button 
                  onClick={(e) => handleDelete(e, dash._id)}
                  className="p-2 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
                  title="Delete Dashboard"
                >
                  <Trash2 size={18} />
                </button>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-white mb-1">{dash.name}</h3>
            <p className="text-slate-400 text-sm truncate">
              {dash.datasetId ? `Linked to: ${dash.datasetId.name}` : 'No dataset linked'}
            </p>
            <p className="text-slate-600 text-xs mt-4">
              Last updated: {new Date(dash.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
