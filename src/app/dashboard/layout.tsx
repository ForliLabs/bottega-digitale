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
    label: "Abbonamento",
    href: "/dashboard/billing",
    icon: <span aria-hidden="true">💳</span>,
  },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardShell brand="Bottega Digitale" items={items}>
      {children}
    </DashboardShell>
  );
}
