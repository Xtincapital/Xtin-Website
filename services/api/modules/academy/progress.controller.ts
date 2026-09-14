// controllers/progress.controller.mjs
import { HTTP_STATUS, MESSAGES } from "../../constants/constants.js";
import { validateLessonProgress } from "./progress.validator.js";
import {
    getProgressForModules,
    upsertLessonProgress,
    getAllProgressForUser,
    getProgressForModule,
    getLessonProgress,
} from "./progress.repository.js";

// "mutual-funds" was removed from this list: its lesson content was deleted
// as retired (see features/academy/pages/mutualfunds/ removal), which would
// otherwise make this certificate permanently unearnable -- no one could ever
// complete a module with no reachable lessons.
const CERTIFICATE_MODULES = [
    { module_slug: "personal-finance", total_lessons: 9 },
    { module_slug: "stock-market", total_lessons: 7 },
];

const buildLearnCompletionSummary = async (userId) => {
    const certificateModuleSlugs = CERTIFICATE_MODULES.map((module) => module.module_slug);

    const { data, error } = await getProgressForModules(userId, certificateModuleSlugs);

    if (error) {
        throw error;
    }

    const progressMap = new Map();
    for (const item of data) {
        if (!progressMap.has(item.module_slug)) {
            progressMap.set(item.module_slug, []);
        }
        progressMap.get(item.module_slug).push(item);
    }

    const moduleDetails = CERTIFICATE_MODULES.map((module) => {
        const completedLessons = progressMap.get(module.module_slug) || [];
        const completedCount = completedLessons.length;
        const isCompleted = completedCount >= module.total_lessons;

        return {
            module_slug: module.module_slug,
            total_lessons: module.total_lessons,
            completed_lessons_count: completedCount,
            pending_lessons_count: Math.max(module.total_lessons - completedCount, 0),
            completion_percentage: Math.min(Math.round((completedCount / module.total_lessons) * 100), 100),
            is_completed: isCompleted,
            completed_lessons: completedLessons,
            last_completed_at: completedLessons[0]?.completed_at || null,
        };
    });

    const completedModulesCount = moduleDetails.filter((module) => module.is_completed).length;
    const isCertificateEligible = completedModulesCount === CERTIFICATE_MODULES.length;

    return {
        required_modules_count: CERTIFICATE_MODULES.length,
        completed_modules_count: completedModulesCount,
        modules: moduleDetails,
        certificate: {
            eligible: isCertificateEligible,
            awarded: isCertificateEligible,
            awarded_at: isCertificateEligible
                ? moduleDetails
                    .map((module) => module.last_completed_at)
                    .filter(Boolean)
                    .sort()
                    .slice(-1)[0] || new Date().toISOString()
                : null,
        },
    };
};

// Mark a lesson as completed
const markLessonCompleted = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const validation = validateLessonProgress(req.body);
        if (validation.errors) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                errors: validation.errors,
                message: validation.message,
            });
        }

        if (!userId) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                status: HTTP_STATUS.UNAUTHORIZED,
                message: "User not authenticated",
            });
        }

        const { module_slug, lesson_slug } = validation.data;

        // Upsert the progress record
        const { data, error } = await upsertLessonProgress(userId, module_slug, lesson_slug);

        if (error) {
            console.error('Error marking lesson completed:', error);
            return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
                message: "Failed to mark lesson as completed",
            });
        }

        let learnSummary = null;
        if (CERTIFICATE_MODULES.some((module) => module.module_slug === module_slug)) {
            try {
                learnSummary = await buildLearnCompletionSummary(userId);
            } catch (summaryError) {
                console.error("Error evaluating certificate eligibility:", summaryError);
            }
        }

        res.status(HTTP_STATUS.OK).json({
            status: HTTP_STATUS.OK,
            message: "Lesson marked as completed",
            data: {
                ...data[0],
                certificate: learnSummary?.certificate || null,
                learn_summary: learnSummary,
            },
        });
    } catch (error) {
        console.error('Mark lesson completed error:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
            message: MESSAGES.SERVER_ERROR,
        });
    }
};

