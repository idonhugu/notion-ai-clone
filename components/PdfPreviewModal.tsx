'use client';

import React from 'react';
import {
  X,
  Download,
  ExternalLink,
  FileText,
  Sparkles,
  BookOpen,
  Stethoscope,
  MessageSquare,
} from 'lucide-react';
import { AttachedFile } from '@/lib/types';

interface PdfPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: AttachedFile | null;
  onSummarize?: (file: AttachedFile) => void;
  onStudyNotes?: (file: AttachedFile) => void;
  onChatWithDocument?: (file: AttachedFile) => void;
}

export function PdfPreviewModal({
  isOpen,
  onClose,
  file,
  onSummarize,
  onStudyNotes,
  onChatWithDocument,
}: PdfPreviewModalProps) {
  if (!isOpen || !file) return null;

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = file.url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleOpenInNewTab = () => {
    // If it's a data url or blob, open in new window
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(
        `<iframe src="${file.url}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`
      );
      newWindow.document.title = file.name;
    }
  };

  const isPdf = file.name.toLowerCase().endsWith('.pdf') || file.type.includes('pdf');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-5xl h-[88vh] flex flex-col bg-white dark:bg-[#1f1f1f] rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-900/80">
          <div className="flex items-center gap-2.5 min-w-0 pr-3">
            <div className="p-1.5 rounded-lg bg-red-100 dark:bg-red-950/60 border border-red-200 dark:border-red-800/50 flex-shrink-0">
              <FileText className="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>
            <div className="truncate">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate" title={file.name}>
                {file.name}
              </h3>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Uploaded {file.uploadedAt}
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {onSummarize && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSummarize(file);
                }}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/50 border border-purple-200/60 dark:border-purple-800/60 transition"
                title="Generate AI summary"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>Summarize</span>
              </button>
            )}

            {onStudyNotes && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onStudyNotes(file);
                }}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 transition"
                title="Generate study notes"
              >
                <BookOpen className="w-3.5 h-3.5 text-neutral-500" />
                <span>Notes</span>
              </button>
            )}

            {isPdf && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  window.dispatchEvent(
                    new CustomEvent('notion:open_pdf_guideline_modal', { detail: file })
                  );
                }}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200/60 dark:border-emerald-800/60 transition"
                title="Sync clinical guidelines to Common Presentations"
              >
                <Stethoscope className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Sync to Pres</span>
              </button>
            )}

            {onChatWithDocument && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onChatWithDocument(file);
                }}
                className="p-1.5 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition"
                title="Chat with this PDF"
              >
                <MessageSquare className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={handleOpenInNewTab}
              className="p-1.5 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition"
              title="Open in new window"
            >
              <ExternalLink className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="p-1.5 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition"
              title="Download PDF"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition ml-1"
              title="Close viewer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Viewer Body */}
        <div className="flex-1 w-full bg-neutral-100 dark:bg-neutral-950 p-2 sm:p-4 overflow-hidden">
          {file.url ? (
            <iframe
              src={file.url}
              title={file.name}
              className="w-full h-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-neutral-400 text-sm">
              No preview available for this file.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
