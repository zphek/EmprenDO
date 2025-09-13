import { onCall } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";

const db = admin.firestore();

// ============================================================================
// LIBRARY/EDUCATION FUNCTIONS
// ============================================================================

export const getLibraryContent = onCall(async (request) => {
    try {
        const { type, category, limit = 10 } = request.data || {};

        let query = db.collection("library") as any;

        if (type) {
            query = query.where("type", "==", type);
        }
        if (category) {
            query = query.where("category", "==", category);
        }

        query = query.where("status", "==", "published")
            .orderBy("createdAt", "desc")
            .limit(limit);

        const librarySnapshot = await query.get();
        const content = librarySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return {
            success: true,
            data: content
        };
    } catch (error) {
        logger.error("Error getting library content:", error);
        throw new Error("Error al obtener contenido de la biblioteca");
    }
});

export const getLibraryItem = onCall(async (request) => {
    try {
        const { itemId } = request.data;

        if (!itemId) {
            throw new Error("ID del contenido requerido");
        }

        const itemDoc = await db.collection("library").doc(itemId).get();

        if (!itemDoc.exists) {
            throw new Error("Contenido no encontrado");
        }

        const itemData = itemDoc.data();
        
        // Incrementar contador de visualizaciones
        await db.collection("library").doc(itemId).update({
            views: admin.firestore.FieldValue.increment(1)
        });

        return {
            success: true,
            data: {
                id: itemDoc.id,
                ...itemData
            }
        };
    } catch (error) {
        logger.error("Error getting library item:", error);
        throw new Error(error instanceof Error ? error.message : "Error al obtener contenido");
    }
});

