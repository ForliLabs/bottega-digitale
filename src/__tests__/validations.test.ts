// Unit tests for Zod validation schemas
import { describe, it, expect } from "vitest";
import {
  mediaFileSchema,
  mediaUploadSchema,
  mediaDeleteSchema,
  mediaLibraryQuerySchema,
  whatsappAiMessageSchema,
  whatsappAiConfigSchema,
} from "@/lib/validations";

// ─── Media File Validation ──────────────────────────────────────

describe("Validations — Media File Schema", () => {
  it("should accept valid JPEG file", () => {
    const result = mediaFileSchema.safeParse({
      name: "photo.jpg",
      size: 1024 * 1024,
      type: "image/jpeg",
    });
    expect(result.success).toBe(true);
  });

  it("should accept valid PNG file", () => {
    const result = mediaFileSchema.safeParse({
      name: "logo.png",
      size: 2 * 1024 * 1024,
      type: "image/png",
    });
    expect(result.success).toBe(true);
  });

  it("should accept valid WebP file", () => {
    const result = mediaFileSchema.safeParse({
      name: "image.webp",
      size: 500000,
      type: "image/webp",
    });
    expect(result.success).toBe(true);
  });

  it("should accept valid GIF file", () => {
    const result = mediaFileSchema.safeParse({
      name: "animation.gif",
      size: 300000,
      type: "image/gif",
    });
    expect(result.success).toBe(true);
  });

  it("should reject unsupported mime types", () => {
    const result = mediaFileSchema.safeParse({
      name: "doc.pdf",
      size: 1024,
      type: "application/pdf",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("non supportato");
    }
  });

  it("should reject files larger than 5MB", () => {
    const result = mediaFileSchema.safeParse({
      name: "huge.jpg",
      size: 6 * 1024 * 1024,
      type: "image/jpeg",
    });
    expect(result.success).toBe(false);
  });

  it("should reject empty files (size 0)", () => {
    const result = mediaFileSchema.safeParse({
      name: "empty.jpg",
      size: 0,
      type: "image/jpeg",
    });
    expect(result.success).toBe(false);
  });

  it("should reject missing name", () => {
    const result = mediaFileSchema.safeParse({
      name: "",
      size: 1024,
      type: "image/jpeg",
    });
    expect(result.success).toBe(false);
  });

  it("should accept file at exactly 5MB", () => {
    const result = mediaFileSchema.safeParse({
      name: "max.jpg",
      size: 5 * 1024 * 1024,
      type: "image/jpeg",
    });
    expect(result.success).toBe(true);
  });
});

// ─── Media Upload Metadata ──────────────────────────────────────

describe("Validations — Media Upload Schema", () => {
  it("should accept valid upload with folder and alt", () => {
    const result = mediaUploadSchema.safeParse({
      folder: "products",
      alt: "Product photo",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.folder).toBe("products");
    }
  });

  it("should default folder to general when not provided", () => {
    const result = mediaUploadSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.folder).toBe("general");
    }
  });

  it("should accept all valid folder types", () => {
    for (const folder of ["general", "products", "social", "logo", "hero"]) {
      const result = mediaUploadSchema.safeParse({ folder });
      expect(result.success).toBe(true);
    }
  });

  it("should reject invalid folder", () => {
    const result = mediaUploadSchema.safeParse({ folder: "invalid" });
    expect(result.success).toBe(false);
  });

  it("should reject alt text over 200 chars", () => {
    const result = mediaUploadSchema.safeParse({
      alt: "A".repeat(201),
    });
    expect(result.success).toBe(false);
  });

  it("should accept empty alt text (optional)", () => {
    const result = mediaUploadSchema.safeParse({ folder: "products" });
    expect(result.success).toBe(true);
  });
});

// ─── Media Delete ───────────────────────────────────────────────

