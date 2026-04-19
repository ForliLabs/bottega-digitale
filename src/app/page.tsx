import { FeatureCard, FeatureGrid } from "@/components/features";
import { Hero } from "@/components/hero";
import { PricingSection } from "@/components/pricing";

const features = [
  {
    icon: "🌐",
    title: "Sito web in 5 minuti",
    description:
      "Una vetrina elegante con foto, orari, mappa e pulsante WhatsApp già pronti.",
  },
  {
    icon: "📅",
    title: "Prenotazioni online",
    description:
      "Agenda smart con conferme automatiche, promemoria e orari aggiornati in tempo reale.",
  },
  {
    icon: "🤖",
    title: "Google Autopilot",
    description:
      "Monitora recensioni, suggerisce risposte e tiene viva la reputazione della bottega.",
  },
  {
    icon: "📦",
    title: "Catalogo prodotti",
    description:
      "Espone i prodotti migliori con foto, prezzi e richieste rapide direttamente dal sito.",
  },
  {
    icon: "👥",
    title: "Rubrica clienti",
    description:
      "Schede cliente, punti fedeltà e storico visite per richiamare chi conta davvero.",
  },
  {
    icon: "🧾",
    title: "Fatturazione integrata",
    description:
      "Dalla prenotazione all'incasso, con dati pronti per ricevute e gestione amministrativa.",
  },
];

const pricingTiers = [
  {
    name: "Vetrina",
    price: "Gratis",
    description: "Per iniziare a farsi trovare online senza complicazioni.",
    features: [
      "Pagina sito essenziale",
      "Orari e contatti di base",
      "Link a WhatsApp e Google Maps",
    ],
    ctaLabel: "Inizia gratis",
    ctaHref: "/dashboard",
  },
  {
    name: "Bottega",
    price: "€29",
    period: "mese",
    description: "La formula completa per gestire prenotazioni e clienti ogni giorno.",
    features: [
      "Prenotazioni online",
      "CRM clienti con punti fedeltà",
      "Catalogo prodotti e servizi",
      "Promemoria automatici",
    ],
    ctaLabel: "Attiva Bottega",
    ctaHref: "/dashboard",
    highlighted: true,
  },
  {
    name: "Maestro",
    price: "€59",
    period: "mese",
    description: "Per attività che vogliono più automazioni e più controllo.",
    features: [
      "Google Autopilot",
      "Fatturazione integrata",
      "Report mensili performance",
      "Supporto prioritario",
    ],
    ctaLabel: "Passa a Maestro",
    ctaHref: "/dashboard",
  },
];

const testimonials = [
  {
    quote:
      "Con Bottega Digitale ho messo online il mio negozio di ceramiche in una mattina e ora ricevo richieste anche fuori Forlì.",
    name: "Elena Gardini",
    business: "Ceramiche del San Domenico · Forlì",
  },
  {
    quote:
      "Le prenotazioni arrivano già ordinate e i promemoria fanno sparire le assenze dell'ultimo minuto.",
    name: "Luca Benericetti",
    business: "Barberia Ronco Vecchio · Forlì",
  },
  {
    quote:
      "Finalmente ho clienti, listino e recensioni Google nello stesso posto. Sembra fatto su misura per una bottega vera.",
    name: "Marta Flamigni",
    business: "Forno di Corso Diaz · Forlì",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col bg-amber-50">
      <Hero
        title="Il bancone digitale per ogni bottega"
        subtitle="Sito web, prenotazioni, clienti — tutto in un posto"
        ctaLabel="Guarda la demo"
        ctaHref="/dashboard"
        secondaryLabel="Scopri i prezzi"
        secondaryHref="#prezzi"
        className="from-amber-50 via-white to-orange-100"
      >
        <div className="mt-10 flex flex-wrap justify-center gap-3 text-sm font-medium text-slate-700">
          <span className="rounded-full bg-white px-4 py-2 shadow-sm">Pensato per Forlì e dintorni</span>
          <span className="rounded-full bg-white px-4 py-2 shadow-sm">Setup in giornata</span>
          <span className="rounded-full bg-white px-4 py-2 shadow-sm">Nessun gestionale complicato</span>
        </div>
      </Hero>

      <div id="funzioni">
        <FeatureGrid
          title="Tutto quello che serve per vendere meglio"
          subtitle="Bottega Digitale riunisce strumenti concreti per chi lavora in negozio, in laboratorio o su appuntamento."
          className="bg-white"
        >
          {features.map((feature) => (
            <FeatureCard
              key={feature.title}
              icon={<span className="text-2xl">{feature.icon}</span>}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </FeatureGrid>
      </div>

      <section className="bg-slate-900 py-16 text-white sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
              Creato per PMI locali
            </p>
            <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
              Meno tempo dietro ai messaggi, più tempo al banco.
            </h2>
            <p className="mt-4 max-w-2xl text-lg text-slate-300">
              Dal primo click alla recensione finale, ogni passaggio è pensato per botteghe, barberie, forni e piccoli studi del territorio.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur">
            <div className="rounded-2xl bg-white p-5 text-slate-900 shadow-xl">
              <p className="text-sm font-semibold text-amber-700">Esempio reale</p>
              <h3 className="mt-2 text-xl font-bold">Barbiere da Marco</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                1.284 visite mensili, agenda online sempre aggiornata e clienti fidelizzati con punti automatici.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {[
                  "Agenda condivisa",
                  "Schede cliente",
                  "Risposte Google suggerite",
                  "Listino online",
                ].map((item) => (
                  <div key={item} className="rounded-xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div id="prezzi">
        <PricingSection
          title="Prezzi chiari, senza sorprese"
          subtitle="Scegli il piano giusto per iniziare, crescere o automatizzare la tua attività."
          tiers={pricingTiers}
        />
      </div>

      <section id="testimonianze" className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Chi lavora in bottega lo capisce subito
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Tre attività di Forlì che cercavano uno strumento semplice, concreto e vicino al territorio.
            </p>
          </div>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <figure key={testimonial.name} className="rounded-3xl border border-slate-200 bg-amber-50 p-8 shadow-sm">
                <blockquote className="text-base leading-7 text-slate-700">
                  “{testimonial.quote}”
                </blockquote>
                <figcaption className="mt-6">
                  <p className="font-semibold text-slate-900">{testimonial.name}</p>
                  <p className="text-sm text-slate-500">{testimonial.business}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
