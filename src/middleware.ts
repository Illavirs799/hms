import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = process.env.JWT_SECRET_KEY || 'your-secret-key-change-this';
const key = new TextEncoder().encode(SECRET_KEY);

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
  const { pathname } = request.nextUrl;

  // public routes
  if (
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/register' ||
    pathname.startsWith('/api/auth')
  ) {
    if (session) {
      // If user is already logged in, redirect to their dashboard
      // We need to decode the token to know the role for redirect
      try {
        const { payload } = await jwtVerify(session, key, {
          algorithms: ['HS256'],
        });
        const role = payload.role as string;
        return NextResponse.redirect(new URL(`/${role}`, request.url));
      } catch (e) {
        // Invalid token, let them stay on login
      }
    }
    return NextResponse.next();
  }

  // protected routes
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const { payload } = await jwtVerify(session, key, {
      algorithms: ['HS256'],
    });
    const userRole = payload.role as string;

    // Admin routes
    if (pathname.startsWith('/admin') && userRole !== 'admin') {
      return NextResponse.redirect(new URL('/login', request.url)); // Or 403 page
    }

    // Warden routes
    if (pathname.startsWith('/warden') && userRole !== 'warden') {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Student routes
    if (pathname.startsWith('/student') && userRole !== 'student') {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
  } catch (error) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes) -> We mostly want to protect API routes too, but let's exclude public ones manually
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
