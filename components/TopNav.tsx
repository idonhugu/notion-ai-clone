'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Star,
  Download,
  Share2,
  Trash2,
  Maximize2,
  Minimize2,
  Sun,
  Moon,
  ChevronRight,
  Printer,
  FileText,
  FileCode,
  Clock,
  Check,
  Copy,
  Loader2,
  AlertCircle,
  MoreHorizontal,
  HelpCircle,
  CopyPlus,
  BookOpen,
  ShieldAlert,
} from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { Document } from '@/lib/types';
import { NOTION_FONTS, NotionFontStyle } from '@/lib/notionStyles';

interface TopNavProps {
  document: Document;
  parentDocument?: Document | null;
  isFullWidth: boolean;
  onToggleFullWidth: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  saveStatus: 'saved' | 'saving' | 'error' | 'local';
  onOpenAI: () => void;
  isSidecarOpen?: boolean;
  onToggleSidecar?: () => void;
  onDuplicate?: () => void;
  onOpenShortcuts?: () => void;
  onDelete?: () => void;
  wordCount: number;
  onExportMarkdown: () => void;
  currentFont?: NotionFontStyle;
  onSelectFont?: (font: NotionFontStyle) => void;
  isSmallText?: boolean;
  onToggleSmallText?: () => void;
  onManualSync?: () => void;
  onOpenEvidence?: () => void;
  onOpenInteractions?: () => void;
}

