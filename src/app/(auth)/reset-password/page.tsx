"use client";

import { useState } from "react";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // Simulate async send — a real implementation would call /api/auth/reset-password
    window.setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-slate-900">Recupera password</h1>
            <p className="mt-2 text-sm text-slate-600">
              Inserisci l&apos;email del tuo account e ti invieremo le istruzioni per reimpostare la password.
            </p>
          </div>

          {submitted ? (
            <div
              role="status"
              aria-live="polite"
              className="space-y-4 text-center"
            >
              <span className="text-5xl" aria-hidden="true">📬</span>
              <p className="mt-3 text-sm font-medium text-slate-900">
                Se l&apos;indirizzo <strong>{email}</strong> è registrato, riceverai un&apos;email con le istruzioni.
              </p>
              <p className="text-xs text-slate-500">
                Controlla anche la cartella spam. Il link è valido per 1 ora.
              </p>
              <Link
                href="/login"
                className="mt-4 inline-block rounded-xl bg-amber-600 px-6 py-3 text-sm font-semibold text-white hover:bg-amber-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2"
              >
                Torna al login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="reset-email" className="mb-1 block text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  id="reset-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
                  placeholder="nome@attivita.it"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-amber-600 py-3 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2"
              >
                {loading ? "Invio in corso..." : "Invia istruzioni"}
              </button>

              <p className="text-center text-sm text-slate-500">
                Ricordi la password?{" "}
                <Link href="/login" className="font-medium text-amber-600 hover:text-amber-700">
                  Accedi
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
