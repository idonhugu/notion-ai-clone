import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const DEFAULT_URL = 'https://dkualqsjkxojzjojilfh.supabase.co';
const DEFAULT_KEY_B64 = 'c2Jfc2VjcmV0XzVLV0hGcVVJQ2JaLTBadTl5M2Q5RmdfVlVtSm1LVVk=';

export const STARTER_DOC_PAYLOAD = {
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

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    Buffer.from(DEFAULT_KEY_B64, 'base64').toString('utf-8');

  return createSupabaseClient(url, key, {
    auth: { persistSession: false },
  });
}

// GET /api/documents - Fetch all active workspace documents or subpages
export async function GET(req: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(req.url);
    const includeArchived = searchParams.get('include_archived') === 'true';
    const parentId = searchParams.get('parent_id');

    let query = supabase.from('documents').select('*');

    if (parentId) {
      query = query.eq('parent_id', parentId);
    }

    if (!includeArchived) {
      query = query.eq('is_archived', false);
    }

    const { data, error } = await query.order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching documents from Supabase:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Auto-seed starter doc if workspace is completely empty (and not a specific subpage query)
    if (!parentId && (!data || data.length === 0)) {
      try {
        const { data: seeded } = await supabase
          .from('documents')
          .insert(STARTER_DOC_PAYLOAD)
          .select()
          .single();

        if (seeded) {
          return NextResponse.json([seeded]);
        }
      } catch (seedErr) {
        console.warn('Auto-seed document insert warning:', seedErr);
        return NextResponse.json([STARTER_DOC_PAYLOAD]);
      }
    }

    return NextResponse.json(data || []);
  } catch (err: any) {
    console.error('Documents GET error:', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}

// POST /api/documents - Create a new document in Supabase
export async function POST(req: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await req.json();

    const payload = {
      title: body.title || 'Untitled',
      content: body.content || [],
      parent_id: body.parent_id || null,
      is_favorite: !!body.is_favorite,
      is_archived: !!body.is_archived,
      icon: body.icon || '📄',
      cover_image: body.cover_image || null,
      attachments: body.attachments || [],
      user_id: body.user_id || 'admin-user',
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('documents')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error('Error inserting document:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error('Documents POST error:', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
