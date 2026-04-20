export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { getBusinessContext } from "@/lib/auth";
import { getWeeklyContentSuggestions, isAIConfigured } from "@/lib/ai-content";

const dateFormatter = new Intl.DateTimeFormat("it-IT", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export default async function SocialPage() {
  const business = await getBusinessContext();
  const aiReady = isAIConfigured();

  const posts = business
    ? await prisma.socialPost.findMany({
        where: { businessId: business.id },
        orderBy: { createdAt: "desc" },
        take: 20,
      })
    : [];

  const suggestions = business
    ? getWeeklyContentSuggestions(business.category)
    : getWeeklyContentSuggestions("default");

  const published = posts.filter((p) => p.status === "published");
  const scheduled = posts.filter((p) => p.status === "scheduled");
  const drafts = posts.filter((p) => p.status === "draft");

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
          Social Media AI
        </p>
        <h1 className="text-3xl font-bold text-slate-900">Contenuti social</h1>
        <p className="max-w-3xl text-sm leading-6 text-slate-600">
          Genera post per Instagram e Facebook con l&apos;intelligenza artificiale. Carica una foto e lascia
          fare al sistema.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Pubblicati</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{published.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Programmati</p>
          <p className="mt-2 text-3xl font-bold text-amber-600">{scheduled.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Bozze</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{drafts.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">AI</p>
          <p className="mt-2 text-lg font-bold">
            {aiReady ? (
              <span className="text-emerald-600">✅ Attiva</span>
            ) : (
              <span className="text-amber-600">📝 Template</span>
            )}
          </p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">Post recenti</h2>
          </div>
          {posts.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {posts.map((post) => (
                <div key={post.id} className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        post.status === "published"
                          ? "bg-emerald-100 text-emerald-700"
                          : post.status === "scheduled"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {post.status === "published" ? "Pubblicato" : post.status === "scheduled" ? "Programmato" : "Bozza"}
                    </span>
                    <span className="text-xs text-slate-400">
                      {post.platform} · {dateFormatter.format(new Date(post.createdAt))}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-700">{post.caption}</p>
                  {post.hashtags && (
                    <p className="mt-1 text-xs text-amber-600">
                      {post.hashtags.split(",").join(" ")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-12 text-center text-sm text-slate-500">
              Nessun post ancora. Usa il generatore AI per creare il tuo primo contenuto!
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">📅 Calendario settimanale</h2>
            <div className="mt-4 space-y-3">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion}
                  className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600"
                >
                  {suggestion}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <h3 className="font-semibold text-amber-800">💡 Come funziona</h3>
            <ol className="mt-3 space-y-2 text-sm text-amber-700">
              <li>1. Scatta una foto del prodotto o del risultato</li>
              <li>2. Descrivi brevemente l&apos;occasione</li>
              <li>3. L&apos;AI genera caption e hashtag in italiano</li>
              <li>4. Rivedi, modifica e pubblica</li>
            </ol>
          </div>
        </div>
      </section>
    </div>
  );
}
