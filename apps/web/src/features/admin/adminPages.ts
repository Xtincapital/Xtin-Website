import { Award, FileCode2, Mail, TicketPercent, type LucideIcon } from "lucide-react";

/** Every admin page. The /admin hub and the admin header both list these — add new admin pages here. */
export const ADMIN_PAGES: Array<{ to: string; label: string; blurb: string; Icon: LucideIcon }> = [
  { to: "/admin/coupons", label: "Coupons", blurb: "Create discount and free-access codes, switch them off, see who used them.", Icon: TicketPercent },
  { to: "/admin/newsletters", label: "Newsletters", blurb: "Send the pre-market and post-market editions by hand.", Icon: Mail },
  { to: "/admin/certificates", label: "Certificates", blurb: "Issue and manage Academy certificates.", Icon: Award },
  { to: "/admin/algo-applications", label: "Algo applications", blurb: "Review algo publisher applications.", Icon: FileCode2 },
];
