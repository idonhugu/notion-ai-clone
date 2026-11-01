'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
  inline?: boolean;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleClearCacheAndReload = () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('notion_ai_docs');
        localStorage.removeItem('notion_last_active_doc');
        localStorage.removeItem('notion_last_active_time');
      } catch {}
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.inline) {
        return (
          <div className="p-4 my-2 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/20 text-rose-800 dark:text-rose-200 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{this.props.fallbackMessage || 'This section encountered an issue.'}</span>
            </div>
            <button
              onClick={this.handleReset}
              className="px-2.5 py-1 rounded-md bg-rose-600 text-white hover:bg-rose-700 font-medium transition"
            >
              Try Again
            </button>
          </div>
        );
      }

      return (
        <div className="min-h-[280px] p-6 flex flex-col items-center justify-center text-center bg-white dark:bg-[#1a1a1a] rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm m-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/50 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-4 shadow-xs">
            <ShieldAlert className="w-6 h-6" />
          </div>

          <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 mb-1">
            {this.props.fallbackTitle || 'Something went wrong in this module'}
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-md mb-5 leading-relaxed">
            {this.props.fallbackMessage ||
              'A display or network sync error occurred. Your clinical data in the cloud is safe. You can retry loading or clear local cache.'}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <button
              onClick={this.handleReset}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>

            <button
              onClick={this.handleClearCacheAndReload}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 text-xs font-semibold transition"
            >
              <span>Clear Cache & Reload</span>
            </button>

            <a
              href="/"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 text-xs font-semibold transition"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Go to Workspace</span>
            </a>
          </div>

          {process.env.NODE_ENV !== 'production' && this.state.error && (
            <details className="mt-4 text-left max-w-lg w-full bg-neutral-100 dark:bg-neutral-900 p-3 rounded-lg text-[11px] font-mono text-neutral-700 dark:text-neutral-300">
              <summary className="cursor-pointer font-semibold mb-1">Error details</summary>
              <pre className="whitespace-pre-wrap overflow-x-auto text-[10px] text-rose-600 dark:text-rose-400">
                {this.state.error.toString()}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
