'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Plus, Settings, FileSpreadsheet, Save, Trash2, Edit2, BarChart2, Check, X
} from 'lucide-react';
import DashboardChart from '@/components/DashboardChart';
import KPICard from '@/components/KPICard';
import * as XLSX from 'xlsx';

export default function DashboardBuilder() {
  const params = useParams();
  const router = useRouter();
  const [dashboard, setDashboard] = useState<any>(null);
  const [widgets, setWidgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  
  // Edit States
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  
  // Widget Modal
  const [showWidgetModal, setShowWidgetModal] = useState(false);
  const [widgetType, setWidgetType] = useState('bar'); // bar, line, area, kpi
  const [widgetConfig, setWidgetConfig] = useState<any>({ 
    title: '', 
    xAxis: '', 
    yAxis: '', 
    color: '#3b82f6',
    operation: 'sum' // for KPI
  });

  useEffect(() => {
    fetchDashboardDetails();
  }, []);

  const fetchDashboardDetails = async () => {
    try {
      const res = await fetch(`/api/dashboards/${params.id}`);
      if (!res.ok) throw new Error('Failed to load');
      const json = await res.json();
      setDashboard(json.dashboard);
      setNewTitle(json.dashboard.name);
      setWidgets(json.widgets);

      if (json.dashboard.datasetId) {
        // In a real app we'd fetch dataset content via API, 
        // but for now we assume dataset content is embedded or separate.
        // Let's implement a quick fetch for dataset data since our model stores it.
        // Or if the dataset is large, we'd paginate. 
        // For this demo, let's assume we can fetch it.
        // Actually, our API needs to return it.
        // Let's assume the previous step uploaded it. 
        // Note: The Dashboard model links to Dataset, Dataset has 'data'.
        // We need to fetch that 'data' to power the widgets locally.
        
        // Let's quickly add a fetch for the dataset data if not included
        // The /api/dashboards/[id] includes populate('datasetId'), but does it include the heavy 'data' field?
        // Default populate might include it if we didn't exclude it.
        if (json.dashboard.datasetId.data) {
           setData(json.dashboard.datasetId.data);
           if (json.dashboard.datasetId.data.length > 0) {
             setColumns(Object.keys(json.dashboard.datasetId.data[0]));
           }
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTitle = async () => {
    try {
      await fetch(`/api/dashboards/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTitle })
      });
      setIsEditingTitle(false);
      setDashboard({ ...dashboard, name: newTitle });
    } catch (e) {
      console.error(e);
    }
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const jsonData = XLSX.utils.sheet_to_json(ws);
        
        // Upload Dataset API
        const res = await fetch('/api/datasets', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ name: file.name, data: jsonData })
        });
        
        if (res.ok) {
            const newDataset = await res.json();
            // Link to Dashboard
             await fetch(`/api/dashboards/${params.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ datasetId: newDataset._id })
            });
            setData(jsonData);
            setColumns(Object.keys(jsonData[0] as object));
            setDashboard({ ...dashboard, datasetId: newDataset });
        }
      };
      reader.readAsBinaryString(file);
    }
  };

  const addWidget = async () => {
    // Construct widget object
    let finalConfig: any = {};
    
    if (widgetType === 'kpi') {
      finalConfig = {
        column: widgetConfig.yAxis, // Reuse yAxis state for column selection
        operation: widgetConfig.operation,
        color: widgetConfig.color
      };
      
      // Calculate KPI value for immediate display
      let val = 0;
      const col = widgetConfig.yAxis;
      const nums = data.map(r => Number(r[col]) || 0);
      if (widgetConfig.operation === 'sum') val = nums.reduce((a, b) => a + b, 0);
      else if (widgetConfig.operation === 'avg') val = nums.reduce((a, b) => a + b, 0) / nums.length;
      else if (widgetConfig.operation === 'count') val = nums.length;
      else if (widgetConfig.operation === 'max') val = Math.max(...nums);
      else if (widgetConfig.operation === 'min') val = Math.min(...nums);
      
      finalConfig.value = val.toLocaleString(); // Store snapshot or calc dynamically
    } else {
      finalConfig = {
        xAxisKey: widgetConfig.xAxis,
        yAxisKey: widgetConfig.yAxis,
        color: widgetConfig.color,
        title: widgetConfig.title
      };
    }
    
    try {
        const res = await fetch('/api/widgets', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                dashboardId: dashboard._id,
                title: widgetConfig.title || 'Untitled Widget',
                type: widgetType,
                config: finalConfig
            })
        });
        
        if(res.ok) {
            const newWidget = await res.json();
            setWidgets([...widgets, newWidget]);
            setShowWidgetModal(false);
            // Reset config
            setWidgetConfig({ title: '', xAxis: '', yAxis: '', color: '#3b82f6', operation: 'sum' });
        }
    } catch(e) { console.error(e); }
  };

  const deleteWidget = async (id: string) => {
      if(!confirm('Delete this widget?')) return;
      await fetch(`/api/widgets?id=${id}`, { method: 'DELETE' });
      setWidgets(widgets.filter(w => w._id !== id));
  };
  
  if (loading) return <div className="p-8 text-center">Loading Dashboard...</div>;
  if (!dashboard) return <div className="p-8 text-center">Dashboard not found</div>;

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           {isEditingTitle ? (
             <div className="flex items-center gap-2">
               <input 
                 className="bg-slate-800 border border-slate-700 rounded px-3 py-1 text-2xl font-bold text-white focus:outline-none focus:border-blue-500"
                 value={newTitle}
                 onChange={(e) => setNewTitle(e.target.value)}
                 autoFocus
               />
               <button onClick={handleUpdateTitle} className="p-2 bg-green-500/20 text-green-400 rounded-full hover:bg-green-500/30">
                 <Check size={20} />
               </button>
             </div>
           ) : (
             <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 flex items-center gap-3 group">
               {dashboard.name}
               <button onClick={() => setIsEditingTitle(true)} className="text-slate-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                 <Edit2 size={20} />
               </button>
             </h1>
           )}
           <p className="text-slate-400 mt-1 flex items-center gap-2">
             <FileSpreadsheet size={16} /> 
             {dashboard.datasetId ? dashboard.datasetId.name : 'No file linked'}
             
             <label className="text-blue-400 text-xs ml-2 cursor-pointer hover:underline">
               {dashboard.datasetId ? '(Change File)' : '(Upload File)'}
               <input type="file" onChange={handleFileUpload} className="hidden" accept=".xlsx,.csv" />
             </label>
           </p>
        </div>

        <div className="flex items-center gap-3">
            <button 
              disabled={!dashboard.datasetId}
              onClick={() => setShowWidgetModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={20} /> Add Widget
            </button>
        </div>
      </div>

      {/* Widgets Display */}
      {widgets.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-2xl">
          <p className="text-slate-500">No widgets yet. Add a Chart or KPI to get started.</p>
        </div>
      ) : (
        <div className="space-y-8">
           {/* KPIs Section */}
           {widgets.some(w => w.type === 'kpi') && (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {widgets.filter(w => w.type === 'kpi').map((widget) => (
                    <div key={widget._id} className="relative group">
                      <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => deleteWidget(widget._id)} className="p-2 bg-slate-900/80 text-red-400 rounded-lg hover:bg-red-500/20">
                             <Trash2 size={16} />
                         </button>
                      </div>
                      <KPICard 
                          title={widget.title} 
                          value={(() => {
                                if(!data.length) return 0;
                                const col = widget.config.column;
                                const op = widget.config.operation;
                                const nums = data.map(r => Number(r[col]) || 0);
                                if(op === 'sum') return nums.reduce((a,b)=>a+b,0).toLocaleString();
                                if(op === 'avg') return (nums.reduce((a,b)=>a+b,0)/nums.length).toFixed(2);
                                if(op === 'count') return nums.length;
                               if(op === 'max') return Math.max(...nums);
                               if(op === 'min') return Math.min(...nums);
                                return 0;
                          })()} 
                          color={widget.config.color} 
                      />
                    </div>
                ))}
             </div>
           )}

           {/* Charts Section */}
           {widgets.some(w => w.type !== 'kpi') && (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                 {widgets.filter(w => w.type !== 'kpi').map((widget) => (
                     <div key={widget._id} className="relative group">
                         <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button onClick={() => deleteWidget(widget._id)} className="p-2 bg-slate-900/80 text-red-400 rounded-lg hover:bg-red-500/20">
                                 <Trash2 size={16} />
                             </button>
                         </div>
                         <DashboardChart chartData={{
                             type: widget.type,
                             datasetId: { data: data },
                             xAxisKey: widget.config.xAxisKey,
                             yAxisKey: widget.config.yAxisKey,
                             color: widget.config.color,
                             title: widget.title
                         }} />
                     </div>
                 ))}
             </div>
           )}
        </div>
      )}

      {/* Add Widget Modal */}
      {showWidgetModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl w-full max-w-lg shadow-2xl">
             <h2 className="text-xl font-bold text-white mb-4">Add Widget</h2>
             
             <div className="space-y-4">
               <div>
                  <label className="text-sm text-slate-400 mb-1 block">Widget Type</label>
                  <div className="flex items-center gap-2 p-1 bg-slate-800 rounded-lg">
                      {['bar', 'line', 'area', 'kpi'].map(t => (
                          <button 
                            key={t}
                            onClick={() => setWidgetType(t)}
                            className={`flex-1 py-1 px-3 text-sm font-medium rounded-md uppercase transition-colors ${widgetType === t ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                          >
                              {t}
                          </button>
                      ))}
                  </div>
               </div>

               <div>
                 <label className="text-sm text-slate-400 mb-1 block">Title</label>
                 <input 
                   className="input-field" 
                   value={widgetConfig.title}
                   onChange={e => setWidgetConfig({...widgetConfig, title: e.target.value})}
                   placeholder="Widget Title"
                 />
               </div>

               {widgetType === 'kpi' ? (
                   <div className="grid grid-cols-2 gap-4">
                        <div>
                         <label className="text-sm text-slate-400 mb-1 block">Column</label>
                         <select 
                           className="input-field appearance-none"
                           value={widgetConfig.yAxis} 
                           onChange={e => setWidgetConfig({...widgetConfig, yAxis: e.target.value})}
                         >
                            <option value="">Select Column</option>
                            {columns.map(c => <option key={c} value={c}>{c}</option>)}
                         </select>
                       </div>
                       <div>
                         <label className="text-sm text-slate-400 mb-1 block">Operation</label>
                         <select 
                           className="input-field appearance-none"
                           value={widgetConfig.operation} 
                           onChange={e => setWidgetConfig({...widgetConfig, operation: e.target.value})}
                         >
                            <option value="sum">Sum</option>
                            <option value="avg">Average</option>
                            <option value="count">Count</option>
                         </select>
                       </div>
                   </div>
               ) : (
                   <div className="grid grid-cols-2 gap-4">
                       <div>
                         <label className="text-sm text-slate-400 mb-1 block">X Axis</label>
                         <select 
                           className="input-field appearance-none"
                           value={widgetConfig.xAxis} 
                           onChange={e => setWidgetConfig({...widgetConfig, xAxis: e.target.value})}
                         >
                            <option value="">Select Axis</option>
                            {columns.map(c => <option key={c} value={c}>{c}</option>)}
                         </select>
                       </div>
                       <div>
                         <label className="text-sm text-slate-400 mb-1 block">Y Axis</label>
                         <select 
                           className="input-field appearance-none"
                           value={widgetConfig.yAxis} 
                           onChange={e => setWidgetConfig({...widgetConfig, yAxis: e.target.value})}
                         >
                            <option value="">Select Value</option>
                            {columns.map(c => <option key={c} value={c}>{c}</option>)}
                         </select>
                       </div>
                   </div>
               )}
               
               <div>
                  <label className="text-sm text-slate-400 mb-1 block">Color Theme</label>
                   <div className="flex gap-2">
                      {['#3b82f6', '#8b5cf6', '#f43f5e', '#10b981', '#f59e0b'].map(c => (
                          <button 
                            key={c}
                            onClick={() => setWidgetConfig({...widgetConfig, color: c})}
                            className={`w-6 h-6 rounded-full border-2 ${widgetConfig.color === c ? 'border-white' : 'border-slate-800'}`}
                            style={{backgroundColor: c}}
                          />
                      ))}
                   </div>
               </div>

             </div>

             <div className="flex justify-end gap-3 mt-6">
                 <button onClick={() => setShowWidgetModal(false)} className="px-4 py-2 text-slate-400 hover:text-white">Cancel</button>
                 <button onClick={addWidget} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white">Save Widget</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
