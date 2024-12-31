// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { authAdmin } from '@/firebaseAdmin'

interface TokenCache {
 [key: string]: {
   decodedToken: any;
   expiry: number;
 }
}

const tokenCache: TokenCache = {}
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos en ms

async function verifyToken(token: string) {
 const now = Date.now()

 if (tokenCache[token] && tokenCache[token].expiry > now) {
   return tokenCache[token].decodedToken
 }

 try {
   const decodedToken = await authAdmin.verifyIdToken(token)
   tokenCache[token] = {
     decodedToken,
     expiry: now + CACHE_DURATION
   }
   return decodedToken
 } catch {
   const response = NextResponse.next()
   response.cookies.delete('AccessToken')
   return null
 }
}

export async function middleware(request: NextRequest) {
 const { pathname } = request.nextUrl; 

 console.log(request.nextUrl);

 if (pathname == '/') {
    return NextResponse.redirect(new URL('/login', request.url))
 }

 const token = request.cookies.get('AccessToken')?.value
 console.log(token, "xd");

 const session = token ? await verifyToken(token) : null;

 
 const authenticatedRoutes = ['/favorites', '/library', '/mentors', '/projects']
 const unauthenticatedRoutes = ['/login', '/register', '/retrieve']
 
//  console.log(unauthenticatedRoutes.includes(pathname));

//  return NextResponse.next()

 if (authenticatedRoutes.includes(pathname)) {
   if (!session) {
     return NextResponse.redirect(new URL('/login', request.url))
   }
 }

 if (unauthenticatedRoutes.includes(pathname)) {
   if (session) {
     return NextResponse.redirect(new URL('/landing', request.url))
   }
 }

 return NextResponse.next()
}

export const config = {
 matcher: [
   '/favorites/:path*',
   '/library/:path*', 
   '/mentors/:path*',
   '/projects/:path*',
   '/login',
   '/register',
   '/retrieve',
   '/'
 ]
}