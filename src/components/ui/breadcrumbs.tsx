"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LABEL_MAP: Record<string, string> = {
  dashboard: "Dashboard",
  bookings: "Prenotazioni",
  customers: "Clienti",
  website: "Sito web",
  reviews: "Recensioni",
  whatsapp: "WhatsApp",
  social: "Social AI",
  queue: "Coda",
  loyalty: "Fedeltà",
  analytics: "Analisi",
  automations: "Automazioni",
  jobs: "Attività programmate",
  advisor: "Consigliere AI",
  moonshot: "Moonshot Lab",
  staff: "Team",
  invoices: "Fatturazione",
  network: "Rete",
  products: "Prodotti",
  payments: "Pagamenti",
  notifications: "Notifiche",
  billing: "Abbonamento",
  settings: "Impostazioni",
  media: "Media",
  onboarding: "Onboarding",
  privacy: "Privacy",
};

function labelFor(segment: string): string {
  return LABEL_MAP[segment] ?? segment.charAt(0).toUpperCase() + segment.slice(1);
}

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length <= 1) return null;

  const crumbs = segments.map((segment, index) => ({
    label: labelFor(segment),
    href: "/" + segments.slice(0, index + 1).join("/"),
  }));

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-slate-500">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <li key={crumb.href} className="flex items-center gap-1">
              {index > 0 && (
                <span aria-hidden="true" className="text-slate-300">/</span>
              )}
              {isLast ? (
                <span aria-current="page" className="font-medium text-slate-900">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="hover:text-amber-700 transition-colors"
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
