export const dynamic = "force-dynamic";
import { getBusinessContext } from "@/lib/auth";
import { getMediaLibrary, getStorageUsage } from "@/lib/media";

export default async function MediaPage() {
  const business = await getBusinessContext();
  const library = business ? await getMediaLibrary(business.id) : null;
  const usage = business ? await getStorageUsage(business.id) : null;

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-violet-200 bg-gradient-to-br from-violet-50 via-white to-purple-50 p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-700">
          Gestione Media
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Libreria Media
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Carica e gestisci le immagini per prodotti, post social, logo e sito web.
          Le immagini vengono ottimizzate automaticamente in WebP.
        </p>
      </section>

      {/* Storage Usage */}
      {usage && (
        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-700">Spazio utilizzato</h3>
              <p className="text-2xl font-bold text-slate-900">
                {usage.usedMB} MB <span className="text-sm font-normal text-slate-500">/ {usage.quotaMB} MB</span>
              </p>
            </div>
            <div className="text-right">
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                usage.percentUsed > 90
                  ? "bg-red-100 text-red-700"
                  : usage.percentUsed > 70
                    ? "bg-amber-100 text-amber-700"
                    : "bg-green-100 text-green-700"
              }`}>
                {usage.percentUsed}%
              </span>
            </div>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full ${
                usage.percentUsed > 90 ? "bg-red-500" : usage.percentUsed > 70 ? "bg-amber-500" : "bg-violet-500"
              }`}
              style={{ width: `${Math.min(usage.percentUsed, 100)}%` }}
            />
          </div>
        </section>
      )}

      {/* Upload Instructions */}
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="text-sm font-semibold text-slate-700">Carica immagini</h3>
        <p className="mt-1 text-xs text-slate-500">
          Usa l&apos;API <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs">POST /api/media</code> con 
          form-data (campo &quot;file&quot;). Formati supportati: JPEG, PNG, WebP. Max 5MB.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(["general", "products", "social", "logo"] as const).map((folder) => (
            <div key={folder} className="rounded-lg border border-dashed border-violet-300 bg-violet-50/50 p-4 text-center">
              <p className="text-lg">
                {folder === "products" ? "🛍️" : folder === "social" ? "📱" : folder === "logo" ? "🏷️" : "📁"}
              </p>
              <p className="mt-1 text-xs font-medium capitalize text-violet-700">{folder}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Media Gallery */}
      {!library || library.assets.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
          <p className="text-3xl">📷</p>
          <h3 className="mt-4 text-lg font-semibold text-slate-900">Nessun media</h3>
          <p className="mt-2 text-sm text-slate-500">
            Carica la tua prima immagine per iniziare a costruire la libreria media.
          </p>
        </div>
      ) : (
        <section className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-700">
            {library.assets.length} file caricati
          </h3>
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {library.assets.map((asset) => (
              <div key={asset.id} className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white">
                <div className="aspect-square bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={asset.thumbnailUrl || asset.url}
                    alt={asset.alt || asset.filename}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-3">
                  <p className="truncate text-xs font-medium text-slate-700">{asset.filename}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-[10px] text-slate-400">
                      {Math.round(asset.sizeBytes / 1024)}KB
                    </span>
                    <span className="inline-flex rounded-full bg-violet-100 px-1.5 py-0.5 text-[10px] text-violet-600">
                      {asset.folder}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
