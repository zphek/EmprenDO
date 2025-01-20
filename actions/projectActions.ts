"use server";

import { revalidatePath } from "next/cache";
import { 
    collection, 
    addDoc, 
    Timestamp,
    query,
    where,
    getDocs,
    doc,
    getDoc
} from 'firebase/firestore';
import { 
    ref, 
    uploadBytes,
    getDownloadURL 
} from 'firebase/storage';
import { db, storage } from '@/firebase';
import getSession from "./verifySession";

interface ProjectData {
    categoryId: string;
    projectObj: string;
    projectDescription: string;
    founder: string;
    founderDescription: string;
    objective: string;
    mission: string;
    vision: string;
    contributors: string;
    moneyGoal: number;
    moneyReached: number;
    minInvestmentAmount: number;
    ubication: string;
    images: string[];
    createdAt: any;
    updatedAt: any;
    status: string;
}

interface ServerActionResponse {
    error: boolean;
    message?: string;
    projectId?: string;
}

interface ValidationError {
    field: string;
    message: string;
}

interface ValidationResult {
    isValid: boolean;
    field?: string;
    message?: string;
}

function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function checkProjectExists(projectName: string): Promise<boolean> {
    try {
        const projectsRef = collection(db, 'projects');
        const q = query(projectsRef, where("projectObj", "==", projectName.trim()));
        const querySnapshot = await getDocs(q);
        return !querySnapshot.empty;
    } catch (error) {
        console.error("Error checking project existence:", error);
        throw new Error("Error al verificar el nombre del proyecto");
    }
}

async function uploadImages(images: any[]): Promise<string[]> {
    if (!images || !Array.isArray(images) || images.length === 0) {
        return [];
    }

    try {
        const uploadPromises = images.map(async (imageData) => {
            if (!imageData || !imageData.preview) {
                return null;
            }

            try {
                // Crear un nombre único para el archivo
                const timestamp = Date.now();
                const randomString = Math.random().toString(36).substring(7);
                const fileName = `${timestamp}-${randomString}`;
                const storageRef = ref(storage, `projects/${fileName}`);

                // Convertir base64/dataURL a blob
                const response = await fetch(imageData.preview);
                const blob = await response.blob();

                // Subir el blob a Firebase Storage
                const snapshot = await uploadBytes(storageRef, blob);
                
                // Obtener la URL de descarga
                const downloadURL = await getDownloadURL(snapshot.ref);
                return downloadURL;
            } catch (error) {
                console.error("Error processing individual image:", error);
                return null;
            }
        });

        const results = await Promise.all(uploadPromises);
        return results.filter((url): url is string => url !== null);
    } catch (error) {
        console.error("Error in uploadImages:", error);
        throw new Error("Error al subir las imágenes");
    }
}

function validateFormData(formData: FormData): ValidationResult {
    const requiredFields = [
        { field: 'categoryId', minLength: 1, message: 'La categoría es requerida' },
        { field: 'projectObj', minLength: 5, message: 'El nombre del proyecto debe tener al menos 5 caracteres' },
        { field: 'projectDescription', minLength: 50, message: 'La descripción debe tener al menos 50 caracteres' },
        { field: 'founder', minLength: 3, message: 'El nombre del fundador es requerido' },
        { field: 'founderDescription', minLength: 50, message: 'La descripción del fundador es requerida' },
        { field: 'objective', minLength: 30, message: 'El objetivo debe tener al menos 30 caracteres' },
        { field: 'mission', minLength: 30, message: 'La misión debe tener al menos 30 caracteres' },
        { field: 'vision', minLength: 30, message: 'La visión debe tener al menos 30 caracteres' },
        { field: 'moneyGoal', minLength: 1, message: 'La meta de dinero es requerida' },
        { field: 'minInvestmentAmount', minLength: 1, message: 'El monto mínimo de inversión es requerido' },
        { field: 'ubication', minLength: 3, message: 'La ubicación debe tener al menos 3 caracteres' }
    ];

    for (const { field, minLength, message } of requiredFields) {
        const value = formData.get(field);
        if (!value || typeof value !== 'string') {
            return {
                isValid: false,
                field,
                message: `El campo ${field} es requerido`
            };
        }
        
        const trimmedValue = value.trim();
        if (trimmedValue.length < minLength) {
            return {
                isValid: false,
                field,
                message
            };
        }
    }

    // Validar campos numéricos
    const numericFields = [
        { field: 'moneyGoal', min: 100, message: 'La meta de dinero debe ser al menos 100' },
        { field: 'minInvestmentAmount', min: 1, message: 'La inversión mínima debe ser al menos 1' }
    ];

    for (const { field, min, message } of numericFields) {
        const value = Number(formData.get(field));
        if (isNaN(value) || value < min) {
            return {
                isValid: false,
                field,
                message
            };
        }
    }

    // Validar que la inversión mínima no sea mayor que la meta
    const moneyGoal = Number(formData.get('moneyGoal'));
    const minInvestment = Number(formData.get('minInvestmentAmount'));
    if (minInvestment > moneyGoal) {
        return {
            isValid: false,
            field: 'minInvestmentAmount',
            message: 'La inversión mínima no puede ser mayor que la meta'
        };
    }

    return { isValid: true };
}

