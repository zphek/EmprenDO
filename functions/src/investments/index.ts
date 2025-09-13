import { onCall } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";

const db = admin.firestore();

// ============================================================================
// INVESTMENTS/SUPPORT FUNCTIONS
// ============================================================================

export const createInvestment = onCall(async (request) => {
    try {
        const { projectId, amount, message } = request.data;
        const uid = request.auth?.uid;

        if (!uid) {
            throw new Error("Usuario no autenticado");
        }

        if (!projectId || !amount) {
            throw new Error("ID del proyecto y monto son requeridos");
        }

        if (amount <= 0) {
            throw new Error("El monto debe ser mayor a 0");
        }

        // Verificar que el proyecto existe y está activo
        const projectDoc = await db.collection("projects").doc(projectId).get();
        if (!projectDoc.exists) {
            throw new Error("Proyecto no encontrado");
        }

        const projectData = projectDoc.data();
        if (projectData?.status !== "active") {
            throw new Error("El proyecto no está activo para recibir inversiones");
        }

        // Verificar que el usuario no es el dueño del proyecto
        if (projectData?.userId === uid) {
            throw new Error("No puedes invertir en tu propio proyecto");
        }

        // Verificar monto mínimo de inversión
        if (amount < projectData?.minInvestmentAmount) {
            throw new Error(`El monto mínimo de inversión es ${projectData.minInvestmentAmount}`);
        }

        // Verificar que no se exceda la meta del proyecto
        const currentMoney = projectData?.moneyReached || 0;
        const goalMoney = projectData?.moneyGoal || 0;
        
        if (currentMoney + amount > goalMoney) {
            const remainingAmount = goalMoney - currentMoney;
            throw new Error(`Solo se pueden invertir ${remainingAmount} más para completar la meta`);
        }

        // Crear la inversión
        const investmentData = {
            userId: uid,
            projectId: projectId,
            amount: Number(amount),
            message: message || "",
            status: "completed", // En producción esto sería "pending" hasta confirmar pago
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };

        const investmentRef = await db.collection("investments").add(investmentData);

        // Actualizar el proyecto con el nuevo monto
        const newMoneyReached = currentMoney + amount;
        const newContributors = parseInt(projectData?.contributors || "0") + 1;

        await db.collection("projects").doc(projectId).update({
            moneyReached: newMoneyReached,
            contributors: newContributors.toString(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        return {
            success: true,
            message: "Inversión realizada exitosamente",
            investmentId: investmentRef.id,
            newTotal: newMoneyReached
        };
    } catch (error) {
        logger.error("Error creating investment:", error);
        throw new Error(error instanceof Error ? error.message : "Error al crear inversión");
    }
});

export const getUserInvestments = onCall(async (request) => {
    try {
        const { userId, limit = 10 } = request.data;
        const uid = request.auth?.uid;

        if (!uid) {
            throw new Error("Usuario no autenticado");
        }

        const targetUserId = userId || uid;

        // Verificar permisos
        if (targetUserId !== uid) {
            const userDoc = await db.collection("users").doc(uid).get();
            const userData = userDoc.data();
            if (!userData || userData.role !== "admin") {
                throw new Error("No tienes permisos para ver las inversiones de otros usuarios");
            }
        }

        const investmentsSnapshot = await db.collection("investments")
            .where("userId", "==", targetUserId)
            .orderBy("createdAt", "desc")
            .limit(limit)
            .get();

        const investments = [];
        for (const investmentDoc of investmentsSnapshot.docs) {
            const investmentData = investmentDoc.data();
            
            // Obtener datos del proyecto
            const projectDoc = await db.collection("projects").doc(investmentData.projectId).get();
            const projectData = projectDoc.exists ? projectDoc.data() : null;

            investments.push({
                id: investmentDoc.id,
                ...investmentData,
                project: projectData ? {
                    id: projectDoc.id,
                    projectObj: projectData.projectObj,
                    founder: projectData.founder,
                    images: projectData.images || []
                } : null
            });
        }

        return {
            success: true,
            data: investments
        };
    } catch (error) {
        logger.error("Error getting user investments:", error);
        throw new Error("Error al obtener inversiones del usuario");
    }
});

export const getProjectInvestments = onCall(async (request) => {
    try {
        const { projectId, limit = 10 } = request.data;
        const uid = request.auth?.uid;

        if (!uid) {
            throw new Error("Usuario no autenticado");
        }

        if (!projectId) {
            throw new Error("ID del proyecto requerido");
        }

        // Verificar que el usuario es el dueño del proyecto o admin
        const projectDoc = await db.collection("projects").doc(projectId).get();
        if (!projectDoc.exists) {
            throw new Error("Proyecto no encontrado");
        }

        const projectData = projectDoc.data();
        if (projectData?.userId !== uid) {
            const userDoc = await db.collection("users").doc(uid).get();
            const userData = userDoc.data();
            if (!userData || userData.role !== "admin") {
                throw new Error("No tienes permisos para ver las inversiones de este proyecto");
            }
        }

        const investmentsSnapshot = await db.collection("investments")
            .where("projectId", "==", projectId)
            .orderBy("createdAt", "desc")
            .limit(limit)
            .get();

        const investments = [];
        for (const investmentDoc of investmentsSnapshot.docs) {
            const investmentData = investmentDoc.data();
            
            // Obtener datos del usuario (solo para el dueño del proyecto)
            const userDoc = await db.collection("users").doc(investmentData.userId).get();
            const userData = userDoc.exists ? userDoc.data() : null;

            investments.push({
                id: investmentDoc.id,
                ...investmentData,
                user: userData ? {
                    name: userData.name,
                    email: userData.email
                } : null
            });
        }

        return {
            success: true,
            data: investments
        };
    } catch (error) {
        logger.error("Error getting project investments:", error);
        throw new Error("Error al obtener inversiones del proyecto");
    }
});

export const getInvestmentStats = onCall(async (request) => {
    try {
        const { projectId, userId } = request.data;
        const uid = request.auth?.uid;

        if (!uid) {
            throw new Error("Usuario no autenticado");
        }

        let query = db.collection("investments") as any;

        if (projectId) {
            // Verificar permisos para el proyecto
            const projectDoc = await db.collection("projects").doc(projectId).get();
            if (!projectDoc.exists) {
                throw new Error("Proyecto no encontrado");
            }

            const projectData = projectDoc.data();
            if (projectData?.userId !== uid) {
                const userDoc = await db.collection("users").doc(uid).get();
                const userData = userDoc.data();
                if (!userData || userData.role !== "admin") {
                    throw new Error("No tienes permisos para ver estadísticas de este proyecto");
                }
            }

            query = query.where("projectId", "==", projectId);
        } else if (userId) {
            const targetUserId = userId || uid;
            
            // Verificar permisos
            if (targetUserId !== uid) {
                const userDoc = await db.collection("users").doc(uid).get();
                const userData = userDoc.data();
                if (!userData || userData.role !== "admin") {
                    throw new Error("No tienes permisos para ver estadísticas de otros usuarios");
                }
            }

            query = query.where("userId", "==", targetUserId);
        } else {
            // Solo admins pueden ver estadísticas globales
            const userDoc = await db.collection("users").doc(uid).get();
            const userData = userDoc.data();
            if (!userData || userData.role !== "admin") {
                throw new Error("No tienes permisos para ver estadísticas globales");
            }
        }

        const investmentsSnapshot = await query.get();
        const investments = investmentsSnapshot.docs.map((doc: any) => doc.data());

        const totalInvestments = investments.length;
        const totalAmount = investments.reduce((sum, inv) => sum + (inv.amount || 0), 0);
        const averageInvestment = totalInvestments > 0 ? totalAmount / totalInvestments : 0;

        // Agrupar por mes para mostrar tendencias
        const monthlyStats: { [key: string]: { count: number; amount: number } } = {};
        investments.forEach(inv => {
            if (inv.createdAt && inv.createdAt.toDate) {
                const date = inv.createdAt.toDate();
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                
                if (!monthlyStats[monthKey]) {
                    monthlyStats[monthKey] = { count: 0, amount: 0 };
                }
                
                monthlyStats[monthKey].count++;
                monthlyStats[monthKey].amount += inv.amount || 0;
            }
        });

        return {
            success: true,
            data: {
                totalInvestments,
                totalAmount,
                averageInvestment: Math.round(averageInvestment * 100) / 100,
                monthlyStats
            }
        };
    } catch (error) {
        logger.error("Error getting investment stats:", error);
        throw new Error("Error al obtener estadísticas de inversiones");
    }
});

export const createSupportRequest = onCall(async (request) => {
    try {
        const { projectId, supportType, message, amount } = request.data;
        const uid = request.auth?.uid;

        if (!uid) {
            throw new Error("Usuario no autenticado");
        }

        if (!projectId || !supportType || !message) {
            throw new Error("Datos de soporte incompletos");
        }

        // Verificar que el proyecto existe
        const projectDoc = await db.collection("projects").doc(projectId).get();
        if (!projectDoc.exists) {
            throw new Error("Proyecto no encontrado");
        }

        const supportData = {
            userId: uid,
            projectId: projectId,
            supportType: supportType, // 'financial', 'mentorship', 'technical', 'other'
            message: message,
            amount: amount || 0,
            status: "pending",
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };

        const supportRef = await db.collection("support_requests").add(supportData);

        return {
            success: true,
            message: "Solicitud de soporte enviada exitosamente",
            supportId: supportRef.id
        };
    } catch (error) {
        logger.error("Error creating support request:", error);
        throw new Error(error instanceof Error ? error.message : "Error al crear solicitud de soporte");
    }
});