"use server";

import { revalidatePath } from "next/cache";
import { 
    collection, 
    addDoc, 
    Timestamp 
} from 'firebase/firestore';
import { 
    ref, 
    uploadBytes,
    getDownloadURL 
} from 'firebase/storage';
import { db, storage } from '@/firebase';

type FormState = {
    isLoading: boolean;
    selectedImages: Array<{file: File; preview: string}>;
    showSplash: boolean;
    formData: {
      categoryId: string;
      projectObj: string;
      projectDescription: string;
      contributors: string;
      moneyGoal: string;
      moneyReached: string;
      minInvestmentAmount: string;
      ubication: string;
    }
}

type ServerActionResponse = {
    error: boolean;
    message?: string;
    projectId?: string;
}

function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function uploadImages(images: Array<{file: File; preview: string}>) {
    try {
        const uploadPromises = images.map(async (image) => {
            // Crear una referencia única para cada imagen
            const fileName = `${Date.now()}-${image.file.name}`;
            const storageRef = ref(storage, `projects/${fileName}`);
            
            // Convertir el archivo a un Blob si es necesario
            const response = await fetch(image.preview);
            const blob = await response.blob();
            
            // Subir la imagen
            const snapshot = await uploadBytes(storageRef, blob);
            
            // Obtener la URL de descarga
            const downloadURL = await getDownloadURL(snapshot.ref);
            
            return downloadURL;
        });

        return await Promise.all(uploadPromises);
    } catch (error) {
        console.error("Error uploading images:", error);
        throw new Error("Error al subir las imágenes");
    }
}

interface ValidationError {
    field: string;
    message: string;
}

function validateFormData(formData: FormData): true | ValidationError {
    // Validar campos requeridos y su longitud mínima
    const requiredFields = [
        { field: 'categoryId', minLength: 1, message: 'La categoría es requerida' },
        { field: 'projectObj', minLength: 10, message: 'El objetivo del proyecto debe tener al menos 10 caracteres' },
        { field: 'projectDescription', minLength: 50, message: 'La descripción debe tener al menos 50 caracteres' },
        { field: 'moneyGoal', minLength: 1, message: 'La meta de dinero es requerida' },
        { field: 'minInvestmentAmount', minLength: 1, message: 'El monto mínimo de inversión es requerido' },
        { field: 'ubication', minLength: 3, message: 'La ubicación debe tener al menos 3 caracteres' }
    ];

    for (const { field, minLength, message } of requiredFields) {
        const value = formData.get(field);
        if (!value || typeof value !== 'string') {
            throw new Error(`El campo ${field} es requerido`);
        }
        
        const trimmedValue = value.trim();
        if (trimmedValue.length < minLength) {
            throw new Error(message);
        }
    }

    // Validar campos numéricos y sus rangos
    const numericFields = [
        { field: 'moneyGoal', min: 100, message: 'La meta de dinero debe ser al menos 100' },
        { field: 'moneyReached', min: 0, message: 'El dinero recaudado no puede ser negativo' },
        { field: 'minInvestmentAmount', min: 1, message: 'La inversión mínima debe ser al menos 1' }
    ];

    for (const { field, min, message } of numericFields) {
        const value = formData.get(field);
        if (value) {
            const numValue = Number(value);
            if (isNaN(numValue)) {
                throw new Error(`El campo ${field} debe ser un número válido`);
            }
            if (numValue < min) {
                throw new Error(message);
            }
        }
    }

    // Validar que el minInvestmentAmount no sea mayor que el moneyGoal
    const moneyGoal = Number(formData.get('moneyGoal'));
    const minInvestment = Number(formData.get('minInvestmentAmount'));
    if (minInvestment > moneyGoal) {
        throw new Error('El monto mínimo de inversión no puede ser mayor que la meta de dinero');
    }

    return true;
}

export async function createProject(
    previousState: unknown, 
    formData: FormData
): Promise<ServerActionResponse> {
    try {
        // Add artificial delay for UX
        await delay(1000);

        // Validate form data
        validateFormData(formData);

        // Extract form data
        const projectData = {
            categoryId: formData.get('categoryId') as string,
            projectObj: formData.get('projectObj') as string,
            projectDescription: formData.get('projectDescription') as string,
            contributors: formData.get('contributors') as string || '0',
            moneyGoal: Number(formData.get('moneyGoal')),
            moneyReached: Number(formData.get('moneyReached')) || 0,
            minInvestmentAmount: Number(formData.get('minInvestmentAmount')),
            ubication: formData.get('ubication') as string,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            status: 'active',
            // Aquí puedes agregar el userId si lo tienes disponible
            // userId: session?.user?.id,
        };

        // Get selected images from form data
        const selectedImagesJson = formData.get('selectedImages');
        const selectedImages = selectedImagesJson 
            ? JSON.parse(selectedImagesJson as string) 
            : [];

        // Upload images if any
        let imageUrls: string[] = [];
        if (selectedImages.length > 0) {
            imageUrls = await uploadImages(selectedImages);
        }

        // Create project in Firestore
        const projectsRef = collection(db, 'projects');
        const docRef = await addDoc(projectsRef, {
            ...projectData,
            images: imageUrls,
        });

        // Revalidate the projects page
        revalidatePath('/projects');

        // Return success with project ID
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