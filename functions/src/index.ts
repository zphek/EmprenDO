import { setGlobalOptions } from "firebase-functions";
import { onCall } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

setGlobalOptions({ maxInstances: 10 });

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

// ============================================================================
// PROJECT MANAGEMENT FUNCTIONS
// ============================================================================

export const createProject = onCall(async (request) => {
    try {
        const projectData = request.data;
        const uid = request.auth?.uid;

        if (!uid) {
            throw new Error("Usuario no autenticado");
        }

        // Verificar que el proyecto no exista
        const existingProject = await db.collection("projects")
            .where("projectObj", "==", projectData.projectObj)
            .get();

        if (!existingProject.empty) {
            throw new Error("Ya existe un proyecto con este nombre");
        }

        const newProjectData = {
            ...projectData,
            userId: uid,
            contributors: "0",
            moneyReached: 0,
            status: "active",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        const projectRef = await db.collection("projects").add(newProjectData);

        return {
            success: true,
            message: "Proyecto creado exitosamente",
            projectId: projectRef.id
        };
    } catch (error) {
        logger.error("Error creating project:", error);
        throw new Error(error instanceof Error ? error.message : "Error al crear proyecto");
    }
});

export const getProjects = onCall(async (request) => {
    try {
        const { status, categoryId, limit = 10, orderBy = "createdAt" } = request.data || {};

        let query = db.collection("projects") as any;

        if (status) {
            query = query.where("status", "==", status);
        }
        if (categoryId) {
            query = query.where("categoryId", "==", categoryId);
        }

        query = query.orderBy(orderBy, "desc").limit(limit);

        const snapshot = await query.get();
        const projects = snapshot.docs.map((doc: any) => ({
            id: doc.id,
            ...doc.data()
        }));

        return {
            success: true,
            data: projects
        };
    } catch (error) {
        logger.error("Error getting projects:", error);
        throw new Error("Error al obtener proyectos");
    }
});

export const getProject = onCall(async (request) => {
    try {
        const { projectId } = request.data;

        if (!projectId) {
            throw new Error("ID del proyecto requerido");
        }

        const projectDoc = await db.collection("projects").doc(projectId).get();

        if (!projectDoc.exists) {
            throw new Error("Proyecto no encontrado");
        }

        return {
            success: true,
            data: {
                id: projectDoc.id,
                ...projectDoc.data()
            }
        };
    } catch (error) {
        logger.error("Error getting project:", error);
        throw new Error(error instanceof Error ? error.message : "Error al obtener proyecto");
    }
});

export const updateProject = onCall(async (request) => {
    try {
        const { projectId, updateData } = request.data;
        const uid = request.auth?.uid;

        if (!uid) {
            throw new Error("Usuario no autenticado");
        }

        // Verificar que el usuario sea el dueño del proyecto o admin
        const projectDoc = await db.collection("projects").doc(projectId).get();
        if (!projectDoc.exists) {
            throw new Error("Proyecto no encontrado");
        }

        const projectData = projectDoc.data();
        if (projectData?.userId !== uid) {
            const userDoc = await db.collection("users").doc(uid).get();
            const userData = userDoc.data();
            if (!userData || userData.role !== "admin") {
                throw new Error("No tienes permisos para editar este proyecto");
            }
        }

        const updatedData = {
            ...updateData,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        await db.collection("projects").doc(projectId).update(updatedData);

        return {
            success: true,
            message: "Proyecto actualizado exitosamente"
        };
    } catch (error) {
        logger.error("Error updating project:", error);
        throw new Error(error instanceof Error ? error.message : "Error al actualizar proyecto");
    }
});

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

        // Obtener los datos de los proyectos favoritos
        const projectsSnapshot = await db.collection("projects")
            .where(admin.firestore.FieldPath.documentId(), "in", favoriteProjectIds)
            .get();

        const projects = projectsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return {
            success: true,
            data: projects
        };
    } catch (error) {
        logger.error("Error getting user favorites:", error);
        throw new Error("Error al obtener proyectos favoritos");
    }
});

// ============================================================================
// MENTORSHIP FUNCTIONS
// ============================================================================

export const getMentors = onCall(async () => {
    try {
        const mentorsSnapshot = await db.collection("mentorUser")
            .where("status", "==", "active")
            .get();

        const mentors = mentorsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return {
            success: true,
            data: mentors
        };
    } catch (error) {
        logger.error("Error getting mentors:", error);
        throw new Error("Error al obtener mentores");
    }
});

export const requestMentorship = onCall(async (request) => {
    try {
        const { mentorId, message } = request.data;
        const uid = request.auth?.uid;

        if (!uid) {
            throw new Error("Usuario no autenticado");
        }

        if (!mentorId) {
            throw new Error("ID del mentor requerido");
        }

        // Verificar que no exista una solicitud pendiente
        const existingRequest = await db.collection("subscriptions")
            .where("studentId", "==", uid)
            .where("mentorId", "==", mentorId)
            .where("status", "in", ["pending", "active"])
            .get();

        if (!existingRequest.empty) {
            throw new Error("Ya tienes una solicitud activa con este mentor");
        }

        const subscriptionData = {
            studentId: uid,
            mentorId: mentorId,
            message: message || "",
            status: "pending",
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };

        const subscriptionRef = await db.collection("subscriptions").add(subscriptionData);

        return {
            success: true,
            message: "Solicitud de mentoría enviada",
            subscriptionId: subscriptionRef.id
        };
    } catch (error) {
        logger.error("Error requesting mentorship:", error);
        throw new Error(error instanceof Error ? error.message : "Error al solicitar mentoría");
    }
});

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
        const { projectId } = request.data;

        if (!projectId) {
            throw new Error("ID del proyecto requerido");
        }

        const reviewsSnapshot = await db.collection("reviews")
            .where("projectId", "==", projectId)
            .orderBy("createdAt", "desc")
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

        const testimonialData = {
            userId: uid,
            rating: Number(rating),
            comment: comment,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };

        const testimonialRef = await db.collection("testimonies").add(testimonialData);

        return {
            success: true,
            message: "Testimonio creado exitosamente",
            testimonialId: testimonialRef.id
        };
    } catch (error) {
        logger.error("Error creating testimonial:", error);
        throw new Error(error instanceof Error ? error.message : "Error al crear testimonio");
    }
});

export const getTestimonials = onCall(async (request) => {
    try {
        const { limit = 10 } = request.data || {};

        const testimonialsSnapshot = await db.collection("testimonies")
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