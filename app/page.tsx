'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { WorkspaceLayout } from '@/components/WorkspaceLayout';
import { Document } from '@/lib/types';
import { fetchAllDocuments, DEFAULT_STARTER_DOC } from '@/lib/api/documents';
import { Loader2 } from 'lucide-react';

const Editor = dynamic(() => import('@/components/Editor'), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen items-center justify-center bg-white dark:bg-[#191919]">
      <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
    </div>
  ),
});

export default function HomePage() {
  const [currentDoc, setCurrentDoc] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadInitialDoc() {
      try {
        const docs = await fetchAllDocuments();
        if (!isMounted) return;
        const activeDocs = docs.filter((d) => !d.is_archived);

        if (activeDocs.length === 0) {
          setCurrentDoc(DEFAULT_STARTER_DOC);
          return;
        }

        // 1. Check if user previously opened a document on this device
        let targetDoc: Document | null = null;
        if (typeof window !== 'undefined') {
          const lastActiveId = localStorage.getItem('notion_last_active_doc');
          if (lastActiveId) {
            targetDoc = activeDocs.find((d) => d.id === lastActiveId) || null;
          }
        }

        // 2. If no valid last active doc, pick the most recently edited document
        if (!targetDoc) {
          const sorted = [...activeDocs].sort((a, b) => {
            const timeA = new Date(a.updated_at || a.created_at).getTime();
            const timeB = new Date(b.updated_at || b.created_at).getTime();
            return timeB - timeA;
          });
          targetDoc = sorted[0];
        }

        const chosen = targetDoc || activeDocs[0];
        if (typeof window !== 'undefined' && chosen?.id) {
          localStorage.setItem('notion_last_active_doc', chosen.id);
        }
        setCurrentDoc(chosen);
      } catch (err) {
        console.error('Fetch home doc error:', err);
        if (isMounted) setCurrentDoc(DEFAULT_STARTER_DOC);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadInitialDoc();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading || !currentDoc) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-[#191919]">
        <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <WorkspaceLayout activeDocId={currentDoc.id} initialDoc={currentDoc}>
      <Editor
        key={currentDoc.id}
        document={currentDoc}
        onUpdateDocument={(updated) => {
          setCurrentDoc((prev) => (prev ? { ...prev, ...updated } : null));
        }}
      />
    </WorkspaceLayout>
  );
}
