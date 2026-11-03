// A small trial before sync is opened to everyone. With BROKER_SYNC_PILOT_EMAILS
// set (a comma-separated list), only those customers, and admins, can link a
// broker account or sync by hand; everyone else is told it is being tried with a
// small group first. Leave it empty to open sync to every Journal Pro customer.
//
// It only decides who may START using sync. A customer already linked keeps being
// read by the daily run if they are later taken off the list, so a trial that
// changes doesn't cut off someone in the middle of it.
import { adminEmails } from "../../../middlewares/auth.js";

/** The trial list, or null when there isn't one (sync is open to every Pro customer). */
export function pilotList(env: NodeJS.ProcessEnv = process.env): string[] | null {
    const list = (env.BROKER_SYNC_PILOT_EMAILS ?? "")
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);
    return list.length ? [...new Set(list)] : null;
}

/** Whether this account may start using broker sync under the current trial settings. */
export function pilotAllows(email: string | null | undefined, env: NodeJS.ProcessEnv = process.env): boolean {
    const list = pilotList(env);
    if (!list) return true;
    const who = (email ?? "").trim().toLowerCase();
    return !!who && (list.includes(who) || adminEmails().includes(who));
}
