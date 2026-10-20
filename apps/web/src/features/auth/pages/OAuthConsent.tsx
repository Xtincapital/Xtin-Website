// Consent screen for apps that sign in with an Xtin account — today, Claude's
// Xtin Backtest connector. Supabase Auth runs the OAuth 2.1 server and sends
// the browser here with ?authorization_id=…; the user (already signed in,
// ProtectedRoute sees to that) approves or denies, and Supabase redirects back
// to the app. Configure this path as the OAuth server's authorization path in
// the Supabase dashboard (see services/api/modules/mcp/README.md).
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Check, ShieldCheck, X } from "lucide-react";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import supabase from "../../../supabase";

type Details = { authorization_id: string; redirect_uri: string; client: { name: string; uri?: string; logo_uri?: string }; user: { email: string }; scope: string };

const CAN = ["Search instruments and check your strategies against Xtin's rules", "Run backtests with your plan's credits", "Read, save and delete your saved strategies and backtests", "See your plan and the credits you have left"];
const CANNOT = ["Place orders or trade — Xtin has no access to any broker account", "See your password or payment details"];

/** Supabase's raw messages ("Auth session missing!") aren't for people. */
function friendly(message: string | undefined, fallback = "This connection request has expired or was already used. Start connecting again from the app."): string {
  if (message && /session/i.test(message)) return "Your Xtin sign-in has expired. Sign in again, then start connecting again from the app.";
  return fallback;
}

export default function OAuthConsent() {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id");
  const [details, setDetails] = useState<Details | null>(null);
  const [error, setError] = useState<string | null>(authorizationId ? null : "This link is missing its authorization request. Start connecting again from the app.");
  const [busy, setBusy] = useState<"approve" | "deny" | null>(null);

  useEffect(() => {
    if (!authorizationId) return;
    let cancelled = false;
    supabase.auth.oauth.getAuthorizationDetails(authorizationId).then(({ data, error: err }) => {
      if (cancelled) return;
      if (err || !data) setError(friendly(err?.message));
      else if ("redirect_url" in data) window.location.assign(data.redirect_url); // already approved earlier
      else setDetails(data as Details);
    });
    return () => {
      cancelled = true;
    };
  }, [authorizationId]);

  async function decide(kind: "approve" | "deny") {
    if (!authorizationId) return;
    setBusy(kind);
    const { data, error: err } =
      kind === "approve" ? await supabase.auth.oauth.approveAuthorization(authorizationId, { skipBrowserRedirect: true }) : await supabase.auth.oauth.denyAuthorization(authorizationId, { skipBrowserRedirect: true });
    if (err || !data?.redirect_url) {
      setBusy(null);
      setError(friendly(err?.message, "Couldn't complete the request. Please try again."));
      return;
    }
    window.location.assign(data.redirect_url);
  }

  return (
    <>
      <Navbar />
      <section className="mt-16 px-6 py-16">
        <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900 sm:p-8">
          <div className="flex items-center gap-3">
            {details?.client.logo_uri ? (
              <img src={details.client.logo_uri} alt="" className="h-10 w-10 rounded-xl" />
            ) : (
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft">
                <ShieldCheck className="h-5 w-5 text-brand" />
              </span>
            )}
            <h1 className="text-2xl font-semibold tracking-tight">{details ? `Connect ${details.client.name} to Xtin` : "Connect to Xtin"}</h1>
          </div>

          {error && <p className="mt-6 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">{error}</p>}
          {!error && !details && <p className="mt-6 text-sm text-slate-500">Checking the request…</p>}

          {details && (
            <>
              <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
                <b>{details.client.name}</b> wants to use Xtin Backtest with your account <b>{details.user.email}</b>. It will be able to:
              </p>
              <ul className="mt-3 space-y-2 text-sm">
                {CAN.map((c) => (
                  <li key={c} className="flex gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" /> {c}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">It can't:</p>
              <ul className="mt-2 space-y-2 text-sm">
                {CANNOT.map((c) => (
                  <li key={c} className="flex gap-2">
                    <X className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" /> {c}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-slate-500">
                Results are hypothetical backtests, not investment advice. You can disconnect at any time from the app's connector settings. You'll return to{" "}
                <span className="break-all font-mono">{new URL(details.redirect_uri).host}</span>.
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  disabled={busy !== null}
                  onClick={() => decide("approve")}
                  className="inline-flex flex-1 items-center justify-center rounded-xl bg-brand-fill px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-hover disabled:opacity-60"
                >
                  {busy === "approve" ? "Connecting…" : "Allow"}
                </button>
                <button
                  type="button"
                  disabled={busy !== null}
                  onClick={() => decide("deny")}
                  className="inline-flex flex-1 items-center justify-center rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold transition hover:bg-slate-50 disabled:opacity-60 dark:border-white/10 dark:hover:bg-white/5"
                >
                  {busy === "deny" ? "Cancelling…" : "Deny"}
                </button>
              </div>
            </>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
}
