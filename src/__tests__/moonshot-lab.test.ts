import { describe, expect, it } from "vitest";
import {
  DEMO_MOONSHOT_NETWORK,
  buildArtisanTwin,
  buildCapacityExchange,
  buildDistrictGraph,
  buildGuildAcademy,
  buildMoonshotWorkspace,
  buildPassportCloud,
  buildTourismConcierge,
} from "@/lib/moonshot-lab";

describe("Moonshot Lab", () => {
  it("builds a complete workspace with six feature cards", () => {
    const workspace = buildMoonshotWorkspace(DEMO_MOONSHOT_NETWORK, "biz-marco");

    expect(workspace.primaryBusiness.id).toBe("biz-marco");
    expect(workspace.innovationVectors).toHaveLength(4);
    expect(workspace.featurePortfolio).toHaveLength(6);
    expect(workspace.dependencyGraph).toHaveLength(6);
  });

  it("computes an artisan twin with autonomy score and missions", () => {
    const twin = buildArtisanTwin(DEMO_MOONSHOT_NETWORK[0], DEMO_MOONSHOT_NETWORK);

    expect(twin.autonomyScore).toBeGreaterThan(0);
    expect(twin.metrics).toHaveLength(4);
    expect(twin.missions.length).toBeGreaterThanOrEqual(3);
    expect(twin.simulations.length).toBeGreaterThanOrEqual(3);
  });

  it("creates district graph edges and bundle opportunities", () => {
    const graph = buildDistrictGraph(DEMO_MOONSHOT_NETWORK);

    expect(graph.nodes).toHaveLength(DEMO_MOONSHOT_NETWORK.length);
    expect(graph.edges.length).toBeGreaterThan(0);
    expect(graph.bundles.length).toBeGreaterThan(0);
  });

  it("matches hotspots to receivers in the capacity exchange", () => {
    const exchange = buildCapacityExchange(DEMO_MOONSHOT_NETWORK);

    expect(exchange.hotspots.length).toBeGreaterThan(0);
    expect(exchange.receivers.length).toBeGreaterThan(0);
    expect(exchange.matches.length).toBeGreaterThan(0);
  });

  it("generates passport records with care and repair routes", () => {
    const passports = buildPassportCloud(DEMO_MOONSHOT_NETWORK[0], DEMO_MOONSHOT_NETWORK);

    expect(passports.passports.length).toBeGreaterThan(0);
    expect(passports.passports[0]?.materials.length).toBeGreaterThan(0);
    expect(passports.passports[0]?.repairRoutes.length).toBeGreaterThan(0);
  });

  it("returns itineraries and guild academy programs", () => {
    const concierge = buildTourismConcierge(DEMO_MOONSHOT_NETWORK);
    const academy = buildGuildAcademy(DEMO_MOONSHOT_NETWORK);

    expect(concierge.itineraries).toHaveLength(3);
    expect(concierge.itineraries[0]?.stops.length).toBeGreaterThan(0);
    expect(academy.skillClusters.length).toBeGreaterThan(0);
    expect(academy.residencies.length).toBeGreaterThan(0);
  });
});
