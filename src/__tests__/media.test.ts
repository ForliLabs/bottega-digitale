// Unit tests for media pipeline module
import { describe, it, expect } from "vitest";
import { validateUpload, MEDIA_CONFIG, generateMediaUrl } from "@/lib/media";

describe("Media — Upload Validation", () => {
  it("should accept valid JPEG", () => {
    const result = validateUpload({ size: 1024 * 1024, type: "image/jpeg", name: "photo.jpg" });
    expect(result.valid).toBe(true);
  });

  it("should accept valid PNG", () => {
    const result = validateUpload({ size: 2 * 1024 * 1024, type: "image/png", name: "logo.png" });
    expect(result.valid).toBe(true);
  });

  it("should accept valid WebP", () => {
    const result = validateUpload({ size: 500000, type: "image/webp", name: "image.webp" });
    expect(result.valid).toBe(true);
  });

  it("should reject unsupported mime types", () => {
    const result = validateUpload({ size: 1024, type: "application/pdf", name: "doc.pdf" });
    expect(result.valid).toBe(false);
    expect(result.error).toContain("non supportato");
  });

  it("should reject SVG files", () => {
    const result = validateUpload({ size: 1024, type: "image/svg+xml", name: "icon.svg" });
    expect(result.valid).toBe(false);
  });

  it("should reject files larger than 5MB", () => {
    const result = validateUpload({ size: 6 * 1024 * 1024, type: "image/jpeg", name: "huge.jpg" });
    expect(result.valid).toBe(false);
    expect(result.error).toContain("troppo grande");
  });

  it("should accept files exactly at 5MB", () => {
    const result = validateUpload({ size: 5 * 1024 * 1024, type: "image/jpeg", name: "max.jpg" });
    expect(result.valid).toBe(true);
  });

  it("should accept very small files", () => {
    const result = validateUpload({ size: 100, type: "image/png", name: "tiny.png" });
    expect(result.valid).toBe(true);
  });
});

describe("Media — Configuration", () => {
  it("should have correct max file size", () => {
    expect(MEDIA_CONFIG.maxFileSizeBytes).toBe(5 * 1024 * 1024);
  });

  it("should have all required image sizes", () => {
    expect(MEDIA_CONFIG.imageSizes.thumbnail).toBeDefined();
    expect(MEDIA_CONFIG.imageSizes.medium).toBeDefined();
    expect(MEDIA_CONFIG.imageSizes.full).toBeDefined();
  });

  it("should have storage tiers for all subscription levels", () => {
    expect(MEDIA_CONFIG.storageTiers.vetrina).toBeDefined();
    expect(MEDIA_CONFIG.storageTiers.bottega).toBeDefined();
    expect(MEDIA_CONFIG.storageTiers.maestro).toBeDefined();
  });

  it("should have increasing storage by tier", () => {
    expect(MEDIA_CONFIG.storageTiers.bottega).toBeGreaterThan(MEDIA_CONFIG.storageTiers.vetrina);
    expect(MEDIA_CONFIG.storageTiers.maestro).toBeGreaterThan(MEDIA_CONFIG.storageTiers.bottega);
  });

  it("should accept all standard image types", () => {
    expect(MEDIA_CONFIG.allowedMimeTypes).toContain("image/jpeg");
    expect(MEDIA_CONFIG.allowedMimeTypes).toContain("image/png");
    expect(MEDIA_CONFIG.allowedMimeTypes).toContain("image/webp");
  });
});

describe("Media — URL Generation", () => {
  it("should generate local API URL when no CDN configured", () => {
    const url = generateMediaUrl("biz-123", "photo.jpg");
    expect(url).toContain("biz-123");
    expect(url).toContain("photo.jpg");
  });
});
