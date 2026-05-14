"use client";

import type { ReactNode } from "react";
import type { SidebarSection } from "@/components/dashboard";
import { DashboardShell } from "@/components/dashboard";
import type { CommandItem } from "@/components/command-palette";

const sections: SidebarSection[] = [
  {
    key: "home",
    items: [
      {
        label: "Panoramica",
        href: "/dashboard",
        icon: <span aria-hidden="true">🏠</span>,
      },
    ],
  },
  {
    key: "gestione",
    label: "Gestione",
    items: [
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
        label: "Prodotti",
        href: "/dashboard/products",
        icon: <span aria-hidden="true">🛍️</span>,
      },
      {
        label: "Coda",
        href: "/dashboard/queue",
        icon: <span aria-hidden="true">🎟️</span>,
      },
      {
        label: "Team",
        href: "/dashboard/staff",
        icon: <span aria-hidden="true">👥</span>,
      },
      {
        label: "Operaio",
        href: "/dashboard/jobs",
        icon: <span aria-hidden="true">⏰</span>,
      },
    ],
  },
  {
    key: "marketing",
    label: "Marketing",
    items: [
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
        label: "Fedeltà",
        href: "/dashboard/loyalty",
        icon: <span aria-hidden="true">🏷️</span>,
      },
      {
        label: "Rete",
        href: "/dashboard/network",
        icon: <span aria-hidden="true">🤝</span>,
      },
    ],
  },
  {
    key: "finanza",
    label: "Finanza",
    items: [
      {
        label: "Fatturazione",
        href: "/dashboard/invoices",
        icon: <span aria-hidden="true">🧾</span>,
      },
      {
        label: "Pagamenti",
        href: "/dashboard/payments",
        icon: <span aria-hidden="true">💳</span>,
      },
      {
        label: "Abbonamento",
        href: "/dashboard/billing",
        icon: <span aria-hidden="true">💰</span>,
      },
      {
        label: "Analisi",
        href: "/dashboard/analytics",
        icon: <span aria-hidden="true">📊</span>,
      },
    ],
  },
  {
    key: "avanzato",
    label: "Avanzato",
    items: [
      {
        label: "Automazioni",
        href: "/dashboard/automations",
        icon: <span aria-hidden="true">⚡</span>,
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
        label: "Notifiche",
        href: "/dashboard/notifications",
        icon: <span aria-hidden="true">🔔</span>,
      },
    ],
  },
];

// Quick-action items surfaced in the command palette for common tasks
const quickActions: CommandItem[] = [
  {
    id: "action-nuova-prenotazione",
    label: "Nuova prenotazione",
    href: "/dashboard/bookings",
    section: "Azioni rapide",
    keywords: ["crea", "aggiungi", "appuntamento", "nuovo", "booking"],
    icon: <span aria-hidden="true">➕</span>,
  },
  {
    id: "action-riepilogo",
    label: "Riepilogo del giorno",
    href: "/dashboard",
    section: "Azioni rapide",
    keywords: ["briefing", "sommario", "oggi", "giornata", "daily"],
    icon: <span aria-hidden="true">📋</span>,
  },
  {
    id: "action-impostazioni",
    label: "Impostazioni negozio",
    href: "/dashboard/settings",
    section: "Azioni rapide",
    keywords: ["settings", "configurazione", "profilo", "negozio"],
    icon: <span aria-hidden="true">⚙️</span>,
  },
  {
    id: "action-privacy",
    label: "Privacy e GDPR",
    href: "/dashboard/privacy",
    section: "Azioni rapide",
    keywords: ["gdpr", "consenso", "dati", "privacy", "export"],
    icon: <span aria-hidden="true">🔒</span>,
  },
  {
    id: "action-media",
    label: "Libreria media",
    href: "/dashboard/media",
    section: "Azioni rapide",
    keywords: ["foto", "immagini", "upload", "media", "galleria"],
    icon: <span aria-hidden="true">🖼️</span>,
  },
  {
    id: "action-onboarding",
    label: "Guida introduttiva",
    href: "/dashboard/onboarding",
    section: "Azioni rapide",
    keywords: ["setup", "guida", "iniziare", "tutorial", "onboarding"],
    icon: <span aria-hidden="true">🎓</span>,
  },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardShell brand="Bottega Digitale" sections={sections} extraCommandItems={quickActions}>
      {children}
    </DashboardShell>
  );
}
