// Unit tests for proxy module (auth guard, CSRF protection, security headers)
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/server", () => {
  const redirect = vi.fn((url: URL) => ({
    type: "redirect",
    url: url.toString(),
    headers: new Map(),
  }));

  const json = vi.fn((body: unknown, init?: { status?: number }) => ({
    type: "json",
    body,
    status: init?.status,
    headers: new Map(),
  }));

  const next = vi.fn(() => {
    const headers = new Map<string, string>();
    return {
      type: "next",
      headers: {
        set: (key: string, value: string) => headers.set(key, value),
        get: (key: string) => headers.get(key),
        entries: () => headers.entries(),
      },
      _headers: headers,
    };
  });

  return {
    NextResponse: { redirect, next, json },
  };
});

import { NextResponse } from "next/server";
import { proxy } from "@/proxy";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockRedirect = NextResponse.redirect as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockJson = NextResponse.json as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockNext = NextResponse.next as any;

function createMockRequest(opts: {
  pathname: string;
  method?: string;
  cookies?: Record<string, string>;
  headers?: Record<string, string>;
  origin?: string;
}) {
  const origin = opts.origin || "https://bottega.example.com";
  return {
    nextUrl: { pathname: opts.pathname, origin },
    method: opts.method || "GET",
    cookies: {
      get: (name: string) => {
        const val = opts.cookies?.[name];
        return val ? { value: val } : undefined;
      },
    },
    headers: {
      get: (name: string) => opts.headers?.[name] || null,
    },
    url: `${origin}${opts.pathname}`,
  };
}

describe("Proxy — Security Headers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should add security headers to public routes", () => {
    const request = createMockRequest({ pathname: "/" });
    const response = proxy(request as never);

    expect(response._headers || response.headers).toBeDefined();
    // Verify it called NextResponse.next()
    expect(mockNext).toHaveBeenCalled();
  });

  it("should add X-Content-Type-Options header", () => {
    const request = createMockRequest({ pathname: "/about" });
    const response = proxy(request as never);
    expect(response._headers?.get("X-Content-Type-Options")).toBe("nosniff");
  });

  it("should add X-Frame-Options DENY header", () => {
    const request = createMockRequest({ pathname: "/contact" });
    const response = proxy(request as never);
    expect(response._headers?.get("X-Frame-Options")).toBe("DENY");
  });

  it("should add Referrer-Policy header", () => {
    const request = createMockRequest({ pathname: "/" });
    const response = proxy(request as never);
    expect(response._headers?.get("Referrer-Policy")).toBe(
      "strict-origin-when-cross-origin",
    );
  });

  it("should add Permissions-Policy header", () => {
    const request = createMockRequest({ pathname: "/" });
    const response = proxy(request as never);
    expect(response._headers?.get("Permissions-Policy")).toContain("camera=()");
  });

  it("should add X-DNS-Prefetch-Control header", () => {
    const request = createMockRequest({ pathname: "/" });
    const response = proxy(request as never);
    expect(response._headers?.get("X-DNS-Prefetch-Control")).toBe("off");
  });
});

describe("Proxy — Auth Guard (Pages)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should redirect unauthenticated users from /dashboard to /login", () => {
    const request = createMockRequest({ pathname: "/dashboard" });
    proxy(request as never);

    expect(mockRedirect).toHaveBeenCalled();
    const redirectUrl = mockRedirect.mock.calls[0][0] as URL;
    expect(redirectUrl.pathname).toBe("/login");
    expect(redirectUrl.searchParams.get("redirect")).toBe("/dashboard");
  });

  it("should redirect unauthenticated users from /admin", () => {
    const request = createMockRequest({ pathname: "/admin/settings" });
    proxy(request as never);

    expect(mockRedirect).toHaveBeenCalled();
  });

  it("should redirect unauthenticated users from /staff", () => {
    const request = createMockRequest({ pathname: "/staff/schedule" });
    proxy(request as never);

    expect(mockRedirect).toHaveBeenCalled();
  });

  it("should allow authenticated users to access /dashboard", () => {
    const request = createMockRequest({
      pathname: "/dashboard",
      cookies: { session_token: "valid-token-123" },
    });
    const response = proxy(request as never);

    expect(mockRedirect).not.toHaveBeenCalled();
    expect(response._headers).toBeDefined();
  });

  it("should allow access to public pages without auth", () => {
    const request = createMockRequest({ pathname: "/" });
    proxy(request as never);

    expect(mockRedirect).not.toHaveBeenCalled();
    expect(mockJson).not.toHaveBeenCalled();
  });
});

