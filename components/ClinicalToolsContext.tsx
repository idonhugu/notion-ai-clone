'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { AttachedFile } from '@/lib/types';
import { ClinicalEvidenceModal } from './ClinicalEvidenceModal';
import { StockleysModal } from './StockleysModal';
import { PdfGuidelineModal } from './PdfGuidelineModal';
import { DermEvidenceModal } from './DermEvidenceModal';
import { AccurxModal } from './AccurxModal';
import { ShortcutsModal } from './ShortcutsModal';
import { ErrorBoundary } from './ErrorBoundary';

export interface ClinicalDocContext {
  id?: string;
  title?: string;
  contentMarkdown?: string;
}

interface ClinicalToolsContextValue {
  // Modal states
  isEvidenceOpen: boolean;
  isInteractionsOpen: boolean;
  isPdfGuidelineOpen: boolean;
  isDermEvidenceOpen: boolean;
  isAccurxOpen: boolean;
  isShortcutsOpen: boolean;

  // Triggers
  openEvidence: () => void;
  closeEvidence: () => void;
  openInteractions: () => void;
  closeInteractions: () => void;
  openPdfGuideline: (preloadedFile?: AttachedFile | null) => void;
  closePdfGuideline: () => void;
  openDermEvidence: () => void;
  closeDermEvidence: () => void;
  openAccurx: () => void;
  closeAccurx: () => void;
  openShortcuts: () => void;
  closeShortcuts: () => void;

  // Active doc context
  activeDocContext: ClinicalDocContext;
  setActiveDocContext: (ctx: ClinicalDocContext) => void;

  // Insert markdown into active editor
  insertIntoActiveDoc: (markdown: string) => void;
}

const ClinicalToolsContext = createContext<ClinicalToolsContextValue | null>(null);

export function useClinicalTools() {
  const ctx = useContext(ClinicalToolsContext);
  if (!ctx) {
    throw new Error('useClinicalTools must be used within ClinicalToolsProvider');
  }
  return ctx;
}

