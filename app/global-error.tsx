'use client';

import React, { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Next.js Global Root Error caught:', error);
  }, [error]);

  const handleClearCacheAndReload = () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch {}
      window.location.href = '/';
    }
  };

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#fbfbfa', color: '#111' }}>
        <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div style={{ maxWidth: '420px', width: '100%', background: '#fff', borderRadius: '1rem', border: '1px solid #e5e5e5', padding: '2rem', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.06)' }}>
            <div style={{ width: '48px', height: '48px', margin: '0 auto 1rem', borderRadius: '12px', background: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
              🩺
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: '0 0 0.5rem', color: '#111' }}>
              GP4Me Workspace Reload
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#666', lineHeight: '1.5', margin: '0 0 1.5rem' }}>
              A browser storage or initialization issue was detected. Your clinical records in Supabase are secure.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <button
                onClick={() => reset()}
                style={{ padding: '0.7rem 1rem', background: '#9333ea', color: '#fff', border: 'none', borderRadius: '0.75rem', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer' }}
              >
                Reload Workspace
              </button>
              <button
                onClick={handleClearCacheAndReload}
                style={{ padding: '0.7rem 1rem', background: '#f5f5f5', color: '#333', border: '1px solid #e5e5e5', borderRadius: '0.75rem', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer' }}
              >
                Clear Local Storage Cache & Restart
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
