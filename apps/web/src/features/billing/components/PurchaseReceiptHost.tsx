// Mounted once in App.tsx. Waits for showPurchaseReceipt(orderId) and plays
// the receipt-printer animation; the dialog (and framer-motion) only load the
// first time someone actually completes a purchase.
import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { forgetOpenReceipt, PURCHASE_RECEIPT_EVENT, takeOpenReceipt, type PurchaseReceiptDetail } from "../lib/purchaseReceipt";

const PurchaseReceiptDialog = lazy(() => import("./PurchaseReceiptDialog"));

export default function PurchaseReceiptHost() {
  // A receipt that was open when the page reloaded comes back already printed.
  const [open, setOpen] = useState<{ orderId: string; resumed: boolean } | null>(() => {
    const orderId = takeOpenReceipt();
    return orderId ? { orderId, resumed: true } : null;
  });

  useEffect(() => {
    const onPurchase = (e: Event) => {
      const orderId = (e as CustomEvent<PurchaseReceiptDetail>).detail?.orderId;
      if (orderId) setOpen({ orderId, resumed: false });
    };
    window.addEventListener(PURCHASE_RECEIPT_EVENT, onPurchase);
    return () => window.removeEventListener(PURCHASE_RECEIPT_EVENT, onPurchase);
  }, []);

  const close = useCallback(() => {
    forgetOpenReceipt();
    setOpen(null);
  }, []);

  if (!open) return null;
  return (
    <Suspense fallback={null}>
      <PurchaseReceiptDialog key={open.orderId} orderId={open.orderId} resumed={open.resumed} onClose={close} />
    </Suspense>
  );
}