export function ClinicalToolsProvider({
  children,
  initialDocContext,
}: {
  children: ReactNode;
  initialDocContext?: ClinicalDocContext;
}) {
  const router = useRouter();

  const [isEvidenceOpen, setIsEvidenceOpen] = useState(false);
  const [isInteractionsOpen, setIsInteractionsOpen] = useState(false);
  const [isPdfGuidelineOpen, setIsPdfGuidelineOpen] = useState(false);
  const [preloadedPdfFile, setPreloadedPdfFile] = useState<AttachedFile | null>(null);
  const [isDermEvidenceOpen, setIsDermEvidenceOpen] = useState(false);
  const [isAccurxOpen, setIsAccurxOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  const [activeDocContext, setActiveDocContext] = useState<ClinicalDocContext>(
    initialDocContext || { title: 'Untitled', contentMarkdown: '' }
  );

  // Sync initial context if prop updates
  useEffect(() => {
    if (initialDocContext?.id && initialDocContext.id !== activeDocContext.id) {
      setActiveDocContext(initialDocContext);
    }
  }, [initialDocContext]);

  // Modal open / close handlers
  const openEvidence = useCallback(() => setIsEvidenceOpen(true), []);
  const closeEvidence = useCallback(() => setIsEvidenceOpen(false), []);

  const openInteractions = useCallback(() => setIsInteractionsOpen(true), []);
  const closeInteractions = useCallback(() => setIsInteractionsOpen(false), []);

  const openPdfGuideline = useCallback((file?: AttachedFile | null) => {
    setPreloadedPdfFile(file || null);
    setIsPdfGuidelineOpen(true);
  }, []);
  const closePdfGuideline = useCallback(() => {
    setIsPdfGuidelineOpen(false);
    setPreloadedPdfFile(null);
  }, []);

  const openDermEvidence = useCallback(() => setIsDermEvidenceOpen(true), []);
  const closeDermEvidence = useCallback(() => setIsDermEvidenceOpen(false), []);

  const openAccurx = useCallback(() => setIsAccurxOpen(true), []);
  const closeAccurx = useCallback(() => setIsAccurxOpen(false), []);

  const openShortcuts = useCallback(() => setIsShortcutsOpen(true), []);
  const closeShortcuts = useCallback(() => setIsShortcutsOpen(false), []);

  // Insert markdown into active editor page
  const insertIntoActiveDoc = useCallback((markdown: string) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('notion:insert_markdown', {
          detail: { markdown },
        })
      );
    }
  }, []);

  // 1. Global Keyboard Shortcuts & Window Event Listeners
  useEffect(() => {
    const handleGlobalShortcuts = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;

      if (isCmdOrCtrl && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        setIsEvidenceOpen((prev) => !prev);
      } else if (isCmdOrCtrl && e.key.toLowerCase() === 'i') {
        e.preventDefault();
        setIsInteractionsOpen((prev) => !prev);
      } else if (isCmdOrCtrl && e.key.toLowerCase() === 'u') {
        e.preventDefault();
        setPreloadedPdfFile(null);
        setIsPdfGuidelineOpen((prev) => !prev);
      } else if (isCmdOrCtrl && e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        setIsDermEvidenceOpen((prev) => !prev);
      } else if (
        isCmdOrCtrl &&
        e.shiftKey &&
        (e.key.toLowerCase() === 'a' || e.key.toLowerCase() === 's')
      ) {
        e.preventDefault();
        setIsAccurxOpen((prev) => !prev);
      } else if (isCmdOrCtrl && e.key === '/') {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
      }
    };

    const handleOpenEvidenceEvent = () => setIsEvidenceOpen(true);
    const handleOpenInteractionsEvent = () => setIsInteractionsOpen(true);
    const handleOpenPdfGuidelineEvent = (e: Event) => {
      const custom = e as CustomEvent<AttachedFile | undefined>;
      setPreloadedPdfFile(custom?.detail || null);
      setIsPdfGuidelineOpen(true);
    };
    const handleOpenDermEvent = () => setIsDermEvidenceOpen(true);
    const handleOpenAccurxEvent = () => setIsAccurxOpen(true);
    const handleOpenShortcutsEvent = () => setIsShortcutsOpen(true);

    const handleActiveDocChanged = (e: Event) => {
      const custom = e as CustomEvent<ClinicalDocContext>;
      if (custom?.detail) {
        setActiveDocContext(custom.detail);
      }
    };

    window.addEventListener('keydown', handleGlobalShortcuts);
    window.addEventListener('notion:open_evidence_modal', handleOpenEvidenceEvent);
    window.addEventListener('notion:open_stockleys_modal', handleOpenInteractionsEvent);
    window.addEventListener('notion:open_pdf_guideline_modal', handleOpenPdfGuidelineEvent);
    window.addEventListener('notion:open_derm_evidence_modal', handleOpenDermEvent);
    window.addEventListener('notion:open_accurx_modal', handleOpenAccurxEvent);
    window.addEventListener('notion:open_shortcuts_modal', handleOpenShortcutsEvent);
    window.addEventListener('notion:active_doc_changed', handleActiveDocChanged);

    return () => {
      window.removeEventListener('keydown', handleGlobalShortcuts);
      window.removeEventListener('notion:open_evidence_modal', handleOpenEvidenceEvent);
      window.removeEventListener('notion:open_stockleys_modal', handleOpenInteractionsEvent);
      window.removeEventListener('notion:open_pdf_guideline_modal', handleOpenPdfGuidelineEvent);
      window.removeEventListener('notion:open_derm_evidence_modal', handleOpenDermEvent);
      window.removeEventListener('notion:open_accurx_modal', handleOpenAccurxEvent);
      window.removeEventListener('notion:open_shortcuts_modal', handleOpenShortcutsEvent);
      window.removeEventListener('notion:active_doc_changed', handleActiveDocChanged);
    };
  }, []);

  // 2. Universal Native Link Click Capture
  // Guarantees all links (internal /doc/... or external https://...) are 100% clickable,
  // executing in the native DOM capture phase before ProseMirror or BlockNote intercepts them.
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target?.closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href || href === '#' || href.startsWith('javascript:')) return;

      // Internal clinical doc link (/doc/[id])
      if (href.startsWith('/doc/')) {
        e.preventDefault();
        e.stopPropagation();
        router.push(href);
        return;
      }

      // External web links (NHS Leaflets, NICE Guidelines, CKS, BNF)
      if (href.startsWith('http://') || href.startsWith('https://')) {
        e.preventDefault();
        e.stopPropagation();
        window.open(href, '_blank', 'noopener,noreferrer');
        return;
      }
    };

    // Attach in capture phase (true) so it runs before any editor DOM handler
    document.addEventListener('click', handleDocumentClick, true);

    return () => {
      document.removeEventListener('click', handleDocumentClick, true);
    };
  }, [router]);

  return (
    <ClinicalToolsContext.Provider
      value={{
        isEvidenceOpen,
        isInteractionsOpen,
        isPdfGuidelineOpen,
        isDermEvidenceOpen,
        isAccurxOpen,
        isShortcutsOpen,
        openEvidence,
        closeEvidence,
        openInteractions,
        closeInteractions,
        openPdfGuideline,
        closePdfGuideline,
        openDermEvidence,
        closeDermEvidence,
        openAccurx,
        closeAccurx,
        openShortcuts,
        closeShortcuts,
        activeDocContext,
        setActiveDocContext,
        insertIntoActiveDoc,
      }}
    >
      {children}

      {/* Global Modals rendered at root workspace level */}
      {/* Keyboard Shortcuts Cheat Sheet Modal */}
      <ShortcutsModal isOpen={isShortcutsOpen} onClose={closeShortcuts} />

      {/* Heidi Clinical Evidence Decision Support & Calculators Modal */}
      <ErrorBoundary fallbackTitle="Clinical Evidence Support Error">
        <ClinicalEvidenceModal
          isOpen={isEvidenceOpen}
          onClose={closeEvidence}
          currentDocId={activeDocContext.id}
          currentDocTitle={activeDocContext.title}
          currentDocContext={activeDocContext.contentMarkdown}
          onInsertIntoPage={insertIntoActiveDoc}
        />
      </ErrorBoundary>

      {/* Stockley's Drug Interactions Checker Modal */}
      <ErrorBoundary fallbackTitle="Stockley's Interactions Checker Error">
        <StockleysModal
          isOpen={isInteractionsOpen}
          onClose={closeInteractions}
          currentDocId={activeDocContext.id}
          currentDocTitle={activeDocContext.title}
          currentDocContext={activeDocContext.contentMarkdown}
          onInsertIntoPage={insertIntoActiveDoc}
        />
      </ErrorBoundary>

      {/* PDF Guideline Sync & Common Presentations Analyzer Modal */}
      <ErrorBoundary fallbackTitle="PDF Guideline & Conference Sync Error">
        <PdfGuidelineModal
          isOpen={isPdfGuidelineOpen}
          onClose={closePdfGuideline}
          preloadedFile={preloadedPdfFile}
          onPresentationUpdated={(id) => {
            if (id) {
              window.dispatchEvent(new CustomEvent('notion:force_doc_sync', { detail: { id } }));
            }
          }}
        />
      </ErrorBoundary>

      {/* Derm Evidence & Lesion Photo Analyzer Modal */}
      <ErrorBoundary fallbackTitle="Derm Evidence Support Error">
        <DermEvidenceModal
          isOpen={isDermEvidenceOpen}
          onClose={closeDermEvidence}
          currentDocId={activeDocContext.id}
          currentDocTitle={activeDocContext.title}
          currentDocContext={activeDocContext.contentMarkdown}
          onInsertIntoPage={insertIntoActiveDoc}
        />
      </ErrorBoundary>

      {/* Accurx / SMS Snippet Library & Generator Modal */}
      <ErrorBoundary fallbackTitle="Accurx SMS Library Error">
        <AccurxModal
          isOpen={isAccurxOpen}
          onClose={closeAccurx}
          currentDocId={activeDocContext.id}
          currentDocTitle={activeDocContext.title}
          currentDocContext={activeDocContext.contentMarkdown}
          onInsertIntoPage={insertIntoActiveDoc}
        />
      </ErrorBoundary>
    </ClinicalToolsContext.Provider>
  );
}
