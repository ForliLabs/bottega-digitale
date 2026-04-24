import { prisma } from "@/lib/prisma";
import { getBusinessContext } from "@/lib/auth";
import { generateInvoiceFromBooking, getInvoiceStats, formatEuro } from "@/lib/e-invoice";

export const dynamic = "force-dynamic";

export async function GET() {
  const business = await getBusinessContext();
  if (!business) {
    return Response.json({ error: "Attività non trovata" }, { status: 404 });
  }

  const stats = await getInvoiceStats(business.id);
  if (!stats) {
    return Response.json({ invoices: [], message: "Profilo fiscale non configurato" });
  }

  return Response.json(stats);
}

export async function POST(request: Request) {
  try {
    const business = await getBusinessContext();
    if (!business) {
      return Response.json({ error: "Attività non trovata" }, { status: 404 });
    }

    const payload = await request.json();
    const action = payload.action || "generate";

    if (action === "generate") {
      const bookingId = payload.bookingId;
      if (!bookingId) {
        return Response.json({ error: "bookingId obbligatorio" }, { status: 400 });
      }

      const invoiceId = await generateInvoiceFromBooking(bookingId);
      if (!invoiceId) {
        return Response.json({ error: "Impossibile generare la fattura. Verifica il profilo fiscale." }, { status: 400 });
      }

      return Response.json({ invoiceId, message: "Fattura generata" }, { status: 201 });
    }

    if (action === "setup-fiscal") {
      const existing = await prisma.fiscalProfile.findUnique({ where: { businessId: business.id } });
      if (existing) {
        await prisma.fiscalProfile.update({
          where: { id: existing.id },
          data: {
            ragioneSociale: payload.ragioneSociale || existing.ragioneSociale,
            partitaIva: payload.partitaIva || existing.partitaIva,
            codiceFiscale: payload.codiceFiscale || existing.codiceFiscale,
            indirizzo: payload.indirizzo || existing.indirizzo,
            cap: payload.cap || existing.cap,
            citta: payload.citta || existing.citta,
            provincia: payload.provincia || existing.provincia,
            codiceDestinatario: payload.codiceDestinatario || existing.codiceDestinatario,
            pecDestinatario: payload.pecDestinatario || existing.pecDestinatario,
            regimeFiscale: payload.regimeFiscale || existing.regimeFiscale,
          },
        });
        return Response.json({ message: "Profilo fiscale aggiornato" });
      }

      await prisma.fiscalProfile.create({
        data: {
          businessId: business.id,
          ragioneSociale: payload.ragioneSociale || business.name,
          partitaIva: payload.partitaIva || "",
          codiceFiscale: payload.codiceFiscale || "",
          indirizzo: payload.indirizzo || business.address,
          cap: payload.cap || "47121",
          citta: payload.citta || business.city,
          provincia: payload.provincia || "FC",
          codiceDestinatario: payload.codiceDestinatario || "0000000",
          pecDestinatario: payload.pecDestinatario || null,
          regimeFiscale: payload.regimeFiscale || "RF01",
        },
      });

      return Response.json({ message: "Profilo fiscale creato" }, { status: 201 });
    }

    if (action === "update-status") {
      await prisma.invoice.update({
        where: { id: payload.invoiceId },
        data: { status: payload.status },
      });
      return Response.json({ message: `Stato aggiornato a: ${payload.status}` });
    }

    return Response.json({ error: "Azione non supportata" }, { status: 400 });
  } catch {
    return Response.json({ error: "Errore nella gestione fatture" }, { status: 500 });
  }
}
