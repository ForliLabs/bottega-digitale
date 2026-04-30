export const dynamic = "force-dynamic";

const APP_URL = process.env.NEXT_PUBLIC_URL || "https://bottegadigitale.it";

export async function GET() {
  const robotsTxt = `# Bottega Digitale — robots.txt
User-agent: *
Allow: /
Disallow: /dashboard/
Disallow: /admin/
Disallow: /api/
Disallow: /staff/
Disallow: /commercialista/
Disallow: /(auth)/

# Sitemaps
Sitemap: ${APP_URL}/api/sitemap
`;

  return new Response(robotsTxt, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
