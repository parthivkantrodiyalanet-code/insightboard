import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

/**
 * Next.js Middleware
 * Handles authentication, trial period validation, and security headers
 * Runs on every request matching the config.matcher pattern
 */
export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Routes that redirect to dashboard if already logged in (Guest Only)
  const guestRoutes = ['/login', '/register'];
  const isGuestRoute = guestRoutes.some(path => pathname.startsWith(path));

  // 1. API: Strict Blocking
  const isApiRoute = pathname.startsWith('/api');
  const isPublicApi = 
    pathname.startsWith('/api/auth/login') || 
    pathname.startsWith('/api/stripe/webhook') ||
    (pathname.startsWith('/api/users') && request.method === 'POST');

  // 2. Pages: Public Access
  const publicPagePrefixes = [
      '/pricing', 
      '/about', 
      '/contact', 
      '/testimonials',
      '/landing',
      '/login',
      '/',
      '/register'
  ];
  const isPublicPage = pathname === '/' || publicPagePrefixes.some(path => pathname.startsWith(path));

  // Combined "Public" check for the Guest Redirect logic below
  // (We consider Guest routes as public for users who ARE NOT logged in)
  
  // Redirect authenticated users away from Guest Routes (Login/Register)
  if (isGuestRoute && token) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'secret');
      await jwtVerify(token, secret);
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } catch {
       // invalid token, treat as guest
    }
  }

  // Paths accessible even when trial has expired
  const trialExpiredAllowedPaths = [
    '/pricing', 
    '/billing', 
    '/login', 
    '/logout', 
    '/dashboard/profile',
    '/subscription-success',
    '/subscription-cancelled',
    '/api/stripe/webhook'
  ];
  const isTrialExpiredAllowed = trialExpiredAllowedPaths.some(path => pathname.startsWith(path));

  const response = NextResponse.next();

  // Authentication Enforcement
  if (!token) {
      // If it's an API route and NOT public -> 401 Unauthorized
      if (isApiRoute && !isPublicApi) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      // If it's a Page route and NOT public -> Redirect to Login
      if (!isApiRoute && !isPublicPage) {
          return NextResponse.redirect(new URL('/login', request.url));
      }
  } else {
      // Token exists, verify it
      try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'secret');
        const { payload } = await jwtVerify(token, secret);
        
        const trialEndsAt = payload.trialEndsAt ? new Date(payload.trialEndsAt as string) : null;
        const isPaid = payload.isPaid === true;
        
        // Trial Validation
        if (!isPublicPage && !isApiRoute && trialEndsAt && new Date() > trialEndsAt && !isPaid) {
          if (pathname.startsWith('/dashboard') && !isTrialExpiredAllowed) {
            return NextResponse.redirect(new URL('/pricing', request.url));
          }
        }
      } catch {
        // Token invalid
        if (isApiRoute && !isPublicApi) {
            return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });
        }
        if (!isApiRoute && !isPublicPage) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
      }
  }

  /**
   * Security Headers
   * Implements industry-standard security headers to protect against common vulnerabilities
   */
  const securityHeaders = {
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self' https://generativelanguage.googleapis.com;",
    'Referrer-Policy': 'origin-when-cross-origin',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
  };

  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

/**
 * Middleware Configuration
 * Defines which routes the middleware should run on
 * Excludes static files and Next.js internal routes
 */
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

