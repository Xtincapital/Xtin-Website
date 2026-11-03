// Settings → Broker: connect a broker client code so executed trades appear in
// the journal on their own. Everything here follows the server's status: while
// sync isn't switched on it only explains what's coming, and a link that hasn't
// been verified yet is shown as waiting and is never read.
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Link2, Link2Off, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { broker, type BrokerStatus } from "../lib/api";

const formatWhen = (iso: string) => new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

const COMING_SOON = [
  "Your executed trades arrive in the Journal after each market day, with no statements to upload.",
  "Options and futures are filled in for you: contract, strike, call or put.",
  "It only reads. Xtin Capital can't place, change or cancel an order.",
];

/** Shown when the last request to link a client code was turned down. */
function RejectionNotice({ rejection }: { rejection: NonNullable<BrokerStatus["rejection"]> }) {
  return (
    <div role="status" className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
      <p className="font-medium">Your request to connect {rejection.client_code} wasn't confirmed.</p>
      {rejection.note && <p className="mt-1">{rejection.note}</p>}
      <p className="mt-1 text-xs opacity-80">You can check the client code and try again.</p>
    </div>
  );
}

export default function BrokerConnect({ isPro }: { isPro: boolean }) {
  const [status, setStatus] = useState<BrokerStatus | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [clientCode, setClientCode] = useState("");
  const [consented, setConsented] = useState(false);
  const [linking, setLinking] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [confirmingDisconnect, setConfirmingDisconnect] = useState(false);
  const [deleteSynced, setDeleteSynced] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [reconsented, setReconsented] = useState(false);
  const [reconsenting, setReconsenting] = useState(false);

  const load = useCallback(async () => {
    setLoadError(false);
    try {
      setStatus(await broker.getStatus());
    } catch {
      setLoadError(true);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleLink = async () => {
    if (!status) return;
    setLinking(true);
    try {
      await broker.link({ client_code: clientCode.trim(), consent_version: status.consent.version });
      setClientCode("");
      setConsented(false);
      await load();
      toast.success("Broker connected");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't link your broker account");
    } finally {
      setLinking(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const result = await broker.syncNow();
      await load();
      toast.success(result.insertedTrades ? `Added ${result.insertedTrades} new trade${result.insertedTrades === 1 ? "" : "s"}` : "Up to date. No new completed trades.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't sync your trades");
    } finally {
      setSyncing(false);
    }
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      await broker.unlink(deleteSynced);
      setConfirmingDisconnect(false);
      setDeleteSynced(false);
      await load();
      toast.success(deleteSynced ? "Disconnected, and synced trades deleted" : "Broker disconnected");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't disconnect your broker");
    } finally {
      setDisconnecting(false);
    }
  };

  const handleReconsent = async () => {
    if (!status) return;
    setReconsenting(true);
    try {
      await broker.reconsent(status.consent.version);
      setReconsented(false);
      await load();
      toast.success("Thanks, your confirmation is saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't save your confirmation");
    } finally {
      setReconsenting(false);
    }
  };

  if (loadError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Broker connection</CardTitle>
          <CardDescription>We couldn't load your broker connection.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={load}>
            Try again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!status) {
    return (
      <Card>
        <CardContent className="flex items-center gap-2 py-10 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading your broker connection
        </CardContent>
      </Card>
    );
  }

  const { link } = status;

  // Connected (or waiting to be confirmed)
  if (link) {
    const active = link.status === "active";
    return (
      <>
        <Card>
          <CardHeader>
            <CardTitle>Broker connection</CardTitle>
            <CardDescription>Trades from your broker account are added to this Journal.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {link.consent_outdated && (
              <div role="alert" className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                <p className="font-medium">We've updated the consent wording.</p>
                <p className="mt-1">Reading your trades is paused until you confirm it.</p>
                <div className="mt-3 flex items-start gap-2">
                  <Checkbox id="broker-reconsent" checked={reconsented} onCheckedChange={(v) => setReconsented(v === true)} />
                  <Label htmlFor="broker-reconsent" className="font-normal leading-snug">
                    {status.consent.text}
                  </Label>
                </div>
                <Button className="mt-3" size="sm" onClick={handleReconsent} disabled={!reconsented || reconsenting}>
                  {reconsenting && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                  Confirm
                </Button>
              </div>
            )}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold tabular-nums">{link.client_code}</span>
                  <Badge variant={active ? "default" : "secondary"}>{active ? "Active" : "Waiting for confirmation"}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {active
                    ? link.consent_outdated
                      ? "Paused until you confirm the updated consent wording."
                      : link.last_synced_at
                        ? `Last synced ${formatWhen(link.last_synced_at)}`
                        : "Not synced yet"
                    : "We're confirming this client code is yours. Trades start appearing once that's done."}
                </p>
                {active && link.last_sync_status === "failed" && (
                  <p className="mt-1 text-sm text-destructive">The last sync didn't go through. It will be retried after the next market day.</p>
                )}
                {active && <p className="mt-1 text-sm text-muted-foreground">{status.synced_trades} trade{status.synced_trades === 1 ? "" : "s"} synced from your broker</p>}
                {active && status.synced_trades > 0 && (
                  <p className="mt-1 text-xs text-muted-foreground">Brokerage and taxes aren't included yet, so these trades show profit and loss before charges.</p>
                )}
              </div>
              <div className="flex gap-2">
                {active && status.available && !link.consent_outdated && (
                  <Button variant="outline" onClick={handleSync} disabled={syncing}>
                    {syncing ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-1.5 h-4 w-4" />}
                    Sync now
                  </Button>
                )}
                <Button variant="outline" onClick={() => setConfirmingDisconnect(true)}>
                  <Link2Off className="mr-1.5 h-4 w-4" /> Disconnect
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Read-only. Xtin Capital can't place, change or cancel orders.</p>
          </CardContent>
        </Card>

        <AlertDialog open={confirmingDisconnect} onOpenChange={setConfirmingDisconnect}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Disconnect your broker?</AlertDialogTitle>
              <AlertDialogDescription>We'll stop reading your broker account. Trades already in your Journal stay unless you choose to delete them.</AlertDialogDescription>
            </AlertDialogHeader>
            {status.synced_trades > 0 && (
              <div className="flex items-start gap-2">
                <Checkbox id="delete-synced" checked={deleteSynced} onCheckedChange={(v) => setDeleteSynced(v === true)} />
                <Label htmlFor="delete-synced" className="text-sm font-normal leading-snug">
                  Also delete the {status.synced_trades} trade{status.synced_trades === 1 ? "" : "s"} synced from my broker, including any notes I added to them
                </Label>
              </div>
            )}
            <AlertDialogFooter>
              <AlertDialogCancel disabled={disconnecting}>Keep connected</AlertDialogCancel>
              <AlertDialogAction
                disabled={disconnecting}
                onClick={(e) => {
                  e.preventDefault();
                  handleDisconnect();
                }}
              >
                {disconnecting && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                Disconnect
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  // Not connected, and sync isn't live yet (or is live for a trial group that doesn't include this account)
  if (!status.available) {
    const trial = status.pilot_only === true;
    return (
      <Card>
        <CardHeader>
          <CardTitle>Broker connection</CardTitle>
          <CardDescription>{trial ? "Automatic trade sync is being tried with a small group first." : "Automatic trade sync is coming soon."}</CardDescription>
        </CardHeader>
        <CardContent>
          {status.rejection && <RejectionNotice rejection={status.rejection} />}
          {trial && <p className="mb-3 text-sm text-muted-foreground">It isn't open to your account yet. We'll open it to everyone once the trial has shown it gets every trade right.</p>}
          <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
            {COMING_SOON.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-muted-foreground">In the meantime you can import a statement from the Trades page.</p>
        </CardContent>
      </Card>
    );
  }

  // Not connected, sync is live, but it's a Pro feature
  if (!isPro) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Broker connection</CardTitle>
          <CardDescription>Connecting your broker is a Journal Pro feature.</CardDescription>
        </CardHeader>
        <CardContent>
          {status.rejection && <RejectionNotice rejection={status.rejection} />}
          <Button asChild>
            <Link to="/journal/pricing">
              <Sparkles className="mr-1.5 h-4 w-4" /> Upgrade to Pro
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Not connected: link form
  const canLink = clientCode.trim().length >= 3 && consented && !linking;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Connect your broker</CardTitle>
        <CardDescription>Enter your broker client code. Your executed trades will then appear here after each market day.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {status.rejection && <RejectionNotice rejection={status.rejection} />}
        <div className="max-w-sm space-y-2">
          <Label htmlFor="broker-client-code">Client code</Label>
          <Input id="broker-client-code" value={clientCode} onChange={(e) => setClientCode(e.target.value)} autoComplete="off" maxLength={30} placeholder="e.g. AB1234" />
        </div>
        <div className="flex items-start gap-2">
          <Checkbox id="broker-consent" checked={consented} onCheckedChange={(v) => setConsented(v === true)} />
          <Label htmlFor="broker-consent" className="text-sm font-normal leading-snug">
            {status.consent.text}
          </Label>
        </div>
        <Button onClick={handleLink} disabled={!canLink}>
          {linking ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Link2 className="mr-1.5 h-4 w-4" />}
          Connect broker
        </Button>
      </CardContent>
    </Card>
  );
}
