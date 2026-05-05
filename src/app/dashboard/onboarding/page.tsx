export const dynamic = "force-dynamic";
import Link from "next/link";
import { getBusinessContext } from "@/lib/auth";
import {
  WIZARD_STEPS,
  BUSINESS_CATEGORIES,
  calculateProgress,
  getNextStep,
  isOnboardingComplete,
  getActivationNudges,
  getEstimatedSetupTime,
} from "@/lib/onboarding";

export default async function OnboardingPage() {
  const business = await getBusinessContext();

  // Determine completed steps based on business state
  const completedSteps: string[] = [];
  if (business) {
    completedSteps.push("profile"); // Always completed if business exists
    if (business.onlineBookingEnabled || business.catalogEnabled) completedSteps.push("services");
    if (business.openingHours !== "[]") completedSteps.push("hours");
    if (business.onlineBookingEnabled || business.queueEnabled || business.loyaltyEnabled) completedSteps.push("features");
    if (business.websitePublished) completedSteps.push("website");
    if (business.whatsappPhoneId) completedSteps.push("whatsapp");
  }

  const progress = calculateProgress(completedSteps);
  const nextStep = getNextStep(completedSteps);
  const complete = isOnboardingComplete(completedSteps);
  const estimatedTime = getEstimatedSetupTime();

  const nudges = business
    ? getActivationNudges({
        hasServices: business.onlineBookingEnabled,
        hasProducts: business.catalogEnabled,
        bookingEnabled: business.onlineBookingEnabled,
        websitePublished: business.websitePublished,
        whatsappConnected: !!business.whatsappPhoneId,
        loyaltyEnabled: business.loyaltyEnabled,
        hasCustomers: false,
      })
    : [];

  const stepActions: Record<string, { href: string; label: string }> = {
    profile: { href: "/dashboard/settings/api", label: "Configura accessi" },
    services: { href: "/dashboard/products", label: "Aggiungi servizi o prodotti" },
    hours: { href: "/dashboard/queue", label: "Imposta disponibilità" },
    features: { href: "/dashboard/automations", label: "Attiva funzionalità" },
    website: { href: "/dashboard/website", label: "Controlla il sito" },
    whatsapp: { href: "/dashboard/whatsapp", label: "Collega WhatsApp" },
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Configurazione Guidata
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          {complete ? "Configurazione completata! 🎉" : "Configura la tua Bottega"}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          {complete
            ? "Hai completato tutti i passaggi obbligatori. Continua a esplorare le funzionalità avanzate."
            : `Segui questi ${WIZARD_STEPS.length} passaggi per configurare la tua attività in circa ${estimatedTime} minuti.`}
        </p>
      </section>

      {/* Progress Ring */}
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-6">
          <div className="relative flex h-24 w-24 items-center justify-center">
            <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" strokeWidth="8" fill="none" className="stroke-slate-100" />
              <circle
                cx="50" cy="50" r="42"
                strokeWidth="8"
                fill="none"
                className="stroke-emerald-500"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 42}`}
                strokeDashoffset={`${2 * Math.PI * 42 * (1 - progress.percentComplete / 100)}`}
              />
            </svg>
            <span className="absolute text-xl font-bold text-slate-900">{progress.percentComplete}%</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Completamento: {progress.percentComplete}%
            </h3>
            <p className="text-sm text-slate-500">
              {progress.completedSteps.length} di {progress.totalSteps} passaggi completati
            </p>
            {nextStep && (
              <p className="mt-1 text-sm text-emerald-600">
                Prossimo: {nextStep.icon} {nextStep.title}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-700">Passaggi di configurazione</h3>
        {WIZARD_STEPS.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = nextStep?.id === step.id;

          const action = stepActions[step.id];

          return (
            <div
              key={step.id}
              className={`flex items-center gap-4 rounded-xl border p-4 transition-all ${
                isCompleted
                  ? "border-emerald-200 bg-emerald-50/50"
                  : isCurrent
                    ? "border-emerald-400 bg-white shadow-sm"
                    : "border-slate-200 bg-white"
              }`}
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                isCompleted
                  ? "bg-emerald-500 text-white"
                  : isCurrent
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-100 text-slate-400"
              }`}>
                {isCompleted ? "✓" : index + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{step.icon}</span>
                  <h4 className={`text-sm font-semibold ${isCompleted ? "text-emerald-700" : "text-slate-900"}`}>
                    {step.title}
                  </h4>
                  {step.required && (
                    <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                      Obbligatorio
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-slate-500">{step.description}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-xs text-slate-400">~{step.estimatedMinutes} min</div>
                {action ? (
                  <Link
                    href={action.href}
                    className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                  >
                    {isCompleted ? "Rivedi" : action.label}
                  </Link>
                ) : null}
              </div>
            </div>
          );
        })}
      </section>

      {/* Business Categories */}
      {!business && (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-700">Che tipo di attività hai?</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {BUSINESS_CATEGORIES.filter((c) => c.category !== "altro").map((cat) => (
              <div
                key={cat.category}
                className="cursor-pointer rounded-xl border border-slate-200 bg-white p-4 text-center transition-all hover:border-emerald-300 hover:shadow-sm"
              >
                <p className="text-3xl">{cat.icon}</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{cat.label}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {cat.isServiceBased && cat.isProductBased
                    ? "Servizi + Prodotti"
                    : cat.isServiceBased
                      ? "Servizi"
                      : "Prodotti"}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Activation Nudges */}
      {nudges.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-700">Suggerimenti per te</h3>
          {nudges.map((nudge) => (
            <div key={nudge.id} className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/50 p-4">
              <div>
                <p className="text-sm font-medium text-slate-900">{nudge.message}</p>
              </div>
              <a
                href={nudge.actionUrl}
                className="ml-4 shrink-0 rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-600"
              >
                {nudge.action}
              </a>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
