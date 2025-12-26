import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const { pathname } = request.nextUrl

  // Define public paths that don't need auth checking or trial checking
  const publicPaths = ['/login', '/register', '/api/auth/login', '/api/users']
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path))

  // Define paths allowed even if trial expired
  const trialExpiredAllowedPaths = [
    '/pricing', 
    '/billing', 
    '/login', 
    '/logout', 
    '/profile', 
    '/subscription-success',
    '/subscription-cancelled',
    '/api/stripe/webhook' // allow webhook
  ]
  
  const isTrialExpiredAllowed = trialExpiredAllowedPaths.some(path => pathname.startsWith(path))

  // 1. Redirect if authenticated user tries to access login/register
  if (isPublicPath && token) {
    // We need to verify token valid before redirecting, technically, 
    // but usually existence is enough for this UX optimization.
    // However, if we want to be strict, we verify. 
    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'secret')
        await jwtVerify(token, secret)
        // If valid, redirect to dashboard
        return NextResponse.redirect(new URL('/dashboard', request.url))
    } catch (e) {
        // invalid token, let them stay on login
    }
  }

  // 2. Protect protected routes
  // Basically anything not public is protected? 
  // The user said "Block access to all /dashboard/* routes" 
  // Let's assume protection is needed for /dashboard and similar.
  // We'll enforce auth for everything EXCEPT public paths.
  
  if (!isPublicPath) {
    if (!token) {
       // Allow if it's one of the "allowed" pages? No, /pricing might be public.
       // The user prompt says: "IF user is authenticated AND..."
       // This implies if NOT authenticated, standard protection applies.
       
       // Let's assume /pricing is public.
       if (pathname === '/pricing') return NextResponse.next();
       
       return NextResponse.redirect(new URL('/login', request.url))
    }

    // User is authenticated. Check Trial Logic.
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'secret')
      const { payload } = await jwtVerify(token, secret)
      
      const trialEndsAt = payload.trialEndsAt ? new Date(payload.trialEndsAt as string) : null
      const isPaid = payload.isPaid === true
      
      // Logic: trialEndsAt < current date AND isPaid === false
      if (trialEndsAt && new Date() > trialEndsAt && !isPaid) {
          // Block /dashboard access
          if (pathname.startsWith('/dashboard') && !isTrialExpiredAllowed) {
              return NextResponse.redirect(new URL('/pricing', request.url))
          }
      }

    } catch (error) {
      // Token invalid
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  // tailored matcher to run on relevant paths
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (except strict ones we want to capture? No, usually exclude api from redirect loops)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
