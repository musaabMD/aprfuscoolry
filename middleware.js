import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function middleware(request) {
  const response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value;
        },
        set(name, value, options) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name, options) {
          request.cookies.delete(name);
          response.cookies.delete(name);
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  // If user is not signed in and the current path starts with /dashboard or /session
  if (!session && (request.nextUrl.pathname.startsWith('/dashboard') || request.nextUrl.pathname.startsWith('/session'))) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  // If user is signed in and tries to access auth pages
  if (session && (request.nextUrl.pathname.startsWith('/signin') || request.nextUrl.pathname.startsWith('/signup'))) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Get the pathname
  const path = request.nextUrl.pathname;

  // If trying to access score pages directly
  if (path.startsWith('/score/')) {
    // Only allow access if there's a sessionId in the URL
    const sessionId = request.nextUrl.searchParams.get('sessionId');
    if (!sessionId) {
      // Redirect to dashboard if no sessionId
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/session/:path*', '/signin', '/signup', '/score/:path*'],
};
