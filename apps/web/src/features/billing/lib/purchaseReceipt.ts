// Every checkout calls showPurchaseReceipt(orderId) once its payment is
// verified; <PurchaseReceiptHost /> (mounted once in App.tsx) listens and
// plays the receipt-printer animation for that order.
//
// The open receipt is also remembered for this tab (sessionStorage), because
// some flows reload the page right after a purchase (e.g. Learn's lock
// screen). After a reload the host reopens it already printed.
export const PURCHASE_RECEIPT_EVENT = "xtin:purchase-receipt";

export type PurchaseReceiptDetail = { orderId: string };

const STORAGE_KEY = "xtin:open-receipt";
const RESUME_WINDOW_MS = 10 * 60 * 1000;

export function showPurchaseReceipt(orderId: string | undefined | null) {
  if (!orderId || typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ orderId, at: Date.now() }));
  } catch {
    // Private mode / storage blocked — the animation still plays, it just won't survive a reload.
  }
  window.dispatchEvent(new CustomEvent<PurchaseReceiptDetail>(PURCHASE_RECEIPT_EVENT, { detail: { orderId } }));
}

/** The receipt left open before a reload, if any (recent ones only). */
export function takeOpenReceipt(): string | null {
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "null");
    if (saved?.orderId && Date.now() - Number(saved.at) < RESUME_WINDOW_MS) return String(saved.orderId);
  } catch {
    // ignore
  }
  return null;
}

export function forgetOpenReceipt() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
