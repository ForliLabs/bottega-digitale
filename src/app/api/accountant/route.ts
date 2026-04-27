import { registerAccountant, authenticateAccountant, claimInviteCode, getAccountantDashboard, getClientFinancialData, generateInvoiceCSV } from "@/lib/accountant-portal";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const accountantId = searchParams.get("accountantId");
  const businessId = searchParams.get("businessId");

  if (!accountantId) {
    return Response.json({ error: "accountantId richiesto" }, { status: 400 });
  }

  if (businessId) {
    // Get specific client's financial data
    const data = await getClientFinancialData(accountantId, businessId);
    if (!data) {
      return Response.json({ error: "Accesso non autorizzato" }, { status: 403 });
    }

    // Check if CSV export requested
    if (searchParams.get("export") === "csv") {
      const csv = generateInvoiceCSV(data.invoices);
      return new Response(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="fatture-${businessId}.csv"`,
        },
      });
    }

    return Response.json(data);
  }

  // Get dashboard overview
  const dashboard = await getAccountantDashboard(accountantId);
  return Response.json(dashboard);
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    if (payload.action === "register") {
      const accountant = await registerAccountant({
        email: payload.email,
        name: payload.name,
        studio: payload.studio,
        password: payload.password,
      });
      return Response.json({
        id: accountant.id,
        referralCode: accountant.referralCode,
      }, { status: 201 });
    }

    if (payload.action === "login") {
      const accountant = await authenticateAccountant(payload.email, payload.password);
      if (!accountant) {
        return Response.json({ error: "Credenziali non valide" }, { status: 401 });
      }
      return Response.json({ id: accountant.id, name: accountant.name });
    }

    if (payload.action === "claim_invite") {
      const result = await claimInviteCode(payload.accountantId, payload.inviteCode);
      if ("error" in result) {
        return Response.json({ error: result.error }, { status: 400 });
      }
      return Response.json(result);
    }

    return Response.json({ error: "Azione non valida" }, { status: 400 });
  } catch {
    return Response.json(
      { error: "Errore nella gestione del portale commercialista." },
      { status: 400 }
    );
  }
}