describe("Proxy — Auth Guard (API)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 JSON for unauthenticated API requests", () => {
    const request = createMockRequest({
      pathname: "/api/media",
      method: "GET",
    });
    proxy(request as never);

    expect(mockJson).toHaveBeenCalledWith(
      { error: "Non autorizzato", statusCode: 401 },
      { status: 401 },
    );
  });

  it("should return 401 for unauthenticated /api/customers", () => {
    const request = createMockRequest({
      pathname: "/api/customers/list",
      method: "GET",
    });
    proxy(request as never);

    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 401 }),
      { status: 401 },
    );
  });

  it("should allow authenticated API requests", () => {
    const request = createMockRequest({
      pathname: "/api/media",
      method: "GET",
      cookies: { session_token: "valid-token" },
    });
    const response = proxy(request as never);

    expect(mockJson).not.toHaveBeenCalled();
    expect(response._headers).toBeDefined();
  });

  it("should allow public API routes without auth", () => {
    const request = createMockRequest({
      pathname: "/api/health",
      method: "GET",
    });
    proxy(request as never);

    expect(mockJson).not.toHaveBeenCalled();
    expect(mockRedirect).not.toHaveBeenCalled();
  });
});

describe("Proxy — CSRF Protection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should block cross-origin POST requests to API", () => {
    const request = createMockRequest({
      pathname: "/api/products",
      method: "POST",
      cookies: { session_token: "valid-token" },
      headers: { origin: "https://evil.example.com" },
    });
    proxy(request as never);

    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 403 }),
      { status: 403 },
    );
  });

  it("should block cross-origin DELETE requests", () => {
    const request = createMockRequest({
      pathname: "/api/media",
      method: "DELETE",
      cookies: { session_token: "valid-token" },
      headers: { origin: "https://attacker.com" },
    });
    proxy(request as never);

    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 403 }),
      { status: 403 },
    );
  });

  it("should allow same-origin POST requests", () => {
    const request = createMockRequest({
      pathname: "/api/products",
      method: "POST",
      cookies: { session_token: "valid-token" },
      headers: { origin: "https://bottega.example.com" },
    });
    const response = proxy(request as never);

    expect(response._headers).toBeDefined();
    expect(mockJson).not.toHaveBeenCalled();
  });

  it("should allow mutations without Origin header (same-origin)", () => {
    const request = createMockRequest({
      pathname: "/api/products",
      method: "POST",
      cookies: { session_token: "valid-token" },
    });
    const response = proxy(request as never);

    expect(response._headers).toBeDefined();
    expect(mockJson).not.toHaveBeenCalled();
  });

  it("should skip CSRF for webhook endpoints", () => {
    const request = createMockRequest({
      pathname: "/api/webhooks/stripe",
      method: "POST",
      headers: { origin: "https://stripe.com" },
    });
    proxy(request as never);

    // Webhooks are exempt from both auth and CSRF
    expect(mockJson).not.toHaveBeenCalled();
  });

  it("should skip CSRF for health endpoint", () => {
    const request = createMockRequest({
      pathname: "/api/health",
      method: "POST",
      headers: { origin: "https://monitoring.example.com" },
    });
    proxy(request as never);

    expect(mockJson).not.toHaveBeenCalled();
  });

  it("should allow GET requests regardless of origin", () => {
    const request = createMockRequest({
      pathname: "/api/products",
      method: "GET",
      cookies: { session_token: "valid-token" },
      headers: { origin: "https://other.example.com" },
    });
    const response = proxy(request as never);

    expect(response._headers).toBeDefined();
    expect(mockJson).not.toHaveBeenCalled();
  });
});