export const createLibraryContent = onCall(async (request) => {
    try {
        const { title, description, content, type, category, tags, difficulty, estimatedReadTime } = request.data;
        const uid = request.auth?.uid;

        if (!uid) {
            throw new Error("Usuario no autenticado");
        }

        // Verificar que el usuario sea admin o mentor
        const userDoc = await db.collection("users").doc(uid).get();
        const userData = userDoc.data();
        if (!userData || !["admin", "mentor"].includes(userData.role)) {
            throw new Error("No tienes permisos para crear contenido educativo");
        }

        if (!title || !description || !content || !type) {
            throw new Error("Título, descripción, contenido y tipo son requeridos");
        }

        const validTypes = ["article", "video", "tutorial", "guide", "course"];
        if (!validTypes.includes(type)) {
            throw new Error("Tipo de contenido inválido");
        }

        const contentData = {
            title: title.trim(),
            description: description.trim(),
            content: content.trim(),
            type,
            category: category || "general",
            tags: tags || [],
            difficulty: difficulty || "beginner", // beginner, intermediate, advanced
            estimatedReadTime: estimatedReadTime || 5,
            authorId: uid,
            status: "published",
            views: 0,
            likes: 0,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        const contentRef = await db.collection("library").add(contentData);

        return {
            success: true,
            message: "Contenido educativo creado exitosamente",
            contentId: contentRef.id
        };
    } catch (error) {
        logger.error("Error creating library content:", error);
        throw new Error(error instanceof Error ? error.message : "Error al crear contenido educativo");
    }
});

export const updateLibraryContent = onCall(async (request) => {
    try {
        const { contentId, title, description, content, type, category, tags, difficulty, estimatedReadTime } = request.data;
        const uid = request.auth?.uid;

        if (!uid) {
            throw new Error("Usuario no autenticado");
        }

        if (!contentId) {
            throw new Error("ID del contenido requerido");
        }

        // Verificar que el contenido existe y pertenece al usuario o es admin
        const contentDoc = await db.collection("library").doc(contentId).get();
        if (!contentDoc.exists) {
            throw new Error("Contenido no encontrado");
        }

        const contentData = contentDoc.data();
        const userDoc = await db.collection("users").doc(uid).get();
        const userData = userDoc.data();

        if (contentData?.authorId !== uid && userData?.role !== "admin") {
            throw new Error("No tienes permisos para editar este contenido");
        }

        const updateData: any = {
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        if (title !== undefined) updateData.title = title.trim();
        if (description !== undefined) updateData.description = description.trim();
        if (content !== undefined) updateData.content = content.trim();
        if (type !== undefined) updateData.type = type;
        if (category !== undefined) updateData.category = category;
        if (tags !== undefined) updateData.tags = tags;
        if (difficulty !== undefined) updateData.difficulty = difficulty;
        if (estimatedReadTime !== undefined) updateData.estimatedReadTime = estimatedReadTime;

        await db.collection("library").doc(contentId).update(updateData);

        return {
            success: true,
            message: "Contenido actualizado exitosamente"
        };
    } catch (error) {
        logger.error("Error updating library content:", error);
        throw new Error(error instanceof Error ? error.message : "Error al actualizar contenido");
    }
});

export const deleteLibraryContent = onCall(async (request) => {
    try {
        const { contentId } = request.data;
        const uid = request.auth?.uid;

        if (!uid) {
            throw new Error("Usuario no autenticado");
        }

        if (!contentId) {
            throw new Error("ID del contenido requerido");
        }

        // Verificar que el contenido existe y pertenece al usuario o es admin
        const contentDoc = await db.collection("library").doc(contentId).get();
        if (!contentDoc.exists) {
            throw new Error("Contenido no encontrado");
        }

        const contentData = contentDoc.data();
        const userDoc = await db.collection("users").doc(uid).get();
        const userData = userDoc.data();

        if (contentData?.authorId !== uid && userData?.role !== "admin") {
            throw new Error("No tienes permisos para eliminar este contenido");
        }

        await db.collection("library").doc(contentId).delete();

        return {
            success: true,
            message: "Contenido eliminado exitosamente"
        };
    } catch (error) {
        logger.error("Error deleting library content:", error);
        throw new Error(error instanceof Error ? error.message : "Error al eliminar contenido");
    }
});

export const likeLibraryContent = onCall(async (request) => {
    try {
        const { contentId } = request.data;
        const uid = request.auth?.uid;

        if (!uid) {
            throw new Error("Usuario no autenticado");
        }

        if (!contentId) {
            throw new Error("ID del contenido requerido");
        }

        // Verificar si ya le dio like
        const likeQuery = await db.collection("content_likes")
            .where("userId", "==", uid)
            .where("contentId", "==", contentId)
            .get();

        if (likeQuery.empty) {
            // Agregar like
            await db.collection("content_likes").add({
                userId: uid,
                contentId: contentId,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });

            // Incrementar contador en el contenido
            await db.collection("library").doc(contentId).update({
                likes: admin.firestore.FieldValue.increment(1)
            });

            return {
                success: true,
                message: "Like agregado",
                liked: true
            };
        } else {
            // Quitar like
            const likeDoc = likeQuery.docs[0];
            await likeDoc.ref.delete();

            // Decrementar contador
            await db.collection("library").doc(contentId).update({
                likes: admin.firestore.FieldValue.increment(-1)
            });

            return {
                success: true,
                message: "Like removido",
                liked: false
            };
        }
    } catch (error) {
        logger.error("Error liking content:", error);
        throw new Error(error instanceof Error ? error.message : "Error al gestionar like");
    }
});

export const getLibraryCategories = onCall(async () => {
    try {
        // Obtener categorías únicas del contenido publicado
        const librarySnapshot = await db.collection("library")
            .where("status", "==", "published")
            .get();

        const categoriesMap: { [key: string]: number } = {};
        
        librarySnapshot.docs.forEach(doc => {
            const data = doc.data();
            const category = data.category || "general";
            categoriesMap[category] = (categoriesMap[category] || 0) + 1;
        });

        const categories = Object.entries(categoriesMap).map(([name, count]) => ({
            name,
            count
        }));

        return {
            success: true,
            data: categories
        };
    } catch (error) {
        logger.error("Error getting library categories:", error);
        throw new Error("Error al obtener categorías de la biblioteca");
    }
});

export const searchLibraryContent = onCall(async (request) => {
    try {
        const { searchTerm, type, category, difficulty, limit = 10 } = request.data;

        let query = db.collection("library")
            .where("status", "==", "published") as any;

        if (type) {
            query = query.where("type", "==", type);
        }
        if (category) {
            query = query.where("category", "==", category);
        }
        if (difficulty) {
            query = query.where("difficulty", "==", difficulty);
        }

        query = query.orderBy("createdAt", "desc").limit(limit);

        const librarySnapshot = await query.get();
        let content = librarySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Filtro simple por término de búsqueda
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            content = content.filter((item: any) => 
                item.title?.toLowerCase().includes(term) ||
                item.description?.toLowerCase().includes(term) ||
                item.tags?.some((tag: string) => tag.toLowerCase().includes(term))
            );
        }

        return {
            success: true,
            data: content
        };
    } catch (error) {
        logger.error("Error searching library content:", error);
        throw new Error("Error al buscar contenido");
    }
});

export const getUserProgress = onCall(async (request) => {
    try {
        const { userId } = request.data;
        const uid = request.auth?.uid;

        if (!uid) {
            throw new Error("Usuario no autenticado");
        }

        const targetUserId = userId || uid;

        // Solo el mismo usuario o admin puede ver el progreso
        if (targetUserId !== uid) {
            const userDoc = await db.collection("users").doc(uid).get();
            const userData = userDoc.data();
            if (!userData || userData.role !== "admin") {
                throw new Error("No tienes permisos para ver el progreso de otros usuarios");
            }
        }

        // Obtener contenido completado
        const progressSnapshot = await db.collection("user_progress")
            .where("userId", "==", targetUserId)
            .get();

        const completedContent = progressSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Obtener likes del usuario
        const likesSnapshot = await db.collection("content_likes")
            .where("userId", "==", targetUserId)
            .get();

        const likedContent = likesSnapshot.docs.map(doc => doc.data().contentId);

        return {
            success: true,
            data: {
                completedContent,
                likedContent,
                stats: {
                    totalCompleted: completedContent.length,
                    totalLiked: likedContent.length
                }
            }
        };
    } catch (error) {
        logger.error("Error getting user progress:", error);
        throw new Error("Error al obtener progreso del usuario");
    }
});

export const markContentAsCompleted = onCall(async (request) => {
    try {
        const { contentId } = request.data;
        const uid = request.auth?.uid;

        if (!uid) {
            throw new Error("Usuario no autenticado");
        }

        if (!contentId) {
            throw new Error("ID del contenido requerido");
        }

        // Verificar si ya está marcado como completado
        const existingProgress = await db.collection("user_progress")
            .where("userId", "==", uid)
            .where("contentId", "==", contentId)
            .get();

        if (!existingProgress.empty) {
            return {
                success: true,
                message: "Contenido ya estaba marcado como completado"
            };
        }

        // Marcar como completado
        await db.collection("user_progress").add({
            userId: uid,
            contentId: contentId,
            completedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        return {
            success: true,
            message: "Contenido marcado como completado"
        };
    } catch (error) {
        logger.error("Error marking content as completed:", error);
        throw new Error("Error al marcar contenido como completado");
    }
});