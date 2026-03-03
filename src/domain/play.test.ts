import { describe, it, expect } from "vitest";
import { Play } from "./play";
import { createMockPlayDTO } from "../test-utils/factories";

describe("Play", () => {
  const mockPlayDTO = createMockPlayDTO({
    id: "play-1",
    gameId: "7-wonders",
    expansions: [],
    players: [
      { id: "p1", name: "Alice" },
      { id: "p2", name: "Bob" },
    ],
    scores: [
      { playerId: "p1", fieldId: "military", score: 10 },
      { playerId: "p1", fieldId: "science", score: 20 },
      { playerId: "p2", fieldId: "military", score: 5 },
      { playerId: "p2", fieldId: "science", score: 25 },
      { playerId: "p1", fieldId: "tie-breaker", score: 2 },
      { playerId: "p2", fieldId: "tie-breaker", score: 1 },
    ],
    misc: [
      { fieldId: "date", data: "2023-01-01" },
      { fieldId: "location", data: "Alice's House" },
    ],
  });

  it("calculates total scores correctly (excluding tie-breakers)", () => {
    const play = new Play(mockPlayDTO);
    expect(play.getTotal("p1")).toBe(30);
    expect(play.getTotal("p2")).toBe(30);
  });

  it("identifies winners correctly", () => {
    const play = new Play(mockPlayDTO);
    const winners = play.getWinners();
    // In case of a tie in total score (30 vs 30), it should look at tie-breaker (2 vs 1)
    expect(winners.length).toBe(1);
    expect(winners[0].player.id).toBe("p1");
  });

  it("retrieves misc field values correctly", () => {
    const play = new Play(mockPlayDTO);
    // locationField is defined in game.ts as { id: "location", ... }
    const location = play.getDisplayName();
    expect(location).toBe("Alice's House");
  });

  it("handles empty scores and players", () => {
    const emptyPlay = new Play({
      ...mockPlayDTO,
      players: [],
      scores: [],
    });
    expect(emptyPlay.getTotal("p1")).toBe(0);
    expect(emptyPlay.getWinners()).toEqual([]);
  });

  it("converts back to DTO correctly", () => {
    const play = new Play(mockPlayDTO);
    const dto = play.toDTO();
    expect(dto.id).toBe(mockPlayDTO.id);
    expect(dto.gameId).toBe(mockPlayDTO.gameId);
    expect(dto.scores).toEqual(mockPlayDTO.scores);
  });
});
