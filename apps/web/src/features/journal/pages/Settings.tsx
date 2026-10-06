// Journal Settings page (Phase 9f). Template:
// apps/web/src/features/fundakamental/pages/Settings.tsx (read fully) — same
// profile-save pattern (shared `PUT /api/auth/profile`, no Journal-specific
// profile endpoint exists or is needed) and the same "no backend endpoint →
// say so honestly" handling for account deletion.
//
// Journal-specific preferences: read from
// features-incoming/journal/app.js's `buildJournalSettingsState` (~line
// 581) — `selectedCurrency` and `selectedTimeZone` are the only two real
// per-user defaults that feed the trade-entry form (Trades.tsx's `currency`/
// `time_zone` fields; same option lists as that page's `CURRENCIES`/
// `TIME_ZONES` constants, duplicated here since that page doesn't export
// them). `activeTab`, `presentationMode`, `hasSeenWelcome` are dropped —
// pure UI/routing state from the original's single-page-app tab switcher,
// meaningless now that Journal is routed (JournalApp.tsx) and has no
// presentation mode of its own. Both kept prefs persist via `localStorage`
// only (`journal_pref_currency` / `journal_pref_timezone`) — they're
// trade-entry-form defaults, not data worth a backend table, matching how
// lightweight they were in the original (a plain localStorage read/write,
// no API call).
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { User, SlidersHorizontal, CreditCard, Sparkles, Coins, Loader2, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import authService from "../../../services/authService";
import { BACKEND_URL } from "../../../config/env";
import JournalLayout from "../components/JournalLayout";
import { useJournalPlanStore, formatTokens } from "../store/useJournalPlanStore";
import { strategies as strategiesApi, type Strategy } from "../lib/api";

// Same option lists Trades.tsx's trade-entry form uses (duplicated — see
// header comment).
const TIME_ZONES = [
  { value: "Asia/Kolkata", label: "IST - India" },
  { value: "America/New_York", label: "ET - New York" },
  { value: "America/Chicago", label: "CT - Chicago" },
  { value: "America/Los_Angeles", label: "PT - Los Angeles" },
  { value: "Europe/London", label: "GMT/BST - London" },
  { value: "Europe/Berlin", label: "CET - Berlin" },
  { value: "Asia/Dubai", label: "GST - Dubai" },
  { value: "Asia/Singapore", label: "SGT - Singapore" },
  { value: "Asia/Tokyo", label: "JST - Tokyo" },
  { value: "Australia/Sydney", label: "AET - Sydney" },
];
const CURRENCIES = ["INR", "USD", "EUR", "GBP", "AED", "SGD", "JPY"];

const CURRENCY_PREF_KEY = "journal_pref_currency";
const TIMEZONE_PREF_KEY = "journal_pref_timezone";

const initials = (name?: string) =>
  (name || "You")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase() || "U";

export default function Settings() {
  const { user, updateUser } = useAuth();
  const displayName = [user?.first_name, user?.last_name].filter(Boolean).join(" ").trim();

  const isPro = useJournalPlanStore((s) => s.isPro)();
  const validUntil = useJournalPlanStore((s) => s.validUntil);
  const wallet = useJournalPlanStore((s) => s.wallet);
  const fetchPlan = useJournalPlanStore((s) => s.fetchPlan);
  const fetchWallet = useJournalPlanStore((s) => s.fetchWallet);

  // Profile
  const [name, setName] = useState(displayName || "");
  const [savingProfile, setSavingProfile] = useState(false);

  // Preferences
  const [currency, setCurrency] = useState(() => localStorage.getItem(CURRENCY_PREF_KEY) || "INR");
  const [timeZone, setTimeZone] = useState(() => localStorage.getItem(TIMEZONE_PREF_KEY) || "Asia/Kolkata");

  useEffect(() => {
    setName(displayName || "");
  }, [displayName]);

  useEffect(() => {
    fetchPlan();
    fetchWallet();
  }, [fetchPlan, fetchWallet]);

  const nameChanged = name.trim() !== displayName.trim();
  const nameValid = name.trim().length >= 1 && name.trim().length <= 80;

  // Reuses this app's shared profile endpoint (services/api/modules/auth/
  // user.routes.ts's `PUT /api/auth/profile`) exactly as FundaKaMental's
  // Settings.tsx does — there is no Journal-specific profile endpoint, and
  // none is needed since the profile fields (first/last name) aren't
  // Journal-specific data.
  const handleSaveProfile = async () => {
    if (!nameChanged || !nameValid) return;
    setSavingProfile(true);
    try {
      const parts = name.trim().split(/\s+/);
      const first_name = parts[0];
      const last_name = parts.slice(1).join(" ") || parts[0];

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

  const saveCurrency = (value: string) => {
    setCurrency(value);
    localStorage.setItem(CURRENCY_PREF_KEY, value);
    toast.success("Default currency saved");
  };

  const saveTimeZone = (value: string) => {
    setTimeZone(value);
    localStorage.setItem(TIMEZONE_PREF_KEY, value);
    toast.success("Default time zone saved");
  };

  const walletPct = wallet
    ? Math.min(100, Math.round((wallet.token_balance / Math.max(1, wallet.free_tokens_granted || wallet.token_balance || 1)) * 100))
    : 0;

  return (
    <JournalLayout>
      <div className="mx-auto max-w-3xl space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your account, preferences and plan</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" /> Profile
            </TabsTrigger>
            <TabsTrigger value="preferences" className="gap-2">
              <SlidersHorizontal className="h-4 w-4" /> Preferences
            </TabsTrigger>
            <TabsTrigger value="plan" className="gap-2">
              <CreditCard className="h-4 w-4" /> Plan
            </TabsTrigger>
          </TabsList>

          {/* Profile */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile information</CardTitle>
                <CardDescription>Your name and email, shared across Xtin Capital.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                    {initials(displayName)}
                  </div>
                  <div>
                    <p className="font-semibold capitalize">{isPro ? "Pro" : "Free"} plan</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={user?.email || ""} disabled />
                    <p className="text-xs text-muted-foreground">Email is your login and can't be changed here.</p>
                  </div>
                </div>

                <Button onClick={handleSaveProfile} disabled={!nameChanged || !nameValid || savingProfile} className="gap-2">
                  {savingProfile && <Loader2 className="h-4 w-4 animate-spin" />}
                  {savingProfile ? "Saving…" : "Save changes"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences */}
          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>Trade entry defaults</CardTitle>
                <CardDescription>
                  Used to pre-fill the currency and time zone fields when you log a new trade. Saved on this device only.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Default currency</Label>
                  <Select value={currency} onValueChange={saveCurrency}>
                    <SelectTrigger aria-label="Default currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Default time zone</Label>
                  <Select value={timeZone} onValueChange={saveTimeZone}>
                    <SelectTrigger aria-label="Default time zone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_ZONES.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
            <StrategiesCard />
          </TabsContent>

          {/* Plan */}
          <TabsContent value="plan">
            <Card>
              <CardHeader>
                <CardTitle>Manage plan</CardTitle>
                <CardDescription>Your current Journal Pro status and AI token wallet.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{isPro ? "Pro" : "Free"}</span>
                      {isPro && (
                        <Badge className="gap-1">
                          <Sparkles className="h-3 w-3" /> Active
                        </Badge>
                      )}
                    </div>
                    {isPro && validUntil ? (
                      <p className="text-sm text-muted-foreground">
                        Active until{" "}
                        {new Date(validUntil).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">Free plan — upgrade for the full analysis suite.</p>
                    )}
                  </div>
                  <Button asChild variant={isPro ? "outline" : "default"}>
                    <Link to="/journal/pricing">{isPro ? "Manage plan" : "Upgrade to Pro"}</Link>
                  </Button>
                </div>

                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
                      <Coins className="h-4 w-4 text-primary" /> AI tokens
                    </span>
                    <span className="text-sm font-bold">{wallet ? formatTokens(wallet.token_balance) : "-"}</span>
                  </div>
                  <Progress value={walletPct} className="mt-2 h-1.5" />
                  <Button asChild variant="link" className="mt-1 h-auto p-0 text-xs">
                    <Link to="/journal/pricing">{isPro ? "Buy more tokens" : "Get more with Pro"}</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </JournalLayout>
  );
}

/** The strategy names you've typed on trades, which the trade form suggests. Removing one
 *  only takes it off that list; trades that already use it keep it. */
function StrategiesCard() {
  const [items, setItems] = useState<Strategy[] | null>(null);
  const [target, setTarget] = useState<Strategy | null>(null);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    strategiesApi
      .getStrategies()
      .then(setItems)
      .catch(() => setItems([]));
  }, []);

  async function confirmRemove() {
    if (!target) return;
    setRemoving(true);
    try {
      await strategiesApi.deleteStrategy(target.id);
      setItems((prev) => (prev || []).filter((s) => s.id !== target.id));
      toast.success(`Removed "${target.name}"`);
      setTarget(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't remove the strategy");
    } finally {
      setRemoving(false);
    }
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Your strategies</CardTitle>
        <CardDescription>
          Strategy names you've added, suggested when you log a trade. Removing one takes it off the list; trades that use it keep it.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {items === null ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No custom strategies yet. Type a new name in a trade's Strategy field to add one.</p>
        ) : (
          <ul className="divide-y rounded-md border">
            {items.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                <span className="min-w-0 truncate">{item.name}</span>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" aria-label={`Remove strategy ${item.name}`} onClick={() => setTarget(item)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
      <AlertDialog open={!!target} onOpenChange={(open) => !open && setTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove "{target?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>It will no longer be suggested. Trades that already use it are not changed.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removing}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemove} disabled={removing}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
