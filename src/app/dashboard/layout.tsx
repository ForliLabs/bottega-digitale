"use client";

import type { ReactNode } from "react";
import { DashboardShell } from "@/components/dashboard";

const items = [
  {
    label: "Panoramica",
    href: "/dashboard",
    icon: <span aria-hidden="true">🏠</span>,
  },
  {
    label: "Prenotazioni",
    href: "/dashboard/bookings",
    icon: <span aria-hidden="true">📅</span>,
  },
  {
    label: "Clienti",
    href: "/dashboard/customers",
    icon: <span aria-hidden="true">👥</span>,
  },
  {
    label: "Sito web",
    href: "/dashboard/website",
    icon: <span aria-hidden="true">🖥️</span>,
  },
  {
    label: "Recensioni",
    href: "/dashboard/reviews",
    icon: <span aria-hidden="true">⭐</span>,
  },
  {
    label: "WhatsApp",
    href: "/dashboard/whatsapp",
    icon: <span aria-hidden="true">💬</span>,
  },
  {
    label: "Social AI",
    href: "/dashboard/social",
    icon: <span aria-hidden="true">📸</span>,
  },
  {
    label: "Coda",
    href: "/dashboard/queue",
    icon: <span aria-hidden="true">🎟️</span>,
  },
  {
    label: "Fedeltà",
    href: "/dashboard/loyalty",
    icon: <span aria-hidden="true">🏷️</span>,
  },
  {
    label: "Analisi",
    href: "/dashboard/analytics",
    icon: <span aria-hidden="true">📊</span>,
  },
  {
    label: "Automazioni",
    href: "/dashboard/automations",
    icon: <span aria-hidden="true">⚡</span>,
  },
  {
    label: "Operaio",
    href: "/dashboard/jobs",
    icon: <span aria-hidden="true">⏰</span>,
  },
  {
    label: "Consigliere AI",
    href: "/dashboard/advisor",
    icon: <span aria-hidden="true">💡</span>,
  },
  {
    label: "Moonshot Lab",
    href: "/dashboard/moonshot",
    icon: <span aria-hidden="true">🚀</span>,
  },
  {
    label: "Team",
    href: "/dashboard/staff",
    icon: <span aria-hidden="true">👥</span>,
  },
  {
    label: "Fatturazione",
    href: "/dashboard/invoices",
    icon: <span aria-hidden="true">🧾</span>,
  },
  {
    label: "Rete",
    href: "/dashboard/network",
    icon: <span aria-hidden="true">🤝</span>,
  },
  {
    label: "Prodotti",
    href: "/dashboard/products",
    icon: <span aria-hidden="true">🛍️</span>,
  },
  {
    label: "Pagamenti",
    href: "/dashboard/payments",
    icon: <span aria-hidden="true">💳</span>,
  },
  {
    label: "Notifiche",
    href: "/dashboard/notifications",
    icon: <span aria-hidden="true">🔔</span>,
  },
  {
    label: "Abbonamento",
    href: "/dashboard/billing",
    icon: <span aria-hidden="true">💰</span>,
  },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardShell brand="Bottega Digitale" items={items}>
      {children}
    </DashboardShell>
  );
}
