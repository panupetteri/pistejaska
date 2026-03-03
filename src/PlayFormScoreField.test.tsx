import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { PlayFormScoreField } from "./PlayFormScoreField";
import { GameScoreFieldDefinition } from "./domain/game";
import React from "react";
import { FormFocusContextProvider } from "./utils/focus";
import { createMockPlay, createMockPlayer } from "./test-utils/factories";

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
