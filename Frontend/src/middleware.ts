import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// List of public paths that don't require authentication
const publicPaths = ['/login', '/register'];

// List of paths that should be ignored by the middleware
const ignoredPaths = [
  '/_next',
  '/api',
  '/favicon.ico',
  '/public'
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignore static files and API routes
  if (ignoredPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const token = request.cookies.get('token')?.value;
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

  // If trying to access public pages while logged in, redirect to home
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If trying to access protected pages while logged out, redirect to login
  if (!isPublicPath && !token) {
    const loginUrl = new URL('/login', request.url);
    // Only add the 'from' parameter if it's not a public path
    if (!isPublicPath) {
      loginUrl.searchParams.set('from', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Configure the paths that should be handled by this middleware
export const config = {
  matcher: [
    /*
     * Match all paths except static files
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 