// Price alerts + in-app notifications. Watchlist targets create alerts
// automatically; users can also add one here. When a price crosses an
// alert's target the server switches the alert off and posts a notification,
// which shows in the sidebar badge and on this page.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Bell, BellOff, Check, CheckCheck, Plus, Trash2, TrendingDown, TrendingUp } from "lucide-react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "../lib/api";
import { useAlertsStore, type FundaNotification } from "../store/useAlertsStore";

interface PriceAlert {
  id: string;
  ticker: string;
  condition: "above" | "below";
  target_price: number;
  is_active: boolean;
  triggered_at: string | null;
  triggered_price: number | null;
  created_at: string;
}

const isIndian = (t: string) => /\.(NS|BO)$/i.test(t);
const money = (ticker: string, n: number | null | undefined) =>
  n == null
    ? "—"
    : `${isIndian(ticker) ? "₹" : "$"}${Number(n).toLocaleString(isIndian(ticker) ? "en-IN" : "en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;

const when = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

export default function Alerts() {
  const [notifications, setNotifications] = useState<FundaNotification[]>([]);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [ticker, setTicker] = useState("");
  const [condition, setCondition] = useState<"above" | "below">("above");
  const [target, setTarget] = useState("");
  const [creating, setCreating] = useState(false);
  const setUnread = useAlertsStore((s) => s.setUnread);

  const load = async () => {
    try {
      // The unread-count call also runs the server's check of this user's targets.
      await useAlertsStore.getState().refreshUnread();
      const [n, a] = await Promise.all([api.alerts.getNotifications({ limit: 50 }), api.alerts.getPriceAlerts()]);
      setNotifications(n || []);
      setAlerts(a || []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't load your alerts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markRead = async (n: FundaNotification) => {
    if (n.is_read) return;
    setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)));
    setUnread(unreadCount - 1);
    try {
      await api.alerts.markNotificationRead(n.id);
    } catch {
      load();
    }
  };

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((x) => ({ ...x, is_read: true })));
    setUnread(0);
    try {
      await api.alerts.markAllNotificationsRead();
    } catch {
      load();
    }
  };

  const removeNotification = async (n: FundaNotification) => {
    setNotifications((prev) => prev.filter((x) => x.id !== n.id));
    if (!n.is_read) setUnread(unreadCount - 1);
    try {
      await api.alerts.deleteNotification(n.id);
    } catch {
      load();
    }
  };

  const createAlert = async () => {
    const t = ticker.trim().toUpperCase();
    const price = parseFloat(target);
    if (!t) return toast.error("Enter a ticker, e.g. RELIANCE.NS or AAPL");
    if (!(price > 0)) return toast.error("Enter a target price above 0");
    setCreating(true);
    try {
      await api.alerts.createPriceAlert({ ticker: t, condition, target_price: price });
      toast.success(`We'll let you know when ${t} goes ${condition} ${money(t, price)}`);
      setTicker("");
      setTarget("");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't create the alert");
    } finally {
      setCreating(false);
    }
  };

  const toggle = async (a: PriceAlert) => {
    try {
      await api.alerts.toggleAlert(a.id);
      setAlerts((prev) => prev.map((x) => (x.id === a.id ? { ...x, is_active: !x.is_active } : x)));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't update the alert");
    }
  };

  const removeAlert = async (a: PriceAlert) => {
    try {
      await api.alerts.deletePriceAlert(a.id);
      setAlerts((prev) => prev.filter((x) => x.id !== a.id));
      toast.success("Alert deleted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't delete the alert");
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Alerts</h1>
          <p className="text-muted-foreground mt-1">
            Get notified here when a stock reaches your price. Targets you set in your{" "}
            <Link to="/fundakamental/watchlist" className="text-primary font-medium hover:underline">
              Watchlist
            </Link>{" "}
            become alerts automatically. Prices are checked about every 15 minutes.
          </p>
        </div>

        {/* Notifications */}
        <section className="rounded-2xl bg-white border border-border">
          <div className="p-4 border-b border-border flex items-center justify-between gap-3">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" /> Notifications
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-xs font-bold">{unreadCount} new</span>
              )}
            </h2>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllRead} className="gap-1.5">
                <CheckCheck className="w-4 h-4" /> Mark all read
              </Button>
            )}
          </div>
          {loading ? (
            <p className="p-6 text-sm text-muted-foreground">Loading…</p>
          ) : notifications.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">No notifications yet. You'll see one here when a stock hits your target.</p>
          ) : (
            <ul className="divide-y divide-border">
              {notifications.map((n) => {
                const up = n.data?.condition === "above";
                return (
                  <li key={n.id} className={`flex items-start gap-3 p-4 ${n.is_read ? "" : "bg-primary/5"}`}>
                    <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${up ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                      {up ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${n.is_read ? "text-foreground" : "font-semibold text-foreground"}`}>{n.title}</p>
                      <p className="text-sm text-muted-foreground">{n.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{when(n.created_at)}</p>
                    </div>
                    {!n.is_read && (
                      <Button variant="ghost" size="sm" onClick={() => markRead(n)} aria-label={`Mark "${n.title}" as read`} title="Mark as read">
                        <Check className="w-4 h-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => removeNotification(n)} aria-label={`Delete "${n.title}"`} title="Delete">
                      <Trash2 className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* New alert */}
        <section className="rounded-2xl bg-white border border-border p-5">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4 text-primary" /> New price alert
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_10rem_10rem_auto] gap-3 items-end">
            <div>
              <Label htmlFor="alert-ticker">Ticker</Label>
              <Input id="alert-ticker" value={ticker} onChange={(e) => setTicker(e.target.value)} placeholder="RELIANCE.NS · AAPL" className="uppercase" />
            </div>
            <div>
              <Label htmlFor="alert-condition">When price goes</Label>
              <Select value={condition} onValueChange={(v) => setCondition(v as "above" | "below")}>
                <SelectTrigger id="alert-condition">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="above">At or above</SelectItem>
                  <SelectItem value="below">At or below</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="alert-target">Target price</Label>
              <Input id="alert-target" type="number" min="0" step="any" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="1500" />
            </div>
            <Button onClick={createAlert} disabled={creating} className="bg-primary text-white hover:bg-primary/90">
              {creating ? "Adding…" : "Add alert"}
            </Button>
          </div>
        </section>

        {/* Alerts list */}
        <section className="rounded-2xl bg-white border border-border overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold text-foreground">Your price alerts</h2>
          </div>
          {loading ? (
            <p className="p-6 text-sm text-muted-foreground">Loading…</p>
          ) : alerts.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">No alerts yet. Add one above, or set a target on a Watchlist stock.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/30 text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="text-left py-3 px-4 font-medium">Stock</th>
                    <th className="text-left py-3 px-4 font-medium">Alert when</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="py-3 px-4" />
                  </tr>
                </thead>
                <tbody>
                  {alerts.map((a) => (
                    <tr key={a.id} className="border-b border-border/50 last:border-0">
                      <td className="py-3 px-4 font-semibold text-foreground">{a.ticker}</td>
                      <td className="py-3 px-4 text-foreground">
                        {a.condition === "above" ? "At or above" : "At or below"} {money(a.ticker, a.target_price)}
                      </td>
                      <td className="py-3 px-4">
                        {a.is_active ? (
                          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-primary/10 text-primary">Watching</span>
                        ) : a.triggered_at ? (
                          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">
                            Hit {money(a.ticker, a.triggered_price)} · {when(a.triggered_at)}
                          </span>
                        ) : (
                          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-secondary text-muted-foreground">Paused</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggle(a)}
                            aria-label={a.is_active ? `Pause alert for ${a.ticker}` : `Turn on alert for ${a.ticker}`}
                            title={a.is_active ? "Pause" : a.triggered_at ? "Watch again" : "Turn on"}
                          >
                            {a.is_active ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => removeAlert(a)} aria-label={`Delete alert for ${a.ticker}`} title="Delete">
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
