export const dynamic = "force-dynamic";
import {
  getDashboardBusinessProfile,
  getDashboardReviews,
} from "@/lib/dashboard-data";
import { calculateAverageRating } from "@/lib/data";
import { CopyTextButton } from "@/components/ui/copy-text-button";

const dateFormatter = new Intl.DateTimeFormat("it-IT", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function renderStars(rating: number) {
  return `${"★".repeat(rating)}${"☆".repeat(5 - rating)}`;
}

export default async function ReviewsPage() {
  const { data: businessProfile } = await getDashboardBusinessProfile();
  const { data: reviews } = await getDashboardReviews();
  const averageRating = calculateAverageRating(reviews);

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
          Google Autopilot
        </p>
        <h1 className="text-3xl font-bold text-slate-900">Recensioni e risposte suggerite</h1>
        <p className="max-w-3xl text-sm leading-6 text-slate-600">
          Monitora la reputazione online di {businessProfile.name} e usa bozze pronte per rispondere in modo rapido e coerente.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Valutazione media</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {averageRating.toLocaleString("it-IT", {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            })}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Recensioni analizzate</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{reviews.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Bozze pronte</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{reviews.filter((r) => r.responseSuggestion).length}</p>
        </div>
      </section>

      <section className="space-y-4">
        {reviews.map((review) => (
          <article key={review.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold text-slate-900">{review.author}</h2>
                  <span aria-label={`Valutazione: ${review.rating} su 5`}>
                    <span aria-hidden="true" className="text-amber-500">{renderStars(review.rating)}</span>
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-500">Pubblicata il {dateFormatter.format(new Date(review.date))}</p>
                <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-700">“{review.comment}”</p>
              </div>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                Suggerimento pronto
              </span>
            </div>
            <div className="mt-5 rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
                  Risposta suggerita
                </p>
                {review.responseSuggestion && (
                  <CopyTextButton text={review.responseSuggestion} />
                )}
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-700">{review.responseSuggestion}</p>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
