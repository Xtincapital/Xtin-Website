// "Xtin Journal" / "Xtin Gini" / "Xtin FundaKaMental": the product wordmark
// shown at the top left of each product's dashboard.
import { Link } from "react-router-dom";

export default function ProductBrand({ to, name, className = "" }: { to: string; name: string; className?: string }) {
  return (
    <Link to={to} aria-label={`Xtin ${name} home`} className={`inline-flex items-center gap-1 text-[13px] font-semibold leading-tight tracking-[0.01em] no-underline ${className}`}>
      <span className="text-foreground">Xtin</span>
      <span className="text-primary dark:text-success">{name}</span>
    </Link>
  );
}
