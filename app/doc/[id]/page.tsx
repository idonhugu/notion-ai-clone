'use client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import nextDynamic from 'next/dynamic';
import { WorkspaceLayout } from '@/components/WorkspaceLayout';
import { Document } from '@/lib/types';
import { fetchDocumentById } from '@/lib/api/documents';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const Editor = nextDynamic(() => import('@/components/Editor'), {
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

  useEffect(() => {
    let isMounted = true;

    async function loadDoc() {
      if (!id) return;
      setLoading(true);
      setNotFound(false);

      try {
        const { document: docData, parentDocument: parentData } = await fetchDocumentById(id);

        if (!isMounted) return;

        if (docData) {
          setDocument(docData);
          setParentDocument(parentData);
          setNotFound(false);
          if (typeof window !== 'undefined') {
            localStorage.setItem('notion_last_active_doc', docData.id);
            localStorage.setItem('notion_last_active_time', String(Date.now()));
          }
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error('Error loading doc:', err);
        if (isMounted) setNotFound(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadDoc();

    return () => {
      isMounted = false;
    };
  }, [id]);

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
        <div className="flex flex-col items-center justify-center h-full p-8 text-center min-h-[70vh]">
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
