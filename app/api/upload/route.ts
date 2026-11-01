import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const DEFAULT_URL = 'https://dkualqsjkxojzjojilfh.supabase.co';
const DEFAULT_KEY_B64 = 'c2Jfc2VjcmV0XzVLV0hGcVVJQ2JaLTBadTl5M2Q5RmdfVlVtSm1LVVk=';

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

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const path = `files/${Date.now()}_${Math.random().toString(36).substring(2, 7)}_${cleanName}`;

    const supabase = getAdminClient();
    const { data, error } = await supabase.storage
      .from('attachments')
      .upload(path, buffer, {
        contentType: file.type || 'application/octet-stream',
        upsert: true,
      });

    if (error) {
      console.error('Storage upload error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: publicUrlData } = supabase.storage
      .from('attachments')
      .getPublicUrl(path);

    return NextResponse.json({
      url: publicUrlData.publicUrl,
      name: file.name,
      size: file.size,
      type: file.type || 'application/octet-stream',
    });
  } catch (err: any) {
    console.error('Upload route error:', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
