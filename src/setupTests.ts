import '@testing-library/jest-dom';
import { vi } from "vitest";

// Mock temporal polyfill
vi.mock("@js-temporal/polyfill", () => ({
  Temporal: {
    Now: {
      timeZoneId: () => "UTC",
      plainDateISO: () => ({
        equals: () => true,
      }),
      instant: () => ({
        epochMilliseconds: 1705312800000,
      }),
    },
    PlainDate: {
      from: () => ({}),
    },
    Instant: {
      from: () => ({
        epochMilliseconds: 1705312800000,
        toString: () => "2024-01-15T10:00:00.000Z",
        since: () => ({
          hours: 1,
          minutes: 30,
          toString: () => "01:30",
        }),
      }),
      fromEpochMilliseconds: () => ({
        since: () => ({
          hours: 1,
          minutes: 30,
          toString: () => "01:30",
        }),
      }),
    },
  },
}));
