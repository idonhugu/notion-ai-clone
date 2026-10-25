'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import { FileText, Kanban, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { updateDocument, createDocument } from '@/lib/api/documents';
import { CoverImage } from './CoverImage';
import { IconPicker } from './IconPicker';
import { AIInlineMenu } from './AIInlineMenu';
import { AIFloatingMenu } from './AIFloatingMenu';
import { TopNav } from './TopNav';
import { DocumentAttachments, AttachedFile } from './DocumentAttachments';
import { AIChatSidecar } from './AIChatSidecar';
import { KanbanBoard, KanbanCard } from './KanbanBoard';
import { TaskProgressBar } from './TaskProgressBar';
import { ShortcutsModal } from './ShortcutsModal';
import { ClinicalEvidenceModal } from './ClinicalEvidenceModal';
import { SubPagesList } from './SubPagesList';
import { EditorToolbar } from './EditorToolbar';
import { useTheme } from './ThemeProvider';
import { Document } from '@/lib/types';
import { NotionFontStyle, NOTION_FONTS } from '@/lib/notionStyles';
import { sanitizeAIMarkdown, isChecklistMarkdown } from '@/lib/sanitizeAIMarkdown';

interface EditorProps {
  document: Document;
  parentDocument?: Document | null;
  onDelete?: (id: string) => void;
  onUpdateDocument?: (doc: Partial<Document>) => void;
}

