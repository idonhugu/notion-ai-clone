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
  Layers,
  CheckSquare,
  Square,
  FolderOpen,
} from 'lucide-react';
import { Document, AttachedFile } from '@/lib/types';
import {
  AnalyzedPresentationResult,
  MatchedConditionUpdate,
  SECTION_DEFINITIONS,
  smartMergePresentationBlocks,
  createDedicatedGuidelineSection,
  buildCompletePresentationBlocks,
  COMMON_PRESENTATIONS_PARENT_ID,
  ExtractedClinicalSections,
} from '@/lib/presentationMerger';
import { fetchDocumentById, updateDocument, createDocument } from '@/lib/api/documents';
import { useRouter } from 'next/navigation';
import { extractTextFromFileInBrowser, formatFileSize } from '@/lib/clientDocumentParser';

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

  // Input Tabs: 'upload' | 'paste' | 'workspace_doc'
  const [inputTab, setInputTab] = useState<'upload' | 'paste' | 'workspace_doc'>('upload');

  // File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileDataUrl, setFileDataUrl] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);

  // Direct Lecture Notes / Conference Transcript State
  const [pastedLectureNotes, setPastedLectureNotes] = useState<string>('');
  const [conferenceTopic, setConferenceTopic] = useState<string>('');

  // Workspace Document Selector State (e.g. Clinical Pearls Dump, One Day Essentials)
  const [workspaceDocs, setWorkspaceDocs] = useState<{ id: string; title: string; icon: string | null }[]>([]);
  const [selectedWorkspaceDocId, setSelectedWorkspaceDocId] = useState<string>('');
  const [isLoadingWorkspaceDoc, setIsLoadingWorkspaceDoc] = useState(false);

  // Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgressMessage, setAnalysisProgressMessage] = useState<string>('');
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalyzedPresentationResult | null>(null);
  const [fallbackNotice, setFallbackNotice] = useState<string | null>(null);

  // Multi-Condition Navigation & Review State
  const [activeConditionIdx, setActiveConditionIdx] = useState<number>(0);
  const [conditionBullets, setConditionBullets] = useState<
    Record<number, Record<string, Record<number, boolean>>>
  >({});
  const [targetPresentationIds, setTargetPresentationIds] = useState<Record<number, string>>({});

  // Common Presentations Catalog
  const [presentations, setPresentations] = useState<
    { id: string; title: string; icon: string | null }[]
  >([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Merge Mode & Options
  const [mergeMode, setMergeMode] = useState<'smart_merge' | 'dedicated_section'>('smart_merge');
  const [attachPdfToDoc, setAttachPdfToDoc] = useState(true);
  const [isApplying, setIsApplying] = useState(false);

  // Success States
  const [batchApplySuccess, setBatchApplySuccess] = useState<{
    results: { docId: string; docTitle: string; icon: string; count: number }[];
    totalCount: number;
  } | null>(null);

  // Load presentations catalog and workspace documents when modal opens
  useEffect(() => {
    if (!isOpen) return;

    async function loadCatalogAndDocs() {
      try {
        const [catRes, docsRes] = await Promise.all([
          fetch(`/api/documents?parent_id=${COMMON_PRESENTATIONS_PARENT_ID}`),
          fetch('/api/documents'),
        ]);

        if (catRes.ok) {
          const docs = await catRes.json();
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

        if (docsRes.ok) {
          const rootDocs = await docsRes.json();
          if (Array.isArray(rootDocs)) {
            const userPages = rootDocs.filter(
              (d: any) => !d.parent_id && d.id !== COMMON_PRESENTATIONS_PARENT_ID
            );
            setWorkspaceDocs(
              userPages.map((d: any) => ({
                id: d.id,
                title: d.title || 'Untitled',
                icon: d.icon || '📝',
              }))
            );
          }
        }
      } catch (err) {
        console.error('Failed to load catalog or workspace docs:', err);
      }
    }

    loadCatalogAndDocs();
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
      setActiveConditionIdx(0);
      setConditionBullets({});
      setTargetPresentationIds({});
      setBatchApplySuccess(null);
      setSearchFilter('');
      setPastedLectureNotes('');
      setConferenceTopic('');
      setSelectedWorkspaceDocId('');
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

  // Helper to initialize and normalize analysis result
  const setupAnalysisResult = (
    result: AnalyzedPresentationResult,
    catalog?: any[],
    fallbackNote?: string | null
  ) => {
    let conditions: MatchedConditionUpdate[] = [];
    if (Array.isArray(result.matchedConditions) && result.matchedConditions.length > 0) {
      conditions = result.matchedConditions;
    } else {
      conditions = [
        {
          presentationId: result.matchedPresentationId || null,
          presentationTitle: result.matchedPresentationTitle || 'Clinical Presentation',
          presentationIcon: result.matchedPresentationIcon || '🩺',
          confidence: result.confidence || 'high',
          matchReason: result.matchReason || 'Condition match',
          suggestedAction: result.suggestedAction || 'merge',
          sections: result.sections || ({} as ExtractedClinicalSections),
        },
      ];
    }

    // Sanitize sections for each condition
    conditions.forEach((c) => {
      const raw = c.sections || {};
      c.sections = {
        history: Array.isArray(raw.history) ? raw.history : [],
        examination: Array.isArray(raw.examination) ? raw.examination : [],
        investigations: Array.isArray(raw.investigations) ? raw.investigations : [],
        differentials: Array.isArray(raw.differentials) ? raw.differentials : [],
        rare: Array.isArray(raw.rare) ? raw.rare : [],
        plan: Array.isArray(raw.plan) ? raw.plan : [],
        safetynetting: Array.isArray(raw.safetynetting) ? raw.safetynetting : [],
        followup: Array.isArray(raw.followup) ? raw.followup : [],
        referral: Array.isArray(raw.referral) ? raw.referral : [],
        clinicalPearls: Array.isArray(raw.clinicalPearls) ? raw.clinicalPearls : [],
      };
    });

    // Count total extracted recommendations across all conditions
    const totalExtractedCount = conditions.reduce((acc, c) => {
      return (
        acc +
        SECTION_DEFINITIONS.reduce((sAcc, def) => sAcc + (c.sections[def.key]?.length || 0), 0)
      );
    }, 0);

    if (totalExtractedCount === 0) {
      const reason =
        result.lectureOverview ||
        'No clinical recommendations or conditions could be decoded from this document.';
      setAnalysisError(
        `${reason} Please paste the lecture notes or slide text directly into the "Paste Notes" tab for instant analysis.`
      );
      setAnalysisResult(null);
      return;
    }

    result.matchedConditions = conditions;
    setAnalysisResult(result);
    setFallbackNotice(fallbackNote || null);

    if (Array.isArray(catalog) && catalog.length > 0) {
      setPresentations(catalog);
    }

    // Set initial target presentations per condition and check all bullets by default
    const initialTargets: Record<number, string> = {};
    const initialBullets: Record<number, Record<string, Record<number, boolean>>> = {};

    conditions.forEach((c, cIdx) => {
      initialTargets[cIdx] = c.presentationId || '__create_new__';
      initialBullets[cIdx] = {};
      SECTION_DEFINITIONS.forEach((def) => {
        const items = c.sections[def.key] || [];
        initialBullets[cIdx][def.key] = {};
        items.forEach((_, itemIdx) => {
          initialBullets[cIdx][def.key][itemIdx] = true;
        });
      });
    });

    setTargetPresentationIds(initialTargets);
    setConditionBullets(initialBullets);
    setActiveConditionIdx(0);
  };

  const handleFileChange = async (file: File) => {
    if (!file) return;
    const lower = file.name.toLowerCase();
    const isValidDoc =
      lower.endsWith('.pdf') ||
      lower.endsWith('.docx') ||
      lower.endsWith('.doc') ||
      lower.endsWith('.txt') ||
      lower.endsWith('.md') ||
      lower.endsWith('.pptx') ||
      file.type.includes('pdf') ||
      file.type.includes('text') ||
      file.type.includes('word') ||
      file.type.includes('presentation');

    if (!isValidDoc) {
      setAnalysisError('Please upload a PDF, Word (.docx), Presentation (.pptx), Markdown, or Text file.');
      return;
    }

    setSelectedFile(file);
    setFileName(file.name);
    setFileSize(file.size);
    setAnalysisError(null);
    setAnalysisResult(null);
    setBatchApplySuccess(null);
    setIsAnalyzing(true);
    setAnalysisProgressMessage('Extracting readable text in browser...');

    try {
      // 1. Attempt client-side extraction first (safely bypasses server upload size limits for files of ANY size)
      const extraction = await extractTextFromFileInBrowser(file);

      // Case A: Selectable text was extracted client-side (works for files of ANY size: 11MB, 25MB, 50MB+)
      if (extraction.text && extraction.text.trim().length >= 10) {
        setAnalysisProgressMessage('Analyzing clinical intelligence with Claude Opus 5.5...');

        // If file is reasonably sized (<= 2.5MB), also cache dataUrl for optional PDF attachment
        if (file.size <= 2.5 * 1024 * 1024) {
          const reader = new FileReader();
          reader.onload = () => {
            setFileDataUrl(reader.result as string);
          };
          reader.readAsDataURL(file);
        } else {
          setFileDataUrl(''); // Omit giant base64 strings (>2.5MB) to protect database rows
        }

        await handleAnalyzeExtractedText(extraction.text, file.name, file.type, file.size);
        return;
      }

      // Case B: Document contains flattened slide images / scanned graphics without selectable text.
      // In-browser canvas renderer compressed slides into lightweight JPEGs (~35 KB/slide, bypassing all upload caps)
      if (extraction.images && extraction.images.length > 0) {
        setAnalysisProgressMessage(
          `Analyzing ${extraction.images.length} slide images with Multimodal AI (Claude Opus 5.5 / Gemini)...`
        );
        await handleAnalyzePdfWithImages(extraction.images, file.name, file.size);
        return;
      }

      // Case C: Fallback for smaller files under 4MB
      if (file.size < 4.0 * 1024 * 1024) {
        setAnalysisProgressMessage('Reading file buffer and sending for analysis...');
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result as string;
          setFileDataUrl(dataUrl);
          handleAnalyzePdf(dataUrl, file.name, file.size);
        };
        reader.onerror = () => {
          setAnalysisError('Failed to read the selected file.');
          setIsAnalyzing(false);
        };
        reader.readAsDataURL(file);
        return;
      }

      // Case D: If client extraction yielded neither text nor images and file is large
      setIsAnalyzing(false);
      setAnalysisError(
        `Unable to extract text or slide images from this document automatically. Please copy and paste key lecture notes, slides, or guidelines into the "Paste Notes" tab for instant analysis.`
      );
    } catch (err: any) {
      console.error('Document analysis error:', err);
      setIsAnalyzing(false);
      setAnalysisError(err?.message || 'Failed to process document.');
    }
  };

  const handleAnalyzePdfWithImages = async (
    images: string[],
    name: string,
    size: number,
    isRetry = false
  ) => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisResult(null);
    setBatchApplySuccess(null);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analyze_pdf_for_presentation',
          images,
          fileName: name,
          fileType: 'application/pdf',
          fastMode: isRetry,
        }),
      });

      if (!res.ok) {
        if (res.status === 504 && !isRetry) {
          setAnalysisProgressMessage('Switching to high-speed Gemini Flash engine to prevent timeout...');
          return handleAnalyzePdfWithImages(images, name, size, true);
        }

        let errorMsg = `Server returned ${res.status}`;
        if (res.status === 413) {
          errorMsg = `Server returned 413: Slide images exceeded size limit. Please try pasting notes or uploading a smaller set of slides.`;
        } else if (res.status === 504) {
          errorMsg = `The server took too long to analyze all slides. Please click below to paste notes or try again with fast mode.`;
        } else {
          const errJson = await res.json().catch(() => ({}));
          if (errJson.error) errorMsg = errJson.error;
          else if (res.statusText) errorMsg = `${res.status}: ${res.statusText}`;
        }
        throw new Error(errorMsg);
      }

      const data = await res.json();
      if (!data.success || !data.result) {
        throw new Error(data.error || 'AI did not return structured guideline findings.');
      }

      setupAnalysisResult(data.result, data.presentations, data.fallbackNotice);
    } catch (err: any) {
      console.error('Slide image analysis error:', err);
      setAnalysisError(err.message || 'Failed to analyze document slides. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalyzeExtractedText = async (
    text: string,
    name: string,
    fileType: string,
    size: number,
    isRetry = false
  ) => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisResult(null);
    setBatchApplySuccess(null);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analyze_pdf_for_presentation',
          prompt: text,
          fileName: name,
          fileType: fileType || 'text/plain',
          fastMode: isRetry,
        }),
      });

      if (!res.ok) {
        if (res.status === 504 && !isRetry) {
          setAnalysisProgressMessage('Switching to high-speed Gemini Flash engine to prevent timeout...');
          return handleAnalyzeExtractedText(text, name, fileType, size, true);
        }

        let errorMsg = `Server returned ${res.status}`;
        if (res.status === 413) {
          errorMsg = `Server returned 413 (Payload Too Large): Extracted text is too large for AI context. Try analyzing a section or chapter.`;
        } else if (res.status === 504) {
          errorMsg = `The server took too long to analyze this document. Please click below to paste lecture notes or try again.`;
        } else {
          const errJson = await res.json().catch(() => ({}));
          if (errJson.error) errorMsg = errJson.error;
          else if (res.statusText) errorMsg = `${res.status}: ${res.statusText}`;
        }
        throw new Error(errorMsg);
      }

      const data = await res.json();
      if (!data.success || !data.result) {
        throw new Error(data.error || 'AI did not return structured guideline findings.');
      }

      setupAnalysisResult(data.result, data.presentations, data.fallbackNotice);
    } catch (err: any) {
      console.error('Extracted text analysis error:', err);
      setAnalysisError(err.message || 'Failed to analyze document. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalyzePdf = async (dataUrl: string, name: string, size: number) => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisResult(null);
    setBatchApplySuccess(null);

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
        let errorMsg = `Server returned ${res.status}`;
        if (res.status === 413) {
          errorMsg = `Server returned 413 (Payload Too Large): The file is too large for direct upload (${formatFileSize(size)}). Please paste the lecture notes or use an OCR text version.`;
        } else {
          const errJson = await res.json().catch(() => ({}));
          if (errJson.error) errorMsg = errJson.error;
          else if (res.statusText) errorMsg = `${res.status}: ${res.statusText}`;
        }
        throw new Error(errorMsg);
      }

      const data = await res.json();
      if (!data.success || !data.result) {
        throw new Error(data.error || 'AI did not return structured guideline findings.');
      }

      setupAnalysisResult(data.result, data.presentations, data.fallbackNotice);
    } catch (err: any) {
      console.error('PDF Analysis error:', err);
      setAnalysisError(err.message || 'Failed to analyze PDF. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalyzePastedNotes = async () => {
    if (!pastedLectureNotes || pastedLectureNotes.trim().length < 25) {
      setAnalysisError('Please paste at least 25 characters of lecture notes, slides, or transcript text.');
      return;
    }

    const docName = conferenceTopic.trim() || 'Conference Lecture Notes & Transcript';
    setFileName(docName);
    setFileSize(pastedLectureNotes.length);
    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisResult(null);
    setBatchApplySuccess(null);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analyze_pdf_for_presentation',
          prompt: pastedLectureNotes,
          fileName: docName,
          fileType: 'text/plain',
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Server returned ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      if (!data.success || !data.result) {
        throw new Error(data.error || 'AI did not return structured clinical findings.');
      }

      setupAnalysisResult(data.result, data.presentations, data.fallbackNotice);
    } catch (err: any) {
      console.error('Lecture notes analysis error:', err);
      setAnalysisError(err.message || 'Failed to analyze lecture text. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalyzeWorkspaceDoc = async () => {
    if (!selectedWorkspaceDocId) return;
    setIsLoadingWorkspaceDoc(true);
    setAnalysisError(null);

    try {
      const { document: doc } = await fetchDocumentById(selectedWorkspaceDocId);
      if (!doc || !doc.content) {
        throw new Error('Could not read content from selected document.');
      }

      const blocks = Array.isArray(doc.content) ? doc.content : [];
      const extractedText = blocks
        .map((b: any) => {
          const text = (b.content || []).map((c: any) => c.text || '').join('');
          if (b.type === 'heading') return `\n## ${text}\n`;
          if (b.type === 'bulletListItem') return `- ${text}`;
          if (b.type === 'checkListItem') return `- [ ] ${text}`;
          return text;
        })
        .filter(Boolean)
        .join('\n');

      if (extractedText.trim().length < 25) {
        throw new Error('The selected document contains very little or empty text.');
      }

      const docName = doc.title || 'Workspace Notes';
      setFileName(docName);
      setFileSize(extractedText.length);
      setIsAnalyzing(true);
      setAnalysisResult(null);
      setBatchApplySuccess(null);

      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analyze_pdf_for_presentation',
          prompt: extractedText,
          fileName: docName,
          fileType: 'text/markdown',
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Server returned ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      if (!data.success || !data.result) {
        throw new Error(data.error || 'AI did not return structured clinical findings.');
      }

      setupAnalysisResult(data.result, data.presentations, data.fallbackNotice);
    } catch (err: any) {
      console.error('Workspace doc analysis error:', err);
      setAnalysisError(err.message || 'Failed to analyze workspace document.');
    } finally {
      setIsLoadingWorkspaceDoc(false);
      setIsAnalyzing(false);
    }
  };

  const toggleBullet = (cIdx: number, sectionKey: string, bulletIdx: number) => {
    setConditionBullets((prev) => {
      const curCond = prev[cIdx] || {};
      const curSection = curCond[sectionKey] || {};
      return {
        ...prev,
        [cIdx]: {
          ...curCond,
          [sectionKey]: {
            ...curSection,
            [bulletIdx]: !curSection[bulletIdx],
          },
        },
      };
    });
  };

  const toggleSectionAll = (cIdx: number, sectionKey: string, selectAll: boolean) => {
    if (!analysisResult?.matchedConditions?.[cIdx]) return;
    const items = analysisResult.matchedConditions[cIdx].sections[sectionKey as keyof ExtractedClinicalSections] || [];
    const sectionState: Record<number, boolean> = {};
    items.forEach((_, idx) => {
      sectionState[idx] = selectAll;
    });

    setConditionBullets((prev) => ({
      ...prev,
      [cIdx]: {
        ...(prev[cIdx] || {}),
        [sectionKey]: sectionState,
      },
    }));
  };

  // Filtered presentations list for search
  const filteredPresentations = useMemo(() => {
    if (!searchFilter.trim()) return presentations;
    const query = searchFilter.toLowerCase().trim();
    return presentations.filter((p) => p.title.toLowerCase().includes(query));
  }, [presentations, searchFilter]);

  // Active condition object
  const activeCondition = useMemo(() => {
    if (!analysisResult?.matchedConditions || analysisResult.matchedConditions.length === 0) {
      return null;
    }
    return analysisResult.matchedConditions[activeConditionIdx] || analysisResult.matchedConditions[0];
  }, [analysisResult, activeConditionIdx]);

  // Active target presentation object for the selected condition
  const activeTargetPresentation = useMemo(() => {
    if (!activeCondition) return null;
    const targetId = targetPresentationIds[activeConditionIdx];
    if (targetId === '__create_new__') {
      return {
        id: '__create_new__',
        title: activeCondition.presentationTitle || 'New Clinical Presentation',
        icon: activeCondition.presentationIcon || '🩺',
      };
    }
    return presentations.find((p) => p.id === targetId) || {
      id: targetId || '__create_new__',
      title: activeCondition.presentationTitle,
      icon: activeCondition.presentationIcon || '🩺',
    };
  }, [activeCondition, targetPresentationIds, activeConditionIdx, presentations]);

  // Count selected items for current condition
  const activeConditionSelectedCount = useMemo(() => {
    const curMap = conditionBullets[activeConditionIdx] || {};
    let count = 0;
    Object.values(curMap).forEach((section) => {
      Object.values(section).forEach((checked) => {
        if (checked) count++;
      });
    });
    return count;
  }, [conditionBullets, activeConditionIdx]);

  // Count grand total selected items across all matched conditions
  const grandTotalSelectedCount = useMemo(() => {
    let count = 0;
    Object.values(conditionBullets).forEach((condMap) => {
      Object.values(condMap).forEach((section) => {
        Object.values(section).forEach((checked) => {
          if (checked) count++;
        });
      });
    });
    return count;
  }, [conditionBullets]);

  // Apply updates (single condition or batch sync all matched conditions)
  const handleApplyUpdates = async (singleConditionOnly = false) => {
    if (!analysisResult || grandTotalSelectedCount === 0 || isApplying) return;

    const conditionsToSync = singleConditionOnly && activeCondition
      ? [{ cond: activeCondition, idx: activeConditionIdx }]
      : (analysisResult.matchedConditions || []).map((cond, idx) => ({ cond, idx }));

    setIsApplying(true);
    setAnalysisError(null);

    const successfulSyncs: { docId: string; docTitle: string; icon: string; count: number }[] = [];
    let totalCountMerged = 0;

    try {
      const guidelineBadge = analysisResult.issuingAuthority
        ? analysisResult.issuingAuthority.replace(/\s+/g, ' ').trim()
        : 'Guideline Update';

      // Prepare attached file object if user opted to attach PDF
      const newAttachedFile: AttachedFile | null =
        attachPdfToDoc && (fileDataUrl || fileName)
          ? {
              id: `pdf_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
              name: fileName || 'Clinical_Guideline.pdf',
              size: fileSize,
              type: 'application/pdf',
              url: fileSize <= 2.5 * 1024 * 1024 ? fileDataUrl || '' : '',
              uploadedAt: new Date().toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              }),
            }
          : null;

      for (const { cond, idx } of conditionsToSync) {
        const conditionChecked = conditionBullets[idx] || {};
        const filteredSections: Partial<ExtractedClinicalSections> = {};
        let conditionItemCount = 0;

        SECTION_DEFINITIONS.forEach((def) => {
          const rawItems = cond.sections[def.key] || [];
          const checkedMap = conditionChecked[def.key] || {};
          const chosen = rawItems.filter((_, itemIdx) => checkedMap[itemIdx]);
          if (chosen.length > 0) {
            filteredSections[def.key] = chosen;
            conditionItemCount += chosen.length;
          }
        });

        if (conditionItemCount === 0) continue;

        const targetId = targetPresentationIds[idx] || cond.presentationId;

        // CASE A: Create a brand new common presentation document
        if (targetId === '__create_new__' || !targetId) {
          const newTitle = cond.presentationTitle || 'New Presentation';
          const newIcon = cond.presentationIcon || '🩺';
          const initialBlocks = buildCompletePresentationBlocks(
            newTitle,
            filteredSections as ExtractedClinicalSections,
            `${analysisResult.guidelineTitle} (${analysisResult.issuingAuthority})`
          );

          const created = await createDocument({
            title: newTitle,
            icon: newIcon,
            parent_id: COMMON_PRESENTATIONS_PARENT_ID,
            content: initialBlocks,
            attachments: newAttachedFile ? [newAttachedFile] : [],
            is_favorite: false,
            is_archived: false,
          });

          if (created && created.id) {
            successfulSyncs.push({
              docId: created.id,
              docTitle: newTitle,
              icon: newIcon,
              count: conditionItemCount,
            });
            totalCountMerged += conditionItemCount;
            if (onPresentationUpdated) {
              onPresentationUpdated(created.id, newTitle);
            }
          }
        } else {
          // CASE B: Smart merge into an existing common presentation document
          const { document: targetDoc } = await fetchDocumentById(targetId);
          if (targetDoc) {
            const existingBlocks = Array.isArray(targetDoc.content) ? targetDoc.content : [];
            let updatedBlocks: any[];

            if (mergeMode === 'smart_merge') {
              updatedBlocks = smartMergePresentationBlocks(
                existingBlocks,
                filteredSections,
                guidelineBadge
              );
            } else {
              updatedBlocks = createDedicatedGuidelineSection(
                existingBlocks,
                analysisResult.guidelineTitle,
                analysisResult.issuingAuthority,
                filteredSections
              );
            }

            const existingAttachments = Array.isArray(targetDoc.attachments) ? targetDoc.attachments : [];
            const updatedAttachments = newAttachedFile
              ? [...existingAttachments.filter((a) => a.name !== newAttachedFile.name), newAttachedFile]
              : existingAttachments;

            const updated = await updateDocument(targetId, {
              content: updatedBlocks,
              attachments: updatedAttachments,
              updated_at: new Date().toISOString(),
            });

            if (updated) {
              successfulSyncs.push({
                docId: targetId,
                docTitle: targetDoc.title || 'Presentation',
                icon: targetDoc.icon || '🩺',
                count: conditionItemCount,
              });
              totalCountMerged += conditionItemCount;
              if (onPresentationUpdated) {
                onPresentationUpdated(targetId, targetDoc.title || 'Presentation');
              }
            }
          }
        }
      }

      if (successfulSyncs.length === 0) {
        throw new Error('No items were selected or saved to presentations.');
      }

      setBatchApplySuccess({
        results: successfulSyncs,
        totalCount: totalCountMerged,
      });
    } catch (err: any) {
      console.error('Error applying updates to presentations:', err);
      setAnalysisError(err.message || 'Failed to update presentations.');
    } finally {
      setIsApplying(false);
    }
  };

  if (!isOpen) return null;

  const matchedConditions = analysisResult?.matchedConditions || [];
  const isMultiCondition = matchedConditions.length > 1;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
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
                  Guidelines & Conference Intelligence Analyzer
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-700/60">
                  GP Common Presentations Sync
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Analyze clinical guidelines, lecture slides, or CPD transcripts and map recommendations directly under the relevant condition headings.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition cursor-pointer"
            title="Close (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* STEP 1: Input Selectors (Upload Document, Paste Lecture Notes, or Pick Workspace Page) */}
          {!analysisResult && !isAnalyzing && (
            <div className="space-y-4">
              {/* Tab Selector: Upload vs Paste vs Workspace Doc */}
              <div className="flex flex-wrap items-center gap-1.5 border-b border-neutral-200/80 dark:border-neutral-800 pb-2">
                <button
                  type="button"
                  onClick={() => setInputTab('upload')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    inputTab === 'upload'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Upload Document (PDF / Word / Slides)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setInputTab('paste')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    inputTab === 'paste'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Paste Lecture Notes / Transcript</span>
                </button>

                <button
                  type="button"
                  onClick={() => setInputTab('workspace_doc')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    inputTab === 'workspace_doc'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>Select Workspace Page / Notes</span>
                </button>
              </div>

              {/* TAB A: UPLOAD FILE */}
              {inputTab === 'upload' && (
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
                    Select or Drop Clinical Document / Conference PDF Here
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-md">
                    Upload medical PDFs, Word documents (.docx), presentation slides (.pptx), or lecture notes (e.g. RCGP One Day Essentials, NICE guidelines, hospital trust pathways).
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-sm transition">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Browse Document File</span>
                  </span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.doc,.txt,.md,.pptx,application/pdf"
                    onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                    className="hidden"
                  />
                </div>
              )}

              {/* TAB B: PASTE LECTURE NOTES */}
              {inputTab === 'paste' && (
                <div className="space-y-3.5 p-4 rounded-2xl bg-neutral-50/60 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                      Conference / Lecture Topic & Speaker (Optional):
                    </label>
                    <input
                      type="text"
                      value={conferenceTopic}
                      onChange={(e) => setConferenceTopic(e.target.value)}
                      placeholder="e.g. RCGP One Day Essentials: Dermatology - Acne, Rosacea, Eczema, Psoriasis"
                      className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-[#202020] border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                        Paste Lecture Notes, Slides, or Conference Transcript:
                      </label>
                      <span className="text-[11px] text-neutral-400">
                        {pastedLectureNotes.length} characters
                      </span>
                    </div>
                    <textarea
                      rows={9}
                      value={pastedLectureNotes}
                      onChange={(e) => setPastedLectureNotes(e.target.value)}
                      placeholder="Paste conference lecture notes, slides text, Zoom transcripts, CPD seminar notes, or clinical guidelines here... AI will detect all conditions discussed and extract points into each condition's headings."
                      className="w-full p-3 rounded-xl text-xs font-sans leading-relaxed bg-white dark:bg-[#202020] border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="text-[11px] text-neutral-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                      <span>Detects all covered conditions and maps to your GP Common Presentations</span>
                    </div>

                    <button
                      type="button"
                      onClick={handleAnalyzePastedNotes}
                      disabled={pastedLectureNotes.trim().length < 25}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white text-xs font-semibold transition shadow-sm cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Analyze Conference Intelligence</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB C: SELECT EXISTING WORKSPACE PAGE */}
              {inputTab === 'workspace_doc' && (
                <div className="space-y-4 p-5 rounded-2xl bg-neutral-50/60 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800">
                  <div>
                    <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1">
                      Select Existing Notes / Lecture Page in Your Workspace:
                    </label>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mb-3">
                      Have a raw dump of conference notes, CPD learnings, or lecture notes written in a workspace page (such as Clinical Pearls Dump or One Day Essentials)? Select it below to analyze and distribute all points into the relevant condition headings!
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto p-1">
                      {workspaceDocs.map((doc) => {
                        const isSelected = selectedWorkspaceDocId === doc.id;
                        return (
                          <button
                            key={doc.id}
                            type="button"
                            onClick={() => setSelectedWorkspaceDocId(doc.id)}
                            className={`flex items-center gap-2.5 p-3 rounded-xl border text-left text-xs transition cursor-pointer ${
                              isSelected
                                ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-400 dark:border-purple-600 text-purple-900 dark:text-purple-200 ring-1 ring-purple-400'
                                : 'bg-white dark:bg-[#202020] border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 hover:border-purple-300'
                            }`}
                          >
                            <span className="text-lg shrink-0">{doc.icon || '📄'}</span>
                            <span className="font-semibold truncate">{doc.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-neutral-200/70 dark:border-neutral-800">
                    <span className="text-[11px] text-neutral-400">
                      {selectedWorkspaceDocId ? 'Ready to analyze selected page' : 'Select a page above to proceed'}
                    </span>

                    <button
                      type="button"
                      onClick={handleAnalyzeWorkspaceDoc}
                      disabled={!selectedWorkspaceDocId || isLoadingWorkspaceDoc}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white text-xs font-semibold transition shadow-sm cursor-pointer"
                    >
                      {isLoadingWorkspaceDoc ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Reading Page Notes...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Analyze Page & Distribute into Common Presentations</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Explanatory banner */}
              <div className="p-4 rounded-xl bg-neutral-100/70 dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-700/60 text-xs text-neutral-600 dark:text-neutral-300">
                <span className="font-bold text-neutral-800 dark:text-neutral-200 block mb-1">
                  💡 How this maps to your GP Common Presentations:
                </span>
                <ul className="list-disc pl-4 space-y-1 text-neutral-500 dark:text-neutral-400">
                  <li>AI identifies all conditions discussed across the conference slides or guidelines.</li>
                  <li>Groups points under the exact condition headings: 📋 History, 🩺 Examination, 🔬 Investigations, 💊 Plan, 💡 Clinical Pearls, etc.</li>
                  <li>Seamlessly merges into each matching condition page under GP Common Presentations without erasing any existing notes!</li>
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
                  {analysisProgressMessage || `Analyzing ${fileName}...`}
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  Identifying all covered conditions, mapping to 180+ Common Presentations, and sorting intelligence under condition headings...
                </p>
              </div>
            </div>
          )}

          {/* ERROR ALERT */}
          {analysisError && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200 flex items-start gap-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600 mt-0.5" />
              <div className="flex-1 space-y-2">
                <div>
                  <span className="font-bold">Notice: </span>
                  <span>{analysisError}</span>
                </div>
                {inputTab === 'upload' && (
                  <button
                    type="button"
                    onClick={() => {
                      setInputTab('paste');
                      setAnalysisError(null);
                    }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-semibold transition cursor-pointer"
                  >
                    <FileText className="w-3 h-3" />
                    <span>Switch to Paste Lecture Notes</span>
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => setAnalysisError(null)}
                className="text-rose-500 hover:text-rose-700 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* STEP 2: REVIEW & MERGE SCREEN */}
          {analysisResult && !batchApplySuccess && activeCondition && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {fallbackNotice && (
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2.5 shadow-2xs">
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span className="font-medium">{fallbackNotice}</span>
                </div>
              )}

              {/* Guideline Header Card */}
              <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-800/80 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-900 dark:text-purple-300">
                      Document Source:
                    </span>
                    <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
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
                      setSelectedWorkspaceDocId('');
                    }}
                    className="self-end sm:self-auto text-[11px] text-purple-700 dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Upload or Pick Different Document</span>
                  </button>
                </div>

                {analysisResult.lectureOverview && (
                  <p className="text-xs text-neutral-600 dark:text-neutral-300 italic pt-1 border-t border-purple-200/60 dark:border-purple-800/60">
                    "{analysisResult.lectureOverview}"
                  </p>
                )}
              </div>

              {/* MULTI-CONDITION SELECTOR TABS */}
              {isMultiCondition && (
                <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-purple-600" />
                      <span>{matchedConditions.length} Common Presentations Detected in Document</span>
                    </span>
                    <span className="text-[11px] text-neutral-400">
                      Click a condition to view recommendations & select items:
                    </span>
                  </div>

                  <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                    {matchedConditions.map((cond, idx) => {
                      const isActive = activeConditionIdx === idx;
                      // Compute total items for this condition
                      const totalItemsForCond = SECTION_DEFINITIONS.reduce((acc, def) => {
                        return acc + (cond.sections[def.key]?.length || 0);
                      }, 0);

                      const checkedMap = conditionBullets[idx] || {};
                      const checkedItemsForCond = Object.values(checkedMap).reduce((acc, sec) => {
                        return acc + Object.values(sec).filter(Boolean).length;
                      }, 0);

                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveConditionIdx(idx)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                            isActive
                              ? 'bg-purple-600 text-white shadow-xs ring-2 ring-purple-300 dark:ring-purple-800'
                              : 'bg-white dark:bg-[#222] border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                          }`}
                        >
                          <span className="text-base">{cond.presentationIcon || '🩺'}</span>
                          <span>{cond.presentationTitle}</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                              isActive
                                ? 'bg-purple-800 text-purple-200'
                                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'
                            }`}
                          >
                            {checkedItemsForCond}/{totalItemsForCond}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TARGET PRESENTATION MAPPING CARD FOR ACTIVE CONDITION */}
              <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#202020] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                        Condition: {activeCondition.presentationTitle}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                          activeCondition.confidence === 'high'
                            ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300'
                            : 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300'
                        }`}
                      >
                        {(activeCondition.confidence || 'high').toUpperCase()} MATCH
                      </span>
                    </div>
                    {activeCondition.matchReason && (
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 italic">
                        "{activeCondition.matchReason}"
                      </p>
                    )}
                  </div>

                  {/* Target Presentation Dropdown */}
                  <div className="relative flex-shrink-0">
                    <span className="text-[10px] font-bold text-neutral-400 block mb-1">
                      Target Presentation in Catalog:
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-[#252525] border border-neutral-300 dark:border-neutral-700 text-xs font-semibold text-neutral-900 dark:text-neutral-100 shadow-xs hover:border-purple-400 transition cursor-pointer"
                    >
                      <span className="text-base">{activeTargetPresentation?.icon || '🩺'}</span>
                      <span className="max-w-[190px] truncate">{activeTargetPresentation?.title}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-neutral-400 ml-1" />
                    </button>

                    {isDropdownOpen && (
                      <div className="absolute right-0 top-14 z-50 w-80 bg-white dark:bg-[#222] rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-2 space-y-2 animate-in fade-in duration-100">
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
                              setTargetPresentationIds((prev) => ({
                                ...prev,
                                [activeConditionIdx]: '__create_new__',
                              }));
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-left transition font-semibold cursor-pointer ${
                              targetPresentationIds[activeConditionIdx] === '__create_new__'
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
                                setTargetPresentationIds((prev) => ({
                                  ...prev,
                                  [activeConditionIdx]: p.id,
                                }));
                                setIsDropdownOpen(false);
                              }}
                              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-left transition cursor-pointer ${
                                targetPresentationIds[activeConditionIdx] === p.id
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
                    <span>Smart Merge into Headings (History, Examination, Plan, etc.)</span>
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

                {fileDataUrl && (
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-neutral-700 dark:text-neutral-300">
                    <input
                      type="checkbox"
                      checked={attachPdfToDoc}
                      onChange={(e) => setAttachPdfToDoc(e.target.checked)}
                      className="rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span>Attach original PDF to page</span>
                  </label>
                )}
              </div>

              {/* EXTRACTED RECOMMENDATIONS UNDER CONDITION HEADINGS */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Condition Headings & Recommendations ({activeConditionSelectedCount} Selected)
                  </span>
                  <span className="text-[11px] text-neutral-400">
                    Review and toggle items before applying to {activeTargetPresentation?.title}
                  </span>
                </div>

                {SECTION_DEFINITIONS.map((def) => {
                  const items = activeCondition.sections[def.key] || [];
                  if (items.length === 0) return null;

                  const sectionChecked = (conditionBullets[activeConditionIdx] || {})[def.key] || {};
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
                          onClick={() => toggleSectionAll(activeConditionIdx, def.key, !isAllChecked)}
                          className="text-[11px] text-purple-600 dark:text-purple-400 hover:underline font-medium cursor-pointer"
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
                                onChange={() => toggleBullet(activeConditionIdx, def.key, idx)}
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
          {batchApplySuccess && (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-300 flex items-center justify-center shadow-md shadow-emerald-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="max-w-md space-y-1">
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  Successfully Synced to GP Common Presentations!
                </h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  Merged <strong className="text-purple-600 dark:text-purple-400">{batchApplySuccess.totalCount} recommendations</strong> across{' '}
                  <strong className="text-neutral-900 dark:text-neutral-100">{batchApplySuccess.results.length} presentations</strong> under their respective headings.
                </p>
              </div>

              {/* List of updated presentations */}
              <div className="w-full max-w-lg space-y-2 text-left pt-2">
                {batchApplySuccess.results.map((res, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{res.icon}</span>
                      <span className="font-bold text-neutral-900 dark:text-neutral-100">
                        {res.docTitle}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 font-semibold">
                        +{res.count} items
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        router.push(`/doc/${res.docId}`);
                      }}
                      className="flex items-center gap-1 text-[11px] font-semibold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                    >
                      <span>Open Presentation</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    router.push(`/doc/${COMMON_PRESENTATIONS_PARENT_ID}`);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-md transition cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Open GP Common Presentations Master Page</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setBatchApplySuccess(null);
                    setAnalysisResult(null);
                    setFileDataUrl('');
                    setSelectedWorkspaceDocId('');
                  }}
                  className="px-3.5 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer"
                >
                  Analyze Another Document / Lecture
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 border-t border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/50 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
            <span>Target: GP Common Presentations (180+ NICE CKS / RCGP Presentations)</span>
          </div>

          <div className="flex items-center gap-2">
            {analysisResult && !batchApplySuccess ? (
              <>
                {isMultiCondition && (
                  <button
                    type="button"
                    onClick={() => handleApplyUpdates(true)}
                    disabled={isApplying || activeConditionSelectedCount === 0}
                    className="px-3 py-1.5 rounded-xl border border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-xs font-semibold transition cursor-pointer disabled:opacity-40"
                    title={`Sync only ${activeCondition?.presentationTitle}`}
                  >
                    Sync Current ({activeCondition?.presentationTitle})
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleApplyUpdates(false)}
                  disabled={isApplying || grandTotalSelectedCount === 0}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-semibold transition shadow-sm cursor-pointer"
                >
                  {isApplying ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {isMultiCondition
                      ? `Sync All Matched Conditions (${grandTotalSelectedCount} items across ${matchedConditions.length} presentations)`
                      : `Apply Updates to ${activeTargetPresentation?.title || 'Presentation'} (${activeConditionSelectedCount})`}
                  </span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition font-medium cursor-pointer"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
