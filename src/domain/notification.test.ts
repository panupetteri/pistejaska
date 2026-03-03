import { describe, it, expect } from "vitest";
import { Notification } from "./notification";
import { createMockNotificationDTO } from "../test-utils/factories";
import { Temporal } from "@js-temporal/polyfill";

describe("Notification", () => {
  it("initializes correctly from DTO", () => {
    const dto = createMockNotificationDTO({
      id: "test-id",
      playName: "Custom Play",
      created: "2024-03-03T10:00:00Z"
    });
    
    const notification = new Notification(dto);
    
    expect(notification.id).toBe("test-id");
    expect(notification.playName).toBe("Custom Play");
    expect(notification.isRead).toBe(false);
    expect(notification.created).toBeInstanceOf(Temporal.Instant);
    expect(notification.created.toString()).toBe("2024-03-03T10:00:00Z");
  });

  it("handles isRead status", () => {
    const unreadDto = createMockNotificationDTO({ isRead: false });
    const readDto = createMockNotificationDTO({ isRead: true });
    
    expect(new Notification(unreadDto).isRead).toBe(false);
    expect(new Notification(readDto).isRead).toBe(true);
  });
});
