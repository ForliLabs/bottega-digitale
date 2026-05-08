"use client";

export default function DashboardError({
  reset,
  unstable_retry,
}: {
  reset: () => void;
  unstable_retry: () => void;
}) {
  return (
    <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-center">
      <p className="text-3xl" aria-hidden="true">⚠️</p>
      <h1 className="mt-3 text-xl font-semibold text-red-900">Impossibile caricare questa sezione</h1>
      <p className="mt-2 text-sm text-red-700">Riprova ora o torna alla panoramica della dashboard.</p>
      <div className="mt-4 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => unstable_retry()}
          className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
        >
          Riprova
        </button>
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
        >
          Ripristina
        </button>
      </div>
    </div>
  );
}
