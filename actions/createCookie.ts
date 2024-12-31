"use server"
import { cookies } from "next/headers"

export async function createCookie(token: string) {
    const cookieStore = await cookies();
    cookieStore.set('AccessToken', token, { path: '/', expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365), sameSite: 'lax' });

    return true;
}