import { Document } from '@/lib/types';

export const DEFAULT_STARTER_DOC: Document = {
  id: '06a072bf-5084-42c5-9c8d-008265f928e7',
  user_id: 'admin-user',
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
          text: 'This workspace is synced to your Supabase PostgreSQL cloud database. Notes, attached documents, PDFs, and Kanban tasks update seamlessly across all your devices.',
        },
      ],
    },
    {
      id: 'b-3',
      type: 'checkListItem',
      props: { checked: true },
      content: [{ type: 'text', text: 'Cloud database connected & syncing everywhere' }],
    },
    {
      id: 'b-4',
      type: 'checkListItem',
      props: { checked: true },
      content: [{ type: 'text', text: 'Google Gemini 3.5 Flash streaming active' }],
    },
    {
      id: 'b-5',
      type: 'checkListItem',
      props: { checked: false },
      content: [{ type: 'text', text: 'Press Space on an empty line to ask Notion AI' }],
    },
    {
      id: 'b-6',
      type: 'checkListItem',
      props: { checked: false },
      content: [{ type: 'text', text: 'Upload PDFs to summarize or extract study notes' }],
    },
    {
      id: 'b-7',
      type: 'checkListItem',
      props: { checked: false },
      content: [{ type: 'text', text: 'Click "Ask AI" in the top bar to open Copilot Sidecar' }],
    },
  ],
};

export async function fetchAllDocuments(): Promise<Document[]> {
  try {
    const res = await fetch('/api/documents', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch documents');
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('notion_ai_docs', JSON.stringify(data));
      }
      return data;
    }
  } catch (err) {
    console.warn('Falling back to local cache for documents:', err);
  }

  // Fallback to localStorage
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem('notion_ai_docs');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
  }

  return [DEFAULT_STARTER_DOC];
}

export async function fetchDocumentById(
  id: string
): Promise<{ document: Document | null; parentDocument: Document | null }> {
  try {
    const res = await fetch(`/api/documents/${id}`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data?.document) {
        if (typeof window !== 'undefined') {
          localStorage.setItem(`doc_${id}`, JSON.stringify(data.document));
        }
        return {
          document: data.document,
          parentDocument: data.parentDocument || null,
        };
      }
    }
  } catch (err) {
    console.warn(`Cloud fetch failed for doc ${id}, trying cache:`, err);
  }

  // Fallback to localStorage
  if (typeof window !== 'undefined') {
    const cachedSingle = localStorage.getItem(`doc_${id}`);
    if (cachedSingle) {
      try {
        const doc = JSON.parse(cachedSingle);
        return { document: doc, parentDocument: null };
      } catch {}
    }

    const cachedList = localStorage.getItem('notion_ai_docs');
    if (cachedList) {
      try {
        const list: Document[] = JSON.parse(cachedList);
        const match = list.find((d) => d.id === id);
        if (match) return { document: match, parentDocument: null };
      } catch {}
    }
  }

  if (id === DEFAULT_STARTER_DOC.id || id === 'welcome-page') {
    return { document: DEFAULT_STARTER_DOC, parentDocument: null };
  }

  return { document: null, parentDocument: null };
}

export async function createDocument(
  payload: Partial<Document>
): Promise<Document> {
  try {
    const res = await fetch('/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const doc = await res.json();
      if (doc?.id) {
        if (typeof window !== 'undefined') {
          localStorage.setItem(`doc_${doc.id}`, JSON.stringify(doc));
        }
        return doc;
      }
    }
  } catch (err) {
    console.error('Failed to create doc in cloud:', err);
  }

  // Offline / local fallback with valid UUID
  const localId = crypto.randomUUID();
  const fallback: Document = {
    id: localId,
    user_id: 'admin-user',
    title: payload.title || 'Untitled',
    content: payload.content || [],
    parent_id: payload.parent_id || null,
    is_favorite: !!payload.is_favorite,
    is_archived: !!payload.is_archived,
    icon: payload.icon || '📄',
    cover_image: payload.cover_image || null,
    attachments: payload.attachments || [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(`doc_${localId}`, JSON.stringify(fallback));
  }

  return fallback;
}

export async function updateDocument(
  id: string,
  payload: Partial<Document>
): Promise<Document | null> {
  try {
    const res = await fetch(`/api/documents/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const updated = await res.json();
      if (typeof window !== 'undefined') {
        localStorage.setItem(`doc_${id}`, JSON.stringify(updated));
      }
      return updated;
    }
  } catch (err) {
    console.error(`Failed to update doc ${id} in cloud:`, err);
  }

  // Local cache update
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(`doc_${id}`);
    if (cached) {
      try {
        const doc = { ...JSON.parse(cached), ...payload, updated_at: new Date().toISOString() };
        localStorage.setItem(`doc_${id}`, JSON.stringify(doc));
        return doc;
      } catch {}
    }
  }

  return null;
}

export async function deleteDocument(
  id: string,
  permanent = false
): Promise<boolean> {
  try {
    const res = await fetch(`/api/documents/${id}?permanent=${permanent}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (err) {
    console.error(`Failed to delete doc ${id}:`, err);
    return false;
  }
}
