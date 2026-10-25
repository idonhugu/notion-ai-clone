'use client';

import React, { useEffect } from 'react';
import { X, Command, Sparkles, FileText, Keyboard, ArrowRight } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShortcutsModal({ isOpen, onClose }: ShortcutsModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sections = [
    {
      title: "Laksha's AI & Clinical Evidence",
      icon: Sparkles,
      iconColor: 'text-purple-600 dark:text-purple-400',
      items: [
        { keys: ['Cmd', 'I'], desc: "Open Stockley's Drug Interactions Checker" },
        { keys: ['Cmd', 'E'], desc: 'Open Heidi Evidence Decision Support & Calculators' },
        { keys: ['Cmd', 'J'], desc: 'Open AI Copilot Chat sidecar' },
        { keys: ['Ask AI'], desc: 'Open AI formatting & drafting menu' },
        { keys: ['Select text'], desc: 'Trigger AI rewrite, summarize, or translate' },
      ],
    },
    {
      title: 'Markdown Accelerators',
      icon: FileText,
      iconColor: 'text-blue-600 dark:text-blue-400',
      items: [
        { keys: ['#', 'Space'], desc: 'Heading 1' },
        { keys: ['##', 'Space'], desc: 'Heading 2' },
        { keys: ['###', 'Space'], desc: 'Heading 3' },
        { keys: ['-', 'Space'], desc: 'Bullet list' },
        { keys: ['1.', 'Space'], desc: 'Numbered list' },
        { keys: ['[]', 'Space'], desc: 'Interactive checklist' },
        { keys: ['>', 'Space'], desc: 'Quote callout' },
        { keys: ['```', 'Space'], desc: 'Code fence block' },
        { keys: ['---', 'Space'], desc: 'Horizontal divider' },
      ],
    },
    {
      title: 'Navigation & Workspace',
      icon: Keyboard,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      items: [
        { keys: ['Cmd', 'K'], desc: 'Quick Search & jump to any document' },
        { keys: ['Cmd', '/'], desc: 'Toggle this keyboard shortcuts cheat sheet' },
        { keys: ['Cmd', 'P'], desc: 'Print or save page as PDF' },
        { keys: ['Esc'], desc: 'Close modals, drawers, or floating menus' },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#1f1f1f] rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-neutral-200/80 dark:border-neutral-800 bg-[#fbfbfa] dark:bg-[#191919]">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neutral-200/80 dark:bg-neutral-800 flex items-center justify-center text-neutral-800 dark:text-neutral-200 flex-shrink-0">
              <Command className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Keyboard Shortcuts & Markdown
              </h3>
              <p className="text-[10px] sm:text-[11px] text-neutral-500">
                Power up your workflow with Notion-grade accelerators
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6">
          {sections.map((section, idx) => {
            const Icon = section.icon;
            return (
              <div key={idx}>
                <div className="flex items-center gap-2 mb-3">
                  <Icon className={`w-4 h-4 ${section.iconColor}`} />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    {section.title}
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {section.items.map((item, itemIdx) => (
                    <div
                      key={itemIdx}
                      className="flex items-center justify-between p-2 rounded-lg bg-neutral-50 dark:bg-[#252525] border border-neutral-200/60 dark:border-neutral-800/60 text-xs"
                    >
                      <span className="text-neutral-700 dark:text-neutral-300 font-medium">
                        {item.desc}
                      </span>
                      <div className="flex items-center gap-1">
                        {item.keys.map((k, kIdx) => (
                          <kbd
                            key={kIdx}
                            className="px-1.5 py-0.5 rounded bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 font-mono text-[10px] font-semibold text-neutral-800 dark:text-neutral-200 shadow-xs"
                          >
                            {k}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-200/80 dark:border-neutral-800 bg-[#fbfbfa] dark:bg-[#191919] flex items-center justify-between text-xs text-neutral-400">
          <span>
            Press <kbd className="px-1 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-[10px]">Esc</kbd> to close
          </span>
          <span className="flex items-center gap-1">
            <span>Laksha&apos;s WorkSpace</span>
            <Sparkles className="w-3 h-3 text-purple-500" />
          </span>
        </div>
      </div>
    </div>
  );
}
