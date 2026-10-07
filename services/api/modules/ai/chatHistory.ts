// Saved AI chat history — a Pro perk for Gini and the Journal AI coach
// (tables: database/migrations/0017_ai_chat_history.sql).
//
//   • saveExchange() is called by each chat endpoint after a successful reply,
//     only for Pro users. It never throws: saving history must not break a chat.
//   • chatHistoryRouter(app, isPro) adds, under /api/<app>/chat/conversations:
//       GET    /            — the user's conversations, newest first (Pro only)
//       GET    /:id         — one conversation's messages (Pro only)
//       DELETE /:id         — delete it (always allowed, so people can clean up after Pro lapses)
//     Free users get `{ pro: false, conversations: [] }` rather than an error,
//     so the UI can show the upsell instead.
import { Router } from "express";
import supabase from "../../supabase/index.js";
import { authenticate } from "../../middlewares/auth.js";

export type ChatApp = "gini" | "journal";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TITLE_MAX = 80;
const LIST_LIMIT = 100;
const MESSAGE_LIMIT = 400;

export const titleFrom = (question: string) => {
    const oneLine = question.replace(/\s+/g, " ").trim();
    return oneLine.length > TITLE_MAX ? `${oneLine.slice(0, TITLE_MAX - 1).trimEnd()}…` : oneLine || "New chat";
};

async function ownConversation(app: ChatApp, userId: string, id: string) {
    if (!UUID.test(id)) return null;
    const { data, error } = await supabase.from("ai_conversations").select("id").eq("id", id).eq("user_id", userId).eq("app", app).maybeSingle();
    if (error) throw error;
    return data;
}

/**
 * Stores one question + reply. Continues `conversationId` when it is the
 * user's own conversation in this app; otherwise starts a new one titled
 * after the question. Returns the conversation id, or null if saving failed.
 */
export async function saveExchange(opts: { app: ChatApp; userId: string; conversationId?: string | null; question: string; reply: string }): Promise<string | null> {
    try {
        let id = opts.conversationId ? (await ownConversation(opts.app, opts.userId, opts.conversationId))?.id : null;
        const now = Date.now();
        if (id) {
            const { error } = await supabase.from("ai_conversations").update({ updated_at: new Date(now).toISOString() }).eq("id", id);
            if (error) throw error;
        } else {
            const { data, error } = await supabase
                .from("ai_conversations")
                .insert({ user_id: opts.userId, app: opts.app, title: titleFrom(opts.question) })
                .select("id")
                .single();
            if (error) throw error;
            id = data.id;
        }
        // Explicit timestamps keep question-before-reply order stable.
        const { error } = await supabase.from("ai_messages").insert([
            { conversation_id: id, role: "user", content: opts.question, created_at: new Date(now).toISOString() },
            { conversation_id: id, role: "assistant", content: opts.reply, created_at: new Date(now + 1).toISOString() },
        ]);
        if (error) throw error;
        return id as string;
    } catch (err) {
        console.error(`[ChatHistory] saving ${opts.app} chat failed:`, (err as Error)?.message || err);
        return null;
    }
}

export function chatHistoryRouter(app: ChatApp, isPro: (authId: string) => Promise<boolean>) {
    const router = Router();
    const base = `/${app}/chat/conversations`;

    router.get(base, authenticate, async (req: any, res) => {
        try {
            if (!(await isPro(req.user.authId))) return res.json({ pro: false, conversations: [] });
            const { data, error } = await supabase
                .from("ai_conversations")
                .select("id, title, created_at, updated_at")
                .eq("user_id", req.user.authId)
                .eq("app", app)
                .order("updated_at", { ascending: false })
                .limit(LIST_LIMIT);
            if (error) throw error;
            return res.json({ pro: true, conversations: data || [] });
        } catch (err) {
            console.error(`[ChatHistory] ${app} list failed:`, (err as Error)?.message || err);
            return res.status(500).json({ error: "Couldn't load your chats" });
        }
    });

    router.get(`${base}/:id`, authenticate, async (req: any, res) => {
        try {
            if (!(await isPro(req.user.authId))) return res.status(403).json({ error: "Saved chats are a Pro feature", code: "pro_required" });
            const convo = await ownConversation(app, req.user.authId, req.params.id);
            if (!convo) return res.status(404).json({ error: "Chat not found" });
            const { data, error } = await supabase
                .from("ai_messages")
                .select("role, content, created_at")
                .eq("conversation_id", convo.id)
                .order("created_at", { ascending: true })
                .limit(MESSAGE_LIMIT);
            if (error) throw error;
            return res.json({ id: convo.id, messages: data || [] });
        } catch (err) {
            console.error(`[ChatHistory] ${app} open failed:`, (err as Error)?.message || err);
            return res.status(500).json({ error: "Couldn't open that chat" });
        }
    });

    router.delete(`${base}/:id`, authenticate, async (req: any, res) => {
        try {
            const convo = await ownConversation(app, req.user.authId, req.params.id);
            if (!convo) return res.status(404).json({ error: "Chat not found" });
            const { error } = await supabase.from("ai_conversations").delete().eq("id", convo.id).eq("user_id", req.user.authId);
            if (error) throw error;
            return res.json({ success: true });
        } catch (err) {
            console.error(`[ChatHistory] ${app} delete failed:`, (err as Error)?.message || err);
            return res.status(500).json({ error: "Couldn't delete that chat" });
        }
    });

    return router;
}
