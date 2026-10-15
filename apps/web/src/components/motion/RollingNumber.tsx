import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

// Odometer-style number: each digit rolls into place on mount and whenever the
// value changes. Non-digit characters (₹, commas, %, signs) stay still. Pure
// CSS transforms (see .xt-odo in index.css), so it costs nothing at runtime
// and is switched off for people who prefer reduced motion.
export default function RollingNumber({ value, className }: { value: string; className?: string }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setReady(true)));
    return () => cancelAnimationFrame(id);
  }, []);

  let digitIndex = 0;
  return (
    <span className={cn("xt-odo", ready && "xt-odo-run", className)} aria-label={value}>
      {[...value].map((ch, i) =>
        /\d/.test(ch) ? (
          <span key={i} className="xt-odo-col" aria-hidden="true">
            <span className="xt-odo-strip" style={{ ["--n" as string]: ch, ["--d" as string]: `${digitIndex++ * 40}ms` }}>
              {"0123456789".split("").map((d) => (
                <span key={d}>{d}</span>
              ))}
            </span>
          </span>
        ) : (
          <span key={i} aria-hidden="true" className={ch === "₹" ? "xt-odo-currency" : undefined}>
            {ch}
          </span>
        ),
      )}
    </span>
  );
}
