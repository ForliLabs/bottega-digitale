// Unit tests for onboarding wizard module
import { describe, it, expect } from "vitest";
import {
  WIZARD_STEPS,
  BUSINESS_CATEGORIES,
  calculateProgress,
  getNextStep,
  isOnboardingComplete,
  getSuggestedFeatures,
  getActivationNudges,
  getEstimatedSetupTime,
  getCategoryConfig,
} from "@/lib/onboarding";

describe("Onboarding — Wizard Steps", () => {
  it("should have 7 steps", () => {
    expect(WIZARD_STEPS.length).toBe(7);
  });

  it("should have unique step IDs", () => {
    const ids = WIZARD_STEPS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("should have profile as first step", () => {
    expect(WIZARD_STEPS[0].id).toBe("profile");
    expect(WIZARD_STEPS[0].required).toBe(true);
  });

  it("should have required steps", () => {
    const required = WIZARD_STEPS.filter((s) => s.required);
    expect(required.length).toBeGreaterThan(0);
    expect(required.length).toBeLessThan(WIZARD_STEPS.length);
  });

  it("should have estimated minutes for each step", () => {
    for (const step of WIZARD_STEPS) {
      expect(step.estimatedMinutes).toBeGreaterThan(0);
    }
  });
});

describe("Onboarding — Business Categories", () => {
  it("should have at least 10 categories", () => {
    expect(BUSINESS_CATEGORIES.length).toBeGreaterThanOrEqual(10);
  });

  it("should include key Italian business types", () => {
    const cats = BUSINESS_CATEGORIES.map((c) => c.category);
    expect(cats).toContain("barbiere");
    expect(cats).toContain("parrucchiere");
    expect(cats).toContain("forno");
    expect(cats).toContain("ristorante");
    expect(cats).toContain("altro");
  });

  it("should have an 'altro' fallback", () => {
    const altro = BUSINESS_CATEGORIES.find((c) => c.category === "altro");
    expect(altro).toBeDefined();
  });

  it("should have suggested features for each category", () => {
    for (const cat of BUSINESS_CATEGORIES) {
      expect(cat.suggestedFeatures.length).toBeGreaterThan(0);
    }
  });

  it("should correctly tag service vs product businesses", () => {
    const barbiere = BUSINESS_CATEGORIES.find((c) => c.category === "barbiere");
    expect(barbiere!.isServiceBased).toBe(true);
    expect(barbiere!.isProductBased).toBe(false);

    const forno = BUSINESS_CATEGORIES.find((c) => c.category === "forno");
    expect(forno!.isServiceBased).toBe(false);
    expect(forno!.isProductBased).toBe(true);
  });
});

describe("Onboarding — Progress Calculation", () => {
  it("should calculate 0% for no completed steps", () => {
    const progress = calculateProgress([]);
    expect(progress.percentComplete).toBe(0);
    expect(progress.currentStep).toBe(0);
  });

  it("should calculate 100% when all steps complete", () => {
    const allSteps = WIZARD_STEPS.map((s) => s.id);
    const progress = calculateProgress(allSteps);
    expect(progress.percentComplete).toBe(100);
  });

  it("should calculate intermediate progress", () => {
    const progress = calculateProgress(["profile", "services"]);
    expect(progress.percentComplete).toBeGreaterThan(0);
    expect(progress.percentComplete).toBeLessThan(100);
    expect(progress.completedSteps.length).toBe(2);
  });

  it("should include total steps", () => {
    const progress = calculateProgress([]);
    expect(progress.totalSteps).toBe(WIZARD_STEPS.length);
  });
});

describe("Onboarding — Next Step", () => {
  it("should return first step when none completed", () => {
    const next = getNextStep([]);
    expect(next).toBeDefined();
    expect(next!.id).toBe("profile");
  });

  it("should return null when all steps completed", () => {
    const allSteps = WIZARD_STEPS.map((s) => s.id);
    const next = getNextStep(allSteps);
    expect(next).toBeNull();
  });

  it("should skip completed steps", () => {
    const next = getNextStep(["profile"]);
    expect(next!.id).toBe("services");
  });
});

describe("Onboarding — Completion Check", () => {
  it("should not be complete with no steps", () => {
    expect(isOnboardingComplete([])).toBe(false);
  });

  it("should be complete when all required steps done", () => {
    const required = WIZARD_STEPS.filter((s) => s.required).map((s) => s.id);
    expect(isOnboardingComplete(required)).toBe(true);
  });

  it("should not be complete when only optional steps done", () => {
    const optional = WIZARD_STEPS.filter((s) => !s.required).map((s) => s.id);
    expect(isOnboardingComplete(optional)).toBe(false);
  });
});

describe("Onboarding — Feature Suggestions", () => {
  it("should suggest features for barbiere", () => {
    const features = getSuggestedFeatures("barbiere");
    expect(features.length).toBeGreaterThan(0);
    const ids = features.map((f) => f.id);
    expect(ids).toContain("booking");
    expect(ids).toContain("queue");
  });

  it("should suggest catalog for forno", () => {
    const features = getSuggestedFeatures("forno");
    const ids = features.map((f) => f.id);
    expect(ids).toContain("catalog");
  });

  it("should fall back to 'altro' for unknown categories", () => {
    const features = getSuggestedFeatures("tipo-sconosciuto");
    expect(features.length).toBeGreaterThan(0);
  });

  it("should have enabled flag set to true for suggested features", () => {
    const features = getSuggestedFeatures("barbiere");
    for (const feature of features) {
      expect(feature.enabled).toBe(true);
    }
  });
});

describe("Onboarding — Activation Nudges", () => {
  it("should suggest adding services when none exist", () => {
    const nudges = getActivationNudges({
      hasServices: false,
      hasProducts: false,
      bookingEnabled: false,
      websitePublished: false,
      whatsappConnected: false,
      loyaltyEnabled: false,
      hasCustomers: false,
    });
    expect(nudges.some((n) => n.id === "add-services")).toBe(true);
  });

  it("should suggest publishing website when not published", () => {
    const nudges = getActivationNudges({
      hasServices: true,
      hasProducts: true,
      bookingEnabled: true,
      websitePublished: false,
      whatsappConnected: true,
      loyaltyEnabled: true,
      hasCustomers: true,
    });
    expect(nudges.some((n) => n.id === "publish-website")).toBe(true);
  });

  it("should return empty for fully configured business", () => {
    const nudges = getActivationNudges({
      hasServices: true,
      hasProducts: true,
      bookingEnabled: true,
      websitePublished: true,
      whatsappConnected: true,
      loyaltyEnabled: true,
      hasCustomers: true,
    });
    expect(nudges.length).toBe(0);
  });

  it("should sort by priority", () => {
    const nudges = getActivationNudges({
      hasServices: false,
      hasProducts: false,
      bookingEnabled: false,
      websitePublished: false,
      whatsappConnected: false,
      loyaltyEnabled: false,
      hasCustomers: false,
    });
    for (let i = 1; i < nudges.length; i++) {
      expect(nudges[i].priority).toBeGreaterThanOrEqual(nudges[i - 1].priority);
    }
  });
});

describe("Onboarding — Estimated Setup Time", () => {
  it("should return total minutes", () => {
    const time = getEstimatedSetupTime();
    expect(time).toBeGreaterThan(10);
    expect(time).toBeLessThan(60);
  });
});

describe("Onboarding — Category Config", () => {
  it("should find barbiere config", () => {
    const config = getCategoryConfig("barbiere");
    expect(config).toBeDefined();
    expect(config!.label).toBe("Barbiere");
  });

  it("should be case-insensitive", () => {
    const config = getCategoryConfig("Barbiere");
    expect(config).toBeDefined();
  });

  it("should return undefined for unknown category", () => {
    const config = getCategoryConfig("sconosciuto");
    expect(config).toBeUndefined();
  });
});
