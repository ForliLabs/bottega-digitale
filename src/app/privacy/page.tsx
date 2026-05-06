import { ButtonLink } from "@/components/ui/button-link";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">Privacy</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Informativa privacy</h1>
        <div className="mt-6 space-y-4 text-sm leading-7 text-slate-600">
          <p>Bottega Digitale tratta i dati necessari per prenotazioni, ordini, fatture e notifiche nel rispetto del GDPR.</p>
          <p>Raccogliamo solo i dati strettamente necessari al servizio e li conserviamo per il tempo richiesto da finalità operative, fiscali e di sicurezza.</p>
          <p>Puoi richiedere accesso, rettifica o cancellazione scrivendo a <a className="font-medium text-amber-700" href="mailto:privacy@bottegadigitale.it">privacy@bottegadigitale.it</a>.</p>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/contact" variant="primary">Contatta il team privacy</ButtonLink>
          <ButtonLink href="/terms" variant="secondary">Leggi i termini</ButtonLink>
        </div>
      </div>
    </div>
  );
}
