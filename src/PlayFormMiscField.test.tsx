import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { PlayFormMiscField } from "./PlayFormMiscField";
import { Play, PlayDTO, Player } from "./domain/play";
import { GameMiscFieldDefinition } from "./domain/game";
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

describe("PlayFormMiscField", () => {
  const mockOnChange = vi.fn();
  const mockOnFocus = vi.fn();
  const mockOnImageUpload = vi.fn();
  const mockOnImageRemove = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders correctly with global misc value", () => {
    const field: GameMiscFieldDefinition = {
      id: "m1",
      name: "Notes",
      type: "text",
    };
    const play = createMockPlay({
      misc: [{ fieldId: "m1", data: "Global Note" }],
    });

    render(
      <FormFocusContextProvider>
        <PlayFormMiscField
          field={field}
          fieldIndex={0}
          play={play}
          onChange={mockOnChange}
          onFocus={mockOnFocus}
          onImageUpload={mockOnImageUpload}
          onImageRemove={mockOnImageRemove}
        />
      </FormFocusContextProvider>
    );

    const input = screen.getByLabelText("Notes");
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue("Global Note");
  });

  it("renders correctly with player-specific misc value", () => {
    const player = createMockPlayer("p1", "Alice");
    const field: GameMiscFieldDefinition = {
      id: "m1",
      name: "Player Note",
      type: "text",
      valuePerPlayer: true,
    };
    const play = createMockPlay({
      players: [player],
      misc: [{ fieldId: "m1", playerId: "p1", data: "Alice's Note" }],
    });

    render(
      <FormFocusContextProvider>
        <PlayFormMiscField
          field={field}
          fieldIndex={0}
          play={play}
          player={player}
          onChange={mockOnChange}
          onFocus={mockOnFocus}
          onImageUpload={mockOnImageUpload}
          onImageRemove={mockOnImageRemove}
        />
      </FormFocusContextProvider>
    );

    const input = screen.getByLabelText("Alice");
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue("Alice's Note");
  });

  it("calls onChange with player when value changes", () => {
    const player = createMockPlayer("p1", "Alice");
    const field: GameMiscFieldDefinition = {
      id: "m1",
      name: "Notes",
      type: "text",
    };
    const play = createMockPlay();

    render(
      <FormFocusContextProvider>
        <PlayFormMiscField
          field={field}
          fieldIndex={0}
          play={play}
          player={player}
          onChange={mockOnChange}
          onFocus={mockOnFocus}
          onImageUpload={mockOnImageUpload}
          onImageRemove={mockOnImageRemove}
        />
      </FormFocusContextProvider>
    );

    const input = screen.getByLabelText("Alice");
    fireEvent.change(input, { target: { value: "New Note" } });
    expect(mockOnChange).toHaveBeenCalledWith("New Note", field, player);
  });
});
