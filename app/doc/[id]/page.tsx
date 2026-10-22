'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { WorkspaceLayout, DEFAULT_STARTER_DOC } from '@/components/WorkspaceLayout';
import { Document } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const Editor = dynamic(() => import('@/components/Editor'), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen items-center justify-center bg-white dark:bg-[#191919]">
      <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
    </div>
  ),
});

function DocumentContent() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const [document, setDocument] = useState<Document | null>(null);
  const [parentDocument, setParentDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function loadDoc() {
      if (!id) return;
      setLoading(true);

      try {
        const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;

        if (hasSupabaseUrl) {
          const { data, error } = await supabase
            .from('documents')
            .select('*')
            .eq('id', id)
            .single();

          if (error || !data) {
            if (id === DEFAULT_STARTER_DOC.id) {
              setDocument(DEFAULT_STARTER_DOC);
            } else {
              setNotFound(true);
            }
          } else {
            const cleanDoc = {
              ...data,
              title: data.title ? data.title.replace(/^🚀\s*/, '') : 'Untitled',
            };
            setDocument(cleanDoc);

            if (data.parent_id) {
              const { data: parentData } = await supabase
                .from('documents')
                .select('*')
                .eq('id', data.parent_id)
                .single();
              if (parentData) setParentDocument(parentData);
            }
          }
        } else {
          // Check local storage fallback
          const localDocs = localStorage.getItem('notion_ai_docs');
          if (localDocs) {
            const parsed: Document[] = JSON.parse(localDocs);
            const found = parsed.find((d) => d.id === id);
            if (found) {
              const cleanDoc = {
                ...found,
                title: found.title ? found.title.replace(/^🚀\s*/, '') : 'Untitled',
              };
              setDocument(cleanDoc);
              if (cleanDoc.parent_id) {
                const parent = parsed.find((d) => d.id === cleanDoc.parent_id);
                if (parent) setParentDocument(parent);
              }
            } else if (id === DEFAULT_STARTER_DOC.id) {
              setDocument(DEFAULT_STARTER_DOC);
            } else {
              setNotFound(true);
            }
          } else if (id === DEFAULT_STARTER_DOC.id) {
            setDocument(DEFAULT_STARTER_DOC);
          } else {
            setNotFound(true);
          }
        }
      } catch (err) {
        console.error('Error loading doc:', err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    loadDoc();
  }, [id, supabase]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-[#191919]">
        <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
      </div>
    );
  }

  if (notFound || !document) {
    return (
      <WorkspaceLayout activeDocId={id}>
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <div className="text-4xl mb-3">📄</div>
          <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">
            Document not found
          </h2>
          <p className="text-sm text-neutral-500 mt-1 max-w-sm mb-6">
            This document may have been deleted, or you might not have permission to view it.
          </p>
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white text-xs font-medium hover:bg-purple-700 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Workspace
          </Link>
        </div>
      </WorkspaceLayout>
    );
  }

  return (
    <WorkspaceLayout activeDocId={document.id} initialDoc={document}>
      <Editor
        key={document.id}
        document={document}
        parentDocument={parentDocument}
        onDelete={(delId) => {
          router.push('/');
        }}
        onUpdateDocument={(updated) => {
          setDocument((prev) => (prev ? { ...prev, ...updated } : null));
        }}
      />
    </WorkspaceLayout>
  );
}

export default function DocumentPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-white dark:bg-[#191919]">
          <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
        </div>
      }
    >
      <DocumentContent />
    </Suspense>
  );
}
