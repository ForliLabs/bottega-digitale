"use client";

export default function DashboardError({ reset }: { reset: () => void }) {
  return (
    <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-center">
      <p className="text-3xl" aria-hidden="true">⚠️</p>
      <h1 className="mt-3 text-xl font-semibold text-red-900">Impossibile caricare questa sezione</h1>
      <p className="mt-2 text-sm text-red-700">Riprova ora o torna alla panoramica della dashboard.</p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
      >
        Riprova
      </button>
    </div>
  );
}
