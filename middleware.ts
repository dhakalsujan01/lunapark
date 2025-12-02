import createMiddleware from "next-intl/middleware"
import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

const locales = ["en", "ru"]

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: "en",
  localePrefix: 'always',
  pathnames: {
    '/': '/',
    '/about': '/about',
    '/attractions': '/attractions',
    '/contact': '/contact',
    '/gallery': '/gallery',
    '/safety': '/safety',
    '/dashboard': '/dashboard',
    '/checker': '/checker',
    '/booking': '/booking',
    '/booking/success': '/booking/success',
    '/booking/cancelled': '/booking/cancelled'
  }
})

const authMiddleware = withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const { pathname } = req.nextUrl

    // Admin routes protection
    if (pathname.startsWith("/admin")) {
      if (!token || token.role !== "admin") {
        return NextResponse.redirect(new URL("/auth/signin", req.url))
      }
    }

    // Checker routes protection (localized routes)
    if (pathname.match(/^\/[a-z]{2}\/checker/)) {
      if (!token || (token.role !== "admin" && token.role !== "checker")) {
        return NextResponse.redirect(new URL("/auth/signin", req.url))
      }
    }

    // User dashboard protection (localized routes)
    if (pathname.match(/^\/[a-z]{2}\/dashboard/)) {
      if (!token) {
        return NextResponse.redirect(new URL("/auth/signin", req.url))
      }
    }

    // Booking routes protection (localized routes)
    if (pathname.match(/^\/[a-z]{2}\/booking/)) {
      if (!token) {
        return NextResponse.redirect(new URL("/auth/signin", req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        // Allow access to auth pages without token
        if (pathname.startsWith('/auth')) {
          return true
        }
        return !!token
      },
    },
  },
)

export default function middleware(req: any) {
  const { pathname } = req.nextUrl

  console.log('Middleware - pathname:', pathname)

  // SECURITY: Add CSRF protection for API routes
  if (pathname.startsWith('/api')) {
    // Skip CSRF for webhook endpoints (they have their own signature verification)
    if (pathname.startsWith('/api/webhooks/')) {
      return NextResponse.next()
    }
    
    // Skip CSRF for public GET endpoints
    if (req.method === 'GET' && (
      pathname.startsWith('/api/public/') ||
      pathname.startsWith('/api/health')
    )) {
      return NextResponse.next()
    }
    
    // SECURITY: Check for CSRF token on state-changing operations
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      const origin = req.headers.get('origin')
      const referer = req.headers.get('referer')
      const host = req.headers.get('host')
      
      // Allow same-origin requests
      if (origin && host && origin.includes(host)) {
        return NextResponse.next()
      }
      
      // Allow requests from same domain (for server-side requests)
      if (referer && host && referer.includes(host)) {
        return NextResponse.next()
      }
      
      // For development, allow localhost
      if (process.env.NODE_ENV === 'development' && 
          (origin?.includes('localhost') || referer?.includes('localhost'))) {
        return NextResponse.next()
      }
      
      // Reject suspicious cross-origin requests
      console.warn(`CSRF protection: Blocking suspicious request from origin: ${origin}, referer: ${referer}`)
      return new NextResponse('CSRF protection: Invalid origin', { status: 403 })
    }
    
    return NextResponse.next()
  }

  // Skip middleware for static files
  if (pathname.startsWith('/_next') || 
      pathname.startsWith('/favicon') ||
      pathname.startsWith('/robots.txt') ||
      pathname.startsWith('/sitemap') ||
      pathname.match(/\.(jpg|jpeg|png|gif|svg|webp|ico|css|js|woff|woff2|ttf|eot)$/)) {
    return NextResponse.next()
  }

  // Completely bypass all middleware for auth routes - let NextAuth handle them
  if (pathname.startsWith('/auth')) {
    return NextResponse.next()
  }

  // For admin and other protected routes, apply auth middleware first
  if (pathname.startsWith('/admin') || 
      pathname.match(/^\/[a-z]{2}\/dashboard/) || 
      pathname.match(/^\/[a-z]{2}\/booking/) || 
      pathname.match(/^\/[a-z]{2}\/checker/) || 
      pathname.startsWith('/scanner')) {
    return (authMiddleware as any)(req)
  }

  // For all other routes (including locale routes), use intl middleware
  const response = intlMiddleware(req)
  console.log('Middleware - intl response:', response)
  return response
}

export const config = {
  matcher: [
    // Match all pathnames except for
    // - api routes
    // - _next (Next.js internals)
    // - _vercel (Vercel internals)
    // - static files (images, fonts, etc.)
    // - favicon and other root files
    // - auth routes (let NextAuth handle them)
    '/((?!api|_next|_vercel|auth|.*\\..*).*)'
  ]
}
