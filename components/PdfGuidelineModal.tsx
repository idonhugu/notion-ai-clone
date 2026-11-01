'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  FileText,
  Sparkles,
  UploadCloud,
  Check,
  Plus,
  X,
  Loader2,
  ChevronRight,
  ChevronDown,
  AlertCircle,
  ExternalLink,
  BookOpen,
  Stethoscope,
  ShieldAlert,
  ArrowRight,
  Search,
  CheckCircle2,
  Paperclip,
  RotateCcw,
} from 'lucide-react';
import { Document, AttachedFile } from '@/lib/types';
import {
  AnalyzedPresentationResult,
  SECTION_DEFINITIONS,
  smartMergePresentationBlocks,
  createDedicatedGuidelineSection,
  buildCompletePresentationBlocks,
  COMMON_PRESENTATIONS_PARENT_ID,
  ExtractedClinicalSections,
} from '@/lib/presentationMerger';
import { fetchDocumentById, updateDocument, createDocument } from '@/lib/api/documents';
import { useRouter } from 'next/navigation';

interface PdfGuidelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  preloadedFile?: AttachedFile | null;
  onPresentationUpdated?: (docId: string, docTitle: string) => void;
}

export function PdfGuidelineModal({
  isOpen,
  onClose,
  preloadedFile,
  onPresentationUpdated,
}: PdfGuidelineModalProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload & File State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileDataUrl, setFileDataUrl] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);

  // Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalyzedPresentationResult | null>(null);

  // Common Presentations Catalog
  const [presentations, setPresentations] = useState<{ id: string; title: string; icon: string | null }[]>([]);
  const [selectedPresentationId, setSelectedPresentationId] = useState<string>('');
  const [searchFilter, setSearchFilter] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Review & Merge Selection State
  const [selectedBullets, setSelectedBullets] = useState<Record<string, Record<number, boolean>>>({});
  const [mergeMode, setMergeMode] = useState<'smart_merge' | 'dedicated_section'>('smart_merge');
  const [attachPdfToDoc, setAttachPdfToDoc] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState<{ docId: string; docTitle: string; count: number } | null>(null);

  // Load presentations catalog when modal opens
  useEffect(() => {
    if (!isOpen) return;

    async function loadPresentationsCatalog() {
      try {
        const res = await fetch(`/api/documents?parent_id=${COMMON_PRESENTATIONS_PARENT_ID}`);
        if (res.ok) {
          const docs = await res.json();
          if (Array.isArray(docs)) {
            setPresentations(
              docs.map((d: any) => ({
                id: d.id,
                title: d.title || 'Untitled',
                icon: d.icon || '📄',
              }))
            );
          }
        }
      } catch (err) {
        console.error('Failed to load presentations catalog:', err);
      }
    }

    loadPresentationsCatalog();
  }, [isOpen]);

  // Handle preloaded file if passed
  useEffect(() => {
    if (isOpen && preloadedFile && preloadedFile.url) {
      setFileDataUrl(preloadedFile.url);
      setFileName(preloadedFile.name);
      setFileSize(preloadedFile.size);
      handleAnalyzePdf(preloadedFile.url, preloadedFile.name, preloadedFile.size);
    }
  }, [isOpen, preloadedFile]);

  // Reset modal state on close
  useEffect(() => {
    if (!isOpen) {
      setSelectedFile(null);
      setFileDataUrl('');
      setFileName('');
      setFileSize(0);
      setIsAnalyzing(false);
      setAnalysisError(null);
      setAnalysisResult(null);
      setSelectedPresentationId('');
      setSelectedBullets({});
      setApplySuccess(null);
      setSearchFilter('');
    }
  }, [isOpen]);

  // Close on Escape
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

  const handleFileChange = (file: File) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf') && !file.type.includes('pdf')) {
      setAnalysisError('Please upload a PDF document (.pdf)');
      return;
    }

    setSelectedFile(file);
    setFileName(file.name);
    setFileSize(file.size);
    setAnalysisError(null);
    setAnalysisResult(null);
    setApplySuccess(null);

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setFileDataUrl(dataUrl);
      handleAnalyzePdf(dataUrl, file.name, file.size);
    };
    reader.onerror = () => {
      setAnalysisError('Failed to read the selected file.');
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyzePdf = async (dataUrl: string, name: string, size: number) => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisResult(null);
    setApplySuccess(null);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analyze_pdf_for_presentation',
          fileData: dataUrl,
          fileName: name,
          fileType: 'application/pdf',
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Server returned ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      if (!data.success || !data.result) {
        throw new Error(data.error || 'AI did not return structured guideline findings.');
      }

      const result: AnalyzedPresentationResult = data.result;
      setAnalysisResult(result);

      // If backend returned catalog of presentations, update local state
      if (Array.isArray(data.presentations) && data.presentations.length > 0) {
        setPresentations(data.presentations);
      }

      // Default target presentation
      if (result.matchedPresentationId) {
        setSelectedPresentationId(result.matchedPresentationId);
      } else {
        setSelectedPresentationId('__create_new__');
      }

      // Initialize all checkboxes to checked (true)
      const initialChecked: Record<string, Record<number, boolean>> = {};
      SECTION_DEFINITIONS.forEach((def) => {
        const items = result.sections[def.key] || [];
        initialChecked[def.key] = {};
        items.forEach((_, idx) => {
          initialChecked[def.key][idx] = true;
        });
      });
      setSelectedBullets(initialChecked);
    } catch (err: any) {
      console.error('PDF Analysis error:', err);
      setAnalysisError(err.message || 'Failed to analyze PDF. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleBullet = (sectionKey: string, index: number) => {
    setSelectedBullets((prev) => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        [index]: !prev[sectionKey]?.[index],
      },
    }));
  };

  const toggleSectionAll = (sectionKey: string, selectAll: boolean) => {
    if (!analysisResult) return;
    const items = analysisResult.sections[sectionKey as keyof ExtractedClinicalSections] || [];
    const sectionState: Record<number, boolean> = {};
    items.forEach((_, idx) => {
      sectionState[idx] = selectAll;
    });

    setSelectedBullets((prev) => ({
      ...prev,
      [sectionKey]: sectionState,
    }));
  };

  // Filtered presentations list for search
  const filteredPresentations = useMemo(() => {
    if (!searchFilter.trim()) return presentations;
    const query = searchFilter.toLowerCase().trim();
    return presentations.filter((p) => p.title.toLowerCase().includes(query));
  }, [presentations, searchFilter]);

  // Active target presentation object
  const activeTargetPresentation = useMemo(() => {
    if (selectedPresentationId === '__create_new__') {
      return {
        id: '__create_new__',
        title: analysisResult?.matchedPresentationTitle || 'New Clinical Presentation',
        icon: analysisResult?.matchedPresentationIcon || '🩺',
      };
    }
    return presentations.find((p) => p.id === selectedPresentationId) || null;
  }, [presentations, selectedPresentationId, analysisResult]);

  // Count total selected items
  const totalSelectedCount = useMemo(() => {
    let count = 0;
    Object.values(selectedBullets).forEach((section) => {
      Object.values(section).forEach((checked) => {
        if (checked) count++;
      });
    });
    return count;
  }, [selectedBullets]);

  const handleApplyUpdates = async () => {
    if (!analysisResult || totalSelectedCount === 0 || isApplying) return;

    setIsApplying(true);
    setAnalysisError(null);

    try {
      // 1. Gather only the checked items per section
      const filteredSections: Partial<ExtractedClinicalSections> = {};
      SECTION_DEFINITIONS.forEach((def) => {
        const rawItems = analysisResult.sections[def.key] || [];
        const checkedIndexes = selectedBullets[def.key] || {};
        const chosen = rawItems.filter((_, idx) => checkedIndexes[idx]);
        if (chosen.length > 0) {
          filteredSections[def.key] = chosen;
        }
      });

      // Prepare attached file object if user opted to attach PDF
      const newAttachedFile: AttachedFile | null =
        attachPdfToDoc && fileDataUrl
          ? {
              id: `pdf_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
              name: fileName || 'Clinical_Guideline.pdf',
              size: fileSize,
              type: 'application/pdf',
              url: fileDataUrl,
              uploadedAt: new Date().toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              }),
            }
          : null;

      const guidelineBadge = analysisResult.issuingAuthority
        ? analysisResult.issuingAuthority.replace(/\s+/g, ' ').trim()
        : 'Guideline Update';

      // CASE A: Create a brand new common presentation document
      if (selectedPresentationId === '__create_new__' || !selectedPresentationId) {
        const newTitle = analysisResult.matchedPresentationTitle || 'New Presentation';
        const newIcon = analysisResult.matchedPresentationIcon || '🩺';
        const initialBlocks = buildCompletePresentationBlocks(
          newTitle,
          filteredSections as ExtractedClinicalSections,
          `${analysisResult.guidelineTitle} (${analysisResult.issuingAuthority})`
        );

        const newDocPayload: Partial<Document> = {
          title: newTitle,
          icon: newIcon,
          parent_id: COMMON_PRESENTATIONS_PARENT_ID,
          content: initialBlocks,
          attachments: newAttachedFile ? [newAttachedFile] : [],
          is_favorite: false,
          is_archived: false,
        };

        const created = await createDocument(newDocPayload);
        if (!created || !created.id) throw new Error('Failed to create new presentation in Supabase.');

        setApplySuccess({
          docId: created.id,
          docTitle: newTitle,
          count: totalSelectedCount,
        });

        if (onPresentationUpdated) {
          onPresentationUpdated(created.id, newTitle);
        }
        return;
      }

      // CASE B: Merge into an existing common presentation document
      const { document: targetDoc } = await fetchDocumentById(selectedPresentationId);
      if (!targetDoc) {
        throw new Error('Target presentation could not be loaded from database.');
      }

      const existingBlocks = Array.isArray(targetDoc.content) ? targetDoc.content : [];
      let updatedBlocks: any[];

      if (mergeMode === 'smart_merge') {
        updatedBlocks = smartMergePresentationBlocks(existingBlocks, filteredSections, guidelineBadge);
      } else {
        updatedBlocks = createDedicatedGuidelineSection(
          existingBlocks,
          analysisResult.guidelineTitle,
          analysisResult.issuingAuthority,
          filteredSections
        );
      }

      // Prepare updated attachments array
      const existingAttachments = Array.isArray(targetDoc.attachments) ? targetDoc.attachments : [];
      const updatedAttachments = newAttachedFile
        ? [...existingAttachments.filter((a) => a.name !== newAttachedFile.name), newAttachedFile]
        : existingAttachments;

      const updated = await updateDocument(selectedPresentationId, {
        content: updatedBlocks,
        attachments: updatedAttachments,
        updated_at: new Date().toISOString(),
      });

      if (!updated) {
        throw new Error('Failed to save document updates to cloud database.');
      }

      setApplySuccess({
        docId: selectedPresentationId,
        docTitle: targetDoc.title || 'Presentation',
        count: totalSelectedCount,
      });

      if (onPresentationUpdated) {
        onPresentationUpdated(selectedPresentationId, targetDoc.title || 'Presentation');
      }
    } catch (err: any) {
      console.error('Error applying updates to presentation:', err);
      setAnalysisError(err.message || 'Failed to update presentation.');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl h-[92vh] max-h-[860px] bg-white dark:bg-[#1c1c1c] rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col overflow-hidden text-neutral-900 dark:text-neutral-100 font-sans">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/80 dark:bg-neutral-900/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-600/20 flex-shrink-0">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  PDF Guideline Sync & Common Presentations Analyzer
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-700/60">
                  AI Clinical Extraction
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Upload clinical guideline PDFs (NICE, BTS, ICB, Trust) to automatically map and update your 180+ Common Presentations
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition"
            title="Close (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* STEP 1: Upload Dropzone if no file selected or want to switch */}
          {!analysisResult && !isAnalyzing && (
            <div className="space-y-4">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleFileChange(e.dataTransfer.files[0]);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition flex flex-col items-center justify-center ${
                  isDragging
                    ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/20'
                    : 'border-neutral-300 dark:border-neutral-700 hover:border-purple-400 dark:hover:border-purple-600 bg-neutral-50/40 dark:bg-neutral-900/30'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 flex items-center justify-center mb-3 shadow-xs">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                  Select or Drop Clinical Guideline PDF Here
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-md">
                  Upload any medical PDF (e.g. Adult Asthma, Recurrent UTI, Paediatric Constipation, Osteoarthritis, Dermatology pathway).
                </p>
                <span className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-sm transition">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Browse PDF File</span>
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                  className="hidden"
                />
              </div>

              {/* Sample high-yield suggestions */}
              <div className="p-4 rounded-xl bg-neutral-100/70 dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-700/60 text-xs text-neutral-600 dark:text-neutral-300">
                <span className="font-bold text-neutral-800 dark:text-neutral-200 block mb-1">
                  💡 How this updates your GP Common Presentations:
                </span>
                <ul className="list-disc pl-4 space-y-1 text-neutral-500 dark:text-neutral-400">
                  <li>AI reads the guideline text, clinical tables, and primary care pathways.</li>
                  <li>Automatically identifies the matching condition in your 180+ Common Presentations catalog.</li>
                  <li>Extracts actionable BNF drug doses, diagnostic thresholds, red flags, and referral criteria.</li>
                  <li>Merges points directly under standard headings (Plan, Investigations, Referral) without overwriting existing notes!</li>
                </ul>
              </div>
            </div>
          )}

          {/* LOADING SPINNER */}
          {isAnalyzing && (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-purple-200 dark:border-purple-950 border-t-purple-600 animate-spin" />
                <Sparkles className="w-6 h-6 text-purple-600 absolute inset-0 m-auto animate-pulse" />
              </div>
              <div className="max-w-md">
                <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-100">
                  Analyzing {fileName}...
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  Extracting guideline text, matching against 180+ Common Presentations, and synthesizing UK primary care management points...
                </p>
              </div>
            </div>
          )}

          {/* ERROR ALERT */}
          {analysisError && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200 flex items-start gap-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold">Notice: </span>
                <span>{analysisError}</span>
              </div>
              <button
                type="button"
                onClick={() => setAnalysisError(null)}
                className="text-rose-500 hover:text-rose-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* STEP 2: REVIEW & MERGE SCREEN */}
          {analysisResult && !applySuccess && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Guideline Header & Target Match Card */}
              <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-800/80 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-900 dark:text-purple-300">
                      Guideline Detected:
                    </span>
                    <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-100">
                      {analysisResult.guidelineTitle}
                    </span>
                    {analysisResult.issuingAuthority && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-200/70 dark:bg-purple-900/60 text-purple-900 dark:text-purple-200 font-bold">
                        {analysisResult.issuingAuthority}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setAnalysisResult(null);
                      setFileDataUrl('');
                    }}
                    className="self-end sm:self-auto text-[11px] text-purple-700 dark:text-purple-400 hover:underline flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Upload Different PDF</span>
                  </button>
                </div>

                {/* Target Match Selector */}
                <div className="pt-2 border-t border-purple-200/60 dark:border-purple-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-neutral-600 dark:text-neutral-400">
                        Target Common Presentation:
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                          analysisResult.confidence === 'high'
                            ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300'
                            : 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300'
                        }`}
                      >
                        {analysisResult.confidence.toUpperCase()} CONFIDENCE
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 italic">
                      "{analysisResult.matchReason}"
                    </p>
                  </div>

                  {/* Dropdown to switch or pick presentation */}
                  <div className="relative flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-[#252525] border border-neutral-300 dark:border-neutral-700 text-xs font-semibold text-neutral-900 dark:text-neutral-100 shadow-xs hover:border-purple-400 transition"
                    >
                      <span className="text-base">{activeTargetPresentation?.icon || '🩺'}</span>
                      <span className="max-w-[200px] truncate">{activeTargetPresentation?.title}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-neutral-400 ml-1" />
                    </button>

                    {isDropdownOpen && (
                      <div className="absolute right-0 top-10 z-50 w-80 bg-white dark:bg-[#222] rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-2 space-y-2 animate-in fade-in duration-100">
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5" />
                          <input
                            type="text"
                            value={searchFilter}
                            onChange={(e) => setSearchFilter(e.target.value)}
                            placeholder="Search 180+ presentations..."
                            className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-1 focus:ring-purple-500"
                          />
                        </div>

                        <div className="max-h-56 overflow-y-auto space-y-0.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPresentationId('__create_new__');
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-left transition font-semibold ${
                              selectedPresentationId === '__create_new__'
                                ? 'bg-purple-600 text-white'
                                : 'text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40'
                            }`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>+ Create as New Presentation</span>
                          </button>

                          <div className="h-[1px] bg-neutral-200 dark:bg-neutral-800 my-1" />

                          {filteredPresentations.map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => {
                                setSelectedPresentationId(p.id);
                                setIsDropdownOpen(false);
                              }}
                              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-left transition ${
                                selectedPresentationId === p.id
                                  ? 'bg-purple-500 text-white font-semibold'
                                  : 'text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                              }`}
                            >
                              <span>{p.icon || '📄'}</span>
                              <span className="truncate">{p.title}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Merge Options Row */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200/80 dark:border-neutral-800 text-xs">
                <div className="flex items-center gap-4">
                  <span className="font-bold text-neutral-700 dark:text-neutral-300">Merge Method:</span>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="merge_mode"
                      checked={mergeMode === 'smart_merge'}
                      onChange={() => setMergeMode('smart_merge')}
                      className="text-purple-600 focus:ring-purple-500"
                    />
                    <span>Smart Merge into Headings</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="merge_mode"
                      checked={mergeMode === 'dedicated_section'}
                      onChange={() => setMergeMode('dedicated_section')}
                      className="text-purple-600 focus:ring-purple-500"
                    />
                    <span>Dedicated Guideline Section</span>
                  </label>
                </div>

                <label className="flex items-center gap-2 cursor-pointer font-medium text-neutral-700 dark:text-neutral-300">
                  <input
                    type="checkbox"
                    checked={attachPdfToDoc}
                    onChange={(e) => setAttachPdfToDoc(e.target.checked)}
                    className="rounded text-purple-600 focus:ring-purple-500"
                  />
                  <span>Attach original PDF to page</span>
                </label>
              </div>

              {/* Categorized Extracted Points Checklist */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                      Extracted Clinical Recommendations ({totalSelectedCount} Selected)
                    </span>
                  </div>
                  <span className="text-[11px] text-neutral-400">
                    Review and toggle items before applying to presentation
                  </span>
                </div>

                {SECTION_DEFINITIONS.map((def) => {
                  const items = analysisResult.sections[def.key] || [];
                  if (items.length === 0) return null;

                  const sectionChecked = selectedBullets[def.key] || {};
                  const checkedCount = Object.values(sectionChecked).filter(Boolean).length;
                  const isAllChecked = checkedCount === items.length;

                  return (
                    <div
                      key={def.key}
                      className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#202020] overflow-hidden shadow-xs"
                    >
                      <div className="px-4 py-2 bg-neutral-50 dark:bg-neutral-900/60 border-b border-neutral-200/70 dark:border-neutral-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                            {def.heading}
                          </span>
                          <span className="text-[10px] text-neutral-400 font-medium">
                            ({checkedCount}/{items.length})
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleSectionAll(def.key, !isAllChecked)}
                          className="text-[11px] text-purple-600 dark:text-purple-400 hover:underline font-medium"
                        >
                          {isAllChecked ? 'Deselect All' : 'Select All'}
                        </button>
                      </div>

                      <div className="p-3 space-y-2">
                        {items.map((item, idx) => {
                          const isChecked = !!sectionChecked[idx];
                          return (
                            <label
                              key={idx}
                              className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition text-xs leading-relaxed ${
                                isChecked
                                  ? 'bg-purple-50/40 dark:bg-purple-950/20 text-neutral-800 dark:text-neutral-200'
                                  : 'opacity-50 line-through text-neutral-400'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleBullet(def.key, idx)}
                                className="mt-0.5 rounded text-purple-600 focus:ring-purple-500"
                              />
                              <span className="flex-1">{item}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: SUCCESS CONFIRMATION SCREEN */}
          {applySuccess && (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-300 flex items-center justify-center shadow-md shadow-emerald-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="max-w-md">
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  Successfully Synced Guideline!
                </h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                  Added <strong className="text-purple-600 dark:text-purple-400">{applySuccess.count} clinical recommendations</strong> into{' '}
                  <strong className="text-neutral-900 dark:text-neutral-100">{applySuccess.docTitle}</strong>.
                </p>
                {attachPdfToDoc && (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
                    ✓ Original PDF attached to document for ongoing clinic reference.
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    router.push(`/doc/${applySuccess.docId}`);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-md transition"
                >
                  <span>Open Updated Presentation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setApplySuccess(null);
                    setAnalysisResult(null);
                    setFileDataUrl('');
                  }}
                  className="px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                >
                  Analyze Another PDF
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 border-t border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/50 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
            <span>Target: 180+ NICE CKS / RCGP GP Common Presentations</span>
          </div>

          <div className="flex items-center gap-2">
            {analysisResult && !applySuccess ? (
              <button
                type="button"
                onClick={handleApplyUpdates}
                disabled={isApplying || totalSelectedCount === 0}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-semibold transition shadow-sm"
              >
                {isApplying ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                <span>
                  Apply Updates to {activeTargetPresentation?.title || 'Presentation'} ({totalSelectedCount})
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition font-medium"
              >
                Done
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
