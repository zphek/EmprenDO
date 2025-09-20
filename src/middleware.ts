import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('AccessToken')?.value;
  
  // Redirect root to login
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Define routes by role
  const adminRoutes = ['/admin']
  const mentorRoutes = ['/mentorship']
  const authenticatedRoutes = ['/favorites', '/library', '/mentors', '/settings', '/profile'] // Removed /landing and /projects
  const unauthenticatedRoutes = ['/login', '/register', '/retrieve']
  const publicRoutes = ['/landing', '/projects'] // New array for public routes

  // If there's no token and trying to access protected routes, redirect to login
  if (!token) {
    const isProtectedRoute = [...adminRoutes, ...mentorRoutes, ...authenticatedRoutes]
      .some(route => pathname.startsWith(route));
    
    if (isProtectedRoute) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // Allow access to unprotected routes
    return NextResponse.next();
  }

  // If there's a token, verify it
  try {
    const verificationResponse = await fetch(`${request.nextUrl.origin}/api/auth`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Cookie': `AccessToken=${token}`
      },
      credentials: 'include'
    });

    const data = await verificationResponse.json();

    // Check if registration is complete
    if (data.isFullRegistered === false && pathname !== '/complete-registration') {
      return NextResponse.redirect(new URL('/complete-registration', request.url));
    }

    // If not authenticated, clear token and redirect to login
    if (data.isAuthenticated === false) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('AccessToken');
      return response;
    }

    // Handle authenticated users trying to access login/register pages
    if (unauthenticatedRoutes.some(route => pathname.startsWith(route))) {
      switch(data.userRole) {
        case 'admin':
          return NextResponse.redirect(new URL('/admin/dashboard', request.url));
        case 'mentor':
          return NextResponse.redirect(new URL('/mentorship', request.url));
        case 'normal':
          return NextResponse.redirect(new URL('/landing', request.url));
      }
    }

    // Role-based access control
    switch(data.userRole) {
      case 'admin':
        // Admin can only access admin routes
        if (!pathname.startsWith('/admin')) {
          return NextResponse.redirect(new URL('/admin/dashboard', request.url));
        }
        break;
      
      case 'mentor':
        // Mentor can only access mentorship routes
        if (!pathname.startsWith('/mentorship')) {
          return NextResponse.redirect(new URL('/mentorship', request.url));
        }
        break;
      
      case 'normal':
        // Normal users can access authenticated routes and public routes
        if (adminRoutes.some(route => pathname.startsWith(route)) || 
            mentorRoutes.some(route => pathname.startsWith(route))) {
          return NextResponse.redirect(new URL('/landing', request.url));
        }
        break;
    }

  } catch (error) {
    console.error('Error verificando token:', error);
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('AccessToken');
    return response;
  }

  // If all checks pass, allow the request
  const response = NextResponse.next();
  response.headers.set('x-current-path', pathname);
  return response;
}

export const config = {
  matcher: [
    '/favorites/:path*',
    '/library/:path*', 
    '/mentors/:path*',
    '/projects',
    '/landing',
    '/projects/create/:path*',
    '/admin/:path*',
    '/mentorship',
    '/login',
    '/register',
    '/retrieve',
    '/profile',
    '/settings',
    '/complete-registration',
    '/unauthorized',
    '/'
  ]
}