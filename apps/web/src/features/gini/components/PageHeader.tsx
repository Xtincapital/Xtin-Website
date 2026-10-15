// Shared Gini page header: product wordmark with a live dot, site title,
// muted subtitle, optional gold PRO tag and right-hand actions.
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import ProductBrand from "@/components/ProductBrand";
import { cn } from "@/lib/utils";
import { PRO_TAG } from "../lib/ui";

interface Props {
  title: ReactNode;
  subtitle?: ReactNode;
  pro?: boolean;
  actions?: ReactNode;
  /** Optional icon shown before the title. */
  icon?: ReactNode;
  className?: string;
}

export default function PageHeader({ title, subtitle, pro, actions, icon, className }: Props) {
  return (
    <motion.header
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn("mb-8 flex flex-wrap items-end justify-between gap-4", className)}
    >
      <div className="min-w-0">
        <div className="mb-3 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-fill shadow-[0_0_0_4px_rgb(var(--brand)/0.15)]" aria-hidden="true" />
          <ProductBrand to="/gini" name="Gini" />
          {pro && <span className={PRO_TAG}>PRO</span>}
        </div>
        <div className="flex items-center gap-3">
          {icon}
          <h1 className="xt-title">{title}</h1>
        </div>
        {subtitle && <p className="mt-2 max-w-2xl text-base text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </motion.header>
  );
}
