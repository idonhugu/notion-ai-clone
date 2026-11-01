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
  FileText,
  RotateCcw,
  Loader2,
  Stethoscope,
  BookOpen,
  Monitor,
  Maximize2,
  Minimize2,
  Send,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react';
import {
  PATIENT_EXPLAINER_TOPICS,
  PatientExplainerTopic,
} from '@/lib/patientExplainers';
import { PatientDiagram } from './PatientDiagrams';

interface PatientExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDocId?: string;
  currentDocTitle?: string;
  currentDocContext?: string;
  onInsertIntoPage?: (markdown: string) => void;
}

const PRESET_AI_PROMPTS = [
  {
    label: 'Statins with Normal Cholesterol',
    prompt: 'Explain to a patient why they should take a statin for cardiovascular risk reduction / plaque fireproofing even if their cholesterol numbers are normal.',
  },
  {
    label: 'Frozen Shoulder (Adhesive Capsulitis)',
    prompt: 'Explain the 3 phases of frozen shoulder (freezing, frozen, thawing) and why exercises hurt initially but are crucial for capsule stretching.',
  },
  {
    label: 'HRT Patches & Blood Clot Safety',
    prompt: 'Explain how transdermal estrogen (patches/gel) bypasses the liver and does not increase blood clot risk compared to older oral tablets.',
  },
  {
    label: 'Acid Reflux & PPI Stomach Healing',
    prompt: 'Explain why stomach acid splashing into the esophagus causes heartburn, and how a 4-8 week course of omeprazole lets the lining heal like a blister healing.',
  },
  {
    label: 'Inner Ear Crystals (BPPV)',
    prompt: 'Explain BPPV: how microscopic calcium crystals dislodge into balance canals, causing brief spinning when turning in bed, and how the Epley manoeuvre rolls them back.',
  },
  {
    label: 'Subclinical Hypothyroidism Watchful Waiting',
    prompt: 'Explain why slightly raised TSH with normal T4 often self-corrects and why repeating blood tests in 3 months is safer than rushing into lifelong thyroxine tablets.',
  },
];

