import { ROUTES } from '@/src/constants/routes'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const protectedPrefixes = ['/models', '/upload']

function isProtectedPath(pathname: string) {
  return protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionCookie = request.cookies.get('JSESSIONID')
  const isAuthenticated = Boolean(sessionCookie?.value)

  if (pathname === ROUTES.home) {
    return NextResponse.redirect(
      new URL(isAuthenticated ? ROUTES.models : ROUTES.login, request.url),
    )
  }

  if (pathname === ROUTES.login && isAuthenticated) {
    return NextResponse.redirect(new URL(ROUTES.models, request.url))
  }

  if (isProtectedPath(pathname) && !isAuthenticated) {
    const useMock = process.env.NEXT_PUBLIC_USE_MOCK_API !== 'false'
    if (useMock) {
      return NextResponse.next()
    }
    return NextResponse.redirect(new URL(ROUTES.login, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/login', '/models', '/upload/:path*'],
}
