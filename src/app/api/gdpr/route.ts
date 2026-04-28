// GDPR API — Data Export & Erasure
import { getAuthContext } from "@/lib/auth";
import {
  exportCustomerData,
  eraseCustomerData,
  formatExportAsCSV,
  getAuditLog,
} from "@/lib/gdpr";

export async function GET(request: Request) {
  const auth = await getAuthContext();
  if (!auth) return Response.json({ error: "Non autorizzato" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");
  const customerId = searchParams.get("customerId");
  const format = (searchParams.get("format") as "json" | "csv") || "json";

  if (action === "export" && customerId) {
    try {
      const data = await exportCustomerData(customerId, auth.business.id, format);
      if (format === "csv") {
        const csv = formatExportAsCSV(data);
        return new Response(csv, {
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename="dati-cliente-${customerId}.csv"`,
          },
        });
      }
      return Response.json(data);
    } catch (err) {
      return Response.json(
        { error: err instanceof Error ? err.message : "Errore" },
        { status: 400 },
      );
    }
  }

  if (action === "audit") {
    const logs = await getAuditLog({
      businessId: auth.business.id,
      limit: parseInt(searchParams.get("limit") || "50"),
    });
    return Response.json({ logs });
  }

  return Response.json({ error: "Azione non specificata" }, { status: 400 });
}

export async function DELETE(request: Request) {
  const auth = await getAuthContext();
  if (!auth) return Response.json({ error: "Non autorizzato" }, { status: 401 });

  const body = await request.json();
  const { customerId, confirm } = body;

  if (!customerId || !confirm) {
    return Response.json(
      { error: "Conferma obbligatoria per la cancellazione dei dati" },
      { status: 400 },
    );
  }

  try {
    const result = await eraseCustomerData(
      customerId,
      auth.business.id,
      auth.user.id,
    );
    return Response.json(result);
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Errore" },
      { status: 400 },
    );
  }
}
