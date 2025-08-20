import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const { pathname } = req.nextUrl

    // Allow access to auth pages
    if (pathname.startsWith('/auth/')) {
      return NextResponse.next()
    }

    // Redirect to signin if not authenticated and trying to access protected routes
    if (!token && (pathname.startsWith('/dashboard') || pathname.startsWith('/teacher') || pathname.startsWith('/student'))) {
      return NextResponse.redirect(new URL('/auth/signin', req.url))
    }

    // Role-based redirects after login
    if (token) {
      // Redirect teachers away from student routes
      if (token.role === 'TEACHER' && pathname.startsWith('/student')) {
        return NextResponse.redirect(new URL('/teacher/dashboard', req.url))
      }

      // Redirect students away from teacher routes
      if (token.role === 'STUDENT' && pathname.startsWith('/teacher')) {
        return NextResponse.redirect(new URL('/student/dashboard', req.url))
      }

      // Redirect from generic dashboard to role-specific dashboard
      if (pathname === '/dashboard') {
        const roleRedirect = token.role === 'TEACHER' ? '/teacher/dashboard' : '/student/dashboard'
        return NextResponse.redirect(new URL(roleRedirect, req.url))
      }

      // Redirect authenticated users away from auth pages
      if (pathname.startsWith('/auth/signin') || pathname.startsWith('/auth/signup')) {
        const roleRedirect = token.role === 'TEACHER' ? '/teacher/dashboard' : '/student/dashboard'
        return NextResponse.redirect(new URL(roleRedirect, req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: () => true // We handle authorization in the middleware function
    }
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/teacher/:path*',
    '/student/:path*',
    '/auth/:path*'
  ]
}