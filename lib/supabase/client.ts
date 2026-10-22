import { createBrowserClient } from '@supabase/ssr';

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

const DEFAULT_URL = 'https://dkualqsjkxojzjojilfh.supabase.co';
const DEFAULT_KEY_B64 = 'c2Jfc2VjcmV0XzVLV0hGcVVJQ2JaLTBadTl5M2Q5RmdfVlVtSm1LVVk=';

export function createClient() {
  if (browserClient) return browserClient;

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_URL;

  const fallbackKey =
    typeof window !== 'undefined'
      ? atob(DEFAULT_KEY_B64)
      : Buffer.from(DEFAULT_KEY_B64, 'base64').toString('utf-8');

  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || fallbackKey;

  browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
  return browserClient;
}
