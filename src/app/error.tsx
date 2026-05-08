"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  reset: () => void;
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-4 text-center">
      <p className="text-4xl" aria-hidden="true">🧯</p>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">Qualcosa è andato storto</h1>
      <p className="mt-2 text-sm leading-6 text-slate-500">
        Ricarica la pagina oppure riprova tra qualche secondo. Se il problema continua, contattaci.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => unstable_retry()}
          className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600"
        >
          Riprova
        </button>
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Ripristina
        </button>
        <a href="mailto:ciao@bottegadigitale.it" className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          Contatta il supporto
        </a>
      </div>
    </div>
  );
}
