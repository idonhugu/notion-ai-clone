'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import { createClient } from '@/lib/supabase/client';
import { CoverImage } from './CoverImage';
import { IconPicker } from './IconPicker';
import { AIInlineMenu } from './AIInlineMenu';
import { AIFloatingMenu } from './AIFloatingMenu';
import {
  Sparkles,
  CloudCheck,
  Loader2,
  Share2,
  Trash2,
  Star,
  Download,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { Document } from '@/lib/types';

interface EditorProps {
  document: Document;
  onDelete?: (id: string) => void;
  onUpdateDocument?: (doc: Partial<Document>) => void;
}

export default function Editor({
  document: initialDoc,
  onDelete,
  onUpdateDocument,
}: EditorProps) {
  const [doc, setDoc] = useState<Document>(initialDoc);
  const [title, setTitle] = useState(initialDoc.title || 'Untitled');
  const [icon, setIcon] = useState<string | null>(initialDoc.icon);
  const [coverImage, setCoverImage] = useState<string | null>(initialDoc.cover_image);
  const [isFavorite, setIsFavorite] = useState<boolean>(initialDoc.is_favorite);
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

  // Track selection changes for the floating action menu
  useEffect(() => {
    if (!editor) return;

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
          // If no selection, hide floating menu
          setSelectedText('');
          setFloatingMenuPos(null);
        }
      } catch (err) {
        // Selection out of bounds or not ready
      }
    };

    const unsubscribe = editor.onSelectionChange(handleSelectionChange);
    return () => unsubscribe();
  }, [editor]);

  // Save handler with debounce (1000ms)
  const saveDocument = useCallback(
    async (updatedFields: {
      title?: string;
      content?: any[];
      icon?: string | null;
      cover_image?: string | null;
      is_favorite?: boolean;
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
            updated_at: new Date().toISOString(),
          };

          // Optimistically update parent state
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
              console.warn('Supabase save warning (fallback to local):', error.message);
              setSaveStatus('local');
            } else {
              setSaveStatus('saved');
            }
          } else {
            // Local fallback mode
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
    [doc.id, title, icon, coverImage, isFavorite, editor, supabase, onUpdateDocument]
  );

  // Trigger save on editor content change
  const handleEditorChange = () => {
    if (!editor) return;
    saveDocument({ content: editor.document });
  };

  // Keyboard navigation and spacebar / slash trigger
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!editor) return;

    // Detect Space on an empty block
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
    <div className="relative min-h-screen bg-white dark:bg-[#191919] text-neutral-900 dark:text-neutral-100 flex flex-col pb-40">
      {/* Top action header bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between px-6 py-2.5 bg-white/80 dark:bg-[#191919]/80 backdrop-blur-md border-b border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
          <span className="font-medium truncate max-w-[150px] md:max-w-xs">{title || 'Untitled'}</span>
          <div className="h-3 w-[1px] bg-neutral-300 dark:bg-neutral-700" />
          
          {/* Save Status Indicator */}
          <div className="flex items-center gap-1.5">
            {saveStatus === 'saving' && (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-600" />
                <span className="text-purple-600 dark:text-purple-400">Saving...</span>
              </>
            )}
            {saveStatus === 'saved' && (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Saved</span>
              </>
            )}
            {saveStatus === 'local' && (
              <span className="text-neutral-400">Saved locally</span>
            )}
            {saveStatus === 'error' && (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-amber-500">Unsaved changes</span>
              </>
            )}
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5">
          {/* Ask AI trigger button */}
          <button
            onClick={() => setShowInlineAI(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/50 border border-purple-200/60 dark:border-purple-800/60 transition shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Ask AI</span>
          </button>

          {/* Favorite Toggle */}
          <button
            onClick={() => {
              const updated = !isFavorite;
              setIsFavorite(updated);
              saveDocument({ is_favorite: updated });
            }}
            className={`p-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition ${
              isFavorite ? 'text-amber-400 fill-amber-400' : 'text-neutral-400 hover:text-neutral-600'
            }`}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400' : ''}`} />
          </button>

          {/* Export Markdown */}
          <button
            onClick={handleExportMarkdown}
            className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
            title="Export as Markdown"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Delete Page */}
          {onDelete && (
            <button
              onClick={() => onDelete(doc.id)}
              className="p-1.5 rounded-md text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
              title="Delete Document"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Cover Image banner */}
      <CoverImage
        url={coverImage}
        onUpdate={(newCover) => {
          setCoverImage(newCover);
          saveDocument({ cover_image: newCover });
        }}
      />

      {/* Main document canvas */}
      <div className="w-full max-w-4xl mx-auto px-6 md:px-16 pt-8" onKeyDown={handleKeyDown}>
        {/* Page Icon Picker */}
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

        {/* Core BlockNote Editor Canvas */}
        <div className="min-h-[500px]">
          <BlockNoteView
            editor={editor}
            onChange={handleEditorChange}
            theme="light"
            className="notion-editor-styles"
          />
        </div>
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
