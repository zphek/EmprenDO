import admin from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';

export function GetFirebaseAdminApp() {
    if(admin.apps.length === 0){
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || process.env.NEXT_FIREBASE_CLIENT_EMAIL;
        const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "emprendo-17910";
        const privateKey = process.env.FIREBASE_PRIVATE_KEY || process.env.NEXT_FIREBASE_PRIVATE_KEY;

        if (!clientEmail || !privateKey) {
            console.error("Firebase Admin credentials not configured. Please set up environment variables:");
            console.error("- FIREBASE_CLIENT_EMAIL");
            console.error("- FIREBASE_PRIVATE_KEY");
            console.error("- FIREBASE_PROJECT_ID");
            
            // Return a mock configuration for development
            const app = admin.initializeApp({
                projectId: projectId
            });
            return app;
        }

        const app = admin.initializeApp({
            credential: admin.credential.cert({
                clientEmail: clientEmail,
                projectId: projectId,
                privateKey: privateKey.replace(/\\n/g, '\n')
            }),
            projectId: projectId
        });
        return app;
    }
    return admin.app();
}

export const authAdmin = getAuth(GetFirebaseAdminApp());