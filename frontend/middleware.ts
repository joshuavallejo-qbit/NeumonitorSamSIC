// frontend/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value
  const path = request.nextUrl.pathname
  
  const isAuthPage = path.startsWith('/login') || path.startsWith('/registro')
  const isProtectedPage = path.startsWith('/dashboard') || path.startsWith('/historial')
  
  console.log('🔍 Middleware:', {
    path,
    hasToken: !!token,
    tokenPreview: token ? token.substring(0, 8) + '...' : 'none',
    isAuthPage,
    isProtectedPage
  })
  
  // CASO 1: Página protegida sin token → ir a login
  if (!token && isProtectedPage) {
    console.log('🚫 Sin token, redirigiendo a login')
    const loginUrl = new URL('/login', request.url)
    // Agregar parámetro para tracking
    loginUrl.searchParams.set('redirect', path)
    return NextResponse.redirect(loginUrl)
  }
  
  // CASO 2: Ya autenticado intentando acceder a login/registro → ir a dashboard
  if (token && isAuthPage) {
    console.log('✅ Ya autenticado, redirigiendo a dashboard')
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  // CASO 3: Todo OK, continuar
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/historial/:path*',
    '/login',
    '/registro'
  ]
}
