/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { addComment } from "./addComment";
import { createMockCommentDTO, createMockPlayDTO, createMockUser } from "../test-utils/factories";
import { setDoc, getDoc, getDocs } from "firebase/firestore";
import { User } from "firebase/auth";

vi.mock("firebase/firestore", () => {
  return {
    getFirestore: vi.fn(),
    doc: vi.fn((_db, collection, id) => ({ _path: { segments: [collection, id] } })),
    setDoc: vi.fn(() => Promise.resolve()),
    getDoc: vi.fn(),
    getDocs: vi.fn(),
    collection: vi.fn((_db, collection) => ({ _query: { path: { segments: [collection] } } })),
    query: vi.fn((col) => col),
    where: vi.fn(),
  };
});

vi.mock("../common/firebase", () => ({
  app: {},
}));

vi.mock("./addOrUpdateUser", () => ({
  default: vi.fn(() => Promise.resolve()),
}));

describe("addComment action", () => {
  const mockUser = {
    uid: "user-sender",
    displayName: "Sender User",
    photoURL: "sender.jpg",
  } as User;

  const mockComment = createMockCommentDTO({
    id: "c1",
    playId: "p1",
    userId: "user-sender",
    comment: "Hello world",
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("saves the comment and creates notifications for relevant users", async () => {
    // Mock play data
    const mockPlay = createMockPlayDTO({
      id: "p1",
      gameId: "g1",
      createdBy: "user-creator",
      players: [
        { id: "player-target", name: "Target Player" },
        { id: "player-sender", name: "Sender Player" }
      ]
    });

    // Mock users mapping
    const mockUsers = [
      createMockUser({ id: "user-target", playerId: "player-target", displayName: "Target User" }),
      createMockUser({ id: "user-creator", displayName: "Creator User" }),
      createMockUser({ id: "user-sender", playerId: "player-sender", displayName: "Sender User" }),
    ];

    // Mock Firestore behavior
    (getDoc as any).mockImplementation((docRef: any) => {
      if (docRef._path?.segments?.includes("plays-v1")) {
        return Promise.resolve({ exists: () => true, data: () => mockPlay });
      }
      return Promise.resolve({ exists: () => false });
    });

    (getDocs as any).mockImplementation((q: any) => {
      // If querying comments
      if (q?._query?.path?.segments?.includes("comments-v1")) {
        return Promise.resolve({ docs: [] }); // No previous comments
      }
      // If querying users
      return Promise.resolve({
        docs: mockUsers.map(u => ({ data: () => u }))
      });
    });

    await addComment(mockComment, mockUser);

    // Verify comment was saved
    expect(setDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ id: "c1", comment: "Hello world" })
    );

    // Verify notifications were created for Target User and Creator User
    const notificationCalls = (setDoc as any).mock.calls.filter((call: any) => 
      call[0]._path?.segments?.includes("notifications-v1")
    );
    
    expect(notificationCalls).toHaveLength(2);
    
    const notifiedUserIds = notificationCalls.map((call: any) => call[1].toUserId);
    expect(notifiedUserIds).toContain("user-target");
    expect(notifiedUserIds).toContain("user-creator");
    expect(notifiedUserIds).not.toContain("user-sender");
  });

  it("gracefully exits if the play does not exist", async () => {
    (getDoc as any).mockImplementation(() => 
      Promise.resolve({ exists: () => false })
    );

    await addComment(mockComment, mockUser);

    // Comment should still be saved
    expect(setDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ id: "c1" })
    );
    
    // But no notifications should be created
    const notificationCalls = (setDoc as any).mock.calls.filter((call: any) => 
      call[0]._path?.segments?.includes("notifications-v1")
    );
    expect(notificationCalls).toHaveLength(0);
  });

  it("logs an error but doesn't crash if notification creation fails", async () => {
    // Mock play to trigger notification logic
    const mockPlay = createMockPlayDTO({ id: "p1" });
    (getDoc as any).mockImplementation(() => 
      Promise.resolve({ exists: () => true, data: () => mockPlay })
    );
    
    // Force getDocs to throw
    const error = new Error("Firestore down");
    (getDocs as any).mockImplementation(() => { throw error; });
    
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await addComment(mockComment, mockUser);

    expect(consoleSpy).toHaveBeenCalledWith("Failed to create notifications", error);
    consoleSpy.mockRestore();
  });
});
