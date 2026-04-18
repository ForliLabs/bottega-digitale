import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

interface HeroProps {
  title: string;
  subtitle: string;
  ctaLabel?: string;
  ctaHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  children?: ReactNode;
  className?: string;
}

export function Hero({
  title,
  subtitle,
  ctaLabel,
  ctaHref,
  secondaryLabel,
  secondaryHref,
  children,
  className,
}: HeroProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-20 sm:py-28 lg:py-32",
        className
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 sm:text-xl">
            {subtitle}
          </p>
          {(ctaLabel || secondaryLabel) && (
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              {ctaLabel && ctaHref && (
                <a
                  href={ctaHref}
                  className="rounded-xl bg-blue-600 px-8 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  {ctaLabel}
                </a>
              )}
              {secondaryLabel && secondaryHref && (
                <a
                  href={secondaryHref}
                  className="rounded-xl border border-gray-300 bg-white px-8 py-3.5 text-base font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
                >
                  {secondaryLabel}
                </a>
              )}
            </div>
          )}
          {children}
        </div>
      </div>
    </section>
  );
}
