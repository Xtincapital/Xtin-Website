import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowLeft,
  Clock,
  CheckCircle2,
  Lock,
  Unlock,
  Layers,
  Wrench,
  TrendingUp,
  FlaskConical,
  Eye,
  EyeOff,
} from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import SEO from './SEO';
import {
  MAINTENANCE_CONFIG,
  MaintenanceFeature,
  isPreviewActive,
  setPreviewMode,
} from '../config/maintenance';

interface ComingSoonGateProps {
  feature: MaintenanceFeature;
  title: string;
  tagline?: string;
  description: string;
  estimatedTime?: string;
  highlights?: string[];
  children: React.ReactNode;
}

export const ComingSoonGate: React.FC<ComingSoonGateProps> = ({
  feature,
  title,
  tagline = 'Feature Upgrade In Progress',
  description,
  estimatedTime = 'A few days',
  highlights = [],
  children,
}) => {
  const isGated = MAINTENANCE_CONFIG[feature];
  const [inPreview, setInPreview] = useState<boolean>(false);
  const [showAdminModal, setShowAdminModal] = useState<boolean>(false);
  const [passcode, setPasscode] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if preview mode is active in the session or via query parameter
    setInPreview(isPreviewActive());
  }, []);

  const handleTogglePreview = (enable: boolean) => {
    setPreviewMode(enable);
    setInPreview(enable);
    setShowAdminModal(false);
    setPasscode('');
    setErrorMsg('');
  };

  const handleAdminUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    // Default unlock passkey: 'xtin' or 'admin' or 'dev'
    const normalized = passcode.trim().toLowerCase();
    if (normalized === 'xtin' || normalized === 'admin' || normalized === 'dev' || normalized === 'preview') {
      handleTogglePreview(true);
    } else {
      setErrorMsg('Incorrect passcode. Use "xtin" or access with ?preview=true');
    }
  };

  // If the feature is not in maintenance, render normally
  if (!isGated) {
    return <>{children}</>;
  }

  // If in developer preview mode, show the real feature with a persistent developer banner
  if (inPreview) {
    return (
      <div className="relative min-h-screen">
        {/* Floating Developer Preview Banner */}
        <div className="sticky top-0 z-[100] flex items-center justify-between gap-3 bg-amber-500/90 backdrop-blur-md px-4 py-2 text-xs font-semibold text-slate-950 shadow-md">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-slate-950 animate-ping" />
            <span>
              <strong>Developer Preview Active:</strong> {title} is currently hidden from public visitors.
            </span>
          </div>
          <button
            onClick={() => handleTogglePreview(false)}
            className="flex items-center gap-1 rounded bg-slate-950 px-2.5 py-1 text-[11px] font-bold text-white transition hover:bg-slate-800"
            title="Exit preview to see the Coming Soon page"
          >
            <EyeOff className="h-3.5 w-3.5" />
            Exit Preview Mode
          </button>
        </div>

        {/* The live, fully-functional children component */}
        {children}
      </div>
    );
  }

  // Otherwise, render the branded Coming Soon screen for public visitors
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-200">
      <SEO
        title={`${title} - Coming Soon | XTIN Capital`}
        description={description}
        noIndex={true}
      />
      <Navbar />

      <main className="flex-1 flex items-center justify-center pt-24 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Subtle decorative background gradients */}
        <div className="pointer-events-none absolute -top-40 -right-40 h-96 w-96 rounded-full bg-brand/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-brand/10 blur-3xl" />

        <div className="max-w-2xl w-full mx-auto text-center relative z-10">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand/10 border border-brand/20 text-brand text-xs font-semibold tracking-wide uppercase mb-6 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand"></span>
            </span>
            <span>{tagline}</span>
          </div>

          {/* Icon Showcase */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-fill/20 via-brand-fill/10 to-transparent border border-brand/20 shadow-lg shadow-brand/10">
            {feature === 'fundakamental' ? (
              <TrendingUp className="h-10 w-10 text-brand" />
            ) : (
              <FlaskConical className="h-10 w-10 text-brand" />
            )}
          </div>

          {/* Main Title & Description */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4">
            {title} <span className="text-brand">Is Coming Soon</span>
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto mb-8">
            {description}
          </p>

          {/* Expected Timeline Box */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border text-sm text-foreground mb-8 shadow-sm">
            <Clock className="h-4 w-4 text-brand" />
            <span className="text-muted-foreground">Estimated Availability:</span>
            <span className="font-semibold text-foreground">{estimatedTime}</span>
          </div>

          {/* What's Being Upgraded List */}
          {highlights.length > 0 && (
            <div className="text-left bg-card/60 backdrop-blur-sm border border-border/80 rounded-2xl p-6 sm:p-8 mb-8 shadow-sm">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-brand" />
                What We&apos;re Working On
              </h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {highlights.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm text-foreground/90">
                    <CheckCircle2 className="h-4 w-4 text-brand shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Navigation */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-border bg-card text-foreground font-semibold hover:bg-muted transition-colors shadow-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </button>

            <Link
              to="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-fill text-white font-semibold hover:bg-brand-hover transition-colors shadow-md shadow-brand/20"
            >
              <Layers className="h-4 w-4" />
              Go to Dashboard
            </Link>

            <Link
              to="/tools"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-border bg-card text-foreground font-semibold hover:bg-muted transition-colors shadow-sm"
            >
              <Wrench className="h-4 w-4" />
              Explore Tools
            </Link>
          </div>

          {/* Discreet Developer Unlock Link */}
          <div className="mt-12 pt-6 border-t border-border/40 flex justify-center items-center">
            <button
              type="button"
              onClick={() => setShowAdminModal(true)}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
            >
              <Lock className="h-3 w-3" />
              <span>Developer / Admin Access</span>
            </button>
          </div>
        </div>
      </main>

      <Footer />

      {/* Admin Unlock Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-sm rounded-2xl bg-card border border-border p-6 shadow-2xl">
            <div className="flex items-center gap-2 mb-3">
              <Unlock className="h-5 w-5 text-brand" />
              <h2 className="text-lg font-bold text-foreground">Developer Preview Access</h2>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Enter developer passkey or test credentials to preview <strong>{title}</strong> while making changes.
            </p>

            <form onSubmit={handleAdminUnlock} className="space-y-4">
              <div>
                <input
                  type="password"
                  placeholder="Passkey (default: xtin)"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  autoFocus
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand"
                />
                {errorMsg && (
                  <p className="mt-1.5 text-xs text-red-500">{errorMsg}</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAdminModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-brand-fill px-4 py-2 text-xs font-semibold text-white hover:bg-brand-hover transition-colors shadow-sm"
                >
                  Unlock Preview
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComingSoonGate;
