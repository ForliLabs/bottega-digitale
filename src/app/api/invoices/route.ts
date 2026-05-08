import { prisma } from "@/lib/prisma";
import { requireBusinessContext } from "@/lib/auth";
import { apiError, apiJson, ensureSameOrigin } from "@/lib/api-response";
import { generateInvoiceFromBooking, getInvoiceStats } from "@/lib/e-invoice";
import { validatePartitaIva } from "@/lib/association-portal";

export const dynamic = "force-dynamic";

const VALID_INVOICE_STATUSES = ["bozza", "inviata", "consegnata", "rifiutata"] as const;

type InvoiceStatus = (typeof VALID_INVOICE_STATUSES)[number];

function normalizeText(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function validateFiscalProfile(payload: Record<string, unknown>) {
  const partitaIva = normalizeText(payload.partitaIva);
  const codiceFiscale = normalizeText(payload.codiceFiscale);

  if (!partitaIva || !validatePartitaIva(partitaIva)) {
    return { error: apiError("Inserisci una Partita IVA valida a 11 cifre.", 400, "invalid_partita_iva") };
  }

  if (!codiceFiscale || codiceFiscale.length < 11) {
    return { error: apiError("Codice Fiscale obbligatorio.", 400, "invalid_codice_fiscale") };
  }

  return { partitaIva, codiceFiscale };
}

export async function GET() {
  const business = await requireBusinessContext();
  if (!business) {
    return apiError("Autenticazione richiesta", 401, "unauthorized");
  }

  const stats = await getInvoiceStats(business.id);
  if (!stats) {
    return apiJson({ invoices: [], message: "Profilo fiscale non configurato" });
  }

  return apiJson(stats);
}

export async function POST(request: Request) {
  const csrfError = ensureSameOrigin(request);
  if (csrfError) {
    return csrfError;
  }

  try {
    const business = await requireBusinessContext();
    if (!business) {
      return apiError("Autenticazione richiesta", 401, "unauthorized");
    }

    const payload = await request.json();
    const action = payload.action || "generate";

    if (action === "generate") {
      const bookingId = normalizeText(payload.bookingId);
      if (!bookingId) {
        return apiError("bookingId obbligatorio", 400, "booking_id_required");
      }

      const invoiceId = await generateInvoiceFromBooking(bookingId, business.id);
      if (!invoiceId) {
        return apiError("Impossibile generare la fattura. Verifica il profilo fiscale o la prenotazione selezionata.", 400, "invoice_generation_failed");
      }

      return apiJson({ invoiceId, message: "Fattura generata" }, { status: 201 });
    }

    if (action === "setup-fiscal") {
      const validation = validateFiscalProfile(payload as Record<string, unknown>);
      if ("error" in validation) {
        return validation.error;
      }

      const data = {
        ragioneSociale: normalizeText(payload.ragioneSociale, business.name),
        partitaIva: validation.partitaIva,
        codiceFiscale: validation.codiceFiscale,
        indirizzo: normalizeText(payload.indirizzo, business.address),
        cap: normalizeText(payload.cap, "47121"),
        citta: normalizeText(payload.citta, business.city),
        provincia: normalizeText(payload.provincia, "FC"),
        codiceDestinatario: normalizeText(payload.codiceDestinatario, "0000000"),
        pecDestinatario: normalizeText(payload.pecDestinatario) || null,
        regimeFiscale: normalizeText(payload.regimeFiscale, "RF01"),
      };

      const existing = await prisma.fiscalProfile.findUnique({ where: { businessId: business.id } });
      if (existing) {
        await prisma.fiscalProfile.update({
          where: { id: existing.id },
          data,
        });
        return apiJson({ message: "Profilo fiscale aggiornato" });
      }

      await prisma.fiscalProfile.create({
        data: {
          businessId: business.id,
          ...data,
        },
      });

      return apiJson({ message: "Profilo fiscale creato" }, { status: 201 });
    }

    if (action === "update-status") {
      const invoiceId = normalizeText(payload.invoiceId);
      const status = normalizeText(payload.status) as InvoiceStatus;
      if (!invoiceId) {
        return apiError("invoiceId obbligatorio", 400, "invoice_id_required");
      }
      if (!VALID_INVOICE_STATUSES.includes(status)) {
        return apiError("Stato fattura non valido", 400, "invalid_invoice_status");
      }

      const updated = await prisma.invoice.updateMany({
        where: {
          id: invoiceId,
          fiscalProfile: { businessId: business.id },
        },
        data: { status },
      });
      if (updated.count === 0) {
        return apiError("Fattura non trovata", 404, "invoice_not_found");
      }
      return apiJson({ message: `Stato aggiornato a: ${status}` });
    }

    return apiError("Azione non supportata", 400, "invalid_action");
  } catch {
    return apiError("Errore nella gestione fatture", 500, "invoice_request_failed");
  }
}
