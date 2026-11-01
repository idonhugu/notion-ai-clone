'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  X,
  Search,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Smartphone,
  ShieldAlert,
  Plus,
  FileText,
  RotateCcw,
  Loader2,
  Stethoscope,
  Info,
  CheckCircle2,
  MessageSquare,
  BookOpen,
  Filter,
} from 'lucide-react';
import {
  ACCURX_SNIPPETS,
  ACCURX_CATEGORIES,
  AccurxSnippet,
} from '@/lib/accurxSnippets';

interface AccurxModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDocId?: string;
  currentDocTitle?: string;
  currentDocContext?: string;
  onInsertIntoPage?: (markdown: string) => void;
}

export function AccurxModal({
  isOpen,
  onClose,
  currentDocId,
  currentDocTitle = '',
  currentDocContext = '',
  onInsertIntoPage,
}: AccurxModalProps) {
  const [activeTab, setActiveTab] = useState<'library' | 'ai_generator'>('library');

  // Library filters
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Quick variables for dynamic substitution
  const [patientName, setPatientName] = useState<string>('');
  const [clinicianName, setClinicianName] = useState<string>('Dr Laksha');
  const [surgeryName, setSurgeryName] = useState<string>('the Surgery');

  // Copied states
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedNoteId, setCopiedNoteId] = useState<string | null>(null);
  const [insertedId, setInsertedId] = useState<string | null>(null);

  // AI Generator states
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [aiTone, setAiTone] = useState<'standard' | 'empathic' | 'paediatric' | 'concise'>('standard');
  const [aiTargetLength, setAiTargetLength] = useState<'standard_pil' | 'single_sms'>('standard_pil');
  const [includeDocContext, setIncludeDocContext] = useState<boolean>(true);
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);
  const [aiStreamedOutput, setAiStreamedOutput] = useState<string>('');
  const [aiError, setAiError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const aiResultRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // If a currentDocTitle is provided, suggest pre-filtering if tab is first opened
  useEffect(() => {
    if (isOpen && currentDocTitle && !searchQuery) {
      // Check if doc title matches any tags
      const lower = currentDocTitle.toLowerCase();
      const hasMatch = ACCURX_SNIPPETS.some(
        (s) =>
          lower.includes(s.title.toLowerCase()) ||
          s.tags.some((t) => lower.includes(t)) ||
          s.title.toLowerCase().includes(lower)
      );
      if (hasMatch) {
        // We can pre-fill or keep available
      }
    }
  }, [isOpen, currentDocTitle]);

  // Replace placeholders dynamically
  const substitutePlaceholders = (template: string): string => {
    return template
      .replace(/\[Patient\]/g, patientName.trim() || 'Patient')
      .replace(/\[Patient Name\]/g, patientName.trim() || 'Patient')
      .replace(/\[Dr Name\]/g, clinicianName.trim() || 'Dr Laksha')
      .replace(/\[Surgery Name\]/g, surgeryName.trim() || 'the Surgery');
  };

  // Helper to compute SMS character count & segment count (160 chars per segment)
  const getSmsSegments = (text: string) => {
    const chars = text.length;
    if (chars === 0) return { chars: 0, segments: 0 };
    // Standard GSM 7-bit single SMS is 160 chars; concatenated SMS has headers (153 chars/segment)
    const segments = chars <= 160 ? 1 : Math.ceil(chars / 153);
    return { chars, segments };
  };

  // Filter snippets based on category, search query, and current document context
  const filteredSnippets = useMemo(() => {
    let list = ACCURX_SNIPPETS;

    if (selectedCategory !== 'All') {
      list = list.filter((s) => s.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.smsTemplate.toLowerCase().includes(q) ||
          s.pilTitle.toLowerCase().includes(q) ||
          s.tags.some((t) => t.toLowerCase().includes(q)) ||
          s.safetyNetting.toLowerCase().includes(q)
      );
    }

    return list;
  }, [selectedCategory, searchQuery]);

  // Contextual matches for the currently active presentation document
  const contextualSnippets = useMemo(() => {
    if (!currentDocTitle) return [];
    const lowerTitle = currentDocTitle.toLowerCase().trim();
    return ACCURX_SNIPPETS.filter((s) => {
      return (
        s.title.toLowerCase().includes(lowerTitle) ||
        lowerTitle.includes(s.title.toLowerCase()) ||
        s.tags.some((tag) => lowerTitle.includes(tag) || tag.includes(lowerTitle))
      );
    });
  }, [currentDocTitle]);

  const handleCopySms = (snippet: AccurxSnippet) => {
    const processedText = substitutePlaceholders(snippet.smsTemplate);
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(processedText);
      setCopiedId(snippet.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleCopyNote = (snippet: AccurxSnippet) => {
    const processedNote = substitutePlaceholders(snippet.suggestedConsultationNote);
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(processedNote);
      setCopiedNoteId(snippet.id);
      setTimeout(() => setCopiedNoteId(null), 2000);
    }
  };

  const handleInsertIntoDoc = (snippet: AccurxSnippet) => {
    if (!onInsertIntoPage) return;
    const processedSms = substitutePlaceholders(snippet.smsTemplate);
    const processedNote = substitutePlaceholders(snippet.suggestedConsultationNote);

    const markdownToInsert = `
> 📱 **Accurx SMS Message Sent (${snippet.category}):**
> "${processedSms}"
>
> 📚 **Verified NHS PIL:** [${snippet.pilTitle}](${snippet.pilUrl})
> 📝 **EHR Consultation Record:** \`${processedNote}\`
`;
    onInsertIntoPage(markdownToInsert);
    setInsertedId(snippet.id);
    setTimeout(() => setInsertedId(null), 2500);
  };

  // Trigger AI generation of custom Accurx SMS
  const handleStartAiGeneration = async () => {
    if (!aiPrompt.trim() || isAiGenerating) return;

    setIsAiGenerating(true);
    setAiStreamedOutput('');
    setAiError(null);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const payload: any = {
        action: 'generate_accurx_sms',
        prompt: aiPrompt.trim(),
        condition: currentDocTitle || '',
        tone: aiTone,
        characterTarget: aiTargetLength,
      };

      if (includeDocContext && currentDocContext) {
        payload.context = currentDocContext.substring(0, 2000);
      }

      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: abortControllerRef.current.signal,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Server error: ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No readable stream received.');

      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;
        setAiStreamedOutput(accumulated);

        if (aiResultRef.current) {
          aiResultRef.current.scrollTop = aiResultRef.current.scrollHeight;
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Accurx AI generation error:', err);
        setAiError(err.message || 'Failed to generate SMS. Please try again.');
      }
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Helper to extract the SMS message from streamed AI response
  const parsedAiSms = useMemo(() => {
    if (!aiStreamedOutput) return '';
    // Look for text between codeblocks or after header
    const codeBlockMatch = aiStreamedOutput.match(/```(?:text)?\s*([\s\S]*?)```/i);
    if (codeBlockMatch && codeBlockMatch[1]) {
      return codeBlockMatch[1].trim();
    }
    // Fallback: extract under header
    const headerMatch = aiStreamedOutput.match(/### 📱 Ready-to-Copy Accurx SMS Message\s*([\s\S]*?)(?:###|$)/i);
    if (headerMatch && headerMatch[1]) {
      return headerMatch[1].replace(/```/g, '').trim();
    }
    return '';
  }, [aiStreamedOutput]);

  // Extract verified NHS PIL URL from streamed AI response
  const extractedPilUrl = useMemo(() => {
    if (!aiStreamedOutput) return '';
    const match =
      aiStreamedOutput.match(/https?:\/\/(?:www\.)?(?:nhs\.uk|patient\.info)[^\s\)\>\]]+/i) ||
      aiStreamedOutput.match(/https?:\/\/[^\s\)\>\]]+/i);
    return match ? match[0].replace(/[.,;]$/, '') : '';
  }, [aiStreamedOutput]);

  const handleCopyAiSms = () => {
    const textToCopy = parsedAiSms || aiStreamedOutput;
    if (typeof window !== 'undefined' && textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopiedId('ai-generated');
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleInsertAiSmsToDoc = () => {
    if (!onInsertIntoPage || !aiStreamedOutput) return;
    const markdownToInsert = `
> 📱 **Accurx SMS Message Sent (Custom AI Generated):**
${aiStreamedOutput}
`;
    onInsertIntoPage(markdownToInsert);
    setInsertedId('ai-generated');
    setTimeout(() => setInsertedId(null), 2500);
  };

  const PRESET_PROMPTS = [
    {
      label: 'Ramipril Start & Bloods',
      prompt: 'Starting Ramipril 2.5mg once daily for hypertension. Remind to book U&E bloods in 2 weeks. Warn about dry cough and dizziness.',
    },
    {
      label: 'Delayed Amoxicillin (Child)',
      prompt: 'Delayed antibiotic for 4yo with earache / tonsillitis. Advise Calpol/Nurofen, collect amoxicillin only if no improvement after 48 hours.',
    },
    {
      label: 'Eczema Flare & Steroid Rules',
      prompt: 'Hydrocortisone 1% cream once daily for 1-2 weeks for eczema flare. Explain Fingertip Unit rule and generous moisturiser 30 mins apart.',
    },
    {
      label: 'Back Pain & Cauda Equina',
      prompt: 'Acute lower back pain advice: keep gently mobile, paracetamol, heat pack. Explicitly list Cauda Equina red flags (numbness in groin/saddle, bladder/bowel incontinence).',
    },
    {
      label: 'IAPT Talking Therapies',
      prompt: 'Anxiety and low mood support: send NHS Talking Therapies self-referral link and Samaritans 116 123 / 111 crisis contacts.',
    },
    {
      label: 'Normal Bloods Reassurance',
      prompt: 'Recent blood test results reviewed and all completely normal. No action needed unless original symptoms persist.',
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-5xl h-[92vh] max-h-[880px] bg-white dark:bg-[#1c1c1c] rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col overflow-hidden text-neutral-900 dark:text-neutral-100 font-sans">
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-2xs">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-neutral-100">
                  Accurx & SMS Snippet Library
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
                  NHS Verified PILs
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 hidden sm:block">
                Ready-to-copy SMS templates with verified NHS self-care links, or ask AI to generate custom snippets.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* TABS SELECTOR */}
            <div className="flex items-center p-0.5 bg-neutral-200/60 dark:bg-neutral-800 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('library')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition ${
                  activeTab === 'library'
                    ? 'bg-white dark:bg-[#252525] text-neutral-900 dark:text-neutral-100 shadow-2xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                <span>Library ({ACCURX_SNIPPETS.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('ai_generator')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition ${
                  activeTab === 'ai_generator'
                    ? 'bg-white dark:bg-[#252525] text-purple-600 dark:text-purple-300 shadow-2xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                <span>Ask AI to Generate</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MODAL BODY */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* TAB 1: CURATED SNIPPET LIBRARY */}
          {activeTab === 'library' && (
            <div className="space-y-4">
              {/* SEARCH & QUICK VARIABLES BAR */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 p-3 rounded-xl bg-neutral-50/80 dark:bg-neutral-900/40 border border-neutral-200/80 dark:border-neutral-800">
                {/* Search input */}
                <div className="md:col-span-5 relative">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search templates, symptoms, drugs (e.g. cough, ramipril, eczema)..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-lg text-xs bg-white dark:bg-[#222] border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-neutral-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Quick Variables */}
                <div className="md:col-span-7 flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                    Auto-Fill:
                  </span>
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="[Patient Name]"
                    className="w-28 px-2 py-1 rounded-md text-xs bg-white dark:bg-[#222] border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    title="Replaces [Patient] in templates"
                  />
                  <input
                    type="text"
                    value={clinicianName}
                    onChange={(e) => setClinicianName(e.target.value)}
                    placeholder="[Dr Name]"
                    className="w-28 px-2 py-1 rounded-md text-xs bg-white dark:bg-[#222] border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    title="Replaces [Dr Name] in templates"
                  />
                  <input
                    type="text"
                    value={surgeryName}
                    onChange={(e) => setSurgeryName(e.target.value)}
                    placeholder="[Surgery Name]"
                    className="w-32 px-2 py-1 rounded-md text-xs bg-white dark:bg-[#222] border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    title="Replaces [Surgery Name] in templates"
                  />
                </div>
              </div>

              {/* CATEGORY FILTER TABS */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                {ACCURX_CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>

              {/* CONTEXT MATCH BANNER */}
              {contextualSnippets.length > 0 && selectedCategory === 'All' && !searchQuery && (
                <div className="p-3 rounded-xl bg-purple-50/80 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                    <span className="text-xs font-semibold text-purple-900 dark:text-purple-200">
                      Suggested for active presentation: <span className="underline">{currentDocTitle}</span> ({contextualSnippets.length} matches)
                    </span>
                  </div>
                  <span className="text-[11px] text-purple-700 dark:text-purple-300 font-medium">
                    Highlighted below
                  </span>
                </div>
              )}

              {/* SNIPPETS GRID */}
              <div className="space-y-3.5">
                {filteredSnippets.length === 0 ? (
                  <div className="p-12 text-center text-neutral-400 space-y-2">
                    <Smartphone className="w-8 h-8 mx-auto text-neutral-300 dark:text-neutral-600" />
                    <p className="text-sm font-medium">No SMS templates found matching "{searchQuery}"</p>
                    <p className="text-xs text-neutral-500">
                      Try searching by generic drug name, symptom, or switch to the <strong>Ask AI to Generate</strong> tab!
                    </p>
                  </div>
                ) : (
                  filteredSnippets.map((snippet) => {
                    const finalSmsText = substitutePlaceholders(snippet.smsTemplate);
                    const { chars, segments } = getSmsSegments(finalSmsText);
                    const isCopied = copiedId === snippet.id;
                    const isNoteCopied = copiedNoteId === snippet.id;
                    const isInserted = insertedId === snippet.id;
                    const isContextMatch = contextualSnippets.some((cs) => cs.id === snippet.id);

                    return (
                      <div
                        key={snippet.id}
                        className={`p-4 rounded-xl border bg-white dark:bg-[#202020] space-y-3 transition shadow-2xs hover:shadow-sm ${
                          isContextMatch
                            ? 'border-purple-300 dark:border-purple-700 ring-1 ring-purple-200 dark:ring-purple-900/50'
                            : 'border-neutral-200 dark:border-neutral-800'
                        }`}
                      >
                        {/* Header: Title, Category & Character Count */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                              {snippet.title}
                            </h3>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200/60 dark:border-neutral-700/60">
                              {snippet.category}
                            </span>
                            {isContextMatch && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300">
                                ⭐ Page Match
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span
                              className={`text-[11px] font-mono font-medium px-2 py-0.5 rounded-md ${
                                segments === 1
                                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/70'
                                  : 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200/70 dark:border-purple-800/70'
                              }`}
                              title={`${chars} characters (${segments} SMS segment${segments > 1 ? 's' : ''})`}
                            >
                              {chars} chars · {segments} SMS
                            </span>
                          </div>
                        </div>

                        {/* Verified NHS PIL Link */}
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="text-[11px] font-semibold text-neutral-500">
                            Verified NHS Leaflet:
                          </span>
                          <a
                            href={snippet.pilUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer pointer-events-auto"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(snippet.pilUrl, '_blank', 'noopener,noreferrer');
                            }}
                          >
                            <span>{snippet.pilTitle}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>

                        {/* SMS Text Box with Linkified URLs */}
                        <div className="p-3 rounded-lg bg-neutral-50 dark:bg-[#181818] border border-neutral-200/70 dark:border-neutral-800/80 font-sans text-xs text-neutral-800 dark:text-neutral-200 leading-relaxed whitespace-pre-wrap select-all">
                          {renderTextWithClickableLinks(finalSmsText)}
                        </div>

                        {/* Safety Netting & Red Flags info */}
                        <div className="flex items-center gap-1.5 text-[11px] text-amber-800 dark:text-amber-300/90 bg-amber-50/70 dark:bg-amber-950/20 px-2.5 py-1 rounded-md border border-amber-200/60 dark:border-amber-900/40">
                          <ShieldAlert className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                          <span>
                            <strong>Safety Netting Included:</strong> {snippet.safetyNetting}
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-neutral-100 dark:border-neutral-800/60">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleCopyNote(snippet)}
                              className="text-[11px] font-medium text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 flex items-center gap-1 transition"
                              title="Copy consultation record entry for EMIS / SystmOne"
                            >
                              {isNoteCopied ? (
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <FileText className="w-3.5 h-3.5" />
                              )}
                              <span>{isNoteCopied ? 'Note Copied!' : 'Copy EHR Note'}</span>
                            </button>

                            {/* Direct Open Leaflet Link */}
                            <a
                              href={snippet.pilUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-blue-50 dark:hover:bg-blue-950/40 transition"
                              title={`Open ${snippet.pilTitle} on NHS.uk`}
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>Open Leaflet</span>
                            </a>
                          </div>

                          <div className="flex items-center gap-2">
                            {onInsertIntoPage && (
                              <button
                                type="button"
                                onClick={() => handleInsertIntoDoc(snippet)}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-200/60 dark:border-neutral-700 transition"
                                title="Insert SMS record into active document"
                              >
                                {isInserted ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                                ) : (
                                  <Plus className="w-3.5 h-3.5 text-neutral-500" />
                                )}
                                <span>{isInserted ? 'Inserted!' : 'Insert to Note'}</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleCopySms(snippet)}
                              className={`flex items-center gap-1.5 px-3.5 py-1 rounded-lg text-xs font-bold transition shadow-2xs ${
                                isCopied
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                              }`}
                              title="Copy SMS to clipboard for Accurx / Chain SMS"
                            >
                              {isCopied ? (
                                <Check className="w-3.5 h-3.5" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                              <span>{isCopied ? 'Copied to Clipboard!' : 'Copy SMS'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 2: ASK AI TO GENERATE CUSTOM ACCURX SMS */}
          {activeTab === 'ai_generator' && (
            <div className="space-y-4">
              {/* Presets Bar */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                  Quick Clinical Presets:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_PROMPTS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAiPrompt(p.prompt)}
                      className="px-2.5 py-1 rounded-lg text-xs bg-neutral-100 dark:bg-neutral-800 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-neutral-700 dark:text-neutral-300 hover:text-purple-700 dark:hover:text-purple-300 border border-neutral-200/60 dark:border-neutral-700 transition"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Prompt Input Box */}
              <div className="space-y-2 p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/70 dark:border-purple-800/70">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    <span>What advice or prescription instructions do you want to text?</span>
                  </label>
                  {currentDocTitle && (
                    <span className="text-[11px] text-purple-700 dark:text-purple-300 font-medium">
                      Active: {currentDocTitle}
                    </span>
                  )}
                </div>

                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g. 52yo starting Allopurinol 100mg for gout. Warn about paradoxical flare risk with naproxen cover. Bloods in 4-6 weeks for uric acid. Report rash/blistering immediately..."
                  rows={3}
                  className="w-full p-3 rounded-lg text-xs bg-white dark:bg-[#202020] border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />

                {/* Options Controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-neutral-500 font-semibold">Tone:</span>
                      <select
                        value={aiTone}
                        onChange={(e) => setAiTone(e.target.value as any)}
                        className="px-2 py-1 rounded-md text-xs bg-white dark:bg-[#202020] border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200"
                      >
                        <option value="standard">Standard GP</option>
                        <option value="empathic">Empathic / Gentle</option>
                        <option value="paediatric">Paediatric Parent</option>
                        <option value="concise">Concise / Elderly Friendly</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-neutral-500 font-semibold">Length:</span>
                      <select
                        value={aiTargetLength}
                        onChange={(e) => setAiTargetLength(e.target.value as any)}
                        className="px-2 py-1 rounded-md text-xs bg-white dark:bg-[#202020] border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200"
                      >
                        <option value="standard_pil">Standard with PIL (1-2 SMS)</option>
                        <option value="single_sms">Ultra-Concise (1 SMS ≤160 chars)</option>
                      </select>
                    </div>

                    {currentDocContext && (
                      <label className="flex items-center gap-1.5 cursor-pointer text-neutral-700 dark:text-neutral-300">
                        <input
                          type="checkbox"
                          checked={includeDocContext}
                          onChange={(e) => setIncludeDocContext(e.target.checked)}
                          className="rounded text-purple-600 focus:ring-purple-500"
                        />
                        <span>Include page notes</span>
                      </label>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleStartAiGeneration}
                    disabled={isAiGenerating || !aiPrompt.trim()}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 transition shadow-xs cursor-pointer"
                  >
                    {isAiGenerating ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Generating Accurx SMS...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Generate SMS</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Error display */}
              {aiError && (
                <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-200 flex items-center justify-between">
                  <span>{aiError}</span>
                  <button onClick={() => setAiError(null)}>
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Streaming Output Box */}
              {(isAiGenerating || aiStreamedOutput) && (
                <div
                  ref={aiResultRef}
                  className="space-y-3 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#202020] shadow-sm animate-in fade-in"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                        Generated Accurx Template & Leaflet
                      </span>
                      {parsedAiSms && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold">
                          {parsedAiSms.length} chars · {getSmsSegments(parsedAiSms).segments} SMS
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {extractedPilUrl && (
                        <a
                          href={extractedPilUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900 transition"
                          title="Open verified NHS leaflet in new tab"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Open NHS Leaflet</span>
                        </a>
                      )}

                      <button
                        type="button"
                        onClick={handleCopyAiSms}
                        className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition shadow-2xs"
                      >
                        {copiedId === 'ai-generated' ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>{copiedId === 'ai-generated' ? 'Copied SMS!' : 'Copy SMS'}</span>
                      </button>

                      {onInsertIntoPage && (
                        <button
                          type="button"
                          onClick={handleInsertAiSmsToDoc}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 border border-neutral-200/60 dark:border-neutral-700 transition"
                        >
                          {insertedId === 'ai-generated' ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Plus className="w-3.5 h-3.5" />
                          )}
                          <span>{insertedId === 'ai-generated' ? 'Inserted!' : 'Insert to Note'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div
                    className="text-xs font-sans leading-relaxed text-neutral-800 dark:text-neutral-200 space-y-2.5"
                    dangerouslySetInnerHTML={{ __html: formatAccurxHtml(aiStreamedOutput) }}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/40 text-[11px] text-neutral-500 dark:text-neutral-400">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-blue-500" />
            <span>
              All PIL URLs verified against official NHS.uk and Patient.info UK clinical guidance.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline">Shortcut:</span>
            <kbd className="px-1.5 py-0.5 rounded bg-neutral-200/60 dark:bg-neutral-800 text-[10px] font-mono">
              Cmd + Shift + A
            </kbd>
          </div>
        </div>
      </div>
    </div>
  );
}

// Convert plain text into React elements with clickable links
function renderTextWithClickableLinks(text: string): React.ReactNode {
  if (!text) return '';
  const urlRegex = /(https?:\/\/[^\s\)\>\]]+)/g;
  const parts = text.split(urlRegex);

  return parts.map((part, i) => {
    if (part.startsWith('http://') || part.startsWith('https://')) {
      const cleanUrl = part.replace(/[.,;]$/, '');
      return (
        <a
          key={i}
          href={cleanUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 font-semibold underline hover:text-blue-700 cursor-pointer inline-flex items-center gap-0.5 pointer-events-auto"
          onClick={(e) => {
            e.stopPropagation();
            window.open(cleanUrl, '_blank', 'noopener,noreferrer');
          }}
        >
          <span>{part}</span>
          <ExternalLink className="w-2.5 h-2.5 inline" />
        </a>
      );
    }
    return part;
  });
}

// Sanitized HTML formatter for AI-streamed Accurx output with clickable links and badges
function formatAccurxHtml(rawMarkdown: string): string {
  if (!rawMarkdown) return '';

  let html = rawMarkdown
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Format code blocks (SMS message & EHR snippet)
  html = html.replace(
    /```(?:text)?\n([\s\S]*?)\n```/g,
    '<div class="my-2.5 p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/80 font-sans text-xs text-blue-950 dark:text-blue-200 select-all leading-relaxed whitespace-pre-wrap">$1</div>'
  );

  // Format Headings
  html = html.replace(/^### (.*$)/gim, '<h3 class="text-xs font-bold text-blue-700 dark:text-blue-300 mt-3.5 mb-1 flex items-center gap-1.5">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 class="text-sm font-bold text-neutral-900 dark:text-neutral-100 mt-4 mb-2">$1</h2>');

  // Format bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-neutral-900 dark:text-neutral-100">$1</strong>');

  // Format markdown links [Label](url) as clickable badges
  html = html.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-blue-100/80 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-semibold hover:underline text-[11px] transition cursor-pointer">$1 ↗</a>'
  );

  // Format bare URLs not already in href
  html = html.replace(
    /(?<!href=")(https?:\/\/[^\s\)\>\]]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 font-semibold underline hover:text-blue-700 inline-flex items-center gap-0.5">$1 ↗</a>'
  );

  // Format bullet items
  html = html.replace(/^\- (.*$)/gim, '<div class="flex items-start gap-2 my-1"><span class="text-blue-500 font-bold">&bull;</span><span>$1</span></div>');

  return html;
}
