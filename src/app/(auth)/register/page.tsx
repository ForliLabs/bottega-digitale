"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast-provider";
import { isValidPhoneNumber } from "@/lib/utils";

export default function RegisterPage() {
  const router = useRouter();
  const { notify } = useToast();
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    businessName: "",
    businessCategory: "",
    address: "",
    phone: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: "" }));
  }

  const canContinue = useMemo(
    () => !!form.name.trim() && !!form.email.trim() && form.password.length >= 8,
    [form.email, form.name, form.password],
  );

  function validateStep(currentStep: number) {
    const nextErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!form.name.trim()) nextErrors.name = "Inserisci il tuo nome.";
      if (!form.email.includes("@")) nextErrors.email = "Inserisci un'email valida.";
      if (form.password.length < 8) nextErrors.password = "Usa almeno 8 caratteri.";
    }

    if (currentStep === 2) {
      if (!form.businessName.trim()) nextErrors.businessName = "Inserisci il nome attività.";
      if (!form.businessCategory) nextErrors.businessCategory = "Seleziona una categoria.";
      if (form.phone && !isValidPhoneNumber(form.phone)) nextErrors.phone = "Inserisci un numero valido.";
    }

    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setError("Controlla i campi evidenziati prima di continuare.");
    }
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validateStep(1) || !validateStep(2)) {
      setError("Controlla i campi evidenziati prima di continuare.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Errore durante la registrazione.");
        return;
      }

      notify({ tone: "success", title: "Account creato", description: "Ora completiamo servizi, orari e pubblicazione." });
      router.push("/onboarding");
    } catch {
      setError("Errore di connessione.");
    } finally {
      setLoading(false);
    }
  }

  const categories = [
    "Barbiere", "Forno / Pasticceria", "Ristorante / Trattoria", "Bar / Caffetteria",
    "Parrucchiere", "Estetista", "Meccanico", "Gioielleria",
    "Sartoria", "Fiorista", "Studio professionale", "Altro",
  ];

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-slate-900">Crea la tua Bottega Digitale</h1>
            <p className="mt-2 text-sm text-slate-600">
              In pochi minuti avrai sito, prenotazioni e gestione clienti.
            </p>
            <div className="mt-4 flex justify-center gap-2" role="group" aria-label="Avanzamento registrazione">
              {[1, 2].map((s) => (
                <div
                  key={s}
                  aria-label={`Passo ${s} di 2${s === step ? " (corrente)" : s < step ? " (completato)" : ""}`}
                  className={`h-2 w-16 rounded-full ${s <= step ? "bg-amber-500" : "bg-slate-200"}`}
                />
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Single live-region summary — announced once for all field errors */}
            {error && (
              <div
                id="reg-form-error"
                role="alert"
                aria-live="assertive"
                className="rounded-xl bg-red-50 p-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            {step === 1 && (
              <fieldset className="space-y-5 border-0 p-0 m-0">
                <legend className="sr-only">Passo 1 di 2 — Dati personali e accesso</legend>
                <div>
                  <label htmlFor="reg-name" className="mb-1 block text-sm font-medium text-slate-700">Il tuo nome</label>
                  <input
                    id="reg-name"
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    aria-invalid={!!fieldErrors.name}
                    aria-describedby={fieldErrors.name ? "reg-name-err" : undefined}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200 aria-[invalid=true]:border-red-400"
                    placeholder="Mario Rossi"
                  />
                  {fieldErrors.name ? <p id="reg-name-err" className="mt-1 text-xs text-red-600">{fieldErrors.name}</p> : null}
                </div>
                <div>
                  <label htmlFor="reg-email" className="mb-1 block text-sm font-medium text-slate-700">Email</label>
                  <input
                    id="reg-email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    aria-invalid={!!fieldErrors.email}
                    aria-describedby={fieldErrors.email ? "reg-email-err" : undefined}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200 aria-[invalid=true]:border-red-400"
                    placeholder="nome@attivita.it"
                  />
                  {fieldErrors.email ? <p id="reg-email-err" className="mt-1 text-xs text-red-600">{fieldErrors.email}</p> : null}
                </div>
                <div>
                  <label htmlFor="reg-password" className="mb-1 block text-sm font-medium text-slate-700">Password</label>
                  <input
                    id="reg-password"
                    type="password"
                    required
                    minLength={8}
                    value={form.password}
                    onChange={(e) => update("password", e.target.value)}
                    aria-invalid={!!fieldErrors.password}
                    aria-describedby={fieldErrors.password ? "reg-password-err" : "reg-password-hint"}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200 aria-[invalid=true]:border-red-400"
                    placeholder="Almeno 8 caratteri"
                  />
                  {fieldErrors.password
                    ? <p id="reg-password-err" className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>
                    : <p id="reg-password-hint" className="mt-1 text-xs text-slate-500">Usa almeno 8 caratteri.</p>
                  }
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (validateStep(1)) {
                      setError("");
                      setStep(2);
                    }
                  }}
                  disabled={!canContinue}
                  className="w-full rounded-xl bg-amber-600 py-3 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
                >
                  Continua →
                </button>
              </fieldset>
            )}

            {step === 2 && (
              <fieldset className="space-y-5 border-0 p-0 m-0">
                <legend className="sr-only">Passo 2 di 2 — Dati della tua attività</legend>
                <div>
                  <label htmlFor="reg-business-name" className="mb-1 block text-sm font-medium text-slate-700">Nome attività</label>
                  <input
                    id="reg-business-name"
                    type="text"
                    required
                    value={form.businessName}
                    onChange={(e) => update("businessName", e.target.value)}
                    aria-invalid={!!fieldErrors.businessName}
                    aria-describedby={fieldErrors.businessName ? "reg-business-name-err" : undefined}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200 aria-[invalid=true]:border-red-400"
                    placeholder="Es. Barbiere da Marco"
                  />
                  {fieldErrors.businessName ? <p id="reg-business-name-err" className="mt-1 text-xs text-red-600">{fieldErrors.businessName}</p> : null}
                </div>
                <div>
                  <label htmlFor="reg-category" className="mb-1 block text-sm font-medium text-slate-700">Tipo di attività</label>
                  <select
                    id="reg-category"
                    value={form.businessCategory}
                    onChange={(e) => update("businessCategory", e.target.value)}
                    aria-invalid={!!fieldErrors.businessCategory}
                    aria-describedby={fieldErrors.businessCategory ? "reg-category-err" : undefined}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200 aria-[invalid=true]:border-red-400"
                  >
                    <option value="">Seleziona...</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {fieldErrors.businessCategory ? <p id="reg-category-err" className="mt-1 text-xs text-red-600">{fieldErrors.businessCategory}</p> : null}
                </div>
                <div>
                  <label htmlFor="reg-address" className="mb-1 block text-sm font-medium text-slate-700">Indirizzo</label>
                  <input
                    id="reg-address"
                    type="text"
                    value={form.address}
                    onChange={(e) => update("address", e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
                    placeholder="Via Roma 1, 47121 Forlì"
                  />
                </div>
                <div>
                  <label htmlFor="reg-phone" className="mb-1 block text-sm font-medium text-slate-700">Telefono</label>
                  <input
                    id="reg-phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    aria-invalid={!!fieldErrors.phone}
                    aria-describedby={fieldErrors.phone ? "reg-phone-err" : undefined}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200 aria-[invalid=true]:border-red-400"
                    placeholder="+39 0543 000000"
                    inputMode="tel"
                  />
                  {fieldErrors.phone ? <p id="reg-phone-err" className="mt-1 text-xs text-red-600">{fieldErrors.phone}</p> : null}
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 rounded-xl border border-slate-300 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    ← Indietro
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !form.businessName}
                    className="flex-1 rounded-xl bg-amber-600 py-3 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
                  >
                    {loading ? "Creazione..." : "Crea la mia bottega"}
                  </button>
                </div>
              </fieldset>
            )}
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Hai già un account?{" "}
            <Link href="/login" className="font-medium text-amber-600 hover:text-amber-700">
              Accedi
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
