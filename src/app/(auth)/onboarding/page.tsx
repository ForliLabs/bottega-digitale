"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { InlineMessage } from "@/components/ui/feedback";
import { useToast } from "@/components/ui/toast-provider";

function getSavedOnboardingProgress() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const saved = window.localStorage.getItem("onboarding-progress");
    return saved ? JSON.parse(saved) as {
      services?: Array<{ name: string; price: string; duration: string }>;
      hours?: Record<string, string>;
      siteReady?: boolean;
    } : null;
  } catch {
    return null;
  }
}

// Lightweight hours format validation: accept HH:MM–HH:MM or "Chiuso" (case-insensitive)
const HOURS_PATTERN = /^(\d{1,2}:\d{2}[–-]\d{1,2}:\d{2}|chiuso)$/i;
function isHoursValueValid(value: string) {
  return value.trim() === "" || HOURS_PATTERN.test(value.trim());
}

export default function OnboardingPage() {
  const router = useRouter();
  const { notify } = useToast();
  const savedProgress = getSavedOnboardingProgress();
  const [step, setStep] = useState(1);
  const [services, setServices] = useState(
    savedProgress?.services?.length ? savedProgress.services : [{ name: "", price: "", duration: "30" }],
  );
  const [hours, setHours] = useState<Record<string, string>>(
    savedProgress?.hours ?? {
      "Lunedì": "09:00–18:00",
      "Martedì": "09:00–18:00",
      "Mercoledì": "09:00–18:00",
      "Giovedì": "09:00–18:00",
      "Venerdì": "09:00–18:00",
      "Sabato": "09:00–13:00",
      "Domenica": "Chiuso",
    },
  );
  const [siteReady, setSiteReady] = useState(savedProgress?.siteReady ?? false);
  const [error, setError] = useState("");

  function addService() {
    setServices([...services, { name: "", price: "", duration: "30" }]);
  }

  function removeService(index: number) {
    if (services.length <= 1) return; // Always keep at least one row
    setServices(services.filter((_, i) => i !== index));
  }

  function updateService(index: number, field: string, value: string) {
    const updated = [...services];
    updated[index] = { ...updated[index], [field]: value };
    setServices(updated);
  }

  useEffect(() => {
    window.localStorage.setItem("onboarding-progress", JSON.stringify({ services, hours, siteReady }));
  }, [hours, services, siteReady]);

  function validateCurrentStep(currentStep: number) {
    setError("");

    if (currentStep === 1) {
      const validServices = services.filter((service) => service.name.trim() && Number(service.price) > 0);
      if (validServices.length === 0) {
        setError("Aggiungi almeno un servizio con nome e prezzo.");
        return false;
      }
    }

    if (currentStep === 2) {
      const hasOpeningHours = Object.values(hours).some((value) => value.trim() && value.trim().toLowerCase() !== "chiuso");
      if (!hasOpeningHours) {
        setError("Imposta almeno un giorno di apertura.");
        return false;
      }
    }

    if (currentStep === 3 && !siteReady) {
      setError("Conferma l'anteprima del sito prima di entrare in dashboard.");
      return false;
    }

    return true;
  }

  const steps = [
    { title: "Servizi", description: "Aggiungi i servizi che offri ai clienti." },
    { title: "Orari", description: "Imposta gli orari di apertura della tua attività." },
    { title: "Sito web", description: "Anteprima e pubblicazione del tuo sito." },
  ];

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-8">
            <div className="flex items-center gap-3">
              {steps.map((s, i) => (
                <div key={s.title} className="flex items-center gap-2">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                      i + 1 <= step ? "bg-amber-500 text-white" : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {i + 1}
                  </div>
                  <span className={`text-sm font-medium ${i + 1 <= step ? "text-slate-900" : "text-slate-400"}`}>
                    {s.title}
                  </span>
                  {i < steps.length - 1 && <div className="mx-2 h-px w-8 bg-slate-200" />}
                </div>
              ))}
            </div>
            <h1 className="mt-6 text-2xl font-bold text-slate-900">{steps[step - 1].title}</h1>
            <p className="mt-1 text-sm text-slate-600">{steps[step - 1].description}</p>
          </div>

          {error ? <div className="mb-4"><InlineMessage tone="error" title={error} /></div> : null}

          {step === 1 && (
            <div className="space-y-4">
              {services.map((svc, i) => (
                <div key={i} className="relative grid grid-cols-3 gap-3">
                  <div>
                    <label htmlFor={`svc-name-${i}`} className="sr-only">
                      Nome servizio {i + 1}
                    </label>
                    <input
                      id={`svc-name-${i}`}
                      placeholder="Nome servizio"
                      value={svc.name}
                      onChange={(e) => updateService(i, "name", e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor={`svc-price-${i}`} className="sr-only">
                      Prezzo servizio {i + 1} in euro
                    </label>
                    <input
                      id={`svc-price-${i}`}
                      placeholder="Prezzo (€)"
                      value={svc.price}
                      onChange={(e) => updateService(i, "price", e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <label htmlFor={`svc-duration-${i}`} className="sr-only">
                        Durata servizio {i + 1}
                      </label>
                      <select
                        id={`svc-duration-${i}`}
                        value={svc.duration}
                        onChange={(e) => updateService(i, "duration", e.target.value)}
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-amber-500 focus:outline-none"
                      >
                        {[15, 20, 30, 45, 60, 90].map((d) => (
                          <option key={d} value={d}>{d} min</option>
                        ))}
                      </select>
                    </div>
                    {services.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeService(i)}
                        aria-label={`Rimuovi servizio ${i + 1}`}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:border-red-300 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addService}
                className="w-full rounded-xl border border-dashed border-slate-300 py-3 text-sm text-slate-500 hover:border-amber-400 hover:text-amber-600"
              >
                + Aggiungi servizio
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                Formato: <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-slate-700">09:00–18:00</code> oppure <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-slate-700">Chiuso</code>. Lascia vuoto per non specificare.
              </p>
              {["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"].map(
                (day) => {
                  const val = hours[day] ?? "";
                  const invalid = val !== "" && !isHoursValueValid(val);
                  return (
                    <div key={day} className="flex items-center gap-4">
                      <label
                        htmlFor={`hours-${day}`}
                        className="w-24 text-sm font-medium text-slate-700"
                      >
                        {day}
                      </label>
                      <input
                        id={`hours-${day}`}
                        type="text"
                        placeholder="09:00–18:00 o Chiuso"
                        value={val}
                        onChange={(e) => setHours((current) => ({ ...current, [day]: e.target.value }))}
                        aria-invalid={invalid}
                        aria-describedby={invalid ? `hours-hint-${day}` : undefined}
                        className={`flex-1 rounded-xl border px-4 py-2 text-sm focus:outline-none ${
                          invalid
                            ? "border-red-400 focus:border-red-400 focus:ring-1 focus:ring-red-300"
                            : "border-slate-300 focus:border-amber-500"
                        }`}
                      />
                      {invalid && (
                        <span id={`hours-hint-${day}` } className="sr-only">
                          Formato non valido. Usa HH:MM–HH:MM oppure Chiuso.
                        </span>
                      )}
                    </div>
                  );
                }
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="rounded-2xl bg-amber-50 p-6 text-center">
                <span className="text-4xl" aria-hidden="true">🎉</span>
                <h2 className="mt-3 text-xl font-bold text-slate-900">La tua bottega è pronta!</h2>
                <p className="mt-2 text-sm text-slate-600">
                  Controlla l&apos;anteprima finale, poi conferma per entrare in dashboard con i dati già salvati.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 p-5 text-sm text-slate-600">
                <p className="font-semibold text-slate-900">Cosa verrà pubblicato</p>
                <ul className="mt-3 space-y-2 text-left">
                  <li>• {services.filter((service) => service.name.trim()).length} servizi pronti per la prenotazione</li>
                  <li>• Orari compilati per {Object.values(hours).filter((value) => value.trim()).length} giorni</li>
                  <li>• Pagina pubblica e dashboard modificabili in ogni momento</li>
                </ul>
                <label className="mt-4 flex items-start gap-3 rounded-xl border border-slate-200 p-3">
                  <input
                    type="checkbox"
                    checked={siteReady}
                    onChange={(e) => setSiteReady(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                  />
                  <span>Confermo di aver controllato l&apos;anteprima e voglio continuare in dashboard.</span>
                </label>
              </div>
            </div>
          )}

          <div className="mt-8 flex gap-3">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="flex-1 rounded-xl border border-slate-300 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                ← Indietro
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                if (!validateCurrentStep(step)) return;
                if (step < 3) {
                  setStep(step + 1);
                  notify({ tone: "success", title: "Passo salvato" });
                } else {
                  window.localStorage.removeItem("onboarding-progress");
                  notify({ tone: "success", title: "Onboarding completato" });
                  router.push("/dashboard");
                }
              }}
              className="flex-1 rounded-xl bg-amber-600 py-3 text-sm font-semibold text-white hover:bg-amber-700"
            >
              {step < 3 ? "Continua →" : "Vai al pannello di controllo"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
