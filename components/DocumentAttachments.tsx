'use client';

import React, { useState, useRef, useMemo } from 'react';
import {
  Folder,
  FolderPlus,
  FolderOpen,
  FileText,
  File,
  FileImage,
  FileCode,
  Download,
  Trash2,
  Plus,
  Sparkles,
  BookOpen,
  MessageSquare,
  Stethoscope,
  ChevronRight,
  ArrowLeft,
  Search,
  LayoutGrid,
  List,
  MoveRight,
  MoreVertical,
  Edit2,
  Eye,
  UploadCloud,
  Check,
  Palette,
  X,
  Loader2,
} from 'lucide-react';
import { AttachedFile } from '@/lib/types';
export type { AttachedFile };
import { DocumentAIModal } from './DocumentAIModal';
import { PdfPreviewModal } from './PdfPreviewModal';

const FOLDER_COLORS: { id: string; label: string; bg: string; text: string; border: string; iconColor: string }[] = [
  { id: 'blue', label: 'OneDrive Blue', bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800', iconColor: 'text-blue-500 dark:text-blue-400' },
  { id: 'purple', label: 'Royal Purple', bg: 'bg-purple-50 dark:bg-purple-950/40', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800', iconColor: 'text-purple-500 dark:text-purple-400' },
  { id: 'emerald', label: 'Clinical Emerald', bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800', iconColor: 'text-emerald-500 dark:text-emerald-400' },
  { id: 'amber', label: 'Amber Gold', bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800', iconColor: 'text-amber-500 dark:text-amber-400' },
  { id: 'rose', label: 'Rose Coral', bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-800', iconColor: 'text-rose-500 dark:text-rose-400' },
  { id: 'indigo', label: 'Deep Indigo', bg: 'bg-indigo-50 dark:bg-indigo-950/40', text: 'text-indigo-700 dark:text-indigo-300', border: 'border-indigo-200 dark:border-indigo-800', iconColor: 'text-indigo-500 dark:text-indigo-400' },
];

function getFolderColorTheme(colorId?: string) {
  return FOLDER_COLORS.find((c) => c.id === colorId) || FOLDER_COLORS[0];
}

interface DocumentAttachmentsProps {
  files: AttachedFile[];
  onUpdateFiles: (files: AttachedFile[]) => void;
  editable?: boolean;
  onInsertIntoPage?: (markdown: string) => void;
  onCreateSubpageWithNotes?: (title: string, markdown: string) => void;
  onChatWithDocument?: (doc: AttachedFile) => void;
  onClose?: () => void;
}

export function DocumentAttachments({
  files = [],
  onUpdateFiles,
  editable = true,
  onInsertIntoPage,
  onCreateSubpageWithNotes,
  onChatWithDocument,
  onClose,
}: DocumentAttachmentsProps) {
  // Navigation & View State
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isDragOverFolderId, setIsDragOverFolderId] = useState<string | null>(null);

  // Modals state
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('blue');

  const [editingFolder, setEditingFolder] = useState<AttachedFile | null>(null);
  const [editingFolderName, setEditingFolderName] = useState('');
  const [editingFolderColor, setEditingFolderColor] = useState('blue');

  const [moveFileTarget, setMoveFileTarget] = useState<AttachedFile | null>(null);
  const [folderMenuOpenId, setFolderMenuOpenId] = useState<string | null>(null);

  const [previewFile, setPreviewFile] = useState<AttachedFile | null>(null);
  const [activeAIFile, setActiveAIFile] = useState<AttachedFile | null>(null);
  const [activeAIAction, setActiveAIAction] = useState<'doc_summarize' | 'doc_notes'>('doc_summarize');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Data Separation
  const kanbanFiles = useMemo(() => files.filter((f) => f.id === '__kanban__'), [files]);
  const allFolders = useMemo(
    () => files.filter((f) => f.id !== '__kanban__' && (f.isFolder || f.type === 'folder')),
    [files]
  );
  const allRealFiles = useMemo(
    () => files.filter((f) => f.id !== '__kanban__' && !f.isFolder && f.type !== 'folder'),
    [files]
  );

  // Active Folder Object
  const currentFolder = useMemo(
    () => (currentFolderId ? allFolders.find((f) => f.id === currentFolderId) || null : null),
    [currentFolderId, allFolders]
  );

  // Files in Current Scope
  const displayedFiles = useMemo(() => {
    let result: AttachedFile[] = [];
    if (currentFolderId) {
      result = allRealFiles.filter((f) => f.folderId === currentFolderId);
    } else {
      result = allRealFiles.filter((f) => !f.folderId);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      // If searching, search across all files in this doc
      return allRealFiles.filter((f) => f.name.toLowerCase().includes(q));
    }
    return result;
  }, [currentFolderId, allRealFiles, searchQuery]);

  // Folders to show (only at Root level, or matching search)
  const displayedFolders = useMemo(() => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return allFolders.filter((f) => f.name.toLowerCase().includes(q));
    }
    if (currentFolderId) {
      return []; // Flat 1-level folder hierarchy like OneDrive quick folders
    }
    return allFolders;
  }, [currentFolderId, allFolders, searchQuery]);

  // Helpers
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

  const getFolderFileCount = (folderId: string) => {
    return allRealFiles.filter((f) => f.folderId === folderId).length;
  };

  const getFolderTotalSize = (folderId: string) => {
    const total = allRealFiles
      .filter((f) => f.folderId === folderId)
      .reduce((acc, f) => acc + (f.size || 0), 0);
    return formatFileSize(total);
  };

  // Folder Actions
  const handleCreateFolder = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newFolderName.trim()) return;

    const newFolder: AttachedFile = {
      id: `folder_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: newFolderName.trim(),
      size: 0,
      type: 'folder',
      url: '',
      uploadedAt: new Date().toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      isFolder: true,
      color: newFolderColor,
    };

    onUpdateFiles([...files, newFolder]);
    setNewFolderName('');
    setNewFolderColor('blue');
    setIsNewFolderOpen(false);
  };

  const handleUpdateFolder = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editingFolder || !editingFolderName.trim()) return;

    const updated = files.map((f) => {
      if (f.id === editingFolder.id) {
        return {
          ...f,
          name: editingFolderName.trim(),
          color: editingFolderColor,
        };
      }
      return f;
    });

    onUpdateFiles(updated);
    setEditingFolder(null);
  };

  const handleDeleteFolder = (folderId: string) => {
    const folderFiles = allRealFiles.filter((f) => f.folderId === folderId);
    let updated: AttachedFile[] = [];

    if (folderFiles.length > 0) {
      const confirmMove = window.confirm(
        `This folder contains ${folderFiles.length} file(s). Click OK to delete the folder and move its files to the main page, or Cancel to delete everything.`
      );
      if (confirmMove) {
        // Move files to root
        updated = files
          .filter((f) => f.id !== folderId)
          .map((f) => (f.folderId === folderId ? { ...f, folderId: null } : f));
      } else {
        // Delete folder AND files
        updated = files.filter((f) => f.id !== folderId && f.folderId !== folderId);
      }
    } else {
      updated = files.filter((f) => f.id !== folderId);
    }

    if (currentFolderId === folderId) {
      setCurrentFolderId(null);
    }
    onUpdateFiles(updated);
  };

  // Upload Files into Current Folder
  const handleFileUpload = (uploadedFiles: FileList | null, targetFolderId = currentFolderId) => {
    if (!uploadedFiles || uploadedFiles.length === 0) return;
    setIsUploading(true);

    const fileList = Array.from(uploadedFiles);
    setUploadProgress(`Reading ${fileList.length} file(s)...`);
    const newAttachments: AttachedFile[] = [];

    fileList.forEach((file) => {
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
          folderId: targetFolderId || null,
          isFolder: false,
        };

        newAttachments.push(fileObj);

        if (newAttachments.length === fileList.length) {
          onUpdateFiles([...files, ...newAttachments]);
          setIsUploading(false);
          setUploadProgress(null);
        }
      };

      reader.onerror = () => {
        console.error('Error reading file:', file.name);
        setIsUploading(false);
        setUploadProgress(null);
      };

      reader.readAsDataURL(file);
    });
  };

  // Move File to Destination Folder
  const handleMoveFile = (fileId: string, destFolderId: string | null) => {
    const updated = files.map((f) => {
      if (f.id === fileId) {
        return { ...f, folderId: destFolderId };
      }
      return f;
    });
    onUpdateFiles(updated);
    setMoveFileTarget(null);
  };

  const handleDeleteFile = (id: string, e: React.MouseEvent) => {
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

  const handleTriggerAI = (file: AttachedFile, action: 'doc_summarize' | 'doc_notes', e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveAIFile(file);
    setActiveAIAction(action);
  };

  return (
    <div className="my-8 border-t border-neutral-200 dark:border-neutral-800/80 pt-6">
      {/* OneDrive Style Command Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        {/* Title & Breadcrumbs */}
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={() => {
              setCurrentFolderId(null);
              setSearchQuery('');
            }}
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 hover:text-purple-600 dark:hover:text-purple-400 transition"
          >
            <Folder className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Files & OneDrive Folders</span>
          </button>

          {currentFolder && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                <FolderOpen className="w-3.5 h-3.5 text-blue-500" />
                <span>{currentFolder.name}</span>
              </div>
            </>
          )}

          {searchQuery && (
            <span className="text-xs text-neutral-400">
              (Search: &quot;{searchQuery}&quot;)
            </span>
          )}
        </div>

        {/* Command Bar Action Controls */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Search Bar */}
          <div className="relative flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter PDFs & files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-2.5 py-1 text-xs bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-800 dark:text-neutral-200 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-blue-500 w-full sm:w-44"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-neutral-100 dark:bg-neutral-800/80 p-0.5 rounded-lg border border-neutral-200 dark:border-neutral-700">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-neutral-700 text-blue-600 dark:text-blue-400 shadow-2xs' : 'text-neutral-400 hover:text-neutral-600'}`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1 rounded ${viewMode === 'list' ? 'bg-white dark:bg-neutral-700 text-blue-600 dark:text-blue-400 shadow-2xs' : 'text-neutral-400 hover:text-neutral-600'}`}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Action: New Folder */}
          {editable && (
            <button
              type="button"
              onClick={() => {
                setNewFolderName('');
                setIsNewFolderOpen(true);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-neutral-700 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 transition shadow-2xs cursor-pointer"
            >
              <FolderPlus className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>New Folder</span>
            </button>
          )}

          {/* Action: Upload File */}
          {editable && (
            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 transition shadow-xs cursor-pointer"
            >
              {isUploading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Plus className="w-3.5 h-3.5" />
              )}
              <span>
                {isUploading
                  ? (uploadProgress || 'Uploading...')
                  : currentFolder
                  ? `Upload to ${currentFolder.name}`
                  : 'Upload PDF'}
              </span>
            </button>
          )}

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
              title="Hide OneDrive folders & files"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFileUpload(e.target.files, currentFolderId);
            e.target.value = '';
          }
        }}
        className="hidden"
      />

      {/* Breadcrumb Back Button when inside a folder */}
      {currentFolder && (
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-100 dark:border-neutral-800">
          <button
            type="button"
            onClick={() => setCurrentFolderId(null)}
            className="flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Folders</span>
          </button>
          <span className="text-[11px] text-neutral-400">
            {displayedFiles.length} file(s) • {getFolderTotalSize(currentFolder.id)}
          </span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. FOLDERS SECTION (OneDrive Tiles) */}
      {/* ========================================================================= */}
      {displayedFolders.length > 0 && (
        <div className="mb-6">
          <div className="text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-2">
            Folders ({displayedFolders.length})
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {displayedFolders.map((folder) => {
              const theme = getFolderColorTheme(folder.color);
              const fileCount = getFolderFileCount(folder.id);
              const isMenuOpen = folderMenuOpenId === folder.id;

              return (
                <div
                  key={folder.id}
                  onClick={() => setCurrentFolderId(folder.id)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDragOverFolderId(folder.id);
                  }}
                  onDragLeave={() => {
                    setIsDragOverFolderId((prev) => (prev === folder.id ? null : prev));
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDragOverFolderId(null);

                    // 1. Check if dragging an existing file inside the app
                    const internalFileId = e.dataTransfer.getData('text/plain');
                    if (internalFileId && files.some((f) => f.id === internalFileId)) {
                      handleMoveFile(internalFileId, folder.id);
                      return;
                    }

                    // 2. Check if dragging files from outside desktop
                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                      handleFileUpload(e.dataTransfer.files, folder.id);
                    }
                  }}
                  className={`group relative flex flex-col justify-between p-3 rounded-xl border ${
                    isDragOverFolderId === folder.id
                      ? 'ring-2 ring-blue-500 scale-[1.03] shadow-md border-blue-400 bg-blue-50/80 dark:bg-blue-950/60'
                      : `${theme.border} ${theme.bg} hover:shadow-md hover:scale-[1.01]`
                  } transition-all cursor-pointer`}
                >
                  <div className="flex items-start justify-between gap-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <Folder className={`w-6 h-6 ${theme.iconColor} flex-shrink-0`} />
                      <div className="truncate font-semibold text-xs text-neutral-800 dark:text-neutral-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition" title={folder.name}>
                        {folder.name}
                      </div>
                    </div>

                    {/* Folder 3-dots Menu */}
                    {editable && (
                      <div
                        className="relative flex-shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => setFolderMenuOpenId(isMenuOpen ? null : folder.id)}
                          className="p-1 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 opacity-60 group-hover:opacity-100 transition"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>

                        {isMenuOpen && (
                          <div className="absolute right-0 top-6 z-20 w-36 bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 py-1 text-xs">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingFolder(folder);
                                setEditingFolderName(folder.name);
                                setEditingFolderColor(folder.color || 'blue');
                                setFolderMenuOpenId(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                            >
                              <Edit2 className="w-3 h-3 text-neutral-400" />
                              <span>Rename / Color</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setFolderMenuOpenId(null);
                                handleDeleteFolder(folder.id);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                            >
                              <Trash2 className="w-3 h-3 text-red-500" />
                              <span>Delete Folder</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Folder Subtitle */}
                  <div className="mt-2.5 pt-2 border-t border-neutral-200/50 dark:border-neutral-700/50 flex items-center justify-between text-[10px] text-neutral-500 dark:text-neutral-400">
                    <span>{fileCount} {fileCount === 1 ? 'file' : 'files'}</span>
                    <span>{folder.uploadedAt}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. DRAG & DROP / EMPTY STATE */}
      {/* ========================================================================= */}
      {displayedFiles.length === 0 && displayedFolders.length === 0 && (
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
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition ${
            isDragging
              ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
              : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-neutral-50/40 dark:bg-neutral-900/30'
          }`}
        >
          <UploadCloud className="w-10 h-10 text-blue-500/80 mx-auto mb-2.5" />
          <h4 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
            {currentFolder ? `This folder "${currentFolder.name}" is empty` : 'No files or folders yet'}
          </h4>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm mx-auto">
            Drop PDFs or documents here to upload, or use &quot;New Folder&quot; to organize like OneDrive.
          </p>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. FILES DISPLAY (GRID OR LIST) */}
      {/* ========================================================================= */}
      {displayedFiles.length > 0 && (
        <div>
          {/* Section Heading */}
          <div className="flex items-center justify-between mb-2.5">
            <div className="text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
              {currentFolder ? `Files in ${currentFolder.name} (${displayedFiles.length})` : `Files at Root (${displayedFiles.length})`}
            </div>
          </div>

          {/* GRID VIEW */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {displayedFiles.map((file) => {
                const lowerName = file.name.toLowerCase();
                const isPdf = lowerName.endsWith('.pdf') || file.type.includes('pdf');
                const fileFolder = file.folderId ? allFolders.find((f) => f.id === file.folderId) : null;

                return (
                  <div
                    key={file.id}
                    draggable={editable}
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', file.id);
                    }}
                    className="group relative flex flex-col justify-between p-3.5 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-[#202020] hover:border-blue-400 dark:hover:border-blue-700 hover:shadow-md transition cursor-grab active:cursor-grabbing"
                  >
                    {/* File Header */}
                    <div className="flex items-start justify-between gap-2 mb-2.5">
                      <div
                        onClick={() => setPreviewFile(file)}
                        className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1"
                      >
                        <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 shadow-xs border border-neutral-200/50 dark:border-neutral-700/50 flex-shrink-0 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/40 transition">
                          {getFileIcon(file.type, file.name)}
                        </div>
                        <div className="truncate flex-1">
                          <div
                            className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition"
                            title={file.name}
                          >
                            {file.name}
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 mt-0.5">
                            <span>{formatFileSize(file.size)}</span>
                            <span>•</span>
                            <span>{file.uploadedAt}</span>
                            {fileFolder && !currentFolderId && (
                              <span className="px-1.5 py-0.2 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-medium">
                                📁 {fileFolder.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Header Buttons: Preview, Move, Download, Delete */}
                      <div className="flex items-center gap-1 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => setPreviewFile(file)}
                          title="Preview Document"
                          className="p-1 rounded text-neutral-400 hover:text-blue-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {editable && (
                          <button
                            type="button"
                            onClick={() => setMoveFileTarget(file)}
                            title="Move to Folder"
                            className="p-1 rounded text-neutral-400 hover:text-blue-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                          >
                            <MoveRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => handleDownload(file, e)}
                          title="Download file"
                          className="p-1 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        {editable && (
                          <button
                            type="button"
                            onClick={(e) => handleDeleteFile(file.id, e)}
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
                        type="button"
                        onClick={(e) => handleTriggerAI(file, 'doc_summarize', e)}
                        className="flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/50 border border-purple-200/60 dark:border-purple-800/60 transition shadow-2xs"
                        title="Generate executive summary"
                      >
                        <Sparkles className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                        <span>Summarize</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleTriggerAI(file, 'doc_notes', e)}
                        className="flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-200/60 dark:border-neutral-700/60 transition shadow-2xs"
                        title="Generate study notes"
                      >
                        <BookOpen className="w-3 h-3 text-neutral-500" />
                        <span>Notes</span>
                      </button>

                      {isPdf && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.dispatchEvent(
                              new CustomEvent('notion:open_pdf_guideline_modal', { detail: file })
                            );
                          }}
                          className="flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200/60 dark:border-emerald-800/60 transition shadow-2xs"
                          title="Sync clinical guidelines to Common Presentations"
                        >
                          <Stethoscope className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          <span>Sync</span>
                        </button>
                      )}

                      {onChatWithDocument && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onChatWithDocument(file);
                          }}
                          className="p-1 rounded-md text-neutral-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
                          title="Chat with this PDF"
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

          {/* LIST / TABLE VIEW (Like OneDrive Details) */}
          {viewMode === 'list' && (
            <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden bg-white dark:bg-[#202020]">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 text-neutral-500 dark:text-neutral-400 font-semibold">
                    <th className="py-2.5 px-3">Name</th>
                    <th className="py-2.5 px-3 hidden sm:table-cell">Folder</th>
                    <th className="py-2.5 px-3 hidden sm:table-cell">Size</th>
                    <th className="py-2.5 px-3 hidden md:table-cell">Uploaded</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                  {displayedFiles.map((file) => {
                    const fileFolder = file.folderId ? allFolders.find((f) => f.id === file.folderId) : null;
                    const isPdf = file.name.toLowerCase().endsWith('.pdf') || file.type.includes('pdf');

                    return (
                      <tr
                        key={file.id}
                        draggable={editable}
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', file.id);
                        }}
                        className="hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition group cursor-grab active:cursor-grabbing"
                      >
                        <td className="py-2.5 px-3">
                          <div
                            onClick={() => setPreviewFile(file)}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            {getFileIcon(file.type, file.name)}
                            <span className="font-semibold text-neutral-800 dark:text-neutral-200 group-hover:text-blue-600 truncate max-w-xs" title={file.name}>
                              {file.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 hidden sm:table-cell text-neutral-500">
                          {fileFolder ? (
                            <span className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-[11px] font-medium text-neutral-700 dark:text-neutral-300">
                              📁 {fileFolder.name}
                            </span>
                          ) : (
                            <span className="text-[11px] text-neutral-400">Root</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 hidden sm:table-cell text-neutral-500">
                          {formatFileSize(file.size)}
                        </td>
                        <td className="py-2.5 px-3 hidden md:table-cell text-neutral-400">
                          {file.uploadedAt}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setPreviewFile(file)}
                              title="Preview"
                              className="p-1 rounded text-neutral-400 hover:text-blue-600 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleTriggerAI(file, 'doc_summarize', e)}
                              title="Summarize with AI"
                              className="p-1 rounded text-neutral-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                            </button>
                            {isPdf && (
                              <button
                                type="button"
                                onClick={() => {
                                  window.dispatchEvent(
                                    new CustomEvent('notion:open_pdf_guideline_modal', { detail: file })
                                  );
                                }}
                                title="Sync to Common Presentations"
                                className="p-1 rounded text-neutral-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                              >
                                <Stethoscope className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {editable && (
                              <button
                                type="button"
                                onClick={() => setMoveFileTarget(file)}
                                title="Move to Folder"
                                className="p-1 rounded text-neutral-400 hover:text-blue-600 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                              >
                                <MoveRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={(e) => handleDownload(file, e)}
                              title="Download"
                              className="p-1 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                            {editable && (
                              <button
                                type="button"
                                onClick={(e) => handleDeleteFile(file.id, e)}
                                title="Delete"
                                className="p-1 rounded text-neutral-400 hover:text-red-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MODAL: CREATE NEW FOLDER */}
      {/* ========================================================================= */}
      {isNewFolderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs animate-in fade-in duration-100">
          <div className="w-full max-w-md bg-white dark:bg-[#202020] rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/50 text-blue-600">
                <FolderPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  Create New OneDrive Folder
                </h3>
                <p className="text-xs text-neutral-500">
                  Organize lecture slides, clinical leaflets, or guidelines on this page.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateFolder} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Folder Name
                </label>
                <input
                  type="text"
                  autoFocus
                  placeholder="e.g. RCGP Dermatology Slides 2026"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Color Picker */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Folder Color Accent
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {FOLDER_COLORS.map((col) => (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => setNewFolderColor(col.id)}
                      className={`h-8 rounded-lg border ${col.border} ${col.bg} flex items-center justify-center transition ${newFolderColor === col.id ? 'ring-2 ring-blue-500 ring-offset-1' : 'hover:scale-105'}`}
                      title={col.label}
                    >
                      {newFolderColor === col.id && <Check className={`w-3.5 h-3.5 ${col.iconColor}`} />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewFolderOpen(false)}
                  className="px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newFolderName.trim()}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition disabled:opacity-50 shadow-xs cursor-pointer"
                >
                  Create Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODAL: EDIT / RENAME FOLDER */}
      {/* ========================================================================= */}
      {editingFolder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs animate-in fade-in duration-100">
          <div className="w-full max-w-md bg-white dark:bg-[#202020] rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/50 text-blue-600">
                <Edit2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  Folder Settings
                </h3>
                <p className="text-xs text-neutral-500">
                  Update folder title or theme color.
                </p>
              </div>
            </div>

            <form onSubmit={handleUpdateFolder} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Folder Name
                </label>
                <input
                  type="text"
                  autoFocus
                  value={editingFolderName}
                  onChange={(e) => setEditingFolderName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Color Picker */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Color Accent
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {FOLDER_COLORS.map((col) => (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => setEditingFolderColor(col.id)}
                      className={`h-8 rounded-lg border ${col.border} ${col.bg} flex items-center justify-center transition ${editingFolderColor === col.id ? 'ring-2 ring-blue-500 ring-offset-1' : 'hover:scale-105'}`}
                      title={col.label}
                    >
                      {editingFolderColor === col.id && <Check className={`w-3.5 h-3.5 ${col.iconColor}`} />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingFolder(null)}
                  className="px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!editingFolderName.trim()}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition disabled:opacity-50 shadow-xs cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. MODAL: MOVE FILE TO FOLDER */}
      {/* ========================================================================= */}
      {moveFileTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs animate-in fade-in duration-100">
          <div className="w-full max-w-sm bg-white dark:bg-[#202020] rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 p-5">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-1">
              Move &quot;{moveFileTarget.name}&quot;
            </h3>
            <p className="text-xs text-neutral-500 mb-4">
              Choose destination folder for this document:
            </p>

            <div className="space-y-1.5 max-h-60 overflow-y-auto mb-4">
              {/* Root option */}
              <button
                type="button"
                onClick={() => handleMoveFile(moveFileTarget.id, null)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${!moveFileTarget.folderId ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'}`}
              >
                <div className="flex items-center gap-2">
                  <Folder className="w-4 h-4 text-neutral-400" />
                  <span>Main Page (Root / No Folder)</span>
                </div>
                {!moveFileTarget.folderId && <Check className="w-3.5 h-3.5 text-blue-600" />}
              </button>

              {/* Folders */}
              {allFolders.map((folder) => {
                const isCurrent = moveFileTarget.folderId === folder.id;
                const theme = getFolderColorTheme(folder.color);

                return (
                  <button
                    key={folder.id}
                    type="button"
                    onClick={() => handleMoveFile(moveFileTarget.id, folder.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${isCurrent ? `${theme.bg} ${theme.text} border ${theme.border}` : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'}`}
                  >
                    <div className="flex items-center gap-2">
                      <Folder className={`w-4 h-4 ${theme.iconColor}`} />
                      <span>{folder.name}</span>
                    </div>
                    {isCurrent && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setMoveFileTarget(null)}
                className="px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. PDF PREVIEW / VIEWER MODAL */}
      {/* ========================================================================= */}
      {previewFile && (
        <PdfPreviewModal
          isOpen={!!previewFile}
          onClose={() => setPreviewFile(null)}
          file={previewFile}
          onSummarize={(f) => handleTriggerAI(f, 'doc_summarize', { stopPropagation: () => {} } as any)}
          onStudyNotes={(f) => handleTriggerAI(f, 'doc_notes', { stopPropagation: () => {} } as any)}
          onChatWithDocument={onChatWithDocument}
        />
      )}

      {/* ========================================================================= */}
      {/* 8. DOCUMENT AI MODAL (Summary / Study Notes) */}
      {/* ========================================================================= */}
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
