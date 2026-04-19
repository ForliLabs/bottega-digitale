"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    businessName: "",
    businessCategory: "",
    address: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
            <div className="mt-4 flex justify-center gap-2">
              {[1, 2].map((s) => (
                <div
                  key={s}
                  className={`h-2 w-16 rounded-full ${s <= step ? "bg-amber-500" : "bg-slate-200"}`}
                />
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {step === 1 && (
              <>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Il tuo nome</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
                    placeholder="Mario Rossi"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
                    placeholder="nome@attivita.it"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={form.password}
                    onChange={(e) => update("password", e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
                    placeholder="Almeno 6 caratteri"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!form.email || !form.password || !form.name}
                  className="w-full rounded-xl bg-amber-600 py-3 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
                >
                  Continua →
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Nome attività</label>
                  <input
                    type="text"
                    required
                    value={form.businessName}
                    onChange={(e) => update("businessName", e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
                    placeholder="Es. Barbiere da Marco"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Tipo di attività</label>
                  <select
                    value={form.businessCategory}
                    onChange={(e) => update("businessCategory", e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
                  >
                    <option value="">Seleziona...</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Indirizzo</label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => update("address", e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
                    placeholder="Via Roma 1, 47121 Forlì"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Telefono</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
                    placeholder="+39 0543 000000"
                  />
                </div>

                {error && (
                  <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>
                )}

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
              </>
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
