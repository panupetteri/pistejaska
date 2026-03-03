import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { PlayFormField } from "./PlayFormField";
import { GameFieldDefinition } from "./domain/game";
import React from "react";
import { FormFocusContextProvider } from "./utils/focus";
import { createMockPlay } from "./test-utils/factories";

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
    
    // Set system time to match the default mock play creation date (2024-01-15)
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-15T12:00:00Z"));
    
    const play = createMockPlay({ created: "2024-01-15T10:00:00Z" });
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
    
    vi.useRealTimers();
  });
});
