import { onCall } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";

const db = admin.firestore();

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
        const { status, categoryId, limit = 10, orderBy = "createdAt", userId } = request.data || {};

        let query = db.collection("projects") as any;

        if (status) {
            query = query.where("status", "==", status);
        }
        if (categoryId) {
            query = query.where("categoryId", "==", categoryId);
        }
        if (userId) {
            query = query.where("userId", "==", userId);
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

export const getFeaturedProjects = onCall(async (request) => {
    try {
        const { limit = 6 } = request.data || {};

        const snapshot = await db.collection("projects")
            .where("status", "==", "active")
            .orderBy("moneyReached", "desc")
            .limit(limit)
            .get();

        const projects = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return {
            success: true,
            data: projects
        };
    } catch (error) {
        logger.error("Error getting featured projects:", error);
        throw new Error("Error al obtener proyectos destacados");
    }
});

export const searchProjects = onCall(async (request) => {
    try {
        const { searchTerm, categoryId, limit = 10 } = request.data;

        let query = db.collection("projects")
            .where("status", "==", "active") as any;

        if (categoryId) {
            query = query.where("categoryId", "==", categoryId);
        }

        query = query.orderBy("createdAt", "desc").limit(limit);

        const snapshot = await query.get();
        let projects = snapshot.docs.map((doc: any) => ({
            id: doc.id,
            ...doc.data()
        }));

        // Filtro simple por término de búsqueda (en production usar Algolia o similar)
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            projects = projects.filter((project: any) => 
                project.projectObj?.toLowerCase().includes(term) ||
                project.projectDescription?.toLowerCase().includes(term) ||
                project.founder?.toLowerCase().includes(term)
            );
        }

        return {
            success: true,
            data: projects
        };
    } catch (error) {
        logger.error("Error searching projects:", error);
        throw new Error("Error al buscar proyectos");
    }
});

export const getProjectOwnerDashboard = onCall(async (request) => {
    try {
        const { projectId } = request.data;
        const uid = request.auth?.uid;

        if (!uid) {
            throw new Error("Usuario no autenticado");
        }

        // Verificar que el usuario sea el dueño del proyecto
        const projectDoc = await db.collection("projects").doc(projectId).get();
        if (!projectDoc.exists) {
            throw new Error("Proyecto no encontrado");
        }

        const projectData = projectDoc.data();
        if (projectData?.userId !== uid) {
            throw new Error("No tienes permisos para acceder a este dashboard");
        }

        // Obtener inversiones del proyecto
        const investmentsSnapshot = await db.collection("investments")
            .where("projectId", "==", projectId)
            .orderBy("createdAt", "desc")
            .get();

        const investments = investmentsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return {
            success: true,
            data: {
                project: {
                    id: projectDoc.id,
                    ...projectData
                },
                investments,
                totalInvestments: investments.length,
                totalAmount: investments.reduce((sum: number, inv: any) => sum + (inv.amount || 0), 0)
            }
        };
    } catch (error) {
        logger.error("Error getting project dashboard:", error);
        throw new Error(error instanceof Error ? error.message : "Error al obtener dashboard");
    }
});