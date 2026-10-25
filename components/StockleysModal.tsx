'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Pill,
  X,
  Plus,
  Copy,
  Check,
  Search,
  Loader2,
  Sparkles,
  BookmarkCheck,
  ExternalLink,
  ChevronRight,
  RotateCcw,
  Info,
  CheckCircle2,
  AlertOctagon,
} from 'lucide-react';
import {
  checkStockleysInteractions,
  StockleyInteraction,
  InteractionSeverity,
  UK_BRAND_TO_GENERIC,
} from '@/lib/stockleysInteractions';
import { updateDocument, fetchDocumentById } from '@/lib/api/documents';

interface StockleysModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDocId?: string;
  currentDocTitle?: string;
  currentDocContext?: string;
  onInsertIntoPage?: (markdown: string) => void;
}

const PRESET_COMBOS = [
  { label: 'Statin + Macrolide', drugs: ['Simvastatin', 'Clarithromycin'] },
  { label: 'Triple Whammy AKI', drugs: ['Ramipril', 'Indapamide', 'Naproxen'] },
  { label: 'Methotrexate + Trimethoprim', drugs: ['Methotrexate', 'Trimethoprim'] },
  { label: 'DOAC + NSAID', drugs: ['Apixaban', 'Ibuprofen'] },
  { label: 'SSRI + Tramadol', drugs: ['Citalopram', 'Tramadol'] },
  { label: 'Citalopram + Omeprazole', drugs: ['Citalopram', 'Omeprazole'] },
  { label: 'Levothyroxine + Iron', drugs: ['Levothyroxine', 'Ferrous Fumarate'] },
  { label: 'Allopurinol + Azathioprine', drugs: ['Allopurinol', 'Azathioprine'] },
  { label: 'PDE5i + Nitrate', drugs: ['Sildenafil', 'GTN Spray'] },
  { label: 'Lithium + NSAID', drugs: ['Lithium', 'Naproxen'] },
];

