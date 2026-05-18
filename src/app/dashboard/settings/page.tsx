import Link from "next/link";

interface SettingsSection {
  heading: string;
  items: Array<{
    icon: string;
    label: string;
    description: string;
    href: string;
    external?: boolean;
  }>;
}

const SETTINGS_SECTIONS: SettingsSection[] = [
  {
    heading: "Profilo attività",
    items: [
      {
        icon: "🖥️",
        label: "Sito web e profilo",
        description: "Nome, descrizione, orari, template sito e pubblicazione.",
        href: "/dashboard/website",
      },
      {
        icon: "📋",
        label: "Servizi e prezzi",
        description: "Aggiungi, modifica o rimuovi i servizi offerti e i relativi prezzi.",
        href: "/dashboard/products",
      },
      {
        icon: "👥",
        label: "Team e staff",
        description: "Gestisci i collaboratori e i relativi permessi.",
        href: "/dashboard/staff",
      },
    ],
  },
  {
    heading: "Canali e comunicazione",
    items: [
      {
        icon: "💬",
        label: "WhatsApp e AI",
        description: "Configura il chatbot, le FAQ automatiche e i promemoria WhatsApp.",
        href: "/dashboard/whatsapp",
      },
      {
        icon: "🔔",
        label: "Notifiche",
        description: "Scegli quando e come ricevere avvisi per prenotazioni e messaggi.",
        href: "/dashboard/notifications",
      },
    ],
  },
  {
    heading: "Privacy e sicurezza",
    items: [
      {
        icon: "🔒",
        label: "Privacy e GDPR",
        description: "Gestisci i consensi, esporta o elimina i dati dei clienti.",
        href: "/dashboard/privacy",
      },
    ],
  },
  {
    heading: "Abbonamento e fatturazione",
    items: [
      {
        icon: "💰",
        label: "Piano e abbonamento",
        description: "Visualizza il piano attivo, gestisci il pagamento o fai l'upgrade.",
        href: "/dashboard/billing",
      },
      {
        icon: "💳",
        label: "Pagamenti ricevuti",
        description: "Storico delle transazioni e dei pagamenti incassati.",
        href: "/dashboard/payments",
      },
    ],
  },
  {
    heading: "Integrazione e API",
    items: [
      {
        icon: "🔑",
        label: "Chiavi API",
        description: "Genera e revoca le chiavi API per integrazioni di terze parti.",
        href: "/dashboard/settings/api",
      },
      {
        icon: "🛠️",
        label: "Portale sviluppatori",
        description: "Documentazione OpenAPI, webhook e riferimento completo alle API.",
        href: "/developers",
        external: true,
      },
    ],
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-10">
      <section className="flex flex-col gap-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
          Configurazione
        </p>
        <h1 className="text-3xl font-bold text-slate-900">Impostazioni</h1>
        <p className="max-w-2xl text-sm leading-6 text-slate-600">
          Configura il profilo della tua attività, i canali di comunicazione, la privacy e le integrazioni.
        </p>
      </section>

      {SETTINGS_SECTIONS.map((section) => (
        <section key={section.heading}>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            {section.heading}
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {section.items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="group flex h-full items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-amber-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-1"
                >
                  <span className="shrink-0 text-2xl" aria-hidden="true">
                    {item.icon}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 group-hover:text-amber-700">
                      {item.label}
                      {item.external && (
                        <span className="ml-1 text-xs font-normal text-slate-400">↗</span>
                      )}
                    </p>
                    <p className="mt-0.5 text-sm leading-5 text-slate-500">{item.description}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
