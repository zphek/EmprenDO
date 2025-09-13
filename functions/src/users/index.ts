import { onCall } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";

const db = admin.firestore();

// ============================================================================
// USER MANAGEMENT FUNCTIONS
// ============================================================================

export const createUser = onCall(async (request) => {
    try {
        const { name, email, cedula, role = "normal" } = request.data;
        const uid = request.auth?.uid;

        if (!uid) {
            throw new Error("Usuario no autenticado");
        }

        const userData = {
            name,
            email,
            cedula,
            role,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        await db.collection("users").doc(uid).set(userData);

        return {
            success: true,
            message: "Usuario creado exitosamente",
            uid
        };
    } catch (error) {
        logger.error("Error creating user:", error);
        throw new Error(error instanceof Error ? error.message : "Error al crear usuario");
    }
});

export const updateUser = onCall(async (request) => {
    try {
        const { userId, updateData } = request.data;
        const uid = request.auth?.uid;

        if (!uid) {
            throw new Error("Usuario no autenticado");
        }

        // Verificar que el usuario solo pueda actualizar su propio perfil o ser admin
        if (userId !== uid) {
            const userDoc = await db.collection("users").doc(uid).get();
            const userData = userDoc.data();
            if (!userData || userData.role !== "admin") {
                throw new Error("No tienes permisos para realizar esta acción");
            }
        }

        const updatedData = {
            ...updateData,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        await db.collection("users").doc(userId).update(updatedData);

        return {
            success: true,
            message: "Usuario actualizado exitosamente"
        };
    } catch (error) {
        logger.error("Error updating user:", error);
        throw new Error(error instanceof Error ? error.message : "Error al actualizar usuario");
    }
});

export const getUserProfile = onCall(async (request) => {
    try {
        const { userId } = request.data;
        const uid = request.auth?.uid;

        if (!uid) {
            throw new Error("Usuario no autenticado");
        }

        const targetUserId = userId || uid;
        const userDoc = await db.collection("users").doc(targetUserId).get();

        if (!userDoc.exists) {
            throw new Error("Usuario no encontrado");
        }

        return {
            success: true,
            data: {
                uid: targetUserId,
                ...userDoc.data()
            }
        };
    } catch (error) {
        logger.error("Error getting user profile:", error);
        throw new Error(error instanceof Error ? error.message : "Error al obtener perfil");
    }
});

export const updateUserSettings = onCall(async (request) => {
    try {
        const { settings } = request.data;
        const uid = request.auth?.uid;

        if (!uid) {
            throw new Error("Usuario no autenticado");
        }

        const updateData = {
            ...settings,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        await db.collection("users").doc(uid).update(updateData);

        return {
            success: true,
            message: "Configuración actualizada exitosamente"
        };
    } catch (error) {
        logger.error("Error updating user settings:", error);
        throw new Error(error instanceof Error ? error.message : "Error al actualizar configuración");
    }
});

export const completeUserRegistration = onCall(async (request) => {
    try {
        const { name, cedula } = request.data;
        const uid = request.auth?.uid;

        if (!uid) {
            throw new Error("Usuario no autenticado");
        }

        const updateData = {
            name,
            cedula,
            registrationComplete: true,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        await db.collection("users").doc(uid).update(updateData);

        return {
            success: true,
            message: "Registro completado exitosamente"
        };
    } catch (error) {
        logger.error("Error completing registration:", error);
        throw new Error(error instanceof Error ? error.message : "Error al completar registro");
    }
});