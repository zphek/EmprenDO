import { authAdmin } from "@/firebaseAdmin";
import { cookies } from "next/headers"

export default async function getSession() {
    try {
        const token:any = (await cookies()).get("AccessToken")?.value;

        if(token != null){
            const user = authAdmin.verifyIdToken(token);
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