export default function Editor({
  document: initialDoc,
  parentDocument,
  onDelete,
  onUpdateDocument,
}: EditorProps) {
  const router = useRouter();
  const { theme } = useTheme();
  const [doc, setDoc] = useState<Document>(initialDoc);
  const [title, setTitle] = useState(initialDoc.title || 'Untitled');
  const [icon, setIcon] = useState<string | null>(initialDoc.icon);
  const [coverImage, setCoverImage] = useState<string | null>(initialDoc.cover_image);
  const [isFavorite, setIsFavorite] = useState<boolean>(initialDoc.is_favorite);
  const [attachments, setAttachments] = useState<AttachedFile[]>(initialDoc.attachments || []);
  const [isFullWidth, setIsFullWidth] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error' | 'local'>('saved');

  // View state: Document Canvas vs Kanban Board
  const [activeView, setActiveView] = useState<'document' | 'board'>('document');

  // AI & Sidecar states
  const [isSidecarOpen, setIsSidecarOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isEvidenceOpen, setIsEvidenceOpen] = useState(false);
  const [selectedChatDoc, setSelectedChatDoc] = useState<AttachedFile | null>(null);
  const [docMarkdown, setDocMarkdown] = useState('');
  const [checklistStats, setChecklistStats] = useState({ total: 0, completed: 0 });

  // Inline & Floating AI states
  const [showInlineAI, setShowInlineAI] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [floatingMenuPos, setFloatingMenuPos] = useState<{ top: number; left: number } | null>(null);

  // Kanban Board Cards (persisted in attachments with id='__kanban__')
  const [cards, setCards] = useState<KanbanCard[]>(() => {
    const entry = (initialDoc.attachments || []).find((f: any) => f.id === '__kanban__');
    if (entry && entry.url) {
      try {
        return JSON.parse(entry.url);
      } catch {}
    }
    return [];
  });

  // Font family and sizing
  const [fontStyle, setFontStyle] = useState<NotionFontStyle>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`notion_font_${initialDoc.id}`);
      if (saved === 'sans' || saved === 'serif' || saved === 'mono') return saved;
    }
    const entry = (initialDoc.attachments || []).find((f: any) => f.id === '__page_style__');
    if (entry && entry.url) {
      try {
        const parsed = JSON.parse(entry.url);
        if (parsed.fontStyle) return parsed.fontStyle;
      } catch {}
    }
    return 'sans';
  });

  const [isSmallText, setIsSmallText] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`notion_small_text_${initialDoc.id}`);
      if (saved !== null) return saved === 'true';
    }
    const entry = (initialDoc.attachments || []).find((f: any) => f.id === '__page_style__');
    if (entry && entry.url) {
      try {
        const parsed = JSON.parse(entry.url);
        if (typeof parsed.isSmallText === 'boolean') return parsed.isSmallText;
      } catch {}
    }
    return false;
  });

  const [activeStyles, setActiveStyles] = useState<any>({});

  const titleInputRef = useRef<HTMLInputElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const supabase = createClient();

  // Create BlockNote editor instance
  const editor = useCreateBlockNote({
    initialContent:
      Array.isArray(initialDoc.content) && initialDoc.content.length > 0
        ? initialDoc.content
        : undefined,
  });

  // Calculate live word count & checklist progress
  const analyzeDocument = useCallback(async () => {
    if (!editor) return;
    try {
      let count = 0;
      let checkTotal = 0;
      let checkCompleted = 0;

      editor.forEachBlock((block: any) => {
        if (Array.isArray(block.content)) {
          block.content.forEach((item: any) => {
            if (item.text) {
              const words = item.text.trim().split(/\s+/).filter(Boolean);
              count += words.length;
            }
          });
        }

        if (block.type === 'checkListItem') {
          checkTotal++;
          if (block.props?.checked === true) {
            checkCompleted++;
          }
        }
        return true;
      });

      setWordCount(count);
      setChecklistStats({ total: checkTotal, completed: checkCompleted });

      // Serialize text for AI sidecar
      const md = await editor.blocksToMarkdownLossy(editor.document);
      setDocMarkdown(md);
    } catch {
      // ignore parsing error
    }
  }, [editor]);

  // Listen for live updates to this document & auto-resync when returning to tab/app on mobile
  useEffect(() => {
    const isUserInteracting = () => {
      if (saveTimeoutRef.current !== null) return true;
      if (typeof document === 'undefined') return false;
      const active = document.activeElement as HTMLElement | null;
      if (!active) return false;
      return (
        active.closest('.bn-editor') !== null ||
        active.tagName === 'INPUT' ||
        active.tagName === 'TEXTAREA' ||
        active.isContentEditable ||
        active === titleInputRef.current
      );
    };

    const fetchLatestDoc = async () => {
      // Never overwrite editor while user is actively typing or has unsaved edits
      if (isUserInteracting()) return;

      try {
        const res = await fetch(`/api/documents/${doc.id}?_t=${Date.now()}`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.document && editor) {
            // Check again in case user started typing while fetch was in-flight
            if (isUserInteracting()) return;

            const remoteDoc = data.document;
            if (remoteDoc.title && remoteDoc.title !== title) setTitle(remoteDoc.title);
            if (remoteDoc.icon !== undefined) setIcon(remoteDoc.icon);
            if (remoteDoc.cover_image !== undefined) setCoverImage(remoteDoc.cover_image);
            if (remoteDoc.attachments !== undefined) setAttachments(remoteDoc.attachments);
            if (
              remoteDoc.content &&
              Array.isArray(remoteDoc.content) &&
              JSON.stringify(remoteDoc.content) !== JSON.stringify(editor.document)
            ) {
              editor.replaceBlocks(editor.document, remoteDoc.content);
              analyzeDocument();
            }
            setSaveStatus('saved');
          }
        }
      } catch (err) {
        console.warn('Auto-resync fetch error:', err);
      }
    };

    const handleDocUpdatedEvent = async (e: any) => {
      if (e?.detail?.id === doc.id) {
        if (e?.detail?._source === 'local_editor') return;
        if (isUserInteracting()) return;

        if (
          e.detail?.content &&
          editor &&
          JSON.stringify(e.detail.content) !== JSON.stringify(editor.document)
        ) {
          editor.replaceBlocks(editor.document, e.detail.content);
          analyzeDocument();
        } else {
          fetchLatestDoc();
        }
      }
    };

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        fetchLatestDoc();
      }
    };

    window.addEventListener('notion:doc_updated', handleDocUpdatedEvent);
    window.addEventListener('notion:force_doc_sync', fetchLatestDoc);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('focus', handleVisibilityOrFocus);

    return () => {
      window.removeEventListener('notion:doc_updated', handleDocUpdatedEvent);
      window.removeEventListener('notion:force_doc_sync', fetchLatestDoc);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
    };
  }, [doc.id, editor, analyzeDocument, title]);

  // Immediate save flush when mobile user leaves app, switches tabs, or locks screen
  useEffect(() => {
    const handleFlushSave = () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
        if (editor) {
          const payload = {
            title,
            content: editor.document,
            icon,
            cover_image: coverImage,
            is_favorite: isFavorite,
            attachments,
            updated_at: new Date().toISOString(),
          };
          updateDocument(doc.id, payload);
          setSaveStatus('saved');
        }
      }
    };

    window.addEventListener('pagehide', handleFlushSave);
    window.addEventListener('beforeunload', handleFlushSave);
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        handleFlushSave();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('pagehide', handleFlushSave);
      window.removeEventListener('beforeunload', handleFlushSave);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [doc.id, title, icon, coverImage, isFavorite, attachments, editor]);

  // Track selection changes for the floating action menu
  useEffect(() => {
    if (!editor) return;

    analyzeDocument();

    const handleSelectionChange = () => {
      try {
        const text = editor.getSelectedText();
        if (text && text.trim().length > 1) {
          setSelectedText(text);

          const domSelection = window.getSelection();
          if (domSelection && domSelection.rangeCount > 0) {
            const range = domSelection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            setFloatingMenuPos({
              top: rect.top + window.scrollY,
              left: rect.left + window.scrollX,
            });
            setActiveStyles(editor.getActiveStyles() || {});
          }
        } else {
          setSelectedText('');
          setFloatingMenuPos(null);
          setActiveStyles(editor.getActiveStyles() || {});
        }
      } catch (err) {
        // Selection out of bounds or not ready
      }
    };

    const unsubscribe = editor.onSelectionChange(handleSelectionChange);
    return () => unsubscribe();
  }, [editor, analyzeDocument]);

  // Save handler with debounce (1000ms)
  const saveDocument = useCallback(
    async (updatedFields: {
      title?: string;
      content?: any[];
      icon?: string | null;
      cover_image?: string | null;
      is_favorite?: boolean;
      attachments?: AttachedFile[];
    }) => {
      setSaveStatus('saving');

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(async () => {
        try {
          const payload = {
            title: updatedFields.title ?? title,
            content: updatedFields.content ?? editor?.document ?? [],
            icon: updatedFields.icon !== undefined ? updatedFields.icon : icon,
            cover_image:
              updatedFields.cover_image !== undefined ? updatedFields.cover_image : coverImage,
            is_favorite:
              updatedFields.is_favorite !== undefined ? updatedFields.is_favorite : isFavorite,
            attachments:
              updatedFields.attachments !== undefined ? updatedFields.attachments : attachments,
            updated_at: new Date().toISOString(),
          };

          if (onUpdateDocument) {
            onUpdateDocument(payload);
          }

          const updated = await updateDocument(doc.id, payload);
          if (updated) {
            setSaveStatus('saved');
          } else {
            setSaveStatus('saved'); // Local storage cache was updated
          }
        } catch (err) {
          console.error('Error saving document:', err);
          setSaveStatus('error');
        }
      }, 1000);
    },
    [doc.id, title, icon, coverImage, isFavorite, attachments, editor, supabase, onUpdateDocument]
  );

  // Trigger save on editor content change
  const handleEditorChange = () => {
    if (!editor) return;
    analyzeDocument();
    saveDocument({ content: editor.document });
  };

  // Manual force-sync with cloud database
  const handleManualSync = useCallback(async () => {
    setSaveStatus('saving');
    if (editor) {
      const payload = {
        title,
        content: editor.document,
        icon,
        cover_image: coverImage,
        is_favorite: isFavorite,
        attachments,
        updated_at: new Date().toISOString(),
      };
      await updateDocument(doc.id, payload);
    }
    window.dispatchEvent(new CustomEvent('notion:sync_requested'));
    try {
      const res = await fetch(`/api/documents/${doc.id}?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.document?.content && editor) {
          editor.replaceBlocks(editor.document, data.document.content);
          analyzeDocument();
        }
      }
    } catch {}
    setSaveStatus('saved');
  }, [doc.id, title, icon, coverImage, isFavorite, attachments, editor, analyzeDocument]);

  // Kanban update handler
  const handleUpdateCards = (newCards: KanbanCard[]) => {
    setCards(newCards);
    const otherAttachments = attachments.filter((f) => f.id !== '__kanban__');
    const kanbanEntry: AttachedFile = {
      id: '__kanban__',
      name: 'Project Kanban Board',
      size: JSON.stringify(newCards).length,
      type: 'application/vnd.notion.kanban+json',
      url: JSON.stringify(newCards),
      uploadedAt: new Date().toISOString(),
    };
    const updated = [...otherAttachments, kanbanEntry];
    setAttachments(updated);
    saveDocument({ attachments: updated });
  };

  // Handle Page Font & Sizing persistence
  const handleUpdatePageStyle = (newFont: NotionFontStyle, newSmallText: boolean) => {
    setFontStyle(newFont);
    setIsSmallText(newSmallText);

    if (typeof window !== 'undefined') {
      localStorage.setItem(`notion_font_${doc.id}`, newFont);
      localStorage.setItem(`notion_small_text_${doc.id}`, String(newSmallText));
    }

    const otherAttachments = attachments.filter((f) => f.id !== '__page_style__');
    const stylePayload = { fontStyle: newFont, isSmallText: newSmallText };
    const styleEntry: AttachedFile = {
      id: '__page_style__',
      name: 'Page Style Configuration',
      size: JSON.stringify(stylePayload).length,
      type: 'application/vnd.notion.style+json',
      url: JSON.stringify(stylePayload),
      uploadedAt: new Date().toISOString(),
    };

    const updated = [...otherAttachments, styleEntry];
    setAttachments(updated);
    saveDocument({ attachments: updated });
  };

  // Toggle text format mark: bold, italic, underline, strike, code
  const handleToggleStyle = (style: 'bold' | 'italic' | 'underline' | 'strike' | 'code') => {
    if (!editor) return;
    try {
      editor.toggleStyles({ [style]: true } as any);
      setActiveStyles(editor.getActiveStyles() || {});
    } catch (e) {
      console.warn('Toggle style error:', e);
    }
  };

  // Apply text color
  const handleApplyTextColor = (color: string) => {
    if (!editor) return;
    try {
      if (color === 'default') {
        editor.removeStyles({ textColor: true } as any);
      } else {
        editor.addStyles({ textColor: color } as any);
      }

      // If no text is selected, color the current block
      const cursor = editor.getTextCursorPosition();
      if (cursor?.block && !editor.getSelectedText()) {
        editor.updateBlock(cursor.block, {
          props: { textColor: color },
        } as any);
      }
      setActiveStyles(editor.getActiveStyles() || {});
      saveDocument({ content: editor.document });
    } catch (e) {
      console.warn('Apply text color error:', e);
    }
  };

  // Apply background highlight color
  const handleApplyBgColor = (color: string) => {
    if (!editor) return;
    try {
      if (color === 'default') {
        editor.removeStyles({ backgroundColor: true } as any);
      } else {
        editor.addStyles({ backgroundColor: color } as any);
      }

      // If no text is selected, color the current block
      const cursor = editor.getTextCursorPosition();
      if (cursor?.block && !editor.getSelectedText()) {
        editor.updateBlock(cursor.block, {
          props: { backgroundColor: color },
        } as any);
      }
      setActiveStyles(editor.getActiveStyles() || {});
      saveDocument({ content: editor.document });
    } catch (e) {
      console.warn('Apply bg color error:', e);
    }
  };

  // Align text
  const handleAlignText = (alignment: 'left' | 'center' | 'right') => {
    if (!editor) return;
    try {
      const cursor = editor.getTextCursorPosition();
      if (cursor?.block) {
        editor.updateBlock(cursor.block, {
          props: { textAlignment: alignment },
        } as any);
        saveDocument({ content: editor.document });
      }
    } catch (e) {
      console.warn('Align text error:', e);
    }
  };

  // Duplicate current page
  const handleDuplicatePage = async () => {
    try {
      const newDoc = {
        title: `${title} (Copy)`,
        content: editor?.document ?? [],
        icon,
        cover_image: coverImage,
        is_favorite: false,
        attachments,
        user_id: 'admin-user',
      };
      const created = await createDocument(newDoc);
      if (created?.id) {
        window.location.href = `/doc/${created.id}`;
      }
    } catch (err) {
      console.error('Failed to duplicate page:', err);
    }
  };

  // Create Subpage with AI extracted notes
  const handleCreateSubpageWithNotes = async (subTitle: string, markdown: string) => {
    try {
      const parsedBlocks = editor ? await editor.tryParseMarkdownToBlocks(markdown) : [];
      const newSub = {
        title: subTitle,
        content: parsedBlocks,
        parent_id: doc.id,
        user_id: 'admin-user',
        icon: '📝',
        is_favorite: false,
        is_archived: false,
        attachments: [],
      };
      const created = await createDocument(newSub);
      if (created?.id) {
        window.location.href = `/doc/${created.id}`;
      }
    } catch (err) {
      console.error('Failed to create subpage with notes:', err);
    }
  };

  // Global keyboard shortcuts (Cmd+J for AI sidecar, Cmd+/ for shortcuts cheat sheet)
  useEffect(() => {
    const handleGlobalShortcuts = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;

      if (isCmdOrCtrl && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        setIsSidecarOpen((prev) => !prev);
      }

      if (isCmdOrCtrl && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        setIsEvidenceOpen((prev) => !prev);
      }

      if (isCmdOrCtrl && e.key === '/') {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
      }
    };

    const handleOpenPres = () => {
      setIsSidecarOpen(true);
    };

    const handleOpenEvidence = () => {
      setIsEvidenceOpen(true);
    };

    window.addEventListener('keydown', handleGlobalShortcuts);
    window.addEventListener('notion:open_ai_presentation_modal', handleOpenPres);
    window.addEventListener('notion:open_evidence_modal', handleOpenEvidence);
    return () => {
      window.removeEventListener('keydown', handleGlobalShortcuts);
      window.removeEventListener('notion:open_ai_presentation_modal', handleOpenPres);
      window.removeEventListener('notion:open_evidence_modal', handleOpenEvidence);
    };
  }, []);

  // Keyboard navigation inside editor
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!editor) return;

    // Never intercept typing in standard inputs, textareas, or outside editor canvas
    const target = e.target as HTMLElement;
    if (
      target?.tagName === 'INPUT' ||
      target?.tagName === 'TEXTAREA' ||
      !target?.closest?.('.bn-editor')
    ) {
      return;
    }
  };

  // Insert or Replace AI generated Markdown directly into blocks
  const handleInsertAIMarkdown = async (
    rawMarkdown: string,
    options?: { mode?: 'auto' | 'replace' | 'insert' }
  ) => {
    if (!editor) return;
    try {
      const cleanMarkdown = sanitizeAIMarkdown(rawMarkdown);
      if (!cleanMarkdown) return;

      // Check if markdown contains an active presentation link: [emoji] [Title](/doc/[id])
      const match = cleanMarkdown.match(/(?:([^\s\[\]]+)\s+)?\[([^\]]+)\]\((\/doc\/[a-f0-9\-]{36})\)/);
      if (match && !cleanMarkdown.includes('\n')) {
        const icon = match[1] || '🩺';
        const linkTitle = match[2];
        const href = match[3];

        const linkBlock: any = {
          id: typeof crypto !== 'undefined' ? crypto.randomUUID() : 'b-' + Date.now(),
          type: 'paragraph',
          props: { textColor: 'default', textAlignment: 'left', backgroundColor: 'default' },
          content: [
            { type: 'text', text: `${icon} `, styles: {} },
            {
              type: 'link',
              href,
              content: [{ type: 'text', text: linkTitle, styles: { underline: true } }],
            },
          ],
          children: [],
        };

        const cursor = editor.getTextCursorPosition();
        if (cursor?.block) {
          editor.insertBlocks([linkBlock], cursor.block, 'after');
        } else {
          editor.insertBlocks([linkBlock], editor.document[editor.document.length - 1], 'after');
        }
        analyzeDocument();
        saveDocument({ content: editor.document });
        return;
      }

      const parsedBlocks = await editor.tryParseMarkdownToBlocks(cleanMarkdown);
      if (!parsedBlocks || parsedBlocks.length === 0) return;

      const mode = options?.mode || 'auto';
      const incomingChecklists = parsedBlocks.filter((b: any) => b.type === 'checkListItem');
      const isChecklistConversion = incomingChecklists.length > 0;

      const extractBlockText = (b: any): string => {
        if (!b) return '';
        if (typeof b.content === 'string') return b.content.trim();
        if (Array.isArray(b.content)) {
          return b.content
            .map((c: any) => (typeof c === 'string' ? c : c.text || ''))
            .join('')
            .trim();
        }
        return '';
      };

      const isConversationalBlock = (b: any) => {
        const t = extractBlockText(b).toLowerCase();
        return (
          t.includes('converted into an interactive checklist') ||
          t.includes('here is your document converted') ||
          t.includes('here is your list converted') ||
          t.includes('interactive checklist for your document') ||
          t.startsWith('here is your checklist')
        );
      };

      const docBlocks = editor.document;
      const conversationalBlocks: any[] = [];
      const matchingBlocks: any[] = [];

      const incomingItemTexts = parsedBlocks
        .map(extractBlockText)
        .filter(Boolean)
        .map((t) => t.toLowerCase());

      for (const b of docBlocks) {
        if (isConversationalBlock(b)) {
          conversationalBlocks.push(b);
          continue;
        }

        const text = extractBlockText(b).toLowerCase();
        if (!text) continue;

        // Check if this block matches an incoming item
        const matches = incomingItemTexts.some(
          (inc) => inc === text || (inc.length > 3 && (inc.includes(text) || text.includes(inc)))
        );
        if (matches) {
          matchingBlocks.push(b);
        }
      }

      // Determine if we should perform an in-place replacement
      const isDocMostlyList = docBlocks
        .filter((b: any) => extractBlockText(b))
        .every(
          (b: any) =>
            b.type === 'bulletListItem' ||
            b.type === 'numberedListItem' ||
            b.type === 'checkListItem' ||
            b.type === 'paragraph'
        );

      const shouldReplace =
        mode === 'replace' ||
        (mode === 'auto' &&
          isChecklistConversion &&
          (matchingBlocks.length > 0 || (isDocMostlyList && docBlocks.length <= parsedBlocks.length + 3)));

      if (shouldReplace) {
        // Clean up any residual conversational blocks first
        if (conversationalBlocks.length > 0) {
          try {
            editor.removeBlocks(conversationalBlocks);
          } catch (e) {
            console.warn('Could not remove conversational blocks:', e);
          }
        }

        if (matchingBlocks.length > 0) {
          // Replace the matching old list blocks with the new checklist blocks in-place!
          editor.replaceBlocks(matchingBlocks, parsedBlocks);
        } else if (mode === 'replace') {
          // If user explicitly clicked Replace, replace all list/paragraph blocks or document
          const targetBlocks = editor.document.filter(
            (b: any) => b.type !== 'heading' && extractBlockText(b).length > 0
          );
          if (targetBlocks.length > 0) {
            editor.replaceBlocks(targetBlocks, parsedBlocks);
          } else {
            editor.replaceBlocks(editor.document, parsedBlocks);
          }
        } else {
          // Fallback to inserting after cursor
          const cursor = editor.getTextCursorPosition();
          if (cursor?.block) {
            editor.insertBlocks(parsedBlocks, cursor.block, 'after');
          } else {
            editor.insertBlocks(parsedBlocks, editor.document[editor.document.length - 1], 'after');
          }
        }
      } else {
        const incomingHeadings = parsedBlocks.filter((b: any) => b.type === 'heading');

        if (incomingHeadings.length > 0 && mode === 'auto' && !isChecklistConversion) {
          // Section-aware smart insertion: merge items under matching existing headings
          const sections: { heading: any | null; items: any[] }[] = [];
          let curSec: { heading: any | null; items: any[] } = { heading: null, items: [] };

          for (const b of parsedBlocks) {
            if (b.type === 'heading') {
              if (curSec.heading || curSec.items.length > 0) {
                sections.push(curSec);
              }
              curSec = { heading: b, items: [] };
            } else {
              curSec.items.push(b);
            }
          }
          if (curSec.heading || curSec.items.length > 0) {
            sections.push(curSec);
          }

          const normalizeText = (s: string) =>
            s.replace(/^[^\w\s]+/, '').replace(/[^\w\s]/g, '').trim().toLowerCase();

          for (const sec of sections) {
            if (sec.heading && sec.items.length > 0) {
              const hText = normalizeText(extractBlockText(sec.heading));
              const existingHeadingIdx = editor.document.findIndex(
                (b: any) => b.type === 'heading' && normalizeText(extractBlockText(b)) === hText
              );

              if (existingHeadingIdx !== -1) {
                // Found matching section heading in page: find the end of this section
                let insertAfterIdx = existingHeadingIdx;
                for (let i = existingHeadingIdx + 1; i < editor.document.length; i++) {
                  const b = editor.document[i];
                  if (b.type === 'heading' || b.type === 'divider') {
                    break;
                  }
                  insertAfterIdx = i;
                }

                // Filter out items already in this section to prevent duplicates
                const existingTextsInSec = new Set<string>();
                for (let i = existingHeadingIdx; i <= insertAfterIdx; i++) {
                  const t = normalizeText(extractBlockText(editor.document[i]));
                  if (t) existingTextsInSec.add(t);
                }

                const newItems = sec.items.filter(
                  (item: any) => !existingTextsInSec.has(normalizeText(extractBlockText(item)))
                );

                if (newItems.length > 0) {
                  editor.insertBlocks(newItems, editor.document[insertAfterIdx], 'after');
                }
                continue;
              }
            }

            // If no matching heading, insert section blocks at cursor or end of document
            const blocksToInsert = sec.heading ? [sec.heading, ...sec.items] : sec.items;
            const cursor = editor.getTextCursorPosition();
            if (cursor?.block) {
              editor.insertBlocks(blocksToInsert, cursor.block, 'after');
            } else {
              editor.insertBlocks(blocksToInsert, editor.document[editor.document.length - 1], 'after');
            }
          }
        } else {
          // Normal insert mode without matching headings
          // Filter out any blocks that already exist verbatim in the document to prevent duplicate dumping
          const existingDocTexts = new Set(
            editor.document.map(extractBlockText).filter(Boolean).map((t: string) => t.toLowerCase())
          );
          const filteredBlocks = parsedBlocks.filter((b: any) => {
            const t = extractBlockText(b).toLowerCase();
            return !t || !existingDocTexts.has(t);
          });

          if (filteredBlocks.length > 0) {
            const cursor = editor.getTextCursorPosition();
            if (cursor?.block) {
              editor.insertBlocks(filteredBlocks, cursor.block, 'after');
            } else {
              editor.insertBlocks(filteredBlocks, editor.document[editor.document.length - 1], 'after');
            }
          }
        }
      }

      analyzeDocument();
      saveDocument({ content: editor.document });
    } catch (err) {
      console.error('Failed to parse AI markdown into blocks:', err);
    }
  };

  // Replace selected text with AI rewritten markdown
  const handleReplaceSelectedText = async (newText: string) => {
    if (!editor) return;
    try {
      const cleanText = sanitizeAIMarkdown(newText);
      const parsed = await editor.tryParseMarkdownToBlocks(cleanText);
      const cursor = editor.getTextCursorPosition();
      if (cursor?.block && parsed.length > 0) {
        editor.replaceBlocks([cursor.block], parsed);
        analyzeDocument();
        saveDocument({ content: editor.document });
      }
    } catch (err) {
      console.error('Failed to replace selected blocks:', err);
    }
  };

  // Export current document as clean Markdown file (supporting full unicode & safe filenames)
  const handleExportMarkdown = async () => {
    if (!editor) return;
    try {
      const markdown = await editor.blocksToMarkdownLossy(editor.document);
      const safeTitle = (title || 'untitled')
        .trim()
        .replace(/[\/\\?%*:|"<>]/g, '-')
        .replace(/\s+/g, ' ');
      const blob = new Blob([`# ${title}\n\n${markdown}`], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${safeTitle || 'document'}.md`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export markdown failed:', err);
    }
  };

  return (
    <div className="relative min-h-screen bg-white dark:bg-[#191919] text-neutral-900 dark:text-neutral-100 flex flex-col transition-colors">
      {/* Top Navigation Bar with Breadcrumbs & Notion Controls */}
      <TopNav
        document={{ ...doc, title, icon, is_favorite: isFavorite }}
        parentDocument={parentDocument}
        isFullWidth={isFullWidth}
        onToggleFullWidth={() => setIsFullWidth(!isFullWidth)}
        isFavorite={isFavorite}
        onToggleFavorite={() => {
          const updated = !isFavorite;
          setIsFavorite(updated);
          saveDocument({ is_favorite: updated });
        }}
        saveStatus={saveStatus}
        onOpenAI={() => setIsSidecarOpen(!isSidecarOpen)}
        isSidecarOpen={isSidecarOpen}
        onToggleSidecar={() => setIsSidecarOpen(!isSidecarOpen)}
        onDuplicate={handleDuplicatePage}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onDelete={onDelete ? () => onDelete(doc.id) : undefined}
        wordCount={wordCount}
        onExportMarkdown={handleExportMarkdown}
        currentFont={fontStyle}
        onSelectFont={(f) => handleUpdatePageStyle(f, isSmallText)}
        isSmallText={isSmallText}
        onToggleSmallText={() => handleUpdatePageStyle(fontStyle, !isSmallText)}
        onManualSync={handleManualSync}
        onOpenEvidence={() => setIsEvidenceOpen(true)}
      />

      {/* Cover Image banner */}
      <CoverImage
        url={coverImage}
        onUpdate={(newCover) => {
          setCoverImage(newCover);
          saveDocument({ cover_image: newCover });
        }}
      />

      {/* Main Workspace Row: Canvas + Dockable AI Copilot Drawer */}
      <div className="flex flex-1 min-w-0">
        <div
          className={`flex-1 min-w-0 mx-auto transition-all duration-200 ${
            isFullWidth ? 'max-w-full px-4 sm:px-8 md:px-14' : 'max-w-4xl px-3.5 sm:px-6 md:px-12'
          } pt-5 pb-32`}
        >
          {/* Page Icon Picker (Clean single emoji) */}
          <IconPicker
            icon={icon}
            onUpdate={(newIcon) => {
              setIcon(newIcon);
              saveDocument({ icon: newIcon });
            }}
          />

          {/* Title Input (Full Unicode & Space Key Support) */}
          <input
            ref={titleInputRef}
            type="text"
            value={title}
            onChange={(e) => {
              const newTitle = e.target.value;
              setTitle(newTitle);
              if (onUpdateDocument) {
                onUpdateDocument({ title: newTitle });
              }
              if (typeof window !== 'undefined') {
                window.dispatchEvent(
                  new CustomEvent('notion:doc_updated', {
                    detail: { id: doc.id, title: newTitle, _source: 'local_editor' },
                  })
                );
              }
              saveDocument({ title: newTitle });
            }}
            onKeyDown={(e) => {
              // Crucial: Stop propagation so Space key and unicode inputs are never blocked by outside listeners
              e.stopPropagation();
              if (e.key === 'Enter') {
                e.preventDefault();
                editor?.focus();
              }
            }}
            placeholder="Untitled"
            className="w-full text-2xl sm:text-3xl md:text-4xl font-bold bg-transparent border-none outline-none placeholder:text-neutral-300 dark:placeholder:text-neutral-700 text-neutral-900 dark:text-neutral-100 mb-4 tracking-tight"
          />

          {/* Notion View Switcher Tabs: Document Canvas vs Kanban Board */}
          <div className="flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-3 mb-6">
            <button
              onClick={() => setActiveView('document')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeView === 'document'
                  ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Document Canvas</span>
            </button>

            <button
              onClick={() => setActiveView('board')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeView === 'board'
                  ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-900'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Project Board</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-200/60 dark:bg-neutral-700/60">
                {cards.length}
              </span>
            </button>
          </div>

          {/* VIEW 1: Document Canvas */}
          {activeView === 'document' && (
            <div className="space-y-6">
              {/* Task Checklist Progress Bar */}
              <TaskProgressBar
                total={checklistStats.total}
                completed={checklistStats.completed}
              />

              {/* Inline AI Menu triggered via Space or Button */}
              {showInlineAI && (
                <AIInlineMenu
                  isOpen={showInlineAI}
                  onClose={() => setShowInlineAI(false)}
                  onApply={handleInsertAIMarkdown}
                  documentId={doc.id}
                  documentTitle={title}
                  documentContext={`Document Title: ${title}\nContent Snippet: ${JSON.stringify(
                    editor?.document?.slice(0, 5) || []
                  )}`}
                />
              )}

              {/* Quick Notion Formatting Bar (Typography & Color Palette) */}
              <EditorToolbar
                currentFont={fontStyle}
                onSelectFont={(f) => handleUpdatePageStyle(f, isSmallText)}
                isSmallText={isSmallText}
                onToggleSmallText={() => handleUpdatePageStyle(fontStyle, !isSmallText)}
                onToggleStyle={handleToggleStyle}
                onApplyTextColor={handleApplyTextColor}
                onApplyBgColor={handleApplyBgColor}
                onAlignText={handleAlignText}
                onOpenAI={() => setShowInlineAI(true)}
                activeStyles={activeStyles}
              />

              {/* Core BlockNote Editor Canvas with Dynamic Theme & Font Typography Matching */}
              <div
                className={`min-h-[420px] transition-all ${
                  fontStyle === 'serif' ? 'font-serif' : fontStyle === 'mono' ? 'font-mono' : 'font-sans'
                } ${isSmallText ? 'text-[14px]' : 'text-[15px]'}`}
                style={{
                  fontFamily:
                    fontStyle === 'serif'
                      ? 'Charter, Georgia, Cambria, "Times New Roman", Times, serif'
                      : fontStyle === 'mono'
                      ? '"JetBrains Mono", "Fira Code", Menlo, Monaco, Consolas, monospace'
                      : '-apple-system, BlinkMacSystemFont, "Segoe UI", Inter, Roboto, Helvetica, Arial, sans-serif',
                }}
                onKeyDown={handleKeyDown}
                onClickCapture={(e) => {
                  const target = e.target as HTMLElement;
                  const anchor = target?.closest('a');
                  if (anchor) {
                    const href = anchor.getAttribute('href');
                    if (href && href.startsWith('/doc/')) {
                      e.preventDefault();
                      e.stopPropagation();
                      router.push(href);
                    }
                  }
                }}
              >
                <BlockNoteView
                  editor={editor}
                  onChange={handleEditorChange}
                  theme={theme === 'dark' ? 'dark' : 'light'}
                  className="notion-editor-styles"
                />
              </div>

              {/* Nested Sub-pages Section (Documents within notes) */}
              <SubPagesList currentDocId={doc.id} />

              {/* Document & PDF Attachments with AI Tools */}
              <DocumentAttachments
                files={attachments}
                onUpdateFiles={(newFiles) => {
                  setAttachments(newFiles);
                  saveDocument({ attachments: newFiles });
                }}
                onInsertIntoPage={handleInsertAIMarkdown}
                onCreateSubpageWithNotes={handleCreateSubpageWithNotes}
                onChatWithDocument={(file) => {
                  setSelectedChatDoc(file);
                  setIsSidecarOpen(true);
                }}
              />
            </div>
          )}

          {/* VIEW 2: Kanban Board */}
          {activeView === 'board' && (
            <KanbanBoard
              documentTitle={title}
              documentContent={docMarkdown}
              cards={cards}
              onUpdateCards={handleUpdateCards}
            />
          )}
        </div>

        {/* Dockable Laksha's WorkSpace AI Copilot Drawer ("Chat with your page & documents") */}
        <AIChatSidecar
          isOpen={isSidecarOpen}
          onClose={() => setIsSidecarOpen(false)}
          documentId={doc.id}
          documentTitle={title}
          documentContent={docMarkdown}
          attachedFiles={attachments}
          selectedDocument={selectedChatDoc}
          onSelectDocument={setSelectedChatDoc}
          onInsertIntoPage={handleInsertAIMarkdown}
          onOpenEvidence={() => setIsEvidenceOpen(true)}
        />
      </div>

      {/* Floating Selection Menu for highlighted text */}
      {floatingMenuPos && selectedText && (
        <AIFloatingMenu
          selectedText={selectedText}
          position={floatingMenuPos}
          onClose={() => setFloatingMenuPos(null)}
          onReplaceSelection={handleReplaceSelectedText}
          onToggleStyle={handleToggleStyle}
          onApplyTextColor={handleApplyTextColor}
          onApplyBgColor={handleApplyBgColor}
        />
      )}

      {/* Keyboard Shortcuts Cheat Sheet Modal */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* Heidi Clinical Evidence Decision Support & Calculators Modal */}
      <ClinicalEvidenceModal
        isOpen={isEvidenceOpen}
        onClose={() => setIsEvidenceOpen(false)}
        currentDocId={doc.id}
        currentDocTitle={title}
        currentDocContext={docMarkdown}
        onInsertIntoPage={handleInsertAIMarkdown}
      />
    </div>
  );
}
