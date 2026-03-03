import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { NavBar } from "./NavBar";
import { createMockNotification } from "../../test-utils/factories";
import { Notification } from "../../domain/notification";
import { DropdownMenuOption } from "./dropdowns/DropdownMenu";

const mockNotifications = vi.hoisted(() => ({
  data: [] as Notification[],
}));

vi.mock("../hooks/useNotifications", () => ({
  useNotifications: () => ({
    notifications: mockNotifications.data,
  }),
}));

// Mock DropdownMenu to simplify tests
vi.mock("./dropdowns/DropdownMenu", () => ({
  default: ({ options, children }: { options: DropdownMenuOption<string>[], children: React.ReactNode }) => (
    <div>
      {children}
      <div data-testid="mock-menu-options">
        {options.map((o) => (
          <div key={o.value}>{o.label}</div>
        ))}
      </div>
    </div>
  ),
}));

describe("NavBar Notifications Visibility", () => {
  beforeEach(() => {
    cleanup();
    mockNotifications.data = [];
  });

  it("shows only logo without count when there are no unread notifications", () => {
    mockNotifications.data = [createMockNotification({ isRead: true })];
    
    render(
      <MemoryRouter>
        <NavBar />
      </MemoryRouter>
    );

    const logo = screen.getByRole("link", { name: /Pistejaska/i });
    expect(logo).toBeInTheDocument();
    // Use queryByText on the logo element specifically or check content
    expect(logo.textContent).toBe("Pistejaska");
    expect(logo).not.toHaveClass("text-yellow-300");
  });

  it("shows count and yellow color when there are unread notifications", () => {
    mockNotifications.data = [
      createMockNotification({ isRead: true }),
      createMockNotification({ isRead: false }),
      createMockNotification({ isRead: false })
    ];
    
    render(
      <MemoryRouter>
        <NavBar />
      </MemoryRouter>
    );

    const logo = screen.getByRole("link", { name: /Pistejaska/i });
    expect(logo).toBeInTheDocument();
    expect(logo.textContent).toContain("(2)");
    expect(logo).toHaveClass("text-yellow-300");
  });

  it("only passes showNotifications state in logo link when unread notifications exist", () => {
    // Case 1: Unread exist
    mockNotifications.data = [createMockNotification({ isRead: false })];
    render(<MemoryRouter><NavBar /></MemoryRouter>);
    
    const logoWithUnread = screen.getByRole("link", { name: /Pistejaska/i });
    expect(logoWithUnread.textContent).toContain("(1)");

    cleanup();

    // Case 2: No unread (only read)
    mockNotifications.data = [createMockNotification({ isRead: true })];
    render(<MemoryRouter><NavBar /></MemoryRouter>);
    const logoNoUnread = screen.getByRole("link", { name: /Pistejaska/i });
    expect(logoNoUnread.textContent).toBe("Pistejaska");
  });

  it("always shows Notifications in the avatar menu", () => {
    // Case 1: No notifications
    mockNotifications.data = [];
    render(
      <MemoryRouter>
        <NavBar />
      </MemoryRouter>
    );
    expect(screen.getByText("Notifications")).toBeInTheDocument();

    cleanup();

    // Case 2: Unread notifications
    mockNotifications.data = [createMockNotification({ isRead: false })];
    render(
      <MemoryRouter>
        <NavBar />
      </MemoryRouter>
    );
    expect(screen.getByText("Notifications (1)")).toBeInTheDocument();
  });
});
