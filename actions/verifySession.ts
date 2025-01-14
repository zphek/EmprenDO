"use server"

import { authAdmin } from "@/firebaseAdmin";
import { cookies } from "next/headers"
import { NextResponse } from "next/server";

export default async function getSession() {
    try {
        const token:any = (await cookies()).get("AccessToken")?.value;

        if(token != null){
            const user = await authAdmin.verifyIdToken(token);

            console.log(user);
            return {
                isAuthenticated: true,
                user
            }
        }

        return {
            isAuthenticated: false,
            user: null
        };
    } catch (error) {
        return null;
    }
}

interface TokenCache {
    [key: string]: {
      decodedToken: any;
      expiry: number;
    }
   }
   
   const tokenCache: TokenCache = {}
   const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos en ms
   
   export async function verifyToken(token: string) {
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