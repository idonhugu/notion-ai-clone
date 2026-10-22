'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Document } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface WorkspaceLayoutProps {
  children: React.ReactNode;
  activeDocId?: string;
  initialDoc?: Document;
}

const DEFAULT_STARTER_DOC: Document = {
  id: 'welcome-page',
  user_id: 'default-user',
  title: 'Welcome to Notion AI',
  icon: '🚀',
  cover_image:
    'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1600&auto=format&fit=crop&q=80',
  parent_id: null,
  is_favorite: true,
  is_archived: false,
  attachments: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  content: [
    {
      id: 'b-1',
      type: 'heading',
      props: { level: 1 },
      content: [{ type: 'text', text: 'Welcome to your Notion AI Workspace' }],
    },
    {
      id: 'b-2',
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'This is a complete Notion workspace powered by Next.js, BlockNote, and Google Gemini AI. Everything saves automatically in real time.',
        },
      ],
    },
    {
      id: 'b-3',
      type: 'checkListItem',
      props: { checked: true },
      content: [{ type: 'text', text: 'Fast block-based editing with slash commands (/)' }],
    },
    {
      id: 'b-4',
      type: 'checkListItem',
      props: { checked: false },
      content: [{ type: 'text', text: 'Press Space on an empty block to trigger Ask Notion AI' }],
    },
    {
      id: 'b-5',
      type: 'checkListItem',
      props: { checked: false },
      content: [{ type: 'text', text: 'Highlight any text to fix spelling, summarize, or lengthen' }],
    },
    {
      id: 'b-6',
      type: 'checkListItem',
      props: { checked: false },
      content: [{ type: 'text', text: 'Upload files and documents using the attachment bar below' }],
    },
    {
      id: 'b-7',
      type: 'heading',
      props: { level: 2 },
      content: [{ type: 'text', text: 'Google Gemini AI Capabilities' }],
    },
    {
      id: 'b-8',
      type: 'bulletListItem',
      content: [
        {
          type: 'text',
          text: 'Real-time streaming responses rendered directly into native editor blocks',
        },
      ],
    },
    {
      id: 'b-9',
      type: 'bulletListItem',
      content: [
        {
          type: 'text',
          text: 'Tone transformation (Professional, Casual, Concise) and summarization',
        },
      ],
    },
    {
      id: 'b-10',
      type: 'bulletListItem',
      content: [
        {
          type: 'text',
          text: 'Press ⌘+K at any time to quick-search through all your workspace documents',
        },
      ],
    },
    {
      id: 'b-11',
      type: 'paragraph',
      content: [],
    },
  ],
};

export function WorkspaceLayout({
  children,
  activeDocId,
  initialDoc,
}: WorkspaceLayoutProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
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

    async function loadDocs() {
      try {
        const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;

        if (hasSupabaseUrl) {
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (user) {
            setUserEmail(user.email || 'Laksha');
          }

          const { data, error } = await supabase
            .from('documents')
            .select('*')
            .order('created_at', { ascending: true });

          if (!error && data && data.length > 0) {
            setDocuments(data);
          } else {
            // Seed starter doc in Supabase if empty
            if (user) {
              const starterWithUser = {
                ...DEFAULT_STARTER_DOC,
                id: undefined,
                user_id: user.id,
              };
              const { data: seeded } = await supabase
                .from('documents')
                .insert(starterWithUser)
                .select()
                .single();

              if (seeded) {
                setDocuments([seeded]);
              } else {
                setDocuments([DEFAULT_STARTER_DOC]);
              }
            } else {
              setDocuments([DEFAULT_STARTER_DOC]);
            }
          }
        } else {
          // Local storage fallback
          const localDocsStr = localStorage.getItem('notion_ai_docs');
          if (localDocsStr) {
            try {
              const parsed: Document[] = JSON.parse(localDocsStr);
              if (Array.isArray(parsed) && parsed.length > 0) {
                // Sanitize duplicate rockets from old versions
                const sanitized = parsed.map((d) => ({
                  ...d,
                  title: d.title ? d.title.replace(/^🚀\s*/, '') : 'Untitled',
                }));
                setDocuments(sanitized);
              } else {
                setDocuments([DEFAULT_STARTER_DOC]);
              }
            } catch {
              setDocuments([DEFAULT_STARTER_DOC]);
            }
          } else {
            setDocuments([DEFAULT_STARTER_DOC]);
            localStorage.setItem('notion_ai_docs', JSON.stringify([DEFAULT_STARTER_DOC]));
          }
        }
      } catch (err) {
        console.error('Failed to load documents:', err);
        setDocuments([DEFAULT_STARTER_DOC]);
      } finally {
        setLoading(false);
      }
    }

    loadDocs();
  }, [supabase]);

  // Handle document additions
  const handleDocumentCreated = (newDoc: Document) => {
    setDocuments((prev) => {
      const updated = [...prev, newDoc];
      if (typeof window !== 'undefined') {
        localStorage.setItem('notion_ai_docs', JSON.stringify(updated));
      }
      return updated;
    });
  };

  // Handle document archiving to trash
  const handleDocumentArchived = async (id: string) => {
    const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (hasSupabaseUrl) {
      await supabase.from('documents').update({ is_archived: true }).eq('id', id);
    }

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
    const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (hasSupabaseUrl) {
      await supabase.from('documents').update({ is_archived: false }).eq('id', id);
    }

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
    const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (hasSupabaseUrl) {
      await supabase.from('documents').delete().eq('id', id);
    }

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
    const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (hasSupabaseUrl) {
      await supabase.from('documents').update({ is_favorite: isFav }).eq('id', id);
    }

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
