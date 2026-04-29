// Unit tests for DB module (InMemoryStore)
import { describe, it, expect } from "vitest";
import { InMemoryStore } from "@/lib/db";

interface TestItem { id: string; name: string; value: number }

describe("DB — InMemoryStore", () => {
  it("should create and retrieve items", async () => {
    const store = new InMemoryStore<TestItem>();
    await store.create({ id: "1", name: "Test", value: 42 });
    const item = await store.findById("1");
    expect(item).toBeDefined();
    expect(item!.name).toBe("Test");
    expect(item!.value).toBe(42);
  });

  it("should return undefined for non-existent items", async () => {
    const store = new InMemoryStore<TestItem>();
    const item = await store.findById("nonexistent");
    expect(item).toBeUndefined();
  });

  it("should find all items", async () => {
    const store = new InMemoryStore<TestItem>();
    await store.create({ id: "1", name: "A", value: 1 });
    await store.create({ id: "2", name: "B", value: 2 });
    const all = await store.findAll();
    expect(all.length).toBe(2);
  });

  it("should update items", async () => {
    const store = new InMemoryStore<TestItem>();
    await store.create({ id: "1", name: "Original", value: 1 });
    await store.update("1", { name: "Updated" });
    const item = await store.findById("1");
    expect(item!.name).toBe("Updated");
    expect(item!.value).toBe(1); // unchanged
  });

  it("should return undefined when updating non-existent item", async () => {
    const store = new InMemoryStore<TestItem>();
    const result = await store.update("nonexistent", { name: "Test" });
    expect(result).toBeUndefined();
  });

  it("should delete items", async () => {
    const store = new InMemoryStore<TestItem>();
    await store.create({ id: "1", name: "Test", value: 1 });
    const deleted = await store.delete("1");
    expect(deleted).toBe(true);
    const item = await store.findById("1");
    expect(item).toBeUndefined();
  });

  it("should return false when deleting non-existent item", async () => {
    const store = new InMemoryStore<TestItem>();
    const deleted = await store.delete("nonexistent");
    expect(deleted).toBe(false);
  });

  it("should filter items", async () => {
    const store = new InMemoryStore<TestItem>();
    await store.create({ id: "1", name: "A", value: 10 });
    await store.create({ id: "2", name: "B", value: 20 });
    await store.create({ id: "3", name: "C", value: 30 });
    const high = await store.filter((item) => item.value > 15);
    expect(high.length).toBe(2);
  });

  it("should count items", async () => {
    const store = new InMemoryStore<TestItem>();
    expect(await store.count()).toBe(0);
    await store.create({ id: "1", name: "Test", value: 1 });
    expect(await store.count()).toBe(1);
  });

  it("should seed items", async () => {
    const store = new InMemoryStore<TestItem>();
    store.seed([
      { id: "1", name: "A", value: 1 },
      { id: "2", name: "B", value: 2 },
    ]);
    await expect(store.findAll()).resolves.toHaveLength(2);
  });
});
