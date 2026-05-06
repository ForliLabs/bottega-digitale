import { ButtonLink } from "@/components/ui/button-link";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">Contatti</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Parla con Bottega Digitale</h1>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-amber-50 p-5 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">Supporto prodotto</p>
            <a href="mailto:ciao@bottegadigitale.it" className="mt-2 block text-amber-700">ciao@bottegadigitale.it</a>
          </div>
          <div className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">Privacy & GDPR</p>
            <a href="mailto:privacy@bottegadigitale.it" className="mt-2 block text-amber-700">privacy@bottegadigitale.it</a>
          </div>
          <div className="rounded-2xl bg-emerald-50 p-5 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">Partnership</p>
            <a href="mailto:partnership@bottegadigitale.it" className="mt-2 block text-amber-700">partnership@bottegadigitale.it</a>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/register" variant="primary">Apri la tua bottega</ButtonLink>
          <ButtonLink href="/directory" variant="secondary">Scopri le attività</ButtonLink>
        </div>
      </div>
    </div>
  );
}
