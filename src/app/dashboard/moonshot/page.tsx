export const dynamic = "force-dynamic";
import Link from "next/link";
import { getBusinessContext } from "@/lib/auth";
import { getMoonshotWorkspace } from "@/lib/moonshot-lab";

const TONE_STYLES: Record<string, string> = {
  amber: "bg-amber-50 text-amber-800 border-amber-200",
  emerald: "bg-emerald-50 text-emerald-800 border-emerald-200",
  sky: "bg-sky-50 text-sky-800 border-sky-200",
  violet: "bg-violet-50 text-violet-800 border-violet-200",
};

export default async function MoonshotDashboardPage() {
  const business = await getBusinessContext();
  const workspace = await getMoonshotWorkspace(business?.id);
  const primaryPassport = workspace.passportCloud.passports[0];

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-violet-200 bg-gradient-to-br from-violet-50 via-white to-sky-50 p-8 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-700">
              Moonshot lab
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Da toolkit a sistema operativo di distretto
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Workspace strategico e prototipo eseguibile delle prossime 6 mosse radicali di
              Bottega Digitale, costruite sopra marketplace, partnership, loyalty, analytics,
              pubblicazione siti e operazioni multi-tenant già presenti nel repository.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/api/moonshot"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm"
            >
              API portfolio JSON
            </Link>
            <Link
              href="/experiences"
              className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm"
            >
              Apri tourism concierge
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {workspace.networkSummary.map((metric) => (
          <div
            key={metric.label}
            className={`rounded-2xl border p-5 shadow-sm ${TONE_STYLES[metric.tone || "amber"]}`}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-70">
              {metric.label}
            </p>
            <p className="mt-3 text-2xl font-bold">{metric.value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Innovation vectors</h2>
            <p className="mt-1 text-sm text-slate-500">
              Le traiettorie strutturali che trasformano il prodotto da SaaS verticale a
              infrastruttura economica locale.
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            Focus: {workspace.primaryBusiness.name}
          </span>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {workspace.innovationVectors.map((vector) => (
            <div key={vector.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-900">{vector.title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{vector.thesis}</p>
              <p className="mt-3 text-xs font-medium uppercase tracking-[0.16em] text-violet-700">
                Why now
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-500">{vector.whyNow}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">1. Artisan Twin OS</h2>
          <p className="mt-1 text-sm text-slate-500">{workspace.artisanTwin.northStar}</p>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {workspace.artisanTwin.metrics.map((metric) => (
              <div key={metric.label} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{metric.label}</p>
                <p className="mt-2 text-xl font-bold text-slate-900">{metric.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
                Missioni
              </h3>
              <div className="mt-3 space-y-3">
                {workspace.artisanTwin.missions.map((mission) => (
                  <div key={mission.title} className="rounded-xl border border-slate-200 p-4">
                    <p className="font-medium text-slate-900">{mission.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{mission.detail}</p>
                    <p className="mt-2 text-xs font-medium text-emerald-700">{mission.impact}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
                Simulazioni
              </h3>
              <div className="mt-3 space-y-3">
                {workspace.artisanTwin.simulations.map((simulation) => (
                  <div key={simulation.name} className="rounded-xl border border-violet-200 bg-violet-50 p-4">
                    <p className="font-medium text-slate-900">{simulation.name}</p>
                    <p className="mt-1 text-sm text-violet-900">{simulation.upside}</p>
                    <p className="mt-2 text-xs text-slate-500">Dipende da: {simulation.dependency}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">2. Distretto Graph</h2>
          <p className="mt-1 text-sm text-slate-500">
            Il quartiere diventa inventory cooperativo e non semplice elenco di botteghe.
          </p>
          <div className="mt-5 space-y-3">
            {workspace.districtGraph.edges.slice(0, 4).map((edge) => {
              const source = workspace.districtGraph.nodes.find((node) => node.id === edge.source);
              const target = workspace.districtGraph.nodes.find((node) => node.id === edge.target);
              return (
                <div key={`${edge.source}-${edge.target}`} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-slate-900">
                      {source?.label} ↔ {target?.label}
                    </p>
                    <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-semibold text-sky-700">
                      strength {edge.strength}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{edge.thesis}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-6">
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
              Bundle candidati
            </h3>
            <div className="mt-3 space-y-3">
              {workspace.districtGraph.bundles.map((bundle) => (
                <div key={bundle.name} className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <p className="font-medium text-slate-900">{bundle.name}</p>
                  <p className="mt-1 text-sm text-slate-600">{bundle.promise}</p>
                  <p className="mt-2 text-xs text-amber-700">{bundle.members.join(" · ")}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">3. Capacity Exchange</h2>
          <p className="mt-1 text-sm text-slate-500">
            Overflow, cancellazioni e slot morti vengono convertiti in capacità condivisa del distretto.
          </p>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Hotspots</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                {workspace.capacityExchange.hotspots.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Receivers</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                {workspace.capacityExchange.receivers.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {workspace.capacityExchange.matches.map((match) => (
              <div key={`${match.from}-${match.to}`} className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="font-medium text-slate-900">{match.from} → {match.to}</p>
                <p className="mt-1 text-sm text-slate-600">{match.reason}</p>
                <p className="mt-2 text-xs font-medium text-emerald-700">SLA {match.rerouteWindow}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">4. Passport Cloud</h2>
              <p className="mt-1 text-sm text-slate-500">
                Provenienza, cura e riparabilità diventano un asset pubblico, QR-ready e condivisibile.
              </p>
            </div>
            {primaryPassport && (
              <Link
                href={`/passports/${primaryPassport.id}`}
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
              >
                Apri passport demo
              </Link>
            )}
          </div>
          <div className="mt-5 space-y-4">
            {workspace.passportCloud.passports.map((passport) => (
              <div key={passport.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-medium text-slate-900">{passport.title}</p>
                    <p className="text-sm text-slate-500">{passport.businessName} · {passport.category}</p>
                  </div>
                  <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-700">
                    {passport.type}
                  </span>
                </div>
                <p className="mt-3 text-sm text-slate-600">{passport.originStory}</p>
                <p className="mt-3 text-xs text-slate-500">
                  {passport.materials.join(" · ")} · {passport.careInstructions[0]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">5. Tourism Concierge</h2>
              <p className="mt-1 text-sm text-slate-500">
                Il distretto viene venduto come esperienza coordinata per residenti, city breaker e destination wedding.
              </p>
            </div>
            <Link
              href="/experiences"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
            >
              Pagina pubblica esperienze
            </Link>
          </div>
          <div className="mt-5 space-y-3">
            {workspace.tourismConcierge.itineraries.map((itinerary) => (
              <div key={itinerary.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-slate-900">{itinerary.title}</p>
                  <span className="text-xs font-medium text-slate-500">{itinerary.duration}</span>
                </div>
                <p className="mt-1 text-sm text-slate-600">{itinerary.promise}</p>
                <p className="mt-2 text-xs text-amber-700">{itinerary.stops.join(" → ")}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">6. Guild Academy</h2>
          <p className="mt-1 text-sm text-slate-500">
            Successione, training e nuova supply vengono trattati come una pipeline di distretto.
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {workspace.guildAcademy.skillClusters.map((cluster) => (
              <div key={cluster.name} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-slate-900">{cluster.name}</p>
                  <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700">
                    {cluster.demandScore}/100
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-500">{cluster.businesses.join(" · ")}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 space-y-3">
            {workspace.guildAcademy.residencies.map((residency) => (
              <div key={residency.title} className="rounded-xl border border-sky-200 bg-sky-50 p-4">
                <p className="font-medium text-slate-900">{residency.title}</p>
                <p className="mt-1 text-sm text-slate-600">Host: {residency.hosts.join(" · ")}</p>
                <p className="mt-1 text-sm text-slate-600">Durata: {residency.duration}</p>
                <p className="mt-2 text-xs text-sky-700">{residency.outcome}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Portfolio build sequence</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {workspace.featurePortfolio.map((feature) => (
              <div key={feature.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-violet-700">{feature.buildPhase}</p>
                <p className="mt-2 font-medium text-slate-900">{feature.title}</p>
                <p className="mt-1 text-sm text-slate-600">{feature.summary}</p>
                <p className="mt-3 text-xs text-slate-500">{feature.dependencies.join(" · ")}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Dependency graph</h2>
          <div className="mt-5 space-y-3">
            {workspace.dependencyGraph.map((node) => (
              <div key={node.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="font-medium text-slate-900">{node.title}</p>
                <p className="mt-2 text-sm text-slate-500">
                  {node.dependsOn.length > 0
                    ? `Dipende da: ${node.dependsOn.join(", ")}`
                    : "Nodo fondazionale del portfolio."}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-xl border border-violet-200 bg-violet-50 p-4">
            <p className="text-sm font-semibold text-violet-900">Build order</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {workspace.buildSequence.map((step) => (
                <li key={step}>• {step}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
