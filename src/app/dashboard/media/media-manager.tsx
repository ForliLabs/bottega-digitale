"use client";

import { useMemo, useState } from "react";
import { EmptyState, InlineMessage } from "@/components/ui/feedback";
import { useToast } from "@/components/ui/toast-provider";
import type { MediaFolder } from "@/lib/media";

type Asset = {
  id: string;
  filename: string;
  sizeBytes: number;
  url: string;
  thumbnailUrl: string | null;
  alt: string | null;
  folder: string;
};

type Usage = {
  usedMB: number;
  quotaMB: number;
  percentUsed: number;
};

export function MediaManager({ initialAssets, initialUsage }: { initialAssets: Asset[]; initialUsage: Usage }) {
  const { notify } = useToast();
  const [assets, setAssets] = useState(initialAssets);
  const [usage, setUsage] = useState(initialUsage);
  const [folder, setFolder] = useState<MediaFolder>("general");
  const [alt, setAlt] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const folders: MediaFolder[] = ["general", "products", "social", "logo", "hero"];
  const filteredAssets = useMemo(() => assets.filter((asset) => asset.folder === folder), [assets, folder]);

  async function refreshLibrary() {
    const res = await fetch("/api/media");
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Errore nel recupero della libreria.");
    setAssets(data.assets || []);
    if (data.usage) setUsage(data.usage);
  }

  async function handleUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      setError("Seleziona un file prima di caricare.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const body = new FormData();
      body.set("file", file);
      body.set("folder", folder);
      if (alt.trim()) body.set("alt", alt.trim());

      const res = await fetch("/api/media", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Caricamento non riuscito.");

      await refreshLibrary();
      setFile(null);
      setAlt("");
      const input = document.getElementById("media-file-input") as HTMLInputElement | null;
      if (input) input.value = "";
      notify({ tone: "success", title: "Media caricato" });
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Caricamento non riuscito.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(assetId: string) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/media?id=${assetId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Eliminazione non riuscita.");
      await refreshLibrary();
      notify({ tone: "success", title: "Media eliminato" });
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Eliminazione non riuscita.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-700">Carica immagini</h3>
            <p className="mt-1 text-xs text-slate-500">
              Formati supportati: JPEG, PNG, WebP, GIF. Max 5MB per file.
            </p>
          </div>
          <form onSubmit={handleUpload} className="grid w-full gap-3 lg:max-w-2xl lg:grid-cols-[1fr,160px,1fr,auto]">
            <input
              id="media-file-input"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              className="rounded-xl border border-slate-300 px-3 py-3 text-sm"
            />
            <select
              value={folder}
              onChange={(event) => setFolder(event.target.value as MediaFolder)}
              className="rounded-xl border border-slate-300 px-3 py-3 text-sm"
            >
              {folders.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
            <input
              value={alt}
              onChange={(event) => setAlt(event.target.value)}
              placeholder="Testo alternativo"
              className="rounded-xl border border-slate-300 px-3 py-3 text-sm"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
            >
              {loading ? "Invio..." : "Carica"}
            </button>
          </form>
        </div>
        {error ? <div className="mt-4"><InlineMessage tone="error" title={error} /></div> : null}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap gap-2">
          {folders.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFolder(item)}
              className={`rounded-full px-3 py-2 text-sm font-medium ${item === folder ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
            >
              {item}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Stai usando {usage.usedMB}MB su {usage.quotaMB}MB ({usage.percentUsed}%).
        </p>
      </section>

      {filteredAssets.length === 0 ? (
        <EmptyState
          icon="📷"
          title="Nessun media in questa cartella"
          description="Carica un'immagine per popolare il sito, il catalogo o i post social."
        />
      ) : (
        <section className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-700">{filteredAssets.length} file in {folder}</h3>
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {filteredAssets.map((asset) => (
              <div key={asset.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <div className="aspect-square bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={asset.thumbnailUrl || asset.url} alt={asset.alt || asset.filename} className="h-full w-full object-cover" />
                </div>
                <div className="space-y-2 p-3">
                  <p className="truncate text-xs font-medium text-slate-700">{asset.filename}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>{Math.round(asset.sizeBytes / 1024)}KB</span>
                    <span className="rounded-full bg-violet-100 px-1.5 py-0.5 text-violet-600">{asset.folder}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(asset.id)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Elimina
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
