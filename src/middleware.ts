import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
 
  // Protect /dashboard and sub-routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }
 
  // Redirect /login and /register if already authenticated
  if (request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register')) {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }
 
  return NextResponse.next()
}
 
export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
}
