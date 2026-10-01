import supabase from "../../supabase/index.js";

const insertApplication = (row: Record<string, unknown>) => supabase.from("algo_publisher_applications").insert(row).select();

const getApplicationsByUser = (userId: string) =>
    supabase.from("algo_publisher_applications").select("*").eq("user_id", userId).order("created_at", { ascending: false });

const getAllApplications = (status?: string) => {
    const q = supabase.from("algo_publisher_applications").select("*").order("created_at", { ascending: false });
    return status ? q.eq("status", status) : q;
};

const updateApplicationStatus = (id: string, updateData: Record<string, unknown>) =>
    supabase.from("algo_publisher_applications").update(updateData).eq("id", id).select();

export { insertApplication, getApplicationsByUser, getAllApplications, updateApplicationStatus };
