// middleware.ts - Versión corregida
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Verificar token en cookies
  const token = request.cookies.get('auth_token')?.value
  
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || 
                    request.nextUrl.pathname.startsWith('/registro')
  
  // Solo las rutas de dashboard/historial requieren autenticación
  const isProtectedPage = request.nextUrl.pathname.startsWith('/dashboard') ||
                         request.nextUrl.pathname.startsWith('/historial')
  
  console.log('🔍 Middleware ejecutándose:', {
    path: request.nextUrl.pathname,
    hasToken: !!token,
    isAuthPage,
    isProtectedPage
  })
  
  // Redirigir a login si no está autenticado y quiere acceder a páginas protegidas
  if (!token && isProtectedPage) {
    console.log('🚫 Redirigiendo a login (no hay token)')
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // Redirigir al dashboard si está autenticado y quiere acceder a login/registro
  if (token && isAuthPage) {
    console.log('🔄 Redirigiendo a dashboard (ya autenticado)')
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
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