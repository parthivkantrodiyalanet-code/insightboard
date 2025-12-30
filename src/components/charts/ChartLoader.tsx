'use client';

import { ReactNode } from 'react';
import { Spinner } from '../ui/Spinner';

interface ChartLoaderProps {
  loading: boolean;
  error?: string | null;
  children: ReactNode;
  minHeight?: string;
}

/**
 * Wrapper component for charts that handles loading and error states
 * Displays a spinner while loading and error message if failed
 */
export const ChartLoader = ({ 
  loading, 
  error, 
  children, 
  minHeight = '300px' 
}: ChartLoaderProps) => {
  if (loading) {
    return (
      <div style={{ minHeight }} className="flex items-center justify-center">
        <Spinner size="md" />
      </div>
    );
  }

  if (error) {
    return (
      <div 
        style={{ minHeight }} 
        className="flex items-center justify-center text-red-400 bg-red-950/20 rounded-lg border border-red-900/30 p-6"
      >
        <div className="text-center">
          <p className="font-semibold mb-2">Failed to load chart</p>
          <p className="text-sm text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
