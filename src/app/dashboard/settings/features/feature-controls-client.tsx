"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CopyLinkButton } from "@/components/ui/copy-link-button";
import { InlineMessage } from "@/components/ui/feedback";
import { useToast } from "@/components/ui/toast-provider";

interface CapabilityState {
  websitePublished: boolean;
  queueEnabled: boolean;
  avgServiceMinutes: number;
  loyaltyEnabled: boolean;
  onlineBookingEnabled: boolean;
  crossPromoEnabled: boolean;
  whatsappAiEnabled: boolean;
  catalogEnabled: boolean;
  depositsEnabled: boolean;
  depositPercentage: number;
}

interface CapabilityCardConfig {
  key: keyof CapabilityState;
  title: string;
  description: string;
  href: string;
  hrefLabel: string;
  publicUrl?: string;
  publicLabel?: string;
  note?: string;
}

const STATUS_STYLES = {
  active: "bg-emerald-100 text-emerald-700",
  inactive: "bg-slate-100 text-slate-500",
} as const;

export function FeatureControlsClient({
  business,
}: {
  business: {
    id: string;
    slug: string;
    name: string;
    stripeConnectAccountId: string | null;
  } & CapabilityState;
}) {
  const { notify } = useToast();
  const [form, setForm] = useState<CapabilityState>({
    websitePublished: business.websitePublished,
    queueEnabled: business.queueEnabled,
    avgServiceMinutes: business.avgServiceMinutes,
    loyaltyEnabled: business.loyaltyEnabled,
    onlineBookingEnabled: business.onlineBookingEnabled,
    crossPromoEnabled: business.crossPromoEnabled,
    whatsappAiEnabled: business.whatsappAiEnabled,
    catalogEnabled: business.catalogEnabled,
    depositsEnabled: business.depositsEnabled,
    depositPercentage: business.depositPercentage,
  });
  const [savedSnapshot, setSavedSnapshot] = useState(form);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const capabilityCards = useMemo<CapabilityCardConfig[]>(() => [
    {
      key: "websitePublished",
      title: "Sito pubblico",
      description: "Pubblica o rimetti offline il profilo pubblico principale della bottega.",
      href: "/dashboard/website",
      hrefLabel: "Apri editor sito",
      publicUrl: `/s/${business.slug}`,
      publicLabel: "Vetrina pubblica",
    },
    {
      key: "onlineBookingEnabled",
      title: "Prenotazioni online",
      description: "Abilita il widget pubblico per ricevere appuntamenti dal sito e dai link diretti.",
      href: "/dashboard/bookings",
      hrefLabel: "Apri agenda",
      publicUrl: `/book/${business.slug}`,
      publicLabel: "Link prenotazioni",
    },
    {
      key: "catalogEnabled",
      title: "Catalogo e shop",
      description: "Attiva la vetrina prodotti e gli ordini collegati allo shop pubblico.",
      href: "/dashboard/products",
      hrefLabel: "Gestisci catalogo",
      publicUrl: `/shop/${business.slug}`,
      publicLabel: "Link shop",
    },
    {
      key: "queueEnabled",
      title: "Coda walk-in",
      description: "Consenti il check-in autonomo dei clienti e il monitoraggio della coda in tempo reale.",
      href: "/dashboard/queue",
      hrefLabel: "Apri coda",
      publicUrl: `/queue/${business.id}`,
      publicLabel: "Link coda",
    },
    {
      key: "loyaltyEnabled",
      title: "Carta fedeltà",
      description: "Attiva il programma punti, il portale clienti e la gestione dei riscatti.",
      href: "/dashboard/loyalty",
      hrefLabel: "Apri loyalty",
      publicUrl: `/loyalty/${business.id}`,
      publicLabel: "Link fedeltà",
    },
    {
      key: "whatsappAiEnabled",
      title: "WhatsApp AI",
      description: "Accende il concierge automatico per FAQ, disponibilità, coda e fedeltà.",
      href: "/dashboard/whatsapp/ai",
      hrefLabel: "Configura AI",
    },
    {
      key: "depositsEnabled",
      title: "Acconti e depositi",
      description: "Permette di richiedere acconti sulle prenotazioni e mostra i controlli deposito.",
      href: "/dashboard/payments",
      hrefLabel: "Apri pagamenti",
      note: business.stripeConnectAccountId ? undefined : "Collega Stripe Connect prima di attivare gli acconti.",
    },
    {
      key: "crossPromoEnabled",
      title: "Rete e cross-promo",
      description: "Abilita partnership, voucher e campagne condivise nel network locale.",
      href: "/dashboard/network",
      hrefLabel: "Apri network",
    },
  ], [business.id, business.slug, business.stripeConnectAccountId]);

  const isDirty = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(savedSnapshot),
    [form, savedSnapshot],
  );

  useEffect(() => {
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      if (!isDirty) return;
      event.preventDefault();
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  async function saveChanges() {
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/business-capabilities", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || "Impossibile salvare le impostazioni");
      }

      const nextState: CapabilityState = {
        websitePublished: data.websitePublished,
        queueEnabled: data.queueEnabled,
        avgServiceMinutes: data.avgServiceMinutes,
        loyaltyEnabled: data.loyaltyEnabled,
        onlineBookingEnabled: data.onlineBookingEnabled,
        crossPromoEnabled: data.crossPromoEnabled,
        whatsappAiEnabled: data.whatsappAiEnabled,
        catalogEnabled: data.catalogEnabled,
        depositsEnabled: data.depositsEnabled,
        depositPercentage: data.depositPercentage,
      };

      setForm(nextState);
      setSavedSnapshot(nextState);
      notify({ tone: "success", title: "Moduli aggiornati", description: "Le impostazioni operative della bottega sono state salvate." });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Impossibile salvare le impostazioni");
    } finally {
      setSaving(false);
    }
  }

  function setToggle(key: keyof CapabilityState, value: boolean) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-sky-200 bg-gradient-to-br from-sky-50 via-white to-indigo-50 p-8 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">Moduli attivi</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">Controllo funzionalità</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Decidi quali moduli sono attivi per <strong>{business.name}</strong>, controlla i link pubblici e allinea la dashboard con ciò che i clienti possono davvero usare.
            </p>
          </div>
          <div className="rounded-2xl border border-white/80 bg-white/90 px-4 py-3 text-sm text-slate-600 shadow-sm">
            <p className="font-semibold text-slate-900">Stato operativo</p>
            <p>{capabilityCards.filter((item) => Boolean(form[item.key])).length} moduli attivi su {capabilityCards.length}</p>
          </div>
        </div>
      </section>

      <p role="alert" aria-live="assertive" aria-atomic="true" className="sr-only">{error}</p>
      {error ? <InlineMessage tone="error" title={error} silent /> : null}

      <section className="grid gap-4 xl:grid-cols-2">
        {capabilityCards.map((item) => {
          const enabled = Boolean(form[item.key]);
          return (
            <article key={item.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-lg font-semibold text-slate-900">{item.title}</h2>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${enabled ? STATUS_STYLES.active : STATUS_STYLES.inactive}`}>
                      {enabled ? "Attivo" : "Disattivato"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                  {item.note ? <p className="mt-2 text-xs font-medium text-amber-700">{item.note}</p> : null}
                </div>
                <label className="inline-flex items-center gap-3 rounded-full bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(event) => setToggle(item.key, event.target.checked)}
                    className="h-4 w-4"
                  />
                  {enabled ? "Modulo attivo" : "Attiva modulo"}
                </label>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href={item.href}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-1"
                >
                  {item.hrefLabel}
                </Link>
                {item.publicUrl ? (
                  <>
                    <CopyLinkButton url={item.publicUrl} label={item.publicLabel ? `Copia ${item.publicLabel.toLowerCase()}` : "Copia link"} />
                    <a
                      href={item.publicUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-1"
                    >
                      Anteprima ↗
                    </a>
                  </>
                ) : null}
              </div>
            </article>
          );
        })}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Parametri operativi</h2>
          <p className="mt-1 text-sm text-slate-500">Regola i valori che influenzano l&apos;esperienza cliente e la monetizzazione.</p>
          <div className="mt-6 grid gap-4">
            <label htmlFor="avg-service-minutes" className="block text-sm font-medium text-slate-700">
              Minuti medi per servizio in coda
              <input
                id="avg-service-minutes"
                type="number"
                min={5}
                max={180}
                value={form.avgServiceMinutes}
                onChange={(event) => setForm((current) => ({ ...current, avgServiceMinutes: Number(event.target.value) || 5 }))}
                className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
              />
            </label>
            <label htmlFor="deposit-percentage" className="block text-sm font-medium text-slate-700">
              Percentuale acconto
              <input
                id="deposit-percentage"
                type="number"
                min={5}
                max={100}
                value={form.depositPercentage}
                onChange={(event) => setForm((current) => ({ ...current, depositPercentage: Number(event.target.value) || 5 }))}
                className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
              />
            </label>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Dipendenze e attenzione</h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
            <li><strong>Prenotazioni online</strong> richiedono servizi configurati e link pubblicato.</li>
            <li><strong>Catalogo</strong> ha più valore quando lo shop pubblico è alimentato da prodotti reali.</li>
            <li><strong>Acconti</strong> funzionano al meglio con Stripe Connect collegato e percentuale coerente.</li>
            <li><strong>WhatsApp AI</strong> rende di più se booking, loyalty o queue sono attivi e aggiornati.</li>
          </ul>
          <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
            <p className="font-semibold text-slate-900">Stripe Connect</p>
            <p className="mt-1">{business.stripeConnectAccountId ? "Collegato" : "Non ancora collegato"}</p>
            <Link href="/dashboard/payments" className="mt-3 inline-flex rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Apri pagamenti
            </Link>
          </div>
        </div>
      </section>

      <section className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void saveChanges()}
          disabled={saving || !isDirty}
          className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {saving ? "Salvataggio..." : "Salva configurazione"}
        </button>
        {!saving && !isDirty ? <span className="text-xs text-slate-400">Tutto allineato ✓</span> : null}
        {isDirty ? <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">Modifiche non salvate</span> : null}
      </section>
    </div>
  );
}
