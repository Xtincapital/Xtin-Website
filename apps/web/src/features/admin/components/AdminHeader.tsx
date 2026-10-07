// Top bar on every admin page: back to the hub, and a tab per admin page.
import { Link, NavLink } from "react-router-dom";
import { ArrowLeft, LayoutGrid } from "lucide-react";
import { ADMIN_PAGES } from "../adminPages";

export default function AdminHeader() {
  const tab = ({ isActive }: { isActive: boolean }) =>
    `whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition ${
      isActive ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
    }`;
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5 sm:px-6">
        <Link to="/dashboard" className="inline-flex shrink-0 items-center gap-1 text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white" title="Back to the site">
          <ArrowLeft size={14} /> <span className="hidden sm:inline">Site</span>
        </Link>
        <span className="h-5 w-px shrink-0 bg-slate-200 dark:bg-slate-800" aria-hidden="true" />
        <nav aria-label="Admin pages" className="-mx-1 flex min-w-0 items-center gap-1 overflow-x-auto px-1">
          <NavLink to="/admin" end className={tab}>
            <span className="inline-flex items-center gap-1.5"><LayoutGrid size={14} /> Admin</span>
          </NavLink>
          {ADMIN_PAGES.map((p) => (
            <NavLink key={p.to} to={p.to} className={tab}>
              {p.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
