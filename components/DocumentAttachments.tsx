'use client';

import React, { useState, useRef } from 'react';
import {
  Paperclip,
  UploadCloud,
  FileText,
  File,
  FileImage,
  FileCode,
  Download,
  Trash2,
  X,
  Plus,
  Sparkles,
  BookOpen,
  MessageSquare,
} from 'lucide-react';
import { DocumentAIModal } from './DocumentAIModal';

export interface AttachedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: string;
}

interface DocumentAttachmentsProps {
  files: AttachedFile[];
  onUpdateFiles: (files: AttachedFile[]) => void;
  editable?: boolean;
  onInsertIntoPage?: (markdown: string) => void;
  onCreateSubpageWithNotes?: (title: string, markdown: string) => void;
  onChatWithDocument?: (doc: AttachedFile) => void;
}

export function DocumentAttachments({
  files = [],
  onUpdateFiles,
  editable = true,
  onInsertIntoPage,
  onCreateSubpageWithNotes,
  onChatWithDocument,
}: DocumentAttachmentsProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [activeAIFile, setActiveAIFile] = useState<AttachedFile | null>(null);
  const [activeAIAction, setActiveAIAction] = useState<'doc_summarize' | 'doc_notes'>('doc_summarize');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const visibleFiles = files.filter((f) => f.id !== '__kanban__');
  const kanbanFiles = files.filter((f) => f.id === '__kanban__');

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string, name: string) => {
    if (type.startsWith('image/')) return <FileImage className="w-4 h-4 text-purple-500" />;
    if (type.includes('pdf') || name.toLowerCase().endsWith('.pdf')) {
      return <FileText className="w-4 h-4 text-red-500" />;
    }
    if (
      name.endsWith('.js') ||
      name.endsWith('.ts') ||
      name.endsWith('.json') ||
      name.endsWith('.py')
    ) {
      return <FileCode className="w-4 h-4 text-emerald-500" />;
    }
    return <File className="w-4 h-4 text-blue-500" />;
  };

  const handleFileUpload = (uploadedFiles: FileList | null) => {
    if (!uploadedFiles || uploadedFiles.length === 0) return;
    setIsUploading(true);

    const newAttachments: AttachedFile[] = [];

    Array.from(uploadedFiles).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const fileObj: AttachedFile = {
          id: `file_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          name: file.name,
          size: file.size,
          type: file.type || 'application/octet-stream',
          url: reader.result as string,
          uploadedAt: new Date().toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
        };

        newAttachments.push(fileObj);

        if (newAttachments.length === uploadedFiles.length) {
          onUpdateFiles([...kanbanFiles, ...visibleFiles, ...newAttachments]);
          setIsUploading(false);
        }
      };

      reader.readAsDataURL(file);
    });
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateFiles([...kanbanFiles, ...visibleFiles.filter((f) => f.id !== id)]);
  };

  const handleDownload = (file: AttachedFile, e: React.MouseEvent) => {
    e.stopPropagation();
    const a = document.createElement('a');
    a.href = file.url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleTriggerAI = (file: AttachedFile, action: 'doc_summarize' | 'doc_notes', e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveAIFile(file);
    setActiveAIAction(action);
  };

  return (
    <div className="my-6 border-t border-neutral-100 dark:border-neutral-800/80 pt-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
          <Paperclip className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
          <span>Documents & PDF Attachments ({visibleFiles.length})</span>
        </div>

        {editable && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/50 border border-purple-200/60 dark:border-purple-800/60 transition shadow-xs"
          >
            <Plus className="w-3 h-3" />
            <span>Attach Document</span>
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={(e) => handleFileUpload(e.target.files)}
        className="hidden"
      />

      {/* Drag & drop upload area if empty */}
      {visibleFiles.length === 0 && editable && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFileUpload(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
            isDragging
              ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/20'
              : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-neutral-50/40 dark:bg-neutral-900/30'
          }`}
        >
          <UploadCloud className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
          <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
            Attach PDFs, documents, or spreadsheets to this note
          </p>
          <p className="text-[11px] text-neutral-400 mt-0.5">
            Use Laksha's AI to summarize, extract study notes, and reference in chat
          </p>
        </div>
      )}

      {/* File list cards with AI action buttons */}
      {visibleFiles.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {visibleFiles.map((file) => {
            const isPdf = file.name.toLowerCase().endsWith('.pdf') || file.type.includes('pdf');

            return (
              <div
                key={file.id}
                className="group relative flex flex-col justify-between p-3 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-[#202020] hover:border-purple-300 dark:hover:border-purple-800/80 hover:shadow-md transition"
              >
                {/* File Header */}
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 shadow-xs border border-neutral-200/50 dark:border-neutral-700/50 flex-shrink-0">
                      {getFileIcon(file.type, file.name)}
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate" title={file.name}>
                        {file.name}
                      </div>
                      <div className="text-[10px] text-neutral-400">
                        {formatFileSize(file.size)} • {file.uploadedAt}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button
                      onClick={(e) => handleDownload(file, e)}
                      title="Download file"
                      className="p-1 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    {editable && (
                      <button
                        onClick={(e) => handleDelete(file.id, e)}
                        title="Remove attachment"
                        className="p-1 rounded text-neutral-400 hover:text-red-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* AI Document Tools Bar */}
                <div className="flex items-center gap-1.5 pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
                  <button
                    onClick={(e) => handleTriggerAI(file, 'doc_summarize', e)}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/50 border border-purple-200/60 dark:border-purple-800/60 transition shadow-2xs"
                    title="Generate executive summary of this document"
                  >
                    <Sparkles className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                    <span>Summarize</span>
                  </button>

                  <button
                    onClick={(e) => handleTriggerAI(file, 'doc_notes', e)}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-200/60 dark:border-neutral-700/60 transition shadow-2xs"
                    title="Generate structured study / meeting notes"
                  >
                    <BookOpen className="w-3 h-3 text-neutral-500" />
                    <span>Notes</span>
                  </button>

                  {onChatWithDocument && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onChatWithDocument(file);
                      }}
                      className="p-1 rounded-md text-neutral-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition border border-transparent hover:border-purple-200 dark:hover:border-purple-800"
                      title="Ask AI questions about this document"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Document AI Modal */}
      {activeAIFile && onInsertIntoPage && (
        <DocumentAIModal
          isOpen={!!activeAIFile}
          onClose={() => setActiveAIFile(null)}
          file={activeAIFile}
          initialAction={activeAIAction}
          onInsertIntoPage={onInsertIntoPage}
          onCreateSubpage={onCreateSubpageWithNotes}
        />
      )}
    </div>
  );
}
