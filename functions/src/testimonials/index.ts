import { onCall } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";

const db = admin.firestore();

// ============================================================================
// TESTIMONIALS FUNCTIONS
// ============================================================================

export const createTestimonial = onCall(async (request) => {
    try {
        const { rating, comment } = request.data;
        const uid = request.auth?.uid;

        if (!uid) {
            throw new Error("Usuario no autenticado");
        }

        if (!rating || !comment) {
            throw new Error("Rating y comentario son requeridos");
        }

        if (rating < 1 || rating > 5) {
            throw new Error("La calificación debe estar entre 1 y 5");
        }

        if (comment.trim().length < 10) {
            throw new Error("El comentario debe tener al menos 10 caracteres");
        }

        // Verificar que el usuario no haya dejado un testimonio recientemente (últimos 30 días)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentTestimonialQuery = await db.collection("testimonies")
            .where("userId", "==", uid)
            .where("createdAt", ">=", admin.firestore.Timestamp.fromDate(thirtyDaysAgo))
            .get();

        if (!recentTestimonialQuery.empty) {
            throw new Error("Solo puedes dejar un testimonio cada 30 días");
        }

        const testimonialData = {
            userId: uid,
            rating: Number(rating),
            comment: comment.trim(),
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            status: "pending" // Los testimonios requieren aprobación
        };

        const testimonialRef = await db.collection("testimonies").add(testimonialData);

        return {
            success: true,
            message: "Testimonio enviado exitosamente, está pendiente de aprobación",
            testimonialId: testimonialRef.id
        };
    } catch (error) {
        logger.error("Error creating testimonial:", error);
        throw new Error(error instanceof Error ? error.message : "Error al crear testimonio");
    }
});

export const getTestimonials = onCall(async (request) => {
    try {
        const { limit = 10, status = "approved" } = request.data || {};

        const testimonialsSnapshot = await db.collection("testimonies")
            .where("status", "==", status)
            .orderBy("createdAt", "desc")
            .limit(limit)
            .get();

        const testimonials = [];
        for (const testimonialDoc of testimonialsSnapshot.docs) {
            const testimonialData = testimonialDoc.data();
            
            // Obtener datos del usuario
            const userDoc = await db.collection("users").doc(testimonialData.userId).get();
            const userData = userDoc.exists ? userDoc.data() : null;

            testimonials.push({
                id: testimonialDoc.id,
                ...testimonialData,
                user: userData ? {
                    name: userData.name,
                    email: userData.email
                } : null
            });
        }

        return {
            success: true,
            data: testimonials
        };
    } catch (error) {
        logger.error("Error getting testimonials:", error);
        throw new Error("Error al obtener testimonios");
    }
});

export const getUserTestimonials = onCall(async (request) => {
    try {
        const { userId } = request.data;
        const uid = request.auth?.uid;

        if (!uid) {
            throw new Error("Usuario no autenticado");
        }

        const targetUserId = userId || uid;

        const testimonialsSnapshot = await db.collection("testimonies")
            .where("userId", "==", targetUserId)
            .orderBy("createdAt", "desc")
            .get();

        const testimonials = testimonialsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return {
            success: true,
            data: testimonials
        };
    } catch (error) {
        logger.error("Error getting user testimonials:", error);
        throw new Error("Error al obtener testimonios del usuario");
    }
});

export const updateTestimonial = onCall(async (request) => {
    try {
        const { testimonialId, rating, comment } = request.data;
        const uid = request.auth?.uid;

        if (!uid) {
            throw new Error("Usuario no autenticado");
        }

        if (!testimonialId) {
            throw new Error("ID del testimonio requerido");
        }

        // Verificar que el testimonio pertenezca al usuario
        const testimonialDoc = await db.collection("testimonies").doc(testimonialId).get();
        if (!testimonialDoc.exists) {
            throw new Error("Testimonio no encontrado");
        }

        const testimonialData = testimonialDoc.data();
        if (testimonialData?.userId !== uid) {
            throw new Error("No tienes permisos para editar este testimonio");
        }

        const updateData: any = {
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            status: "pending" // Requiere nueva aprobación después de editar
        };

        if (rating !== undefined) {
            if (rating < 1 || rating > 5) {
                throw new Error("La calificación debe estar entre 1 y 5");
            }
            updateData.rating = Number(rating);
        }

        if (comment !== undefined) {
            if (comment.trim().length < 10) {
                throw new Error("El comentario debe tener al menos 10 caracteres");
            }
            updateData.comment = comment.trim();
        }

        await db.collection("testimonies").doc(testimonialId).update(updateData);

        return {
            success: true,
            message: "Testimonio actualizado exitosamente, está pendiente de aprobación"
        };
    } catch (error) {
        logger.error("Error updating testimonial:", error);
        throw new Error(error instanceof Error ? error.message : "Error al actualizar testimonio");
    }
});

export const deleteTestimonial = onCall(async (request) => {
    try {
        const { testimonialId } = request.data;
        const uid = request.auth?.uid;

        if (!uid) {
            throw new Error("Usuario no autenticado");
        }

        if (!testimonialId) {
            throw new Error("ID del testimonio requerido");
        }

        // Verificar que el testimonio pertenezca al usuario o sea admin
        const testimonialDoc = await db.collection("testimonies").doc(testimonialId).get();
        if (!testimonialDoc.exists) {
            throw new Error("Testimonio no encontrado");
        }

        const testimonialData = testimonialDoc.data();
        if (testimonialData?.userId !== uid) {
            // Verificar si es admin
            const userDoc = await db.collection("users").doc(uid).get();
            const userData = userDoc.data();
            if (!userData || userData.role !== "admin") {
                throw new Error("No tienes permisos para eliminar este testimonio");
            }
        }

        await db.collection("testimonies").doc(testimonialId).delete();

        return {
            success: true,
            message: "Testimonio eliminado exitosamente"
        };
    } catch (error) {
        logger.error("Error deleting testimonial:", error);
        throw new Error(error instanceof Error ? error.message : "Error al eliminar testimonio");
    }
});

export const getTestimonialStats = onCall(async () => {
    try {
        const testimonialsSnapshot = await db.collection("testimonies")
            .where("status", "==", "approved")
            .get();

        const testimonials = testimonialsSnapshot.docs.map(doc => doc.data());
        const totalTestimonials = testimonials.length;

        if (totalTestimonials === 0) {
            return {
                success: true,
                data: {
                    averageRating: 0,
                    totalTestimonials: 0,
                    ratingDistribution: {
                        5: 0, 4: 0, 3: 0, 2: 0, 1: 0
                    }
                }
            };
        }

        const totalRating = testimonials.reduce((sum, testimonial) => sum + testimonial.rating, 0);
        const averageRating = totalRating / totalTestimonials;

        const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        testimonials.forEach(testimonial => {
            ratingDistribution[testimonial.rating as keyof typeof ratingDistribution]++;
        });

        return {
            success: true,
            data: {
                averageRating: Math.round(averageRating * 100) / 100,
                totalTestimonials,
                ratingDistribution
            }
        };
    } catch (error) {
        logger.error("Error getting testimonial stats:", error);
        throw new Error("Error al obtener estadísticas de testimonios");
    }
});