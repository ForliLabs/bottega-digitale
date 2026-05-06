"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { PageSkeleton, RetryCard } from "@/components/ui/feedback";

interface OpenAPISpec {
  info?: { title?: string; version?: string; description?: string };
  paths?: Record<string, Record<string, { summary?: string; tags?: string[]; parameters?: Array<{ name: string; in: string; schema?: Record<string, unknown> }>; requestBody?: Record<string, unknown>; responses?: Record<string, { description?: string }>; security?: unknown[] }>>;
  tags?: { name: string; description?: string }[];
}

export default function ApiDocsPage() {
  const [spec, setSpec] = useState<OpenAPISpec | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string>("");

  const loadSpec = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const response = await fetch("/api/openapi");
      if (!response.ok) {
        throw new Error("Impossibile scaricare la specifica OpenAPI");
      }
      const data = await response.json() as OpenAPISpec;
      setSpec(data);
    } catch (error) {
      setSpec(null);
      setLoadError(error instanceof Error ? error.message : "Errore sconosciuto");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadSpec();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [loadSpec]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <PageSkeleton lines={6} />
      </div>
    );
  }

  if (!spec) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-4">
          <RetryCard title="Errore nel caricamento della specifica OpenAPI" description={loadError || "Riprova tra qualche secondo."} />
          <div className="text-center">
            <button onClick={() => void loadSpec()} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
              Riprova ora
            </button>
          </div>
        </div>
      </div>
    );
  }

  const tags = spec.tags || [];
  const paths = spec.paths || {};

  const filteredPaths = Object.entries(paths).filter(([, methods]) => {
    if (!selectedTag) return true;
    return Object.values(methods).some((op) => op.tags?.includes(selectedTag));
  });

  const methodColors: Record<string, string> = {
    get: "bg-blue-100 text-blue-700",
    post: "bg-green-100 text-green-700",
    put: "bg-amber-100 text-amber-700",
    patch: "bg-orange-100 text-orange-700",
    delete: "bg-red-100 text-red-700",
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <Link href="/developers" className="text-sm text-blue-600 hover:underline">← Portale Sviluppatori</Link>
          </div>
          <h1 className="mt-4 text-3xl font-extrabold text-slate-900">
            {spec.info?.title || "API"} <span className="text-lg font-normal text-slate-500">v{spec.info?.version}</span>
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600">{spec.info?.description}</p>
          <div className="mt-4 flex gap-2">
            <a href="/api/openapi" target="_blank" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
              Scarica OpenAPI JSON
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Sidebar — Tags */}
          <aside className="lg:col-span-1">
            <div className="sticky top-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">Categorie</h2>
              <button
                onClick={() => setSelectedTag(null)}
                className={`mb-1 block w-full rounded-lg px-3 py-2 text-left text-sm ${!selectedTag ? "bg-blue-50 font-semibold text-blue-700" : "text-slate-600 hover:bg-slate-50"}`}
              >
                Tutti ({Object.keys(paths).length} endpoint)
              </button>
              {tags.map((tag) => (
                <button
                  key={tag.name}
                  onClick={() => setSelectedTag(tag.name)}
                  className={`mb-1 block w-full rounded-lg px-3 py-2 text-left text-sm ${selectedTag === tag.name ? "bg-blue-50 font-semibold text-blue-700" : "text-slate-600 hover:bg-slate-50"}`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </aside>

          {/* Main — Endpoints */}
          <main className="space-y-4 lg:col-span-3">
            {filteredPaths.map(([path, methods]) =>
              Object.entries(methods).map(([method, op]) => (
                <div key={`${method}-${path}`} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className={`rounded-md px-2.5 py-1 text-xs font-bold uppercase ${methodColors[method] || "bg-slate-100 text-slate-700"}`}>
                      {method}
                    </span>
                    <code className="text-sm font-semibold text-slate-900">{path}</code>
                    {op.security?.length === 0 && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">Pubblico</span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{op.summary}</p>
                  {op.tags && (
                    <div className="mt-2 flex gap-1">
                      {op.tags.map((tag) => (
                        <span key={tag} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{tag}</span>
                      ))}
                    </div>
                  )}
                  {op.parameters && op.parameters.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold uppercase text-slate-400">Parametri</p>
                      <div className="mt-1 space-y-1">
                        {op.parameters.map((p) => (
                          <div key={p.name} className="flex items-center gap-2 text-xs">
                            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-700">{p.name}</code>
                            <span className="text-slate-400">({p.in})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {op.responses && (
                    <div className="mt-3 flex gap-2">
                      {Object.entries(op.responses).map(([code, resp]) => (
                        <span key={code} className={`rounded px-2 py-0.5 text-xs ${code.startsWith("2") ? "bg-green-50 text-green-700" : code.startsWith("4") ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"}`} title={resp.description}>
                          {code}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )),
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