export function StockleysModal({
  isOpen,
  onClose,
  currentDocId,
  currentDocTitle,
  currentDocContext = '',
  onInsertIntoPage,
}: StockleysModalProps) {
  const [drugs, setDrugs] = useState<string[]>(['Simvastatin', 'Clarithromycin']);
  const [drugInput, setDrugInput] = useState('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [streamedAIReport, setStreamedAIReport] = useState('');
  const [copiedNote, setCopiedNote] = useState(false);
  const [insertedToDoc, setInsertedToDoc] = useState(false);
  const [savedToPearls, setSavedToPearls] = useState(false);
  const [activeTab, setActiveTab] = useState<'instant' | 'ai_deep'>('instant');

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

  // Evaluate pre-compiled Stockley's database instantaneously
  const localMatches = useMemo(() => {
    if (drugs.length < 2) return [];
    return checkStockleysInteractions(drugs);
  }, [drugs]);

  if (!isOpen) return null;

  const handleAddDrug = () => {
    const trimmed = drugInput.trim();
    if (!trimmed) return;
    if (!drugs.some((d) => d.toLowerCase() === trimmed.toLowerCase())) {
      setDrugs((prev) => [...prev, trimmed]);
    }
    setDrugInput('');
    setStreamedAIReport('');
  };

  const handleRemoveDrug = (index: number) => {
    setDrugs((prev) => prev.filter((_, i) => i !== index));
    setStreamedAIReport('');
  };

  const handleSelectPreset = (presetDrugs: string[]) => {
    setDrugs(presetDrugs);
    setStreamedAIReport('');
    setActiveTab('instant');
  };

  const handleClearAll = () => {
    setDrugs([]);
    setStreamedAIReport('');
    setActiveTab('instant');
  };

  const handleRunDeepAICheck = async () => {
    if (drugs.length < 2 || isLoadingAI) return;

    setIsLoadingAI(true);
    setStreamedAIReport('');
    setActiveTab('ai_deep');
    setCopiedNote(false);
    setInsertedToDoc(false);
    setSavedToPearls(false);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'stockleys_checker',
          prompt: `Stockley's Drug Interactions Check for: ${drugs.join(', ')}`,
          context: currentDocContext ? currentDocContext.substring(0, 1500) : '',
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`AI Check failed: ${response.statusText}`);
      }

      if (response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          accumulated += chunk;
          setStreamedAIReport(accumulated);
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Deep AI check error:', err);
        setStreamedAIReport(
          `### ⚠️ Interaction Analysis Error\nCould not complete real-time AI Stockley's check: ${err.message || 'Network error'}. Please refer to the local high-yield database above or the British National Formulary.`
        );
      }
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleCopySnippet = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedNote(true);
    setTimeout(() => setCopiedNote(false), 2000);
  };

  const handleInsertLocalToNote = (interaction: StockleyInteraction) => {
    if (!onInsertIntoPage) return;
    const md = `### ⚠️ Stockley's Drug Interaction: ${interaction.title}
- **Severity Rating:** ${interaction.hazardIcon} ${interaction.severityLabel}
- **Clinical Summary:** ${interaction.summary}
- **Stockley's Primary Care Action:** ${interaction.clinicalAction}
- **Pharmacological Mechanism (${interaction.mechanism.type.toUpperCase()}):** ${interaction.mechanism.details} (Pathways: ${interaction.mechanism.pathways.join(', ')})
- **Monitoring Protocol:** ${interaction.monitoring}
- **Safer BNF Alternatives:**
${interaction.alternatives.map((a) => `  - ${a}`).join('\n')}

#### 📋 Consultation Note (EMIS / SystmOne):
\`\`\`text
${interaction.emisSnippet}
\`\`\`
*Source: Stockley's Drug Interactions (MedicinesComplete) & BNF*`;

    onInsertIntoPage(md);
    setInsertedToDoc(true);
    setTimeout(() => setInsertedToDoc(false), 2000);
  };

  const handleInsertAIToNote = () => {
    if (!streamedAIReport || !onInsertIntoPage) return;
    onInsertIntoPage(streamedAIReport);
    setInsertedToDoc(true);
    setTimeout(() => setInsertedToDoc(false), 2000);
  };

  const handleSaveToClinicalPearls = async (interaction?: StockleyInteraction) => {
    try {
      const res = await fetch('/api/documents?include_archived=false');
      const docs = await res.json();
      const pearlsDoc = docs.find((d: any) =>
        d.title?.toLowerCase().includes('clinical pearls') || d.title?.toLowerCase().includes('clinical dump')
      );

      if (pearlsDoc) {
        let pearlHeadline = '';
        let pearlBody = '';

        if (interaction) {
          pearlHeadline = `Stockley's: ${interaction.title} (${interaction.hazardIcon} ${interaction.severity.toUpperCase()})`;
          pearlBody = `${interaction.clinicalAction} Mechanism: ${interaction.mechanism.details}`;
        } else if (streamedAIReport) {
          pearlHeadline = `Stockley's Check: ${drugs.join(' + ')}`;
          const summaryMatch = streamedAIReport.match(/### ⚠️ Stockley's Hazard Assessment & Severity\s+([^\n#]+)/);
          pearlBody = summaryMatch ? summaryMatch[1].trim() : streamedAIReport.substring(0, 180);
        }

        const newBlock = {
          id: typeof crypto !== 'undefined' ? crypto.randomUUID() : 'b-' + Date.now(),
          type: 'bulletListItem',
          props: { textColor: 'default', backgroundColor: 'default', textAlignment: 'left' },
          content: [
            { type: 'text', text: `${pearlHeadline}: `, styles: { bold: true } },
            { type: 'text', text: pearlBody, styles: {} },
          ],
          children: [],
        };

        const { document: fullPearlsDoc } = await fetchDocumentById(pearlsDoc.id);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl h-[90vh] max-h-[840px] bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col overflow-hidden text-neutral-900 dark:text-neutral-100">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/80 dark:bg-neutral-900/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  Stockley’s Drug Interactions Checker
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60">
                  MedicinesComplete · BNF Standard
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                UK Primary Care Severity Hazard Grading · CYP450 PK/PD Mechanisms · Safer BNF Alternatives
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Drug Input & Pills Bar */}
        <div className="p-4 border-b border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-[#1f1f1f] space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
              <input
                ref={inputRef}
                type="text"
                value={drugInput}
                onChange={(e) => setDrugInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddDrug();
                  }
                }}
                placeholder="Type drug or UK brand name (e.g. Ramipril, Simvastatin, Clarithromycin, Lipitor) and press Enter..."
                className="w-full pl-9 pr-20 py-2 rounded-xl text-xs bg-neutral-100/80 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 transition"
              />
              <button
                type="button"
                onClick={handleAddDrug}
                disabled={!drugInput.trim()}
                className="absolute right-1.5 top-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white transition shadow-xs flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Add</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRunDeepAICheck}
                disabled={drugs.length < 2 || isLoadingAI}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white transition shadow-sm"
                title="Deep polypharmacy analysis with Google Gemini"
              >
                {isLoadingAI ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                )}
                <span>Deep Stockley’s AI Check</span>
              </button>

              {drugs.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="p-2 rounded-xl text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                  title="Clear all entered drugs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Active Drug Pills */}
          <div className="flex flex-wrap items-center gap-1.5 min-h-[30px]">
            <span className="text-[11px] font-medium text-neutral-400 mr-1">Regimen ({drugs.length}):</span>
            {drugs.length === 0 ? (
              <span className="text-xs text-neutral-400 italic">No medications entered. Add 2+ drugs or pick a preset below.</span>
            ) : (
              drugs.map((drug, idx) => (
                <span
                  key={`${drug}-${idx}`}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800/80 animate-in fade-in"
                >
                  <Pill className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  <span>{drug}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveDrug(idx)}
                    className="p-0.5 hover:bg-amber-200/60 dark:hover:bg-amber-800 rounded text-amber-700 dark:text-amber-300"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))
            )}
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
            <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider flex-shrink-0">
              High Hazard Pairs:
            </span>
            {PRESET_COMBOS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => handleSelectPreset(p.drugs)}
                className="flex-shrink-0 px-2 py-0.5 rounded-md text-[11px] font-medium bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Toggle if AI report exists */}
        {streamedAIReport && (
          <div className="px-5 py-1.5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 flex items-center gap-4 text-xs">
            <button
              onClick={() => setActiveTab('instant')}
              className={`py-1 font-semibold transition border-b-2 ${
                activeTab === 'instant'
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                  : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              Instant Pre-Compiled Database ({localMatches.length})
            </button>
            <button
              onClick={() => setActiveTab('ai_deep')}
              className={`py-1 font-semibold transition border-b-2 flex items-center gap-1.5 ${
                activeTab === 'ai_deep'
                  ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              <Sparkles className="w-3 h-3 text-purple-500" />
              <span>Deep Stockley’s AI Report</span>
            </button>
          </div>
        )}

        {/* Body / Results Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {drugs.length < 2 ? (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center text-neutral-400 space-y-3">
              <ShieldAlert className="w-12 h-12 text-amber-400/60" />
              <div className="max-w-md">
                <h3 className="text-sm font-bold text-neutral-700 dark:text-neutral-300">
                  Add Two or More Medications to Begin
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  Enter generic or UK brand names above or select from the high-hazard combinations to perform an instant Stockley’s interaction screening.
                </p>
              </div>
            </div>
          ) : activeTab === 'instant' ? (
            localMatches.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                      Identified Clinical Interactions ({localMatches.length})
                    </span>
                  </div>
                  <span className="text-[11px] text-neutral-400">
                    Source: MedicinesComplete · Stockley’s Drug Interactions
                  </span>
                </div>

                {localMatches.map((interaction) => {
                  const isContra = interaction.severity === 'contraindicated';
                  const isSev = interaction.severity === 'severe';
                  const isMod = interaction.severity === 'moderate';

                  const badgeBg = isContra
                    ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                    : isSev
                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                    : 'bg-yellow-50 text-yellow-800 dark:bg-yellow-950/60 dark:text-yellow-300 border-yellow-300 dark:border-yellow-800';

                  return (
                    <div
                      key={interaction.id}
                      className="rounded-2xl border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-[#1e1e1e] shadow-sm overflow-hidden"
                    >
                      {/* Interaction Card Header */}
                      <div className="p-4 border-b border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-start sm:items-center gap-2.5">
                          <span className="text-xl flex-shrink-0">{interaction.hazardIcon}</span>
                          <div>
                            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                              {interaction.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 mt-0.5">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeBg}`}>
                                {interaction.severityLabel}
                              </span>
                              <span className="text-[10px] text-neutral-400">
                                Mechanism: {interaction.mechanism.type.toUpperCase()} ({interaction.mechanism.pathways.join(', ')})
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Card Action Buttons */}
                        <div className="flex items-center gap-1.5 self-end sm:self-auto flex-shrink-0">
                          {onInsertIntoPage && (
                            <button
                              type="button"
                              onClick={() => handleInsertLocalToNote(interaction)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white transition shadow-xs"
                              title="Insert interaction report into current document"
                            >
                              {insertedToDoc ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                              <span>Insert</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleSaveToClinicalPearls(interaction)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition"
                            title="Save as permanent Clinical Pearl"
                          >
                            {savedToPearls ? <Check className="w-3.5 h-3.5" /> : <BookmarkCheck className="w-3.5 h-3.5" />}
                            <span>Pearl</span>
                          </button>
                        </div>
                      </div>

                      {/* Interaction Card Body */}
                      <div className="p-4 space-y-3.5 text-xs">
                        {/* Summary Alert */}
                        <div className="p-3 rounded-xl bg-neutral-100/70 dark:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300 leading-relaxed border border-neutral-200/50 dark:border-neutral-700/50">
                          <span className="font-bold text-neutral-900 dark:text-neutral-100">Clinical Summary: </span>
                          {interaction.summary}
                        </div>

                        {/* Primary Care Action */}
                        <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/80 text-amber-950 dark:text-amber-200 space-y-1">
                          <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-300">
                            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                            <span>Stockley’s Action & GP Prescribing Recommendation:</span>
                          </div>
                          <p className="leading-relaxed pl-5">{interaction.clinicalAction}</p>
                        </div>

                        {/* Mechanism & Monitoring */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200/60 dark:border-neutral-800 space-y-1">
                            <span className="font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1">
                              <Info className="w-3.5 h-3.5 text-neutral-400" />
                              Pharmacological Mechanism:
                            </span>
                            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                              {interaction.mechanism.details}
                            </p>
                          </div>

                          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200/60 dark:border-neutral-800 space-y-1">
                            <span className="font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                              Monitoring Protocol & Safety Net:
                            </span>
                            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                              {interaction.monitoring}
                            </p>
                          </div>
                        </div>

                        {/* Safer BNF Alternatives */}
                        <div className="space-y-1.5">
                          <span className="font-bold text-neutral-800 dark:text-neutral-200">
                            🔄 Safer BNF Alternatives:
                          </span>
                          <ul className="space-y-1">
                            {interaction.alternatives.map((alt, idx) => (
                              <li key={idx} className="flex items-start gap-1.5 text-neutral-600 dark:text-neutral-400">
                                <ChevronRight className="w-3 h-3 text-neutral-400 flex-shrink-0 mt-0.5" />
                                <span>{alt}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Consultation Note Snippet */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-neutral-800 dark:text-neutral-200">
                              📋 EMIS Web / SystmOne Consultation Snippet:
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopySnippet(interaction.emisSnippet)}
                              className="flex items-center gap-1 text-[11px] text-purple-600 dark:text-purple-400 hover:underline font-medium"
                            >
                              {copiedNote ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedNote ? 'Copied to Clipboard!' : 'Copy Snippet'}</span>
                            </button>
                          </div>
                          <div className="p-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 font-mono text-[11px] text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 select-all">
                            {interaction.emisSnippet}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/80 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
                <div className="max-w-md mx-auto">
                  <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-200">
                    No High-Hazard Contraindications in Pre-Compiled Database
                  </h3>
                  <p className="text-xs text-emerald-800 dark:text-emerald-300/80 mt-1 leading-relaxed">
                    The entered regimen ({drugs.join(', ')}) did not trigger an instant match for common primary care contraindications.
                  </p>
                  <div className="pt-3">
                    <button
                      type="button"
                      onClick={handleRunDeepAICheck}
                      disabled={isLoadingAI}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white transition shadow-sm"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Run Deep Stockley’s AI Analysis (MedicinesComplete)</span>
                    </button>
                  </div>
                </div>
              </div>
            )
          ) : (
            /* AI Deep Check View */
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                    Stockley’s Deep AI Evaluation: {drugs.join(' + ')}
                  </span>
                </div>
                {streamedAIReport && (
                  <div className="flex items-center gap-2">
                    {onInsertIntoPage && (
                      <button
                        type="button"
                        onClick={handleInsertAIToNote}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white transition shadow-xs"
                      >
                        {insertedToDoc ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                        <span>Insert to Note</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleSaveToClinicalPearls()}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition"
                    >
                      {savedToPearls ? <Check className="w-3.5 h-3.5" /> : <BookmarkCheck className="w-3.5 h-3.5" />}
                      <span>Save to Pearls</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopySnippet(streamedAIReport)}
                      className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                      title="Copy full AI report"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {isLoadingAI && !streamedAIReport ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-3">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                  <span className="text-xs font-medium text-neutral-500">
                    Evaluating pharmacological mechanisms, CYP450 pathways, and BNF guidelines...
                  </span>
                </div>
              ) : (
                <div className="p-4 bg-neutral-50/60 dark:bg-neutral-900/40 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 text-xs leading-relaxed space-y-3 whitespace-pre-wrap font-sans text-neutral-800 dark:text-neutral-200">
                  {streamedAIReport}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/50 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
            <span>Standard: MedicinesComplete / Pharmaceutical Press / BNF</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition font-medium"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
