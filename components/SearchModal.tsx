'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, FileText, Star, X, CornerDownLeft } from 'lucide-react';
import { Document } from '@/lib/types';
import { useRouter } from 'next/navigation';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: Document[];
  onSelectDocument?: (id: string) => void;
}

export function SearchModal({
  isOpen,
  onClose,
  documents,
  onSelectDocument,
}: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const filteredDocs = documents.filter((doc) =>
    (doc.title || 'Untitled').toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (doc: Document) => {
    onClose();
    if (onSelectDocument) {
      onSelectDocument(doc.id);
    } else {
      router.push(`/doc/${doc.id}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (filteredDocs.length > 0) {
        setSelectedIndex((prev) => (prev + 1) % filteredDocs.length);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (filteredDocs.length > 0) {
        setSelectedIndex((prev) => (prev - 1 + filteredDocs.length) % filteredDocs.length);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredDocs.length > 0 && filteredDocs[selectedIndex]) {
        handleSelect(filteredDocs[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-xl bg-white dark:bg-[#202020] rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-neutral-200 dark:border-neutral-800">
          <Search className="w-5 h-5 text-neutral-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search pages by title... (type to filter)"
            className="w-full bg-transparent text-sm focus:outline-none text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400"
          />
          <button
            onClick={onClose}
            className="p-1 rounded text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results list */}
        <div className="max-h-80 overflow-y-auto p-2">
          {filteredDocs.length === 0 ? (
            <div className="p-8 text-center text-sm text-neutral-400">
              No pages match &ldquo;{query}&rdquo;
            </div>
          ) : (
            filteredDocs.map((doc, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={doc.id}
                  onClick={() => handleSelect(doc)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm cursor-pointer transition ${
                    isSelected
                      ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100'
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="text-base select-none">{doc.icon || '📄'}</span>
                    <span className="font-medium truncate">{doc.title || 'Untitled'}</span>
                    {doc.is_favorite && (
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 flex-shrink-0" />
                    )}
                  </div>
                  {isSelected && (
                    <div className="flex items-center gap-1 text-[11px] text-neutral-400">
                      <span>Jump to page</span>
                      <CornerDownLeft className="w-3 h-3" />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 border-t border-neutral-100 dark:border-neutral-800/60 bg-neutral-50 dark:bg-neutral-900/50 flex items-center justify-between text-[11px] text-neutral-400">
          <span>Navigate with <kbd className="px-1 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">↑</kbd> <kbd className="px-1 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">↓</kbd></span>
          <span>Select with <kbd className="px-1 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">Enter</kbd></span>
        </div>
      </div>
    </div>
  );
}
