import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { PlayFormField } from "./PlayFormField";
import { Play, PlayDTO } from "./domain/play";
import { GameFieldDefinition } from "./domain/game";
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

describe("PlayFormField", () => {
  const mockOnChange = vi.fn();
  const mockOnFocus = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("handles basic input changes (text/number)", () => {
    const field: GameFieldDefinition<number> = {
      id: "f1",
      name: "Score",
      type: "number",
    };
    const play = createMockPlay();

    render(
      <FormFocusContextProvider>
        <PlayFormField
          value={10}
          fieldIndex={0}
          field={field}
          label="Score Label"
          play={play}
          onChange={mockOnChange}
          onFocus={mockOnFocus}
        />
      </FormFocusContextProvider>
    );

    const input = screen.getByLabelText("Score Label");
    expect(input).toHaveValue(10);
    fireEvent.change(input, { target: { value: "25" } });
    expect(mockOnChange).toHaveBeenCalledWith(25, field);
  });

  it("handles select field changes with stringified values", () => {
    const field: GameFieldDefinition<string> = {
      id: "f1",
      name: "Level",
      type: "text",
      options: [
        { value: "easy", label: "Easy" },
        { value: "hard", label: "Hard" },
      ],
    };
    const play = createMockPlay();

    render(
      <FormFocusContextProvider>
        <PlayFormField
          value="easy"
          fieldIndex={0}
          field={field}
          label="Difficulty"
          play={play}
          onChange={mockOnChange}
          onFocus={mockOnFocus}
        />
      </FormFocusContextProvider>
    );

    const select = screen.getByLabelText("Difficulty");
    fireEvent.change(select, { target: { value: JSON.stringify("hard") } });
    expect(mockOnChange).toHaveBeenCalledWith("hard", field);
  });

  it("renders 'Set from start' button for duration fields and calculates time", () => {
    const field: GameFieldDefinition<number> = {
      id: "f1",
      name: "Duration",
      type: "duration",
    };
    const play = createMockPlay();
    // Spy on the domain method that calculates duration
    vi.spyOn(play, "getTimeInHoursSinceCreation").mockReturnValue(1.5);

    render(
      <FormFocusContextProvider>
        <PlayFormField
          value={null}
          fieldIndex={0}
          field={field}
          label="Play Duration"
          play={play}
          onChange={mockOnChange}
          onFocus={mockOnFocus}
        />
      </FormFocusContextProvider>
    );

    const timerButton = screen.getByText(/Set from start/i);
    expect(timerButton).toBeInTheDocument();

    fireEvent.click(timerButton);
    expect(mockOnChange).toHaveBeenCalledWith(1.5, field);
  });
});
