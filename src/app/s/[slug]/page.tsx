export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { generateBusinessMetadata, generateLocalBusinessJsonLd, generateBreadcrumbJsonLd } from "@/lib/seo";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const business = await prisma.business.findUnique({ where: { slug } });
  if (!business) return { title: "Pagina non trovata" };
  return generateBusinessMetadata(business);
}

function renderStars(rating: number) {
  return `${"★".repeat(Math.round(rating))}${"☆".repeat(5 - Math.round(rating))}`;
}

export default async function PublishedWebsitePage({ params }: PageProps) {
  const { slug } = await params;
  const business = await prisma.business.findUnique({
    where: { slug },
    include: {
      services: { orderBy: { priceEuro: "asc" } },
      reviews: { orderBy: { date: "desc" }, take: 5 },
    },
  });

  if (!business || !business.websitePublished) {
    notFound();
  }

  const openingHours = JSON.parse(business.openingHours || "[]") as string[];
  const avgRating =
    business.reviews.length > 0
      ? business.reviews.reduce((sum, r) => sum + r.rating, 0) / business.reviews.length
      : 0;

  const localBusinessJsonLd = generateLocalBusinessJsonLd({
    name: business.name,
    slug: business.slug,
    category: business.category,
    description: business.description,
    address: business.address,
    city: business.city,
    phone: business.phone,
    email: business.email,
    openingHours,
    avgRating: avgRating > 0 ? avgRating : undefined,
    reviewCount: business.reviews.length > 0 ? business.reviews.length : undefined,
  });

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Bottega Digitale", url: "/" },
    { name: "Directory", url: "/directory" },
    { name: business.name, url: `/s/${business.slug}` },
  ]);

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {/* Hero */}
      <section className="bg-gradient-to-br from-amber-50 via-white to-orange-50 px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <span className="rounded-full bg-amber-100 px-4 py-1 text-sm font-semibold text-amber-800">
            {business.category} · {business.city}
          </span>
          <h1 className="mt-6 text-4xl font-extrabold text-slate-900 sm:text-5xl">
            {business.name}
          </h1>
          <p className="mt-4 text-lg text-slate-600">{business.description}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href={`tel:${business.phone}`}
              className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              📞 Chiama ora
            </a>
            <a
              href={`https://wa.me/${business.phone.replace(/\s+/g, "").replace("+", "")}`}
              className="rounded-xl border border-emerald-600 px-6 py-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
            >
              💬 WhatsApp
            </a>
            <Link
              href="/dashboard/bookings"
              className="rounded-xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              📅 Prenota online
            </Link>
          </div>
        </div>
      </section>

      {/* Services */}
      {business.services.length > 0 && (
        <section className="mx-auto max-w-4xl px-4 py-12">
          <h2 className="text-2xl font-bold text-slate-900">Servizi</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {business.services.map((service) => (
              <div
                key={service.id}
                className="flex items-center justify-between rounded-2xl bg-slate-50 px-5 py-4"
              >
                <div>
                  <p className="font-medium text-slate-900">{service.name}</p>
                  <p className="text-sm text-slate-500">{service.durationMinutes} min</p>
                </div>
                <span className="text-lg font-bold text-slate-900">€{service.priceEuro}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Info + Hours */}
      <section className="bg-slate-50 px-4 py-12">
        <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">📍 Dove siamo</h2>
            <p className="mt-3 text-sm text-slate-600">{business.address}</p>
            <p className="mt-1 text-sm text-slate-600">{business.phone}</p>
            <p className="mt-1 text-sm text-slate-600">{business.email}</p>
          </div>
          {openingHours.length > 0 && (
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">🕐 Orari</h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                {openingHours.map((hour) => (
                  <li key={hour}>{hour}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* Reviews */}
      {business.reviews.length > 0 && (
        <section className="mx-auto max-w-4xl px-4 py-12">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-slate-900">Recensioni</h2>
            <span className="text-lg text-amber-500">{renderStars(avgRating)} {avgRating.toFixed(1)}</span>
          </div>
          <div className="mt-6 space-y-4">
            {business.reviews.map((review) => (
              <div key={review.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-slate-900">{review.author}</p>
                  <span className="text-amber-500">{renderStars(review.rating)}</span>
                </div>
                <p className="mt-2 text-sm text-slate-600">&ldquo;{review.comment}&rdquo;</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Footer with nearby businesses */}
      <section className="bg-slate-900 px-4 py-12 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-400">
            Bottega Digitale
          </p>
          <p className="mt-2 text-lg">{business.name} · {business.address}</p>
          <div className="mt-6 flex justify-center gap-4">
            <Link
              href="/directory"
              className="text-sm text-slate-400 hover:text-white"
            >
              Scopri altre attività a {business.city} →
            </Link>
          </div>
        </div>
      </section>

      {/* JSON-LD Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            name: business.name,
            description: business.description,
            address: {
              "@type": "PostalAddress",
              streetAddress: business.address,
              addressLocality: business.city,
              addressCountry: "IT",
            },
            telephone: business.phone,
            email: business.email,
            aggregateRating: avgRating > 0
              ? {
                  "@type": "AggregateRating",
                  ratingValue: avgRating.toFixed(1),
                  reviewCount: business.reviews.length,
                }
              : undefined,
          }),
        }}
      />
    </div>
  );
}
