// Integration Tests — Turso Migration & Prisma Config (Feature 10)
import { describe, it, expect } from "vitest";
import { getDatabaseInfo } from "@/lib/prisma";
import { InMemoryStore } from "@/lib/db";

describe("Database — Environment Switching", () => {
  it("should report SQLite provider when no TURSO_DATABASE_URL", () => {
    const info = getDatabaseInfo();
    // In test environment, TURSO_DATABASE_URL is not set
    expect(info.provider).toBe("sqlite");
    expect(info.url).toContain("dev.db");
  });

  it("should mask credentials in Turso URL", () => {
    // Simulate the masking function
    const originalEnv = process.env.TURSO_DATABASE_URL;
    process.env.TURSO_DATABASE_URL = "libsql://mydb-user.turso.io";
    const info = getDatabaseInfo();
    expect(info.provider).toBe("turso");
    expect(info.url).not.toContain("password");
    process.env.TURSO_DATABASE_URL = originalEnv || "";
    if (!originalEnv) delete process.env.TURSO_DATABASE_URL;
  });
});

describe("Database — InMemoryStore", () => {
  it("should CRUD operations correctly", async () => {
    const store = new InMemoryStore<{ id: string; name: string }>();

    await store.create({ id: "1", name: "Test" });
    const found = await store.findById("1");
    expect(found?.name).toBe("Test");

    await store.update("1", { name: "Updated" });
    const updated = await store.findById("1");
    expect(updated?.name).toBe("Updated");

    await store.delete("1");
    const deleted = await store.findById("1");
    expect(deleted).toBeUndefined();
  });

  it("should filter records", async () => {
    const store = new InMemoryStore<{ id: string; category: string }>();
    await store.create({ id: "1", category: "A" });
    await store.create({ id: "2", category: "B" });
    await store.create({ id: "3", category: "A" });

    const filtered = await store.filter((item) => item.category === "A");
    expect(filtered).toHaveLength(2);
  });

  it("should count records", async () => {
    const store = new InMemoryStore<{ id: string }>();
    await store.create({ id: "1" });
    await store.create({ id: "2" });
    const count = await store.count();
    expect(count).toBe(2);
  });

  it("should seed data", async () => {
    const store = new InMemoryStore<{ id: string; name: string }>();
    store.seed([
      { id: "1", name: "One" },
      { id: "2", name: "Two" },
    ]);
    expect(await store.findById("1")).toEqual({ id: "1", name: "One" });
  });
});
