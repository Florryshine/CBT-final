import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

const PROTECTED_ROUTES = ['/select-subjects', '/exam', '/result', '/dashboard', '/admin'];
const AUTH_ROUTES = ['/auth'];

export async function middleware(req) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = req.nextUrl;

  // Redirect unauthenticated users away from protected routes
  if (PROTECTED_ROUTES.some((route) => pathname.startsWith(route)) && !session) {
    return NextResponse.redirect(new URL('/auth', req.url));
  }

  // Redirect authenticated users away from auth page
  if (AUTH_ROUTES.some((route) => pathname.startsWith(route)) && session) {
    return NextResponse.redirect(new URL('/select-subjects', req.url));
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
