import React from "react";

export function ChartLoader({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 ${className}`}
    >
      <div className="flex items-end space-x-1 h-16 mb-4">
        {[40, 70, 50, 90, 60, 80, 45].map((height, i) => (
          <div
            key={i}
            className="w-3 bg-gradient-to-t from-blue-600 to-cyan-400 rounded-t-sm origin-bottom"
            style={{
              height: `${height}%`,
              animation: `chartGrow 1.5s ease-in-out infinite`,
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>
      <p className="text-slate-400 text-sm font-medium animate-pulse">
        Building your dashboard...
      </p>
    </div>
  );
}
