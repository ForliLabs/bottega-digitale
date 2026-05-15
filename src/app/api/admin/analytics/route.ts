import { getPlatformStats, getAtRiskBusinesses, getCohortData } from "@/lib/platform-analytics";
import { getAuthContext } from "@/lib/auth";
import { apiError } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // Platform analytics is an admin-only route — require authentication.
  // The User model has no "admin" role yet, so we gate on being authenticated
  // (owner of any business). When a proper admin role is added, tighten this
  // to check `auth.user.role === "admin"`.
  const auth = await getAuthContext();
  if (!auth) {
    return apiError("Autenticazione richiesta", 401, "unauthorized");
  }

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
