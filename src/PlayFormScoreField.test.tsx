import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { PlayFormScoreField } from "./PlayFormScoreField";
import { Play, PlayDTO, Player } from "./domain/play";
import { GameScoreFieldDefinition } from "./domain/game";
import React from "react";
import { FormFocusContextProvider } from "./utils/focus";

// Mock temporal polyfill
vi.mock("@js-temporal/polyfill", () => ({
  Temporal: {
    Now: {
      timeZoneId: () => "UTC",
      plainDateISO: () => ({
        equals: () => true,
      }),
      instant: () => ({
        epochMilliseconds: 1705312800000,
      }),
    },
    PlainDate: {
      from: () => ({}),
    },
    Instant: {
      from: () => ({
        epochMilliseconds: 1705312800000,
        toString: () => "2024-01-15T10:00:00.000Z",
        since: () => ({
          hours: 1,
          minutes: 30,
          toString: () => "01:30",
        }),
      }),
      fromEpochMilliseconds: () => ({
        since: () => ({
          hours: 1,
          minutes: 30,
          toString: () => "01:30",
        }),
      }),
    },
  },
}));

const createMockPlayer = (id: string, name: string): Player => ({
  id,
  name,
});

const createMockPlay = (overrides: Partial<PlayDTO> = {}): Play => {
  const mockPlayDTO: PlayDTO = {
    id: "play-1",
    gameId: "game-1",
    expansions: [],
    scores: [],
    players: [],
    misc: [],
    created: "2024-01-15T10:00:00.000Z",
    createdBy: "user-1",
    ...overrides,
  };
  return new Play(mockPlayDTO);
};

describe("PlayFormScoreField", () => {
  const mockOnChange = vi.fn();
  const mockOnFocus = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders correctly with player score", () => {
    const player = createMockPlayer("p1", "Alice");
    const field: GameScoreFieldDefinition = {
      id: "s1",
      name: "Points",
      type: "number",
    };
    const play = createMockPlay({
      players: [player],
      scores: [{ playerId: "p1", fieldId: "s1", score: 50 }],
    });

    render(
      <FormFocusContextProvider>
        <PlayFormScoreField
          player={player}
          fieldIndex={0}
          field={field}
          play={play}
          onChange={mockOnChange}
          onFocus={mockOnFocus}
        />
      </FormFocusContextProvider>
    );

    const input = screen.getByLabelText("Alice (50 pts)");
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue(50);
  });

  it("calls onChange with player and field when value changes", () => {
    const player = createMockPlayer("p1", "Alice");
    const field: GameScoreFieldDefinition = {
      id: "s1",
      name: "Points",
      type: "number",
    };
    const play = createMockPlay({
      players: [player],
    });

    render(
      <FormFocusContextProvider>
        <PlayFormScoreField
          player={player}
          fieldIndex={0}
          field={field}
          play={play}
          onChange={mockOnChange}
          onFocus={mockOnFocus}
        />
      </FormFocusContextProvider>
    );

    const input = screen.getByLabelText("Alice (0 pts)");
    fireEvent.change(input, { target: { value: "10" } });
    expect(mockOnChange).toHaveBeenCalledWith(10, field, player);
  });
});
