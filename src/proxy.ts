import { type NextRequest, NextResponse } from "next/server";

// ─── Security Headers ───────────────────────────────────────────
const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "X-DNS-Prefetch-Control": "off",
  "X-Download-Options": "noopen",
  "X-Permitted-Cross-Domain-Policies": "none",
};

// ─── Auth Guard Configuration ───────────────────────────────────
// Routes that require an authenticated session cookie
const PROTECTED_PREFIXES = ["/dashboard", "/admin", "/staff"];
const PROTECTED_API_PREFIXES = [
  "/api/admin",
  "/api/media",
  "/api/invoices",
  "/api/customers",
  "/api/products",
  "/api/bookings",
  "/api/insights",
  "/api/whatsapp-ai",
  "/api/notifications",
  "/api/automations",
  "/api/staff",
  "/api/gdpr",
  "/api/loyalty",
  "/api/jobs",
  "/api/api-keys",
  "/api/business-templates",
  "/api/marketplace",
  "/api/push",
  "/api/queue",
  "/api/website",
  "/api/availability",
  "/api/associations",
  "/api/accountant",
  "/api/business-capabilities",
];

// Routes exempt from CSRF (webhooks, public APIs)
const CSRF_EXEMPT_PREFIXES = [
  "/api/webhooks",
  "/api/stripe",
  "/api/health",
  "/api/openapi",
  "/api/robots",
  "/api/sitemap",
  "/api/booking-public",
  "/api/customer-auth",
  "/api/directory",
  "/api/regions",
];

// HTTP methods that mutate state
const MUTATION_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

// ─── Helpers ────────────────────────────────────────────────────

function matchesAnyPrefix(pathname: string, prefixes: string[]): boolean {
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/"),
  );
}

function applySecurityHeaders(response: NextResponse): void {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload",
    );
  }
}

// ─── Proxy Function ─────────────────────────────────────────────

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Auth guard: require session_token cookie for protected routes ──
  const isProtectedPage = matchesAnyPrefix(pathname, PROTECTED_PREFIXES);
  const isProtectedApi = matchesAnyPrefix(pathname, PROTECTED_API_PREFIXES);

  if (isProtectedPage || isProtectedApi) {
    const sessionToken = request.cookies.get("session_token")?.value;

    if (!sessionToken) {
      if (isProtectedApi) {
        return NextResponse.json(
          { error: "Non autorizzato", statusCode: 401 },
          { status: 401 },
        );
      }
      // Redirect unauthenticated page requests to login
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // ── CSRF protection: validate Origin header on mutations ──────
  const isApi = pathname.startsWith("/api/");
  const isMutation = MUTATION_METHODS.has(request.method);

  if (isApi && isMutation && !matchesAnyPrefix(pathname, CSRF_EXEMPT_PREFIXES)) {
    const origin = request.headers.get("origin");
    const requestOrigin = request.nextUrl.origin;

    // Allow requests with no Origin header (server-to-server, same-origin form posts)
    if (origin && origin !== requestOrigin) {
      return NextResponse.json(
        { error: "Origine richiesta non valida", statusCode: 403 },
        { status: 403 },
      );
    }
  }

  // ── Apply security headers ────────────────────────────────────
  const response = NextResponse.next();
  applySecurityHeaders(response);

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons|sw.js|manifest.json).*)",
  ],
};
