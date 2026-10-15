// Shared page header: product eyebrow, site title, subtitle, optional PRO tag
// and right-hand actions, over the faint grid used on Home.
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import ProductBrand from "@/components/ProductBrand";
import { PRO_TAG } from "../lib/ui";

interface Props {
  title: ReactNode;
  subtitle?: ReactNode;
  pro?: boolean;
  actions?: ReactNode;
  className?: string;
}

export default function PageHeader({ title, subtitle, pro, actions, className = "mb-8" }: Props) {
  return (
    <motion.header
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`fk-hello pt-2 flex flex-wrap items-end justify-between gap-4 ${className}`}
    >
      <div className="min-w-0">
        <ProductBrand to="/fundakamental" name="FundaKaMental" className="mb-3" />
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="xt-title">{title}</h1>
          {pro && <span className={PRO_TAG}>PRO</span>}
        </div>
        {subtitle && <p className="mt-2 max-w-2xl text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </motion.header>
  );
}
