export const dynamic = "force-dynamic";
import { getBusinessContext } from "@/lib/auth";
import { getMoonshotWorkspace } from "@/lib/moonshot-lab";

export async function GET() {
  const business = await getBusinessContext();
  const workspace = await getMoonshotWorkspace(business?.id);
  return Response.json(workspace);
}
