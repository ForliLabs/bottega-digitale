export const dynamic = "force-dynamic";
import { requireBusinessContext } from "@/lib/auth";
import { apiError, apiJson } from "@/lib/api-response";
import { getMoonshotWorkspace } from "@/lib/moonshot-lab";

export async function GET() {
  const business = await requireBusinessContext();
  if (!business) {
    return apiError("Autenticazione richiesta", 401, "unauthorized");
  }

  const workspace = await getMoonshotWorkspace(business.id);
  return apiJson(workspace);
}
