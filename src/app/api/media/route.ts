// Media Upload & Library API
import { getAuthContext } from "@/lib/auth";
import { saveMediaAsset, getMediaLibrary, deleteMediaAsset } from "@/lib/media";
import type { MediaFolder } from "@/lib/media";

export async function GET(request: Request) {
  const auth = await getAuthContext();
  if (!auth) {
    return Response.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const folder = searchParams.get("folder") as MediaFolder | undefined;

  const library = await getMediaLibrary(auth.business.id, folder || undefined);
  return Response.json(library);
}

export async function POST(request: Request) {
  const auth = await getAuthContext();
  if (!auth) {
    return Response.json({ error: "Non autorizzato" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as MediaFolder) || "general";
    const alt = formData.get("alt") as string | null;

    if (!file) {
      return Response.json({ error: "Nessun file selezionato" }, { status: 400 });
    }

    const result = await saveMediaAsset({
      businessId: auth.business.id,
      file,
      folder,
      alt: alt || undefined,
    });

    if ("error" in result) {
      return Response.json({ error: result.error }, { status: 400 });
    }

    return Response.json(result, { status: 201 });
  } catch {
    return Response.json({ error: "Errore durante il caricamento" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const auth = await getAuthContext();
  if (!auth) {
    return Response.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const assetId = searchParams.get("id");

  if (!assetId) {
    return Response.json({ error: "ID file mancante" }, { status: 400 });
  }

  const result = await deleteMediaAsset(assetId, auth.business.id);

  if ("error" in result) {
    return Response.json({ error: result.error }, { status: 404 });
  }

  return Response.json({ success: true });
}
