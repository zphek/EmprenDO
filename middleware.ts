import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rutas que requieren autenticación de usuario
const protectedRoutes = [
  '/dashboard',
  '/favorites',
  '/library',
  '/mentors',
  '/projects'
];

// Rutas que requieren ser admin
// const adminRoutes = [
//   '/user_admin'
// ];

// Rutas públicas
const publicRoutes = [
  '/landing',
  '/login',
  '/register',
  '/retrieve'
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Verificar si es una ruta pública
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Obtener el token de la cookie de sesión
  const token = request.cookies.get('session-token');

  // Si no hay token y la ruta es protegida, redirigir al login
  if (!token && protectedRoutes.some(route => pathname.startsWith(route))) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('session-token');
    return response;
  }

  try {
    // Si hay token, verificar el tipo de usuario y sus permisos
    // if (token) {
    //   // Aquí normalmente decodificarías el token para obtener el rol
    //   const userRole = token.value; // Esto es simplificado, deberías decodificar el JWT

    //   // Verificar rutas de admin
    //   if (adminRoutes.some(route => pathname.startsWith(route))) {
    //     if (userRole !== 'admin') {
    //       return NextResponse.redirect(new URL('/dashboard', request.url));
    //     }
    //   }

    //   // Verificar rutas protegidas de usuario
    //   if (protectedRoutes.some(route => pathname.startsWith(route))) {
    //     if (!userRole) {
    //       return NextResponse.redirect(new URL('/login', request.url));
    //     }
    //   }
    // }

    return NextResponse.next();
  } catch (error) {
    console.log(error);
    // Si hay algún error en la verificación, redirigir al login
    const response = NextResponse.redirect(new URL('/login', request.url));
    // response.cookies.delete('session-token');
    return response;
  }
}

// Configurar en qué rutas se ejecutará el middleware
export const config = {
  matcher: [
    // Rutas protegidas (usuario autenticado)
    '/dashboard/:path*',
    '/favorites/:path*',
    '/library/:path*',
    '/mentors/:path*',
    '/projects/:path*',
    
    // Rutas de admin
    '/user_admin/:path*',
    
    // Rutas públicas
    '/landing/:path*',
    '/login/:path*',
    '/register/:path*',
    '/retrieve/:path*',

    // Excluir archivos estáticos y API routes
    '/((?!api|_next/static|_next/image|favicon.ico).*)'
  ]
};