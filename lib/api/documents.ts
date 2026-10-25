import { Document } from '@/lib/types';

export const DEFAULT_STARTER_DOC: Document = {
  id: '06a072bf-5084-42c5-9c8d-008265f928e7',
  user_id: 'admin-user',
  title: "Welcome to Laksha's WorkSpace",
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
      content: [{ type: 'text', text: "Welcome to Laksha's WorkSpace" }],
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
      content: [{ type: 'text', text: 'Google Gemini Flash streaming active' }],
    },
    {
      id: 'b-5',
      type: 'checkListItem',
      props: { checked: false },
      content: [{ type: 'text', text: "Press Space on an empty line to ask Laksha's AI" }],
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

export function safeSetStorage(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, value);
  } catch (err) {
    console.warn(`localStorage quota exceeded or error for "${key}":`, err);
  }
}

export function toLightDoc(d: any): Partial<Document> & { id: string } {
  return {
    id: d.id,
    user_id: d.user_id,
    title: d.title || 'Untitled',
    parent_id: d.parent_id || null,
    is_favorite: !!d.is_favorite,
    is_archived: !!d.is_archived,
    icon: d.icon || '📄',
    cover_image: d.cover_image || null,
    created_at: d.created_at,
    updated_at: d.updated_at,
  };
}

export async function fetchAllDocuments(): Promise<Document[]> {
  try {
    const res = await fetch(`/api/documents?_t=${Date.now()}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
    });
    if (!res.ok) throw new Error('Failed to fetch documents');
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      if (typeof window !== 'undefined') {
        // Cache lightweight metadata only, never multi-megabyte block content
        // This keeps localStorage well under 60 KB, preventing mobile Safari quota errors
        const lightList = data.map(toLightDoc);
        safeSetStorage('notion_ai_docs', JSON.stringify(lightList));
      }
      return data;
    }
  } catch (err) {
    console.warn('Falling back to local cache for documents:', err);
  }

  // Fallback to localStorage only if network totally unreachable
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem('notion_ai_docs');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        // Only return cache if it contains actual workspace documents (not stale single starter doc)
        if (Array.isArray(parsed) && parsed.length > 1) return parsed;
        if (
          Array.isArray(parsed) &&
          parsed.length === 1 &&
          parsed[0].id !== DEFAULT_STARTER_DOC.id &&
          !parsed[0].title?.toLowerCase().includes('welcome')
        ) {
          return parsed;
        }
      } catch {}
    }
  }

  return [DEFAULT_STARTER_DOC];
}

export async function fetchDocumentById(
  id: string
): Promise<{ document: Document | null; parentDocument: Document | null }> {
  try {
    const res = await fetch(`/api/documents/${id}?_t=${Date.now()}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.document) {
        if (typeof window !== 'undefined') {
          safeSetStorage(`doc_${id}`, JSON.stringify(data.document));
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
          safeSetStorage(`doc_${doc.id}`, JSON.stringify(doc));

          const cachedList = localStorage.getItem('notion_ai_docs');
          if (cachedList) {
            try {
              const list: Document[] = JSON.parse(cachedList);
              if (!list.some((d) => d.id === doc.id)) {
                safeSetStorage('notion_ai_docs', JSON.stringify([...list.map(toLightDoc), toLightDoc(doc)]));
              }
            } catch {}
          }

          window.dispatchEvent(
            new CustomEvent('notion:doc_created', { detail: doc })
          );
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
    safeSetStorage(`doc_${localId}`, JSON.stringify(fallback));

    const cachedList = localStorage.getItem('notion_ai_docs');
    if (cachedList) {
      try {
        const list: Document[] = JSON.parse(cachedList);
        safeSetStorage('notion_ai_docs', JSON.stringify([...list.map(toLightDoc), toLightDoc(fallback)]));
      } catch {}
    }

    window.dispatchEvent(
      new CustomEvent('notion:doc_created', { detail: fallback })
    );
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
        safeSetStorage(`doc_${id}`, JSON.stringify(updated));

        const cachedList = localStorage.getItem('notion_ai_docs');
        if (cachedList) {
          try {
            const list: Document[] = JSON.parse(cachedList);
            const idx = list.findIndex((d) => d.id === id);
            if (idx !== -1) {
              list[idx] = { ...list[idx], ...toLightDoc(updated) };
              safeSetStorage('notion_ai_docs', JSON.stringify(list.map(toLightDoc)));
            }
          } catch {}
        }

        window.dispatchEvent(
          new CustomEvent('notion:doc_updated', {
            detail: { id, ...updated },
          })
        );
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
        safeSetStorage(`doc_${id}`, JSON.stringify(doc));

        const cachedList = localStorage.getItem('notion_ai_docs');
        if (cachedList) {
          try {
            const list: Document[] = JSON.parse(cachedList);
            const idx = list.findIndex((d) => d.id === id);
            if (idx !== -1) {
              list[idx] = { ...list[idx], ...toLightDoc(doc) };
              safeSetStorage('notion_ai_docs', JSON.stringify(list.map(toLightDoc)));
            }
          } catch {}
        }

        window.dispatchEvent(
          new CustomEvent('notion:doc_updated', {
            detail: { id, ...doc },
          })
        );
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
    const ok = res.ok;
    if (ok && typeof window !== 'undefined') {
      if (permanent) {
        localStorage.removeItem(`doc_${id}`);
      }
      const cachedList = localStorage.getItem('notion_ai_docs');
      if (cachedList) {
        try {
          const list: Document[] = JSON.parse(cachedList);
          const updatedList = permanent
            ? list.filter((d) => d.id !== id)
            : list.map((d) => (d.id === id ? { ...d, is_archived: true } : d));
          safeSetStorage('notion_ai_docs', JSON.stringify(updatedList.map(toLightDoc)));
        } catch {}
      }

      window.dispatchEvent(
        new CustomEvent('notion:doc_deleted', { detail: { id, permanent } })
      );
    }
    return ok;
  } catch (err) {
    console.error(`Failed to delete doc ${id}:`, err);
    return false;
  }
}
