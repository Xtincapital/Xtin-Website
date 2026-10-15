// Ported from features-incoming/fundakamental/src/pages/Settings.tsx.
//
// Adaptations from the original:
//  - `useAuthStore` (dropped) replaced with the shared `useAuth()`
//    (apps/web/src/contexts/AuthContext.tsx). That user shape has
//    `first_name`/`last_name`/`email`/`id`, not `name`/`plan`/`reportsUsed`/
//    `reportsLimit` — see the derived `displayName` and the Subscription tab
//    below for how each is now sourced.
//  - `authApi.updateProfile()` is gone (authApi was dropped entirely — see
//    lib/api.ts's header comment). Profile saves now go straight to this
//    app's own shared endpoint, `PUT /api/auth/profile`
//    (services/api/modules/auth/user.routes.ts), via
//    `authService.makeAuthenticatedRequest` directly (not through the
//    FundaKaMental api client, since this isn't a FundaKaMental-specific
//    endpoint). That endpoint takes `first_name`/`last_name`, so the single
//    "Full Name" field is split on save.
//  - `authApi.deleteAccount()` is gone, and — unlike profile updates — this
//    app's shared auth module has NO account-deletion endpoint at all
//    (checked services/api/modules/auth/user.routes.ts directly). Rather
//    than silently no-op or claim success, the delete flow below tells the
//    user this isn't available yet. TODO: wire up once a real endpoint
//    exists.
//  - Plan/tokens/subscription state now comes entirely from
//    `usePlanStore` (`isPro()`, `wallet`) instead of `user.plan` — see
//    store/usePlanStore.ts's header comment. "Reports used this month" had
//    no live data source left after dropping `useAuthStore`'s
//    `reportsUsed`/`reportsLimit` (they lived on FundaKaMental's own
//    now-dropped backend user profile), so that line is now static copy
//    instead of a fake/frozen counter.
//  - `useRegion` now comes from the shared `@/hooks/useRegion`, `formatPrice`
//    from `../lib/currency`, `supabase` from the shared `@/supabase` client.
//  - `RegionSwitcher` and `DashboardLayout` are NOT yet ported — imports
//    below point at where they will live.
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
// TODO: not yet ported — source:
// features-incoming/fundakamental/src/components/dashboard/DashboardLayout.tsx
import DashboardLayout from "../components/dashboard/DashboardLayout";
import PageHeader from "../components/PageHeader";
import { CARD_P, INPUT, BTN } from "../lib/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  CreditCard,
  SlidersHorizontal,
  Shield,
  Key,
  Sparkles,
  Check,
  Coins,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { usePlanStore, billingFor, formatTokens } from "../store/usePlanStore";
import useRegion from "@/hooks/useRegion";
import { formatPrice } from "../lib/currency";
// TODO: not yet ported — source:
// features-incoming/fundakamental/src/components/RegionSwitcher.tsx
import RegionSwitcher from "../components/RegionSwitcher";
import DeleteAccountDialog from "@/components/DeleteAccountDialog";
import { api } from "../lib/api";
import authService from "../../../services/authService";
import { BACKEND_URL } from "../../../config/env";
import supabase from "../../../supabase";

const STYLE_OPTIONS = [
  { id: "beginner", label: "New to investing" },
  { id: "value", label: "Value" },
  { id: "growth", label: "Growth" },
  { id: "income", label: "Dividends / Income" },
  { id: "trader", label: "Shorter-term" },
  { id: "balanced", label: "Balanced" },
];
const HORIZON_OPTIONS = [
  { id: "long_term", label: "Long term (years)" },
  { id: "medium", label: "Medium (6–18 months)" },
  { id: "short", label: "Short term" },
];

const initials = (name?: string) =>
  (name || "You")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase() || "U";

