export const dynamic = "force-dynamic";
import { businessProfile, sampleReviews } from "@/lib/data";

function renderStars(rating: number) {
  return `${"★".repeat(Math.round(rating))}${"☆".repeat(5 - Math.round(rating))}`;
}

export default function WebsitePage() {
  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
          Sito generato automaticamente
        </p>
        <h1 className="text-3xl font-bold text-slate-900">Editor sito web</h1>
        <p className="max-w-3xl text-sm leading-6 text-slate-600">
          Anteprima del sito pubblico creato per {businessProfile.name}, con testi, servizi e contatti già pronti.
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.4fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Blocchi modificabili</h2>
          <div className="mt-5 space-y-4">
            {[
              "Copertina con titolo e pulsanti",
              "Listino servizi con durata",
              "Mappa e contatti di Forlì",
              "Recensioni Google più recenti",
            ].map((section) => (
              <div key={section} className="rounded-xl border border-slate-200 p-4 text-sm text-slate-600">
                <p className="font-medium text-slate-900">{section}</p>
                <p className="mt-1">Aggiornabile con un click dal pannello.</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="rounded-[1.6rem] border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
              <span className="h-3 w-3 rounded-full bg-rose-300" />
              <span className="h-3 w-3 rounded-full bg-amber-300" />
              <span className="h-3 w-3 rounded-full bg-emerald-300" />
              <span className="ml-3 rounded-full bg-slate-100 px-3 py-1">barbieredamarco.it</span>
            </div>

            <div className="mt-4 overflow-hidden rounded-[1.8rem] border border-slate-200 bg-white">
              <div className="bg-gradient-to-br from-amber-50 via-white to-orange-50 px-8 py-10">
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                  Bottega digitale attiva
                </span>
                <h2 className="mt-5 text-3xl font-bold text-slate-900">
                  {businessProfile.name}
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
                  Tagli puliti, barba precisa e prenotazione online in pochi secondi, nel cuore di Forlì.
                </p>
                <div className="mt-6 flex flex-wrap gap-3 text-sm font-medium">
                  <span className="rounded-full bg-slate-900 px-4 py-2 text-white">Prenota ora</span>
                  <span className="rounded-full border border-slate-300 px-4 py-2 text-slate-700">Chiama il negozio</span>
                </div>
              </div>

              <div className="grid gap-6 px-8 py-8 lg:grid-cols-[1.1fr_0.9fr]">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Servizi più richiesti</h3>
                  <div className="mt-4 space-y-3">
                    {businessProfile.services.map((service) => (
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
                    <p className="mt-2">{businessProfile.address}</p>
                    <p className="mt-1">{businessProfile.phone}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                    <p className="font-medium text-slate-900">Recensioni Google</p>
                    <p className="mt-2 text-lg text-amber-500">{renderStars(4.8)}</p>
                    <p className="mt-1">{sampleReviews[0].comment}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
