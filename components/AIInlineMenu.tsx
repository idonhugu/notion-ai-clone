'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, ArrowRight, X, Loader2, RotateCcw, Check, FileText, Lightbulb, PenTool, ListTodo } from 'lucide-react';
import { AIAction } from '@/lib/types';

interface AIInlineMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (markdown: string) => void;
  documentContext?: string;
}

export function AIInlineMenu({
  isOpen,
  onClose,
  onApply,
  documentContext = '',
}: AIInlineMenuProps) {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamedResponse, setStreamedResponse] = useState('');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setStreamedResponse('');
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAIRequest = async (action: AIAction, customPrompt?: string) => {
    setIsLoading(true);
    setStreamedResponse('');
    setError(null);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          prompt: customPrompt || prompt,
          context: documentContext,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${res.status}: Failed to get AI response`);
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
        setStreamedResponse(accumulated);
      }
    } catch (err: any) {
      console.error('AI Stream Error:', err);
      setError(err.message || 'Something went wrong while contacting Gemini AI.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = () => {
    if (streamedResponse) {
      onApply(streamedResponse);
      onClose();
    }
  };

  const quickActions: { label: string; icon: any; action: AIAction; defaultPrompt: string }[] = [
    { label: 'Draft an outline', icon: FileText, action: 'generate', defaultPrompt: 'Draft a structured outline with key sections and bullet points' },
    { label: 'Brainstorm ideas', icon: Lightbulb, action: 'generate', defaultPrompt: 'Brainstorm 5 innovative, actionable ideas' },
    { label: 'Continue writing', icon: PenTool, action: 'continue', defaultPrompt: '' },
    { label: 'Create to-do list', icon: ListTodo, action: 'generate', defaultPrompt: 'Create a prioritized checklist of actionable tasks' },
  ];

  return (
    <div className="my-3 w-full max-w-3xl mx-auto rounded-xl border border-purple-200 dark:border-purple-900/60 bg-gradient-to-b from-purple-50/40 via-white to-white dark:from-purple-950/20 dark:via-neutral-900 dark:to-neutral-900 shadow-xl overflow-hidden transition-all duration-200">
      {/* Header bar */}
      <div className="p-3 border-b border-purple-100 dark:border-purple-950/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-purple-600 text-white flex items-center justify-center shadow-sm">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          </div>
          <span className="text-xs font-semibold text-purple-900 dark:text-purple-300">
            Ask Notion AI (Gemini Flash)
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded p-1 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Input box */}
      <div className="p-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (prompt.trim() && !isLoading) handleAIRequest('generate', prompt);
          }}
          className="flex items-center gap-2 bg-white dark:bg-neutral-800 rounded-lg px-3 py-2 border border-neutral-200 dark:border-neutral-700 shadow-inner"
        >
          <input
            ref={inputRef}
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask AI to write anything, summarize, or translate..."
            disabled={isLoading}
            className="w-full bg-transparent text-sm focus:outline-none text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400"
          />
          <button
            type="submit"
            disabled={!prompt.trim() || isLoading}
            className="p-1.5 rounded-md bg-purple-600 text-white disabled:opacity-40 hover:bg-purple-700 transition"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Quick action chips */}
        {!streamedResponse && !isLoading && (
          <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
            {quickActions.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleAIRequest(item.action, item.defaultPrompt)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-purple-100 dark:hover:bg-purple-950/50 hover:text-purple-700 dark:hover:text-purple-300 border border-neutral-200/60 dark:border-neutral-700/60 transition"
                >
                  <Icon className="w-3 h-3 text-purple-500" />
                  {item.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mt-3 p-2.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Streaming output display */}
        {(streamedResponse || isLoading) && (
          <div className="mt-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/60 p-3 max-h-72 overflow-y-auto">
            <div className="text-xs text-purple-700 dark:text-purple-400 font-medium mb-1.5 flex items-center gap-1.5">
              {isLoading && <Loader2 className="w-3 h-3 animate-spin" />}
              {isLoading ? 'Generating response in real-time...' : 'Generated Content:'}
            </div>
            <div className="text-sm font-sans whitespace-pre-wrap text-neutral-800 dark:text-neutral-200 leading-relaxed font-mono text-[13px] bg-neutral-50 dark:bg-neutral-950 p-2.5 rounded border border-neutral-200/50 dark:border-neutral-800">
              {streamedResponse}
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <button
                onClick={() => handleAIRequest('generate', prompt)}
                disabled={isLoading}
                className="flex items-center gap-1 px-2.5 py-1 text-xs text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition"
              >
                <RotateCcw className="w-3 h-3" />
                Retry
              </button>
              <button
                onClick={onClose}
                className="px-2.5 py-1 text-xs text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition"
              >
                Discard
              </button>
              <button
                onClick={handleAccept}
                disabled={!streamedResponse || isLoading}
                className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md transition disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" />
                Insert Blocks
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
