export const dynamic = "force-dynamic";
import { getBusinessContext } from "@/lib/auth";
import { BUSINESS_TEMPLATES } from "@/lib/business-templates";
import { businessProfile, sampleReviews } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { WebsiteEditorClient } from "./website-editor-client";

export default async function WebsitePage() {
  const business = await getBusinessContext();
  const services = business
    ? await prisma.service.findMany({
        where: { businessId: business.id },
        orderBy: { priceEuro: "asc" },
        take: 4,
      })
    : [];

  return (
    <WebsiteEditorClient
      initialState={{
        name: business?.name || businessProfile.name,
        slug: business?.slug || "preview",
        description: business?.description || "Tagli puliti, barba precisa e prenotazione online in pochi secondi, nel cuore di Forlì.",
        address: business?.address || businessProfile.address,
        phone: business?.phone || businessProfile.phone,
        email: business?.email || "ciao@bottegadigitale.it",
        websitePublished: business?.websitePublished || false,
        websiteTemplate: business?.websiteTemplate || "default",
      }}
      services={(services.length > 0 ? services : businessProfile.services).map((service) => ({
        name: service.name,
        duration: "durationMinutes" in service ? `${service.durationMinutes} min` : service.duration,
        price: "priceEuro" in service ? `€${service.priceEuro.toFixed(2)}` : service.price,
      }))}
      sampleReview={sampleReviews[0]?.comment || "Recensione in arrivo"}
      businessCategory={business?.category || ""}
      businessTemplates={BUSINESS_TEMPLATES.map((template) => ({
        id: template.id,
        label: template.label,
        icon: template.icon,
        description: template.description,
        websiteTemplate: template.websiteTemplate,
        serviceCount: template.services.length,
        productCount: template.products.length,
      }))}
    />
  );
}
