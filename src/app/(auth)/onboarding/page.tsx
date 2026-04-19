"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [services, setServices] = useState([
    { name: "", price: "", duration: "30" },
  ]);

  function addService() {
    setServices([...services, { name: "", price: "", duration: "30" }]);
  }

  function updateService(index: number, field: string, value: string) {
    const updated = [...services];
    updated[index] = { ...updated[index], [field]: value };
    setServices(updated);
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

          {step === 1 && (
            <div className="space-y-4">
              {services.map((svc, i) => (
                <div key={i} className="grid grid-cols-3 gap-3">
                  <input
                    placeholder="Nome servizio"
                    value={svc.name}
                    onChange={(e) => updateService(i, "name", e.target.value)}
                    className="rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-amber-500 focus:outline-none"
                  />
                  <input
                    placeholder="Prezzo (€)"
                    value={svc.price}
                    onChange={(e) => updateService(i, "price", e.target.value)}
                    className="rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-amber-500 focus:outline-none"
                  />
                  <select
                    value={svc.duration}
                    onChange={(e) => updateService(i, "duration", e.target.value)}
                    className="rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-amber-500 focus:outline-none"
                  >
                    {[15, 20, 30, 45, 60, 90].map((d) => (
                      <option key={d} value={d}>{d} min</option>
                    ))}
                  </select>
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
              {["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"].map(
                (day) => (
                  <div key={day} className="flex items-center gap-4">
                    <span className="w-24 text-sm font-medium text-slate-700">{day}</span>
                    <input
                      type="text"
                      placeholder="09:00–18:00 o Chiuso"
                      className="flex-1 rounded-xl border border-slate-300 px-4 py-2 text-sm focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                )
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="rounded-2xl bg-amber-50 p-6 text-center">
                <span className="text-4xl">🎉</span>
                <h2 className="mt-3 text-xl font-bold text-slate-900">La tua bottega è pronta!</h2>
                <p className="mt-2 text-sm text-slate-600">
                  Il tuo sito web è stato generato. Puoi personalizzarlo dal pannello di controllo.
                </p>
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
                if (step < 3) {
                  setStep(step + 1);
                } else {
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