export async function createProject(formData: FormData): Promise<ServerActionResponse> {
    try {
        await delay(1000);

        const projectName = (formData.get('projectObj') as string).trim();
        
        const projectExists = await checkProjectExists(projectName);
        if (projectExists) {
            return {
                error: true,
                message: "projectObj:Ya existe un proyecto con este nombre"
            };
        }

        const validation = validateFormData(formData);
        if (!validation.isValid) {
            return {
                error: true,
                message: `${validation.field}:${validation.message}`
            };
        }

        // Preparar los datos base del proyecto
        const projectData: ProjectData = {
            categoryId: formData.get('categoryId') as string,
            projectObj: projectName,
            projectDescription: (formData.get('projectDescription') as string).trim(),
            founder: (formData.get('founder') as string).trim(),
            founderDescription: (formData.get('founderDescription') as string).trim(),
            objective: (formData.get('objective') as string).trim(),
            mission: (formData.get('mission') as string).trim(),
            vision: (formData.get('vision') as string).trim(),
            contributors: '0',
            moneyGoal: Number(formData.get('moneyGoal')),
            moneyReached: 0,
            minInvestmentAmount: Number(formData.get('minInvestmentAmount')),
            ubication: (formData.get('ubication') as string).trim(),
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            status: 'active',
            images: []
        };

        // Procesar las imágenes
        let selectedImages;
        try {
            const selectedImagesJson = formData.get('selectedImages');
            selectedImages = selectedImagesJson ? JSON.parse(selectedImagesJson as string) : [];
        } catch (error) {
            console.error("Error parsing selectedImages:", error);
            return {
                error: true,
                message: "Error al procesar las imágenes seleccionadas"
            };
        }

        // Subir imágenes directamente en createProject
        if (selectedImages && selectedImages.length > 0) {
            const imageUrls = await Promise.all(
                selectedImages.map(async (imageData: any) => {
                    if (!imageData || !imageData.preview) {
                        return null;
                    }

                    try {
                        // Crear nombre único para el archivo
                        const timestamp = Date.now();
                        const randomString = Math.random().toString(36).substring(7);
                        const fileName = `${timestamp}-${randomString}`;
                        const storageRef = ref(storage, `projects/${fileName}`);

                        // Convertir base64/dataURL a blob
                        const response = await fetch(imageData.preview);
                        const blob = await response.blob();

                        // Subir el blob a Firebase Storage
                        const snapshot = await uploadBytes(storageRef, blob);
                        
                        // Obtener URL de descarga
                        const downloadURL = await getDownloadURL(snapshot.ref);
                        return downloadURL;
                    } catch (error) {
                        console.error("Error uploading image:", error);
                        return null;
                    }
                })
            );

            // Filtrar URLs nulas y asignar al projectData
            projectData.images = imageUrls.filter((url): url is string => url !== null);
        }

        // Crear el documento del proyecto con todas las URLs de imágenes
        const projectsRef = collection(db, 'projects');
        const docRef = await addDoc(projectsRef, projectData);

        revalidatePath('/projects');

        return {
            error: false,
            message: "Proyecto creado exitosamente",
            projectId: docRef.id
        };

    } catch (error) {
        console.error("Error al crear el proyecto:", error);
        return {
            error: true,
            message: error instanceof Error 
                ? error.message 
                : "Error al crear el proyecto"
        };
    }
}

export async function imProjectOwner(projectId: string) {
    try {
        // Obtener la sesión del usuario actual
        const session = await getSession();
        // @ts-ignore - Ignoramos el error de TypeScript por ahora
        const userId = session?.user?.user_id;

        if (!userId) {
            return false;
        }

        // Obtener el documento del proyecto
        const projectRef = doc(db, "projects", projectId);
        const projectSnap = await getDoc(projectRef);

        if (!projectSnap.exists()) {
            return false;
        }

        const projectData = projectSnap.data();

        // Verificar si el userId coincide con el del proyecto
        return projectData.userId === userId;

    } catch (error) {
        console.error('Error verificando propietario del proyecto:', error);
        return false;
    }
}