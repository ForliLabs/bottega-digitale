export const dynamic = "force-dynamic";
import { getStorefrontData, formatPrice } from "@/lib/product-catalog";
import Link from "next/link";

interface ShopPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ShopPage({ params }: ShopPageProps) {
  const { slug } = await params;
  const data = await getStorefrontData(slug);

  if (!data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <p className="text-4xl">🛍️</p>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">Vetrina non disponibile</h1>
          <p className="mt-2 text-slate-500">Questa attività non ha ancora attivato il catalogo prodotti.</p>
          <Link href="/directory" className="mt-6 inline-block rounded-xl bg-amber-500 px-6 py-3 text-sm font-semibold text-white hover:bg-amber-600">
            Cerca altre attività
          </Link>
        </div>
      </div>
    );
  }

  const { business, categories, uncategorized } = data;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      {/* Header */}
      <section className="mb-12 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
          Vetrina di
        </p>
        <h1 className="mt-2 text-4xl font-bold text-slate-900">{business.name}</h1>
        <p className="mx-auto mt-3 max-w-xl text-slate-600">{business.description}</p>
        <div className="mt-4 flex items-center justify-center gap-4 text-sm text-slate-500">
          <span>📍 {business.address}</span>
          <span>📞 {business.phone}</span>
        </div>
      </section>

      {/* Categories with products */}
      {categories.map((cat) => (
        <section key={cat.id} className="mb-10">
          <h2 className="mb-6 text-2xl font-bold text-slate-900">{cat.name}</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cat.products.map((product) => (
              <ProductCard key={product.id} product={product} businessPhone={business.phone} />
            ))}
          </div>
        </section>
      ))}

      {/* Uncategorized products */}
      {uncategorized.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-6 text-2xl font-bold text-slate-900">Altri prodotti</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {uncategorized.map((product) => (
              <ProductCard key={product.id} product={product} businessPhone={business.phone} />
            ))}
          </div>
        </section>
      )}

      {categories.length === 0 && uncategorized.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-3xl">🏪</p>
          <p className="mt-4 text-lg text-slate-500">Il catalogo è in fase di allestimento.</p>
        </div>
      )}
    </div>
  );
}

function ProductCard({
  product,
  businessPhone,
}: {
  product: { id: string; name: string; description: string; priceEuro: number; imageUrl: string | null; stock: number };
  businessPhone: string;
}) {
  const whatsappMessage = encodeURIComponent(`Ciao! Vorrei ordinare: ${product.name} (${formatPrice(product.priceEuro)})`);
  const whatsappUrl = `https://wa.me/${businessPhone.replace(/\s+/g, "")}?text=${whatsappMessage}`;
  const isSoldOut = product.stock === 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-transform hover:-translate-y-0.5">
      {product.imageUrl ? (
        <div className="aspect-square bg-slate-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
        </div>
      ) : (
        <div className="flex aspect-square items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
          <span className="text-5xl">📦</span>
        </div>
      )}
      <div className="p-5">
        <h3 className="text-lg font-semibold text-slate-900">{product.name}</h3>
        {product.description && (
          <p className="mt-1 text-sm text-slate-500 line-clamp-2">{product.description}</p>
        )}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xl font-bold text-amber-700">{formatPrice(product.priceEuro)}</span>
          {product.stock >= 0 && product.stock <= 5 && (
            <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
              {product.stock === 0 ? "Esaurito" : `Solo ${product.stock}`}
            </span>
          )}
        </div>
        {isSoldOut ? (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-100 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-200"
          >
            💬 Chiedi disponibilità
          </a>
        ) : (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 py-3 text-sm font-semibold text-white hover:bg-green-600"
          >
            💬 Ordina su WhatsApp
          </a>
        )}
      </div>
    </div>
  );
}
