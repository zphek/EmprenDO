import { onCall } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";

const db = admin.firestore();

// ============================================================================
// FAVORITES FUNCTIONS
// ============================================================================

export const toggleFavoriteProject = onCall(async (request) => {
    try {
        const { projectId } = request.data;
        const uid = request.auth?.uid;

        if (!uid) {
            throw new Error("Usuario no autenticado");
        }

        if (!projectId) {
            throw new Error("ID del proyecto requerido");
        }

        const favoriteQuery = await db.collection("saved_projects")
            .where("userId", "==", uid)
            .where("projectId", "==", projectId)
            .get();

        if (favoriteQuery.empty) {
            // Agregar a favoritos
            await db.collection("saved_projects").add({
                userId: uid,
                projectId: projectId,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });

            return {
                success: true,
                message: "Proyecto agregado a favoritos",
                isFavorite: true
            };
        } else {
            // Remover de favoritos
            const favoriteDoc = favoriteQuery.docs[0];
            await favoriteDoc.ref.delete();

            return {
                success: true,
                message: "Proyecto removido de favoritos",
                isFavorite: false
            };
        }
    } catch (error) {
        logger.error("Error toggling favorite:", error);
        throw new Error(error instanceof Error ? error.message : "Error al gestionar favoritos");
    }
});

export const getUserFavorites = onCall(async (request) => {
    try {
        const uid = request.auth?.uid;

        if (!uid) {
            throw new Error("Usuario no autenticado");
        }

        const favoritesSnapshot = await db.collection("saved_projects")
            .where("userId", "==", uid)
            .orderBy("createdAt", "desc")
            .get();

        const favoriteProjectIds = favoritesSnapshot.docs.map(doc => doc.data().projectId);

        if (favoriteProjectIds.length === 0) {
            return {
                success: true,
                data: []
            };
        }

        // Dividir en chunks de 10 para evitar límite de Firestore
        const chunks = [];
        for (let i = 0; i < favoriteProjectIds.length; i += 10) {
            chunks.push(favoriteProjectIds.slice(i, i + 10));
        }

        let allProjects: any[] = [];
        for (const chunk of chunks) {
            const projectsSnapshot = await db.collection("projects")
                .where(admin.firestore.FieldPath.documentId(), "in", chunk)
                .get();
            
            const projects = projectsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            allProjects = allProjects.concat(projects);
        }

        return {
            success: true,
            data: allProjects
        };
    } catch (error) {
        logger.error("Error getting user favorites:", error);
        throw new Error("Error al obtener proyectos favoritos");
    }
});

export const checkIfProjectIsFavorite = onCall(async (request) => {
    try {
        const { projectId } = request.data;
        const uid = request.auth?.uid;

        if (!uid) {
            throw new Error("Usuario no autenticado");
        }

        if (!projectId) {
            throw new Error("ID del proyecto requerido");
        }

        const favoriteQuery = await db.collection("saved_projects")
            .where("userId", "==", uid)
            .where("projectId", "==", projectId)
            .get();

        return {
            success: true,
            isFavorite: !favoriteQuery.empty
        };
    } catch (error) {
        logger.error("Error checking favorite status:", error);
        throw new Error("Error al verificar estado de favorito");
    }
});

export const removeFavoriteProject = onCall(async (request) => {
    try {
        const { projectId } = request.data;
        const uid = request.auth?.uid;

        if (!uid) {
            throw new Error("Usuario no autenticado");
        }

        if (!projectId) {
            throw new Error("ID del proyecto requerido");
        }

        const favoriteQuery = await db.collection("saved_projects")
            .where("userId", "==", uid)
            .where("projectId", "==", projectId)
            .get();

        if (!favoriteQuery.empty) {
            const favoriteDoc = favoriteQuery.docs[0];
            await favoriteDoc.ref.delete();

            return {
                success: true,
                message: "Proyecto removido de favoritos"
            };
        } else {
            throw new Error("El proyecto no está en favoritos");
        }
    } catch (error) {
        logger.error("Error removing favorite:", error);
        throw new Error(error instanceof Error ? error.message : "Error al remover favorito");
    }
});