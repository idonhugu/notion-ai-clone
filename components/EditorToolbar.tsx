'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Sparkles,
  ChevronDown,
  Check,
  Type,
  Baseline,
} from 'lucide-react';
import {
  NOTION_FONTS,
  NOTION_COLORS,
  NotionFontStyle,
} from '@/lib/notionStyles';

interface EditorToolbarProps {
  currentFont: NotionFontStyle;
  onSelectFont: (font: NotionFontStyle) => void;
  isSmallText: boolean;
  onToggleSmallText: () => void;
  onToggleStyle: (style: 'bold' | 'italic' | 'underline' | 'strike' | 'code') => void;
  onApplyTextColor: (color: string) => void;
  onApplyBgColor: (color: string) => void;
  onAlignText?: (align: 'left' | 'center' | 'right') => void;
  onOpenAI: () => void;
  activeStyles?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strike?: boolean;
    code?: boolean;
    textColor?: string;
    backgroundColor?: string;
  };
}

export function EditorToolbar({
  currentFont,
  onSelectFont,
  isSmallText,
  onToggleSmallText,
  onToggleStyle,
  onApplyTextColor,
  onApplyBgColor,
  onAlignText,
  onOpenAI,
  activeStyles = {},
}: EditorToolbarProps) {
  const [isFontOpen, setIsFontOpen] = useState(false);
  const [isColorOpen, setIsColorOpen] = useState(false);
  const [colorTab, setColorTab] = useState<'text' | 'bg'>('text');

  const fontRef = useRef<HTMLDivElement>(null);
  const colorRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click or touch
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (fontRef.current && !fontRef.current.contains(e.target as Node)) {
        setIsFontOpen(false);
      }
      if (colorRef.current && !colorRef.current.contains(e.target as Node)) {
        setIsColorOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const activeFontObj = NOTION_FONTS.find((f) => f.id === currentFont) || NOTION_FONTS[0];

  return (
    <div className="sticky top-[49px] z-20 flex items-center justify-between gap-1 p-1 mb-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white/95 dark:bg-[#1f1f1f]/95 backdrop-blur-md shadow-xs select-none transition-all overflow-x-auto no-scrollbar max-w-full">
      <div className="flex items-center gap-0.5 sm:gap-1 flex-nowrap flex-shrink-0">
        {/* Font Family Dropdown */}
        <div ref={fontRef} className="relative">
          <button
            type="button"
            onClick={() => {
              setIsFontOpen(!isFontOpen);
              setIsColorOpen(false);
            }}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
            title="Change font family"
          >
            <Type className="w-3.5 h-3.5 text-neutral-500" />
            <span className="font-semibold">{activeFontObj.label}</span>
            <ChevronDown className="w-3 h-3 text-neutral-400" />
          </button>

          {isFontOpen && (
            <div className="absolute left-0 top-8 z-50 w-52 bg-white dark:bg-[#202020] border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl p-1.5 animate-in fade-in duration-100">
              <div className="text-[10px] uppercase font-bold text-neutral-400 px-2 py-1">
                Typography
              </div>
              {NOTION_FONTS.map((font) => (
                <button
                  key={font.id}
                  type="button"
                  onClick={() => {
                    onSelectFont(font.id);
                    setIsFontOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-left transition ${
                    currentFont === font.id
                      ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-semibold'
                      : 'text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${font.cssClass}`}>{font.preview}</span>
                    <div>
                      <div className={font.cssClass}>{font.label}</div>
                      <div className="text-[10px] text-neutral-400 font-normal">
                        {font.description}
                      </div>
                    </div>
                  </div>
                  {currentFont === font.id && <Check className="w-3.5 h-3.5 text-purple-600" />}
                </button>
              ))}

              <div className="h-[1px] bg-neutral-100 dark:bg-neutral-800 my-1" />

              {/* Small text toggle inside font menu */}
              <button
                type="button"
                onClick={() => {
                  onToggleSmallText();
                }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
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
            </div>
          )}
        </div>

        {/* Small text quick pill on larger screens */}
        <button
          type="button"
          onClick={onToggleSmallText}
          className={`hidden md:flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition ${
            isSmallText
              ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 font-semibold'
              : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
          title="Toggle small text size"
        >
          <span className="text-[11px]">Small text</span>
        </button>

        <div className="h-4 w-[1px] bg-neutral-200 dark:bg-neutral-800 mx-0.5" />

        {/* Text Formatting Styles */}
        <button
          type="button"
          onClick={() => onToggleStyle('bold')}
          className={`p-1.5 rounded-md text-xs transition ${
            activeStyles.bold
              ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
              : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
          title="Bold (Cmd+B)"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => onToggleStyle('italic')}
          className={`p-1.5 rounded-md text-xs transition ${
            activeStyles.italic
              ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
              : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
          title="Italic (Cmd+I)"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => onToggleStyle('underline')}
          className={`p-1.5 rounded-md text-xs transition ${
            activeStyles.underline
              ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
              : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
          title="Underline (Cmd+U)"
        >
          <Underline className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => onToggleStyle('strike')}
          className={`p-1.5 rounded-md text-xs transition ${
            activeStyles.strike
              ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
              : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
          title="Strikethrough"
        >
          <Strikethrough className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => onToggleStyle('code')}
          className={`p-1.5 rounded-md text-xs transition ${
            activeStyles.code
              ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
              : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
          title="Code format"
        >
          <Code className="w-3.5 h-3.5" />
        </button>

        <div className="h-4 w-[1px] bg-neutral-200 dark:bg-neutral-800 mx-0.5" />

        {/* Color Palette Popover (Text Color & Background Highlight) */}
        <div ref={colorRef} className="relative">
          <button
            type="button"
            onClick={() => {
              setIsColorOpen(!isColorOpen);
              setIsFontOpen(false);
            }}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
            title="Change text color or highlight"
          >
            <Palette className="w-3.5 h-3.5 text-purple-500" />
            <span className="font-semibold">Color</span>
            <ChevronDown className="w-3 h-3 text-neutral-400" />
          </button>

          {isColorOpen && (
            <div className="absolute left-0 top-8 z-50 w-64 bg-white dark:bg-[#202020] border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl p-2 animate-in fade-in duration-100">
              {/* Tab Selector: Text vs Background */}
              <div className="flex items-center rounded-lg bg-neutral-100 dark:bg-neutral-800 p-0.5 mb-2 text-xs">
                <button
                  type="button"
                  onClick={() => setColorTab('text')}
                  className={`flex-1 py-1 rounded-md font-semibold text-center transition ${
                    colorTab === 'text'
                      ? 'bg-white dark:bg-neutral-900 text-purple-700 dark:text-purple-300 shadow-xs'
                      : 'text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  Text Color
                </button>
                <button
                  type="button"
                  onClick={() => setColorTab('bg')}
                  className={`flex-1 py-1 rounded-md font-semibold text-center transition ${
                    colorTab === 'bg'
                      ? 'bg-white dark:bg-neutral-900 text-purple-700 dark:text-purple-300 shadow-xs'
                      : 'text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  Background
                </button>
              </div>

              {/* Color Options List */}
              <div className="max-h-56 overflow-y-auto space-y-0.5">
                {colorTab === 'text' ? (
                  NOTION_COLORS.map((col) => (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => {
                        onApplyTextColor(col.id);
                        setIsColorOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800 transition text-left"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-4 h-4 rounded-full border border-black/10 dark:border-white/10 flex items-center justify-center text-[10px] font-bold"
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
                      {activeStyles.textColor === col.id && (
                        <Check className="w-3.5 h-3.5 text-purple-600" />
                      )}
                    </button>
                  ))
                ) : (
                  NOTION_COLORS.map((col) => (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => {
                        onApplyBgColor(col.id);
                        setIsColorOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800 transition text-left"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-4 h-4 rounded-md border border-neutral-300 dark:border-neutral-700"
                          style={{
                            backgroundColor: col.id === 'default' ? 'transparent' : col.swatchHex,
                          }}
                        />
                        <span
                          className="px-1.5 py-0.5 rounded"
                          style={{
                            backgroundColor: col.id === 'default' ? 'transparent' : col.bgLight,
                            color: col.id === 'default' ? 'inherit' : col.textColorLight,
                          }}
                        >
                          {col.label} Background
                        </span>
                      </div>
                      {activeStyles.backgroundColor === col.id && (
                        <Check className="w-3.5 h-3.5 text-purple-600" />
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Text Alignment */}
        {onAlignText && (
          <div className="hidden sm:flex items-center gap-0.5 ml-0.5">
            <div className="h-4 w-[1px] bg-neutral-200 dark:bg-neutral-800 mx-0.5" />
            <button
              type="button"
              onClick={() => onAlignText('left')}
              className="p-1.5 rounded-md text-xs text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              title="Align left"
            >
              <AlignLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onAlignText('center')}
              className="p-1.5 rounded-md text-xs text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              title="Align center"
            >
              <AlignCenter className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onAlignText('right')}
              className="p-1.5 rounded-md text-xs text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              title="Align right"
            >
              <AlignRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* AI Assistant Quick Trigger */}
      <button
        type="button"
        onClick={onOpenAI}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-100/80 dark:bg-purple-950/60 hover:bg-purple-200 dark:hover:bg-purple-900/60 border border-purple-200 dark:border-purple-800/80 transition shadow-2xs flex-shrink-0 ml-1.5"
        title="Ask Laksha's AI to write, edit, or format"
      >
        <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 animate-pulse" />
        <span className="hidden sm:inline">Ask AI</span>
      </button>
    </div>
  );
}
