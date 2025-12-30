'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';
import { 
  ArrowRight, UploadCloud, Plus, Trash2, Layout, BarChart2, PieChart, Activity 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { DashboardChart, KPICard } from '@/components/charts';
import { Spinner } from '@/components/ui';

interface WizardWidget {
  id: string;
  type: string;
  title: string;
  config: {
    title: string;
    xAxis: string;
    yAxis: string;
    color: string;
    operation: 'sum' | 'avg' | 'count';
  };
}

/**
 * NewAnalysisWizard Component
 * A multi-step wizard for creating a new dashboard, uploading data, and configuring initial widgets.
 */
export default function NewAnalysisWizard() {
  const router = useRouter();
  
  /* State Management */
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [dashboardName, setDashboardName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [datasetData, setDatasetData] = useState<Record<string, unknown>[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  
  const [widgets, setWidgets] = useState<WizardWidget[]>([]);
  
  const [showWidgetForm, setShowWidgetForm] = useState(false);
  const [widgetType, setWidgetType] = useState('bar');
  const [widgetConfig, setWidgetConfig] = useState<{
    title: string;
    xAxis: string;
    yAxis: string;
    color: string;
    operation: 'sum' | 'avg' | 'count';
  }>({
    title: '', xAxis: '', yAxis: '', color: '#3b82f6', operation: 'sum'
  });

  /* File Handler */
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const bstr = evt.target?.result;
          const wb = XLSX.read(bstr, { type: 'binary' });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const jsonData = XLSX.utils.sheet_to_json(ws) as Record<string, unknown>[];
          setDatasetData(jsonData);
          if (jsonData.length > 0) {
            setColumns(Object.keys(jsonData[0]));
            setStep(3);
            toast.success('File uploaded and parsed successfully');
          } else {
            toast.error('The uploaded file is empty');
          }
        } catch {
          toast.error('Failed to parse Excel file');
        }
      };
      reader.readAsBinaryString(uploadedFile);
    }
  };

  /* Config Utility */
  const cleanConfig = () => {
    setWidgetConfig({ title: '', xAxis: '', yAxis: '', color: '#3b82f6', operation: 'sum' });
    setWidgetType('bar');
  };

  /* Widget Operations */
  const addWidgetToList = () => {
    if (widgetType === 'kpi' && !widgetConfig.yAxis) {
      return toast.error('Please select a column for KPI');
    }
    if (widgetType !== 'kpi' && (!widgetConfig.xAxis || !widgetConfig.yAxis)) {
      return toast.error('Please select properties for the chart');
    }

    const newWidget = {
      id: Date.now().toString(),
      type: widgetType,
      title: widgetConfig.title || `${widgetType} Chart`,
      config: { ...widgetConfig }
    };
    
    setWidgets([...widgets, newWidget]);
    setShowWidgetForm(false);
    cleanConfig();
    toast.success('Widget added to preview');
  };

  const removeWidget = (id: string) => {
    setWidgets(widgets.filter(w => w.id !== id));
    toast.success('Widget removed');
  };

  /* Submission Logic */
  const handleFinish = async () => {
    if (!dashboardName || !datasetData.length) return;
    setLoading(true);

    const promise = (async () => {
      // 1. Save Dataset
      const datasetRes = await fetch('/api/datasets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: file?.name || 'Dataset', data: datasetData })
      });
      if (!datasetRes.ok) throw new Error('Failed to save dataset');
      const dataset = await datasetRes.json();

      // 2. Create Dashboard
      const dashRes = await fetch('/api/dashboards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: dashboardName, 
          datasetId: dataset._id 
        })
      });
      if (!dashRes.ok) throw new Error('Failed to create dashboard');
      const dashboard = await dashRes.json();

      // 3. Add Widgets
      const widgetPromises = widgets.map(w => {
         let finalConfig: Record<string, unknown> = {};
         if (w.type === 'kpi') {
             finalConfig = { column: w.config.yAxis, operation: w.config.operation, color: w.config.color };
         } else {
             finalConfig = { xAxisKey: w.config.xAxis, yAxisKey: w.config.yAxis, color: w.config.color };
         }

         return fetch('/api/widgets', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({
                 dashboardId: dashboard._id,
                 title: w.title,
                 type: w.type,
                 config: finalConfig
             })
         });
      });

      await Promise.all(widgetPromises);
      return dashboard._id;
    })();

    toast.promise(promise, {
      loading: 'Creating your workspace...',
      success: 'Dashboard created successfully!',
      error: (err) => err.message || 'Failed to create dashboard',
    });

    try {
      await promise;
      router.push('/dashboard');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  /* Helper Functions */
  const getKPIValue = (col: string, op: string) => {
      const nums = datasetData.map(r => Number(r[col]) || 0);
      if(op === 'sum') return nums.reduce((a,b)=>a+b,0).toLocaleString();
      if(op === 'avg') return (nums.reduce((a,b)=>a+b,0)/nums.length).toFixed(2);
      if(op === 'count') return nums.length;
      return 0;
  };

  /* Render */
  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
      <div className="flex justify-center mb-8">
        <div className="flex items-center gap-4 text-sm font-medium">
          <div className={`px-4 py-2 rounded-full transition-colors ${step === 1 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>1. Name</div>
          <div className="w-8 h-1 bg-slate-800" />
          <div className={`px-4 py-2 rounded-full transition-colors ${step === 2 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>2. Upload</div>
           <div className="w-8 h-1 bg-slate-800" />
          <div className={`px-4 py-2 rounded-full transition-colors ${step === 3 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>3. Build</div>
        </div>
      </div>

      {step === 1 && (
         <div className="max-w-md mx-auto glass-card p-10 text-center animate-in zoom-in-95 duration-500">
            <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-400">
               <Layout size={32} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Start Analysis</h2>
            <p className="text-slate-400 mb-8">Give your new dashboard a name.</p>
            <input 
              value={dashboardName}
              onChange={(e) => setDashboardName(e.target.value)}
              placeholder="e.g. Sales Overview 2024"
              className="input-field mb-6 text-center text-lg"
              autoFocus
            />
            <button 
              disabled={!dashboardName}
              onClick={() => setStep(2)}
              className="btn-primary w-full flex justify-center items-center gap-2"
            >
              Next Step <ArrowRight size={18} />
            </button>
         </div>
      )}

      {step === 2 && (
         <div className="max-w-xl mx-auto glass-card p-12 text-center border-2 border-dashed border-slate-700 hover:border-blue-500 transition-colors relative group animate-in zoom-in-95 duration-500">
            <input 
               type="file" 
               accept=".xlsx,.csv" 
               className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
               onChange={handleFileUpload}
            />
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
               <UploadCloud className="w-10 h-10 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Upload Excel Data</h3>
            <p className="text-slate-400">Drag & drop or click to browse files.</p>
         </div>
      )}

      {step === 3 && (
        <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
           <div className="flex items-center justify-between">
              <div>
                 <h2 className="text-3xl font-bold text-white">{dashboardName}</h2>
                 <p className="text-slate-400 text-sm">{widgets.length} Widgets Added</p>
              </div>
              <div className="flex gap-3">
                 <button onClick={() => setShowWidgetForm(true)} className="btn-primary flex items-center gap-2">
                    <Plus size={20} /> Add Widget
                 </button>
                 <button 
                   onClick={handleFinish} 
                   disabled={loading || widgets.length === 0}
                   className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold shadow-lg shadow-green-900/20 disabled:opacity-50 disabled:cursor-not-allowed min-w-[160px]"
                 >
                    {loading ? <Spinner size="sm" /> : 'Create Dashboard'}
                 </button>
              </div>
           </div>

           {widgets.length === 0 ? (
              <div 
                 onClick={() => setShowWidgetForm(true)}
                 className="h-64 border-2 border-dashed border-slate-700 rounded-2xl flex flex-col items-center justify-center text-slate-500 hover:bg-slate-800/30 hover:text-slate-300 cursor-pointer transition-all"
              >
                  <Plus size={48} className="mb-4 opacity-50" />
                  <p>Click &quot;Add Widget&quot; to create your first chart or KPI</p>
              </div>
           ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {widgets.map((w) => (
                    <div key={w.id} className="relative group">
                        <button 
                           onClick={() => removeWidget(w.id)}
                           className="absolute top-2 right-2 z-10 p-2 bg-slate-900/80 text-red-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20"
                        >
                           <Trash2 size={16} />
                        </button>
                        {w.type === 'kpi' ? (
                           <KPICard 
                              title={w.title}
                              value={getKPIValue(w.config.yAxis, w.config.operation)}
                              color={w.config.color}
                           />
                        ) : (
                           <DashboardChart chartData={{
                              type: w.type as 'bar' | 'line' | 'area',
                              title: w.title,
                              datasetId: { data: datasetData },
                              xAxisKey: w.config.xAxis,
                              yAxisKey: w.config.yAxis,
                              color: w.config.color
                           }} />
                        )}
                    </div>
                 ))}
              </div>
           )}
        </div>
      )}

      {showWidgetForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95 duration-200">
               <h3 className="text-xl font-bold text-white mb-4">Configure Widget</h3>
               
               <div className="space-y-4">
                  <div>
                     <label className="text-xs font-semibold text-slate-500 uppercase mb-2 block">Visualization Type</label>
                     <div className="grid grid-cols-4 gap-2">
                        {['bar', 'line', 'area', 'kpi'].map(t => (
                           <button 
                             key={t}
                             onClick={() => setWidgetType(t)}
                             className={`flex flex-col items-center gap-1 py-3 rounded-lg border transition-all ${widgetType === t ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-slate-800 border-transparent text-slate-400 hover:bg-slate-700'}`}
                           >
                              {t === 'bar' && <BarChart2 size={20} />}
                              {t === 'line' && <Activity size={20} />} 
                              {t === 'area' && <PieChart size={20} />}
                              {t === 'kpi' && <span className="text-xl font-bold">123</span>}
                              <span className="text-xs uppercase font-medium">{t}</span>
                           </button>
                        ))}
                     </div>
                  </div>

                  <div>
                     <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Title</label>
                     <input 
                        className="input-field" 
                        placeholder="e.g. Monthly Revenue"
                        value={widgetConfig.title}
                        onChange={(e) => setWidgetConfig({...widgetConfig, title: e.target.value})}
                     />
                  </div>

                   <div className="grid grid-cols-2 gap-4">
                      {widgetType !== 'kpi' && (
                         <div>
                            <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">X-Axis</label>
                            <select 
                               className="input-field appearance-none"
                               value={widgetConfig.xAxis}
                               onChange={(e) => setWidgetConfig({...widgetConfig, xAxis: e.target.value})}
                            >
                               <option value="">Select Axis</option>
                               {columns.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                         </div>
                      )}
                      
                      <div className={widgetType === 'kpi' ? 'col-span-2' : ''}>
                         <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">
                            {widgetType === 'kpi' ? 'Data Column' : 'Y-Axis (Value)'}
                         </label>
                         <select 
                            className="input-field appearance-none"
                            value={widgetConfig.yAxis}
                            onChange={(e) => setWidgetConfig({...widgetConfig, yAxis: e.target.value})}
                         >
                            <option value="">Select Column</option>
                            {columns.map(c => <option key={c} value={c}>{c}</option>)}
                         </select>
                      </div>

                      {widgetType === 'kpi' && (
                         <div className="col-span-2">
                             <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Operation</label>
                             <div className="flex bg-slate-800 rounded-lg p-1">
                                {['sum', 'avg', 'count'].map(op => (
                                   <button 
                                      key={op}
                                      onClick={() => setWidgetConfig({...widgetConfig, operation: op as 'sum' | 'avg' | 'count'})}
                                      className={`flex-1 py-1 text-sm font-medium rounded capitalize ${widgetConfig.operation === op ? 'bg-slate-600 text-white' : 'text-slate-400'}`}
                                   >
                                      {op}
                                   </button>
                                ))}
                             </div>
                         </div>
                      )}
                   </div>

                   <div>
                       <label className="text-xs font-semibold text-slate-500 uppercase mb-2 block">Theme</label>
                       <div className="flex gap-3">
                           {['#3b82f6', '#8b5cf6', '#f43f5e', '#10b981', '#f59e0b'].map(c => (
                              <button 
                                 key={c}
                                 onClick={() => setWidgetConfig({...widgetConfig, color: c})}
                                 className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${widgetConfig.color === c ? 'border-white scale-110' : 'border-transparent'}`}
                                 style={{ backgroundColor: c }}
                              />
                           ))}
                       </div>
                   </div>
               </div>

               <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-800">
                   <button onClick={() => setShowWidgetForm(false)} className="px-4 py-2 text-slate-400 hover:text-white transition-colors">Cancel</button>
                   <button onClick={addWidgetToList} className="btn-primary">Add Widget</button>
               </div>
           </div>
        </div>
      )}
    </div>
  );
}

