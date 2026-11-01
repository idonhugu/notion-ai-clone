const DEFAULT_URL = 'https://dkualqsjkxojzjojilfh.supabase.co';
const DEFAULT_KEY_B64 = 'c2Jfc2VjcmV0XzVLV0hGcVVJQ2JaLTBadTl5M2Q5RmdfVlVtSm1LVVk=';

/**
 * Uploads a file and returns a permanent public HTTPS URL.
 * 1. Primary: POST /api/upload (server-side upload to Supabase Storage)
 * 2. Fallback for large files (> 4MB): Direct upload to Supabase Storage
 * 3. Final fallback: Local Data URL
 */
export async function uploadFileToStorage(file: File): Promise<{
  url: string;
  name: string;
  size: number;
  type: string;
}> {
  // If file is smaller than 4MB, use /api/upload
  if (file.size < 4 * 1024 * 1024) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          return {
            url: data.url,
            name: file.name,
            size: file.size,
            type: file.type || 'application/octet-stream',
          };
        }
      }
    } catch (err) {
      console.warn('/api/upload failed, trying direct Supabase Storage upload:', err);
    }
  }

  // Direct upload to Supabase Storage REST API
  try {
    const cleanKey =
      typeof window !== 'undefined'
        ? atob(DEFAULT_KEY_B64)
        : Buffer.from(DEFAULT_KEY_B64, 'base64').toString('utf-8');

    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const path = `files/${Date.now()}_${Math.random().toString(36).substring(2, 7)}_${cleanName}`;

    const res = await fetch(`${DEFAULT_URL}/storage/v1/object/attachments/${path}`, {
      method: 'POST',
      headers: {
        apikey: cleanKey,
        Authorization: `Bearer ${cleanKey}`,
        'Content-Type': file.type || 'application/octet-stream',
      },
      body: file,
    });

    if (res.ok) {
      const publicUrl = `${DEFAULT_URL}/storage/v1/object/public/attachments/${path}`;
      return {
        url: publicUrl,
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
      };
    }
  } catch (err) {
    console.warn('Direct storage upload failed, falling back to data URL:', err);
  }

  // Fallback to Data URL
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  return {
    url: dataUrl,
    name: file.name,
    size: file.size,
    type: file.type || 'application/octet-stream',
  };
}
