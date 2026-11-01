'use client';

import React, { useEffect } from 'react';
import { RefreshCw, Home, Stethoscope, AlertTriangle, Database } from 'lucide-react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Next.js Page Error caught by app/error.tsx:', error);
  }, [error]);

  const handleClearCacheAndReload = () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('notion_ai_docs');
        localStorage.removeItem('notion_last_active_doc');
        localStorage.removeItem('notion_last_active_time');
      } catch {}
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#fbfbfa] dark:bg-[#191919] text-neutral-900 dark:text-neutral-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-[#202020] rounded-2xl shadow-xl border border-neutral-200/80 dark:border-neutral-800 p-6 sm:p-8 text-center space-y-5 animate-in fade-in duration-200">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-xs">
          <Stethoscope className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Workspace Recovery Mode</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Let's get your GP notes back on screen
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
            The app encountered a temporary loading or storage sync error. Your cloud notes and clinical presentations are safely stored in Supabase.
          </p>
        </div>

        <div className="flex flex-col gap-2.5 pt-2">
          <button
            onClick={() => reset()}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>

          <button
            onClick={handleClearCacheAndReload}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 text-xs font-semibold transition cursor-pointer"
          >
            <Database className="w-3.5 h-3.5 text-neutral-500" />
            <span>Clear Local Device Cache & Resync</span>
          </button>

          <a
            href="/"
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 text-neutral-600 dark:text-neutral-300 text-xs font-medium transition cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return to Workspace Home</span>
          </a>
        </div>

        {error?.digest && (
          <p className="text-[10px] text-neutral-400 font-mono">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
