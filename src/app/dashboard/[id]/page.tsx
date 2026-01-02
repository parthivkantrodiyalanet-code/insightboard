"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  FileSpreadsheet,
  Trash2,
  Edit2,
  Check,
  LayoutDashboard,
  Sparkles,
  Calendar as CalendarIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import { DashboardChart, KPICard } from "@/components/charts";
import {
  DownloadPDFButton,
  AIInsights,
  ChartLoader,
  ConfirmDialog,
} from "@/components/ui";
import * as XLSX from "xlsx";
import { parseDate, isDateColumn } from "@/lib/utils/date-helpers";

interface Dataset {
  _id: string;
  name: string;
  data: Record<string, unknown>[];
  insights?: {
    keyInsights: string[];
    risks: string[];
    recommendations: string[];
    generatedAt: string;
  };
}

interface Widget {
  _id: string;
  title: string;
  type: string;
  config: {
    xAxisKey?: string;
    yAxisKey?: string;
    column?: string;
    operation?: "sum" | "avg" | "count";
    color: string;
  };
}

interface Dashboard {
  _id: string;
  name: string;
  isDemo?: boolean;
  datasetId?: Dataset;
}

interface DashboardResponse {
  dashboard: Dashboard;
  widgets: Widget[];
}

/**
 * DashboardBuilder Component
 * Main page for building and viewing individual dashboards
 * Handles data fetching, widget management, file uploads, and AI insights
 */
