"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html>
      <body className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 font-sans">
        <div className="bg-slate-900/50 p-12 rounded-2xl border border-slate-800 text-center max-w-lg">
          <h1 className="text-4xl font-bold text-red-400 mb-6">
            Something went wrong!
          </h1>
          <p className="text-slate-400 mb-8">
            We apologize for the inconvenience. An unexpected error occurred.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => reset()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors"
            >
              Try Again
            </button>
            <Link
              href="/"
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors"
            >
              Go Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
