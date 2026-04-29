// Integration Tests — OpenAPI Spec (Feature 7)
import { describe, it, expect } from "vitest";
import { generateOpenAPISpec, WEBHOOK_EVENTS } from "@/lib/webhook-api";

describe("OpenAPI Spec — Structure", () => {
  const spec = generateOpenAPISpec();

  it("should be OpenAPI 3.1.0", () => {
    expect(spec.openapi).toBe("3.1.0");
  });

  it("should have complete API info", () => {
    const info = spec.info as Record<string, unknown>;
    expect(info.title).toBe("Bottega Digitale API");
    expect(info.version).toBe("1.0.0");
    expect(info.description).toBeTruthy();
    expect(info.contact).toBeDefined();
  });

  it("should have multiple servers defined", () => {
    const servers = spec.servers as Array<Record<string, string>>;
    expect(servers.length).toBeGreaterThanOrEqual(2);
    expect(servers[0].description).toContain("Produzione");
  });

  it("should have bearer auth security scheme", () => {
    const components = spec.components as Record<string, Record<string, Record<string, unknown>>>;
    expect(components.securitySchemes.bearerAuth).toBeDefined();
    expect(components.securitySchemes.bearerAuth.type).toBe("http");
    expect(components.securitySchemes.bearerAuth.scheme).toBe("bearer");
  });
});

describe("OpenAPI Spec — Paths Coverage", () => {
  const spec = generateOpenAPISpec();
  const paths = spec.paths as Record<string, Record<string, unknown>>;
  const pathCount = Object.keys(paths).length;

  it("should document at least 20 API paths", () => {
    expect(pathCount).toBeGreaterThanOrEqual(20);
  });

  it("should include booking endpoints", () => {
    expect(paths["/api/bookings"]).toBeDefined();
    expect(paths["/api/bookings/{id}"]).toBeDefined();
  });

  it("should include customer endpoints", () => {
    expect(paths["/api/customers"]).toBeDefined();
    expect(paths["/api/customers/{id}"]).toBeDefined();
  });

  it("should include product endpoints", () => {
    expect(paths["/api/products"]).toBeDefined();
  });

  it("should include order endpoints", () => {
    expect(paths["/api/orders"]).toBeDefined();
  });

  it("should include payment endpoints", () => {
    expect(paths["/api/payments"]).toBeDefined();
  });

  it("should include webhook endpoints", () => {
    expect(paths["/api/webhooks"]).toBeDefined();
  });

  it("should include auth endpoints", () => {
    expect(paths["/api/auth/login"]).toBeDefined();
    expect(paths["/api/auth/register"]).toBeDefined();
  });

  it("should include health endpoint", () => {
    expect(paths["/api/health"]).toBeDefined();
  });

  it("should include GDPR endpoint", () => {
    expect(paths["/api/gdpr"]).toBeDefined();
  });

  it("should include SSE events endpoint", () => {
    expect(paths["/api/events/stream"]).toBeDefined();
  });

  it("should include sitemap and robots endpoints", () => {
    expect(paths["/api/sitemap"]).toBeDefined();
    expect(paths["/api/robots"]).toBeDefined();
  });

  it("should include media endpoint", () => {
    expect(paths["/api/media"]).toBeDefined();
  });

  it("should include invoice endpoint", () => {
    expect(paths["/api/invoices"]).toBeDefined();
  });
});

describe("OpenAPI Spec — Schemas", () => {
  const spec = generateOpenAPISpec();
  const components = spec.components as Record<string, Record<string, Record<string, unknown>>>;
  const schemas = components.schemas;

  it("should define Booking schema", () => {
    expect(schemas.Booking).toBeDefined();
    expect(schemas.Booking.type).toBe("object");
    const props = schemas.Booking.properties as Record<string, unknown>;
    expect(props.id).toBeDefined();
    expect(props.customerName).toBeDefined();
    expect(props.status).toBeDefined();
  });

  it("should define Customer schema", () => {
    expect(schemas.Customer).toBeDefined();
  });

  it("should define Product schema", () => {
    expect(schemas.Product).toBeDefined();
  });

  it("should define Order schema with items", () => {
    expect(schemas.Order).toBeDefined();
    expect(schemas.OrderItem).toBeDefined();
  });

  it("should define Error schema", () => {
    expect(schemas.Error).toBeDefined();
    const props = schemas.Error.properties as Record<string, unknown>;
    expect(props.error).toBeDefined();
    expect(props.message).toBeDefined();
    expect(props.statusCode).toBeDefined();
  });

  it("should define WebhookPayload schema", () => {
    expect(schemas.WebhookPayload).toBeDefined();
  });

  it("should define ApiKey schema", () => {
    expect(schemas.ApiKey).toBeDefined();
  });

  it("should define Business schema", () => {
    expect(schemas.Business).toBeDefined();
  });

  it("should define at least 10 schemas", () => {
    expect(Object.keys(schemas).length).toBeGreaterThanOrEqual(10);
  });
});

describe("OpenAPI Spec — Tags", () => {
  const spec = generateOpenAPISpec();
  const tags = spec.tags as Array<{ name: string; description?: string }>;

  it("should have at least 15 tags", () => {
    expect(tags.length).toBeGreaterThanOrEqual(15);
  });

  it("should include core business tags", () => {
    const tagNames = tags.map((t) => t.name);
    expect(tagNames).toContain("Prenotazioni");
    expect(tagNames).toContain("Clienti");
    expect(tagNames).toContain("Prodotti");
    expect(tagNames).toContain("Ordini");
    expect(tagNames).toContain("Pagamenti");
    expect(tagNames).toContain("Webhook");
    expect(tagNames).toContain("GDPR");
  });

  it("should have descriptions for all tags", () => {
    for (const tag of tags) {
      expect(tag.description).toBeTruthy();
    }
  });
});

describe("OpenAPI Spec — Error Responses", () => {
  const spec = generateOpenAPISpec();
  const paths = spec.paths as Record<string, Record<string, { responses?: Record<string, unknown> }>>;

  it("should include 429 error response on authenticated endpoints", () => {
    const bookingsOps = paths["/api/bookings"];
    const getResp = bookingsOps.get?.responses as Record<string, unknown>;
    expect(getResp["429"]).toBeDefined();
  });

  it("should include 401 error response on authenticated endpoints", () => {
    const bookingsOps = paths["/api/bookings"];
    const getResp = bookingsOps.get?.responses as Record<string, unknown>;
    expect(getResp["401"]).toBeDefined();
  });

  it("should mark public endpoints with no security", () => {
    const loginOp = paths["/api/auth/login"];
    const postOp = loginOp.post as { security?: unknown[] };
    expect(postOp.security).toEqual([]);
  });
});

describe("OpenAPI Spec — Webhook Events", () => {
  it("should have at least 8 webhook event types", () => {
    expect(WEBHOOK_EVENTS.length).toBeGreaterThanOrEqual(8);
  });

  it("should include booking events", () => {
    const types = WEBHOOK_EVENTS.map((e) => e.type);
    expect(types).toContain("booking.created");
    expect(types).toContain("booking.cancelled");
  });

  it("should include x-webhooks in spec", () => {
    const spec = generateOpenAPISpec();
    expect(spec["x-webhooks"]).toBeDefined();
    const webhooks = spec["x-webhooks"] as Record<string, unknown>;
    expect(Object.keys(webhooks).length).toBeGreaterThanOrEqual(8);
  });
});
