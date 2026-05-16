import { cn } from "@/lib/utils";

interface PricingTier {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
  highlighted?: boolean;
}

interface PricingSectionProps {
  title: string;
  subtitle?: string;
  tiers: PricingTier[];
}

export function PricingSection({ title, subtitle, tiers }: PricingSectionProps) {
  return (
    <section className="bg-gray-50 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-4 text-lg text-gray-600">{subtitle}</p>
          )}
        </div>
        <div className="mx-auto mt-12 grid max-w-5xl gap-8 lg:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={cn(
                "flex flex-col rounded-2xl border bg-white p-8 shadow-sm",
                tier.highlighted
                  ? "border-amber-500 ring-2 ring-amber-500"
                  : "border-gray-200"
              )}
            >
              {tier.highlighted && (
                <div className="mb-3 -mt-2">
                  <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                    ✦ Piano consigliato
                  </span>
                </div>
              )}
              <h3 className="text-lg font-semibold text-gray-900">{tier.name}</h3>
              <p className="mt-2 text-sm text-gray-500">{tier.description}</p>
              <div className="mt-6">
                <span className="text-4xl font-bold text-gray-900">{tier.price}</span>
                {tier.period && (
                  <span className="text-sm text-gray-500">/{tier.period}</span>
                )}
              </div>
              <ul className="mt-8 flex-1 space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-gray-600">
                    <svg
                      className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <a
                href={tier.ctaHref}
                className={cn(
                  "mt-8 block rounded-lg px-4 py-3 text-center text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2",
                  tier.highlighted
                    ? "bg-amber-500 text-white hover:bg-amber-600 focus-visible:outline-amber-500"
                    : "border border-gray-300 text-gray-700 hover:bg-gray-50 focus-visible:outline-gray-500"
                )}
              >
                {tier.ctaLabel}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
