import { getAuthContext } from "@/lib/auth";

export async function GET() {
  const auth = await getAuthContext();
  if (!auth) {
    return Response.json({ authenticated: false }, { status: 401 });
  }
  return Response.json({
    authenticated: true,
    user: { id: auth.user.id, email: auth.user.email, name: auth.user.name },
    business: {
      id: auth.business.id,
      name: auth.business.name,
      slug: auth.business.slug,
      subscriptionTier: auth.business.subscriptionTier,
    },
  });
}