export default function DashboardBuilder() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [showWidgetModal, setShowWidgetModal] = useState(false);
  const [widgetType, setWidgetType] = useState("bar");
  const [widgetConfig, setWidgetConfig] = useState<{
    title: string;
    xAxis: string;
    yAxis: string;
    color: string;
    operation: "sum" | "avg" | "count";
  }>({
    title: "",
    xAxis: "",
    yAxis: "",
    color: "#3b82f6",
    operation: "sum",
  });

  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [columns, setColumns] = useState<string[]>([]);

  // Date Filtering State
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: "",
    end: "",
  });

  // Confirmation Dialog State
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type: "danger" | "info";
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    type: "info",
  });

  // Helper to open confirmation
  const askConfirmation = (
    title: string,
    message: string,
    action: () => void,
    type: "danger" | "info" = "info"
  ) => {
    setConfirmConfig({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        action();
        setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
      },
      type,
    });
  };

  // Memoized Filtered Data (Performance Optimization)
  // Memoized Filtered Data (Performance Optimization)
  const filteredData = React.useMemo(() => {
    if (!data.length) return [];
    if (!dateRange.start && !dateRange.end) return data;

    // Correctly parse local start/end dates from YYYY-MM-DD inputs
    const parseInputDate = (str: string) => {
      if (!str) return null;
      const [y, m, d] = str.split("-").map(Number);
      return new Date(y, m - 1, d);
    };

    const start = parseInputDate(dateRange.start);
    const end = parseInputDate(dateRange.end);

    // Detect date column: Prefer columns with explicit "date" naming
    const candidates = columns.filter((col) => isDateColumn(data, col));

    // Priority 1: Explicit 'date' or 'timestamp' in name (e.g., "Date", "Order Date", "Timestamp")
    let dateCol = candidates.find((col) =>
      /date|timestamp|joined|created|updated/i.test(col)
    );

    // Priority 2: Fallback to other time-related terms, but exclude 'month'/'day' if a better candidate exists
    if (!dateCol) {
      dateCol = candidates.find((col) => /time|year/i.test(col));
    }

    // Priority 3: If nothing else, allow Month/Day or just take the first candidate
    if (!dateCol && candidates.length > 0) {
      // Try not to pick partial date columns if full date columns exist (though step 1 covers most)
      dateCol = candidates[0];
    }

    // Debugging: Log the selected date column to help troubleshooting
    if (process.env.NODE_ENV === "development" && dateCol) {
      console.log(`[Dashboard] Filtering using date column: ${dateCol}`);
    }

    if (!dateCol) return data;

    return data.filter((row) => {
      const raw = row[dateCol as string];
      const rowDate = parseDate(raw);

      if (!rowDate) return true; // Keep if passed verification but individual cell failed

      // Reset time for accurate date-only comparison
      rowDate.setHours(0, 0, 0, 0);

      if (start) {
        start.setHours(0, 0, 0, 0);
        if (rowDate < start) return false;
      }
      if (end) {
        end.setHours(0, 0, 0, 0);
        if (rowDate > end) return false;
      }

      return true;
    });
  }, [data, dateRange, columns]);

  // Fetch dashboard data
  const {
    data: dashboardData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["dashboard", params.id],
    queryFn: async () => {
      if (params.id === "demo") return getDemoData();
      const res = await fetch(`/api/dashboards/${params.id}`);
      if (!res.ok) {
        toast.error("Failed to load dashboard");
        throw new Error("Failed to load dashboard");
      }
      return res.json();
    },
  });

  useEffect(() => {
    if (dashboardData) {
      const db = dashboardData.dashboard || dashboardData;
      setNewTitle(db.name || "");
      const dataset = db.datasetId;
      if (dataset?.data) {
        setData(dataset.data);
        if (dataset.data.length > 0) {
          setColumns(Object.keys(dataset.data[0]));
        }
      }
    }
  }, [dashboardData]);

  // Mutation for updating dashboard title
  const updateTitleMutation = useMutation({
    mutationFn: async (title: string) => {
      if (params.id === "demo") return { name: title };
      const res = await fetch(`/api/dashboards/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: title }),
      });
      return res.json();
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(
        ["dashboard", params.id],
        (old: DashboardResponse | undefined) => {
          if (!old) return old;
          return {
            ...old,
            dashboard: { ...old.dashboard, name: updated.name },
          };
        }
      );
      setIsEditingTitle(false);
      toast.success("Title updated");
    },
    onError: () => toast.error("Failed to update title"),
  });

  // Mutation for generating AI insights
  const insightsMutation = useMutation({
    mutationFn: async (datasetId: string) => {
      const res = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ datasetId }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", params.id] });
      toast.success("AI Insights generated");
    },
    onError: () => toast.error("Failed to generate insights"),
  });

  // Mutation for FORCE generating AI insights
  const regenerateInsightsMutation = useMutation({
    mutationFn: async (datasetId: string) => {
      const res = await fetch("/api/insights/force-regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ datasetId }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", params.id] });
      toast.success("Insights regenerated successfully!");
    },
    onError: () => toast.error("Failed to regenerate insights"),
  });

  // Mutation for adding new widgets
  const widgetMutation = useMutation({
    mutationFn: async (newWidget: {
      dashboardId: string;
      title: string;
      type: string;
      config: Record<string, unknown>;
    }) => {
      const res = await fetch("/api/widgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newWidget),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", params.id] });
      setShowWidgetModal(false);
      toast.success("Widget added");
    },
    onError: () => toast.error("Failed to add widget"),
  });

  // Mutation for deleting widgets
  const deleteWidgetMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/widgets?id=${id}`, { method: "DELETE" });
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", params.id] });
      toast.success("Widget removed");
    },
    onError: () => toast.error("Failed to delete widget"),
  });

  const dashboard =
    dashboardData?.dashboard ||
    (dashboardData?._id === "demo" ? dashboardData : null);
  const widgets =
    dashboardData?.widgets ||
    (dashboardData?._id === "demo" ? dashboardData.widgets : []);
  const insights = dashboard?.datasetId?.insights || null;

  const handleUpdateTitle = () => updateTitleMutation.mutate(newTitle);

  const loadAIInsights = (force = false) => {
    if (params.id === "demo") {
      toast.error("Demo mode insights are static");
      return;
    }
    if (dashboard?.datasetId?._id) {
      if (force) {
        regenerateInsightsMutation.mutate(dashboard.datasetId._id);
      } else {
        insightsMutation.mutate(dashboard.datasetId._id);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (params.id === "demo") {
      toast.error("Upload disabled in demo");
      return;
    }
    const file = e.target.files?.[0];
    if (!file) return;

    const promise = new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          const bstr = evt.target?.result;
          const wb = XLSX.read(bstr, { type: "binary" });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(ws);

          const res = await fetch("/api/datasets", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: file.name, data: jsonData }),
          });

          if (!res.ok) throw new Error("Upload failed");

          const ds = await res.json();
          await fetch(`/api/dashboards/${params.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ datasetId: ds._id }),
          });

          queryClient.invalidateQueries({ queryKey: ["dashboard", params.id] });
          resolve(true);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error("File reading error"));
      reader.readAsBinaryString(file);
    });

    toast.promise(promise, {
      loading: "Uploading and parsing file...",
      success: "Data imported successfully!",
      error: "Failed to import data.",
    });
  };

  const addWidget = () => {
    if (params.id === "demo")
      return toast.error("Adding widgets disabled in demo.");
    let config: Record<string, unknown> = {};
    if (widgetType === "kpi") {
      config = {
        column: widgetConfig.yAxis,
        operation: widgetConfig.operation,
        color: widgetConfig.color,
      };
    } else {
      config = {
        xAxisKey: widgetConfig.xAxis,
        yAxisKey: widgetConfig.yAxis,
        color: widgetConfig.color,
        title: widgetConfig.title,
      };
    }
    widgetMutation.mutate({
      dashboardId: (dashboard as Dashboard)._id,
      title: widgetConfig.title || "Untitled",
      type: widgetType,
      config,
    });
  };

  const deleteWidget = (id: string) => {
    if (params.id === "demo") {
      queryClient.setQueryData(
        ["dashboard", params.id],
        (old: DashboardResponse | undefined) => {
          if (!old) return old;
          return {
            ...old,
            widgets: old.widgets.filter((w: Widget) => w._id !== id),
          };
        }
      );
      toast.success("Widget removed (Demo)");
      return;
    }

    askConfirmation(
      "Delete Widget",
      "Are you sure you want to remove this widget from your dashboard?",
      () => deleteWidgetMutation.mutate(id),
      "danger"
    );
  };

  if (isLoading) return <ChartLoader className="mt-40" />;
  if (isError || !dashboard)
    return (
      <div className="p-20 text-center">
        <p className="text-red-400 mb-4">
          Dashboard not found or failed to load
        </p>
        <button
          onClick={() => router.push("/dashboard")}
          className="btn-primary"
        >
          Go Back
        </button>
      </div>
    );

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          {isEditingTitle ? (
            <div className="flex items-center gap-2">
              <input
                className="bg-slate-800 border border-slate-700 rounded px-3 py-1 text-2xl font-bold text-white focus:outline-none focus:border-blue-500"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                autoFocus
              />
              <button
                onClick={handleUpdateTitle}
                className="p-2 bg-green-500/20 text-green-400 rounded-full hover:bg-green-500/30"
              >
                <Check size={20} />
              </button>
            </div>
          ) : (
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 flex items-center gap-3 group">
              {dashboard.name}
              <button
                onClick={() => setIsEditingTitle(true)}
                className="text-slate-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Edit2 size={20} />
              </button>
            </h1>
          )}
          <p className="text-slate-400 mt-1 flex items-center gap-2">
            <FileSpreadsheet size={16} />
            {dashboard.datasetId ? dashboard.datasetId.name : "No file linked"}
            <label className="text-blue-400 text-xs ml-2 cursor-pointer hover:underline">
              {dashboard.datasetId ? "(Change)" : "(Upload)"}
              <input
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                accept=".xlsx,.csv"
              />
            </label>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Date Range Picker */}
          <div className="flex items-center gap-2 bg-slate-800 p-1.5 rounded-lg border border-slate-700">
            <CalendarIcon size={16} className="text-slate-400 ml-2" />
            <input
              type="date"
              className="bg-transparent text-xs text-white focus:outline-none w-[100px] [color-scheme:dark]"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, start: e.target.value }))
              }
              placeholder="Start"
            />
            <span className="text-slate-500">-</span>
            <input
              type="date"
              className="bg-transparent text-xs text-white focus:outline-none w-[100px] [color-scheme:dark]"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, end: e.target.value }))
              }
              placeholder="End"
            />
            {(dateRange.start || dateRange.end) && (
              <button
                onClick={() => setDateRange({ start: "", end: "" })}
                className="text-xs text-red-400 hover:text-red-300 px-2"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === "dashboard"
                  ? "bg-slate-700 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <LayoutDashboard size={16} /> Dashboard
            </button>
            <button
              onClick={() => setActiveTab("insights")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === "insights"
                  ? "bg-slate-700 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Sparkles size={16} /> AI Insights
            </button>
          </div>
          <DownloadPDFButton targetId="full-report" fileName={dashboard.name} />
          <button
            disabled={!dashboard.datasetId}
            onClick={() => setShowWidgetModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
          >
            <Plus size={20} /> Add Widget
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="relative">
        {/* Visible Component based on Tab */}
        {activeTab === "insights" ? (
          <AIInsights
            insights={insights}
            loading={
              insightsMutation.isPending || regenerateInsightsMutation.isPending
            }
            onRetry={() => loadAIInsights(true)}
          />
        ) : (
          <div id="dashboard-content" className="space-y-8">
            <DashboardWidgets
              widgets={widgets}
              data={filteredData}
              deleteWidget={deleteWidget}
            />
            {/* Confirmation Dialog */}
            <ConfirmDialog
              isOpen={confirmConfig.isOpen}
              title={confirmConfig.title}
              message={confirmConfig.message}
              onConfirm={confirmConfig.onConfirm}
              onCancel={() =>
                setConfirmConfig((prev) => ({ ...prev, isOpen: false }))
              }
              type={confirmConfig.type}
            />
          </div>
        )}

        {/* Hidden Report Layer for PDF (Contains both) */}
        <div
          id="full-report"
          className="fixed -left-[9999px] top-0 w-[1200px] bg-slate-950 p-10 space-y-12"
          aria-hidden="true"
        >
          <div className="border-b border-slate-800 pb-6 mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              {dashboard.name}
            </h1>
            <p className="text-slate-400">
              Generated Report • InsightBoard Analytics
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-blue-400 mb-6 flex items-center gap-2">
              <LayoutDashboard /> Visual Dashboard
            </h2>
            <DashboardWidgets
              widgets={widgets}
              data={filteredData}
              deleteWidget={() => {}}
            />
          </div>

          {insights && (
            <div className="pt-12 border-t border-slate-800">
              <h2 className="text-2xl font-bold text-purple-400 mb-6 flex items-center gap-2">
                <Sparkles /> AI Data Insights
              </h2>
              <AIInsights
                insights={insights}
                loading={false}
                onRetry={() => {}}
              />
            </div>
          )}
        </div>
      </div>

      {showWidgetModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl w-full max-w-lg shadow-2xl animate-in zoom-in duration-300">
            <h2 className="text-xl font-bold text-white mb-4">Add Widget</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-400 mb-1 block">
                  Type
                </label>
                <div className="flex gap-2 p-1 bg-slate-800 rounded-lg">
                  {["bar", "line", "area", "kpi"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setWidgetType(t)}
                      className={`flex-1 py-1 rounded-md uppercase text-xs font-bold ${
                        widgetType === t
                          ? "bg-blue-600 text-white"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1 block">
                  Title
                </label>
                <input
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  value={widgetConfig.title}
                  onChange={(e) =>
                    setWidgetConfig({ ...widgetConfig, title: e.target.value })
                  }
                  placeholder="Widget name..."
                />
              </div>
              {widgetType === "kpi" ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-400 mb-1 block">
                      Column
                    </label>
                    <select
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none"
                      value={widgetConfig.yAxis}
                      onChange={(e) =>
                        setWidgetConfig({
                          ...widgetConfig,
                          yAxis: e.target.value,
                        })
                      }
                    >
                      <option value="">Select</option>
                      {columns.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 mb-1 block">
                      Op
                    </label>
                    <select
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none"
                      value={widgetConfig.operation}
                      onChange={(e) =>
                        setWidgetConfig({
                          ...widgetConfig,
                          operation: e.target.value as "sum" | "avg" | "count",
                        })
                      }
                    >
                      <option value="sum">Sum</option>
                      <option value="avg">Avg</option>
                      <option value="count">Count</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-400 mb-1 block">
                      X Axis
                    </label>
                    <select
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none"
                      value={widgetConfig.xAxis}
                      onChange={(e) =>
                        setWidgetConfig({
                          ...widgetConfig,
                          xAxis: e.target.value,
                        })
                      }
                    >
                      <option value="">Select</option>
                      {columns.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 mb-1 block">
                      Y Axis
                    </label>
                    <select
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none"
                      value={widgetConfig.yAxis}
                      onChange={(e) =>
                        setWidgetConfig({
                          ...widgetConfig,
                          yAxis: e.target.value,
                        })
                      }
                    >
                      <option value="">Select</option>
                      {columns.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowWidgetModal(false)}
                className="px-4 py-2 text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={addWidget}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * DashboardWidgets Component
 * Renders the grid of KPI cards and charts
 */
function DashboardWidgets({
  widgets,
  data,
  deleteWidget,
}: {
  widgets: Widget[];
  data: Record<string, unknown>[];
  deleteWidget: (id: string) => void;
}) {
  if (widgets.length === 0) {
    return (
      <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-2xl text-slate-500">
        No widgets yet. Add some to see your data!
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {widgets.some((w: Widget) => w.type === "kpi") && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {widgets
            .filter((w: Widget) => w.type === "kpi")
            .map((widget: Widget) => (
              <div key={widget._id} className="relative group">
                <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => deleteWidget(widget._id)}
                    className="p-2 bg-slate-900/80 text-red-400 rounded-lg hover:bg-red-500/20"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <KPICard
                  title={widget.title}
                  value={(() => {
                    if (!data.length) return 0;
                    const col = widget.config.column as string;
                    if (!col) return 0;
                    const op = widget.config.operation;
                    const nums = data.map((r) => Number(r[col]) || 0);
                    if (op === "sum")
                      return nums.reduce((a, b) => a + b, 0).toLocaleString();
                    if (op === "avg")
                      return (
                        nums.reduce((a, b) => a + b, 0) / nums.length
                      ).toFixed(2);
                    if (op === "count") return nums.length;
                    return 0;
                  })()}
                  color={widget.config.color as string}
                />
              </div>
            ))}
        </div>
      )}

      {widgets.some((w: Widget) => w.type !== "kpi") && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {widgets
            .filter((w: Widget) => w.type !== "kpi")
            .map((widget: Widget) => (
              <div key={widget._id} className="relative group">
                <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => deleteWidget(widget._id)}
                    className="p-2 bg-slate-900/80 text-red-400 rounded-lg hover:bg-red-500/20"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <DashboardChart
                  chartData={{
                    type: widget.type as "bar" | "line" | "area",
                    datasetId: { data: data },
                    xAxisKey: (widget.config.xAxisKey as string) || "",
                    yAxisKey: (widget.config.yAxisKey as string) || "",
                    color: widget.config.color as string,
                    title: widget.title,
                  }}
                />
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

/**
 * Demo Data Generator
 * Provides sample data for the demo dashboard view
 */
function getDemoData() {
  return {
    _id: "demo",
    name: "Instant Preview (Demo)",
    isDemo: true,
    datasetId: {
      _id: "demo-ds",
      name: "Sample Data",
      data: [
        { Month: "Jan", Sales: 4000, Orders: 240, Revenue: 12000 },
        { Month: "Feb", Sales: 3000, Orders: 221, Revenue: 9000 },
        { Month: "Mar", Sales: 5000, Orders: 229, Revenue: 15000 },
        { Month: "Apr", Sales: 4500, Orders: 250, Revenue: 13500 },
        { Month: "May", Sales: 6000, Orders: 310, Revenue: 18000 },
        { Month: "Jun", Sales: 5500, Orders: 280, Revenue: 16500 },
      ],
      insights: {
        keyInsights: [
          "Sales peaked in May reaching 6,000 units.",
          "Revenue shows a steady upward trend despite a dip in February.",
          "Orders are highly correlated with marketing spend in Q2.",
        ],
        risks: [
          "February saw a 25% drop in sales volume.",
          "Order fulfillment speed slowed down in May due to high volume.",
        ],
        recommendations: [
          "Increase inventory for peak months like May and March.",
          "Investigate the cause of the February slump to prevent future dips.",
          "Automate order processing to handle higher volumes in Q3.",
        ],
      },
    },
    widgets: [
      {
        _id: "w1",
        title: "Sales Trend",
        type: "bar",
        config: { xAxisKey: "Month", yAxisKey: "Sales", color: "#3b82f6" },
      },
    ],
  };
}
