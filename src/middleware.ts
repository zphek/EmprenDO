// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('AccessToken')?.value;
  
  
  // Redirect root to login
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Define protected and public routes
  const authenticatedRoutes = ['/favorites', '/library', '/mentors', '/projects', '/admin']
  const unauthenticatedRoutes = ['/login', '/register', '/retrieve']

  // If there's a token, verify it
  if (token) {
    try {
      const verificationResponse = await fetch(`http://localhost:3000/api/auth`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cookie': `AccessToken=${token}`
        },
        credentials: 'include'
      });

      const data = await verificationResponse.json();
      console.log(data);

      if (data.isAuthenticated == false) {
        // Si el token no es válido, creamos una respuesta que elimine la cookie
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('AccessToken');
        
        // Si estamos en una ruta protegida, redirigimos
        if (authenticatedRoutes.some(route => pathname.startsWith(route))) {
          return response;
        }
        
        return response;
      }
    } catch (error) {
      console.error('Error verificando token:', error);
      // En caso de error, también eliminamos el token
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('AccessToken');
      return response;
    }
  }

  // Check authenticated routes access
  if (authenticatedRoutes.some(route => pathname.startsWith(route))) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Check unauthenticated routes access
  if (unauthenticatedRoutes.includes(pathname)) {
    if (token) {
      return NextResponse.redirect(new URL('/landing', request.url));
    }
  }

  const response = NextResponse.next();
  response.headers.set('x-current-path', pathname);
  
  return response;
}

export const config = {
  matcher: [
    '/favorites/:path*',
    '/library/:path*', 
    '/mentors/:path*',
    '/projects/create/:path*',
    '/admin/:path*',
    '/login',
    '/register',
    '/retrieve',
    '/'
  ]
}