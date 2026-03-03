import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { AdminUsersView } from "./AdminUsersView";
import useCurrentUser from "../common/hooks/useCurrentUser";
import { usePlays } from "../common/hooks/usePlays";
import { useUsers, linkUserToPlayer } from "../common/hooks/useUsers";
import { createMockUser, createMockPlayDTO } from "../test-utils/factories";
import { isAdmin } from "../auth/auth";
import { Player, Play } from "../domain/play";
import { User } from "firebase/auth";

vi.mock("../common/hooks/useCurrentUser");
vi.mock("../common/hooks/usePlays");
vi.mock("../common/hooks/useUsers");
vi.mock("../auth/auth");
vi.mock("../common/firebase", () => ({
  db: {}
}));

// Mock firestore to avoid "Expected first argument to collection() to be a CollectionReference..."
vi.mock("firebase/firestore", () => {
  const collectionMock = {
    withConverter: vi.fn().mockReturnThis(),
  };
  return {
    getFirestore: vi.fn(),
    collection: vi.fn(() => collectionMock),
    doc: vi.fn(),
    setDoc: vi.fn(),
    FirestoreDataConverter: vi.fn(),
  };
});

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock crypto.randomUUID
if (!global.crypto) {
  Object.defineProperty(global, "crypto", {
    value: {
      randomUUID: () => "mock-uuid"
    }
  });
}

describe("AdminUsersView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(isAdmin).mockReturnValue(true);
    vi.mocked(useCurrentUser).mockReturnValue([
      { uid: "admin-id", emailVerified: true, email: "admin@example.com" } as User,
      false,
      undefined
    ] as [User | null, boolean, Error | undefined]);
    // Default mocks for hooks to avoid iterator errors
    vi.mocked(usePlays).mockReturnValue([[], false, undefined]);
    vi.mocked(useUsers).mockReturnValue([[], false, undefined]);
  });

  it("redirects if user is not admin", async () => {
    vi.mocked(isAdmin).mockReturnValue(false);
    render(
      <MemoryRouter>
        <AdminUsersView />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  it("renders users and players lists", async () => {
    const mockUsers = [
      createMockUser({ id: "user-1", displayName: "User One", lastSignInTime: "2024-01-01" }),
      createMockUser({ id: "user-2", displayName: "User Two", playerId: "p-2", playerName: "Player Two" })
    ];
    const mockPlays = [
      createMockPlayDTO({
        players: [{ id: "p-1", name: "Player One" }, { id: "p-2", name: "Player Two" }] as Player[]
      })
    ];

    vi.mocked(useUsers).mockReturnValue([mockUsers, false, undefined]);
    vi.mocked(usePlays).mockReturnValue([mockPlays.map(p => new Play(p)) as Play[], false, undefined]);

    render(
      <MemoryRouter>
        <AdminUsersView />
      </MemoryRouter>
    );

    expect(screen.getByText("User One")).toBeInTheDocument();
    expect(screen.getByText(/UID: user-1/)).toBeInTheDocument();
    expect(screen.getByText(/Last Login: 2024-01-01/)).toBeInTheDocument();

    expect(screen.getByText("User Two")).toBeInTheDocument();
    expect(screen.getByText("Linked to: Player Two (p-2)")).toBeInTheDocument();

    expect(screen.getByText("Player One")).toBeInTheDocument();
    expect(screen.getByText(/ID: p-1/)).toBeInTheDocument();
  });

  it("opens link modal and calls linkUserToPlayer", async () => {
    const user = userEvent.setup();
    const mockUsers = [createMockUser({ id: "user-1", displayName: "User One" })];
    const mockPlays = [
      createMockPlayDTO({
        players: [{ id: "p-1", name: "Player One" }] as Player[]
      })
    ];

    vi.mocked(useUsers).mockReturnValue([mockUsers, false, undefined]);
    vi.mocked(usePlays).mockReturnValue([mockPlays.map(p => new Play(p)) as Play[], false, undefined]);
    vi.mocked(linkUserToPlayer).mockResolvedValue(undefined);

    render(
      <MemoryRouter>
        <AdminUsersView />
      </MemoryRouter>
    );

    await user.click(screen.getByText("Link"));

    expect(screen.getByText("Link User One to player")).toBeInTheDocument();

    const select = screen.getByRole("combobox");
    await user.selectOptions(select, "p-1");

    await user.click(screen.getByText("OK"));

    expect(linkUserToPlayer).toHaveBeenCalledWith(expect.anything(), "user-1", "p-1", "Player One");
    expect(screen.queryByText("Link User One to player")).not.toBeInTheDocument();
  });

  it("closes modal on cancel", async () => {
    const user = userEvent.setup();
    vi.mocked(useUsers).mockReturnValue([[createMockUser()], false, undefined]);
    vi.mocked(usePlays).mockReturnValue([[], false, undefined]);

    render(
      <MemoryRouter>
        <AdminUsersView />
      </MemoryRouter>
    );

    await user.click(screen.getByText("Link"));
    expect(screen.getByText(/Link .* to player/)).toBeInTheDocument();

    await user.click(screen.getByText("Cancel"));
    expect(screen.queryByText(/Link .* to player/)).not.toBeInTheDocument();
  });
});
