'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  X,
  Loader2,
  Copy,
  Check,
  Plus,
  RotateCcw,
  Bot,
  User,
  ListTodo,
  FileText,
  Lightbulb,
  Table as TableIcon,
  HelpCircle,
  Paperclip,
  BookOpen,
  ChevronDown,
} from 'lucide-react';
import { AttachedFile } from './DocumentAttachments';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface AIChatSidecarProps {
  isOpen: boolean;
  onClose: () => void;
  documentTitle: string;
  documentContent: string;
  attachedFiles?: AttachedFile[];
  selectedDocument?: AttachedFile | null;
  onSelectDocument?: (file: AttachedFile | null) => void;
  onInsertIntoPage: (markdown: string) => void;
}

export function AIChatSidecar({
  isOpen,
  onClose,
  documentTitle,
  documentContent,
  attachedFiles = [],
  selectedDocument = null,
  onSelectDocument,
  onInsertIntoPage,
}: AIChatSidecarProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `👋 Hi Laksha! I'm your Notion AI Copilot. I'm connected to **"${
        documentTitle || 'Untitled'
      }"** and your attached documents.\n\nAsk me anything about this page or its PDFs, or pick a prompt below!`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeDoc, setActiveDoc] = useState<AttachedFile | null>(selectedDocument);
  const [isDocDropdownOpen, setIsDocDropdownOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const visibleAttachments = attachedFiles.filter((f) => f.id !== '__kanban__');

  useEffect(() => {
    if (selectedDocument) {
      setActiveDoc(selectedDocument);
      setMessages((prev) => [
        ...prev,
        {
          id: `ref_${Date.now()}`,
          role: 'assistant',
          content: `📄 Switched reference to **"${selectedDocument.name}"**. I can summarize it, extract key notes, or answer any questions about it!`,
        },
      ]);
    }
  }, [selectedDocument]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string, customAction?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      role: 'user',
      content: query,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const assistantMsgId = `a_${Date.now()}`;
    setMessages((prev) => [...prev, { id: assistantMsgId, role: 'assistant', content: '' }]);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: customAction || 'chat',
          prompt: query,
          context: `Document Title: ${documentTitle}\n\nDocument Body:\n${documentContent}`,
          fileData: activeDoc ? activeDoc.url : undefined,
          fileName: activeDoc ? activeDoc.name : undefined,
          fileType: activeDoc ? activeDoc.type : undefined,
          attachedDocs: activeDoc ? [activeDoc] : visibleAttachments,
        }),
      });

      if (!res.ok) throw new Error('Failed to stream AI response');
      if (!res.body) throw new Error('No stream available');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;

        setMessages((prev) =>
          prev.map((msg) => (msg.id === assistantMsgId ? { ...msg, content: accumulated } : msg))
        );
      }
    } catch (err: any) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? { ...msg, content: '⚠️ Sorry, I encountered an error while processing your request. Please try again.' }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const quickPrompts = activeDoc
    ? [
        {
          label: 'Summarize document',
          action: 'doc_summarize',
          icon: FileText,
          query: `Summarize "${activeDoc.name}" in bullet points with core takeaways`,
        },
        {
          label: 'Make structured notes',
          action: 'doc_notes',
          icon: BookOpen,
          query: `Extract comprehensive study / meeting notes from "${activeDoc.name}"`,
        },
        {
          label: 'Action items & tasks',
          action: 'action_items',
          icon: ListTodo,
          query: `Extract all action items, deliverables, and deadlines from "${activeDoc.name}"`,
        },
        {
          label: 'Explain like I’m 5',
          action: 'eli5',
          icon: HelpCircle,
          query: `Explain the core concept of "${activeDoc.name}" like I am 5 years old`,
        },
      ]
    : [
        { label: 'Summarize page', action: 'summarize', icon: FileText, query: 'Summarize this page in 3 key takeaways' },
        { label: 'Action items', action: 'action_items', icon: ListTodo, query: 'Extract all action items and tasks from this document' },
        { label: 'Critique & gaps', action: 'chat', icon: Lightbulb, query: 'What is missing or unclear in this document? Give constructive feedback' },
        { label: 'Explain like I’m 5', action: 'eli5', icon: HelpCircle, query: 'Explain the core idea of this note like I am 5 years old' },
      ];

  return (
    <aside className="w-80 md:w-96 h-screen sticky top-0 flex-shrink-0 bg-white dark:bg-[#1a1a1a] border-l border-neutral-200/80 dark:border-neutral-800 flex flex-col z-40 shadow-2xl transition-all duration-200 animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-3.5 border-b border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between bg-[#fbfbfa] dark:bg-[#1f1f1f]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="font-semibold text-xs text-neutral-800 dark:text-neutral-100 flex items-center gap-1.5">
              <span>Notion AI Copilot</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="text-[10px] text-neutral-400 truncate max-w-[170px]">
              {documentTitle || 'Untitled'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() =>
              setMessages([
                {
                  id: 'welcome',
                  role: 'assistant',
                  content: `Cleared! Ask me anything about **"${documentTitle || 'Untitled'}"** or your attached documents.`,
                },
              ])
            }
            title="Clear conversation"
            className="p-1 rounded text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-800"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Document Reference Pill Bar */}
      {visibleAttachments.length > 0 && (
        <div className="px-3 py-1.5 border-b border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/70 dark:bg-neutral-900/40 relative">
          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400">
              <Paperclip className="w-3 h-3 text-purple-600 dark:text-purple-400" />
              <span>Reference:</span>
            </div>

            <button
              onClick={() => setIsDocDropdownOpen(!isDocDropdownOpen)}
              className="flex items-center gap-1 px-2 py-0.5 rounded-md font-medium text-purple-700 dark:text-purple-300 bg-purple-100/70 dark:bg-purple-950/50 hover:bg-purple-200/70 transition truncate max-w-[190px]"
            >
              <span className="truncate">{activeDoc ? activeDoc.name : `All ${visibleAttachments.length} Attachments`}</span>
              <ChevronDown className="w-3 h-3 flex-shrink-0" />
            </button>
          </div>

          {/* Reference Selector Dropdown */}
          {isDocDropdownOpen && (
            <div className="absolute right-3 top-8 z-50 w-56 bg-white dark:bg-[#222222] border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl p-1.5 text-xs animate-in fade-in duration-100">
              <button
                onClick={() => {
                  setActiveDoc(null);
                  onSelectDocument?.(null);
                  setIsDocDropdownOpen(false);
                }}
                className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between transition ${
                  !activeDoc
                    ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-semibold'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                <span>All Attached Documents</span>
                {!activeDoc && <Check className="w-3 h-3 text-purple-600" />}
              </button>

              <div className="h-[1px] bg-neutral-100 dark:bg-neutral-800 my-1" />

              {visibleAttachments.map((f) => (
                <button
                  key={f.id}
                  onClick={() => {
                    setActiveDoc(f);
                    onSelectDocument?.(f);
                    setIsDocDropdownOpen(false);
                  }}
                  className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between transition truncate ${
                    activeDoc?.id === f.id
                      ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-semibold'
                      : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  <span className="truncate">{f.name}</span>
                  {activeDoc?.id === f.id && <Check className="w-3 h-3 text-purple-600 flex-shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3.5">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div key={msg.id} className={`flex gap-2 text-xs ${isUser ? 'justify-end' : 'justify-start'}`}>
              {!isUser && (
                <div className="w-6 h-6 rounded-md bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-xl px-3 py-2 leading-relaxed ${
                  isUser
                    ? 'bg-purple-600 text-white rounded-tr-none'
                    : 'bg-neutral-100 dark:bg-neutral-800/80 text-neutral-800 dark:text-neutral-200 border border-neutral-200/50 dark:border-neutral-700/50 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans">{msg.content || (
                  <span className="flex items-center gap-1 text-neutral-400 italic">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Thinking...
                  </span>
                )}</div>

                {/* Assistant message action bar */}
                {!isUser && msg.content && msg.id !== 'welcome' && (
                  <div className="flex items-center justify-end gap-1 mt-2 pt-1.5 border-t border-neutral-200/40 dark:border-neutral-700/40 text-[11px] text-neutral-500">
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                    </button>
                    <button
                      onClick={() => onInsertIntoPage(msg.content)}
                      className="flex items-center gap-1 px-2 py-0.5 rounded bg-purple-600/10 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-600/20 font-medium transition"
                      title="Insert directly into document canvas"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Insert to Page</span>
                    </button>
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-6 h-6 rounded-md bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestions Chips */}
      {messages.length <= 4 && (
        <div className="p-2 border-t border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-900/30">
          <div className="text-[10px] uppercase font-bold text-neutral-400 mb-1.5 px-1 flex items-center justify-between">
            <span>{activeDoc ? `Prompts for ${activeDoc.name}` : 'Suggested Actions'}</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {quickPrompts.map((q, idx) => {
              const Icon = q.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSend(q.query, q.action)}
                  className="flex items-center gap-1.5 p-1.5 rounded-lg border border-neutral-200/60 dark:border-neutral-700/60 bg-white dark:bg-neutral-800 text-[11px] text-neutral-700 dark:text-neutral-300 hover:border-purple-300 dark:hover:border-purple-800 hover:text-purple-600 dark:hover:text-purple-300 transition text-left"
                >
                  <Icon className="w-3 h-3 text-purple-500 flex-shrink-0" />
                  <span className="truncate">{q.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Input Form */}
      <div className="p-3 border-t border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-[#1a1a1a]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-xl px-3 py-2 border border-neutral-200/80 dark:border-neutral-700/80 focus-within:border-purple-500 transition"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              activeDoc
                ? `Ask anything about ${activeDoc.name}...`
                : 'Ask AI about this page or attached PDFs...'
            }
            disabled={isLoading}
            className="w-full bg-transparent text-xs text-neutral-800 dark:text-neutral-200 focus:outline-none placeholder:text-neutral-400"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-1 rounded-lg bg-purple-600 text-white disabled:opacity-40 hover:bg-purple-700 transition"
          >
            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          </button>
        </form>
      </div>
    </aside>
  );
}
