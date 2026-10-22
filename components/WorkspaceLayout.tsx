'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Document } from '@/lib/types';
import { useRouter } from 'next/navigation';
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

  // Load user info & documents
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

    async function loadDocs() {
      try {
        const data = await fetchAllDocuments();
        if (isMounted) {
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

    return () => {
      isMounted = false;
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
