import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-2xl bg-slate-200/70", className)} aria-hidden="true" />;
}

export function PageSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-2/3" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>
      <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-6">
        {Array.from({ length: lines }).map((_, index) => (
          <Skeleton key={index} className="h-5 w-full" />
        ))}
      </div>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white p-8 text-center shadow-sm">
      <p className="text-4xl" aria-hidden="true">{icon}</p>
      <h2 className="mt-4 text-lg font-semibold text-slate-900">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function InlineMessage({
  tone = "info",
  title,
  description,
  silent = false,
}: {
  tone?: "info" | "error" | "success";
  title: string;
  description?: string;
  /**
   * When true, suppresses the implicit ARIA role so the element is purely
   * visual. Use this when a parent component already owns an always-mounted
   * live region that announces the same message (avoids double-announcement).
   */
  silent?: boolean;
}) {
  const toneStyles = {
    info: "border-sky-200 bg-sky-50 text-sky-900",
    error: "border-red-200 bg-red-50 text-red-900",
    success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  } as const;

  const implicitRole = tone === "error" ? "alert" : "status";

  return (
    <div
      className={cn("rounded-2xl border px-4 py-3 text-sm", toneStyles[tone])}
      role={silent ? undefined : implicitRole}
    >
      <p className="font-semibold">{title}</p>
      {description ? <p className="mt-1 opacity-80">{description}</p> : null}
    </div>
  );
}

export function RetryCard({
  title,
  description,
  actionLabel = "Riprova",
  href,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  href?: string;
}) {
  return (
    <EmptyState
      icon="⚠️"
      title={title}
      description={description}
      action={href ? (
        <Link href={href} className="inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
          {actionLabel}
        </Link>
      ) : undefined}
    />
  );
}
