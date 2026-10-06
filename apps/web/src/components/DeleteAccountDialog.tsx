// Permanently deletes the signed-in account (DELETE /api/auth/account) after
// the user types DELETE. Used on the main dashboard and in Fundakamental
// Settings.
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";
import authService from "@/services/authService";
import { BACKEND_URL } from "@/config/env";
import supabase from "@/supabase";

// Browser settings worth keeping after the account is gone.
const KEEP_KEYS = new Set(["xtin-theme", "xtin_region_v1"]);

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DeleteAccountDialog({ open, onOpenChange }: Props) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const close = (next: boolean) => {
    if (deleting) return;
    if (!next) {
      setConfirm("");
      setError("");
    }
    onOpenChange(next);
  };

  const handleDelete = async () => {
    setDeleting(true);
    setError("");
    try {
      const res = await authService.makeAuthenticatedRequest(`${BACKEND_URL}/api/auth/account`, {
        method: "DELETE",
        body: JSON.stringify({ confirm: "DELETE" }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.message || "We couldn't delete your account. Please try again.");

      try {
        await supabase.auth.signOut({ scope: "local" });
      } catch {
        // the user no longer exists server-side; local cleanup below is what matters
      }
      for (const key of Object.keys(localStorage)) {
        if (!KEEP_KEYS.has(key)) localStorage.removeItem(key);
      }
      await logout();
      navigate("/?account_deleted=1", { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : "We couldn't delete your account. Please try again.");
      setDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={close}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete your account?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                This permanently deletes your Xtin Capital account and everything in it — Fundakamental reports and
                uploaded files, portfolios, watchlists, Journal trades, Gini plans, backtests, course progress, AI token
                balances and newsletter subscription.
              </p>
              <p>Any paid plan time you have left ends now. This can't be undone.</p>
              <p>
                Type <strong className="text-foreground">DELETE</strong> to confirm.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <input
          aria-label="Type DELETE to confirm"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="DELETE"
          autoComplete="off"
          disabled={deleting}
          className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
          <button
            onClick={handleDelete}
            disabled={confirm !== "DELETE" || deleting}
            className="inline-flex items-center justify-center h-10 px-4 rounded-md bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {deleting ? "Deleting…" : "Delete my account"}
          </button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
