import { setGlobalOptions } from "firebase-functions";
import * as admin from "firebase-admin";

// Initialize Firebase Admin
admin.initializeApp();

setGlobalOptions({ maxInstances: 10 });

// ============================================================================
// IMPORT AND EXPORT ALL FUNCTIONS
// ============================================================================

// Users Functions
export {
    createUser,
    updateUser,
    getUserProfile,
    updateUserSettings,
    completeUserRegistration
} from "./users";

// Projects Functions
export {
    createProject,
    getProjects,
    getProject,
    updateProject,
    getFeaturedProjects,
    searchProjects,
    getProjectOwnerDashboard
} from "./projects";

// Favorites Functions
export {
    toggleFavoriteProject,
    getUserFavorites,
    checkIfProjectIsFavorite,
    removeFavoriteProject
} from "./favorites";

// Mentorship Functions
export {
    getMentors,
    getMentorById,
    requestMentorship,
    getMentorDashboard,
    updateSubscriptionStatus,
    addMentorResource,
    deleteMentorResource,
    sendMentorMessage,
    getSubscriptionMessages
} from "./mentorship";

// Reviews Functions
export {
    createReview,
    getProjectReviews,
    getProjectRatingStats,
    updateReview,
    deleteReview,
    getUserReviews
} from "./reviews";

// Testimonials Functions
export {
    createTestimonial,
    getTestimonials,
    getUserTestimonials,
    updateTestimonial,
    deleteTestimonial,
    getTestimonialStats
} from "./testimonials";

// Investments Functions
export {
    createInvestment,
    getUserInvestments,
    getProjectInvestments,
    getInvestmentStats,
    createSupportRequest
} from "./investments";

// Categories Functions
export {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryWithProjects,
    getCategoryStats
} from "./categories";

// Library Functions
export {
    getLibraryContent,
    getLibraryItem,
    createLibraryContent,
    updateLibraryContent,
    deleteLibraryContent,
    likeLibraryContent,
    getLibraryCategories,
    searchLibraryContent,
    getUserProgress,
    markContentAsCompleted
} from "./library";

// Admin Functions
export {
    getAllUsers,
    updateUserRole,
    deleteUser,
    createAdminUser,
    getAllProjects,
    updateProjectStatus,
    deleteProject,
    getAllMentors,
    updateMentorStatus,
    getAdminDashboard,
    moderateTestimonial,
    getPendingTestimonials
} from "./admin";