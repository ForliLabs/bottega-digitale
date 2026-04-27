export default function AccountantLoginPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <p className="text-4xl">🧾</p>
          <h1 className="mt-4 text-3xl font-bold text-slate-900">
            Portale Commercialista
          </h1>
          <p className="mt-2 text-slate-600">
            Accedi per visualizzare i dati fiscali dei tuoi clienti su Bottega Digitale.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <form className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="commercialista@studio.it"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Accedi
            </button>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-6">
            <p className="text-center text-sm text-slate-500">
              Non hai un account?{" "}
              <span className="font-medium text-blue-600">Registrati</span>
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-slate-900">Come funziona</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>1. Il tuo cliente genera un codice invito dalla dashboard</li>
            <li>2. Inserisci il codice nel tuo portale per collegare il cliente</li>
            <li>3. Accedi a fatture, IVA trimestrale ed esportazioni in formato studio</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
