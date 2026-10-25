'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  Quote,
  ExternalLink,
  Stethoscope,
} from 'lucide-react';
import { AttachedFile } from './DocumentAttachments';
import { formatPresentationTitle } from '@/lib/titleFormatter';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface AIChatSidecarProps {
  isOpen: boolean;
  onClose: () => void;
  documentId?: string;
  documentTitle: string;
  documentContent: string;
  attachedFiles?: AttachedFile[];
  selectedDocument?: AttachedFile | null;
  onSelectDocument?: (file: AttachedFile | null) => void;
  onInsertIntoPage: (markdown: string) => void;
}

function renderInlineSpans(text: string, onLinkClick: (href: string) => void) {
  const tokenRegex = /(\[[^\]]+\]\([^\)]+\)|\*\*[^*]+\*\*|`[^`]+`)/g;
  const parts = text.split(tokenRegex);

  return parts.map((part, idx) => {
    if (!part) return null;

    const linkMatch = part.match(/^\[([^\]]+)\]\(([^\)]+)\)$/);
    if (linkMatch) {
      const label = linkMatch[1];
      const href = linkMatch[2];
      return (
        <a
          key={idx}
          href={href}
          onClick={(e) => {
            if (href.startsWith('/doc/')) {
              e.preventDefault();
              onLinkClick(href);
            }
          }}
          className="text-purple-600 dark:text-purple-400 font-semibold underline underline-offset-2 hover:text-purple-700 dark:hover:text-purple-300 transition cursor-pointer"
        >
          {label}
        </a>
      );
    }

    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return (
        <strong key={idx} className="font-semibold text-neutral-900 dark:text-neutral-100">
          {part.slice(2, -2)}
        </strong>
      );
    }

    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      return (
        <code key={idx} className="bg-neutral-200/80 dark:bg-neutral-700 text-purple-700 dark:text-purple-300 px-1 py-0.5 rounded text-[10px] font-mono">
          {part.slice(1, -1)}
        </code>
      );
    }

    return <span key={idx}>{part}</span>;
  });
}

function renderFormattedContent(content: string, onLinkClick: (href: string) => void) {
  if (!content) return null;
  const lines = content.split('\n');

  return (
    <div className="space-y-1 text-xs">
      {lines.map((line, lIdx) => {
        const trimmed = line.trim();

        if (/^---$/.test(trimmed)) {
          return <hr key={lIdx} className="my-2 border-neutral-200 dark:border-neutral-700/60" />;
        }

        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={lIdx} className="font-bold text-xs text-neutral-900 dark:text-neutral-100 mt-2 mb-0.5">
              {renderInlineSpans(trimmed.slice(4), onLinkClick)}
            </h4>
          );
        }

        if (trimmed.startsWith('## ')) {
          return (
            <h3 key={lIdx} className="font-bold text-sm text-neutral-900 dark:text-neutral-100 mt-2.5 mb-1">
              {renderInlineSpans(trimmed.slice(3), onLinkClick)}
            </h3>
          );
        }

        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <div key={lIdx} className="flex items-start gap-1.5 pl-1 my-0.5">
              <span className="text-purple-500 font-bold leading-tight select-none">•</span>
              <div className="flex-1 leading-relaxed">
                {renderInlineSpans(trimmed.slice(2), onLinkClick)}
              </div>
            </div>
          );
        }

        if (!trimmed) {
          return <div key={lIdx} className="h-1" />;
        }

        return (
          <div key={lIdx} className="leading-relaxed">
            {renderInlineSpans(line, onLinkClick)}
          </div>
        );
      })}
    </div>
  );
}

export function AIChatSidecar({
  isOpen,
  onClose,
  documentId,
  documentTitle,
  documentContent,
  attachedFiles = [],
  selectedDocument = null,
  onSelectDocument,
  onInsertIntoPage,
}: AIChatSidecarProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `👋 Hi Laksha! I'm your AI Copilot for Laksha's WorkSpace. I'm connected to **"${
        documentTitle || 'Untitled'
      }"** and your attached documents.\n\nAsk me anything about this page or its PDFs, or pick a prompt below!`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeDoc, setActiveDoc] = useState<AttachedFile | null>(selectedDocument);
  const [isDocDropdownOpen, setIsDocDropdownOpen] = useState(false);
  const [includeSources, setIncludeSources] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('notion_ai_cite_sources');
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });
  const [isAddPresModalOpen, setIsAddPresModalOpen] = useState(false);
  const [presConditionInput, setPresConditionInput] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const visibleAttachments = attachedFiles.filter((f) => f.id !== '__kanban__');

  useEffect(() => {
    const handleOpenPres = () => {
      setIsAddPresModalOpen(true);
    };
    window.addEventListener('notion:open_ai_presentation_modal', handleOpenPres);
    return () => window.removeEventListener('notion:open_ai_presentation_modal', handleOpenPres);
  }, []);

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
          documentId,
          documentTitle,
          fileData: activeDoc ? activeDoc.url : undefined,
          fileName: activeDoc ? activeDoc.name : undefined,
          fileType: activeDoc ? activeDoc.type : undefined,
          attachedDocs: activeDoc ? undefined : visibleAttachments,
          includeSources,
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

      if (accumulated && typeof window !== 'undefined') {
        const docMatches = [...accumulated.matchAll(/\/doc\/([a-f0-9\-]{36})/g)];
        if (docMatches.length > 0) {
          for (const m of docMatches) {
            const createdId = m[1];
            window.dispatchEvent(
              new CustomEvent('notion:doc_created', { detail: { id: createdId, parent_id: documentId } })
            );
          }
          if (documentId) {
            window.dispatchEvent(
              new CustomEvent('notion:doc_updated', { detail: { id: documentId } })
            );
          }
        }
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

  const handleToggleSources = (checked: boolean) => {
    setIncludeSources(checked);
    if (typeof window !== 'undefined') {
      localStorage.setItem('notion_ai_cite_sources', String(checked));
    }
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
        { label: 'Add presentation...', action: 'add_presentation', icon: Stethoscope, query: 'Add presentation on ' },
        { label: 'Summarize page', action: 'summarize', icon: FileText, query: 'Summarize this page in 3 key takeaways' },
        { label: 'Action items', action: 'action_items', icon: ListTodo, query: 'Extract all action items and tasks from this document' },
        { label: 'Critique & gaps', action: 'chat', icon: Lightbulb, query: 'What is missing or unclear in this document? Give constructive feedback' },
      ];

  return (
    <>
      {/* Mobile Backdrop overlay */}
      <div
        className="fixed inset-0 z-40 md:hidden bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <aside className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 md:static md:sticky md:top-0 h-screen flex-shrink-0 bg-white dark:bg-[#1a1a1a] border-l border-neutral-200/80 dark:border-neutral-800 flex flex-col shadow-2xl transition-all duration-200 animate-in slide-in-from-right duration-200 relative">
        {/* Header */}
        <div className="p-3.5 border-b border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between bg-[#fbfbfa] dark:bg-[#1f1f1f]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="font-semibold text-xs text-neutral-800 dark:text-neutral-100 flex items-center gap-1.5">
                <span>Laksha&apos;s AI Copilot</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="text-[10px] text-neutral-400 truncate max-w-[170px]">
                {documentTitle || 'Untitled'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsAddPresModalOpen(true)}
              title="Add Clinical Presentation"
              className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/60 hover:bg-purple-200 dark:hover:bg-purple-900/60 border border-purple-200/80 dark:border-purple-800/80 transition shadow-xs"
            >
              <Stethoscope className="w-3 h-3 text-purple-600 dark:text-purple-400" />
              <span className="hidden sm:inline">Add Pres</span>
            </button>
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
              className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Document Reference Pill Bar & Source Citation Switch */}
        <div className="px-3 py-1.5 border-b border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/70 dark:bg-neutral-900/40 relative flex items-center justify-between gap-2">
          {visibleAttachments.length > 0 ? (
            <div className="flex items-center justify-between w-full text-[11px]">
              <div className="flex items-center gap-1 text-neutral-500 dark:text-neutral-400 truncate">
                <Paperclip className="w-3 h-3 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                <span className="hidden sm:inline">Ref:</span>
                <button
                  onClick={() => setIsDocDropdownOpen(!isDocDropdownOpen)}
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded font-medium text-purple-700 dark:text-purple-300 bg-purple-100/70 dark:bg-purple-950/50 hover:bg-purple-200/70 transition truncate max-w-[140px] sm:max-w-[160px]"
                >
                  <span className="truncate">{activeDoc ? activeDoc.name : `All (${visibleAttachments.length})`}</span>
                  <ChevronDown className="w-2.5 h-2.5 flex-shrink-0" />
                </button>
              </div>

              {/* Citations Toggle */}
              <label className="flex items-center gap-1 cursor-pointer text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 select-none flex-shrink-0">
                <input
                  type="checkbox"
                  checked={includeSources}
                  onChange={(e) => handleToggleSources(e.target.checked)}
                  className="w-3 h-3 rounded text-purple-600 accent-purple-600 cursor-pointer"
                />
                <span className="text-[10px] font-medium flex items-center gap-0.5">
                  <Quote className="w-2.5 h-2.5" />
                  <span>Citations</span>
                </span>
              </label>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full text-[10px] text-neutral-400">
              <span>Connected to page content</span>
              <label className="flex items-center gap-1 cursor-pointer text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 select-none">
                <input
                  type="checkbox"
                  checked={includeSources}
                  onChange={(e) => handleToggleSources(e.target.checked)}
                  className="w-3 h-3 rounded text-purple-600 accent-purple-600 cursor-pointer"
                />
                <span className="text-[10px] font-medium">Auto-cite</span>
              </label>
            </div>
          )}

          {/* Reference Selector Dropdown */}
          {isDocDropdownOpen && visibleAttachments.length > 0 && (
            <div className="absolute left-3 top-8 z-50 w-56 bg-white dark:bg-[#222222] border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl p-1.5 text-xs animate-in fade-in duration-100">
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
                  {isUser ? (
                    <div className="whitespace-pre-wrap font-sans">{msg.content}</div>
                  ) : msg.content ? (
                    renderFormattedContent(msg.content, (href) => router.push(href))
                  ) : (
                    <span className="flex items-center gap-1 text-neutral-400 italic">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Thinking...
                    </span>
                  )}

                  {/* Interactive Presentation Action Card if a subpage link is present */}
                  {!isUser && msg.content && (() => {
                    const match = msg.content.match(/(?:([^\s\[\]]+)\s+)?\[([^\]]+)\]\((\/doc\/[a-f0-9\-]{36})\)/);
                    if (!match) return null;
                    const presIcon = match[1] || '🩺';
                    const presTitle = match[2];
                    const presHref = match[3];

                    return (
                      <div className="mt-2.5 p-2 rounded-lg border border-purple-200 dark:border-purple-800/60 bg-white dark:bg-neutral-900 shadow-xs flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-sm">{presIcon}</span>
                          <span className="font-semibold text-xs text-purple-950 dark:text-purple-200 truncate">
                            {presTitle}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => router.push(presHref)}
                            className="flex items-center gap-1 px-2 py-1 rounded bg-purple-600 text-white text-[10px] font-semibold hover:bg-purple-700 transition"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Open</span>
                          </button>
                          <button
                            onClick={() => onInsertIntoPage(`${presIcon} [${presTitle}](${presHref})`)}
                            className="flex items-center gap-1 px-2 py-1 rounded bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-[10px] font-semibold hover:bg-purple-100 transition"
                            title="Insert active link into document"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Insert Link</span>
                          </button>
                        </div>
                      </div>
                    );
                  })()}

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
                    onClick={() => {
                      if (q.action === 'add_presentation') {
                        setIsAddPresModalOpen(true);
                      } else if (q.query.endsWith('on ')) {
                        setInput(q.query);
                        setTimeout(() => inputRef.current?.focus(), 50);
                      } else {
                        handleSend(q.query, q.action);
                      }
                    }}
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

        {/* Interactive Add Clinical Presentation Modal */}
        {isAddPresModalOpen && (
          <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-150">
            <div className="w-full max-w-sm bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-2xl border border-purple-200 dark:border-purple-800/80 p-4 space-y-3.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-300 flex items-center justify-center shadow-xs">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                      Add Clinical Presentation
                    </h3>
                    <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
                      Creates 9-point NICE CKS & RCGP guidance page
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsAddPresModalOpen(false);
                    setPresConditionInput('');
                  }}
                  className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Condition or Presentation Name
                </label>
                <input
                  type="text"
                  value={presConditionInput}
                  onChange={(e) => setPresConditionInput(e.target.value)}
                  placeholder="e.g. Migraine, Endometriosis, Hypertension..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/80 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && presConditionInput.trim() && !isLoading) {
                      e.preventDefault();
                      const val = formatPresentationTitle(presConditionInput.trim());
                      setIsAddPresModalOpen(false);
                      setPresConditionInput('');
                      handleSend(`Add presentation on ${val}`, 'add_presentation');
                    }
                  }}
                />
              </div>

              {/* Suggested Conditions */}
              <div>
                <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                  Suggestions:
                </div>
                <div className="flex flex-wrap gap-1">
                  {['Migraine', 'Endometriosis', 'Hypertension', 'Gout', 'Atopic Eczema', 'Type 2 Diabetes', 'Asthma'].map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => setPresConditionInput(formatPresentationTitle(sug))}
                      className="text-[10px] px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/60 transition"
                    >
                      + {sug}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddPresModalOpen(false);
                    setPresConditionInput('');
                  }}
                  className="px-3 py-1.5 text-xs text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!presConditionInput.trim() || isLoading}
                  onClick={() => {
                    const val = formatPresentationTitle(presConditionInput.trim());
                    setIsAddPresModalOpen(false);
                    setPresConditionInput('');
                    handleSend(`Add presentation on ${val}`, 'add_presentation');
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-40 transition shadow-sm"
                >
                  {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>Generate & Add</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
