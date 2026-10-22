'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { WorkspaceLayout, DEFAULT_STARTER_DOC } from '@/components/WorkspaceLayout';
import { Document } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
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
  const supabase = createClient();

  useEffect(() => {
    async function fetchFirstDoc() {
      try {
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .eq('is_archived', false)
          .order('created_at', { ascending: true })
          .limit(1);

        if (!error && data && data.length > 0) {
          setCurrentDoc(data[0]);
        } else {
          setCurrentDoc(DEFAULT_STARTER_DOC);
        }
      } catch (err) {
        console.error('Fetch home doc error:', err);
        setCurrentDoc(DEFAULT_STARTER_DOC);
      } finally {
        setLoading(false);
      }
    }

    fetchFirstDoc();
  }, [supabase]);

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
