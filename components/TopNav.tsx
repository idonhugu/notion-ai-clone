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
  Eye,
  MessageSquare,
  Smartphone,
  Monitor,
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
  onOpenPdfGuideline?: () => void;
  onOpenDermEvidence?: () => void;
  onOpenAccurx?: () => void;
  onOpenPatientExplainer?: () => void;
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
  onOpenPdfGuideline,
  onOpenDermEvidence,
  onOpenAccurx,
  onOpenPatientExplainer,
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
    <header className="sticky top-0 z-30 flex flex-col bg-white/90 dark:bg-[#191919]/90 backdrop-blur-md border-b border-neutral-100 dark:border-neutral-800/80 transition-colors">
      <div className="flex items-center justify-between px-3 md:px-6 py-2">
        {/* Left: Breadcrumbs & Save Indicator */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-neutral-500 dark:text-neutral-400 min-w-0 shrink pr-2 pl-9 md:pl-0">
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
      <div className="flex items-center gap-1 sm:gap-1.5 max-w-full overflow-x-auto no-scrollbar py-0.5 flex-shrink-0">
        {/* Word count pill */}
        <div className="hidden md:flex items-center gap-1 px-2 py-1 rounded text-[11px] text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition select-none flex-shrink-0">
          <Clock className="w-3 h-3" />
          <span>{wordCount} words • {readingTime} min read</span>
        </div>

        {/* Ask AI Copilot button with active state & gradient accent */}
        <button
          onClick={onToggleSidecar || onOpenAI}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition shadow-sm flex-shrink-0 ${
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
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200/60 dark:border-emerald-800/60 transition shadow-xs flex-shrink-0"
            title="Open Clinical Evidence & Decision Support (Cmd+E)"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">Evidence (Heidi)</span>
            <span className="inline sm:hidden text-[11px]">Evidence</span>
          </button>
        )}

        {/* Stockley's Drug Interactions Checker */}
        {onOpenInteractions && (
          <button
            onClick={onOpenInteractions}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-200/60 dark:border-amber-800/60 transition shadow-xs flex-shrink-0"
            title="Open Stockley's Drug Interactions Checker (Cmd+I)"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span className="hidden sm:inline">Interactions</span>
          </button>
        )}

        {/* Guidelines & Conference Intelligence Analyzer */}
        {onOpenPdfGuideline && (
          <button
            onClick={onOpenPdfGuideline}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/50 border border-purple-200/60 dark:border-purple-800/60 transition shadow-xs flex-shrink-0"
            title="Analyze Guidelines, Slides & Conferences into Common Presentations (Cmd+U)"
          >
            <FileText className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span className="hidden lg:inline">Guidelines & Conferences</span>
            <span className="inline lg:hidden text-[11px]">Sync</span>
          </button>
        )}

        {/* Derm AI & Photo Evidence Analyzer */}
        {onOpenDermEvidence && (
          <button
            onClick={onOpenDermEvidence}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200/60 dark:border-rose-800/60 transition shadow-xs flex-shrink-0"
            title="Derm AI & Photo Analysis (Cmd+Shift+D)"
          >
            <Eye className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span className="hidden sm:inline">Derm AI</span>
          </button>
        )}

        {/* Accurx / SMS Snippet Library */}
        {onOpenAccurx && (
          <button
            onClick={onOpenAccurx}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200/60 dark:border-blue-800/60 transition shadow-xs flex-shrink-0"
            title="Accurx & SMS Snippets Library with NHS PILs (Cmd+Shift+A)"
          >
            <Smartphone className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="hidden sm:inline">Accurx SMS</span>
            <span className="inline sm:hidden text-[11px]">SMS</span>
          </button>
        )}

        {/* Patient Visual Explainer ("Turn the Screen" Mode) */}
        {onOpenPatientExplainer && (
          <button
            onClick={onOpenPatientExplainer}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-200/60 dark:border-indigo-800/60 transition shadow-xs flex-shrink-0"
            title="Turn Screen to Patient: High-Res Visual Explainer Mode (Cmd+Shift+P)"
          >
            <Monitor className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden sm:inline">Turn Screen</span>
            <span className="inline sm:hidden text-[11px]">Show Patient</span>
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

              {/* Clinical AI Decision Support Tools */}
              <div className="px-1.5 py-1 text-[10px] uppercase font-bold text-neutral-400">
                Clinical Tools
              </div>

              {onOpenPatientExplainer && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenPatientExplainer();
                    setIsMoreOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 transition text-left"
                >
                  <div className="flex items-center gap-2">
                    <Monitor className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>Turn Screen (Patient Mode)</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.2 rounded font-semibold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                    Patient
                  </span>
                </button>
              )}

              {onOpenAccurx && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenAccurx();
                    setIsMoreOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-blue-50 dark:hover:bg-blue-950/40 text-blue-700 dark:text-blue-300 transition text-left"
                >
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Accurx SMS Library & PILs</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.2 rounded font-semibold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                    SMS
                  </span>
                </button>
              )}

              {onOpenPdfGuideline && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenPdfGuideline();
                    setIsMoreOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-purple-50 dark:hover:bg-purple-950/40 text-purple-700 dark:text-purple-300 transition text-left"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    <span>Guidelines & Conferences</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.2 rounded font-semibold bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300">
                    Sync
                  </span>
                </button>
              )}

              {onOpenInteractions && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenInteractions();
                    setIsMoreOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-800 dark:text-amber-300 transition text-left"
                >
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>Stockley&apos;s Interactions</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.2 rounded font-semibold bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300">
                    BNF
                  </span>
                </button>
              )}

              {onOpenEvidence && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenEvidence();
                    setIsMoreOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 transition text-left"
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Clinical Evidence & Decision</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.2 rounded font-semibold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                    Heidi
                  </span>
                </button>
              )}

              {onOpenDermEvidence && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenDermEvidence();
                    setIsMoreOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-700 dark:text-rose-300 transition text-left"
                >
                  <div className="flex items-center gap-2">
                    <Eye className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                    <span>Derm AI & Photos</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.2 rounded font-semibold bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300">
                    BAD
                  </span>
                </button>
              )}

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
    </div>

      {/* Mobile Quick Clinical Strip (< 640px) */}
      <div className="flex sm:hidden items-center gap-1.5 px-3 py-1.5 bg-neutral-50/90 dark:bg-[#151515]/90 border-t border-neutral-100 dark:border-neutral-800/60 overflow-x-auto no-scrollbar">
        {onOpenEvidence && (
          <button
            type="button"
            onClick={onOpenEvidence}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/80 whitespace-nowrap shrink-0 shadow-2xs cursor-pointer"
          >
            <BookOpen className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>Evidence</span>
          </button>
        )}
        {onOpenInteractions && (
          <button
            type="button"
            onClick={onOpenInteractions}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-800/80 whitespace-nowrap shrink-0 shadow-2xs cursor-pointer"
          >
            <ShieldAlert className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            <span>Interactions</span>
          </button>
        )}
        {onOpenPdfGuideline && (
          <button
            type="button"
            onClick={onOpenPdfGuideline}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 border border-purple-200/80 dark:border-purple-800/80 whitespace-nowrap shrink-0 shadow-2xs cursor-pointer"
          >
            <FileText className="w-3 h-3 text-purple-600 dark:text-purple-400" />
            <span>Sync Conf/PDF</span>
          </button>
        )}
        {onOpenDermEvidence && (
          <button
            type="button"
            onClick={onOpenDermEvidence}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border border-rose-200/80 dark:border-rose-800/80 whitespace-nowrap shrink-0 shadow-2xs cursor-pointer"
          >
            <Eye className="w-3 h-3 text-rose-600 dark:text-rose-400" />
            <span>Derm AI</span>
          </button>
        )}
        {onOpenAccurx && (
          <button
            type="button"
            onClick={onOpenAccurx}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/80 whitespace-nowrap shrink-0 shadow-2xs cursor-pointer"
          >
            <Smartphone className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            <span>Accurx SMS</span>
          </button>
        )}
        {onOpenPatientExplainer && (
          <button
            type="button"
            onClick={onOpenPatientExplainer}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/80 whitespace-nowrap shrink-0 shadow-2xs cursor-pointer"
          >
            <Monitor className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
            <span>Turn Screen</span>
          </button>
        )}
      </div>
    </header>
  );
}
