import admin from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';

export function GetFirebaseAdminApp() {
    if(admin.apps.length === 0){
        const app = admin.initializeApp({
            credential: admin.credential.cert({
                clientEmail: process.env.NEXT_FIREBASE_CLIENT_EMAIL as string,
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID as string,
                privateKey: process.env.NEXT_FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n') as string
            })
        });
        return app;
    }
    return admin.app();
}

export const authAdmin = getAuth(GetFirebaseAdminApp());