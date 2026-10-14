// A small (i) button that explains a term or number in plain words. Opens on
// hover for mouse users and on tap/click everywhere else (so it works on
// phones), and closes on Escape or an outside click.
import * as React from "react";
import { Info } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface InfoTipProps {
  /** Short heading shown in bold at the top of the card. */
  title?: string;
  /** The explanation: text or any JSX (lists, tables). */
  children: React.ReactNode;
  className?: string;
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  /** Width of the card, as a Tailwind width class. */
  widthClass?: string;
  label?: string;
}

export function InfoTip({ title, children, className, side = "bottom", align = "start", widthClass = "w-72", label = "More info" }: InfoTipProps) {
  const [open, setOpen] = React.useState(false);
  const closeTimer = React.useRef<number>();

  const pointerType = React.useRef("keyboard");
  const reduceMotion = useReducedMotion();

  const hoverOpen = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    window.clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const hoverClose = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    closeTimer.current = window.setTimeout(() => setOpen(false), 120);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={label}
          onPointerEnter={hoverOpen}
          onPointerLeave={hoverClose}
          onPointerDown={(e) => {
            pointerType.current = e.pointerType;
          }}
          onClick={(e) => {
            // A mouse click lands after hover already opened the card; keep it open
            // instead of letting the default toggle close it. Touch and keyboard toggle.
            e.preventDefault();
            window.clearTimeout(closeTimer.current);
            setOpen((o) => (pointerType.current === "mouse" ? true : !o));
            pointerType.current = "keyboard";
          }}
          className={cn(
            "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-brand focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 align-middle",
            className,
          )}
        >
          <Info className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side={side}
        align={align}
        onPointerEnter={hoverOpen}
        onPointerLeave={hoverClose}
        onOpenAutoFocus={(e) => e.preventDefault()}
        className={cn("max-w-[calc(100vw-2rem)] p-3 text-xs leading-relaxed font-normal normal-case tracking-normal text-left", widthClass)}
      >
        {/* Card motion from SmoothUI's rich popover: a short spring in from a soft blur. */}
        <motion.div
          initial={reduceMotion ? false : { filter: "blur(6px)", opacity: 0, scale: 0.96, y: 4 }}
          animate={{ filter: "blur(0px)", opacity: 1, scale: 1, y: 0 }}
          transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 30 }}
        >
          {title && <p className="mb-1 text-sm font-semibold text-foreground">{title}</p>}
          <div className="space-y-1.5 text-muted-foreground">{children}</div>
        </motion.div>
      </PopoverContent>
    </Popover>
  );
}

export default InfoTip;
