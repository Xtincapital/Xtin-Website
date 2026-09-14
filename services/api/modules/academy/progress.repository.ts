import supabase from "../../supabase/index.js";

const getProgressForModules = (userId, moduleSlugs) =>
	supabase
		.from("user_lesson_progress")
		.select("module_slug, lesson_slug, completed_at")
		.eq("user_id", userId)
		.in("module_slug", moduleSlugs)
		.order("completed_at", { ascending: false });

const upsertLessonProgress = (userId, moduleSlug, lessonSlug) =>
	supabase
		.from("user_lesson_progress")
		.upsert({
			user_id: userId,
			module_slug: moduleSlug,
			lesson_slug: lessonSlug,
			completed_at: new Date().toISOString(),
		}, {
			onConflict: "user_id,module_slug,lesson_slug",
		})
		.select();

const getAllProgressForUser = (userId) =>
	supabase
		.from("user_lesson_progress")
		.select("module_slug, lesson_slug, completed_at")
		.eq("user_id", userId)
		.order("completed_at", { ascending: false });

const getProgressForModule = (userId, moduleSlug) =>
	supabase
		.from("user_lesson_progress")
		.select("lesson_slug, completed_at")
		.eq("user_id", userId)
		.eq("module_slug", moduleSlug)
		.order("completed_at", { ascending: false });

const getLessonProgress = (userId, moduleSlug, lessonSlug) =>
	supabase
		.from("user_lesson_progress")
		.select("completed_at")
		.eq("user_id", userId)
		.eq("module_slug", moduleSlug)
		.eq("lesson_slug", lessonSlug)
		.single();

export {
	getProgressForModules,
	upsertLessonProgress,
	getAllProgressForUser,
	getProgressForModule,
	getLessonProgress,
};
