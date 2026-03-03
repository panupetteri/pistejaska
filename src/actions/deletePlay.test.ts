/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { deletePlay } from "./deletePlay";
import { getDocs, writeBatch } from "firebase/firestore";

const mockBatch = {
  delete: vi.fn(),
  commit: vi.fn(() => Promise.resolve()),
};

vi.mock("firebase/firestore", () => {
  return {
    getFirestore: vi.fn(),
    doc: vi.fn((_db, collection, id) => ({ _path: { segments: [collection, id] }, id })),
    deleteDoc: vi.fn(() => Promise.resolve()),
    getDocs: vi.fn(),
    collection: vi.fn((_db, collection) => ({ _query: { path: { segments: [collection] } } })),
    query: vi.fn((col) => col),
    where: vi.fn((field, op, value) => ({ field, op, value })),
    writeBatch: vi.fn(() => mockBatch),
  };
});

vi.mock("../common/firebase", () => ({
  app: {},
}));

describe("deletePlay action", () => {
  const playId = "play-123";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes the play, its comments, and its notifications using a batch", async () => {
    // 1. Mock finding 2 comments and 1 notification for this play
    (getDocs as any).mockImplementation((q: any) => {
      if (q?._query?.path?.segments?.includes("comments-v1")) {
        return Promise.resolve({
          docs: [
            { id: "c1", ref: { id: "c1", _path: { segments: ["comments-v1", "c1"] } } },
            { id: "c2", ref: { id: "c2", _path: { segments: ["comments-v1", "c2"] } } }
          ]
        });
      }
      if (q?._query?.path?.segments?.includes("notifications-v1")) {
        return Promise.resolve({
          docs: [
            { id: "n1", ref: { id: "n1", _path: { segments: ["notifications-v1", "n1"] } } }
          ]
        });
      }
      return Promise.resolve({ docs: [] });
    });

    // 2. Run the deletion
    await deletePlay(playId);

    // 3. Verify batch was committed
    expect(writeBatch).toHaveBeenCalled();
    expect(mockBatch.commit).toHaveBeenCalled();

    // 4. Verify play deletion in batch
    const playDeleteCall = mockBatch.delete.mock.calls.find((call: any) => 
      call[0]._path?.segments?.includes("plays-v1") && call[0].id === playId
    );
    expect(playDeleteCall).toBeDefined();

    // 5. Verify comment deletions in batch
    const commentDeleteCalls = mockBatch.delete.mock.calls.filter((call: any) => 
      call[0]._path?.segments?.includes("comments-v1")
    );
    expect(commentDeleteCalls).toHaveLength(2);

    // 6. Verify notification deletions in batch
    const notificationDeleteCalls = mockBatch.delete.mock.calls.filter((call: any) => 
      call[0]._path?.segments?.includes("notifications-v1")
    );
    expect(notificationDeleteCalls).toHaveLength(1);
  });
});
