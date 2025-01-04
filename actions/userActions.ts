"use server"

import { db } from "@/firebase";
import { authAdmin } from "@/firebaseAdmin";
import { setDoc, doc } from "firebase/firestore";
import { cookies } from "next/headers";

type userInfo = {
    nombre: string,
    apellido: string,
    cedula: string,
}

export async function userRegister(data: userInfo){
    try {
            const token:any = (await cookies()).get("AccessToken")?.value;
    
            if(token != null){
                const user = authAdmin.verifyIdToken(token);
                
            }
        } catch (error) {
            return null;
        }   
}

export async function isUserFullRegistered(){
    try {
        const token:any = (await cookies()).get("AccessToken")?.value;

        if(token != null){
            const user = authAdmin.verifyIdToken(token);
            
        }
    } catch (error) {
        return null;
    }
}

export async function userLogOut(){
    (await cookies()).delete("AccessToken");
}