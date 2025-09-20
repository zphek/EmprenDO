import { getFunctions, httpsCallable } from "firebase/functions";
import app from "@/firebase";

const functions = getFunctions(app);

// ============================================================================
// USER FUNCTIONS
// ============================================================================

export const createUserFunction = httpsCallable(functions, "createUser");
export const updateUserFunction = httpsCallable(functions, "updateUser");
export const getUserProfileFunction = httpsCallable(functions, "getUserProfile");
export const updateUserSettingsFunction = httpsCallable(functions, "updateUserSettings");
export const completeUserRegistrationFunction = httpsCallable(functions, "completeUserRegistration");

// ============================================================================
// PROJECT FUNCTIONS
// ============================================================================

export const createProjectFunction = httpsCallable(functions, "createProject");
export const getProjectsFunction = httpsCallable(functions, "getProjects");
export const getProjectFunction = httpsCallable(functions, "getProject");
export const updateProjectFunction = httpsCallable(functions, "updateProject");
export const getFeaturedProjectsFunction = httpsCallable(functions, "getFeaturedProjects");
export const searchProjectsFunction = httpsCallable(functions, "searchProjects");
export const getProjectOwnerDashboardFunction = httpsCallable(functions, "getProjectOwnerDashboard");

// ============================================================================
// FAVORITES FUNCTIONS
// ============================================================================

export const toggleFavoriteProjectFunction = httpsCallable(functions, "toggleFavoriteProject");
export const getUserFavoritesFunction = httpsCallable(functions, "getUserFavorites");
export const checkIfProjectIsFavoriteFunction = httpsCallable(functions, "checkIfProjectIsFavorite");
export const removeFavoriteProjectFunction = httpsCallable(functions, "removeFavoriteProject");

// ============================================================================
// MENTORSHIP FUNCTIONS
// ============================================================================

export const getMentorsFunction = httpsCallable(functions, "getMentors");
export const getMentorByIdFunction = httpsCallable(functions, "getMentorById");
export const requestMentorshipFunction = httpsCallable(functions, "requestMentorship");
export const getMentorDashboardFunction = httpsCallable(functions, "getMentorDashboard");
export const updateSubscriptionStatusFunction = httpsCallable(functions, "updateSubscriptionStatus");
export const addMentorResourceFunction = httpsCallable(functions, "addMentorResource");
export const deleteMentorResourceFunction = httpsCallable(functions, "deleteMentorResource");
export const sendMentorMessageFunction = httpsCallable(functions, "sendMentorMessage");
export const getSubscriptionMessagesFunction = httpsCallable(functions, "getSubscriptionMessages");

// ============================================================================
// REVIEWS FUNCTIONS
// ============================================================================

export const createReviewFunction = httpsCallable(functions, "createReview");
export const getProjectReviewsFunction = httpsCallable(functions, "getProjectReviews");
export const getProjectRatingStatsFunction = httpsCallable(functions, "getProjectRatingStats");
export const updateReviewFunction = httpsCallable(functions, "updateReview");
export const deleteReviewFunction = httpsCallable(functions, "deleteReview");
export const getUserReviewsFunction = httpsCallable(functions, "getUserReviews");

// ============================================================================
// TESTIMONIALS FUNCTIONS
// ============================================================================

export const createTestimonialFunction = httpsCallable(functions, "createTestimonial");
export const getTestimonialsFunction = httpsCallable(functions, "getTestimonials");
export const getUserTestimonialsFunction = httpsCallable(functions, "getUserTestimonials");
export const updateTestimonialFunction = httpsCallable(functions, "updateTestimonial");
export const deleteTestimonialFunction = httpsCallable(functions, "deleteTestimonial");
export const getTestimonialStatsFunction = httpsCallable(functions, "getTestimonialStats");

// ============================================================================
// INVESTMENTS FUNCTIONS
// ============================================================================

export const createInvestmentFunction = httpsCallable(functions, "createInvestment");
export const getUserInvestmentsFunction = httpsCallable(functions, "getUserInvestments");
export const getProjectInvestmentsFunction = httpsCallable(functions, "getProjectInvestments");
export const getInvestmentStatsFunction = httpsCallable(functions, "getInvestmentStats");
export const createSupportRequestFunction = httpsCallable(functions, "createSupportRequest");

// ============================================================================
// CATEGORIES FUNCTIONS
// ============================================================================

export const getCategoriesFunction = httpsCallable(functions, "getCategories");
export const createCategoryFunction = httpsCallable(functions, "createCategory");
export const updateCategoryFunction = httpsCallable(functions, "updateCategory");
export const deleteCategoryFunction = httpsCallable(functions, "deleteCategory");
export const getCategoryWithProjectsFunction = httpsCallable(functions, "getCategoryWithProjects");
export const getCategoryStatsFunction = httpsCallable(functions, "getCategoryStats");