export function TopNav({
  document: doc,
  parentDocument,
  isFullWidth,
  onToggleFullWidth,
  isFavorite,
  onToggleFavorite,
  saveStatus,
  onOpenAI,
  isSidecarOpen,
  onToggleSidecar,
  onDuplicate,
  onOpenShortcuts,
  onDelete,
  wordCount,
  onExportMarkdown,
  currentFont = 'sans',
  onSelectFont,
  isSmallText = false,
  onToggleSmallText,
  onManualSync,
  onOpenEvidence,
  onOpenInteractions,
}: TopNavProps) {
  const { theme, toggleTheme } = useTheme();
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-3 md:px-6 py-2.5 bg-white/90 dark:bg-[#191919]/90 backdrop-blur-md border-b border-neutral-100 dark:border-neutral-800/80 transition-colors">
      {/* Left: Breadcrumbs & Save Indicator */}
      <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-neutral-500 dark:text-neutral-400 min-w-0 pr-2 pl-9 md:pl-0">
        <Link
          href="/"
          className="hover:text-neutral-900 dark:hover:text-neutral-100 transition truncate hidden sm:inline"
        >
          Workspace
        </Link>

        {parentDocument && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-300 dark:text-neutral-700 flex-shrink-0" />
            <Link
              href={`/doc/${parentDocument.id}`}
              className="hover:text-neutral-900 dark:hover:text-neutral-100 transition truncate max-w-[120px]"
            >
              {parentDocument.icon && <span className="mr-1">{parentDocument.icon}</span>}
              <span>{parentDocument.title || 'Untitled'}</span>
            </Link>
          </>
        )}

        <ChevronRight className="w-3.5 h-3.5 text-neutral-300 dark:text-neutral-700 flex-shrink-0 hidden sm:inline" />

        <div className="flex items-center gap-1.5 font-medium text-neutral-900 dark:text-neutral-100 truncate max-w-[150px] sm:max-w-xs">
          <span>{doc.icon || '📄'}</span>
          <span className="truncate">{doc.title || 'Untitled'}</span>
        </div>

        <div className="h-3 w-[1px] bg-neutral-200 dark:bg-neutral-800 hidden xs:block mx-0.5 sm:mx-1" />

        {/* Save & Sync Status (Visible on mobile & desktop, tap to refresh) */}
        <button
          type="button"
          onClick={onManualSync}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] hover:bg-neutral-100 dark:hover:bg-neutral-800 transition select-none flex-shrink-0 cursor-pointer"
          title="Click to force-sync with cloud database"
        >
          {saveStatus === 'saving' && (
            <>
              <Loader2 className="w-3 h-3 animate-spin text-purple-600" />
              <span className="text-purple-600 dark:text-purple-400 font-medium">Syncing...</span>
            </>
          )}
          {(saveStatus === 'saved' || saveStatus === 'local') && (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-neutral-500 dark:text-neutral-400 font-medium hidden xs:inline">Synced</span>
              <span className="text-neutral-400 dark:text-neutral-500 text-[10px] hidden sm:inline">• tap to refresh</span>
            </>
          )}
          {saveStatus === 'error' && (
            <>
              <AlertCircle className="w-3 h-3 text-amber-500" />
              <span className="text-amber-500 font-medium">Retry Sync</span>
            </>
          )}
        </button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
        {/* Word count pill */}
        <div className="hidden md:flex items-center gap-1 px-2 py-1 rounded text-[11px] text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition select-none">
          <Clock className="w-3 h-3" />
          <span>{wordCount} words • {readingTime} min read</span>
        </div>

        {/* Ask AI Copilot button with active state & gradient accent */}
        <button
          onClick={onToggleSidecar || onOpenAI}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition shadow-sm ${
            isSidecarOpen
              ? 'bg-purple-600 text-white shadow-purple-500/20 shadow-md'
              : 'text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/50 border border-purple-200/60 dark:border-purple-800/60'
          }`}
          title="Open Laksha's AI Copilot"
        >
          <Sparkles className={`w-3.5 h-3.5 ${isSidecarOpen ? 'text-white' : 'text-purple-600 dark:text-purple-400 animate-pulse'}`} />
          <span>Ask AI</span>
        </button>

        {/* Evidence Decision Support (Heidi Evidence / NICE / BNF) */}
        {onOpenEvidence && (
          <button
            onClick={onOpenEvidence}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200/60 dark:border-emerald-800/60 transition shadow-xs"
            title="Open Clinical Evidence & Decision Support (Cmd+E)"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden xs:inline">Evidence</span>
          </button>
        )}

        {/* Stockley's Drug Interactions Checker */}
        {onOpenInteractions && (
          <button
            onClick={onOpenInteractions}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-200/60 dark:border-amber-800/60 transition shadow-xs"
            title="Open Stockley's Drug Interactions Checker (Cmd+I)"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span className="hidden sm:inline">Interactions</span>
          </button>
        )}

        {/* Shortcuts Cheat Sheet trigger */}
        {onOpenShortcuts && (
          <button
            onClick={onOpenShortcuts}
            className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition hidden sm:flex"
            title="Keyboard shortcuts & Markdown cheat sheet (Cmd + /)"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        )}

        {/* Full-width toggle */}
        <button
          onClick={onToggleFullWidth}
          className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition hidden sm:flex"
          title={isFullWidth ? 'Standard width (720px)' : 'Full width canvas'}
        >
          {isFullWidth ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        {/* Theme toggle: Light / Dark */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-neutral-600" />
          )}
        </button>

        {/* Favorite toggle */}
        <button
          onClick={onToggleFavorite}
          className={`p-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition ${
            isFavorite ? 'text-amber-400 fill-amber-400' : 'text-neutral-400 hover:text-neutral-600'
          }`}
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400' : ''}`} />
        </button>

        {/* Share Button & Popover */}
        <div className="relative">
          <button
            onClick={() => setIsShareOpen(!isShareOpen)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
          >
            <Share2 className="w-3.5 h-3.5 text-neutral-500" />
            <span className="hidden sm:inline">Share</span>
          </button>

          {isShareOpen && (
            <div className="absolute right-0 top-9 z-40 w-72 bg-white dark:bg-[#202020] rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-3 animate-in fade-in duration-100">
              <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-2">
                Share this page
              </div>
              <div className="flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-800/80 p-1.5 rounded-lg border border-neutral-200/50 dark:border-neutral-700/50">
                <input
                  type="text"
                  readOnly
                  value={typeof window !== 'undefined' ? window.location.href : ''}
                  className="w-full bg-transparent text-xs text-neutral-600 dark:text-neutral-300 focus:outline-none truncate"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-2 py-1 rounded bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-medium flex items-center gap-1 flex-shrink-0 transition"
                >
                  {copiedLink ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* More actions menu */}
        <div className="relative">
          <button
            onClick={() => setIsMoreOpen(!isMoreOpen)}
            className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {isMoreOpen && (
            <div className="absolute right-0 top-9 z-40 w-56 bg-white dark:bg-[#202020] rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-2 text-xs text-neutral-700 dark:text-neutral-200 animate-in fade-in duration-100">
              {/* Style / Font family section (Notion style) */}
              <div className="px-1.5 py-1 text-[10px] uppercase font-bold text-neutral-400">
                Style
              </div>
              <div className="grid grid-cols-3 gap-1 px-1 pb-2">
                {NOTION_FONTS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => onSelectFont?.(f.id)}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg border text-center transition ${
                      currentFont === f.id
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-semibold'
                        : 'border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    <span className={`text-sm ${f.cssClass}`}>{f.preview}</span>
                    <span className="text-[10px] mt-0.5">{f.label}</span>
                  </button>
                ))}
              </div>

              <div className="h-[1px] bg-neutral-100 dark:bg-neutral-800 my-1" />

              {/* Small text switch */}
              <button
                type="button"
                onClick={() => onToggleSmallText?.()}
                className="w-full flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition text-left"
              >
                <span>Small text</span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    isSmallText
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                      : 'bg-neutral-200/60 dark:bg-neutral-700 text-neutral-500'
                  }`}
                >
                  {isSmallText ? 'ON' : 'OFF'}
                </span>
              </button>

              {/* Full width switch */}
              <button
                type="button"
                onClick={onToggleFullWidth}
                className="w-full flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition text-left"
              >
                <span>Full width</span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    isFullWidth
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                      : 'bg-neutral-200/60 dark:bg-neutral-700 text-neutral-500'
                  }`}
                >
                  {isFullWidth ? 'ON' : 'OFF'}
                </span>
              </button>

              <div className="h-[1px] bg-neutral-100 dark:bg-neutral-800 my-1" />

              <button
                onClick={() => {
                  onExportMarkdown();
                  setIsMoreOpen(false);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition text-left"
              >
                <Download className="w-3.5 h-3.5 text-neutral-500" />
                <span>Export Markdown</span>
              </button>

              <button
                onClick={() => {
                  handlePrint();
                  setIsMoreOpen(false);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition text-left"
              >
                <Printer className="w-3.5 h-3.5 text-neutral-500" />
                <span>Print or Save PDF</span>
              </button>

              {onDuplicate && (
                <button
                  onClick={() => {
                    onDuplicate();
                    setIsMoreOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition text-left"
                >
                  <CopyPlus className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Duplicate Page</span>
                </button>
              )}

              {onDelete && (
                <>
                  <div className="h-[1px] bg-neutral-100 dark:bg-neutral-800 my-1" />
                  <button
                    onClick={() => {
                      onDelete();
                      setIsMoreOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 transition text-left"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Page</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
