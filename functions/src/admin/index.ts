import { onCall } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";

const db = admin.firestore();

// ============================================================================
// ADMIN FUNCTIONS
// ============================================================================

// Verificar permisos de admin
const verifyAdmin = async (uid: string): Promise<void> => {
    const userDoc = await db.collection("users").doc(uid).get();
    const userData = userDoc.data();
    if (!userData || userData.role !== "admin") {
        throw new Error("No tienes permisos de administrador");
    }
};

// ============================================================================
// USERS ADMIN
// ============================================================================

export const getAllUsers = onCall(async (request) => {
    try {
        const uid = request.auth?.uid;

        if (!uid) {
            throw new Error("Usuario no autenticado");
        }

        await verifyAdmin(uid);

        const usersSnapshot = await db.collection("users")
            .orderBy("createdAt", "desc")
            .get();

        const users = usersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return {
            success: true,
            data: users
        };
    } catch (error) {
        logger.error("Error getting all users:", error);
        throw new Error(error instanceof Error ? error.message : "Error al obtener usuarios");
    }
});

export const updateUserRole = onCall(async (request) => {
    try {
        const { userId, role } = request.data;
        const uid = request.auth?.uid;

        if (!uid) {
            throw new Error("Usuario no autenticado");
        }

        await verifyAdmin(uid);

        if (!["normal", "admin", "mentor"].includes(role)) {
            throw new Error("Rol inválido");
        }

        await db.collection("users").doc(userId).update({
            role,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        return {
            success: true,
            message: "Rol de usuario actualizado exitosamente"
        };
    } catch (error) {
        logger.error("Error updating user role:", error);
        throw new Error(error instanceof Error ? error.message : "Error al actualizar rol");
    }
});

export const deleteUser = onCall(async (request) => {
    try {
        const { userId } = request.data;
        const uid = request.auth?.uid;

        if (!uid) {
            throw new Error("Usuario no autenticado");
        }

        await verifyAdmin(uid);

        // No permitir que los admins se eliminen a sí mismos
        if (userId === uid) {
            throw new Error("No puedes eliminarte a ti mismo");
        }

        // Eliminar usuario de Authentication
        await admin.auth().deleteUser(userId);

        // Eliminar documento del usuario
        await db.collection("users").doc(userId).delete();

        return {
            success: true,
            message: "Usuario eliminado exitosamente"
        };
    } catch (error) {
        logger.error("Error deleting user:", error);
        throw new Error(error instanceof Error ? error.message : "Error al eliminar usuario");
    }
});

export const createAdminUser = onCall(async (request) => {
    try {
        const { name, email, password, role = "admin" } = request.data;
        const uid = request.auth?.uid;

        if (!uid) {
            throw new Error("Usuario no autenticado");
        }

        await verifyAdmin(uid);

        // Crear usuario en Authentication
        const userRecord = await admin.auth().createUser({
            email,
            password,
            displayName: name,
            emailVerified: true
        });

        // Crear documento en Firestore
        await db.collection("users").doc(userRecord.uid).set({
            name,
            email,
            role,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            createdByAdmin: uid
        });

        return {
            success: true,
            message: "Usuario administrador creado exitosamente",
            userId: userRecord.uid
        };
    } catch (error) {
        logger.error("Error creating admin user:", error);
        throw new Error(error instanceof Error ? error.message : "Error al crear usuario administrador");
    }
});

// ============================================================================
// PROJECTS ADMIN
// ============================================================================

export const getAllProjects = onCall(async (request) => {
    try {
        const { status, limit = 20 } = request.data || {};
        const uid = request.auth?.uid;

        if (!uid) {
            throw new Error("Usuario no autenticado");
        }

        await verifyAdmin(uid);

        let query = db.collection("projects") as any;

        if (status) {
            query = query.where("status", "==", status);
        }

        query = query.orderBy("createdAt", "desc").limit(limit);

        const projectsSnapshot = await query.get();
        const projects = [];

        for (const projectDoc of projectsSnapshot.docs) {
            const projectData = projectDoc.data();
            
            // Obtener datos del usuario dueño
            const userDoc = await db.collection("users").doc(projectData.userId).get();
            const userData = userDoc.exists ? userDoc.data() : null;

            projects.push({
                id: projectDoc.id,
                ...projectData,
                owner: userData ? {
                    name: userData.name,
                    email: userData.email
                } : null
            });
        }

        return {
            success: true,
            data: projects
        };
    } catch (error) {
        logger.error("Error getting all projects:", error);
        throw new Error(error instanceof Error ? error.message : "Error al obtener proyectos");
    }
});

export const updateProjectStatus = onCall(async (request) => {
    try {
        const { projectId, status, reason } = request.data;
        const uid = request.auth?.uid;

        if (!uid) {
            throw new Error("Usuario no autenticado");
        }

        await verifyAdmin(uid);

        if (!["active", "pending", "rejected", "completed", "suspended"].includes(status)) {
            throw new Error("Estado de proyecto inválido");
        }

        const updateData: any = {
            status,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedByAdmin: uid
        };

        if (reason) {
            updateData.adminReason = reason;
        }

        await db.collection("projects").doc(projectId).update(updateData);

        return {
            success: true,
            message: "Estado del proyecto actualizado exitosamente"
        };
    } catch (error) {
        logger.error("Error updating project status:", error);
        throw new Error(error instanceof Error ? error.message : "Error al actualizar estado del proyecto");
    }
});

export const deleteProject = onCall(async (request) => {
    try {
        const { projectId } = request.data;
        const uid = request.auth?.uid;

        if (!uid) {
            throw new Error("Usuario no autenticado");
        }

        await verifyAdmin(uid);

        // Verificar que no haya inversiones
        const investmentsSnapshot = await db.collection("investments")
            .where("projectId", "==", projectId)
            .limit(1)
            .get();

        if (!investmentsSnapshot.empty) {
            throw new Error("No se puede eliminar un proyecto con inversiones");
        }

        // Eliminar reviews del proyecto
        const reviewsSnapshot = await db.collection("reviews")
            .where("projectId", "==", projectId)
            .get();

        const batch = db.batch();
        reviewsSnapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });

        // Eliminar proyecto
        batch.delete(db.collection("projects").doc(projectId));

        await batch.commit();

        return {
            success: true,
            message: "Proyecto eliminado exitosamente"
        };
    } catch (error) {
        logger.error("Error deleting project:", error);
        throw new Error(error instanceof Error ? error.message : "Error al eliminar proyecto");
    }
});

