import { onCall } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";

const db = admin.firestore();

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

export const getMentorById = onCall(async (request) => {
    try {
        const { mentorId } = request.data;

        if (!mentorId) {
            throw new Error("ID del mentor requerido");
        }

        const mentorDoc = await db.collection("mentorUser").doc(mentorId).get();

        if (!mentorDoc.exists) {
            throw new Error("Mentor no encontrado");
        }

        return {
            success: true,
            data: {
                id: mentorDoc.id,
                ...mentorDoc.data()
            }
        };
    } catch (error) {
        logger.error("Error getting mentor:", error);
        throw new Error(error instanceof Error ? error.message : "Error al obtener mentor");
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

export const getMentorDashboard = onCall(async (request) => {
    try {
        const uid = request.auth?.uid;

        if (!uid) {
            throw new Error("Usuario no autenticado");
        }

        // Verificar que el usuario sea un mentor
        const mentorDoc = await db.collection("mentorUser").doc(uid).get();
        if (!mentorDoc.exists) {
            throw new Error("Usuario no es un mentor registrado");
        }

        // Obtener solicitudes de mentoría
        const subscriptionsSnapshot = await db.collection("subscriptions")
            .where("mentorId", "==", uid)
            .orderBy("createdAt", "desc")
            .get();

        const subscriptions = [];
        for (const subscriptionDoc of subscriptionsSnapshot.docs) {
            const subscriptionData = subscriptionDoc.data();
            
            // Obtener datos del estudiante
            const studentDoc = await db.collection("users").doc(subscriptionData.studentId).get();
            const studentData = studentDoc.exists ? studentDoc.data() : null;

            subscriptions.push({
                id: subscriptionDoc.id,
                ...subscriptionData,
                student: studentData ? {
                    name: studentData.name,
                    email: studentData.email
                } : null
            });
        }

        // Obtener recursos del mentor
        const resourcesSnapshot = await db.collection("resources")
            .where("mentorId", "==", uid)
            .orderBy("createdAt", "desc")
            .get();

        const resources = resourcesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return {
            success: true,
            data: {
                mentor: mentorDoc.data(),
                subscriptions,
                resources,
                stats: {
                    totalStudents: subscriptions.filter(s => s.status === "active").length,
                    pendingRequests: subscriptions.filter(s => s.status === "pending").length,
                    totalResources: resources.length
                }
            }
        };
    } catch (error) {
        logger.error("Error getting mentor dashboard:", error);
        throw new Error(error instanceof Error ? error.message : "Error al obtener dashboard de mentor");
    }
});

export const updateSubscriptionStatus = onCall(async (request) => {
    try {
        const { subscriptionId, status } = request.data;
        const uid = request.auth?.uid;

        if (!uid) {
            throw new Error("Usuario no autenticado");
        }

        if (!["pending", "active", "rejected", "completed"].includes(status)) {
            throw new Error("Estado de suscripción inválido");
        }

        // Verificar que la suscripción pertenezca al mentor
        const subscriptionDoc = await db.collection("subscriptions").doc(subscriptionId).get();
        if (!subscriptionDoc.exists) {
            throw new Error("Suscripción no encontrada");
        }

        const subscriptionData = subscriptionDoc.data();
        if (subscriptionData?.mentorId !== uid) {
            throw new Error("No tienes permisos para actualizar esta suscripción");
        }

        await db.collection("subscriptions").doc(subscriptionId).update({
            status,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        return {
            success: true,
            message: "Estado de suscripción actualizado"
        };
    } catch (error) {
        logger.error("Error updating subscription:", error);
        throw new Error(error instanceof Error ? error.message : "Error al actualizar suscripción");
    }
});

export const addMentorResource = onCall(async (request) => {
    try {
        const { title, description, url, type } = request.data;
        const uid = request.auth?.uid;

        if (!uid) {
            throw new Error("Usuario no autenticado");
        }

        // Verificar que el usuario sea un mentor
        const mentorDoc = await db.collection("mentorUser").doc(uid).get();
        if (!mentorDoc.exists) {
            throw new Error("Usuario no es un mentor registrado");
        }

        const resourceData = {
            mentorId: uid,
            title,
            description,
            url,
            type,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };

        const resourceRef = await db.collection("resources").add(resourceData);

        return {
            success: true,
            message: "Recurso agregado exitosamente",
            resourceId: resourceRef.id
        };
    } catch (error) {
        logger.error("Error adding resource:", error);
        throw new Error(error instanceof Error ? error.message : "Error al agregar recurso");
    }
});

export const deleteMentorResource = onCall(async (request) => {
    try {
        const { resourceId } = request.data;
        const uid = request.auth?.uid;

        if (!uid) {
            throw new Error("Usuario no autenticado");
        }

        // Verificar que el recurso pertenezca al mentor
        const resourceDoc = await db.collection("resources").doc(resourceId).get();
        if (!resourceDoc.exists) {
            throw new Error("Recurso no encontrado");
        }

        const resourceData = resourceDoc.data();
        if (resourceData?.mentorId !== uid) {
            throw new Error("No tienes permisos para eliminar este recurso");
        }

        await db.collection("resources").doc(resourceId).delete();

        return {
            success: true,
            message: "Recurso eliminado exitosamente"
        };
    } catch (error) {
        logger.error("Error deleting resource:", error);
        throw new Error(error instanceof Error ? error.message : "Error al eliminar recurso");
    }
});

export const sendMentorMessage = onCall(async (request) => {
    try {
        const { subscriptionId, message } = request.data;
        const uid = request.auth?.uid;

        if (!uid) {
            throw new Error("Usuario no autenticado");
        }

        // Verificar que la suscripción existe y el usuario tiene permisos
        const subscriptionDoc = await db.collection("subscriptions").doc(subscriptionId).get();
        if (!subscriptionDoc.exists) {
            throw new Error("Suscripción no encontrada");
        }

        const subscriptionData = subscriptionDoc.data();
        if (subscriptionData?.mentorId !== uid && subscriptionData?.studentId !== uid) {
            throw new Error("No tienes permisos para enviar mensajes en esta conversación");
        }

        const messageData = {
            subscriptionId,
            senderId: uid,
            message,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };

        const messageRef = await db.collection("messages").add(messageData);

        return {
            success: true,
            message: "Mensaje enviado exitosamente",
            messageId: messageRef.id
        };
    } catch (error) {
        logger.error("Error sending message:", error);
        throw new Error(error instanceof Error ? error.message : "Error al enviar mensaje");
    }
});

export const getSubscriptionMessages = onCall(async (request) => {
    try {
        const { subscriptionId } = request.data;
        const uid = request.auth?.uid;

        if (!uid) {
            throw new Error("Usuario no autenticado");
        }

        // Verificar permisos
        const subscriptionDoc = await db.collection("subscriptions").doc(subscriptionId).get();
        if (!subscriptionDoc.exists) {
            throw new Error("Suscripción no encontrada");
        }

        const subscriptionData = subscriptionDoc.data();
        if (subscriptionData?.mentorId !== uid && subscriptionData?.studentId !== uid) {
            throw new Error("No tienes permisos para ver esta conversación");
        }

        const messagesSnapshot = await db.collection("messages")
            .where("subscriptionId", "==", subscriptionId)
            .orderBy("createdAt", "asc")
            .get();

        const messages = messagesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return {
            success: true,
            data: messages
        };
    } catch (error) {
        logger.error("Error getting messages:", error);
        throw new Error(error instanceof Error ? error.message : "Error al obtener mensajes");
    }
});