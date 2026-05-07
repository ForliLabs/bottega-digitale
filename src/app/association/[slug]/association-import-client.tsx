"use client";

import type { ChangeEvent } from "react";
import { useState } from "react";
import { InlineMessage } from "@/components/ui/feedback";
import { useToast } from "@/components/ui/toast-provider";

export function AssociationImportClient({ associationId }: { associationId: string }) {
  const { notify } = useToast();
  const [csvData, setCsvData] = useState("");
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ created: number; skipped: number; errors: string[] } | null>(null);

  async function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    setFileName(file.name);
    setCsvData(await file.text());
  }

  async function submitImport() {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const response = await fetch("/api/associations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "bulk_onboard",
          associationId,
          csvData,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || "Importazione non riuscita");
      }
      setResult(data);
      notify({ tone: "success", title: "Importazione completata" });
    } catch (importError) {
      setError(importError instanceof Error ? importError.message : "Importazione non riuscita");
    } finally {
      setLoading(false);
    }
  }

  const previewLines = csvData.split(/\r?\n/).filter(Boolean).slice(0, 4);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Importazione massiva</h2>
          <p className="mt-1 text-sm text-slate-500">
            Carica un file CSV oppure incolla i dati. Colonne supportate: nome, email, telefono, categoria, partitaIva, indirizzo.
          </p>
        </div>
        <label className="inline-flex cursor-pointer items-center rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          Scegli file CSV
          <input type="file" accept=".csv,text/csv" onChange={onFileChange} className="hidden" />
        </label>
      </div>

      {fileName ? <p className="mt-3 text-xs font-medium text-slate-500">File selezionato: {fileName}</p> : null}
      {error ? <div className="mt-4"><InlineMessage tone="error" title={error} /></div> : null}

      <div className="mt-4 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Dati CSV
            <textarea value={csvData} onChange={(event) => setCsvData(event.target.value)} rows={10} className="mt-1 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm font-mono" placeholder="nome,email,telefono,categoria,partitaIva,indirizzo" />
          </label>
          <button type="button" onClick={submitImport} disabled={loading || !csvData.trim()} className="mt-4 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50">
            {loading ? "Importazione in corso..." : "Importa attività"}
          </button>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-slate-900">Anteprima</h3>
            <div className="mt-3 space-y-2 text-xs font-mono text-slate-600">
              {previewLines.length > 0 ? previewLines.map((line, index) => <div key={`${line}-${index}`}>{line}</div>) : <p>Nessun dato caricato.</p>}
            </div>
          </div>
          {result ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              <p className="font-semibold">Import completato</p>
              <p className="mt-2">Creati: {result.created} · Già presenti: {result.skipped}</p>
              {result.errors.length > 0 ? <ul className="mt-2 list-disc pl-5">{result.errors.map((item) => <li key={item}>{item}</li>)}</ul> : null}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
