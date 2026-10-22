'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  FileText,
  Copy,
  Check,
  Plus,
  X,
  Loader2,
  RotateCcw,
  BookOpen,
  FolderPlus,
} from 'lucide-react';
import { AttachedFile } from './DocumentAttachments';

interface DocumentAIModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: AttachedFile | null;
  initialAction?: 'doc_summarize' | 'doc_notes';
  onInsertIntoPage: (markdown: string) => void;
  onCreateSubpage?: (title: string, markdown: string) => void;
}

export function DocumentAIModal({
  isOpen,
  onClose,
  file,
  initialAction = 'doc_summarize',
  onInsertIntoPage,
  onCreateSubpage,
}: DocumentAIModalProps) {
  const [action, setAction] = useState<'doc_summarize' | 'doc_notes'>(initialAction);
  const [isLoading, setIsLoading] = useState(false);
  const [streamedText, setStreamedText] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && file) {
      handleGenerate(action);
    } else {
      setStreamedText('');
      setError(null);
    }
  }, [isOpen, file, action]);

  if (!isOpen || !file) return null;

  const handleGenerate = async (targetAction: 'doc_summarize' | 'doc_notes') => {
    setIsLoading(true);
    setStreamedText('');
    setError(null);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: targetAction,
          fileData: file.url,
          fileName: file.name,
          fileType: file.type,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to process document');
      }

      if (!res.body) throw new Error('No stream available');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;
        setStreamedText(accumulated);
      }
    } catch (err: any) {
      console.error('Error generating document insights:', err);
      setError(err.message || 'Something went wrong while processing the document.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!streamedText) return;
    navigator.clipboard.writeText(streamedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInsert = () => {
    if (!streamedText) return;
    onInsertIntoPage(streamedText);
    onClose();
  };

  const handleCreateSub = () => {
    if (!streamedText || !onCreateSubpage) return;
    const subTitle = `${file.name.replace(/\.[^/.]+$/, '')} - AI Notes`;
    onCreateSubpage(subTitle, streamedText);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="p-4 border-b border-neutral-200/80 dark:border-neutral-800 bg-[#fbfbfa] dark:bg-[#1a1a1a] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  Notion AI Document Insights
                </h3>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-semibold uppercase">
                  Gemini 3.5
                </span>
              </div>
              <div className="text-xs text-neutral-500 truncate max-w-sm">
                Analyzing: <span className="font-medium text-neutral-700 dark:text-neutral-300">{file.name}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Controls: Summarize vs Structured Notes */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/60 dark:bg-neutral-900/40">
          <button
            onClick={() => setAction('doc_summarize')}
            disabled={isLoading}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
              action === 'doc_summarize'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-neutral-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Executive Summary</span>
          </button>

          <button
            onClick={() => setAction('doc_notes')}
            disabled={isLoading}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
              action === 'doc_notes'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-neutral-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Structured Notes</span>
          </button>
        </div>

        {/* Content Preview Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3 font-sans">
          {error && (
            <div className="p-3 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 rounded-xl border border-red-200 dark:border-red-900">
              {error}
            </div>
          )}

          {isLoading && !streamedText && (
            <div className="flex flex-col items-center justify-center py-12 text-center text-neutral-400 space-y-3">
              <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
              <div className="text-xs">
                Reading <span className="font-semibold text-neutral-700 dark:text-neutral-300">{file.name}</span> and synthesizing insights with Gemini...
              </div>
            </div>
          )}

          {streamedText && (
            <div className="text-xs text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap leading-relaxed">
              {streamedText}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3.5 border-t border-neutral-200/80 dark:border-neutral-800 bg-[#fbfbfa] dark:bg-[#1a1a1a] flex flex-wrap items-center justify-between gap-2">
          <button
            onClick={() => handleGenerate(action)}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Regenerate</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              disabled={!streamedText}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition border border-neutral-200 dark:border-neutral-700 disabled:opacity-40"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            {onCreateSubpage && (
              <button
                onClick={handleCreateSub}
                disabled={!streamedText}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/50 border border-purple-200/60 dark:border-purple-800/60 transition disabled:opacity-40 shadow-xs"
                title="Create a new child document containing these notes"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>Create Sub-page Note</span>
              </button>
            )}

            <button
              onClick={handleInsert}
              disabled={!streamedText}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 transition disabled:opacity-40 shadow-sm"
              title="Insert notes directly into current active document"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Insert to Page</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
