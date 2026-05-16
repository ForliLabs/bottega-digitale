export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

interface DirectoryPageProps {
  searchParams: Promise<{ category?: string; q?: string }>;
}

export default async function DirectoryPage({ searchParams }: DirectoryPageProps) {
  const filters = await searchParams;
  const selectedCategory = filters.category || "";
  const query = filters.q || "";

  const businesses = await prisma.business.findMany({
    where: {
      websitePublished: true,
      ...(selectedCategory ? { category: selectedCategory } : {}),
      ...(query
        ? {
            OR: [
              { name: { contains: query } },
              { description: { contains: query } },
              { category: { contains: query } },
            ],
          }
        : {}),
    },
    select: {
      id: true,
      name: true,
      slug: true,
      category: true,
      city: true,
      address: true,
      phone: true,
      description: true,
      _count: { select: { reviews: true } },
    },
    orderBy: { name: "asc" },
  });

  const categories = [...new Set(businesses.map((b) => b.category))];

  // Get average ratings
  const businessesWithRatings = await Promise.all(
    businesses.map(async (biz) => {
      const avg = await prisma.review.aggregate({
        where: { businessId: biz.id },
        _avg: { rating: true },
      });
      return { ...biz, avgRating: avg._avg.rating || 0 };
    })
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
          Bottega Digitale
        </p>
        <h1 className="mt-3 text-4xl font-bold text-slate-900">Attività di Forlì</h1>
        <p className="mt-4 text-lg text-slate-600">
          Scopri le botteghe, gli artigiani e le piccole attività di Forlì. Prenota online, leggi le
          recensioni e trova i servizi di cui hai bisogno.
        </p>
      </section>

      <section className="mx-auto mt-8 max-w-3xl rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <form className="grid gap-3 md:grid-cols-[1fr_auto]">
          <label className="sr-only" htmlFor="directory-search">Cerca attività</label>
          <input
            id="directory-search"
            name="q"
            defaultValue={query}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
            placeholder="Cerca per nome, categoria o descrizione"
          />
          <button type="submit" className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">
            Cerca
          </button>
          {selectedCategory ? <input type="hidden" name="category" value={selectedCategory} /> : null}
        </form>
        {categories.length > 0 && (
          <nav aria-label="Filtra per categoria" className="mt-4 flex flex-wrap gap-2">
            <Link
              href={query ? `/directory?q=${encodeURIComponent(query)}` : "/directory"}
              aria-current={!selectedCategory ? "page" : undefined}
              className={`rounded-full px-4 py-2 text-sm font-medium ${!selectedCategory ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`}
            >
              Tutte
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat}
                href={`/directory?category=${encodeURIComponent(cat)}${query ? `&q=${encodeURIComponent(query)}` : ""}`}
                aria-current={selectedCategory === cat ? "page" : undefined}
                className={`rounded-full px-4 py-2 text-sm font-medium ${selectedCategory === cat ? "bg-amber-500 text-white" : "bg-amber-100 text-amber-800"}`}
              >
                {cat}
              </Link>
            ))}
          </nav>
        )}
      </section>

      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {businessesWithRatings.map((biz) => (
          <Link
            key={biz.id}
            href={`/s/${biz.slug}`}
            className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                {biz.category}
              </span>
              {biz.avgRating > 0 && (
                <span className="text-sm text-amber-500">
                  {"★".repeat(Math.round(biz.avgRating))} {biz.avgRating.toFixed(1)}
                </span>
              )}
            </div>
            <h2 className="mt-4 text-xl font-bold text-slate-900 group-hover:text-amber-700">
              {biz.name}
            </h2>
            <p className="mt-2 text-sm text-slate-600 line-clamp-2">{biz.description}</p>
            <div className="mt-4 space-y-1 text-sm text-slate-500">
              <p>📍 {biz.address || biz.city}</p>
              {biz.phone && <p>📞 {biz.phone}</p>}
            </div>
            <p className="mt-3 text-xs text-slate-400">
              {biz._count.reviews} recensioni
            </p>
          </Link>
        ))}
      </div>

      {businesses.length === 0 && (
        <div className="mt-12 text-center">
          <span className="text-6xl">🏪</span>
          <h2 className="mt-4 text-xl font-bold text-slate-900">
            {query || selectedCategory ? "Nessun risultato per i filtri scelti" : "Nessuna attività ancora"}
          </h2>
          <p className="mt-2 text-slate-600">
            {query || selectedCategory
              ? "Prova a cambiare categoria o usare una ricerca più ampia."
              : "Sii il primo a registrarti su Bottega Digitale!"}
          </p>
          <Link
            href={query || selectedCategory ? "/directory" : "/register"}
            className="mt-6 inline-block rounded-xl bg-amber-600 px-8 py-3 text-sm font-semibold text-white hover:bg-amber-700"
          >
            {query || selectedCategory ? "Rimuovi filtri" : "Registra la tua attività"}
          </Link>
        </div>
      )}
    </div>
  );
}
