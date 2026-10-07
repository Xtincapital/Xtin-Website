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

// Owner edit: only while the application is still pending review (status = 'pending')
// and only the applicant's own row. Returns no rows if either condition fails.
const updateOwnPendingApplication = (id: string, userId: string, updateData: Record<string, unknown>) =>
    supabase.from("algo_publisher_applications").update(updateData).eq("id", id).eq("user_id", userId).eq("status", "pending").select();

const getApplicationById = (id: string, userId: string) =>
    supabase.from("algo_publisher_applications").select("id,status").eq("id", id).eq("user_id", userId);

// AlgoMarket: approved applications, public columns only (never the
// applicant's email or user id).
export const MARKET_COLUMNS = "id, applicant_name, algo_name, strategy_type, asset_class, expected_price, backtest_summary, description, experience, reviewed_at";
const getApprovedListings = () =>
    supabase.from("algo_publisher_applications").select(MARKET_COLUMNS).eq("status", "approved").order("reviewed_at", { ascending: false });

export { getApprovedListings, updateOwnPendingApplication, getApplicationById, insertApplication, getApplicationsByUser, getAllApplications, updateApplicationStatus };
