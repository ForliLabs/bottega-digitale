// Google Business Profile API Service
// Configure with GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET env vars

const GOOGLE_API_URL = "https://mybusinessbusinessinformation.googleapis.com/v1";
const GOOGLE_REVIEWS_URL = "https://mybusiness.googleapis.com/v4";

interface GoogleReview {
  reviewId: string;
  reviewer: { displayName: string };
  starRating: string;
  comment: string;
  createTime: string;
  updateTime: string;
}

export async function fetchGoogleReviews(
  accessToken: string,
  accountId: string,
  locationId: string
): Promise<GoogleReview[]> {
  const res = await fetch(
    `${GOOGLE_REVIEWS_URL}/accounts/${accountId}/locations/${locationId}/reviews`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const data = await res.json();
  return data.reviews || [];
}

export async function updateBusinessHours(
  accessToken: string,
  locationName: string,
  hours: { dayOfWeek: string; openTime: string; closeTime: string }[]
) {
  const periods = hours.map((h) => ({
    openDay: h.dayOfWeek,
    openTime: h.openTime,
    closeDay: h.dayOfWeek,
    closeTime: h.closeTime,
  }));

  return fetch(`${GOOGLE_API_URL}/${locationName}?updateMask=regularHours`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ regularHours: { periods } }),
  });
}

export async function replyToReview(
  accessToken: string,
  reviewName: string,
  comment: string
) {
  return fetch(`${GOOGLE_REVIEWS_URL}/${reviewName}/reply`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ comment }),
  });
}

export async function refreshAccessToken(refreshToken: string): Promise<string> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth non configurato");
  }

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  const data = await res.json();
  return data.access_token;
}

// Map Google star rating string to number
export function starRatingToNumber(rating: string): number {
  const map: Record<string, number> = {
    ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5,
  };
  return map[rating] || 0;
}

export function isGoogleConfigured(): boolean {
  return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}
