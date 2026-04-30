import { prisma } from "@/lib/prisma";
import { generateSitemapXml, type SitemapEntry } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function GET() {
  const entries: SitemapEntry[] = [
    { url: "/", changefreq: "weekly", priority: 1.0 },
    { url: "/directory", changefreq: "daily", priority: 0.9 },
    { url: "/marketplace", changefreq: "daily", priority: 0.8 },
    { url: "/developers", changefreq: "monthly", priority: 0.5 },
  ];

  // Add all published business pages
  try {
    const businesses = await prisma.business.findMany({
      where: { websitePublished: true },
      select: { slug: true, updatedAt: true },
    });

    for (const biz of businesses) {
      entries.push({
        url: `/s/${biz.slug}`,
        lastmod: biz.updatedAt.toISOString().split("T")[0],
        changefreq: "weekly",
        priority: 0.8,
      });
      entries.push({
        url: `/book/${biz.slug}`,
        lastmod: biz.updatedAt.toISOString().split("T")[0],
        changefreq: "weekly",
        priority: 0.7,
      });
      entries.push({
        url: `/shop/${biz.slug}`,
        lastmod: biz.updatedAt.toISOString().split("T")[0],
        changefreq: "weekly",
        priority: 0.7,
      });
    }
  } catch {
    // DB not available — return static entries only
  }

  const xml = generateSitemapXml(entries);

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
