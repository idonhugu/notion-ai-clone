'use client';

import React, { useState, useEffect } from 'react';
import nextDynamic from 'next/dynamic';
import { WorkspaceLayout } from '@/components/WorkspaceLayout';
import { Document } from '@/lib/types';
import { fetchAllDocuments, DEFAULT_STARTER_DOC } from '@/lib/api/documents';
import { Loader2 } from 'lucide-react';

const Editor = nextDynamic(() => import('@/components/Editor'), {
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

        // Sort active docs by updated_at descending so the most recently edited work in the cloud is always first
        const sorted = [...activeDocs].sort((a, b) => {
          const timeA = new Date(a.updated_at || a.created_at).getTime();
          const timeB = new Date(b.updated_at || b.created_at).getTime();
          return timeB - timeA;
        });

        // If user actively navigated to a doc on this device within the last 15 minutes, keep it; otherwise open the freshest cloud doc
        let targetDoc: Document = sorted[0];
        if (typeof window !== 'undefined') {
          const lastActiveId = localStorage.getItem('notion_last_active_doc');
          const lastActiveTime = localStorage.getItem('notion_last_active_time');
          const isRecent = lastActiveTime && Date.now() - Number(lastActiveTime) < 15 * 60 * 1000;
          if (isRecent && lastActiveId) {
            const matched = activeDocs.find((d) => d.id === lastActiveId);
            if (matched) targetDoc = matched;
          }
        }

        const chosen = targetDoc || activeDocs[0];
        if (typeof window !== 'undefined' && chosen?.id) {
          localStorage.setItem('notion_last_active_doc', chosen.id);
          localStorage.setItem('notion_last_active_time', String(Date.now()));
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
