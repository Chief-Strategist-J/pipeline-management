import { describe, it, expect } from "vitest";
import { ROADMAP_FEATURES } from "../domain/entities/feature-item.entity";

describe("Roadmap Matrix Domain Logic Unit Tests", () => {
  it("should contain exactly 25 enterprise critical roadmap features", () => {
    expect(ROADMAP_FEATURES.length).toBe(25);
  });

  it("should mark Feature #16 OCSP Stapling Engine as completed", () => {
    const ocspFeature = ROADMAP_FEATURES.find((f) => f.id === 16);
    expect(ocspFeature).toBeDefined();
    expect(ocspFeature?.name).toBe("OCSP Stapling Engine");
    expect(ocspFeature?.status).toBe("completed");
  });
});