describe("Validations — Media Delete Schema", () => {
  it("should accept valid asset ID", () => {
    const result = mediaDeleteSchema.safeParse({ id: "asset-123" });
    expect(result.success).toBe(true);
  });

  it("should reject empty ID", () => {
    const result = mediaDeleteSchema.safeParse({ id: "" });
    expect(result.success).toBe(false);
  });

  it("should reject missing ID", () => {
    const result = mediaDeleteSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ─── Media Library Query ────────────────────────────────────────

describe("Validations — Media Library Query Schema", () => {
  it("should accept query with valid folder", () => {
    const result = mediaLibraryQuerySchema.safeParse({ folder: "products" });
    expect(result.success).toBe(true);
  });

  it("should accept query without folder", () => {
    const result = mediaLibraryQuerySchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("should reject invalid folder in query", () => {
    const result = mediaLibraryQuerySchema.safeParse({ folder: "unknown" });
    expect(result.success).toBe(false);
  });
});

// ─── WhatsApp AI Message ────────────────────────────────────────

describe("Validations — WhatsApp AI Message Schema", () => {
  it("should accept valid message", () => {
    const result = whatsappAiMessageSchema.safeParse({
      phone: "+39 333 1234567",
      message: "Vorrei prenotare un appuntamento",
    });
    expect(result.success).toBe(true);
  });

  it("should accept phone with country code", () => {
    const result = whatsappAiMessageSchema.safeParse({
      phone: "+393331234567",
      message: "Ciao",
    });
    expect(result.success).toBe(true);
  });

  it("should reject missing phone", () => {
    const result = whatsappAiMessageSchema.safeParse({
      message: "Ciao",
    });
    expect(result.success).toBe(false);
  });

  it("should reject empty phone", () => {
    const result = whatsappAiMessageSchema.safeParse({
      phone: "",
      message: "Ciao",
    });
    expect(result.success).toBe(false);
  });

  it("should reject invalid phone format", () => {
    const result = whatsappAiMessageSchema.safeParse({
      phone: "abc",
      message: "Test",
    });
    expect(result.success).toBe(false);
  });

  it("should reject missing message", () => {
    const result = whatsappAiMessageSchema.safeParse({
      phone: "+393331234567",
    });
    expect(result.success).toBe(false);
  });

  it("should reject empty message", () => {
    const result = whatsappAiMessageSchema.safeParse({
      phone: "+393331234567",
      message: "",
    });
    expect(result.success).toBe(false);
  });

  it("should reject message over 4096 chars", () => {
    const result = whatsappAiMessageSchema.safeParse({
      phone: "+393331234567",
      message: "A".repeat(4097),
    });
    expect(result.success).toBe(false);
  });

  it("should accept message at exactly 4096 chars", () => {
    const result = whatsappAiMessageSchema.safeParse({
      phone: "+393331234567",
      message: "A".repeat(4096),
    });
    expect(result.success).toBe(true);
  });
});

// ─── WhatsApp AI Config ─────────────────────────────────────────

describe("Validations — WhatsApp AI Config Schema", () => {
  it("should accept valid config", () => {
    const result = whatsappAiConfigSchema.safeParse({
      enabled: true,
      personality: "amichevole",
      faqLines: ["Quanto costa?|15 euro"],
    });
    expect(result.success).toBe(true);
  });

  it("should default enabled to true", () => {
    const result = whatsappAiConfigSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.enabled).toBe(true);
    }
  });

  it("should default personality to amichevole", () => {
    const result = whatsappAiConfigSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.personality).toBe("amichevole");
    }
  });

  it("should accept formale personality", () => {
    const result = whatsappAiConfigSchema.safeParse({
      personality: "formale",
    });
    expect(result.success).toBe(true);
  });

  it("should reject invalid personality", () => {
    const result = whatsappAiConfigSchema.safeParse({
      personality: "casual",
    });
    expect(result.success).toBe(false);
  });

  it("should default faqLines to empty array", () => {
    const result = whatsappAiConfigSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.faqLines).toEqual([]);
    }
  });

  it("should reject more than 50 FAQ lines", () => {
    const result = whatsappAiConfigSchema.safeParse({
      faqLines: Array.from({ length: 51 }, (_, i) => `FAQ ${i}`),
    });
    expect(result.success).toBe(false);
  });

  it("should reject FAQ lines over 500 chars", () => {
    const result = whatsappAiConfigSchema.safeParse({
      faqLines: ["A".repeat(501)],
    });
    expect(result.success).toBe(false);
  });

  it("should accept disabled config", () => {
    const result = whatsappAiConfigSchema.safeParse({
      enabled: false,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.enabled).toBe(false);
    }
  });
});
