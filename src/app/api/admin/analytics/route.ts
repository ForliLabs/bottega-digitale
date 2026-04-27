import { getPlatformStats, getAtRiskBusinesses, getCohortData } from "@/lib/platform-analytics";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const section = searchParams.get("section");

  if (section === "churn") {
    const atRisk = await getAtRiskBusinesses();
    return Response.json(atRisk);
  }

  if (section === "cohorts") {
    const cohorts = await getCohortData();
    return Response.json(cohorts);
  }

  const stats = await getPlatformStats();
  return Response.json(stats);
}