// Get user's progress for all modules
const getUserProgress = async (req, res) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                status: HTTP_STATUS.UNAUTHORIZED,
                message: "User not authenticated",
            });
        }

        // Get all completed lessons grouped by module
        const { data, error } = await getAllProgressForUser(userId);

        if (error) {
            console.error('Error fetching user progress:', error);
            return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
                message: "Failed to fetch user progress",
            });
        }

        // Group by module
        const progressByModule = data.reduce((acc, item) => {
            if (!acc[item.module_slug]) {
                acc[item.module_slug] = [];
            }
            acc[item.module_slug].push({
                lesson_slug: item.lesson_slug,
                completed_at: item.completed_at,
            });
            return acc;
        }, {});

        res.status(HTTP_STATUS.OK).json({
            status: HTTP_STATUS.OK,
            message: "User progress retrieved successfully",
            data: progressByModule,
        });
    } catch (error) {
        console.error('Get user progress error:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
            message: MESSAGES.SERVER_ERROR,
        });
    }
};

// Get progress for a specific module
const getModuleProgress = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { module_slug } = req.params;

        if (!userId) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                status: HTTP_STATUS.UNAUTHORIZED,
                message: "User not authenticated",
            });
        }

        if (!module_slug) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                status: HTTP_STATUS.BAD_REQUEST,
                message: "Module slug is required",
            });
        }

        const { data, error } = await getProgressForModule(userId, module_slug);

        if (error) {
            console.error('Error fetching module progress:', error);
            return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
                message: "Failed to fetch module progress",
            });
        }

        res.status(HTTP_STATUS.OK).json({
            status: HTTP_STATUS.OK,
            message: "Module progress retrieved successfully",
            data: {
                module_slug,
                completed_lessons: data,
                completed_count: data.length,
            },
        });
    } catch (error) {
        console.error('Get module progress error:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
            message: MESSAGES.SERVER_ERROR,
        });
    }
};

// Check if a specific lesson is completed
const checkLessonCompleted = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { module_slug, lesson_slug } = req.params;

        if (!userId) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                status: HTTP_STATUS.UNAUTHORIZED,
                message: "User not authenticated",
            });
        }

        if (!module_slug || !lesson_slug) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                status: HTTP_STATUS.BAD_REQUEST,
                message: "Module slug and lesson slug are required",
            });
        }

        const { data, error } = await getLessonProgress(userId, module_slug, lesson_slug);

        if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
            console.error('Error checking lesson completion:', error);
            return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
                message: "Failed to check lesson completion",
            });
        }

        const isCompleted = !!data;

        res.status(HTTP_STATUS.OK).json({
            status: HTTP_STATUS.OK,
            message: "Lesson completion status retrieved",
            data: {
                module_slug,
                lesson_slug,
                is_completed: isCompleted,
                completed_at: data?.completed_at || null,
            },
        });
    } catch (error) {
        console.error('Check lesson completed error:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
            message: MESSAGES.SERVER_ERROR,
        });
    }
};

// Get detailed completion summary for learn modules and certificate eligibility
const getLearnCompletionSummary = async (req, res) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                status: HTTP_STATUS.UNAUTHORIZED,
                message: "User not authenticated",
            });
        }

        const summary = await buildLearnCompletionSummary(userId);

        res.status(HTTP_STATUS.OK).json({
            status: HTTP_STATUS.OK,
            message: "Learn completion summary retrieved successfully",
            data: summary,
        });
    } catch (error) {
        console.error("Get learn completion summary error:", error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
            message: MESSAGES.SERVER_ERROR,
        });
    }
};

export {
    markLessonCompleted,
    getUserProgress,
    getModuleProgress,
    checkLessonCompleted,
    getLearnCompletionSummary,
};