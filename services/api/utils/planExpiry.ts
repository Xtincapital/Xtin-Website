// Renewals stack: buying again while a plan is still running adds the new
// period on top of the days left, instead of restarting from today.
//
// Retries are safe: if the stored row already came from this same payment
// (a webhook/verify retry after a partial failure), its expiry is returned
// unchanged so the same payment can never add days twice.

const DAY_MS = 24 * 60 * 60 * 1000;

export const addDays = (days: number) => (from: Date) => new Date(from.getTime() + days * DAY_MS);

/** Calendar month / year, as the dashboard bundles have always been granted. */
export const addCycle = (cycle: "monthly" | "annual" | string) => (from: Date) => {
    const d = new Date(from);
    if (cycle === "annual") d.setFullYear(d.getFullYear() + 1);
    else d.setMonth(d.getMonth() + 1);
    return d;
};

export function stackValidUntil({
    existingValidUntil,
    existingPaymentId,
    paymentId,
    extend,
    now = new Date(),
}: {
    existingValidUntil?: string | Date | null;
    existingPaymentId?: string | null;
    paymentId: string;
    extend: (from: Date) => Date;
    now?: Date;
}): Date {
    const existing = existingValidUntil ? new Date(existingValidUntil) : null;
    if (existing && !Number.isNaN(existing.getTime())) {
        if (existingPaymentId && existingPaymentId === paymentId) return existing;
        if (existing.getTime() > now.getTime()) return extend(existing);
    }
    return extend(now);
}
