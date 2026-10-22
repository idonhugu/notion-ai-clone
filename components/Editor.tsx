'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import { createClient } from '@/lib/supabase/client';
import { CoverImage } from './CoverImage';
import { IconPicker } from './IconPicker';
import { AIInlineMenu } from './AIInlineMenu';
import { AIFloatingMenu } from './AIFloatingMenu';
import { TopNav } from './TopNav';
import { DocumentAttachments } from './DocumentAttachments';
import { useTheme } from './ThemeProvider';
import { Document, AttachedFile } from '@/lib/types';

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

  // AI Popover states
  const [showInlineAI, setShowInlineAI] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [floatingMenuPos, setFloatingMenuPos] = useState<{ top: number; left: number } | null>(null);

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

  // Calculate live word count
  const calculateWordCount = useCallback(() => {
    if (!editor) return;
    try {
      let count = 0;
      editor.forEachBlock((block) => {
        if (Array.isArray(block.content)) {
          block.content.forEach((item: any) => {
            if (item.text) {
              const words = item.text.trim().split(/\s+/).filter(Boolean);
              count += words.length;
            }
          });
        }
        return true;
      });
      setWordCount(count);
    } catch {
      // ignore parsing error
    }
  }, [editor]);

  // Track selection changes for the floating action menu
  useEffect(() => {
    if (!editor) return;

    calculateWordCount();

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
          }
        } else {
          setSelectedText('');
          setFloatingMenuPos(null);
        }
      } catch (err) {
        // Selection out of bounds or not ready
      }
    };

    const unsubscribe = editor.onSelectionChange(handleSelectionChange);
    return () => unsubscribe();
  }, [editor, calculateWordCount]);

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

          const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;

          if (hasSupabaseUrl) {
            const { error } = await supabase
              .from('documents')
              .update(payload)
              .eq('id', doc.id);

            if (error) {
              setSaveStatus('local');
            } else {
              setSaveStatus('saved');
            }
          } else {
            // Local storage fallback
            if (typeof window !== 'undefined') {
              localStorage.setItem(`doc_${doc.id}`, JSON.stringify(payload));
            }
            setSaveStatus('local');
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
    calculateWordCount();
    saveDocument({ content: editor.document });
  };

  // Keyboard navigation and spacebar / slash trigger
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!editor) return;

    if (e.key === ' ') {
      try {
        const cursor = editor.getTextCursorPosition();
        const currentBlock = cursor?.block;
        const isEmpty =
          !currentBlock?.content ||
          (Array.isArray(currentBlock.content) && currentBlock.content.length === 0) ||
          (Array.isArray(currentBlock.content) &&
            currentBlock.content.every((c: any) => !c.text || c.text.trim() === ''));

        if (isEmpty) {
          e.preventDefault();
          setShowInlineAI(true);
        }
      } catch (err) {
        // ignore cursor read error
      }
    }
  };

  // Insert AI generated Markdown directly into blocks
  const handleInsertAIMarkdown = async (markdown: string) => {
    if (!editor) return;
    try {
      const parsedBlocks = await editor.tryParseMarkdownToBlocks(markdown);
      if (parsedBlocks && parsedBlocks.length > 0) {
        const cursor = editor.getTextCursorPosition();
        if (cursor?.block) {
          editor.insertBlocks(parsedBlocks, cursor.block, 'after');
        } else {
          editor.insertBlocks(parsedBlocks, editor.document[editor.document.length - 1], 'after');
        }
        calculateWordCount();
        saveDocument({ content: editor.document });
      }
    } catch (err) {
      console.error('Failed to parse AI markdown into blocks:', err);
    }
  };

  // Replace selected text with AI rewritten markdown
  const handleReplaceSelectedText = async (newText: string) => {
    if (!editor) return;
    try {
      const parsed = await editor.tryParseMarkdownToBlocks(newText);
      const cursor = editor.getTextCursorPosition();
      if (cursor?.block && parsed.length > 0) {
        editor.replaceBlocks([cursor.block], parsed);
        calculateWordCount();
        saveDocument({ content: editor.document });
      }
    } catch (err) {
      console.error('Failed to replace selected blocks:', err);
    }
  };

  // Export current document as clean Markdown file
  const handleExportMarkdown = async () => {
    if (!editor) return;
    try {
      const markdown = await editor.blocksToMarkdownLossy(editor.document);
      const blob = new Blob([`# ${title}\n\n${markdown}`], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.toLowerCase().replace(/\s+/g, '-') || 'document'}.md`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export markdown failed:', err);
    }
  };

  return (
    <div className="relative min-h-screen bg-white dark:bg-[#191919] text-neutral-900 dark:text-neutral-100 flex flex-col pb-40 transition-colors">
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
        onOpenAI={() => setShowInlineAI(true)}
        onDelete={onDelete ? () => onDelete(doc.id) : undefined}
        wordCount={wordCount}
        onExportMarkdown={handleExportMarkdown}
      />

      {/* Cover Image banner */}
      <CoverImage
        url={coverImage}
        onUpdate={(newCover) => {
          setCoverImage(newCover);
          saveDocument({ cover_image: newCover });
        }}
      />

      {/* Main Document Canvas */}
      <div
        className={`w-full mx-auto transition-all duration-200 ${
          isFullWidth ? 'max-w-full px-8 md:px-20' : 'max-w-4xl px-6 md:px-16'
        } pt-6`}
        onKeyDown={handleKeyDown}
      >
        {/* Page Icon Picker (Clean single emoji) */}
        <IconPicker
          icon={icon}
          onUpdate={(newIcon) => {
            setIcon(newIcon);
            saveDocument({ icon: newIcon });
          }}
        />

        {/* Title Input */}
        <input
          ref={titleInputRef}
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            saveDocument({ title: e.target.value });
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              editor?.focus();
            }
          }}
          placeholder="Untitled"
          className="w-full text-3xl md:text-4xl font-bold bg-transparent border-none outline-none placeholder:text-neutral-300 dark:placeholder:text-neutral-700 text-neutral-900 dark:text-neutral-100 mb-6 tracking-tight"
        />

        {/* Inline AI Menu triggered via Space or Button */}
        {showInlineAI && (
          <AIInlineMenu
            isOpen={showInlineAI}
            onClose={() => setShowInlineAI(false)}
            onApply={handleInsertAIMarkdown}
            documentContext={`Document Title: ${title}\nContent Snippet: ${JSON.stringify(
              editor?.document?.slice(0, 5) || []
            )}`}
          />
        )}

        {/* Core BlockNote Editor Canvas with Dynamic Theme Matching */}
        <div className="min-h-[450px]">
          <BlockNoteView
            editor={editor}
            onChange={handleEditorChange}
            theme={theme === 'dark' ? 'dark' : 'light'}
            className="notion-editor-styles"
          />
        </div>

        {/* Document Attachments & Uploads */}
        <DocumentAttachments
          files={attachments}
          onUpdateFiles={(newFiles) => {
            setAttachments(newFiles);
            saveDocument({ attachments: newFiles });
          }}
        />
      </div>

      {/* Floating Selection Menu for highlighted text */}
      {floatingMenuPos && selectedText && (
        <AIFloatingMenu
          selectedText={selectedText}
          position={floatingMenuPos}
          onClose={() => setFloatingMenuPos(null)}
          onReplaceSelection={handleReplaceSelectedText}
        />
      )}
    </div>
  );
}
