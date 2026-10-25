'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  BookOpen,
  Search,
  X,
  Copy,
  Check,
  Plus,
  Loader2,
  ExternalLink,
  Stethoscope,
  Calculator,
  ShieldAlert,
  FileText,
  AlertTriangle,
  RotateCcw,
  Pill,
  Send,
  HelpCircle,
  BookmarkCheck,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { CLINICAL_CALCULATORS, ClinicalCalculator } from '@/lib/clinicalCalculators';
import { updateDocument, fetchDocumentById } from '@/lib/api/documents';

interface ClinicalEvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDocId?: string;
  currentDocTitle?: string;
  currentDocContext?: string;
  onInsertIntoPage?: (markdown: string) => void;
}

const QUICK_EVIDENCE_PROMPTS = [
  { label: 'Recurrent UTI (NICE)', query: 'Recurrent UTI in non-pregnant women: first-line management, prophylactic options, and NICE criteria for referral' },
  { label: 'FIT Test 2WW (NG12)', query: 'NICE NG12 criteria for quantitative FIT testing and 2-week wait referral in suspected lower GI cancer' },
  { label: 'Ramipril in CKD 3', query: 'Ramipril dosing, titration, eGFR drop thresholds, and monitoring frequency in CKD Stage 3' },
  { label: 'Otitis Externa (CKS)', query: 'Acute otitis externa: first-line topical treatment (Otomize vs Locorten-Vioform), ear wick criteria, and management of perforated TM' },
  { label: 'Acne Stepped Care', query: 'NICE NG198 stepped care pathway for mild, moderate, and severe acne vulgaris: topical combinations vs oral lymecycline' },
  { label: 'Subclinical Hypothyroidism', query: 'NICE CKS guidance on repeating TFTs, anti-TPO antibody testing, and indications for starting levothyroxine in subclinical hypothyroidism' },
  { label: 'BPPV vs Neuronitis', query: 'Differentiating BPPV from vestibular neuronitis: Dix-Hallpike interpretation, Epley manoeuvre, and role of prochlorperazine' },
  { label: 'Gout Flare & Allopurinol', query: 'Acute gout management (Colchicine vs NSAID), timing of starting allopurinol, target serum urate level, and prophylaxis' },
];

