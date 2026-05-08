import { cn } from "@/lib/utils";

type BadgeTone = "success" | "warning" | "error" | "info" | "neutral";

const TONE_STYLES: Record<BadgeTone, string> = {
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  error: "bg-red-100 text-red-700",
  info: "bg-sky-100 text-sky-700",
  neutral: "bg-slate-100 text-slate-600",
};

const SR_LABELS: Record<BadgeTone, string> = {
  success: "Stato: attivo",
  warning: "Stato: in attesa",
  error: "Stato: errore",
  info: "Stato: informazione",
  neutral: "Stato: neutro",
};

interface StatusBadgeProps {
  tone: BadgeTone;
  label: string;
  srLabel?: string;
  className?: string;
}

export function StatusBadge({ tone, label, srLabel, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
        TONE_STYLES[tone],
        className,
      )}
    >
      <span className="sr-only">{srLabel ?? SR_LABELS[tone]} — </span>
      {label}
    </span>
  );
}
