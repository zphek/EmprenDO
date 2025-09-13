import { getFunctions, httpsCallable } from "firebase/functions";
import app from "@/firebase";

const functions = getFunctions(app);

// ============================================================================
// USER FUNCTIONS
// ============================================================================

export const createUserFunction = httpsCallable(functions, "createUser");
export const updateUserFunction = httpsCallable(functions, "updateUser");
export const getUserProfileFunction = httpsCallable(functions, "getUserProfile");

// ============================================================================
// PROJECT FUNCTIONS
// ============================================================================

export const createProjectFunction = httpsCallable(functions, "createProject");
export const getProjectsFunction = httpsCallable(functions, "getProjects");
export const getProjectFunction = httpsCallable(functions, "getProject");
export const updateProjectFunction = httpsCallable(functions, "updateProject");

// ============================================================================
// FAVORITES FUNCTIONS
// ============================================================================

export const toggleFavoriteProjectFunction = httpsCallable(functions, "toggleFavoriteProject");
export const getUserFavoritesFunction = httpsCallable(functions, "getUserFavorites");

// ============================================================================
// MENTORSHIP FUNCTIONS
// ============================================================================

export const getMentorsFunction = httpsCallable(functions, "getMentors");
export const requestMentorshipFunction = httpsCallable(functions, "requestMentorship");

// ============================================================================
// REVIEWS FUNCTIONS
// ============================================================================

export const createReviewFunction = httpsCallable(functions, "createReview");
export const getProjectReviewsFunction = httpsCallable(functions, "getProjectReviews");

// ============================================================================
// TESTIMONIALS FUNCTIONS
// ============================================================================

export const createTestimonialFunction = httpsCallable(functions, "createTestimonial");
export const getTestimonialsFunction = httpsCallable(functions, "getTestimonials");

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export const callFunction = async (functionName: any, data?: any) => {
    try {
        const result = await functionName(data);
        return result.data;
    } catch (error: any) {
        console.error(`Error calling function:`, error);
        throw new Error(error.message || "Error en la función");
    }
};