// ============================================================================
// LIBRARY FUNCTIONS
// ============================================================================

export const getLibraryContentFunction = httpsCallable(functions, "getLibraryContent");
export const getLibraryItemFunction = httpsCallable(functions, "getLibraryItem");
export const createLibraryContentFunction = httpsCallable(functions, "createLibraryContent");
export const updateLibraryContentFunction = httpsCallable(functions, "updateLibraryContent");
export const deleteLibraryContentFunction = httpsCallable(functions, "deleteLibraryContent");
export const likeLibraryContentFunction = httpsCallable(functions, "likeLibraryContent");
export const getLibraryCategoriesFunction = httpsCallable(functions, "getLibraryCategories");
export const searchLibraryContentFunction = httpsCallable(functions, "searchLibraryContent");
export const getUserProgressFunction = httpsCallable(functions, "getUserProgress");
export const markContentAsCompletedFunction = httpsCallable(functions, "markContentAsCompleted");

// ============================================================================
// ADMIN FUNCTIONS
// ============================================================================

export const getAllUsersFunction = httpsCallable(functions, "getAllUsers");
export const updateUserRoleFunction = httpsCallable(functions, "updateUserRole");
export const deleteUserFunction = httpsCallable(functions, "deleteUser");
export const createAdminUserFunction = httpsCallable(functions, "createAdminUser");
export const getAllProjectsFunction = httpsCallable(functions, "getAllProjects");
export const updateProjectStatusFunction = httpsCallable(functions, "updateProjectStatus");
export const deleteProjectFunction = httpsCallable(functions, "deleteProject");
export const getAllMentorsFunction = httpsCallable(functions, "getAllMentors");
export const updateMentorStatusFunction = httpsCallable(functions, "updateMentorStatus");
export const getAdminDashboardFunction = httpsCallable(functions, "getAdminDashboard");
export const moderateTestimonialFunction = httpsCallable(functions, "moderateTestimonial");
export const getPendingTestimonialsFunction = httpsCallable(functions, "getPendingTestimonials");

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export const callFunction = async (functionName: any, data?: any) => {
    try {
        const result = await functionName(data);
        return result.data;
    } catch (error: any) {
        console.error(`Error calling function:`, error);
        
        let errorMessage = "Error en la función";
        
        try {
            if (typeof error === 'string') {
                errorMessage = error;
            } else if (error && typeof error === 'object') {
                errorMessage = error.message || error.details || error.code || JSON.stringify(error);
            }
        } catch (parseError) {
            console.error('Error parsing error object:', parseError);
        }
        
        throw new Error(errorMessage);
    }
};

// Specific helper for better error handling
export const callFunctionWithErrorHandling = async (functionName: any, data?: any, customErrorMessage?: string) => {
    try {
        const result = await functionName(data);
        if (!result.data.success) {
            throw new Error(result.data.message || customErrorMessage || "Error en la operación");
        }
        return result.data;
    } catch (error: any) {
        console.error(`Error calling function:`, error);
        const errorMessage = error.message || customErrorMessage || "Error en la función";
        throw new Error(errorMessage);
    }
};

// ============================================================================
// TYPED HELPER FUNCTIONS FOR BETTER DX
// ============================================================================

interface UserData {
    name: string;
    email: string;
    cedula: string;
    role?: string;
}

interface ProjectData {
    categoryId: string;
    projectObj: string;
    projectDescription: string;
    founder: string;
    founderDescription: string;
    objective: string;
    mission: string;
    vision: string;
    moneyGoal: number;
    minInvestmentAmount: number;
    ubication: string;
    images?: string[];
}

// Typed helper functions
export const createUserWithErrorHandling = async (userData: UserData) => {
    return callFunctionWithErrorHandling(createUserFunction, userData, "Error al crear usuario");
};

export const createProjectWithErrorHandling = async (projectData: ProjectData) => {
    return callFunctionWithErrorHandling(createProjectFunction, projectData, "Error al crear proyecto");
};

export const toggleFavoriteWithErrorHandling = async (projectId: string) => {
    return callFunctionWithErrorHandling(toggleFavoriteProjectFunction, { projectId }, "Error al gestionar favoritos");
};

export const createInvestmentWithErrorHandling = async (investmentData: { projectId: string; amount: number; message?: string }) => {
    return callFunctionWithErrorHandling(createInvestmentFunction, investmentData, "Error al crear inversión");
};

export const createReviewWithErrorHandling = async (reviewData: { projectId: string; rating: number; comment?: string }) => {
    return callFunctionWithErrorHandling(createReviewFunction, reviewData, "Error al crear review");
};