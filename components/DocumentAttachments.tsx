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
} from 'lucide-react';

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
}

export function DocumentAttachments({
  files = [],
  onUpdateFiles,
  editable = true,
}: DocumentAttachmentsProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string, name: string) => {
    if (type.startsWith('image/')) return <FileImage className="w-4 h-4 text-purple-500" />;
    if (type.includes('pdf')) return <FileText className="w-4 h-4 text-red-500" />;
    if (name.endsWith('.js') || name.endsWith('.ts') || name.endsWith('.json') || name.endsWith('.py')) {
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
          onUpdateFiles([...files, ...newAttachments]);
          setIsUploading(false);
        }
      };

      reader.readAsDataURL(file);
    });
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateFiles(files.filter((f) => f.id !== id));
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

  return (
    <div className="my-6 border-t border-neutral-100 dark:border-neutral-800/80 pt-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
          <Paperclip className="w-3.5 h-3.5" />
          <span>Attachments & Documents ({files.length})</span>
        </div>

        {editable && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
          >
            <Plus className="w-3 h-3" />
            <span>Upload File</span>
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
      {files.length === 0 && editable && (
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
            Click or drag & drop files here to attach to this note
          </p>
          <p className="text-[11px] text-neutral-400 mt-0.5">
            PDFs, images, documents, spreadsheets (stored safely with document)
          </p>
        </div>
      )}

      {/* File list */}
      {files.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {files.map((file) => (
            <div
              key={file.id}
              onClick={(e) => handleDownload(file, e)}
              className="group relative flex items-center justify-between p-2.5 rounded-lg border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/40 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <div className="p-1.5 rounded-md bg-white dark:bg-neutral-800 shadow-sm border border-neutral-200/50 dark:border-neutral-700/50 flex-shrink-0">
                  {getFileIcon(file.type, file.name)}
                </div>
                <div className="truncate">
                  <div className="text-xs font-medium text-neutral-800 dark:text-neutral-200 truncate">
                    {file.name}
                  </div>
                  <div className="text-[10px] text-neutral-400">
                    {formatFileSize(file.size)} • {file.uploadedAt}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => handleDownload(file, e)}
                  title="Download file"
                  className="p-1 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
                {editable && (
                  <button
                    onClick={(e) => handleDelete(file.id, e)}
                    title="Remove attachment"
                    className="p-1 rounded text-neutral-400 hover:text-red-500 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
