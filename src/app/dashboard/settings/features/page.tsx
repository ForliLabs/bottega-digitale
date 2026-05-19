export const dynamic = "force-dynamic";
import { requireBusinessContext } from "@/lib/auth";
import { FeatureControlsClient } from "./feature-controls-client";

export default async function FeatureControlsPage() {
  const business = await requireBusinessContext();

  return (
    <FeatureControlsClient
      business={{
        id: business.id,
        slug: business.slug,
        name: business.name,
        websitePublished: business.websitePublished,
        queueEnabled: business.queueEnabled,
        avgServiceMinutes: business.avgServiceMinutes,
        loyaltyEnabled: business.loyaltyEnabled,
        onlineBookingEnabled: business.onlineBookingEnabled,
        crossPromoEnabled: business.crossPromoEnabled,
        whatsappAiEnabled: business.whatsappAiEnabled,
        catalogEnabled: business.catalogEnabled,
        depositsEnabled: business.depositsEnabled,
        depositPercentage: business.depositPercentage,
        stripeConnectAccountId: business.stripeConnectAccountId,
      }}
    />
  );
}
