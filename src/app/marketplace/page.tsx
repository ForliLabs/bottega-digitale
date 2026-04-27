export const dynamic = "force-dynamic";
import Link from "next/link";
import {
  searchMarketplace,
  getMarketplaceStats,
  MARKETPLACE_CATEGORIES,
  GIFT_CARD_AMOUNTS,
  getActiveCampaigns,
} from "@/lib/marketplace";

export default async function MarketplacePage() {
  const [listings, stats, campaigns] = await Promise.all([
    searchMarketplace({ featured: true }),
    getMarketplaceStats(),
    Promise.resolve(getActiveCampaigns()),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Hero */}
      <section className="mb-16 text-center">
        <h1 className="text-4xl font-bold text-slate-900 sm:text-5xl">
          Scopri le botteghe di{" "}
          <span className="text-amber-600">Forlì</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
          Servizi, prodotti e buoni regalo dalle migliori attività artigiane e commerciali della città.
        </p>

        {/* Stats */}
        <div className="mx-auto mt-8 flex max-w-lg justify-center gap-8">
          <div>
            <p className="text-2xl font-bold text-slate-900">{stats.totalBusinesses}</p>
            <p className="text-sm text-slate-500">Attività</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{stats.totalListings}</p>
            <p className="text-sm text-slate-500">Offerte</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{stats.totalGiftCards}</p>
            <p className="text-sm text-slate-500">Buoni attivi</p>
          </div>
        </div>
      </section>

      {/* Active campaigns */}
      {campaigns.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-bold text-slate-900">🎁 Campagne attive</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-6"
              >
                <p className="text-2xl">{campaign.emoji}</p>
                <h3 className="mt-2 text-lg font-bold text-slate-900">{campaign.name}</h3>
                <p className="mt-1 text-sm text-slate-600">{campaign.description}</p>
                <p className="mt-2 text-sm font-semibold text-amber-700">
                  +{campaign.bonusPercent}% bonus su tutti i buoni regalo!
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Gift Cards */}
      <section className="mb-12">
        <h2 className="mb-6 text-xl font-bold text-slate-900">🎁 Buoni Regalo</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {GIFT_CARD_AMOUNTS.map((amount) => (
            <div
              key={amount}
              className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm transition-transform hover:-translate-y-1"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
                <span className="text-2xl">🎁</span>
              </div>
              <p className="mt-4 text-3xl font-bold text-slate-900">€{amount}</p>
              <p className="mt-1 text-sm text-slate-500">Bottega Credits</p>
              <p className="mt-2 text-xs text-slate-400">Valido in tutte le attività</p>
              <button className="mt-4 w-full rounded-xl bg-amber-500 py-2.5 text-sm font-semibold text-white hover:bg-amber-600">
                Acquista
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="mb-12">
        <h2 className="mb-6 text-xl font-bold text-slate-900">Categorie</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {MARKETPLACE_CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/marketplace?category=${cat.slug}`}
              className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm transition-colors hover:border-amber-300 hover:bg-amber-50"
            >
              <span className="text-2xl">{cat.icon}</span>
              <p className="mt-2 text-sm font-medium text-slate-900">{cat.name}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured listings */}
      <section>
        <h2 className="mb-6 text-xl font-bold text-slate-900">⭐ In evidenza</h2>
        {listings.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-16 text-center">
            <p className="text-3xl">🏪</p>
            <h3 className="mt-4 text-lg font-semibold text-slate-900">Il marketplace sta crescendo</h3>
            <p className="mt-2 text-sm text-slate-500">
              Le attività stanno aggiungendo i loro servizi e prodotti. Torna presto!
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                {listing.imageUrl ? (
                  <div className="aspect-video bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={listing.imageUrl} alt={listing.title} className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
                    <span className="text-4xl">{listing.type === "product" ? "📦" : "✨"}</span>
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                      {listing.type === "product" ? "Prodotto" : "Servizio"}
                    </span>
                    <span className="text-xs text-slate-400">{listing.category}</span>
                  </div>
                  <h3 className="mt-2 text-lg font-semibold text-slate-900">{listing.title}</h3>
                  <p className="mt-1 text-sm text-slate-500 line-clamp-2">{listing.description}</p>
                  {listing.business && (
                    <p className="mt-2 text-xs text-amber-700">
                      📍 {listing.business.name} — {listing.business.city}
                    </p>
                  )}
                  {listing.priceEuro && (
                    <p className="mt-2 text-lg font-bold text-amber-700">
                      €{listing.priceEuro.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
