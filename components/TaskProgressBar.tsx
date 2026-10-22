'use client';

import React from 'react';
import { CheckCircle2, ListChecks, Sparkles } from 'lucide-react';

interface TaskProgressBarProps {
  total: number;
  completed: number;
}

export function TaskProgressBar({ total, completed }: TaskProgressBarProps) {
  if (total === 0) return null;

  const percentage = Math.round((completed / total) * 100);
  const isAllComplete = total > 0 && completed === total;

  return (
    <div className="my-4 p-3 bg-neutral-50 dark:bg-[#202020] rounded-xl border border-neutral-200/80 dark:border-neutral-800 transition-all select-none animate-in fade-in duration-200">
      <div className="flex items-center justify-between text-xs mb-2">
        <div className="flex items-center gap-1.5 font-medium text-neutral-700 dark:text-neutral-300">
          {isAllComplete ? (
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin duration-1000" />
          ) : (
            <ListChecks className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
          )}
          <span>
            {isAllComplete
              ? `All ${total} tasks completed! Awesome work 🎉`
              : `${completed} of ${total} tasks completed`}
          </span>
        </div>

        <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold">
          <span
            className={`px-1.5 py-0.5 rounded ${
              isAllComplete
                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                : 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
            }`}
          >
            {percentage}%
          </span>
        </div>
      </div>

      {/* Progress Track */}
      <div className="w-full h-2 bg-neutral-200/80 dark:bg-neutral-700/60 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ease-out rounded-full ${
            isAllComplete
              ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
              : 'bg-gradient-to-r from-purple-600 to-indigo-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
