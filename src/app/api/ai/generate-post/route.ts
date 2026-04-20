import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";
import { generateSocialPost, isAIConfigured } from "@/lib/ai-content";

export async function POST(request: Request) {
  const auth = await getAuthContext();
  if (!auth) {
    return Response.json({ error: "Non autenticato." }, { status: 401 });
  }

  try {
    const { imageDescription, occasion, platform } = await request.json();

    const post = await generateSocialPost({
      businessName: auth.business.name,
      businessCategory: auth.business.category,
      city: auth.business.city,
      imageDescription,
      occasion,
      platform: platform || "instagram",
    });

    const savedPost = await prisma.socialPost.create({
      data: {
        businessId: auth.business.id,
        caption: post.caption,
        hashtags: post.hashtags.join(","),
        platform: platform || "instagram",
        status: "draft",
      },
    });

    return Response.json({
      id: savedPost.id,
      caption: post.caption,
      hashtags: post.hashtags,
      aiGenerated: isAIConfigured(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Errore generazione contenuto";
    return Response.json({ error: message }, { status: 500 });
  }
}
