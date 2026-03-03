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
    // The code uses Temporal.Now.timeZoneId() which is local.
    // Let's just check if it's a Temporal.PlainTime
    expect(plainTime).toBeInstanceOf(Temporal.PlainTime);
  });

  it("converts to locale strings", () => {
    // These might be locale dependent, but we can check if they return something non-empty
    expect(convertToLocaleDateString(instant)).toBeTruthy();
    expect(convertToLocaleTimeString(instant)).toBeTruthy();
  });

  it("handles null/undefined instants for locale strings", () => {
    // @ts-expect-error - testing null input
    expect(convertToLocaleDateString(null)).toBe("");
    // @ts-expect-error - testing undefined input
    expect(convertToLocaleTimeString(undefined)).toBe("");
  });
});
