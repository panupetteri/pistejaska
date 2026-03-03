import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Play } from "./play";
import { createMockPlayDTO } from "../test-utils/factories";
import { Temporal } from "@js-temporal/polyfill";
import { GameMiscFieldDefinition } from "./game";

describe("Play", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const getMockPlayDTO = () => createMockPlayDTO({
    id: "play-1",
    gameId: "7-wonders",
    expansions: ["leaders"],
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
      { fieldId: "name", data: "Friday Night Game" },
      { fieldId: "location", data: "Alice's House" },
      { fieldId: "date", data: "2023-01-01" },
      { fieldId: "duration", data: 1.5 },
      { fieldId: "faction", data: "Romans", playerId: "p1" },
    ],
    created: "2023-01-01T20:00:00.000Z",
    createdBy: "u1",
  });

  it("calculates total scores correctly (excluding tie-breakers)", () => {
    const play = new Play(getMockPlayDTO());
    expect(play.getTotal("p1")).toBe(30);
    expect(play.getTotal("p2")).toBe(30);
  });

  it("identifies winners correctly", () => {
    const play = new Play(getMockPlayDTO());
    const winners = play.getWinners();
    expect(winners.length).toBe(1);
    expect(winners[0].player.id).toBe("p1");
  });

  it("retrieves rankings correctly", () => {
    const play = new Play(getMockPlayDTO());
    const p1Ranking = play.getRanking("p1");
    expect(p1Ranking?.position).toBe(1);
    expect(p1Ranking?.score).toBe(30);

    const p2Ranking = play.getRanking("p2");
    expect(p2Ranking?.position).toBe(2);
  });

  it("retrieves positions correctly", () => {
    const play = new Play(getMockPlayDTO());
    expect(play.getPosition("p1")).toBe(1);
    expect(play.getPosition("p2")).toBe(2);
    expect(play.getPosition("non-existent")).toBeNaN();
  });

  it("retrieves tie-breaker correctly", () => {
    const play = new Play(getMockPlayDTO());
    expect(play.getTieBreaker("p1")).toBe(2);
    expect(play.getTieBreaker("p2")).toBe(1);
    expect(play.getTieBreaker("non-existent")).toBe(0);
  });

  it("handles misc field values correctly", () => {
    const play = new Play(getMockPlayDTO());
    expect(play.getDisplayName()).toBe("Friday Night Game");
    expect(play.getLocation()).toBe("Alice's House");
    
    // Per-player misc field
    const factionField = { id: "faction", name: "Faction", type: "text" } as GameMiscFieldDefinition<string>;
    expect(play.getMiscFieldValue(factionField, "p1")).toBe("Romans");
    expect(play.getMiscFieldValue(factionField, "p2")).toBeUndefined();
  });

  it("returns fallback name when name/location are missing", () => {
    const minimalPlay = new Play({
      ...getMockPlayDTO(),
      misc: [{ fieldId: "date", data: "2023-01-01" }],
    });
    // For ISO date string 2023-01-01, getName should contain the formatted date
    const name = minimalPlay.getName();
    expect(name).toContain("2023");
    expect(minimalPlay.getDisplayName()).toBe("");
  });

  it("handles duration correctly", () => {
    const play = new Play(getMockPlayDTO());
    expect(play.getDurationInHours()).toBe(1.5);
    
    play.setDurationInHours(2.5);
    expect(play.getDurationInHours()).toBe(2.5);
  });

  it("calculates time since creation", () => {
    const play = new Play(getMockPlayDTO()); // created at 20:00:00
    const now = Temporal.Instant.from("2023-01-01T21:30:00Z");
    vi.setSystemTime(new Date(now.epochMilliseconds));
    
    expect(play.getTimeInHoursSinceCreation()).toBe(1.5);
  });

  it("detects if play is resolved", () => {
    const play = new Play(getMockPlayDTO());
    expect(play.isResolved()).toBe(true);

    const unresolvedPlay = new Play({
      ...getMockPlayDTO(),
      scores: [],
    });
    expect(unresolvedPlay.isResolved()).toBe(false);
  });

  it("checks if player exists in play", () => {
    const play = new Play(getMockPlayDTO());
    expect(play.hasPlayer("p1")).toBe(true);
    expect(play.hasPlayer("p3")).toBe(false);
  });

  it("handles images correctly", () => {
    const dto = getMockPlayDTO();
    const playWithImages = new Play({
      ...dto,
      misc: [
        ...dto.misc,
        { fieldId: "images", data: ["img1.jpg", "img2.jpg"] }
      ],
    });
    expect(playWithImages.getImages()).toEqual(["img1.jpg", "img2.jpg"]);
    const imageUrls = playWithImages.getImageUrls();
    expect(imageUrls[0]).toBe("https://firebasestorage.googleapis.com/v0/b/pistejaska-dev.appspot.com/o/play-images%2Fimg1.jpg?alt=media");
    expect(imageUrls[1]).toBe("https://firebasestorage.googleapis.com/v0/b/pistejaska-dev.appspot.com/o/play-images%2Fimg2.jpg?alt=media");
  });

  it("formats misc field display values", () => {
    const play = new Play(getMockPlayDTO());
    const factionField = { 
      id: "faction", 
      name: "Faction", 
      type: "text",
      options: [{ value: "Romans", label: "SPQR" }]
    } as GameMiscFieldDefinition<string>;
    
    expect(play.getMiscFieldDisplayValue(factionField, "p1")).toBe("SPQR");
    
    const durationField = { id: "duration", type: "duration" } as GameMiscFieldDefinition<number>;
    expect(play.getMiscFieldDisplayValue(durationField)).toBe("1h 30min");
  });

  it("converts back to DTO correctly", () => {
    const play = new Play(getMockPlayDTO());
    const dto = play.toDTO();
    expect(dto.id).toBe("play-1");
    expect(dto.created).toBe("2023-01-01T20:00:00.000Z");
    expect(dto.createdBy).toBe("u1");
  });
});
