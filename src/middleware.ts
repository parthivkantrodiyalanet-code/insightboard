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

  // Public paths that don't require authentication
  const publicPaths = ['/login', '/register', '/api/auth/login', '/api/users'];
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

  // Paths accessible even when trial has expired
  const trialExpiredAllowedPaths = [
    '/pricing', 
    '/billing', 
    '/login', 
    '/logout', 
    '/profile', 
    '/subscription-success',
    '/subscription-cancelled',
    '/api/stripe/webhook'
  ];
  
  const isTrialExpiredAllowed = trialExpiredAllowedPaths.some(path => pathname.startsWith(path));

  // Redirect authenticated users away from login/register pages
  if (isPublicPath && token) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'secret');
      await jwtVerify(token, secret);
      // Valid token - redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } catch {
      // Invalid token - allow access to public pages
    }
  }

  let response = NextResponse.next();

  // Authentication and trial validation for protected routes
  if (!isPublicPath) {
    if (!token) {
      // Allow unauthenticated access to pricing page
      if (pathname === '/pricing') {
        response = NextResponse.next();
      } else {
        // Redirect to login for all other protected routes
        response = NextResponse.redirect(new URL('/login', request.url));
      }
    } else {
      try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'secret');
        const { payload } = await jwtVerify(token, secret);
        
        const trialEndsAt = payload.trialEndsAt ? new Date(payload.trialEndsAt as string) : null;
        const isPaid = payload.isPaid === true;
        
        // Check if trial has expired and user hasn't paid
        if (trialEndsAt && new Date() > trialEndsAt && !isPaid) {
          if (pathname.startsWith('/dashboard') && !isTrialExpiredAllowed) {
            // Redirect to pricing page if trial expired
            response = NextResponse.redirect(new URL('/pricing', request.url));
          }
        }
      } catch {
        // Invalid token - redirect to login
        response = NextResponse.redirect(new URL('/login', request.url));
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

