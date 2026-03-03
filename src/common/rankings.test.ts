import { describe, it, expect } from "vitest";
import { rankScores } from "./rankings";

describe("rankScores", () => {
  it("ranks simple scores correctly", () => {
    const scores = [{ score: 10 }, { score: 20 }, { score: 15 }];
    const ranked = rankScores(scores);

    expect(ranked[0].score).toBe(20);
    expect(ranked[0].position).toBe(1);
    expect(ranked[0].index).toBe(1);

    expect(ranked[1].score).toBe(15);
    expect(ranked[1].position).toBe(2);
    expect(ranked[1].index).toBe(2);

    expect(ranked[2].score).toBe(10);
    expect(ranked[2].position).toBe(3);
    expect(ranked[2].index).toBe(0);
  });

  it("handles ties in scores", () => {
    const scores = [{ score: 20 }, { score: 10 }, { score: 20 }];
    const ranked = rankScores(scores);

    expect(ranked[0].score).toBe(20);
    expect(ranked[0].position).toBe(1);

    expect(ranked[1].score).toBe(20);
    expect(ranked[1].position).toBe(1);

    expect(ranked[2].score).toBe(10);
    expect(ranked[2].position).toBe(3);
  });

  it("uses tie-breaker when scores are tied", () => {
    const scores = [
      { score: 20, tieBreaker: 5 },
      { score: 20, tieBreaker: 10 },
      { score: 10 },
    ];
    const ranked = rankScores(scores);

    expect(ranked[0].score).toBe(20);
    expect(ranked[0].tieBreaker).toBe(10);
    expect(ranked[0].position).toBe(1);

    expect(ranked[1].score).toBe(20);
    expect(ranked[1].tieBreaker).toBe(5);
    expect(ranked[1].position).toBe(2);
  });

  it("calculates normalized values correctly", () => {
    const scores = [{ score: 100 }, { score: 50 }, { score: 0 }];
    const ranked = rankScores(scores);

    expect(ranked[0].normalizedScore).toBe(1);
    expect(ranked[1].normalizedScore).toBe(0.5);
    expect(ranked[2].normalizedScore).toBe(0);

    expect(ranked[0].normalizedPosition).toBe(0); // position 1
    expect(ranked[1].normalizedPosition).toBe(0.5); // position 2
    expect(ranked[2].normalizedPosition).toBe(1); // position 3
  });

  it("handles empty arrays", () => {
    expect(rankScores([])).toEqual([]);
  });

  it("handles single-player games correctly", () => {
    const ranked = rankScores([{ score: 100 }]);
    expect(ranked[0].normalizedScore).toBeNull();
    expect(ranked[0].normalizedPosition).toBeNull();
    expect(ranked[0].normalizedIndex).toBeNull();
  });

  it("handles all tied scores", () => {
    const scores = [{ score: 10 }, { score: 10 }, { score: 10 }];
    const ranked = rankScores(scores);
    
    expect(ranked).toHaveLength(3);
    expect(ranked[0].position).toBe(1);
    expect(ranked[1].position).toBe(1);
    expect(ranked[2].position).toBe(1);
    
    expect(ranked[0].normalizedScore).toBeNull();
    expect(ranked[1].normalizedScore).toBeNull();
    expect(ranked[2].normalizedScore).toBeNull();
    
    expect(ranked[0].normalizedPosition).toBeNull();
    expect(ranked[1].normalizedPosition).toBeNull();
    expect(ranked[2].normalizedPosition).toBeNull();
  });
});
