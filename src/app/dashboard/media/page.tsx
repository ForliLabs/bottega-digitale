export const dynamic = "force-dynamic";
import { getBusinessContext } from "@/lib/auth";
import { getMediaLibrary, getStorageUsage } from "@/lib/media";
import { MediaManager } from "./media-manager";

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

      <MediaManager initialAssets={library?.assets ?? []} initialUsage={usage ?? { usedMB: 0, quotaMB: 100, percentUsed: 0 }} />
    </div>
  );
}
