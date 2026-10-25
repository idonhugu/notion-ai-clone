import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static assets, manifest, and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname === '/favicon.ico' ||
    pathname === '/manifest.json'
  ) {
    return await updateSession(request);
  }

  const adminCookie = request.cookies.get('notion_admin_session');
  let isAuthenticated = adminCookie?.value === 'true';

  // Allow URL-based instant access token for seamless mobile bookmarking
  const autoAuthKey = request.nextUrl.searchParams.get('auth') || request.nextUrl.searchParams.get('key');
  if (autoAuthKey === 'laksha' || autoAuthKey === '1202') {
    const cleanUrl = new URL(request.url);
    cleanUrl.searchParams.delete('auth');
    cleanUrl.searchParams.delete('key');
    const response = NextResponse.redirect(cleanUrl);
    response.cookies.set('notion_admin_session', 'true', {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year persistent session
      sameSite: 'lax',
      secure: request.nextUrl.protocol === 'https:',
    });
    return response;
  }

  // If visiting /login and already logged in, redirect to home
  if (pathname === '/login') {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return await updateSession(request);
  }

  // Protect all document and home routes: redirect to /login if not authenticated
  if (!isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
