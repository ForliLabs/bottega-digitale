import { ButtonLink } from "@/components/ui/button-link";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">Termini</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Termini di servizio</h1>
        <div className="mt-6 space-y-4 text-sm leading-7 text-slate-600">
          <p>La piattaforma aiuta piccole attività a gestire prenotazioni, clienti, cataloghi, notifiche e strumenti digitali.</p>
          <p>L&apos;utente è responsabile dell&apos;accuratezza dei contenuti pubblicati, della conformità fiscale e dell&apos;uso corretto di integrazioni esterne.</p>
          <p>Le integrazioni facoltative possono richiedere credenziali di terze parti. Le funzionalità non configurate restano disattivate senza compromettere il resto del servizio.</p>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/privacy" variant="secondary">Informativa privacy</ButtonLink>
          <ButtonLink href="/contact" variant="primary">Richiedi chiarimenti</ButtonLink>
        </div>
      </div>
    </div>
  );
}
