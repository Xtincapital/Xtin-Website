// "Xtin Journal" / "Xtin Gini" / "Xtin FundaKaMental": the product wordmark
// shown at the top left of each product's dashboard.
import { Link } from "react-router-dom";

export default function ProductBrand({ to, name, className = "", size = "sm" }: { to: string; name: string; className?: string; size?: "sm" | "lg" }) {
  const sizing = size === "lg" ? "gap-1.5 text-2xl font-bold tracking-[-0.02em]" : "gap-1 text-sm font-semibold tracking-[0.01em]";
  return (
    <Link to={to} aria-label={`Xtin ${name} home`} className={`inline-flex items-center leading-tight no-underline ${sizing} ${className}`}>
      <span className="text-foreground">Xtin</span>
      <span className="text-brand dark:text-brand">{name}</span>
    </Link>
  );
}
