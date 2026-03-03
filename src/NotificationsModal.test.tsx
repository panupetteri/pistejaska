import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi, beforeEach } from "vitest";
import NotificationsModal from "./NotificationsModal";
import { createMockNotification, createMockUser, createMockGame } from "./test-utils/factories";
import { Notification } from "./domain/notification";

const mockNavigate = vi.fn();
const mockLocationState = vi.hoisted(() => ({ value: {} as Record<string, unknown> }));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({
      pathname: "/",
      state: mockLocationState.value
    }),
  };
});

const mockDismissNotification = vi.fn();
const mockDismissAll = vi.fn();
let mockNotificationsData: Notification[] = [];

vi.mock("./common/hooks/useNotifications", () => ({
  useNotifications: () => ({
    notifications: mockNotificationsData,
    loading: false,
    dismissNotification: mockDismissNotification,
    dismissAll: mockDismissAll,
  }),
}));

vi.mock("./common/hooks/useUsers", () => ({
  useUsers: () => [[
    createMockUser({ id: "u1", playerName: "Alice", photoURL: "alice.jpg" }),
    createMockUser({ id: "u2", playerName: "Bob", photoURL: null })
  ], false, undefined],
}));

vi.mock("./common/hooks/useGames", () => ({
  useGames: () => [[
    createMockGame({ id: "g1", name: "Carcassonne", icon: "carc.jpg" })
  ], false, undefined],
}));

describe("NotificationsModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocationState.value = {};
    mockNotificationsData = [
      createMockNotification({ 
        id: "n1", 
        fromUserId: "u1", 
        playName: "Today Game", 
        gameId: "g1",
        isRead: false,
        created: new Date().toISOString() 
      }),
      createMockNotification({ 
        id: "n2", 
        fromUserId: "u2", 
        playName: "Yesterday Game", 
        gameId: "g1",
        isRead: true,
        created: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() 
      })
    ];
  });

  describe("Visibility Logic", () => {
    it("does not show if there are zero notifications total", () => {
      mockNotificationsData = [];
      render(<MemoryRouter><NotificationsModal /></MemoryRouter>);
      expect(screen.queryByText("Notifications")).not.toBeInTheDocument();
    });

    it("does not show automatically if there are only read notifications", () => {
      mockNotificationsData = [createMockNotification({ isRead: true })];
      render(<MemoryRouter><NotificationsModal /></MemoryRouter>);
      expect(screen.queryByText("Notifications")).not.toBeInTheDocument();
    });

    it("shows automatically if there is at least one unread notification", () => {
      mockNotificationsData = [createMockNotification({ isRead: false })];
      render(<MemoryRouter><NotificationsModal /></MemoryRouter>);
      expect(screen.getByText("Notifications")).toBeInTheDocument();
    });

    it("shows even if all are read if forced open via state", () => {
      mockNotificationsData = [createMockNotification({ isRead: true })];
      mockLocationState.value = { showNotifications: true };
      render(<MemoryRouter><NotificationsModal /></MemoryRouter>);
      expect(screen.getByText("Notifications")).toBeInTheDocument();
    });
  });

  describe("Content Rendering", () => {
    it("renders unread and read notifications with correct formatting", () => {
      render(<MemoryRouter><NotificationsModal /></MemoryRouter>);

      expect(screen.getByText("Notifications")).toBeInTheDocument();
      expect(screen.getByText("1 NEW")).toBeInTheDocument(); // Only n1 is unread
      
      expect(screen.getByText(/Alice/)).toBeInTheDocument();
      expect(screen.getByText(/Bob/)).toBeInTheDocument();
      
      expect(screen.getByText("Today")).toBeInTheDocument();
      expect(screen.getByText("Yesterday")).toBeInTheDocument();
    });

    it("sorts notifications by date descending (newest first)", () => {
      mockNotificationsData = [
        createMockNotification({ id: "old", playName: "Old", created: "2024-01-01T10:00:00Z", isRead: false }),
        createMockNotification({ id: "new", playName: "New", created: new Date().toISOString(), isRead: false })
      ];
      
      render(<MemoryRouter><NotificationsModal /></MemoryRouter>);

      const notificationTexts = screen.getAllByRole("listitem").map(li => li.textContent);
      expect(notificationTexts[0]).toContain("New");
      expect(notificationTexts[1]).toContain("Old");
    });
  });

  describe("Actions", () => {
    it("navigates to play view when notification row is clicked", () => {
      render(<MemoryRouter><NotificationsModal /></MemoryRouter>);

      const rows = screen.getAllByRole("listitem");
      fireEvent.click(rows[0]);

      expect(mockNavigate).toHaveBeenCalledWith(expect.stringContaining("/view/"), {
        state: { scrollToComments: true }
      });
    });

    it("marks as read when individual dismiss button is clicked", () => {
      render(<MemoryRouter><NotificationsModal /></MemoryRouter>);

      const dismissBtn = screen.getByLabelText("Mark read");
      fireEvent.click(dismissBtn);

      expect(mockDismissNotification).toHaveBeenCalledWith("n1");
    });

    it("marks all read when Mark all read is clicked", () => {
      render(<MemoryRouter><NotificationsModal /></MemoryRouter>);

      fireEvent.click(screen.getByText("Mark all read"));
      expect(mockDismissAll).toHaveBeenCalled();
    });

    it("closes modal when Close is clicked without marking read", () => {
      render(<MemoryRouter><NotificationsModal /></MemoryRouter>);

      fireEvent.click(screen.getByText("Close"));
      expect(screen.queryByText("Notifications")).not.toBeInTheDocument();
      expect(mockDismissAll).not.toHaveBeenCalled();
    });

    it("stays open when forced via state after being previously closed", () => {
      const { rerender } = render(<MemoryRouter><NotificationsModal /></MemoryRouter>);

      // 1. Close the modal
      fireEvent.click(screen.getByText("Close"));
      expect(screen.queryByText("Notifications")).not.toBeInTheDocument();

      // 2. Simulate NavBar click (new state)
      mockLocationState.value = { showNotifications: true };
      rerender(<MemoryRouter><NotificationsModal /></MemoryRouter>);
      
      // Should be visible now
      expect(screen.getByText("Notifications")).toBeInTheDocument();

      // 3. Navigation to clear state should have been called synchronously
      expect(mockNavigate).toHaveBeenCalledWith("/", expect.objectContaining({ state: {} }));
      
      // 4. Simulate the render AFTER state is cleared
      mockLocationState.value = {};
      rerender(<MemoryRouter><NotificationsModal /></MemoryRouter>);

      // CRITICAL: It should STILL be visible because isVisible was set to true
      expect(screen.getByText("Notifications")).toBeInTheDocument();
    });
  });
});
