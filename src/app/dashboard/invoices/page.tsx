export const dynamic = "force-dynamic";
import { getBusinessContext } from "@/lib/auth";
import { getInvoiceStats } from "@/lib/e-invoice";
import { prisma } from "@/lib/prisma";
import { InvoicesClient } from "./invoices-client";

export default async function InvoicesPage() {
  const business = await getBusinessContext();
  const stats = business ? await getInvoiceStats(business.id) : null;
  const completedBookings = business
    ? await prisma.booking.findMany({
        where: { businessId: business.id, status: "Completata" },
        orderBy: { startsAt: "desc" },
        take: 20,
        select: {
          id: true,
          customerName: true,
          service: true,
          startsAt: true,
          priceEuro: true,
        },
      })
    : [];

  return (
    <InvoicesClient
      initialStats={stats}
      completedBookings={completedBookings}
      businessDefaults={{
        ragioneSociale: stats?.fiscalProfile.ragioneSociale || business?.name || "",
        partitaIva: stats?.fiscalProfile.partitaIva || business?.partitaIva || "",
        codiceFiscale: stats?.fiscalProfile.codiceFiscale || business?.codiceFiscale || "",
        indirizzo: stats?.fiscalProfile.indirizzo || business?.address || "",
        cap: stats?.fiscalProfile.cap || "47121",
        citta: stats?.fiscalProfile.citta || business?.city || "Forlì",
        provincia: stats?.fiscalProfile.provincia || "FC",
        codiceDestinatario: stats?.fiscalProfile.codiceDestinatario || business?.codiceDestinatarioSdi || "0000000",
        pecDestinatario: stats?.fiscalProfile.pecDestinatario || null,
        regimeFiscale: stats?.fiscalProfile.regimeFiscale || business?.regimeFiscale || "RF01",
      }}
    />
  );
}
