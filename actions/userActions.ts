"use server"

import { db } from "@/firebase";
import { authAdmin } from "@/firebaseAdmin";
import { setDoc, doc, getDoc } from "firebase/firestore";
import { cookies } from "next/headers";

type userInfo = {
    nombre: string,
    apellido: string,
    cedula: string,
}

type UserData = {
    uid: string,
    email: string | undefined,
    displayName: string | undefined,
    emailVerified: boolean,
    createdAt: string | undefined,
    lastLoginAt: string | undefined,
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

export async function isUserFullRegistered(token: string) {
    try {
        // console.log(token)
        if (!token) {
            return null;
        }

        // Verify the token and get user info
        const decodedToken = await authAdmin.verifyIdToken(token);
        // console.log(decodedToken);
        const uid = decodedToken.uid;

        // Check if user exists in Firestore
        const userDocRef = await doc(db, 'users', uid);
        const userDoc = await getDoc(userDocRef);


        if (!userDoc.exists) {
            return false;
        }

        // Get user data
        const userData = userDoc.data();

        // Check if user has all required fields based on your Firestore structure
        const isComplete = Boolean(
            userData &&
            userData.cedula &&
            userData.email &&
            userData.name &&
            userData.createdAt &&
            userData.updatedAt
        );

        return isComplete;

    } catch (error) {
        console.error('Error checking user registration:', error);
        return null;
    }
}


export async function userLogOut() {
    try {
        const token = (await cookies()).get("AccessToken")?.value;
        
        if (!token) {
            return { success: false, error: 'No token found' };
        }

        // Decodificar el token para obtener el uid
        const decodedToken = await authAdmin.verifyIdToken(token);
        
        // Revocar todos los tokens del usuario
        await authAdmin.revokeRefreshTokens(decodedToken.uid);
        
        // Eliminar la cookie
        (await cookies()).delete("AccessToken");

        return { success: true };
    } catch (error) {
        console.error('Error logging out:', error);
        return { success: false, error: 'Error during logout' };
    }
}

export async function listAllUsers(nextPageToken?: string): Promise<UserData[]> {
    try {
        const users: UserData[] = [];
        const listUsersResult = await authAdmin.listUsers(1000, nextPageToken);
        
        listUsersResult.users.forEach((userRecord) => {
            users.push({
                uid: userRecord.uid,
                email: userRecord.email,
                displayName: userRecord.displayName,
                emailVerified: userRecord.emailVerified,
                createdAt: userRecord.metadata.creationTime,
                lastLoginAt: userRecord.metadata.lastSignInTime,
            });
        });

        // Si hay más usuarios, realiza una llamada recursiva
        if (listUsersResult.pageToken) {
            const nextUsers = await listAllUsers(listUsersResult.pageToken);
            users.push(...nextUsers);
        }

        return users;
    } catch (error) {
        console.error('Error al listar usuarios:', error);
        throw new Error('Error al obtener la lista de usuarios');
    }
}

export async function getUsersByRole(role: string): Promise<UserData[]> {
    try {
        const users = await listAllUsers();
        // Aquí puedes agregar la lógica para filtrar por rol si tienes esa información en Firestore
        // Por ejemplo, podrías hacer una consulta adicional a una colección de roles
        
        return users;
    } catch (error) {
        console.error('Error al obtener usuarios por rol:', error);
        throw new Error('Error al filtrar usuarios por rol');
    }
}


type NewUserData = {
    name: string;
    email: string;
    role: string;
    status: string;
    password?: string;
  }
  
  export async function registerNewUser(data: NewUserData) {
    try {
      // Generar una contraseña aleatoria temporal
      const temporaryPassword = Math.random().toString(36).slice(-8);
  
      // Crear el usuario en Firebase Authentication
      const userRecord = await authAdmin.createUser({
        email: data.email,
        password: temporaryPassword,
        displayName: data.name,
      });
  
      // Guardar información adicional en Firestore
      const db = getFirestore();
      await db.collection('users').doc(userRecord.uid).set({
        name: data.name,
        email: data.email,
        role: data.role,
        status: data.status,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      });
  
      // Opcional: Enviar email con la contraseña temporal
      // Aquí podrías implementar el envío de email
  
      return {
        success: true,
        user: userRecord,
        temporaryPassword // En producción, esto debería enviarse por email
      };
    } catch (error: any) {
      console.error('Error registering new user:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  export async function getUserRole(token: string) {
    try {
        if (!token) return null;

        const decodedToken = await authAdmin.verifyIdToken(token);
        const userDoc = await getDoc(doc(db, 'users', decodedToken.uid));
        
        return userDoc.exists() ? (userDoc.data().role ?? "normal") : "normal";
    } catch (error) {
        console.error('Error getting user role:', error);
        return "normal";
    }
 }

 export async function getDbUser() {
    try {
        const token = (await cookies()).get("AccessToken")?.value;

        if (!token) {
            return { success: false, error: 'No token found' };
        }

        // Verificar el token y obtener información del usuario
        const decodedToken = await authAdmin.verifyIdToken(token);
        const uid = decodedToken.uid;

        // Obtener datos del usuario desde Firestore
        const userDocRef = doc(db, 'users', uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            return { success: false, error: 'User not found in database' };
        }

        // Retornar los datos del usuario
        return {
            success: true,
            data: {
                uid: uid,
                ...userDoc.data()
            }
        };

    } catch (error) {
        console.error('Error getting user data:', error);
        return { 
            success: false, 
            error: 'Error retrieving user data' 
        };
    }
}