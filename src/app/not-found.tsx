import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-4 text-center">
      <p className="text-5xl" aria-hidden="true">🔎</p>
      <h1 className="mt-4 text-3xl font-bold text-slate-900">Pagina non trovata</h1>
      <p className="mt-2 text-sm leading-6 text-slate-500">
        Il link potrebbe essere scaduto oppure la pagina non è più disponibile.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/directory" className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600">
          Vai alla directory
        </Link>
        <Link href="/" className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          Torna alla home
        </Link>
      </div>
    </div>
  );
}
