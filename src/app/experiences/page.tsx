export const dynamic = "force-dynamic";
import Link from "next/link";
import { getMoonshotWorkspace } from "@/lib/moonshot-lab";

export default async function ExperiencesPage() {
  const workspace = await getMoonshotWorkspace();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <section className="rounded-3xl border border-sky-200 bg-gradient-to-br from-sky-50 via-white to-amber-50 p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">
          Tourism concierge
        </p>
        <h1 className="mt-2 text-4xl font-bold text-slate-900">
          Esperienze di distretto pronte da prenotare
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          Prototipo pubblico del layer che trasforma Bottega Digitale in una destination-commerce platform:
          itinerari, bundle e narrazione coordinata di botteghe, cibo e rituali locali.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/marketplace"
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Vai al marketplace
          </Link>
          <Link
            href="/directory"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Esplora le botteghe
          </Link>
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-3">
        {workspace.tourismConcierge.itineraries.map((itinerary) => (
          <article key={itinerary.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-sky-700">
                {itinerary.persona}
              </p>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                {itinerary.duration}
              </span>
            </div>
            <h2 className="mt-3 text-xl font-semibold text-slate-900">{itinerary.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{itinerary.promise}</p>
            <div className="mt-5 space-y-2">
              {itinerary.stops.map((stop, index) => (
                <div key={`${itinerary.id}-${stop}`} className="flex items-start gap-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
                  <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-700">
                    {index + 1}
                  </span>
                  <span>{stop}</span>
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Perché questo conta</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {workspace.tourismConcierge.demandSignals.map((signal) => (
            <div key={signal} className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              {signal}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
