'use client';

import React, { useState, useMemo } from 'react';
import {
  FlaskConical,
  X,
  Copy,
  Check,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  ArrowRight,
  Info,
  ChevronRight,
  RotateCcw,
  Send,
  FileText,
  Activity,
  HeartPulse,
  Droplet,
  ShieldAlert,
  Loader2,
} from 'lucide-react';
import {
  analyzeLfts,
  LftInputs,
  analyzeHaematinics,
  HaematinicsInputs,
  analyzeCkd,
  CkdInputs,
  analyzeTft,
  TftInputs,
  analyzeIncidentalFindings,
  IncidentalFindingsInputs,
} from '@/lib/pathologyEngine';

interface PathologyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDocId?: string;
  currentDocTitle?: string;
  currentDocContext?: string;
  onInsertIntoPage?: (markdown: string) => void;
  onOpenAccurxWithText?: (text: string) => void;
}

type PathologyTab = 'lfts' | 'haematinics' | 'ckd' | 'tft' | 'incidental' | 'ai_queue';

export function PathologyModal({
  isOpen,
  onClose,
  currentDocId,
  currentDocTitle,
  currentDocContext,
  onInsertIntoPage,
  onOpenAccurxWithText,
}: PathologyModalProps) {
  const [activeTab, setActiveTab] = useState<PathologyTab>('lfts');
  const [copiedFiling, setCopiedFiling] = useState(false);
  const [insertedToDoc, setInsertedToDoc] = useState(false);

  // 1. LFTs State
  const [lftInputs, setLftInputs] = useState<LftInputs>({
    alt: 72,
    ast: 48,
    alp: 85,
    ggt: 64,
    bilirubin: 14,
    albumin: 44,
    platelets: 230,
    age: 52,
    alcoholUnitsPerWeek: 12,
    bmi: 29.4,
    hasRecentAntibiotics: false,
  });

  // 2. Haematinics State
  const [haematinicsInputs, setHaematinicsInputs] = useState<HaematinicsInputs>({
    hb: 104,
    mcv: 74,
    ferritin: 14,
    tfs: 11,
    rbc: 4.2,
    age: 68,
    sex: 'male',
    isPostMenopausal: true,
    hasRedFlagGiSymptoms: false,
  });

  // 3. CKD State
  const [ckdInputs, setCkdInputs] = useState<CkdInputs>({
    egfrCurrent: 52,
    egfrPrevious: 56,
    acr: 12.4,
    hasDiabetes: true,
    hasHeartFailure: false,
    hasHaematuria: false,
    currentSystolicBp: 136,
    currentDiastolicBp: 82,
  });

  // 4. TFT State
  const [tftInputs, setTftInputs] = useState<TftInputs>({
    tsh: 6.8,
    freeT4: 14.2,
    freeT3: 4.5,
    tpoAntibodiesPositive: true,
    isPregnantOrPlanning: false,
    isSymptomatic: false,
    age: 56,
    isHospitalDischargeOrAcuteIllness: false,
  });

  // 5. Incidental Findings State
  const [incidentalInputs, setIncidentalInputs] = useState<IncidentalFindingsInputs>({
    findingType: 'eosinophilia',
    eosinophilCount: 0.9,
    paraproteinLevel: 7,
    paraproteinType: 'IgG',
    freeLightChainRatio: 1.1,
    hasCrabSymptoms: false,
    neutrophilCount: 1.4,
    ethnicity: 'african_caribbean_middle_east',
    isTakingCarbimazoleOrMethotrexate: false,
    hasRecentViralIllness: false,
  });

  // 6. AI Free-Text Lab Queue State
  const [rawLabText, setRawLabText] = useState('');
  const [aiAnalysisResult, setAiAnalysisResult] = useState<string | null>(null);
  const [aiFilingNote, setAiFilingNote] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Computations
  const lftResult = useMemo(() => analyzeLfts(lftInputs), [lftInputs]);
  const haematinicsResult = useMemo(() => analyzeHaematinics(haematinicsInputs), [haematinicsInputs]);
  const ckdResult = useMemo(() => analyzeCkd(ckdInputs), [ckdInputs]);
  const tftResult = useMemo(() => analyzeTft(tftInputs), [tftInputs]);
  const incidentalResult = useMemo(
    () => analyzeIncidentalFindings(incidentalInputs),
    [incidentalInputs]
  );

  // Active Filing Text
  const currentFilingText = useMemo(() => {
    switch (activeTab) {
      case 'lfts':
        return lftResult.filingText;
      case 'haematinics':
        return haematinicsResult.filingText;
      case 'ckd':
        return ckdResult.filingText;
      case 'tft':
        return tftResult.filingText;
      case 'incidental':
        return incidentalResult.filingText;
      case 'ai_queue':
        return aiFilingNote || 'Paste laboratory text above and click "Analyse Lab Queue" to generate a filing note.';
    }
  }, [
    activeTab,
    lftResult,
    haematinicsResult,
    ckdResult,
    tftResult,
    incidentalResult,
    aiFilingNote,
  ]);

  const currentAccurxSuggestion = useMemo(() => {
    switch (activeTab) {
      case 'lfts':
        return lftResult.accurxTemplateSuggestion;
      case 'haematinics':
        return haematinicsResult.accurxTemplateSuggestion;
      case 'ckd':
        return ckdResult.accurxTemplateSuggestion;
      case 'tft':
        return tftResult.accurxTemplateSuggestion;
      default:
        return undefined;
    }
  }, [activeTab, lftResult, haematinicsResult, ckdResult, tftResult]);

  // Actions
  const handleCopyFiling = (text: string) => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(text);
      setCopiedFiling(true);
      setTimeout(() => setCopiedFiling(false), 2000);
    }
  };

  const handleInsert = (text: string) => {
    if (onInsertIntoPage) {
      const markdownBlock = `\n\n> 🧪 **Pathology Triage Note (BSG/NICE):**\n> ${text}\n\n`;
      onInsertIntoPage(markdownBlock);
      setInsertedToDoc(true);
      setTimeout(() => setInsertedToDoc(false), 2000);
    }
  };

  const handleSendViaAccurx = (smsText?: string) => {
    if (!smsText) return;
    if (onOpenAccurxWithText) {
      onOpenAccurxWithText(smsText);
      onClose();
    } else if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('notion:open_accurx_with_text', { detail: { text: smsText } })
      );
      onClose();
    }
  };

  // Run AI Free-Text Lab Queue Parser
  const handleRunAiLabAnalysis = async () => {
    if (!rawLabText.trim()) return;
    setIsAiLoading(true);
    setAiAnalysisResult(null);
    setAiFilingNote(null);

    try {
      const prompt = `You are an expert UK NHS General Practitioner pathology filing engine.
Analyze the following patient pathology / blood results report against BSG, NICE, and BSH guidelines:

PATIENT LAB REPORT TEXT:
"""
${rawLabText}
"""

Please provide:
1. **Abnormal Markers & Severity**: Identify every out-of-range value and classify clinical severity.
2. **Clinical Interpretation**: Hepatitic vs Cholestatic, Iron Deficiency vs Anæmia of Chronic Disease, CKD staging (eGFR + ACR), Thyroid status, or incidental finding triage.
3. **Recommended Actions & Red Flags**: List next steps, repeat intervals (e.g. 2-4 weeks, 3 months), autoantibodies, imaging, or NICE NG12 2WW criteria check.
4. **EMIS / SystmOne Filing Note**: Provide a crisp, 1-2 sentence standardized filing note with rationale, safety net, and plan ready to paste into medical records. Format as:
FILING NOTE: [Your concise note here]`;

      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ask_ai',
          prompt,
          documentTitle: currentDocTitle || 'Pathology Queue',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.output || data.result || '';
        setAiAnalysisResult(text);

        // Extract filing note
        const match = text.match(/FILING NOTE:\s*(.*)/i);
        if (match && match[1]) {
          setAiFilingNote(match[1].trim());
        } else {
          setAiFilingNote(text.slice(0, 250) + '...');
        }
      } else {
        setAiAnalysisResult('Failed to analyse blood results. Please check connection and try again.');
      }
    } catch (err: any) {
      setAiAnalysisResult('Error during analysis: ' + (err.message || 'Unknown error'));
    } finally {
      setIsAiLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-2xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden text-neutral-900 dark:text-neutral-100">
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-neutral-100">
                  🧪 Pathology Analyser BSG / NICE
                </h3>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  BSG 2020 • NICE NG12 • NG203 • NG145
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Primary Care Lab Queue Triage & 1-Click Filing for EMIS / SystmOne / Docman
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* TOP PATHWAY TABS */}
        <div className="flex items-center gap-1.5 px-4 pt-2.5 border-b border-neutral-200 dark:border-neutral-800 overflow-x-auto no-scrollbar bg-white dark:bg-[#1a1a1a]">
          <button
            type="button"
            onClick={() => setActiveTab('lfts')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg text-xs font-semibold whitespace-nowrap transition border-b-2 ${
              activeTab === 'lfts'
                ? 'border-purple-600 text-purple-700 dark:text-purple-400 bg-purple-50/60 dark:bg-purple-950/30'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            <HeartPulse className="w-3.5 h-3.5" />
            <span>1. Abnormal LFTs & FIB-4</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('haematinics')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg text-xs font-semibold whitespace-nowrap transition border-b-2 ${
              activeTab === 'haematinics'
                ? 'border-red-600 text-red-700 dark:text-red-400 bg-red-50/60 dark:bg-red-950/30'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            <Droplet className="w-3.5 h-3.5" />
            <span>2. Iron & Mentzer</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ckd')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg text-xs font-semibold whitespace-nowrap transition border-b-2 ${
              activeTab === 'ckd'
                ? 'border-blue-600 text-blue-700 dark:text-blue-400 bg-blue-50/60 dark:bg-blue-950/30'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>3. CKD & Proteinuria</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tft')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg text-xs font-semibold whitespace-nowrap transition border-b-2 ${
              activeTab === 'tft'
                ? 'border-amber-600 text-amber-700 dark:text-amber-400 bg-amber-50/60 dark:bg-amber-950/30'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>4. Thyroid (TFT)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('incidental')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg text-xs font-semibold whitespace-nowrap transition border-b-2 ${
              activeTab === 'incidental'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-emerald-50/60 dark:bg-emerald-950/30'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>5. Incidental Lab Findings</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ai_queue')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg text-xs font-semibold whitespace-nowrap transition border-b-2 ${
              activeTab === 'ai_queue'
                ? 'border-indigo-600 text-indigo-700 dark:text-indigo-400 bg-indigo-50/60 dark:bg-indigo-950/30'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>✨ AI Queue Parser</span>
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          
          {/* TAB 1: ABNORMAL LFTS & FIB-4 */}
          {activeTab === 'lfts' && (
            <div className="space-y-5">
              {/* Preset Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Presets:</span>
                <button
                  type="button"
                  onClick={() => setLftInputs({ alt: 72, ast: 48, alp: 85, ggt: 64, bilirubin: 14, albumin: 44, platelets: 230, age: 52, alcoholUnitsPerWeek: 12, bmi: 29.4, hasRecentAntibiotics: false })}
                  className="px-2.5 py-1 rounded-md text-xs font-medium bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
                >
                  Mild MASLD / NAFLD (ALT 72)
                </button>
                <button
                  type="button"
                  onClick={() => setLftInputs({ alt: 42, ast: 36, alp: 280, ggt: 195, bilirubin: 24, albumin: 41, platelets: 260, age: 64, alcoholUnitsPerWeek: 4, bmi: 25.1, hasRecentAntibiotics: true })}
                  className="px-2.5 py-1 rounded-md text-xs font-medium bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
                >
                  Post-Co-Amoxiclav Cholestasis (ALP 280)
                </button>
                <button
                  type="button"
                  onClick={() => setLftInputs({ alt: 22, ast: 24, alp: 78, ggt: 28, bilirubin: 46, albumin: 45, platelets: 245, age: 28, alcoholUnitsPerWeek: 2, bmi: 22.0, hasRecentAntibiotics: false })}
                  className="px-2.5 py-1 rounded-md text-xs font-medium bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
                >
                  Suspected Gilbert’s (Bili 46, Normal Transaminases)
                </button>
              </div>

              {/* LFT Numerical Inputs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-500 uppercase">ALT (U/L)</label>
                  <input
                    type="number"
                    value={lftInputs.alt || ''}
                    onChange={(e) => setLftInputs({ ...lftInputs, alt: parseFloat(e.target.value) || 0 })}
                    className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold"
                  />
                  <span className="text-[10px] text-neutral-400">Normal &lt; 35</span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-500 uppercase">AST (U/L)</label>
                  <input
                    type="number"
                    value={lftInputs.ast || ''}
                    onChange={(e) => setLftInputs({ ...lftInputs, ast: parseFloat(e.target.value) || 0 })}
                    className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold"
                  />
                  <span className="text-[10px] text-neutral-400">Normal &lt; 35</span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-500 uppercase">ALP (U/L)</label>
                  <input
                    type="number"
                    value={lftInputs.alp || ''}
                    onChange={(e) => setLftInputs({ ...lftInputs, alp: parseFloat(e.target.value) || 0 })}
                    className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold"
                  />
                  <span className="text-[10px] text-neutral-400">Normal 30-130</span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-500 uppercase">GGT (U/L)</label>
                  <input
                    type="number"
                    value={lftInputs.ggt || ''}
                    onChange={(e) => setLftInputs({ ...lftInputs, ggt: parseFloat(e.target.value) || 0 })}
                    className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold"
                  />
                  <span className="text-[10px] text-neutral-400">Normal &lt; 50</span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-500 uppercase">Bilirubin (µmol/L)</label>
                  <input
                    type="number"
                    value={lftInputs.bilirubin || ''}
                    onChange={(e) => setLftInputs({ ...lftInputs, bilirubin: parseFloat(e.target.value) || 0 })}
                    className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold"
                  />
                  <span className="text-[10px] text-neutral-400">Normal &lt; 21</span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-500 uppercase">Platelets (×10⁹/L)</label>
                  <input
                    type="number"
                    value={lftInputs.platelets || ''}
                    onChange={(e) => setLftInputs({ ...lftInputs, platelets: parseFloat(e.target.value) || 0 })}
                    className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold"
                  />
                  <span className="text-[10px] text-neutral-400">For FIB-4 score</span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-500 uppercase">Age (Years)</label>
                  <input
                    type="number"
                    value={lftInputs.age || ''}
                    onChange={(e) => setLftInputs({ ...lftInputs, age: parseFloat(e.target.value) || 0 })}
                    className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-500 uppercase">Alcohol (Units/Wk)</label>
                  <input
                    type="number"
                    value={lftInputs.alcoholUnitsPerWeek || ''}
                    onChange={(e) => setLftInputs({ ...lftInputs, alcoholUnitsPerWeek: parseFloat(e.target.value) || 0 })}
                    className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold"
                  />
                  <span className="text-[10px] text-neutral-400">UK limit: 14 u/w</span>
                </div>
              </div>

              {/* LFT Analysis Card */}
              <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                        lftResult.pattern === 'normal'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : lftResult.pattern === 'isolated_hyperbilirubinaemia'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {lftResult.title}
                    </span>
                    <span className="text-xs text-neutral-400">BSG 2020 Pathway Aligned</span>
                  </div>

                  {lftResult.fib4 && (
                    <div
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border ${
                        lftResult.fib4.riskCategory === 'low'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : lftResult.fib4.riskCategory === 'indeterminate'
                          ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300'
                          : 'bg-red-50 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-300'
                      }`}
                    >
                      <span>FIB-4: {lftResult.fib4.score}</span>
                      <span className="capitalize font-bold">({lftResult.fib4.riskCategory} Risk)</span>
                    </div>
                  )}
                </div>

                {/* FIB-4 Guidance if calculated */}
                {lftResult.fib4 && (
                  <div className="p-3 rounded-lg bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 text-xs">
                    <p className="font-semibold text-purple-900 dark:text-purple-200">{lftResult.fib4.interpretation}</p>
                    <p className="text-purple-700 dark:text-purple-300 mt-0.5">{lftResult.fib4.action}</p>
                  </div>
                )}

                {/* Red flags */}
                {lftResult.redFlags.length > 0 && (
                  <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-red-700 dark:text-red-300">
                      <AlertOctagon className="w-4 h-4" />
                      <span>Red Flag Warning:</span>
                    </div>
                    {lftResult.redFlags.map((rf, i) => (
                      <p key={i} className="text-red-600 dark:text-red-400">{rf}</p>
                    ))}
                  </div>
                )}

                {/* Differential Diagnoses & Recommended Investigations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <h4 className="font-bold text-neutral-700 dark:text-neutral-300 mb-1.5 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-blue-500" />
                      <span>Likely Differential Causes:</span>
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-neutral-600 dark:text-neutral-400">
                      {lftResult.differentialDiagnoses.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-neutral-700 dark:text-neutral-300 mb-1.5 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Recommended UK Investigations:</span>
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-neutral-600 dark:text-neutral-400">
                      {lftResult.recommendedInvestigations.map((inv, i) => (
                        <li key={i}>{inv}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: HAEMATINICS & IRON (MENTZER / NICE NG12) */}
          {activeTab === 'haematinics' && (
            <div className="space-y-5">
              {/* Presets */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Presets:</span>
                <button
                  type="button"
                  onClick={() => setHaematinicsInputs({ hb: 104, mcv: 74, ferritin: 14, tfs: 11, rbc: 4.2, age: 68, sex: 'male', isPostMenopausal: true, hasRedFlagGiSymptoms: false })}
                  className="px-2.5 py-1 rounded-md text-xs font-medium bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
                >
                  68yo Male with IDA (NICE NG12 2WW Criteria)
                </button>
                <button
                  type="button"
                  onClick={() => setHaematinicsInputs({ hb: 112, mcv: 68, ferritin: 65, tfs: 28, rbc: 5.8, age: 34, sex: 'female', isPostMenopausal: false, hasRedFlagGiSymptoms: false })}
                  className="px-2.5 py-1 rounded-md text-xs font-medium bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
                >
                  Thalassaemia Trait (Mentzer Index &lt; 13)
                </button>
                <button
                  type="button"
                  onClick={() => setHaematinicsInputs({ hb: 108, mcv: 82, ferritin: 140, tfs: 14, rbc: 3.9, age: 72, sex: 'female', isPostMenopausal: true, hasRedFlagGiSymptoms: false })}
                  className="px-2.5 py-1 rounded-md text-xs font-medium bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
                >
                  Chronic Inflammation / Functional Iron Def (TfS 14%)
                </button>
              </div>

              {/* Inputs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-500 uppercase">Haemoglobin (g/L)</label>
                  <input
                    type="number"
                    value={haematinicsInputs.hb || ''}
                    onChange={(e) => setHaematinicsInputs({ ...haematinicsInputs, hb: parseFloat(e.target.value) || 0 })}
                    className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold"
                  />
                  <span className="text-[10px] text-neutral-400">Normal 120-170</span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-500 uppercase">MCV (fL)</label>
                  <input
                    type="number"
                    value={haematinicsInputs.mcv || ''}
                    onChange={(e) => setHaematinicsInputs({ ...haematinicsInputs, mcv: parseFloat(e.target.value) || 0 })}
                    className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold"
                  />
                  <span className="text-[10px] text-neutral-400">Normal 80-100</span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-500 uppercase">Ferritin (µg/L)</label>
                  <input
                    type="number"
                    value={haematinicsInputs.ferritin || ''}
                    onChange={(e) => setHaematinicsInputs({ ...haematinicsInputs, ferritin: parseFloat(e.target.value) || 0 })}
                    className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold"
                  />
                  <span className="text-[10px] text-neutral-400">&lt;30 = Absolute Def</span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-500 uppercase">Transferrin Sat (%)</label>
                  <input
                    type="number"
                    value={haematinicsInputs.tfs || ''}
                    onChange={(e) => setHaematinicsInputs({ ...haematinicsInputs, tfs: parseFloat(e.target.value) || 0 })}
                    className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold"
                  />
                  <span className="text-[10px] text-neutral-400">&lt;20% = Functional Def</span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-500 uppercase">RBC Count (×10¹²/L)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={haematinicsInputs.rbc || ''}
                    onChange={(e) => setHaematinicsInputs({ ...haematinicsInputs, rbc: parseFloat(e.target.value) || 0 })}
                    className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold"
                  />
                  <span className="text-[10px] text-neutral-400">For Mentzer index</span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-500 uppercase">Sex & Status</label>
                  <select
                    value={haematinicsInputs.sex}
                    onChange={(e) => setHaematinicsInputs({ ...haematinicsInputs, sex: e.target.value as 'male' | 'female' })}
                    className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              {/* Haematinics Verdict */}
              <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-md text-xs font-bold bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 uppercase">
                    {haematinicsResult.classification}
                  </span>

                  {haematinicsResult.twoWeekWaitCheck.qualifies && (
                    <span className="px-3 py-1 rounded-md text-xs font-bold bg-amber-500 text-white flex items-center gap-1.5 animate-pulse">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>NICE NG12 2WW Criteria Met</span>
                    </span>
                  )}
                </div>

                {/* 2WW Details */}
                {haematinicsResult.twoWeekWaitCheck.qualifies && (
                  <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200">
                    <p className="font-semibold">{haematinicsResult.twoWeekWaitCheck.reason}</p>
                  </div>
                )}

                {/* Mentzer Index */}
                {haematinicsResult.mentzerIndex && (
                  <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200">
                    <p className="font-semibold">{haematinicsResult.mentzerIndex.interpretation}</p>
                  </div>
                )}

                {/* Treatment & Recommended Tests */}
                <div className="text-xs space-y-2 pt-1 border-t border-neutral-100 dark:border-neutral-800">
                  <div>
                    <span className="font-bold text-neutral-700 dark:text-neutral-300">Management & Replacement: </span>
                    <span className="text-neutral-600 dark:text-neutral-400">{haematinicsResult.treatmentRecommendation}</span>
                  </div>
                  <div>
                    <span className="font-bold text-neutral-700 dark:text-neutral-300">Mandatory Screening: </span>
                    <span className="text-neutral-600 dark:text-neutral-400">{haematinicsResult.recommendedTests.join('; ')}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CKD & PROTEINURIA (NICE NG203 / TA775) */}
          {activeTab === 'ckd' && (
            <div className="space-y-5">
              {/* Presets */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Presets:</span>
                <button
                  type="button"
                  onClick={() => setCkdInputs({ egfrCurrent: 52, egfrPrevious: 56, acr: 12.4, hasDiabetes: true, hasHeartFailure: false, hasHaematuria: false, currentSystolicBp: 136, currentDiastolicBp: 82 })}
                  className="px-2.5 py-1 rounded-md text-xs font-medium bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
                >
                  CKD G3a A2 (T2D, SGLT2i criteria met)
                </button>
                <button
                  type="button"
                  onClick={() => setCkdInputs({ egfrCurrent: 28, egfrPrevious: 42, acr: 45.0, hasDiabetes: false, hasHeartFailure: false, hasHaematuria: true, currentSystolicBp: 152, currentDiastolicBp: 92 })}
                  className="px-2.5 py-1 rounded-md text-xs font-medium bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
                >
                  Accelerated Decline (eGFR 28, Nephrology Referral)
                </button>
              </div>

              {/* Inputs */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-500 uppercase">Current eGFR</label>
                  <input
                    type="number"
                    value={ckdInputs.egfrCurrent || ''}
                    onChange={(e) => setCkdInputs({ ...ckdInputs, egfrCurrent: parseFloat(e.target.value) || 0 })}
                    className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold"
                  />
                  <span className="text-[10px] text-neutral-400">ml/min/1.73m²</span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-500 uppercase">Previous eGFR (12m)</label>
                  <input
                    type="number"
                    value={ckdInputs.egfrPrevious || ''}
                    onChange={(e) => setCkdInputs({ ...ckdInputs, egfrPrevious: parseFloat(e.target.value) || 0 })}
                    className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold"
                  />
                  <span className="text-[10px] text-neutral-400">For drop velocity</span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-500 uppercase">Urine ACR</label>
                  <input
                    type="number"
                    step="0.1"
                    value={ckdInputs.acr || ''}
                    onChange={(e) => setCkdInputs({ ...ckdInputs, acr: parseFloat(e.target.value) || 0 })}
                    className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold"
                  />
                  <span className="text-[10px] text-neutral-400">mg/mmol (&gt;3 = Micro)</span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-500 uppercase">Systolic BP</label>
                  <input
                    type="number"
                    value={ckdInputs.currentSystolicBp || ''}
                    onChange={(e) => setCkdInputs({ ...ckdInputs, currentSystolicBp: parseFloat(e.target.value) || 0 })}
                    className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold"
                  />
                  <span className="text-[10px] text-neutral-400">Target &lt;130 if ACR&gt;70</span>
                </div>

                <div className="flex flex-col justify-center">
                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={ckdInputs.hasDiabetes}
                      onChange={(e) => setCkdInputs({ ...ckdInputs, hasDiabetes: e.target.checked })}
                      className="rounded text-purple-600"
                    />
                    <span className="font-semibold">Type 2 Diabetes</span>
                  </label>
                </div>
              </div>

              {/* CKD Verdict */}
              <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-md text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 uppercase">
                      {ckdResult.combinedStage}
                    </span>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">{ckdResult.progressionNote}</span>
                  </div>

                  {ckdResult.nephrologyReferralNeeded && (
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">
                      Nephrology Referral Needed
                    </span>
                  )}
                </div>

                <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 text-xs space-y-1.5">
                  <div className="font-semibold text-neutral-800 dark:text-neutral-200">{ckdResult.bpTarget}</div>
                  <ul className="list-disc list-inside text-neutral-600 dark:text-neutral-400 space-y-1">
                    {ckdResult.managementPlan.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: THYROID (TFT) QUICK RULES */}
          {activeTab === 'tft' && (
            <div className="space-y-5">
              {/* Presets */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Presets:</span>
                <button
                  type="button"
                  onClick={() => setTftInputs({ tsh: 6.8, freeT4: 14.2, freeT3: 4.5, tpoAntibodiesPositive: true, isPregnantOrPlanning: false, isSymptomatic: false, age: 56, isHospitalDischargeOrAcuteIllness: false })}
                  className="px-2.5 py-1 rounded-md text-xs font-medium bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
                >
                  Subclinical Hypo (TSH 6.8, No Levothyroxine)
                </button>
                <button
                  type="button"
                  onClick={() => setTftInputs({ tsh: 12.4, freeT4: 12.0, freeT3: 4.0, tpoAntibodiesPositive: true, isPregnantOrPlanning: false, isSymptomatic: true, age: 48, isHospitalDischargeOrAcuteIllness: false })}
                  className="px-2.5 py-1 rounded-md text-xs font-medium bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
                >
                  TSH &gt; 10 (Levothyroxine Indicated, NICE NG145)
                </button>
                <button
                  type="button"
                  onClick={() => setTftInputs({ tsh: 3.1, freeT4: 8.4, freeT3: 2.8, tpoAntibodiesPositive: false, isPregnantOrPlanning: false, isSymptomatic: false, age: 74, isHospitalDischargeOrAcuteIllness: true })}
                  className="px-2.5 py-1 rounded-md text-xs font-medium bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
                >
                  Sick Euthyroid (Post-Admission, Low FT4)
                </button>
              </div>

              {/* Inputs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-500 uppercase">TSH (mU/L)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={tftInputs.tsh || ''}
                    onChange={(e) => setTftInputs({ ...tftInputs, tsh: parseFloat(e.target.value) || 0 })}
                    className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold"
                  />
                  <span className="text-[10px] text-neutral-400">Normal 0.4 - 4.5</span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-500 uppercase">Free T4 (pmol/L)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={tftInputs.freeT4 || ''}
                    onChange={(e) => setTftInputs({ ...tftInputs, freeT4: parseFloat(e.target.value) || 0 })}
                    className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold"
                  />
                  <span className="text-[10px] text-neutral-400">Normal 10 - 22</span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-500 uppercase">Age</label>
                  <input
                    type="number"
                    value={tftInputs.age || ''}
                    onChange={(e) => setTftInputs({ ...tftInputs, age: parseFloat(e.target.value) || 0 })}
                    className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold"
                  />
                </div>

                <div className="flex flex-col justify-center space-y-1 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tftInputs.isPregnantOrPlanning}
                      onChange={(e) => setTftInputs({ ...tftInputs, isPregnantOrPlanning: e.target.checked })}
                      className="rounded text-purple-600"
                    />
                    <span className="font-semibold">Pregnant / Conceiving</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tftInputs.isHospitalDischargeOrAcuteIllness}
                      onChange={(e) => setTftInputs({ ...tftInputs, isHospitalDischargeOrAcuteIllness: e.target.checked })}
                      className="rounded text-purple-600"
                    />
                    <span>Acute Illness / Inpatient</span>
                  </label>
                </div>
              </div>

              {/* TFT Analysis */}
              <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 uppercase">
                    {tftResult.title}
                  </span>

                  <span
                    className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                      tftResult.levothyroxineTrialIndicated
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                        : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                    }`}
                  >
                    {tftResult.levothyroxineTrialIndicated ? 'Levothyroxine Recommended' : 'No Thyroxine Indicated'}
                  </span>
                </div>

                <div className="text-xs space-y-1.5 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/60">
                  <p className="font-bold text-neutral-800 dark:text-neutral-200">Management: {tftResult.startingDoseGuidance}</p>
                  <p className="text-neutral-600 dark:text-neutral-400">Monitoring: {tftResult.monitoringPlan}</p>
                  <ul className="list-disc list-inside text-neutral-500 dark:text-neutral-400 pt-1 space-y-0.5">
                    {tftResult.clinicalNotes.map((note, i) => (
                      <li key={i}>{note}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: COMMON INCIDENTAL FINDINGS */}
          {activeTab === 'incidental' && (
            <div className="space-y-5">
              {/* Finding Type Selector */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIncidentalInputs({ ...incidentalInputs, findingType: 'eosinophilia' })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    incidentalInputs.findingType === 'eosinophilia'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
                  }`}
                >
                  Mild Eosinophilia
                </button>

                <button
                  type="button"
                  onClick={() => setIncidentalInputs({ ...incidentalInputs, findingType: 'mgus' })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    incidentalInputs.findingType === 'mgus'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
                  }`}
                >
                  Monoclonal Gammopathy (MGUS)
                </button>

                <button
                  type="button"
                  onClick={() => setIncidentalInputs({ ...incidentalInputs, findingType: 'neutropenia' })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    incidentalInputs.findingType === 'neutropenia'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
                  }`}
                >
                  Marginal Neutropenia (BEN)
                </button>
              </div>

              {/* Dynamic Inputs based on Finding Type */}
              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800">
                {incidentalInputs.findingType === 'eosinophilia' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-500 uppercase">Eosinophil Count (×10⁹/L)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={incidentalInputs.eosinophilCount || ''}
                        onChange={(e) => setIncidentalInputs({ ...incidentalInputs, eosinophilCount: parseFloat(e.target.value) || 0 })}
                        className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold"
                      />
                      <span className="text-[10px] text-neutral-400">Normal 0.04 - 0.40</span>
                    </div>
                  </div>
                )}

                {incidentalInputs.findingType === 'mgus' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-500 uppercase">Paraprotein Level (g/L)</label>
                      <input
                        type="number"
                        value={incidentalInputs.paraproteinLevel || ''}
                        onChange={(e) => setIncidentalInputs({ ...incidentalInputs, paraproteinLevel: parseFloat(e.target.value) || 0 })}
                        className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold"
                      />
                      <span className="text-[10px] text-neutral-400">Refer if IgG &ge; 15, IgA/IgM &ge; 10</span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-neutral-500 uppercase">Paraprotein Type</label>
                      <select
                        value={incidentalInputs.paraproteinType}
                        onChange={(e) => setIncidentalInputs({ ...incidentalInputs, paraproteinType: e.target.value as any })}
                        className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold"
                      >
                        <option value="IgG">IgG</option>
                        <option value="IgA">IgA</option>
                        <option value="IgM">IgM</option>
                        <option value="IgD">IgD (urgent referral)</option>
                        <option value="IgE">IgE (urgent referral)</option>
                      </select>
                    </div>

                    <div className="flex items-center pt-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={incidentalInputs.hasCrabSymptoms}
                          onChange={(e) => setIncidentalInputs({ ...incidentalInputs, hasCrabSymptoms: e.target.checked })}
                          className="rounded text-purple-600"
                        />
                        <span className="font-semibold text-red-600 dark:text-red-400">CRAB symptoms present</span>
                      </label>
                    </div>
                  </div>
                )}

                {incidentalInputs.findingType === 'neutropenia' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-500 uppercase">Neutrophil Count (×10⁹/L)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={incidentalInputs.neutrophilCount || ''}
                        onChange={(e) => setIncidentalInputs({ ...incidentalInputs, neutrophilCount: parseFloat(e.target.value) || 0 })}
                        className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold"
                      />
                      <span className="text-[10px] text-neutral-400">Normal 2.0 - 7.5</span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-neutral-500 uppercase">Ethnicity</label>
                      <select
                        value={incidentalInputs.ethnicity}
                        onChange={(e) => setIncidentalInputs({ ...incidentalInputs, ethnicity: e.target.value as any })}
                        className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold"
                      >
                        <option value="african_caribbean_middle_east">African / Caribbean / Middle East (BEN check)</option>
                        <option value="other">Other / Caucasian</option>
                      </select>
                    </div>

                    <div className="flex items-center pt-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={incidentalInputs.isTakingCarbimazoleOrMethotrexate}
                          onChange={(e) => setIncidentalInputs({ ...incidentalInputs, isTakingCarbimazoleOrMethotrexate: e.target.checked })}
                          className="rounded text-red-600"
                        />
                        <span className="font-semibold text-red-600 dark:text-red-400">On Carbimazole / MTX</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Incidental Findings Analysis */}
              <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-md text-xs font-bold bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200 uppercase">
                    {incidentalResult.title}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                      incidentalResult.riskCategory === 'high_red_flag'
                        ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                        : incidentalResult.riskCategory === 'moderate'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}
                  >
                    {incidentalResult.riskCategory.replace('_', ' ')}
                  </span>
                </div>

                <div className="text-xs space-y-2">
                  <div>
                    <h5 className="font-bold text-neutral-700 dark:text-neutral-300">Action Plan:</h5>
                    <ul className="list-disc list-inside space-y-1 text-neutral-600 dark:text-neutral-400 mt-1">
                      {incidentalResult.immediateActions.map((act, i) => (
                        <li key={i}>{act}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-2.5 rounded bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700">
                    <span className="font-bold text-neutral-800 dark:text-neutral-200">Referral Threshold: </span>
                    <span className="text-neutral-600 dark:text-neutral-400">{incidentalResult.referralCriteria}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: AI FREE-TEXT LAB QUEUE PARSER */}
          {activeTab === 'ai_queue' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Paste Raw Laboratory Text from EMIS Web, SystmOne, ICE, or Docman:
                </label>
                <textarea
                  rows={4}
                  value={rawLabText}
                  onChange={(e) => setRawLabText(e.target.value)}
                  placeholder="e.g.: Serum ALT: 74 U/L [0 - 35], Alk Phos: 112 U/L [30 - 130], Bilirubin: 18 umol/L, Ferritin: 16 ug/L, Hb: 108 g/L, eGFR: 54, Urine ACR: 18.2..."
                  className="w-full p-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs font-mono placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  disabled={isAiLoading || !rawLabText.trim()}
                  onClick={handleRunAiLabAnalysis}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition shadow-xs cursor-pointer"
                >
                  {isAiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>{isAiLoading ? 'Analyzing Lab Queue...' : 'Analyse Lab Queue (BSG / NICE)'}</span>
                </button>
                <span className="text-[11px] text-neutral-400">Powered by Gemini Flash & Sonnet</span>
              </div>

              {aiAnalysisResult && (
                <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/20 text-xs space-y-2">
                  <h4 className="font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                    <span>AI Pathology Assessment:</span>
                  </h4>
                  <div className="prose prose-xs dark:prose-invert max-w-none whitespace-pre-line text-neutral-700 dark:text-neutral-300 font-sans">
                    {aiAnalysisResult}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* ONE-CLICK FILING ACTION BOX (FOR EMIS / SYSTMONE) */}
          {/* ========================================================================= */}
          <div className="p-4 rounded-xl border border-purple-200 dark:border-purple-800/80 bg-purple-50/50 dark:bg-purple-950/20 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                <span>1-Click Filing Action Text (EMIS / SystmOne / Docman):</span>
              </span>
              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-medium">Standardized Medico-Legal Format</span>
            </div>

            <div className="p-3 rounded-lg bg-white dark:bg-neutral-900 border border-purple-200/80 dark:border-purple-800 font-mono text-xs text-neutral-800 dark:text-neutral-200 select-all">
              {currentFilingText}
            </div>

            <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyFiling(currentFilingText)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 transition shadow-2xs cursor-pointer"
                >
                  {copiedFiling ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedFiling ? 'Copied to Clipboard!' : 'Copy Filing Note'}</span>
                </button>

                {onInsertIntoPage && (
                  <button
                    type="button"
                    onClick={() => handleInsert(currentFilingText)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/60 hover:bg-purple-200 dark:hover:bg-purple-800/60 transition shadow-2xs cursor-pointer"
                  >
                    {insertedToDoc ? <Check className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    <span>{insertedToDoc ? 'Inserted into Page!' : 'Insert into Page'}</span>
                  </button>
                )}
              </div>

              {currentAccurxSuggestion && (
                <button
                  type="button"
                  onClick={() => handleSendViaAccurx(currentAccurxSuggestion)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950/60 hover:bg-blue-200 dark:hover:bg-blue-900/60 border border-blue-300 dark:border-blue-800 transition shadow-2xs cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-blue-600" />
                  <span>Send Patient Advice via Accurx</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
