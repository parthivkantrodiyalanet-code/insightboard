'use client';

import { CSSProperties } from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Loading spinner component with glassmorphism effect
 * Used for indicating loading states throughout the application
 */
export const Spinner = ({ size = 'md', className = '' }: SpinnerProps) => {
  const sizeMap = {
    sm: '2rem',
    md: '3rem',
    lg: '4rem',
  };

  const spinnerStyle: CSSProperties = {
    width: sizeMap[size],
    height: sizeMap[size],
    border: '4px solid rgba(99, 102, 241, 0.1)',
    borderTopColor: '#6366f1',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  };

  return (
    <div className={`flex items-center justify-center min-h-[150px] ${className}`}>
      <div style={spinnerStyle} aria-label="Loading..." role="status" />
    </div>
  );
};
