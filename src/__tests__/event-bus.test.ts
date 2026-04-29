// Unit tests for event bus module
import { describe, it, expect } from "vitest";
import { FLOW_TEMPLATES } from "@/lib/event-bus";

describe("Event Bus — Flow Templates", () => {
  it("should have at least 4 pre-built templates", () => {
    expect(FLOW_TEMPLATES.length).toBeGreaterThanOrEqual(4);
  });

  it("should have unique names", () => {
    const names = FLOW_TEMPLATES.map((t) => t.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("should have valid trigger events", () => {
    const validEvents = [
      "booking.created", "booking.completed", "booking.cancelled",
      "customer.created", "review.received",
      "loyalty.threshold_reached", "queue.turn_approaching",
    ];
    for (const template of FLOW_TEMPLATES) {
      expect(validEvents).toContain(template.triggerEvent);
    }
  });

  it("should have at least one action per template", () => {
    for (const template of FLOW_TEMPLATES) {
      expect(template.actions.length).toBeGreaterThan(0);
    }
  });

  it("should have a booking confirmation template", () => {
    const bookingTemplate = FLOW_TEMPLATES.find((t) =>
      t.triggerEvent === "booking.created"
    );
    expect(bookingTemplate).toBeDefined();
    expect(bookingTemplate!.actions.length).toBeGreaterThan(0);
  });

  it("should have a welcome customer template", () => {
    const welcomeTemplate = FLOW_TEMPLATES.find((t) =>
      t.triggerEvent === "customer.created"
    );
    expect(welcomeTemplate).toBeDefined();
  });

  it("should have valid action types in all templates", () => {
    const validActions = [
      "whatsapp.send_message", "whatsapp.send_template",
      "loyalty.award_points", "crm.update_customer",
      "social.generate_post", "insight.log",
    ];
    for (const template of FLOW_TEMPLATES) {
      for (const action of template.actions) {
        expect(validActions).toContain(action.type);
      }
    }
  });

  it("should have descriptions for all templates", () => {
    for (const template of FLOW_TEMPLATES) {
      expect(template.description).toBeTruthy();
      expect(template.description.length).toBeGreaterThan(10);
    }
  });
});
