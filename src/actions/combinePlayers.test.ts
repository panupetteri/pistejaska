/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { combinePlayers } from "./combinePlayers";
import { getDocs } from "firebase/firestore";

const mockBatch = {
  update: vi.fn(),
  commit: vi.fn(() => Promise.resolve()),
};

vi.mock("firebase/firestore", () => {
  return {
    getFirestore: vi.fn(),
    doc: vi.fn((_db, collection, id) => ({ id, ref: { id }, collection })),
    getDocs: vi.fn(),
    collection: vi.fn((_db, collection) => ({ collection })),
    writeBatch: vi.fn(() => mockBatch),
  };
});

vi.mock("../common/firebase", () => ({
  app: {},
}));

describe("combinePlayers action", () => {
  const keepId = "player-keep";
  const deleteId = "player-delete";
  const newName = "New Name";
  const db = {} as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates plays and users correctly", async () => {
    // Mock plays
    const mockPlays = [
      {
        id: "play-1",
        data: () => ({
          id: "play-1",
          gameId: "game-1",
          players: [{ id: deleteId, name: "Old Name" }, { id: "other", name: "Other" }],
          scores: [{ playerId: deleteId, fieldId: "f1", score: 10 }, { playerId: "other", fieldId: "f1", score: 5 }],
          misc: [{ fieldId: "m1", data: "val", playerId: deleteId }],
          created: "2024-01-01"
        }),
        ref: { id: "play-1", path: "plays-v1/play-1" }
      },
      {
        id: "play-2",
        data: () => ({
          id: "play-2",
          gameId: "game-2",
          players: [{ id: keepId, name: "Old Keep Name" }],
          scores: [{ playerId: keepId, fieldId: "f1", score: 20 }],
          misc: [],
          created: "2024-01-02"
        }),
        ref: { id: "play-2", path: "plays-v1/play-2" }
      },
      {
        id: "play-3", // Both players in same play
        data: () => ({
          id: "play-3",
          players: [{ id: keepId, name: "K" }, { id: deleteId, name: "D" }],
          scores: [{ playerId: keepId, fieldId: "f1", score: 1 }, { playerId: deleteId, fieldId: "f1", score: 2 }],
          misc: [],
        }),
        ref: { id: "play-3", path: "plays-v1/play-3" }
      },
      {
        id: "play-4", // No relevant players
        data: () => ({
          id: "play-4",
          players: [{ id: "other", name: "Other" }],
          scores: [],
          misc: [],
        }),
        ref: { id: "play-4", path: "plays-v1/play-4" }
      }
    ];

    (getDocs as any).mockImplementation((col: any) => {
      if (col.collection === "plays-v1") return Promise.resolve({ docs: mockPlays });
      return Promise.resolve({ docs: [] });
    });

    await combinePlayers(db, keepId, deleteId, newName);

    // Verify batch updates
    expect(mockBatch.commit).toHaveBeenCalled();

    // Play 1 (deleted player replaced)
    const play1Update = mockBatch.update.mock.calls.find(c => c[0].id === "play-1")![1];
    expect(play1Update.players).toContainEqual({ id: keepId, name: newName });
    expect(play1Update.players).toHaveLength(2);
    expect(play1Update.scores[0].playerId).toBe(keepId);
    expect(play1Update.misc[0].playerId).toBe(keepId);

    // Play 2 (keep player name updated)
    const play2Update = mockBatch.update.mock.calls.find(c => c[0].id === "play-2")![1];
    expect(play2Update.players[0]).toEqual({ id: keepId, name: newName });

    // Play 3 (merged)
    const play3Update = mockBatch.update.mock.calls.find(c => c[0].id === "play-3")![1];
    expect(play3Update.players).toHaveLength(1);
    expect(play3Update.players[0].id).toBe(keepId);
    expect(play3Update.scores.every((s: any) => s.playerId === keepId)).toBe(true);

    // Play 4 (no update)
    expect(mockBatch.update.mock.calls.find(c => c[0].id === "play-4")).toBeUndefined();
  });

  it("does not update Firestore in dry run mode", async () => {
    const mockPlay = {
      id: "play-dry",
      players: [{ id: deleteId, name: "Old" }],
      scores: [],
      misc: []
    };

    (getDocs as any).mockImplementation(() => Promise.resolve({ 
      docs: [{ id: "play-dry", data: () => mockPlay, ref: { id: "play-dry" } }] 
    }));

    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await combinePlayers(db, keepId, deleteId, newName, true);

    expect(mockBatch.update).not.toHaveBeenCalled();
    expect(mockBatch.commit).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("DRY RUN: Combine in play play-dry"));
    
    consoleSpy.mockRestore();
  });

  it("ensures other data models keep the same", async () => {
    const originalPlay = {
        id: "play-5",
        gameId: "game-keep-me",
        players: [{ id: deleteId, name: "Name" }],
        scores: [],
        misc: [],
        created: "very-important-date",
        createdBy: "very-important-user"
    };

    (getDocs as any).mockImplementation((col: any) => {
      if (col.collection === "plays-v1") return Promise.resolve({ 
        docs: [{ id: "play-5", data: () => originalPlay, ref: { id: "play-5" } }] 
      });
      return Promise.resolve({ docs: [] });
    });

    await combinePlayers(db, keepId, deleteId, newName);

    const update = mockBatch.update.mock.calls[0][1];
    // These should NOT be in the update object as they shouldn't change
    expect(update.gameId).toBeUndefined();
    expect(update.created).toBeUndefined();
    expect(update.createdBy).toBeUndefined();
    
    // Only changed fields should be present
    expect(Object.keys(update)).toEqual(["players", "scores", "misc"]);
  });
});
