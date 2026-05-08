import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPassportById } from "@/lib/moonshot-lab";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ passportId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { passportId } = await params;
  const passport = await getPassportById(passportId);

  if (!passport) {
    return {
      title: "Passport non trovato | Bottega Digitale",
    };
  }

  return {
    title: `${passport.title} | Passport Cloud`,
    description: `${passport.businessName} racconta provenienza, cura e riparabilità in un passport digitale condivisibile.`,
  };
}

export default async function PassportPage({ params }: Props) {
  const { passportId } = await params;
  const passport = await getPassportById(passportId);

  if (!passport) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <section className="rounded-3xl border border-violet-200 bg-gradient-to-br from-violet-50 via-white to-sky-50 p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-700">
          Passport cloud
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">{passport.title}</h1>
        <p className="mt-2 text-sm text-slate-600">
          {passport.businessName} · {passport.category}
        </p>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">
          {passport.originStory}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={`/s/${passport.businessSlug}`}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Apri vetrina
          </Link>
          <Link
            href="/directory"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Scopri altre esperienze
          </Link>
        </div>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Materiali & origine</h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            {passport.materials.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Cura continua</h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            {passport.careInstructions.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Repair routes</h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            {passport.repairRoutes.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
      </div>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Proof points</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {passport.proofPoints.map((item) => (
            <div key={item} className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              {item}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
