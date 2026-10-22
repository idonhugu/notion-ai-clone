'use client';

import React, { useState } from 'react';
import { Trash2, RotateCcw, X, Search, FileText } from 'lucide-react';
import { Document } from '@/lib/types';

interface TrashModalProps {
  isOpen: boolean;
  onClose: () => void;
  archivedDocuments: Document[];
  onRestore: (id: string) => void;
  onPermanentDelete: (id: string) => void;
}

export function TrashModal({
  isOpen,
  onClose,
  archivedDocuments,
  onRestore,
  onPermanentDelete,
}: TrashModalProps) {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const filtered = archivedDocuments.filter((d) =>
    (d.title || 'Untitled').toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#202020] rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-neutral-500" />
            <h3 className="font-semibold text-sm text-neutral-800 dark:text-neutral-100">
              Trash & Archived Pages
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-neutral-100 dark:border-neutral-800/60 bg-neutral-50/50 dark:bg-neutral-900/40 flex items-center gap-2">
          <Search className="w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter trash by title..."
            className="w-full bg-transparent text-xs text-neutral-800 dark:text-neutral-200 placeholder:text-neutral-400 focus:outline-none"
          />
        </div>

        {/* List */}
        <div className="max-h-72 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-neutral-400">
              {query ? 'No matching pages in trash' : 'Trash is empty'}
            </div>
          ) : (
            filtered.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-2.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition group"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-base select-none">{doc.icon || '📄'}</span>
                  <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200 truncate">
                    {doc.title || 'Untitled'}
                  </span>
                </div>

                <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onRestore(doc.id)}
                    title="Restore document"
                    className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
                  >
                    <RotateCcw className="w-3 h-3 text-purple-600" />
                    <span>Restore</span>
                  </button>
                  <button
                    onClick={() => onPermanentDelete(doc.id)}
                    title="Delete permanently"
                    className="p-1 rounded text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
