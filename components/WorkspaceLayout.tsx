'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Document } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  fetchAllDocuments,
  updateDocument,
  deleteDocument,
  DEFAULT_STARTER_DOC,
} from '@/lib/api/documents';

interface WorkspaceLayoutProps {
  children: React.ReactNode;
  activeDocId?: string;
  initialDoc?: Document;
}

export function WorkspaceLayout({
  children,
  activeDocId,
  initialDoc,
}: WorkspaceLayoutProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>('Laksha');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load user info & documents with multi-device Supabase Realtime & mobile auto-sync
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('notion_user');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setUserEmail(parsed.name || parsed.username || 'Laksha');
        } catch {}
      }
    }

    let isMounted = true;
    const supabase = createClient();

    async function loadDocs() {
      try {
        const data = await fetchAllDocuments();
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setDocuments(data);
        }
      } catch (err) {
        console.error('Failed to load documents:', err);
        if (isMounted) {
          setDocuments([DEFAULT_STARTER_DOC]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadDocs();

    // 1. Multi-device Supabase Realtime subscription
    const channel = supabase
      .channel('realtime_documents_global')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'documents' },
        (payload: any) => {
          if (!isMounted) return;
          if (payload.eventType === 'INSERT' && payload.new) {
            const newDoc = payload.new as Document;
            setDocuments((prev) => {
              if (prev.some((d) => d.id === newDoc.id)) return prev;
              return [newDoc, ...prev];
            });
            window.dispatchEvent(new CustomEvent('notion:doc_created', { detail: newDoc }));
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            const updated = payload.new as Document;
            setDocuments((prev) =>
              prev.map((d) => (d.id === updated.id ? { ...d, ...updated } : d))
            );
            window.dispatchEvent(new CustomEvent('notion:doc_updated', { detail: updated }));
          } else if (payload.eventType === 'DELETE' && payload.old) {
            const deletedId = payload.old.id;
            setDocuments((prev) => prev.filter((d) => d.id !== deletedId));
            window.dispatchEvent(
              new CustomEvent('notion:doc_deleted', { detail: { id: deletedId, permanent: true } })
            );
          }
        }
      )
      .subscribe();

    // 2. Mobile automatic re-sync on tab focus or screen unlock
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        loadDocs();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('focus', handleVisibilityOrFocus);
    window.addEventListener('notion:sync_requested', loadDocs);

    // 3. Local DOM custom events
    const handleDocUpdated = (e: Event) => {
      const { detail } = e as CustomEvent<Partial<Document> & { id: string }>;
      if (detail && detail.id) {
        setDocuments((prev) =>
          prev.map((d) => (d.id === detail.id ? { ...d, ...detail } : d))
        );
      }
    };

    const handleDocCreated = (e: Event) => {
      const { detail } = e as CustomEvent<Document>;
      if (detail && detail.id) {
        setDocuments((prev) => {
          if (prev.some((d) => d.id === detail.id)) return prev;
          return [detail, ...prev];
        });
      }
    };

    const handleDocDeleted = (e: Event) => {
      const { detail } = e as CustomEvent<{ id: string; permanent?: boolean }>;
      if (detail && detail.id) {
        setDocuments((prev) =>
          detail.permanent
            ? prev.filter((d) => d.id !== detail.id)
            : prev.map((d) => (d.id === detail.id ? { ...d, is_archived: true } : d))
        );
      }
    };

    window.addEventListener('notion:doc_updated', handleDocUpdated);
    window.addEventListener('notion:doc_created', handleDocCreated);
    window.addEventListener('notion:doc_deleted', handleDocDeleted);

    return () => {
      isMounted = false;
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      window.removeEventListener('notion:sync_requested', loadDocs);
      window.removeEventListener('notion:doc_updated', handleDocUpdated);
      window.removeEventListener('notion:doc_created', handleDocCreated);
      window.removeEventListener('notion:doc_deleted', handleDocDeleted);
      supabase.removeChannel(channel);
    };
  }, []);

  // Handle document additions
  const handleDocumentCreated = (newDoc: Document) => {
    setDocuments((prev) => {
      const updated = [...prev.filter((d) => d.id !== newDoc.id), newDoc];
      if (typeof window !== 'undefined') {
        localStorage.setItem('notion_ai_docs', JSON.stringify(updated));
      }
      return updated;
    });
  };

  // Handle document archiving to trash
  const handleDocumentArchived = async (id: string) => {
    await updateDocument(id, { is_archived: true });

    setDocuments((prev) => {
      const updated = prev.map((d) => (d.id === id ? { ...d, is_archived: true } : d));
      if (typeof window !== 'undefined') {
        localStorage.setItem('notion_ai_docs', JSON.stringify(updated));
      }
      return updated;
    });

    if (activeDocId === id) {
      router.push('/');
    }
  };

  // Handle restoring from trash
  const handleRestoreDocument = async (id: string) => {
    await updateDocument(id, { is_archived: false });

    setDocuments((prev) => {
      const updated = prev.map((d) => (d.id === id ? { ...d, is_archived: false } : d));
      if (typeof window !== 'undefined') {
        localStorage.setItem('notion_ai_docs', JSON.stringify(updated));
      }
      return updated;
    });
  };

  // Handle permanent deletion
  const handlePermanentDelete = async (id: string) => {
    await deleteDocument(id, true);

    setDocuments((prev) => {
      const updated = prev.filter((d) => d.id !== id);
      if (typeof window !== 'undefined') {
        localStorage.setItem('notion_ai_docs', JSON.stringify(updated));
      }
      return updated;
    });
  };

  // Handle favorite toggle
  const handleToggleFavorite = async (id: string, isFav: boolean) => {
    await updateDocument(id, { is_favorite: isFav });

    setDocuments((prev) => {
      const updated = prev.map((d) => (d.id === id ? { ...d, is_favorite: isFav } : d));
      if (typeof window !== 'undefined') {
        localStorage.setItem('notion_ai_docs', JSON.stringify(updated));
      }
      return updated;
    });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-[#191919] transition-colors">
      <Sidebar
        documents={documents}
        onDocumentCreated={handleDocumentCreated}
        onDocumentDeleted={handleDocumentArchived}
        onRestoreDocument={handleRestoreDocument}
        onPermanentDeleteDocument={handlePermanentDelete}
        onToggleFavorite={handleToggleFavorite}
        userEmail={userEmail}
      />
      <main className="flex-1 overflow-y-auto relative bg-white dark:bg-[#191919]">
        {children}
      </main>
    </div>
  );
}

export { DEFAULT_STARTER_DOC };
