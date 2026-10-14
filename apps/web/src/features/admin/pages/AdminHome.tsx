// /admin — one place for every admin page.
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import SEO from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import AdminHeader from "../components/AdminHeader";
import { ADMIN_PAGES } from "../adminPages";

export default function AdminHome() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <SEO title="Admin — Xtin Capital" noIndex />
      <AdminHeader />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <h1 className="xt-title">Admin</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Signed in as {user?.email}</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {ADMIN_PAGES.map(({ to, label, blurb, Icon }) => (
            <Link
              key={to}
              to={to}
              className="group flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-5 transition hover:border-emerald-500 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                <Icon size={20} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2 font-semibold">
                  {label} <ArrowRight size={16} className="text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-emerald-600" />
                </span>
                <span className="mt-1 block text-sm text-slate-500 dark:text-slate-400">{blurb}</span>
              </span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
