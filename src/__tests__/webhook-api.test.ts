// Unit tests for webhook API module
import { describe, it, expect } from "vitest";
import {
  generateApiKey,
  hashApiKey,
  generateWebhookSecret,
  signWebhookPayload,
  generateOpenAPISpec,
  WEBHOOK_EVENTS,
} from "@/lib/webhook-api";

describe("Webhook API — API Key Generation", () => {
  it("should generate key with sk_live_ prefix", () => {
    const { key } = generateApiKey();
    expect(key.startsWith("sk_live_")).toBe(true);
  });

  it("should generate unique keys", () => {
    const keys = new Set<string>();
    for (let i = 0; i < 20; i++) {
      keys.add(generateApiKey().key);
    }
    expect(keys.size).toBe(20);
  });

  it("should generate key prefix", () => {
    const { prefix } = generateApiKey();
    expect(prefix).toBeTruthy();
    expect(prefix.includes("...")).toBe(true);
  });

  it("should generate sufficiently long keys", () => {
    const { key } = generateApiKey();
    expect(key.length).toBeGreaterThan(40);
  });
});

describe("Webhook API — Key Hashing", () => {
  it("should produce consistent hashes", async () => {
    const hash1 = await hashApiKey("test-key");
    const hash2 = await hashApiKey("test-key");
    expect(hash1).toBe(hash2);
  });

  it("should produce different hashes for different keys", async () => {
    const hash1 = await hashApiKey("key-1");
    const hash2 = await hashApiKey("key-2");
    expect(hash1).not.toBe(hash2);
  });

  it("should produce hex string", async () => {
    const hash = await hashApiKey("test");
    expect(/^[a-f0-9]+$/.test(hash)).toBe(true);
  });
});

describe("Webhook API — Webhook Secret", () => {
  it("should generate secret with whsec_ prefix", () => {
    const secret = generateWebhookSecret();
    expect(secret.startsWith("whsec_")).toBe(true);
  });

  it("should generate unique secrets", () => {
    const secrets = new Set<string>();
    for (let i = 0; i < 20; i++) {
      secrets.add(generateWebhookSecret());
    }
    expect(secrets.size).toBe(20);
  });
});

describe("Webhook API — Payload Signing", () => {
  it("should produce consistent signatures", async () => {
    const sig1 = await signWebhookPayload('{"test":true}', "secret");
    const sig2 = await signWebhookPayload('{"test":true}', "secret");
    expect(sig1).toBe(sig2);
  });

  it("should produce different signatures for different payloads", async () => {
    const sig1 = await signWebhookPayload("payload-1", "secret");
    const sig2 = await signWebhookPayload("payload-2", "secret");
    expect(sig1).not.toBe(sig2);
  });

  it("should produce different signatures for different secrets", async () => {
    const sig1 = await signWebhookPayload("payload", "secret-1");
    const sig2 = await signWebhookPayload("payload", "secret-2");
    expect(sig1).not.toBe(sig2);
  });

  it("should produce hex string", async () => {
    const sig = await signWebhookPayload("test", "secret");
    expect(/^[a-f0-9]+$/.test(sig)).toBe(true);
  });
});

describe("Webhook API — Events", () => {
  it("should have at least 6 event types", () => {
    expect(WEBHOOK_EVENTS.length).toBeGreaterThanOrEqual(6);
  });

  it("should have unique event types", () => {
    const types = WEBHOOK_EVENTS.map((e) => e.type);
    expect(new Set(types).size).toBe(types.length);
  });

  it("should include booking events", () => {
    const types = WEBHOOK_EVENTS.map((e) => e.type);
    expect(types).toContain("booking.created");
    expect(types).toContain("booking.updated");
  });

  it("should include payment event", () => {
    const types = WEBHOOK_EVENTS.map((e) => e.type);
    expect(types).toContain("payment.received");
  });

  it("should have descriptions for all events", () => {
    for (const event of WEBHOOK_EVENTS) {
      expect(event.description).toBeTruthy();
    }
  });
});

describe("Webhook API — OpenAPI Spec", () => {
  it("should generate valid OpenAPI 3.1 spec", () => {
    const spec = generateOpenAPISpec();
    expect(spec.openapi).toBe("3.1.0");
    expect(spec.info).toBeDefined();
    expect(spec.paths).toBeDefined();
  });

  it("should include API info", () => {
    const spec = generateOpenAPISpec();
    const info = spec.info as { title: string; version: string };
    expect(info.title).toContain("Bottega Digitale");
    expect(info.version).toBeTruthy();
  });

  it("should include security scheme", () => {
    const spec = generateOpenAPISpec();
    const components = spec.components as { securitySchemes: Record<string, unknown> };
    expect(components.securitySchemes.bearerAuth).toBeDefined();
  });

  it("should include webhook event definitions", () => {
    const spec = generateOpenAPISpec();
    expect(spec["x-webhooks"]).toBeDefined();
  });

  it("should include essential paths", () => {
    const spec = generateOpenAPISpec();
    const paths = spec.paths as Record<string, unknown>;
    expect(paths["/bookings"]).toBeDefined();
    expect(paths["/customers"]).toBeDefined();
    expect(paths["/orders"]).toBeDefined();
  });
});
