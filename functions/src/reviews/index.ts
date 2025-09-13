import { onCall } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";

const db = admin.firestore();

// ============================================================================
// REVIEWS FUNCTIONS
// ============================================================================

export const createReview = onCall(async (request) => {
    try {
        const { projectId, rating, comment } = request.data;
        const uid = request.auth?.uid;

        if (!uid) {
            throw new Error("Usuario no autenticado");
        }

        if (!projectId || !rating) {
            throw new Error("Datos de review incompletos");
        }

        if (rating < 1 || rating > 5) {
            throw new Error("La calificación debe estar entre 1 y 5");
        }

        // Verificar que el usuario haya contribuido al proyecto
        const contributionQuery = await db.collection("investments")
            .where("userId", "==", uid)
            .where("projectId", "==", projectId)
            .get();

        if (contributionQuery.empty) {
            throw new Error("Solo los contribuyentes pueden dejar reviews");
        }

        // Verificar que no haya hecho review antes
        const existingReview = await db.collection("reviews")
            .where("userId", "==", uid)
            .where("projectId", "==", projectId)
            .get();

        if (!existingReview.empty) {
            throw new Error("Ya has dejado una review para este proyecto");
        }

        const reviewData = {
            userId: uid,
            projectId: projectId,
            rating: Number(rating),
            comment: comment || "",
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };

        const reviewRef = await db.collection("reviews").add(reviewData);

        return {
            success: true,
            message: "Review creada exitosamente",
            reviewId: reviewRef.id
        };
    } catch (error) {
        logger.error("Error creating review:", error);
        throw new Error(error instanceof Error ? error.message : "Error al crear review");
    }
});

export const getProjectReviews = onCall(async (request) => {
    try {
        const { projectId, limit = 10 } = request.data;

        if (!projectId) {
            throw new Error("ID del proyecto requerido");
        }

        const reviewsSnapshot = await db.collection("reviews")
            .where("projectId", "==", projectId)
            .orderBy("createdAt", "desc")
            .limit(limit)
            .get();

        const reviews = [];
        for (const reviewDoc of reviewsSnapshot.docs) {
            const reviewData = reviewDoc.data();
            
            // Obtener datos del usuario que hizo la review
            const userDoc = await db.collection("users").doc(reviewData.userId).get();
            const userData = userDoc.exists ? userDoc.data() : null;

            reviews.push({
                id: reviewDoc.id,
                ...reviewData,
                user: userData ? {
                    name: userData.name,
                    email: userData.email
                } : null
            });
        }

        return {
            success: true,
            data: reviews
        };
    } catch (error) {
        logger.error("Error getting project reviews:", error);
        throw new Error("Error al obtener reviews del proyecto");
    }
});

export const getProjectRatingStats = onCall(async (request) => {
    try {
        const { projectId } = request.data;

        if (!projectId) {
            throw new Error("ID del proyecto requerido");
        }

        const reviewsSnapshot = await db.collection("reviews")
            .where("projectId", "==", projectId)
            .get();

        const reviews = reviewsSnapshot.docs.map(doc => doc.data());
        const totalReviews = reviews.length;

        if (totalReviews === 0) {
            return {
                success: true,
                data: {
                    averageRating: 0,
                    totalReviews: 0,
                    ratingDistribution: {
                        5: 0, 4: 0, 3: 0, 2: 0, 1: 0
                    }
                }
            };
        }

        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = totalRating / totalReviews;

        const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviews.forEach(review => {
            ratingDistribution[review.rating as keyof typeof ratingDistribution]++;
        });

        return {
            success: true,
            data: {
                averageRating: Math.round(averageRating * 100) / 100,
                totalReviews,
                ratingDistribution
            }
        };
    } catch (error) {
        logger.error("Error getting rating stats:", error);
        throw new Error("Error al obtener estadísticas de calificación");
    }
});

export const updateReview = onCall(async (request) => {
    try {
        const { reviewId, rating, comment } = request.data;
        const uid = request.auth?.uid;

        if (!uid) {
            throw new Error("Usuario no autenticado");
        }

        if (!reviewId) {
            throw new Error("ID del review requerido");
        }

        // Verificar que el review pertenezca al usuario
        const reviewDoc = await db.collection("reviews").doc(reviewId).get();
        if (!reviewDoc.exists) {
            throw new Error("Review no encontrado");
        }

        const reviewData = reviewDoc.data();
        if (reviewData?.userId !== uid) {
            throw new Error("No tienes permisos para editar este review");
        }

        const updateData: any = {
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        if (rating !== undefined) {
            if (rating < 1 || rating > 5) {
                throw new Error("La calificación debe estar entre 1 y 5");
            }
            updateData.rating = Number(rating);
        }

        if (comment !== undefined) {
            updateData.comment = comment;
        }

        await db.collection("reviews").doc(reviewId).update(updateData);

        return {
            success: true,
            message: "Review actualizado exitosamente"
        };
    } catch (error) {
        logger.error("Error updating review:", error);
        throw new Error(error instanceof Error ? error.message : "Error al actualizar review");
    }
});

export const deleteReview = onCall(async (request) => {
    try {
        const { reviewId } = request.data;
        const uid = request.auth?.uid;

        if (!uid) {
            throw new Error("Usuario no autenticado");
        }

        if (!reviewId) {
            throw new Error("ID del review requerido");
        }

        // Verificar que el review pertenezca al usuario o sea admin
        const reviewDoc = await db.collection("reviews").doc(reviewId).get();
        if (!reviewDoc.exists) {
            throw new Error("Review no encontrado");
        }

        const reviewData = reviewDoc.data();
        if (reviewData?.userId !== uid) {
            // Verificar si es admin
            const userDoc = await db.collection("users").doc(uid).get();
            const userData = userDoc.data();
            if (!userData || userData.role !== "admin") {
                throw new Error("No tienes permisos para eliminar este review");
            }
        }

        await db.collection("reviews").doc(reviewId).delete();

        return {
            success: true,
            message: "Review eliminado exitosamente"
        };
    } catch (error) {
        logger.error("Error deleting review:", error);
        throw new Error(error instanceof Error ? error.message : "Error al eliminar review");
    }
});

export const getUserReviews = onCall(async (request) => {
    try {
        const { userId, limit = 10 } = request.data;
        const uid = request.auth?.uid;

        if (!uid) {
            throw new Error("Usuario no autenticado");
        }

        const targetUserId = userId || uid;

        const reviewsSnapshot = await db.collection("reviews")
            .where("userId", "==", targetUserId)
            .orderBy("createdAt", "desc")
            .limit(limit)
            .get();

        const reviews = [];
        for (const reviewDoc of reviewsSnapshot.docs) {
            const reviewData = reviewDoc.data();
            
            // Obtener datos del proyecto
            const projectDoc = await db.collection("projects").doc(reviewData.projectId).get();
            const projectData = projectDoc.exists ? projectDoc.data() : null;

            reviews.push({
                id: reviewDoc.id,
                ...reviewData,
                project: projectData ? {
                    id: projectDoc.id,
                    projectObj: projectData.projectObj,
                    images: projectData.images || []
                } : null
            });
        }

        return {
            success: true,
            data: reviews
        };
    } catch (error) {
        logger.error("Error getting user reviews:", error);
        throw new Error("Error al obtener reviews del usuario");
    }
});