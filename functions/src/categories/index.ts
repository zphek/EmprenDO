import { onCall } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";

const db = admin.firestore();

// ============================================================================
// CATEGORIES FUNCTIONS
// ============================================================================

export const getCategories = onCall(async (request) => {
    try {
        const { includeStats = false } = request.data || {};

        const categoriesSnapshot = await db.collection("category")
            .orderBy("name", "asc")
            .get();

        const categories = [];
        for (const categoryDoc of categoriesSnapshot.docs) {
            const categoryData = {
                id: categoryDoc.id,
                ...categoryDoc.data()
            };

            // Si se requieren estadísticas, agregar conteo de proyectos
            if (includeStats) {
                const projectsSnapshot = await db.collection("projects")
                    .where("categoryId", "==", categoryDoc.id)
                    .where("status", "==", "active")
                    .get();
                
                categoryData.projectCount = projectsSnapshot.size;
            }

            categories.push(categoryData);
        }

        return {
            success: true,
            data: categories
        };
    } catch (error) {
        logger.error("Error getting categories:", error);
        throw new Error("Error al obtener categorías");
    }
});

export const createCategory = onCall(async (request) => {
    try {
        const { name, description, icon, color } = request.data;
        const uid = request.auth?.uid;

        if (!uid) {
            throw new Error("Usuario no autenticado");
        }

        // Verificar que el usuario sea admin
        const userDoc = await db.collection("users").doc(uid).get();
        const userData = userDoc.data();
        if (!userData || userData.role !== "admin") {
            throw new Error("No tienes permisos para crear categorías");
        }

        if (!name) {
            throw new Error("El nombre de la categoría es requerido");
        }

        // Verificar que no exista una categoría con el mismo nombre
        const existingCategory = await db.collection("category")
            .where("name", "==", name.trim())
            .get();

        if (!existingCategory.empty) {
            throw new Error("Ya existe una categoría con este nombre");
        }

        const categoryData = {
            name: name.trim(),
            description: description || "",
            icon: icon || "📁",
            color: color || "#3B82F6",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        const categoryRef = await db.collection("category").add(categoryData);

        return {
            success: true,
            message: "Categoría creada exitosamente",
            categoryId: categoryRef.id
        };
    } catch (error) {
        logger.error("Error creating category:", error);
        throw new Error(error instanceof Error ? error.message : "Error al crear categoría");
    }
});

export const updateCategory = onCall(async (request) => {
    try {
        const { categoryId, name, description, icon, color } = request.data;
        const uid = request.auth?.uid;

        if (!uid) {
            throw new Error("Usuario no autenticado");
        }

        // Verificar que el usuario sea admin
        const userDoc = await db.collection("users").doc(uid).get();
        const userData = userDoc.data();
        if (!userData || userData.role !== "admin") {
            throw new Error("No tienes permisos para actualizar categorías");
        }

        if (!categoryId) {
            throw new Error("ID de la categoría requerido");
        }

        // Verificar que la categoría existe
        const categoryDoc = await db.collection("category").doc(categoryId).get();
        if (!categoryDoc.exists) {
            throw new Error("Categoría no encontrada");
        }

        const updateData: any = {
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        if (name !== undefined) {
            // Verificar que no exista otra categoría con el mismo nombre
            const existingCategory = await db.collection("category")
                .where("name", "==", name.trim())
                .get();

            const isDuplicate = existingCategory.docs.some(doc => doc.id !== categoryId);
            if (isDuplicate) {
                throw new Error("Ya existe una categoría con este nombre");
            }

            updateData.name = name.trim();
        }

        if (description !== undefined) updateData.description = description;
        if (icon !== undefined) updateData.icon = icon;
        if (color !== undefined) updateData.color = color;

        await db.collection("category").doc(categoryId).update(updateData);

        return {
            success: true,
            message: "Categoría actualizada exitosamente"
        };
    } catch (error) {
        logger.error("Error updating category:", error);
        throw new Error(error instanceof Error ? error.message : "Error al actualizar categoría");
    }
});

export const deleteCategory = onCall(async (request) => {
    try {
        const { categoryId } = request.data;
        const uid = request.auth?.uid;

        if (!uid) {
            throw new Error("Usuario no autenticado");
        }

        // Verificar que el usuario sea admin
        const userDoc = await db.collection("users").doc(uid).get();
        const userData = userDoc.data();
        if (!userData || userData.role !== "admin") {
            throw new Error("No tienes permisos para eliminar categorías");
        }

        if (!categoryId) {
            throw new Error("ID de la categoría requerido");
        }

        // Verificar que la categoría existe
        const categoryDoc = await db.collection("category").doc(categoryId).get();
        if (!categoryDoc.exists) {
            throw new Error("Categoría no encontrada");
        }

        // Verificar que no haya proyectos usando esta categoría
        const projectsWithCategory = await db.collection("projects")
            .where("categoryId", "==", categoryId)
            .limit(1)
            .get();

        if (!projectsWithCategory.empty) {
            throw new Error("No se puede eliminar la categoría porque hay proyectos asociados");
        }

        await db.collection("category").doc(categoryId).delete();

        return {
            success: true,
            message: "Categoría eliminada exitosamente"
        };
    } catch (error) {
        logger.error("Error deleting category:", error);
        throw new Error(error instanceof Error ? error.message : "Error al eliminar categoría");
    }
});

export const getCategoryWithProjects = onCall(async (request) => {
    try {
        const { categoryId, limit = 10 } = request.data;

        if (!categoryId) {
            throw new Error("ID de la categoría requerido");
        }

        // Obtener la categoría
        const categoryDoc = await db.collection("category").doc(categoryId).get();
        if (!categoryDoc.exists) {
            throw new Error("Categoría no encontrada");
        }

        // Obtener proyectos de la categoría
        const projectsSnapshot = await db.collection("projects")
            .where("categoryId", "==", categoryId)
            .where("status", "==", "active")
            .orderBy("createdAt", "desc")
            .limit(limit)
            .get();

        const projects = projectsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return {
            success: true,
            data: {
                category: {
                    id: categoryDoc.id,
                    ...categoryDoc.data()
                },
                projects,
                totalProjects: projects.length
            }
        };
    } catch (error) {
        logger.error("Error getting category with projects:", error);
        throw new Error("Error al obtener categoría con proyectos");
    }
});

export const getCategoryStats = onCall(async (request) => {
    try {
        const uid = request.auth?.uid;

        if (!uid) {
            throw new Error("Usuario no autenticado");
        }

        // Verificar que el usuario sea admin
        const userDoc = await db.collection("users").doc(uid).get();
        const userData = userDoc.data();
        if (!userData || userData.role !== "admin") {
            throw new Error("No tienes permisos para ver estadísticas de categorías");
        }

        const categoriesSnapshot = await db.collection("category").get();
        const categoryStats = [];

        for (const categoryDoc of categoriesSnapshot.docs) {
            const categoryData = categoryDoc.data();

            // Contar proyectos por categoría
            const activeProjectsSnapshot = await db.collection("projects")
                .where("categoryId", "==", categoryDoc.id)
                .where("status", "==", "active")
                .get();

            const allProjectsSnapshot = await db.collection("projects")
                .where("categoryId", "==", categoryDoc.id)
                .get();

            // Calcular inversión total en proyectos de la categoría
            let totalInvestment = 0;
            const projectIds = allProjectsSnapshot.docs.map(doc => doc.id);
            
            if (projectIds.length > 0) {
                // Dividir en chunks para evitar límite de Firestore
                const chunks = [];
                for (let i = 0; i < projectIds.length; i += 10) {
                    chunks.push(projectIds.slice(i, i + 10));
                }

                for (const chunk of chunks) {
                    const investmentsSnapshot = await db.collection("investments")
                        .where("projectId", "in", chunk)
                        .get();
                    
                    investmentsSnapshot.docs.forEach(doc => {
                        const investmentData = doc.data();
                        totalInvestment += investmentData.amount || 0;
                    });
                }
            }

            categoryStats.push({
                id: categoryDoc.id,
                name: categoryData.name,
                icon: categoryData.icon,
                color: categoryData.color,
                activeProjects: activeProjectsSnapshot.size,
                totalProjects: allProjectsSnapshot.size,
                totalInvestment
            });
        }

        // Ordenar por número de proyectos activos
        categoryStats.sort((a, b) => b.activeProjects - a.activeProjects);

        return {
            success: true,
            data: categoryStats
        };
    } catch (error) {
        logger.error("Error getting category stats:", error);
        throw new Error("Error al obtener estadísticas de categorías");
    }
});