export function ClinicalEvidenceModal({
  isOpen,
  onClose,
  currentDocId,
  currentDocTitle,
  currentDocContext = '',
  onInsertIntoPage,
}: ClinicalEvidenceModalProps) {
  const [activeTab, setActiveTab] = useState<'evidence' | 'calculators' | 'pathways'>('evidence');
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamedEvidence, setStreamedEvidence] = useState('');
  const [copiedNote, setCopiedNote] = useState(false);
  const [insertedToDoc, setInsertedToDoc] = useState(false);
  const [savedToPearls, setSavedToPearls] = useState(false);
  const [selectedCalcId, setSelectedCalcId] = useState<string>('wells_dvt');
  const [selectedCriteria, setSelectedCriteria] = useState<Record<string, boolean>>({});

  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSearchEvidence = async (searchQuery = query) => {
    if (!searchQuery.trim() || isLoading) return;

    setIsLoading(true);
    setStreamedEvidence('');
    setCopiedNote(false);
    setInsertedToDoc(false);
    setSavedToPearls(false);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'clinical_evidence',
          prompt: searchQuery,
          context: currentDocContext ? `Current Document: ${currentDocTitle}\n${currentDocContext.substring(0, 1500)}` : '',
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch evidence (HTTP ${res.status})`);
      }

      if (!res.body) throw new Error('No streaming body returned');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;
        setStreamedEvidence(accumulated);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Evidence query error:', err);
        setStreamedEvidence(
          `> ⚠️ **Error retrieving clinical evidence:** ${err.message || 'Please check your connection and try again.'}`
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyConsultationSnippet = () => {
    if (!streamedEvidence) return;
    const codeMatch = streamedEvidence.match(/```text\n([\s\S]*?)\n```/);
    const textToCopy = codeMatch ? codeMatch[1].trim() : streamedEvidence;
    navigator.clipboard.writeText(textToCopy);
    setCopiedNote(true);
    setTimeout(() => setCopiedNote(false), 2000);
  };

  const handleCopyFullEvidence = () => {
    if (!streamedEvidence) return;
    navigator.clipboard.writeText(streamedEvidence);
    setCopiedNote(true);
    setTimeout(() => setCopiedNote(false), 2000);
  };

  const handleInsertToNote = () => {
    if (!streamedEvidence || !onInsertIntoPage) return;
    onInsertIntoPage(streamedEvidence);
    setInsertedToDoc(true);
    setTimeout(() => setInsertedToDoc(false), 2000);
  };

  const handleSaveToClinicalPearls = async () => {
    if (!streamedEvidence) return;
    try {
      const res = await fetch('/api/documents?include_archived=false');
      const docs = await res.json();
      const pearlsDoc = docs.find((d: any) =>
        d.title?.toLowerCase().includes('clinical pearls') || d.title?.toLowerCase().includes('clinical dump')
      );

      if (pearlsDoc) {
        const { document: fullPearlsDoc } = await fetchDocumentById(pearlsDoc.id);
        const summaryMatch = streamedEvidence.match(/### 🎯 Executive Clinical Recommendation\s+([^\n#]+)/);
        const pearlText = summaryMatch
          ? summaryMatch[1].trim()
          : streamedEvidence.split('\n').filter((l) => l.trim().length > 10)[0] || query;

        const newBlock = {
          id: typeof crypto !== 'undefined' ? crypto.randomUUID() : 'b-' + Date.now(),
          type: 'bulletListItem',
          props: { textColor: 'default', backgroundColor: 'default', textAlignment: 'left' },
          content: [
            { type: 'text', text: `${query}: `, styles: { bold: true } },
            { type: 'text', text: pearlText, styles: {} },
          ],
          children: [],
        };

        const existingBlocks = Array.isArray(fullPearlsDoc?.content) ? fullPearlsDoc.content : [];
        await updateDocument(pearlsDoc.id, {
          content: [...existingBlocks, newBlock],
          updated_at: new Date().toISOString(),
        });

        setSavedToPearls(true);
        setTimeout(() => setSavedToPearls(false), 2500);
      }
    } catch (err) {
      console.error('Save to pearls error:', err);
    }
  };

  // Calculator Logic
  const currentCalc = CLINICAL_CALCULATORS.find((c) => c.id === selectedCalcId) || CLINICAL_CALCULATORS[0];
  const toggleCriterion = (id: string) => {
    setSelectedCriteria((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const calcScore = currentCalc.criteria.reduce((total, item) => {
    return selectedCriteria[item.id] ? total + item.points : total;
  }, 0);

  const selectedIds = Object.keys(selectedCriteria).filter((k) => selectedCriteria[k]);
  const calcResult = currentCalc.interpret(calcScore, selectedIds);

  const handleInsertCalculatorToPage = () => {
    if (!onInsertIntoPage) return;
    const checkedItems = currentCalc.criteria.filter((c) => selectedCriteria[c.id]);
    const summary = `### 🧮 ${currentCalc.name}
- **Calculated Score:** ${calcScore} points (${calcResult.risk})
- **Clinical Action:** ${calcResult.action}
- **Criteria Present:** ${
      checkedItems.length > 0 ? checkedItems.map((c) => `${c.label} (+${c.points})`).join('; ') : 'None'
    }
- **Management Protocol:**
${calcResult.details.map((d) => `  - ${d}`).join('\n')}
- **Guideline Citation:** [${calcResult.evidenceCite}](${currentCalc.guidelineUrl})`;

    onInsertIntoPage(summary);
    setInsertedToDoc(true);
    setTimeout(() => setInsertedToDoc(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl h-[90vh] max-h-[820px] bg-white dark:bg-[#1c1c1c] rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col overflow-hidden text-neutral-900 dark:text-neutral-100">
        {/* Top Header */}
        <div className="px-5 py-3.5 border-b border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/70 dark:bg-neutral-900/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-600/20">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  Heidi Evidence
                </h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/50 dark:border-purple-800/50">
                  NICE CKS &bull; BNF &bull; BMJ
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Grounded clinical decision support & validated primary care calculators
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab switchers */}
            <div className="flex items-center bg-neutral-200/60 dark:bg-neutral-800 p-0.5 rounded-lg text-xs">
              <button
                onClick={() => setActiveTab('evidence')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition font-medium ${
                  activeTab === 'evidence'
                    ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
              >
                <Search className="w-3.5 h-3.5 text-purple-500" />
                <span>Ask Evidence</span>
              </button>

              <button
                onClick={() => setActiveTab('calculators')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition font-medium ${
                  activeTab === 'calculators'
                    ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
              >
                <Calculator className="w-3.5 h-3.5 text-emerald-500" />
                <span>Calculators</span>
              </button>

              <button
                onClick={() => setActiveTab('pathways')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition font-medium hidden sm:flex ${
                  activeTab === 'pathways'
                    ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>Quick Pathways</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'evidence' && (
            <div className="p-5 space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <div className="flex items-center gap-2 p-1.5 bg-neutral-100 dark:bg-neutral-800/80 rounded-xl border border-neutral-200 dark:border-neutral-700 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/20 transition">
                  <div className="pl-2 text-purple-600 dark:text-purple-400">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSearchEvidence();
                      }
                    }}
                    placeholder="Search clinical query (e.g. first-line recurrent UTI, ramipril in CKD, Centor criteria)..."
                    className="flex-1 bg-transparent text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none placeholder:text-neutral-400 py-1"
                  />
                  {isLoading ? (
                    <button
                      type="button"
                      onClick={() => {
                        abortControllerRef.current?.abort();
                        setIsLoading(false);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-neutral-400 text-white hover:bg-neutral-500 text-xs font-medium transition"
                    >
                      Stop
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSearchEvidence()}
                      disabled={!query.trim()}
                      className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
                    >
                      <span>Search Evidence</span>
                      <Send className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Quick Prompt Pills */}
              <div>
                <div className="flex items-center gap-1.5 mb-2 text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                  <Sparkles className="w-3 h-3 text-purple-500" />
                  <span>High-Yield Clinical Lookups</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_EVIDENCE_PROMPTS.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setQuery(p.query);
                        handleSearchEvidence(p.query);
                      }}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-purple-600 dark:hover:text-purple-300 border border-neutral-200/60 dark:border-neutral-700/60 transition text-left"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Streaming Output / Results */}
              {streamedEvidence ? (
                <div className="space-y-4 pt-2 animate-in fade-in duration-150">
                  {/* Action Toolbar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-neutral-50 dark:bg-neutral-900/60 rounded-xl border border-neutral-200/70 dark:border-neutral-800">
                    <div className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                        Evidence Grounded:
                      </span>
                      <span>NICE CKS, BNF 2024 & BMJ Best Practice</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={handleCopyConsultationSnippet}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition"
                        title="Copy consultation snippet for EMIS / SystmOne"
                      >
                        {copiedNote ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-neutral-400" />}
                        <span>{copiedNote ? 'Copied Note!' : 'Copy for EHR'}</span>
                      </button>

                      {onInsertIntoPage && (
                        <button
                          onClick={handleInsertToNote}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-purple-600 text-white text-xs font-medium hover:bg-purple-700 transition shadow-xs"
                          title="Append evidence directly into active document"
                        >
                          {insertedToDoc ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                          <span>{insertedToDoc ? 'Inserted!' : 'Insert to Note'}</span>
                        </button>
                      )}

                      <button
                        onClick={handleSaveToClinicalPearls}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800 text-xs font-medium hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition"
                        title="Save as bullet item in Clinical Pearls"
                      >
                        {savedToPearls ? <Check className="w-3.5 h-3.5" /> : <BookmarkCheck className="w-3.5 h-3.5" />}
                        <span>{savedToPearls ? 'Saved to Pearls!' : 'Save to Pearls'}</span>
                      </button>

                      <button
                        onClick={handleCopyFullEvidence}
                        className="p-1 rounded-md text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-200/60 dark:hover:bg-neutral-700 transition"
                        title="Copy full evidence text"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Rendered Evidence Document */}
                  <div className="p-5 bg-neutral-50/50 dark:bg-neutral-900/30 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 text-xs leading-relaxed space-y-3 prose dark:prose-invert max-w-none">
                    <div
                      className="whitespace-pre-wrap font-sans text-neutral-800 dark:text-neutral-200 select-text"
                      dangerouslySetInnerHTML={{
                        __html: formatEvidenceHtml(streamedEvidence),
                      }}
                    />
                  </div>
                </div>
              ) : isLoading ? (
                <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
                  <Loader2 className="w-7 h-7 text-purple-600 animate-spin" />
                  <div>
                    <h3 className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                      Querying NICE Guidelines, BNF & Clinical Evidence...
                    </h3>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      Extracting first-line dosing, red flags, and verifiable primary care citations
                    </p>
                  </div>
                </div>
              ) : (
                <div className="py-14 text-center space-y-2 text-neutral-400 dark:text-neutral-500">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 mx-auto flex items-center justify-center mb-1">
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <h3 className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Evidence Decision Support Ready
                  </h3>
                  <p className="text-[11px] max-w-md mx-auto">
                    Type a drug, condition, or management query above, or click one of the high-yield topics to fetch grounded NICE & BNF pathways.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Clinical Calculators */}
          {activeTab === 'calculators' && (
            <div className="p-5 space-y-5">
              {/* Calculator Selector Tabs */}
              <div className="flex flex-wrap gap-1.5 pb-2 border-b border-neutral-200/70 dark:border-neutral-800">
                {CLINICAL_CALCULATORS.map((calc) => (
                  <button
                    key={calc.id}
                    onClick={() => {
                      setSelectedCalcId(calc.id);
                      setSelectedCriteria({});
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      selectedCalcId === calc.id
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-neutral-700'
                    }`}
                  >
                    {calc.name}
                  </button>
                ))}
              </div>

              {/* Calculator Header & Citation */}
              <div className="flex items-start justify-between gap-3 bg-neutral-50 dark:bg-neutral-900/40 p-3.5 rounded-xl border border-neutral-200/80 dark:border-neutral-800">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                    {currentCalc.name}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">{currentCalc.description}</p>
                </div>
                <a
                  href={currentCalc.guidelineUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-[11px] text-purple-600 dark:text-purple-400 hover:underline font-medium flex-shrink-0"
                >
                  <span>{currentCalc.guideline}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Criteria Checkboxes */}
              <div className="space-y-2">
                <div className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                  Check all applicable criteria:
                </div>
                <div className="space-y-1.5">
                  {currentCalc.criteria.map((item) => {
                    const isChecked = !!selectedCriteria[item.id];
                    return (
                      <label
                        key={item.id}
                        onClick={() => toggleCriterion(item.id)}
                        className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer select-none transition ${
                          isChecked
                            ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-300 dark:border-purple-800 text-purple-900 dark:text-purple-100 font-medium'
                            : 'bg-white dark:bg-neutral-800/60 border-neutral-200/80 dark:border-neutral-700/80 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                          />
                          <span>{item.label}</span>
                        </div>
                        <span
                          className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
                            item.points < 0
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                              : 'bg-neutral-200/80 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
                          }`}
                        >
                          {item.points > 0 ? `+${item.points}` : item.points}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Result Summary Card */}
              <div className={`p-4 rounded-xl border ${calcResult.color} space-y-2.5`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider">Total Score:</span>
                    <span className="text-xl font-extrabold">{calcScore} points</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/80 dark:bg-black/40 shadow-xs">
                      {calcResult.risk}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setSelectedCriteria({})}
                      className="px-2 py-1 rounded text-[11px] bg-white/70 dark:bg-black/30 hover:bg-white dark:hover:bg-black/50 transition font-medium"
                    >
                      Reset
                    </button>
                    {onInsertIntoPage && (
                      <button
                        onClick={handleInsertCalculatorToPage}
                        className="flex items-center gap-1 px-2.5 py-1 rounded bg-purple-600 text-white text-[11px] font-semibold hover:bg-purple-700 transition shadow-xs"
                      >
                        {insertedToDoc ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                        <span>{insertedToDoc ? 'Inserted!' : 'Insert to Note'}</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="text-xs font-bold leading-snug">{calcResult.action}</div>

                <ul className="text-xs space-y-1 list-disc pl-4 opacity-90">
                  {calcResult.details.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>

                <div className="pt-1 text-[10px] opacity-75 font-medium flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" />
                  <span>Grounding: {calcResult.evidenceCite}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Quick Pathways */}
          {activeTab === 'pathways' && (
            <div className="p-5 space-y-4">
              <div className="text-xs text-neutral-500">
                Direct evidence pathways for high-volume General Practice consultations:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    title: '🩸 Unexplained Iron Deficiency Anaemia',
                    cite: 'NICE NG12 & BSG 2021',
                    text: 'Urgent 2WW OGD & colonoscopy if men or postmenopausal women with Hb < 110 (men) or < 100 (women). FIT test required in primary care.',
                    query: 'Investigation and referral pathways for iron deficiency anaemia in primary care NICE',
                  },
                  {
                    title: '🫁 Chronic Cough (> 8 Weeks)',
                    cite: 'NICE CKS & BTS',
                    text: 'Check CXR first. Triad of causes: Asthma/CVA, GORD, and Rhinitis (Upper Airway Cough Syndrome). ACE-inhibitor review.',
                    query: 'Chronic persistent cough management in adults NICE BTS',
                  },
                  {
                    title: '🩺 Hypertension Stage 1 vs Stage 2',
                    cite: 'NICE NG136 (2019/2023)',
                    text: 'Stage 1 (ABPM ≥ 135/85): Treat if < 60 with end-organ damage, CVD, renal disease, or QRISK3 ≥ 10%. Step 1: A (< 55/non-black) or C (≥ 55 or black African/African-Caribbean).',
                    query: 'Hypertension stepped care pathway NICE NG136',
                  },
                  {
                    title: '🚺 Menopause & HRT Safety',
                    cite: 'NICE NG23 & BMS 2024',
                    text: 'Transdermal estradiol preferred if BMI > 30, migraine with aura, or VTE risk. Micronised progesterone (Utrogestan) is first-line progestogen.',
                    query: 'HRT prescribing pathways, contraindications, and transdermal vs oral NICE BMS',
                  },
                  {
                    title: '👶 Febrile Child Traffic Light',
                    cite: 'NICE NG143',
                    text: 'Amber (unresponsive, tachypnoea, CRT ≥ 3s) vs Red (non-blanching rash, grunting, bulging fontanelle, age < 3 months with T ≥ 38°C).',
                    query: 'NICE traffic light system for fever in under 5s management and referral thresholds',
                  },
                  {
                    title: '🚽 LUTS & Raised PSA',
                    cite: 'NICE NG131',
                    text: 'Age-specific PSA thresholds: 40-49 (≥ 2.5), 50-59 (≥ 3.0), 60-69 (≥ 4.0), 70-79 (≥ 5.0). Repeat PSA in 4-6w if borderline or post-UTI.',
                    query: 'Raised PSA investigation and 2WW referral thresholds NICE NG131',
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setActiveTab('evidence');
                      setQuery(item.query);
                      handleSearchEvidence(item.query);
                    }}
                    className="p-3.5 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 hover:border-purple-300 dark:hover:border-purple-700/80 hover:bg-purple-50/30 dark:hover:bg-purple-950/20 transition cursor-pointer space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                        {item.title}
                      </h4>
                      <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                    </div>
                    <span className="inline-block text-[10px] font-semibold text-purple-600 dark:text-purple-400">
                      {item.cite}
                    </span>
                    <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-snug">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 border-t border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/50 flex items-center justify-between text-[11px] text-neutral-500">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            <span>Laksha&apos;s WorkSpace Clinical Evidence &bull; Heidi Decision Support Engine</span>
          </div>

          <div className="flex items-center gap-3">
            <span>Press <kbd className="px-1 py-0.5 rounded bg-neutral-200 dark:bg-neutral-700 font-mono text-[10px]">Cmd+E</kbd> anywhere</span>
            <button
              onClick={onClose}
              className="px-2.5 py-1 rounded-md bg-neutral-200/80 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-700 font-medium transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Convert markdown to clean sanitized HTML with clickable badges
function formatEvidenceHtml(rawMarkdown: string): string {
  if (!rawMarkdown) return '';

  let html = rawMarkdown
    // Escape HTML tags
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Format code blocks (consultation note snippet)
  html = html.replace(
    /```text\n([\s\S]*?)\n```/g,
    '<div class="my-2.5 p-3 rounded-xl bg-purple-50/60 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800/80 font-mono text-[11px] text-purple-900 dark:text-purple-200 select-all">$1</div>'
  );

  // Format Headings
  html = html.replace(/^### (.*$)/gim, '<h3 class="text-xs font-bold text-purple-700 dark:text-purple-300 mt-3.5 mb-1.5 flex items-center gap-1.5">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 class="text-sm font-bold text-neutral-900 dark:text-neutral-100 mt-4 mb-2">$1</h2>');

  // Format bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-neutral-900 dark:text-neutral-100">$1</strong>');

  // Format clickable markdown links [Label](url) as citation badges
  html = html.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g,
    '<a href="$2" target="_blank" rel="noreferrer" class="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md bg-purple-100/80 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 font-semibold hover:underline text-[11px] transition cursor-pointer">$1 ↗</a>'
  );

  // Format bullet items
  html = html.replace(/^\- (.*$)/gim, '<div class="flex items-start gap-2 my-1"><span class="text-purple-500 font-bold">&bull;</span><span>$1</span></div>');

  return html;
}
