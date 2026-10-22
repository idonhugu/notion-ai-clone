'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Plus,
  Loader2,
  ChevronRight,
  ExternalLink,
  Trash2,
  FolderOpen,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { createDocument, updateDocument } from '@/lib/api/documents';
import { Document } from '@/lib/types';

interface SubPagesListProps {
  currentDocId: string;
}

export function SubPagesList({ currentDocId }: SubPagesListProps) {
  const [subpages, setSubpages] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    let isMounted = true;
    async function fetchSubpages() {
      try {
        const res = await fetch(`/api/documents?parent_id=${currentDocId}`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (isMounted && Array.isArray(data)) {
            setSubpages(data);
          }
        }
      } catch (err) {
        console.error('Error fetching subpages:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (currentDocId) {
      fetchSubpages();
    }

    return () => {
      isMounted = false;
    };
  }, [currentDocId]);

  const handleCreateSubpage = async () => {
    setIsCreating(true);
    try {
      const created = await createDocument({
        title: 'Untitled Sub-page',
        parent_id: currentDocId,
        user_id: 'admin-user',
        icon: '📄',
        is_favorite: false,
        is_archived: false,
        content: [],
        attachments: [],
      });

      if (created?.id) {
        router.push(`/doc/${created.id}`);
      }
    } catch (err) {
      console.error('Failed to create subpage:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteSubpage = async (e: React.MouseEvent, subId: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await updateDocument(subId, { is_archived: true });
      setSubpages((prev) => prev.filter((p) => p.id !== subId));
    } catch (err) {
      console.error('Failed to archive subpage:', err);
    }
  };

  return (
    <div className="my-6 pt-4 border-t border-neutral-100 dark:border-neutral-800/80">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FolderOpen className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-300 uppercase tracking-wider">
            Sub-pages & Child Documents ({subpages.length})
          </span>
        </div>

        <button
          onClick={handleCreateSubpage}
          disabled={isCreating}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/50 border border-purple-200/60 dark:border-purple-800/60 transition shadow-xs"
        >
          {isCreating ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Plus className="w-3 h-3" />
          )}
          <span>New Sub-page</span>
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center gap-2 py-3 text-xs text-neutral-400">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Loading nested documents...</span>
        </div>
      )}

      {/* Empty State */}
      {!loading && subpages.length === 0 && (
        <div className="p-4 rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-[#1f1f1f]/30 flex flex-col items-center justify-center text-center">
          <FileText className="w-5 h-5 text-neutral-300 dark:text-neutral-600 mb-1.5" />
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            No nested documents inside this note yet.
          </p>
          <button
            onClick={handleCreateSubpage}
            disabled={isCreating}
            className="text-xs text-purple-600 dark:text-purple-400 hover:underline font-medium mt-1 flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            <span>Add a document within this note</span>
          </button>
        </div>
      )}

      {/* Grid of Sub-pages */}
      {!loading && subpages.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {subpages.map((sub) => (
            <Link
              key={sub.id}
              href={`/doc/${sub.id}`}
              className="group relative flex items-center justify-between p-3 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-[#202020] hover:border-purple-300 dark:hover:border-purple-800/80 hover:shadow-sm transition"
            >
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <span className="text-base flex-shrink-0">{sub.icon || '📄'}</span>
                <div className="truncate">
                  <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition truncate">
                    {sub.title || 'Untitled'}
                  </div>
                  <div className="text-[10px] text-neutral-400">
                    Updated {new Date(sub.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => handleDeleteSubpage(e, sub.id)}
                  title="Archive subpage"
                  className="p-1 rounded text-neutral-400 hover:text-red-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
