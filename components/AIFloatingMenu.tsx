'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Wand2,
  FileText,
  TrendingUp,
  Minimize2,
  Check,
  X,
  Loader2,
  RotateCcw,
  Languages,
  ChevronDown,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Palette,
} from 'lucide-react';
import { AIAction } from '@/lib/types';
import { NOTION_COLORS } from '@/lib/notionStyles';

interface AIFloatingMenuProps {
  selectedText: string;
  onReplaceSelection: (newText: string) => void;
  onClose: () => void;
  position: { top: number; left: number } | null;
  onToggleStyle?: (style: 'bold' | 'italic' | 'underline' | 'strike' | 'code') => void;
  onApplyTextColor?: (color: string) => void;
  onApplyBgColor?: (color: string) => void;
}

const LANGUAGES = [
  'Spanish',
  'French',
  'German',
  'Japanese',
  'Chinese',
  'Hindi',
];

const TONES = [
  { label: 'Professional', value: 'professional' },
  { label: 'Casual', value: 'casual' },
  { label: 'Concise & Direct', value: 'concise' },
];

export function AIFloatingMenu({
  selectedText,
  onReplaceSelection,
  onClose,
  position,
  onToggleStyle,
  onApplyTextColor,
  onApplyBgColor,
}: AIFloatingMenuProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [streamedText, setStreamedText] = useState('');
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTranslateOpen, setIsTranslateOpen] = useState(false);
  const [isToneOpen, setIsToneOpen] = useState(false);
  const [isColorOpen, setIsColorOpen] = useState(false);
  const [colorTab, setColorTab] = useState<'text' | 'bg'>('text');

  if (!position || !selectedText) return null;

  const handleAction = async (action: string, options?: { tone?: string; language?: string }) => {
    setActiveAction(action);
    setIsLoading(true);
    setStreamedText('');
    setError(null);
    setIsTranslateOpen(false);
    setIsToneOpen(false);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          selectedText,
          tone: options?.tone,
          language: options?.language,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${res.status}: Failed to process text`);
      }

      if (!res.body) throw new Error('No readable stream returned');

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
      console.error('Floating AI Error:', err);
      setError(err.message || 'Failed to generate revision');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (streamedText) {
      onReplaceSelection(streamedText);
      onClose();
    }
  };

  return (
    <div
      style={{
        top: `${Math.max(10, position.top - 60)}px`,
        left: `${Math.min(window.innerWidth - 440, Math.max(20, position.left))}px`,
      }}
      className="fixed z-50 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl p-1.5 transition-all max-w-lg w-max select-none"
    >
      {/* If no stream running yet, show clean action pills */}
      {!activeAction ? (
        <div className="flex items-center gap-1 flex-wrap">
          {/* Quick Rich Text Styles */}
          {onToggleStyle && (
            <div className="flex items-center gap-0.5 border-r border-neutral-200 dark:border-neutral-800 pr-1 mr-0.5">
              <button
                type="button"
                onClick={() => onToggleStyle('bold')}
                className="p-1 rounded text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                title="Bold (Cmd+B)"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onToggleStyle('italic')}
                className="p-1 rounded text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                title="Italic (Cmd+I)"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onToggleStyle('underline')}
                className="p-1 rounded text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                title="Underline (Cmd+U)"
              >
                <Underline className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onToggleStyle('strike')}
                className="p-1 rounded text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                title="Strikethrough"
              >
                <Strikethrough className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onToggleStyle('code')}
                className="p-1 rounded text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                title="Code font"
              >
                <Code className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Color Palette Popover on selection */}
          {(onApplyTextColor || onApplyBgColor) && (
            <div className="relative border-r border-neutral-200 dark:border-neutral-800 pr-1 mr-0.5">
              <button
                type="button"
                onClick={() => {
                  setIsColorOpen(!isColorOpen);
                  setIsToneOpen(false);
                  setIsTranslateOpen(false);
                }}
                className="flex items-center gap-1 px-1.5 py-1 text-xs text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition"
                title="Change color of selected text"
              >
                <Palette className="w-3.5 h-3.5 text-purple-500" />
                <span className="font-semibold text-[11px]">Color</span>
                <ChevronDown className="w-2.5 h-2.5 text-neutral-400" />
              </button>

              {isColorOpen && (
                <div className="absolute left-0 top-8 z-50 w-60 bg-white dark:bg-[#202020] border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl p-2 animate-in fade-in duration-100">
                  <div className="flex items-center rounded-lg bg-neutral-100 dark:bg-neutral-800 p-0.5 mb-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setColorTab('text')}
                      className={`flex-1 py-0.5 rounded font-semibold text-center text-[11px] transition ${
                        colorTab === 'text'
                          ? 'bg-white dark:bg-neutral-900 text-purple-700 dark:text-purple-300 shadow-2xs'
                          : 'text-neutral-600 dark:text-neutral-400'
                      }`}
                    >
                      Text Color
                    </button>
                    <button
                      type="button"
                      onClick={() => setColorTab('bg')}
                      className={`flex-1 py-0.5 rounded font-semibold text-center text-[11px] transition ${
                        colorTab === 'bg'
                          ? 'bg-white dark:bg-neutral-900 text-purple-700 dark:text-purple-300 shadow-2xs'
                          : 'text-neutral-600 dark:text-neutral-400'
                      }`}
                    >
                      Background
                    </button>
                  </div>

                  <div className="max-h-52 overflow-y-auto space-y-0.5">
                    {colorTab === 'text' ? (
                      NOTION_COLORS.map((col) => (
                        <button
                          key={col.id}
                          type="button"
                          onClick={() => {
                            onApplyTextColor?.(col.id);
                            setIsColorOpen(false);
                          }}
                          className="w-full flex items-center justify-between px-2 py-1 rounded text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800 transition text-left"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-black/10 dark:border-white/10 flex items-center justify-center text-[9px] font-bold"
                              style={{
                                backgroundColor: col.id === 'default' ? 'transparent' : col.swatchHex,
                                color: col.id === 'default' ? 'inherit' : '#ffffff',
                              }}
                            >
                              A
                            </span>
                            <span style={{ color: col.id === 'default' ? 'inherit' : col.swatchHex }}>
                              {col.label}
                            </span>
                          </div>
                        </button>
                      ))
                    ) : (
                      NOTION_COLORS.map((col) => (
                        <button
                          key={col.id}
                          type="button"
                          onClick={() => {
                            onApplyBgColor?.(col.id);
                            setIsColorOpen(false);
                          }}
                          className="w-full flex items-center justify-between px-2 py-1 rounded text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800 transition text-left"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="w-3.5 h-3.5 rounded-sm border border-neutral-300 dark:border-neutral-700"
                              style={{
                                backgroundColor: col.id === 'default' ? 'transparent' : col.swatchHex,
                              }}
                            />
                            <span
                              className="px-1 py-0.5 rounded text-[11px]"
                              style={{
                                backgroundColor: col.id === 'default' ? 'transparent' : col.bgLight,
                                color: col.id === 'default' ? 'inherit' : col.textColorLight,
                              }}
                            >
                              {col.label} Background
                            </span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-1 px-1.5 py-1 text-purple-600 dark:text-purple-400 font-semibold text-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI</span>
          </div>

          <button
            onClick={() => handleAction('improve')}
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition"
          >
            <Wand2 className="w-3 h-3 text-purple-500" />
            <span>Fix Grammar</span>
          </button>

          <button
            onClick={() => handleAction('summarize')}
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition"
          >
            <FileText className="w-3 h-3 text-blue-500" />
            <span>Summarize</span>
          </button>

          <button
            onClick={() => handleAction('longer')}
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition"
          >
            <TrendingUp className="w-3 h-3 text-emerald-500" />
            <span>Expand</span>
          </button>

          <button
            onClick={() => handleAction('simplify')}
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition"
          >
            <Minimize2 className="w-3 h-3 text-amber-500" />
            <span>Simplify</span>
          </button>

          {/* Tone shift selector */}
          <div className="relative">
            <button
              onClick={() => {
                setIsToneOpen(!isToneOpen);
                setIsTranslateOpen(false);
              }}
              className="flex items-center gap-1 px-2 py-1 text-xs text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition"
            >
              <span>Tone</span>
              <ChevronDown className="w-3 h-3 text-neutral-400" />
            </button>

            {isToneOpen && (
              <div className="absolute left-0 top-8 z-50 w-36 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-xl p-1">
                {TONES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => handleAction('improve', { tone: t.value })}
                    className="w-full text-left px-2 py-1 rounded text-xs text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition"
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Translation selector */}
          <div className="relative">
            <button
              onClick={() => {
                setIsTranslateOpen(!isTranslateOpen);
                setIsToneOpen(false);
              }}
              className="flex items-center gap-1 px-2 py-1 text-xs text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition"
            >
              <Languages className="w-3 h-3 text-indigo-500" />
              <span>Translate</span>
              <ChevronDown className="w-3 h-3 text-neutral-400" />
            </button>

            {isTranslateOpen && (
              <div className="absolute left-0 top-8 z-50 w-32 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-xl p-1">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleAction('translate', { language: lang })}
                    className="w-full text-left px-2 py-1 rounded text-xs text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition"
                  >
                    {lang}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded transition ml-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        /* Expanded streaming preview card */
        <div className="w-80 md:w-96 p-2">
          <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-neutral-100 dark:border-neutral-800">
            <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isLoading ? "Laksha's AI Writing..." : 'AI Revision'}</span>
            </span>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {error ? (
            <div className="p-2 text-xs text-red-500 bg-red-50 dark:bg-red-950/40 rounded">
              {error}
            </div>
          ) : (
            <div className="max-h-52 overflow-y-auto p-2 bg-neutral-50 dark:bg-neutral-950 rounded text-xs text-neutral-800 dark:text-neutral-200 font-sans whitespace-pre-wrap border border-neutral-200/50 dark:border-neutral-800 leading-relaxed">
              {streamedText || (
                <div className="flex items-center gap-2 text-neutral-400">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Streaming Gemini response...
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <button
              onClick={() => handleAction(activeAction)}
              disabled={isLoading}
              className="p-1 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 text-xs flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Retry
            </button>
            <button
              onClick={onClose}
              className="px-2 py-1 text-xs text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded"
            >
              Discard
            </button>
            <button
              onClick={handleApply}
              disabled={!streamedText || isLoading}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md transition disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              Replace
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
