'use client';

import { Activity } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  trend?: number;
  icon?: string;
  color?: string;
}

/**
 * KPICard Component
 * Displays a Key Performance Indicator with title, value, and optional color accent
 * Features a glassmorphism design with hover animations
 * 
 * @param title - The KPI label (e.g., "Total Revenue")
 * @param value - The KPI value to display
 * @param color - Optional accent color for the left border and icon
 */
export default function KPICard({ title, value, color }: KPICardProps) {
  return (
    <div className="glass-card p-6 flex flex-col justify-between h-full relative overflow-hidden group">
      {/* Colored accent border */}
      <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: color || '#3b82f6' }} />
      
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">{title}</h3>
          <p className="text-3xl font-bold text-white mt-1 group-hover:scale-105 transition-transform origin-left">
            {value}
          </p>
        </div>
        
        {/* Icon with dynamic color */}
        <div className="p-3 rounded-xl bg-slate-800/50 text-white" style={{ color: color }}>
          <Activity size={24} />
        </div>
      </div>
    </div>
  );
}

