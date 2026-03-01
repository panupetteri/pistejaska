import { describe, it, expect } from "vitest";
import { Game, GameDefinition } from "./game";

describe("Game", () => {
  const mockGameDef: GameDefinition = {
    id: "test-game",
    name: "Test Game",
    icon: "https://example.com/icon.png",
    simultaneousTurns: false,
    scoreFields: [
      { id: "points", name: "Points", type: "number" },
    ],
    expansions: [
      {
        id: "exp-1",
        name: "Expansion 1",
        scoreFields: [{ id: "exp-points", name: "Exp Points", type: "number" }],
      },
    ],
  };

  it("initializes correctly", () => {
    const game = new Game(mockGameDef);
    expect(game.name).toBe("Test Game");
    expect(game.id).toBe("test-game");
  });

  it("returns score fields including default ones", () => {
    const game = new Game(mockGameDef);
    const fields = game.getScoreFields();
    
    // Should have 'points' + 2 default fields (tie-breaker, misc)
    expect(fields.map(f => f.field.id)).toContain("points");
    expect(fields.map(f => f.field.id)).toContain("tie-breaker");
    expect(fields.map(f => f.field.id)).toContain("misc");
    expect(fields.length).toBe(3);
  });

  it("includes expansion fields when requested", () => {
    const game = new Game(mockGameDef);
    const fields = game.getScoreFields(["exp-1"]);
    
    expect(fields.map(f => f.field.id)).toContain("exp-points");
    expect(fields.length).toBe(4);
  });

  it("detects expansions correctly", () => {
    const game = new Game(mockGameDef);
    expect(game.hasExpansions()).toBe(true);

    const noExpGame = new Game({ ...mockGameDef, expansions: [] });
    expect(noExpGame.hasExpansions()).toBe(false);
  });
});