const Settings = () => {
  const { user, updateUser } = useAuth();
  const displayName = [user?.first_name, user?.last_name].filter(Boolean).join(" ").trim();
  // Subscribe to the plan itself: selecting the isPro function never re-rendered
  // once the plan loaded, so paying users kept seeing Free gates.
  const isPro = usePlanStore((s) => s.plan === "premium" || s.plan === "enterprise");
  const wallet = usePlanStore((s) => s.wallet);
  const fetchWallet = usePlanStore((s) => s.fetchWallet);
  const openBuyTokens = usePlanStore((s) => s.openBuyTokens);
  const openUpgrade = usePlanStore((s) => s.openUpgrade);
  const { region } = useRegion();
  const bp = billingFor(region as any);

  // Profile
  const [name, setName] = useState(displayName || "");
  const [savingProfile, setSavingProfile] = useState(false);

  // Subscription validity
  const [validUntil, setValidUntil] = useState<string | null>(null);

  // Preferences
  const [prefStyle, setPrefStyle] = useState(
    () => localStorage.getItem("fk_pref_style") || "balanced"
  );
  const [prefHorizon, setPrefHorizon] = useState(
    () => localStorage.getItem("fk_pref_horizon") || "long_term"
  );

  // Security — password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPw, setChangingPw] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    setName(displayName || "");
  }, [displayName]);

  useEffect(() => {
    fetchWallet();
    api.razorpay
      .getPlan()
      .then((res: any) => setValidUntil(res?.valid_until || null))
      .catch(() => {});
  }, [fetchWallet]);

  const nameChanged = name.trim() !== displayName.trim();
  // The account needs a first and a last name (a single word used to be
  // saved as "Suraj Suraj").
  const nameParts = name.trim().split(/\s+/).filter(Boolean);
  const nameValid = nameParts.length >= 2 && name.trim().length <= 80;

  const handleSaveProfile = async () => {
    if (!nameChanged || !nameValid) return;
    setSavingProfile(true);
    try {
      const first_name = nameParts[0];
      const last_name = nameParts.slice(1).join(" ");

      const res = await authService.makeAuthenticatedRequest(`${BACKEND_URL}/api/auth/profile`, {
        method: "PUT",
        body: JSON.stringify({ first_name, last_name }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Couldn't update your profile");
      }
      updateUser({ first_name, last_name });
      toast.success("Profile updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't update your profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const savePref = (key: string, value: string, setter: (v: string) => void) => {
    setter(value);
    localStorage.setItem(key, value);
    toast.success("Preference saved");
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }
    if (newPassword === currentPassword) {
      toast.error("New password must be different from your current one");
      return;
    }
    if (!user?.email) {
      toast.error("Can't verify your account. Please sign in again.");
      return;
    }
    setChangingPw(true);
    try {
      // Re-authenticate to prove the current password is correct.
      const { error: authErr } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });
      if (authErr) {
        toast.error("Current password is incorrect");
        return;
      }
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        toast.error(error.message || "Couldn't update your password");
        return;
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated");
    } finally {
      setChangingPw(false);
    }
  };

  const walletPct = wallet
    ? Math.min(100, Math.round((wallet.balance / Math.max(1, wallet.monthly_grant)) * 100))
    : 0;

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 max-w-4xl mx-auto">
        <PageHeader title="Settings" subtitle="Your profile, plan, report preferences and password." />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="bg-secondary border border-border p-[3px] rounded-xl max-w-full justify-start overflow-x-auto">
              <TabsTrigger value="profile" className="gap-2">
                <User className="w-4 h-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="subscription" className="gap-2">
                <CreditCard className="w-4 h-4" />
                Subscription
              </TabsTrigger>
              <TabsTrigger value="preferences" className="gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                Preferences
              </TabsTrigger>
              <TabsTrigger value="security" className="gap-2">
                <Shield className="w-4 h-4" />
                Security
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <div className={CARD_P}>
                <h2 className="text-base font-bold text-foreground mb-5">
                  Profile Information
                </h2>
                <div className="grid gap-6">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-full bg-brand-fill flex items-center justify-center text-2xl font-bold text-white ring-4 ring-brand-soft">
                      {initials(displayName)}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground capitalize">
                        {isPro ? "premium" : "free"} plan
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {user?.email}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        maxLength={80}
                        className={INPUT}
                      />
                      {nameChanged && !nameValid && (
                        <p className="text-xs text-destructive">Enter your first and last name.</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={user?.email || ""}
                        disabled
                        className={INPUT}
                      />
                      <p className="text-xs text-muted-foreground">
                        Email is your login and can't be changed here.
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={handleSaveProfile}
                    disabled={!nameChanged || !nameValid || savingProfile}
                    className={`w-fit ${BTN} gap-2`}
                  >
                    {savingProfile && <Loader2 className="w-4 h-4 animate-spin" />}
                    {savingProfile ? "Saving…" : "Save Changes"}
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Subscription Tab */}
            <TabsContent value="subscription" className="space-y-6">
              <div className={CARD_P}>
                <h2 className="text-base font-bold text-foreground mb-5">Current Plan</h2>

                <div className="p-5 rounded-xl bg-secondary/50 border border-border mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-semibold text-foreground">
                        {isPro ? "Premium ✦" : "Free Plan"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {isPro ? "500K AI tokens per month" : "60K AI tokens per month"}
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-secondary text-sm text-muted-foreground">
                      Current Plan
                    </span>
                  </div>
                  {isPro ? (
                    validUntil && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Active until</span>
                        <span className="font-medium text-foreground">
                          {new Date(validUntil).toLocaleDateString(undefined, {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    )
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      Free plan includes 60K AI tokens per month.
                    </div>
                  )}
                </div>

                {/* AI tokens */}
                {wallet && (
                  <div className="p-5 rounded-xl border border-border mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5">
                        <Coins className="w-4 h-4 text-brand" /> AI tokens
                      </span>
                      <span className="text-sm font-bold text-foreground">
                        {formatTokens(wallet.balance)}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full rounded-full bg-brand-fill transition-all"
                        style={{ width: `${walletPct}%` }}
                      />
                    </div>
                    <button
                      onClick={() => (isPro ? openBuyTokens() : openUpgrade("reports"))}
                      className="mt-2 text-sm font-semibold text-brand hover:underline"
                    >
                      {isPro ? "Buy more tokens" : "Get more with Pro →"}
                    </button>
                  </div>
                )}

                {isPro ? (
                  <div className="p-5 rounded-xl bg-brand-soft border border-brand-line">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-fill flex items-center justify-center flex-none">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          You're on Premium
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Thanks for supporting FundaKaMental ✦
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-5 rounded-xl bg-brand-soft border border-brand-line">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-brand-fill flex items-center justify-center flex-none">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-1">
                          Upgrade to Premium
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          500K AI tokens, stock scanner, Q&amp;A, and more
                        </p>
                        <ul className="space-y-2 mb-4">
                          {[
                            "500K AI tokens every month",
                            "Stock screening engine",
                            "Interactive Q&A",
                            "PDF export",
                            "Priority support",
                          ].map((feature) => (
                            <li
                              key={feature}
                              className="flex items-center gap-2 text-sm text-muted-foreground"
                            >
                              <Check className="w-4 h-4 text-brand" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                        <Button
                          onClick={() => openUpgrade("general")}
                          className={`${BTN}`}
                        >
                          Upgrade — {formatPrice(bp.monthly, bp.currency)}/month
                        </Button>
                        <p className="text-xs text-brand font-medium mt-2">
                          or {formatPrice(bp.yearly, bp.currency)}/year — save 33%
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Preferences Tab */}
            <TabsContent value="preferences" className="space-y-6">
              <div className={CARD_P}>
                <h2 className="text-base font-bold text-foreground mb-5">Preferences</h2>
                <div className="space-y-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-foreground">Region &amp; currency</p>
                      <p className="text-sm text-muted-foreground">
                        Prices, examples and market defaults follow your region.
                      </p>
                    </div>
                    <RegionSwitcher />
                  </div>

                  <div className="pt-6 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Default analysis style</Label>
                      <Select
                        value={prefStyle}
                        onValueChange={(v) => savePref("fk_pref_style", v, setPrefStyle)}
                      >
                        <SelectTrigger className={INPUT}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STYLE_OPTIONS.map((o) => (
                            <SelectItem key={o.id} value={o.id}>
                              {o.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Default horizon</Label>
                      <Select
                        value={prefHorizon}
                        onValueChange={(v) => savePref("fk_pref_horizon", v, setPrefHorizon)}
                      >
                        <SelectTrigger className={INPUT}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {HORIZON_OPTIONS.map((o) => (
                            <SelectItem key={o.id} value={o.id}>
                              {o.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Used as the starting point for every new analysis.
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-6">
              <div className={CARD_P}>
                <h2 className="text-base font-bold text-foreground mb-5">
                  Security Settings
                </h2>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                      <Key className="w-4 h-4 text-brand" />
                      Change Password
                    </h3>
                    <div className="space-y-4 max-w-md">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className={INPUT}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className={INPUT}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className={INPUT}
                        />
                      </div>
                      <Button
                        variant="outline"
                        onClick={handleChangePassword}
                        disabled={changingPw}
                        className="gap-2"
                      >
                        {changingPw && <Loader2 className="w-4 h-4 animate-spin" />}
                        {changingPw ? "Updating…" : "Update Password"}
                      </Button>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-border">
                    <h3 className="font-bold text-destructive mb-2">Delete Account</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Permanently delete your Xtin Capital account and all of its data.
                    </p>
                    <Button
                      variant="destructive"
                      onClick={() => setDeleteOpen(true)}
                      className="bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    >
                      Delete Account
                    </Button>
                    <DeleteAccountDialog open={deleteOpen} onOpenChange={setDeleteOpen} />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

    </DashboardLayout>
  );
};

export default Settings;
