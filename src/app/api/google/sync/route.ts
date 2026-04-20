import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";
import {
  fetchGoogleReviews,
  refreshAccessToken,
  starRatingToNumber,
  isGoogleConfigured,
} from "@/lib/google-business";

export async function POST(request: Request) {
  const auth = await getAuthContext();
  if (!auth) {
    return Response.json({ error: "Non autenticato." }, { status: 401 });
  }

  if (!isGoogleConfigured()) {
    return Response.json({ error: "Google API non configurata." }, { status: 503 });
  }

  const business = auth.business;
  if (!business.googleRefreshToken || !business.googlePlaceId) {
    return Response.json(
      { error: "Google Business Profile non collegato. Configura il collegamento nelle impostazioni." },
      { status: 400 }
    );
  }

  try {
    const accessToken = await refreshAccessToken(business.googleRefreshToken);

    // Parse placeId format: accounts/{accountId}/locations/{locationId}
    const parts = business.googlePlaceId.split("/");
    const accountId = parts[1] || "";
    const locationId = parts[3] || "";

    const reviews = await fetchGoogleReviews(accessToken, accountId, locationId);

    let imported = 0;
    for (const review of reviews) {
      const existing = await prisma.review.findFirst({
        where: { googleReviewId: review.reviewId, businessId: business.id },
      });
      if (!existing) {
        await prisma.review.create({
          data: {
            businessId: business.id,
            author: review.reviewer.displayName,
            rating: starRatingToNumber(review.starRating),
            date: new Date(review.createTime),
            comment: review.comment || "",
            googleReviewId: review.reviewId,
          },
        });
        imported++;
      }
    }

    // Update access token
    await prisma.business.update({
      where: { id: business.id },
      data: { googleAccessToken: accessToken },
    });

    return Response.json({ synced: imported, total: reviews.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Errore sincronizzazione Google";
    return Response.json({ error: message }, { status: 500 });
  }
}
