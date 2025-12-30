'use client';

import { Toaster } from 'react-hot-toast';

/**
 * Toast notification provider component
 * Wraps the application to enable toast notifications throughout the app
 */
export const ToastProvider = () => (
  <Toaster
    position="top-right"
    toastOptions={{
      duration: 4000,
      style: {
        background: 'hsl(217, 33%, 17%)',
        color: '#f1f5f9',
        border: '1px solid hsl(217, 33%, 25%)',
        borderRadius: '0.5rem',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
      },
      success: {
        iconTheme: {
          primary: '#10b981',
          secondary: '#f1f5f9',
        },
      },
      error: {
        iconTheme: {
          primary: '#ef4444',
          secondary: '#f1f5f9',
        },
      },
    }}
  />
);