export function PatientExplainerModal({
  isOpen,
  onClose,
  currentDocId,
  currentDocTitle = '',
  currentDocContext = '',
  onInsertIntoPage,
}: PatientExplainerModalProps) {
  const [activeTab, setActiveTab] = useState<'catalog' | 'ai_generator'>('catalog');
  const [selectedTopicId, setSelectedTopicId] = useState<string>(PATIENT_EXPLAINER_TOPICS[0].id);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Copy states
  const [copiedSmsId, setCopiedSmsId] = useState<string | null>(null);
  const [copiedNoteId, setCopiedNoteId] = useState<string | null>(null);
  const [insertedId, setInsertedId] = useState<string | null>(null);

  // AI custom explainer generator states
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);
  const [aiStreamedOutput, setAiStreamedOutput] = useState<string>('');
  const [aiError, setAiError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const aiOutputRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isFullscreen, onClose]);

  // Contextual matching: if current document title matches a topic, select it
  useEffect(() => {
    if (isOpen && currentDocTitle) {
      const lower = currentDocTitle.toLowerCase();
      const match = PATIENT_EXPLAINER_TOPICS.find(
        (t) =>
          lower.includes(t.title.toLowerCase()) ||
          t.title.toLowerCase().includes(lower) ||
          (t.id.includes('glue') && lower.includes('ear')) ||
          (t.id.includes('sciatica') && (lower.includes('back') || lower.includes('sciatica'))) ||
          (t.id.includes('gout') && lower.includes('gout')) ||
          (t.id.includes('eczema') && lower.includes('eczema')) ||
          (t.id.includes('asthma') && lower.includes('asthma'))
      );
      if (match) {
        setSelectedTopicId(match.id);
      }
    }
  }, [isOpen, currentDocTitle]);

  // Filter topics
  const filteredTopics = useMemo(() => {
    let list = PATIENT_EXPLAINER_TOPICS;
    if (selectedCategory !== 'All') {
      list = list.filter((t) => t.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.subtitle.toLowerCase().includes(q) ||
          t.analogy.title.toLowerCase().includes(q) ||
          t.analogy.description.toLowerCase().includes(q) ||
          t.whyIntuitiveTreatmentFails.treatment.toLowerCase().includes(q)
      );
    }
    return list;
  }, [selectedCategory, searchQuery]);

  const activeTopic = useMemo(() => {
    return (
      PATIENT_EXPLAINER_TOPICS.find((t) => t.id === selectedTopicId) ||
      PATIENT_EXPLAINER_TOPICS[0]
    );
  }, [selectedTopicId]);

  const categories = useMemo(() => {
    const set = new Set(PATIENT_EXPLAINER_TOPICS.map((t) => t.category));
    return ['All', ...Array.from(set)];
  }, []);

  const handleCopySms = (topic: PatientExplainerTopic) => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(topic.smsSummary);
      setCopiedSmsId(topic.id);
      setTimeout(() => setCopiedSmsId(null), 2000);
    }
  };

  const handleCopyNote = (topic: PatientExplainerTopic) => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(topic.consultationNoteSnippet);
      setCopiedNoteId(topic.id);
      setTimeout(() => setCopiedNoteId(null), 2000);
    }
  };

  const handleInsertIntoDoc = (topic: PatientExplainerTopic) => {
    if (!onInsertIntoPage) return;
    const markdown = `
> 🖥️ **Patient Visual Explainer Used in Consultation:**
> **Topic:** ${topic.title} (${topic.category})
> **Lay Analogy:** "${topic.analogy.title}" — *${topic.analogy.tagline}*
>
> **Consultation Summary:**
> ${topic.consultationNoteSnippet}
>
> 📱 *Patient SMS sent with verified NHS PIL: [${topic.pilTitle}](${topic.pilUrl})*
`;
    onInsertIntoPage(markdown);
    setInsertedId(topic.id);
    setTimeout(() => setInsertedId(null), 2500);
  };

  // AI custom generator stream handler
  const handleGenerateCustomExplainer = async (promptToUse = aiPrompt) => {
    if (!promptToUse.trim() || isAiGenerating) return;

    setIsAiGenerating(true);
    setAiStreamedOutput('');
    setAiError(null);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_patient_explainer',
          prompt: promptToUse,
          documentTitle: currentDocTitle,
          context: currentDocContext,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP ${res.status} failed`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No streaming response body');

      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;
        setAiStreamedOutput(accumulated);

        if (aiOutputRef.current) {
          aiOutputRef.current.scrollTop = aiOutputRef.current.scrollHeight;
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      console.error('Custom explainer generation error:', err);
      setAiError(err.message || 'Failed to generate visual explainer.');
    } finally {
      setIsAiGenerating(false);
    }
  };

  // All hooks must execute unconditionally before early return
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className={`relative w-full ${
          isFullscreen
            ? 'h-screen max-h-screen rounded-none'
            : 'max-w-6xl h-[94vh] max-h-[920px] rounded-2xl'
        } bg-white dark:bg-[#1a1a1a] shadow-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col overflow-hidden text-neutral-900 dark:text-neutral-100 font-sans transition-all`}
      >
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-900/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-600/20 shrink-0">
              <Monitor className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-neutral-100">
                  Patient Visual Explainer Mode
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60">
                  Turn the Screen
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 hidden sm:block">
                Clear lay analogies and high-resolution anatomical diagrams to explain pathology in 30 seconds.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* TABS SELECTOR */}
            <div className="flex items-center p-0.5 bg-neutral-200/60 dark:bg-neutral-800 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('catalog')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition ${
                  activeTab === 'catalog'
                    ? 'bg-white dark:bg-[#252525] text-neutral-900 dark:text-neutral-100 shadow-2xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-purple-500" />
                <span>Show Patient ({PATIENT_EXPLAINER_TOPICS.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('ai_generator')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition ${
                  activeTab === 'ai_generator'
                    ? 'bg-white dark:bg-[#252525] text-neutral-900 dark:text-neutral-100 shadow-2xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Ask AI to Generate</span>
              </button>
            </div>

            {/* FULLSCREEN "TURN THE SCREEN" TOGGLE */}
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition"
              title={isFullscreen ? 'Exit Fullscreen' : 'Turn Screen Fullscreen Mode'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* CLOSE BUTTON */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* MODAL BODY */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {activeTab === 'catalog' ? (
            <>
              {/* TOPIC LIST SIDEBAR (Desktop Left, Mobile Collapsible) */}
              <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-neutral-200 dark:border-neutral-800 flex flex-col bg-neutral-50/50 dark:bg-[#161616] shrink-0">
                {/* Search & Category Filter */}
                <div className="p-3 border-b border-neutral-200/70 dark:border-neutral-800 space-y-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="Search condition or organ..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs bg-white dark:bg-[#202020] border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>

                  {/* Category Pills */}
                  <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold transition shrink-0 ${
                          selectedCategory === cat
                            ? 'bg-purple-600 text-white'
                            : 'bg-neutral-200/70 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-300 dark:hover:bg-neutral-700'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Topics List */}
                <div className="flex-1 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800/60 max-h-48 md:max-h-full">
                  {filteredTopics.map((topic) => {
                    const isSelected = topic.id === activeTopic.id;
                    return (
                      <div
                        key={topic.id}
                        onClick={() => setSelectedTopicId(topic.id)}
                        className={`p-3 cursor-pointer transition flex items-start gap-2.5 ${
                          isSelected
                            ? 'bg-purple-50/80 dark:bg-purple-950/40 border-l-4 border-purple-600'
                            : 'hover:bg-neutral-100/70 dark:hover:bg-neutral-800/40'
                        }`}
                      >
                        <span className="text-xl shrink-0 mt-0.5">{topic.icon}</span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <h4
                              className={`text-xs font-bold truncate ${
                                isSelected
                                  ? 'text-purple-900 dark:text-purple-200'
                                  : 'text-neutral-900 dark:text-neutral-100'
                              }`}
                            >
                              {topic.title}
                            </h4>
                            <span className="text-[9px] px-1.5 py-0.2 rounded font-semibold bg-neutral-200/70 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 shrink-0">
                              {topic.category}
                            </span>
                          </div>
                          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-1 mt-0.5">
                            {topic.analogy.tagline}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* MAIN PATIENT-FACING DISPLAY STAGE */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-white dark:bg-[#1a1a1a]">
                {/* Visual Explainer Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100 dark:border-neutral-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{activeTopic.icon}</span>
                      <h1 className="text-lg sm:text-2xl font-extrabold text-neutral-900 dark:text-neutral-100 tracking-tight">
                        {activeTopic.title}
                      </h1>
                    </div>
                    <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                      {activeTopic.subtitle}
                    </p>
                  </div>

                  {/* Fast Action Buttons Bar */}
                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleCopySms(activeTopic)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition shadow-2xs"
                      title="Copy ready-to-send SMS with NHS leaflet link"
                    >
                      {copiedSmsId === activeTopic.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Smartphone className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedSmsId === activeTopic.id ? 'SMS Copied!' : 'Text to Patient'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopyNote(activeTopic)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-200/80 dark:border-neutral-700 transition shadow-2xs"
                      title="Copy consultation record note for EMIS / SystmOne"
                    >
                      {copiedNoteId === activeTopic.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <FileText className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedNoteId === activeTopic.id ? 'Note Copied!' : 'EHR Record'}</span>
                    </button>

                    {onInsertIntoPage && (
                      <button
                        type="button"
                        onClick={() => handleInsertIntoDoc(activeTopic)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white transition shadow-sm"
                        title="Insert explainer entry into current consultation document"
                      >
                        {insertedId === activeTopic.id ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : (
                          <Send className="w-3.5 h-3.5" />
                        )}
                        <span>{insertedId === activeTopic.id ? 'Inserted!' : 'Insert to Note'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* INTERACTIVE HIGH-RESOLUTION ANATOMICAL DIAGRAM */}
                <div className="w-full">
                  <PatientDiagram
                    type={activeTopic.diagramType}
                    isTurnScreenFullscreen={isFullscreen}
                  />
                </div>

                {/* THE EVERYDAY ANALOGY CARD */}
                <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/50 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{activeTopic.analogy.emoji}</span>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-amber-900 dark:text-amber-200">
                        {activeTopic.analogy.title}
                      </h3>
                      <p className="text-xs font-semibold text-amber-700 dark:text-amber-300/90">
                        {activeTopic.analogy.tagline}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-amber-950 dark:text-amber-100 leading-relaxed font-normal">
                    {activeTopic.analogy.description}
                  </p>
                </div>

                {/* WHY INTUITIVE TREATMENT FAILS (THE ESSENTIAL GP TIME-SAVER) */}
                <div className="p-4 sm:p-5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/50 space-y-2">
                  <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-bold text-sm sm:text-base">
                    <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
                    <span>Why {activeTopic.whyIntuitiveTreatmentFails.treatment} Won&apos;t Help Here:</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="p-3 rounded-xl bg-white/80 dark:bg-black/20 border border-rose-200/60 dark:border-rose-900/40 text-xs text-neutral-800 dark:text-neutral-200">
                      <strong className="text-rose-700 dark:text-rose-400 block mb-1">
                        Common Misconception:
                      </strong>
                      {activeTopic.whyIntuitiveTreatmentFails.misconception}
                    </div>
                    <div className="p-3 rounded-xl bg-white/80 dark:bg-black/20 border border-rose-200/60 dark:border-rose-900/40 text-xs text-neutral-800 dark:text-neutral-200">
                      <strong className="text-emerald-700 dark:text-emerald-400 block mb-1">
                        Medical Reality:
                      </strong>
                      {activeTopic.whyIntuitiveTreatmentFails.medicalReality}
                    </div>
                  </div>
                </div>

                {/* WHAT YOU CAN DO AT HOME (ACTION PLAN) */}
                <div className="space-y-2.5">
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>What You Can Do at Home (Action Plan):</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {activeTopic.homeActionPlan.map((action, i) => (
                      <div
                        key={i}
                        className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-[#202020] space-y-1"
                      >
                        <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900 dark:text-neutral-100">
                          <span className="text-base">{action.icon}</span>
                          <span>{action.title}</span>
                        </div>
                        <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-snug">
                          {action.detail}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SAFETY NETTING (WHEN TO SEEK URGENT HELP) */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#1f1f1f] border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                    <span>When to Seek Urgent Medical Help (Safety Netting):</span>
                  </h4>
                  <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc pl-5">
                    {activeTopic.safetyNetting.map((warning, wIdx) => (
                      <li key={wIdx}>{warning}</li>
                    ))}
                  </ul>
                </div>

                {/* VERIFIED NHS LEAFLET FOOTER */}
                <div className="pt-2 flex items-center justify-between text-xs text-neutral-500 border-t border-neutral-100 dark:border-neutral-800">
                  <div className="flex items-center gap-1.5">
                    <span>Verified UK Patient Leaflet:</span>
                    <a
                      href={activeTopic.pilUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                    >
                      <span>{activeTopic.pilTitle}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <span className="text-[11px] text-neutral-400">
                    Laksha&apos;s WorkSpace · Patient Explainer Engine
                  </span>
                </div>
              </div>
            </>
          ) : (
            /* TAB 2: ASK AI TO GENERATE BESPOKE PATIENT EXPLAINER */
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-white dark:bg-[#1a1a1a]">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100">
                    Generate Bespoke Patient Visual Explainer with AI
                  </h2>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  Type any pathology, medication question, or condition to generate a high-yield patient-facing lay analogy, home action plan, and SMS message.
                </p>
              </div>

              {/* QUICK PROMPT PRESET CHIPS */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                  Quick Clinical Presets:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_AI_PROMPTS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setAiPrompt(preset.prompt);
                        handleGenerateCustomExplainer(preset.prompt);
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-neutral-100 dark:bg-neutral-800 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-neutral-700 dark:text-neutral-300 hover:text-purple-700 dark:hover:text-purple-300 border border-neutral-200/70 dark:border-neutral-700 transition"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* INPUT FORM */}
              <div className="space-y-2">
                <textarea
                  rows={3}
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g. Explain why statins prevent heart attacks even when cholesterol is normal, or explain why we wait 48 hours for viral conjunctivitis..."
                  className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-[#202020] border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-neutral-400">
                    Powered by Claude Opus 5.5 clinical reasoning
                  </span>
                  <div className="flex items-center gap-2">
                    {isAiGenerating && (
                      <button
                        type="button"
                        onClick={() => abortControllerRef.current?.abort()}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800"
                      >
                        Stop Generating
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={isAiGenerating || !aiPrompt.trim()}
                      onClick={() => handleGenerateCustomExplainer()}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white transition disabled:opacity-50 shadow-sm"
                    >
                      {isAiGenerating ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Generating Explainer...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Generate Explainer</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {aiError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 text-xs text-rose-700 dark:text-rose-300">
                  {aiError}
                </div>
              )}

              {/* STREAMED OUTPUT STAGE */}
              {aiStreamedOutput && (
                <div
                  ref={aiOutputRef}
                  className="p-5 rounded-2xl bg-neutral-50/70 dark:bg-[#1f1f1f] border border-neutral-200 dark:border-neutral-800 space-y-4 max-h-[460px] overflow-y-auto"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-200/80 dark:border-neutral-800">
                    <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                      Generated Patient-Facing Visual Explainer
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(aiStreamedOutput);
                        }}
                        className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 text-neutral-700 dark:text-neutral-200"
                      >
                        Copy All
                      </button>
                      {onInsertIntoPage && (
                        <button
                          type="button"
                          onClick={() => {
                            onInsertIntoPage(aiStreamedOutput);
                          }}
                          className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-purple-600 text-white hover:bg-purple-700 shadow-2xs"
                        >
                          Insert to Consultation
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="prose prose-sm dark:prose-invert max-w-none text-xs leading-relaxed whitespace-pre-wrap">
                    {aiStreamedOutput}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
