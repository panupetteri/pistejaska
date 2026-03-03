import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { AdminOpsView } from "./AdminOpsView";
import useCurrentUser from "../common/hooks/useCurrentUser";
import { isAdmin } from "../auth/auth";
import { getDocs, setDoc, QuerySnapshot, DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { createMockUser, createMockPlayDTO, createMockCommentDTO } from "../test-utils/factories";
import { CommentDTO } from "../domain/comment";
import { User } from "firebase/auth";

vi.mock("../common/hooks/useCurrentUser");
vi.mock("../auth/auth");

// Mock firestore completely
vi.mock("firebase/firestore", () => {
    return {
      getFirestore: vi.fn(),
      collection: vi.fn((_db, path) => ({ path, withConverter: () => ({ path }) })),
      doc: vi.fn((_db, path, id) => ({ path, id })),
      setDoc: vi.fn(),
      getDocs: vi.fn(),
      query: vi.fn((c) => c),
      where: vi.fn(),
    };
});

vi.mock("../common/firebase", () => ({
  app: {},
  db: { mockedDb: true }
}));

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

describe("AdminOpsView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(isAdmin).mockReturnValue(true);
    vi.mocked(useCurrentUser).mockReturnValue([
      { uid: "admin-id", emailVerified: true, email: "admin@example.com" } as User,
      false,
      undefined
    ] as [User | null, boolean, Error | undefined]);
  });

  it("redirects if user is not admin", async () => {
    vi.mocked(isAdmin).mockReturnValue(false);
    render(
      <MemoryRouter>
        <AdminOpsView />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  it("creates notifications correctly: Case ABC play, D comments 10 times, A comments 1 time", async () => {
    const user = userEvent.setup();

    // Data Setup
    const play = createMockPlayDTO({
      id: "play-X",
      gameId: "game-X",
      players: [
        { id: "p-A", name: "Player A" },
        { id: "p-B", name: "Player B" },
        { id: "p-C", name: "Player C" }
      ],
      createdBy: "u-A" // A created the play
    });

    const users = [
      createMockUser({ id: "u-A", displayName: "User A", playerId: "p-A" }),
      createMockUser({ id: "u-B", displayName: "User B", playerId: "p-B" }),
      createMockUser({ id: "u-C", displayName: "User C", playerId: "p-C" }),
      createMockUser({ id: "u-D", displayName: "User D", playerId: "p-D" }),
      createMockUser({ id: "admin-id", displayName: "Admin" })
    ];

    // 10 comments from D, then 1 from A
    const comments: CommentDTO[] = [];
    for (let i = 0; i < 10; i++) {
      comments.push(createMockCommentDTO({
        id: `comment-D-${i}`,
        playId: "play-X",
        userId: "u-D",
        createdOn: `2024-01-01T10:00:0${i}Z`
      }));
    }
    comments.push(createMockCommentDTO({
      id: "comment-A-1",
      playId: "play-X",
      userId: "u-A",
      createdOn: "2024-01-01T11:00:00Z"
    }));

    // Firestore Mocks
    vi.mocked(getDocs).mockImplementation((col: unknown) => {
      const path = (col as { path: string }).path;
      if (path === "plays-v1") {
        return Promise.resolve({
          docs: [{ data: () => play } as unknown as QueryDocumentSnapshot<DocumentData>]
        } as QuerySnapshot<DocumentData>);
      }
      if (path === "users-v1") {
        return Promise.resolve({
          docs: users.map(u => ({ data: () => u } as unknown as QueryDocumentSnapshot<DocumentData>))
        } as QuerySnapshot<DocumentData>);
      }
      if (path === "comments-v1") {
        return Promise.resolve({
          docs: comments.map(c => ({ data: () => c } as unknown as QueryDocumentSnapshot<DocumentData>))
        } as QuerySnapshot<DocumentData>);
      }
      return Promise.resolve({ docs: [] } as unknown as QuerySnapshot<DocumentData>);
    });

    vi.mocked(setDoc).mockResolvedValue(undefined);

    render(
      <MemoryRouter>
        <AdminOpsView />
      </MemoryRouter>
    );

    const button = screen.getByRole("button", { name: /danger: create notifications for all comments/i });
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText(/Success! Created 4 notification entities/)).toBeInTheDocument();
    }, { timeout: 5000 });

    // Check individual notifications in the UI
    expect(screen.getByText("To: User A")).toBeInTheDocument();
    expect(screen.getByText("To: User B")).toBeInTheDocument();
    expect(screen.getByText("To: User C")).toBeInTheDocument();
    expect(screen.getByText("To: User D")).toBeInTheDocument();

    // Verify setDoc calls
    expect(setDoc).toHaveBeenCalledTimes(4);
    
    // Check one specific call to ensure it's correct
    expect(setDoc).toHaveBeenCalledWith(
        expect.objectContaining({ path: "notifications-v1" }),
        expect.objectContaining({
            toUserId: "u-A",
            fromUserId: "u-D",
            playId: "play-X"
        })
    );
  });
});
