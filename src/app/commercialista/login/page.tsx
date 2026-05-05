"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { InlineMessage } from "@/components/ui/feedback";
import { useToast } from "@/components/ui/toast-provider";

export default function AccountantLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { notify } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const next = searchParams.get("next") || "/commercialista/dashboard";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/accountant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Accesso non riuscito.");
        return;
      }

      if (inviteCode.trim()) {
        const claimRes = await fetch("/api/accountant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "claim_invite", inviteCode: inviteCode.trim() }),
        });
        const claimData = await claimRes.json();
        if (!claimRes.ok) {
          setError(claimData.error || "Codice invito non valido.");
          return;
        }
      }

      notify({ tone: "success", title: "Accesso eseguito" });
      router.push(next);
      router.refresh();
    } catch {
      setError("Errore di connessione.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <p className="text-4xl">🧾</p>
          <h1 className="mt-4 text-3xl font-bold text-slate-900">Portale Commercialista</h1>
          <p className="mt-2 text-slate-600">Accedi per visualizzare i dati fiscali dei tuoi clienti su Bottega Digitale.</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="commercialista@studio.it"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="inviteCode" className="block text-sm font-medium text-slate-700">Codice invito cliente (opzionale)</label>
              <input
                type="text"
                id="inviteCode"
                name="inviteCode"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="INV-ABCDEFGH"
              />
              <p className="mt-1 text-xs text-slate-500">Se lo inserisci qui, il cliente viene collegato subito al tuo studio dopo il login.</p>
            </div>
            {error ? <InlineMessage tone="error" title={error} /> : null}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Accesso in corso..." : "Accedi"}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-6">
            <p className="text-center text-sm text-slate-500">
              Non hai un account? <span className="font-medium text-blue-600">Registrazione in arrivo</span>
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-slate-900">Come funziona</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>1. Il tuo cliente genera un codice invito dalla dashboard</li>
            <li>2. Inserisci il codice qui durante l&apos;accesso o dalla dashboard</li>
            <li>3. Accedi a fatture, IVA trimestrale ed esportazioni in formato studio</li>
          </ul>
          <Link href="/contact" className="mt-4 inline-flex text-sm font-medium text-blue-600 hover:text-blue-700">
            Richiedi l&apos;attivazione del portale →
          </Link>
        </div>
      </div>
    </div>
  );
}
