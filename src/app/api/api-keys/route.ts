// API Keys Management Endpoint
import { getAuthContext } from "@/lib/auth";
import { createApiKey, listApiKeys, revokeApiKey } from "@/lib/webhook-api";

export async function GET() {
  const auth = await getAuthContext();
  if (!auth) return Response.json({ error: "Non autorizzato" }, { status: 401 });

  const keys = await listApiKeys(auth.business.id);
  return Response.json({ keys });
}

export async function POST(request: Request) {
  const auth = await getAuthContext();
  if (!auth) return Response.json({ error: "Non autorizzato" }, { status: 401 });

  const body = await request.json();
  if (!body.name) {
    return Response.json({ error: "Nome chiave obbligatorio" }, { status: 400 });
  }

  const result = await createApiKey({
    businessId: auth.business.id,
    name: body.name,
    scopes: body.scopes,
    rateLimit: body.rateLimit,
  });

  return Response.json(result, { status: 201 });
}

export async function DELETE(request: Request) {
  const auth = await getAuthContext();
  if (!auth) return Response.json({ error: "Non autorizzato" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const keyId = searchParams.get("id");
  if (!keyId) return Response.json({ error: "ID chiave mancante" }, { status: 400 });

  const result = await revokeApiKey(keyId, auth.business.id);
  if ("error" in result) return Response.json(result, { status: 404 });

  return Response.json({ success: true });
}