// ============================================================================
// MENTORS ADMIN
// ============================================================================

export const getAllMentors = onCall(async (request) => {
    try {
        const uid = request.auth?.uid;

        if (!uid) {
            throw new Error("Usuario no autenticado");
        }

        await verifyAdmin(uid);

        const mentorsSnapshot = await db.collection("mentorUser")
            .orderBy("createdAt", "desc")
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
        logger.error("Error getting all mentors:", error);
        throw new Error("Error al obtener mentores");
    }
});

export const updateMentorStatus = onCall(async (request) => {
    try {
        const { mentorId, status } = request.data;
        const uid = request.auth?.uid;

        if (!uid) {
            throw new Error("Usuario no autenticado");
        }

        await verifyAdmin(uid);

        if (!["active", "inactive", "pending", "rejected"].includes(status)) {
            throw new Error("Estado de mentor inválido");
        }

        await db.collection("mentorUser").doc(mentorId).update({
            status,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedByAdmin: uid
        });

        return {
            success: true,
            message: "Estado del mentor actualizado exitosamente"
        };
    } catch (error) {
        logger.error("Error updating mentor status:", error);
        throw new Error(error instanceof Error ? error.message : "Error al actualizar estado del mentor");
    }
});

// ============================================================================
// DASHBOARD ADMIN
// ============================================================================

export const getAdminDashboard = onCall(async (request) => {
    try {
        const uid = request.auth?.uid;

        if (!uid) {
            throw new Error("Usuario no autenticado");
        }

        await verifyAdmin(uid);

        // Contar usuarios
        const usersSnapshot = await db.collection("users").get();
        const totalUsers = usersSnapshot.size;

        // Contar proyectos por estado
        const projectsSnapshot = await db.collection("projects").get();
        const projectsByStatus = { active: 0, pending: 0, rejected: 0, completed: 0 };
        
        projectsSnapshot.docs.forEach(doc => {
            const data = doc.data();
            const status = data.status || 'pending';
            if (projectsByStatus.hasOwnProperty(status)) {
                projectsByStatus[status as keyof typeof projectsByStatus]++;
            }
        });

        // Contar mentores
        const mentorsSnapshot = await db.collection("mentorUser").get();
        const totalMentors = mentorsSnapshot.size;

        // Calcular total de inversiones
        const investmentsSnapshot = await db.collection("investments").get();
        let totalInvestments = 0;
        investmentsSnapshot.docs.forEach(doc => {
            const data = doc.data();
            totalInvestments += data.amount || 0;
        });

        // Testimonios pendientes
        const pendingTestimonialsSnapshot = await db.collection("testimonies")
            .where("status", "==", "pending")
            .get();

        return {
            success: true,
            data: {
                users: {
                    total: totalUsers
                },
                projects: {
                    total: projectsSnapshot.size,
                    byStatus: projectsByStatus
                },
                mentors: {
                    total: totalMentors
                },
                investments: {
                    total: totalInvestments,
                    count: investmentsSnapshot.size
                },
                testimonials: {
                    pending: pendingTestimonialsSnapshot.size
                }
            }
        };
    } catch (error) {
        logger.error("Error getting admin dashboard:", error);
        throw new Error("Error al obtener dashboard de administrador");
    }
});

// ============================================================================
// TESTIMONIALS ADMIN
// ============================================================================

export const moderateTestimonial = onCall(async (request) => {
    try {
        const { testimonialId, action, reason } = request.data;
        const uid = request.auth?.uid;

        if (!uid) {
            throw new Error("Usuario no autenticado");
        }

        await verifyAdmin(uid);

        if (!["approve", "reject"].includes(action)) {
            throw new Error("Acción inválida");
        }

        const status = action === "approve" ? "approved" : "rejected";

        const updateData: any = {
            status,
            moderatedAt: admin.firestore.FieldValue.serverTimestamp(),
            moderatedBy: uid
        };

        if (reason) {
            updateData.moderationReason = reason;
        }

        await db.collection("testimonies").doc(testimonialId).update(updateData);

        return {
            success: true,
            message: `Testimonio ${action === "approve" ? "aprobado" : "rechazado"} exitosamente`
        };
    } catch (error) {
        logger.error("Error moderating testimonial:", error);
        throw new Error(error instanceof Error ? error.message : "Error al moderar testimonio");
    }
});

export const getPendingTestimonials = onCall(async (request) => {
    try {
        const uid = request.auth?.uid;

        if (!uid) {
            throw new Error("Usuario no autenticado");
        }

        await verifyAdmin(uid);

        const testimonialsSnapshot = await db.collection("testimonies")
            .where("status", "==", "pending")
            .orderBy("createdAt", "desc")
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
        logger.error("Error getting pending testimonials:", error);
        throw new Error("Error al obtener testimonios pendientes");
    }
});