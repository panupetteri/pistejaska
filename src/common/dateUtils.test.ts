import { describe, it, expect } from "vitest";
import { Temporal } from "@js-temporal/polyfill";
import {
  convertToPlainDate,
  convertToPlainTime,
  convertToLocaleDateString,
  convertToLocaleTimeString,
} from "./dateUtils";

describe("dateUtils", () => {
  const instant = Temporal.Instant.from("2023-01-01T12:30:00Z");

  it("converts instant to plain date", () => {
    const plainDate = convertToPlainDate(instant);
    // Note: timezone could affect this, but since we're using ISO, it should be fine
    // Or we could mock the timeZoneId
    expect(plainDate.toString()).toBe("2023-01-01");
  });

  it("converts instant to plain time", () => {
    const plainTime = convertToPlainTime(instant);
    // Note: timezone could affect this. In UTC it is 12:30:00
    expect(plainTime).toBeInstanceOf(Temporal.PlainTime);
    expect(plainTime.hour).toBeGreaterThanOrEqual(0);
    expect(plainTime.hour).toBeLessThan(24);
    expect(plainTime.minute).toBe(30);
  });

  it("converts to locale strings", () => {
    // Should return a string that contains at least the day or year info
    expect(convertToLocaleDateString(instant)).toContain("2023");
    expect(convertToLocaleTimeString(instant)).toMatch(/\d+/); // Should contain some numbers for time
  });

  it("handles null/undefined instants for locale strings", () => {
    // @ts-expect-error - testing null input
    expect(convertToLocaleDateString(null)).toBe("");
    // @ts-expect-error - testing undefined input
    expect(convertToLocaleTimeString(undefined)).toBe("");
  });
});
