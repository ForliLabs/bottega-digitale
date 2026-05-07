"use client";

import Link from "next/link";
import { useState } from "react";
import { InlineMessage } from "@/components/ui/feedback";
import { useToast } from "@/components/ui/toast-provider";

interface ServicePreview {
  name: string;
  duration: string;
  price: string;
}

export function WebsiteEditorClient({
  initialState,
  services,
  sampleReview,
}: {
  initialState: {
    name: string;
    slug: string;
    description: string;
    address: string;
    phone: string;
    email: string;
    websitePublished: boolean;
    websiteTemplate: string;
  };
  services: ServicePreview[];
  sampleReview: string;
}) {
  const { notify } = useToast();
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function saveChanges(publishOverride?: boolean) {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/website/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          publish: publishOverride ?? form.websitePublished,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || "Impossibile salvare il sito");
      }

      setForm((current) => ({ ...current, websitePublished: data.published }));
      notify({ tone: "success", title: data.published ? "Sito aggiornato e pubblicato" : "Sito aggiornato" });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Impossibile salvare il sito");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">Sito generato automaticamente</p>
        <h1 className="text-3xl font-bold text-slate-900">Editor sito web</h1>
        <p className="max-w-3xl text-sm leading-6 text-slate-600">
          Aggiorna i contenuti principali della vetrina pubblica, scegli il template e pubblica subito il sito online.
        </p>
      </section>

      {error ? <InlineMessage tone="error" title={error} /> : null}

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.4fr]">
        <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Contenuti modificabili</h2>
            <p className="mt-1 text-sm text-slate-500">Le modifiche aggiornano direttamente la pagina pubblica.</p>
          </div>

          <label className="block text-sm font-medium text-slate-700">
            Template sito
            <select
              value={form.websiteTemplate}
              onChange={(event) => setForm((current) => ({ ...current, websiteTemplate: event.target.value }))}
              className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
            >
              <option value="default">Editoriale chiaro</option>
              <option value="warm">Warm bottega</option>
              <option value="minimal">Minimal catalogo</option>
            </select>
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Testo hero
            <textarea
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              rows={4}
              className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Telefono CTA
            <input
              value={form.phone}
              onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
              className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Email contatto
            <input
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Indirizzo
            <input
              value={form.address}
              onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))}
              className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
            />
          </label>

          <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
            <p className="font-medium text-slate-900">Azioni rapide</p>
            <div className="mt-3 grid gap-2">
              <Link href="/dashboard/media" className="rounded-xl border border-slate-200 bg-white px-3 py-2 font-medium text-slate-700 hover:bg-slate-50">Aggiorna foto e logo</Link>
              <Link href="/dashboard/products" className="rounded-xl border border-slate-200 bg-white px-3 py-2 font-medium text-slate-700 hover:bg-slate-50">Modifica catalogo e servizi</Link>
              <Link href="/dashboard/reviews" className="rounded-xl border border-slate-200 bg-white px-3 py-2 font-medium text-slate-700 hover:bg-slate-50">Gestisci recensioni</Link>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => saveChanges(form.websitePublished)}
              disabled={loading}
              className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {loading ? "Salvataggio..." : "Salva modifiche"}
            </button>
            <button
              type="button"
              onClick={() => saveChanges(!form.websitePublished)}
              disabled={loading}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              {form.websitePublished ? "Metti offline" : "Pubblica sito"}
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="rounded-[1.6rem] border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
              <span className="h-3 w-3 rounded-full bg-rose-300" />
              <span className="h-3 w-3 rounded-full bg-amber-300" />
              <span className="h-3 w-3 rounded-full bg-emerald-300" />
              <span className="ml-3 rounded-full bg-slate-100 px-3 py-1">{form.slug}.bottegadigitale.it</span>
              <span className={`ml-auto rounded-full px-3 py-1 text-xs font-semibold ${form.websitePublished ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{form.websitePublished ? "Online" : "Bozza"}</span>
            </div>

            <div className="mt-4 overflow-hidden rounded-[1.8rem] border border-slate-200 bg-white">
              <div className="bg-gradient-to-br from-amber-50 via-white to-orange-50 px-8 py-10">
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">Template {form.websiteTemplate}</span>
                <h2 className="mt-5 text-3xl font-bold text-slate-900">{form.name}</h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">{form.description}</p>
                <div className="mt-6 flex flex-wrap gap-3 text-sm font-medium">
                  <span className="rounded-full bg-slate-900 px-4 py-2 text-white">Prenota ora</span>
                  <span className="rounded-full border border-slate-300 px-4 py-2 text-slate-700">Chiama {form.phone}</span>
                </div>
              </div>

              <div className="grid gap-6 px-8 py-8 lg:grid-cols-[1.1fr_0.9fr]">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Servizi in evidenza</h3>
                  <div className="mt-4 space-y-3">
                    {services.map((service) => (
                      <div key={service.name} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm">
                        <div>
                          <p className="font-medium text-slate-900">{service.name}</p>
                          <p className="text-slate-500">{service.duration}</p>
                        </div>
                        <span className="font-semibold text-slate-900">{service.price}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                    <p className="font-medium text-slate-900">Dove siamo</p>
                    <p className="mt-2">{form.address}</p>
                    <p className="mt-1">{form.phone}</p>
                    <p className="mt-1">{form.email}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                    <p className="font-medium text-slate-900">Recensioni Google</p>
                    <p className="mt-2">{sampleReview}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Link href={`/s/${form.slug}`} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Apri anteprima pubblica
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
