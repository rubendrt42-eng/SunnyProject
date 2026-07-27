import { describe, expect, it } from "vitest";
import { isDemoExperience, displayTitle } from "@/lib/demo-content";

describe("isDemoExperience", () => {
  it("detects the [Demostración] suffix", () => {
    expect(isDemoExperience("Pilates Reformer Intro [Demostración]")).toBe(true);
  });

  it("is false for titles without the tag", () => {
    expect(isDemoExperience("Pilates Reformer Intro")).toBe(false);
  });

  it("is case-insensitive on the accented character", () => {
    expect(isDemoExperience("Sunset Yoga [demostracion]")).toBe(true);
  });
});

describe("displayTitle", () => {
  it("strips the demo tag and surrounding whitespace", () => {
    expect(displayTitle("Pilates Reformer Intro [Demostración]")).toBe("Pilates Reformer Intro");
  });

  it("leaves non-demo titles unchanged", () => {
    expect(displayTitle("Pilates Reformer Intro")).toBe("Pilates Reformer Intro");
  });
});
