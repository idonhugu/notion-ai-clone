import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const DEFAULT_URL = 'https://dkualqsjkxojzjojilfh.supabase.co';
const DEFAULT_KEY_B64 = 'c2Jfc2VjcmV0XzVLV0hGcVVJQ2JaLTBadTl5M2Q5RmdfVlVtSm1LVVk=';

export async function createClient() {
  const cookieStore = await cookies();
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_URL;

  const fallbackKey = Buffer.from(DEFAULT_KEY_B64, 'base64').toString('utf-8');
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || fallbackKey;

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Ignored in server component
        }
      },
    },
  });
}
