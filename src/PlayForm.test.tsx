import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { PlayForm } from "./PlayForm";
import { Play, PlayDTO, Player } from "./domain/play";
import { Game, GameDefinition } from "./domain/game";
import React from "react";

// Mock SwipeableViews as it can be problematic in JSDOM
vi.mock("./lib/react-swipeable-views/src", () => ({
  default: ({ children, index }: { children: React.ReactNode; index: number }) => (
    <div data-testid="swipeable-views">
      {React.Children.toArray(children)[index]}
    </div>
  ),
}));

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
  const players = [
    createMockPlayer("p1", "Alice"),
    createMockPlayer("p2", "Bob"),
  ];
  const mockPlayDTO: PlayDTO = {
    id: "play-1",
    gameId: "game-1",
    expansions: [],
    scores: [],
    players: players,
    misc: [],
    created: "2024-01-15T10:00:00.000Z",
    createdBy: "user-1",
    ...overrides,
  };
  return new Play(mockPlayDTO);
};

const createMockGame = (overrides: Partial<GameDefinition> = {}): Game => {
  const gameData: GameDefinition = {
    id: "game-1",
    name: "Test Game",
    icon: "",
    scoreFields: [],
    miscFields: [],
    simultaneousTurns: false,
    ...overrides,
  };
  return new Game(gameData);
};

describe("PlayForm Business Logic", () => {
  const mockOnImageUpload = vi.fn();
  const mockOnEdit = vi.fn();
  const mockOnDone = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("converts score to negative when maxValue is 0 (Penalty fields)", () => {
    const game = createMockGame({
      scoreFields: [{ id: "s1", name: "Penalty", type: "number", maxValue: 0 }],
    });
    const play = createMockPlay();

    render(
      <PlayForm
        game={game}
        play={play}
        onImageUpload={mockOnImageUpload}
        onEdit={mockOnEdit}
        onDone={mockOnDone}
      />
    );

    const inputs = screen.getAllByLabelText("Alice (0 pts)");
    fireEvent.change(inputs[0], { target: { value: "15" } });

    expect(mockOnEdit).toHaveBeenCalledWith(
      expect.objectContaining({
        scores: expect.arrayContaining([
          expect.objectContaining({ fieldId: "s1", score: -15 }),
        ]),
      }),
    );
  });

  it("cleans up scores and misc data when an expansion is deselected", () => {
    const expansion = {
      id: "exp-1",
      name: "Exp 1",
      scoreFields: [{ id: "s-exp", name: "Exp Score", type: "number" as const }],
      miscFields: [{ id: "m-exp", name: "Exp Misc", type: "text" as const }],
    };
    const game = createMockGame({
      expansions: [expansion],
    });
    const play = createMockPlay({
      expansions: ["exp-1"],
      scores: [{ playerId: "p1", fieldId: "s-exp", score: 100 }],
      misc: [{ fieldId: "m-exp", data: "some data" }],
    });

    render(
      <PlayForm
        game={game}
        play={play}
        onImageUpload={mockOnImageUpload}
        onEdit={mockOnEdit}
        onDone={mockOnDone}
      />
    );

    const checkbox = screen.getByLabelText("Exp 1");
    fireEvent.click(checkbox);

    expect(mockOnEdit).toHaveBeenCalledWith(
      expect.objectContaining({
        expansions: [],
        scores: expect.not.arrayContaining([
          expect.objectContaining({ fieldId: "s-exp" }),
        ]),
        misc: expect.not.arrayContaining([
          expect.objectContaining({ fieldId: "m-exp" }),
        ]),
      }),
    );
  });
});

describe("PlayForm Navigation", () => {
  const mockOnImageUpload = vi.fn();
  const mockOnEdit = vi.fn();
  const mockOnDone = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("navigates between views and triggers onDone", () => {
    const game = createMockGame({
      scoreFields: [
        { id: "s1", name: "View 1", type: "number" },
        { id: "s2", name: "View 2", type: "number" },
      ],
    });
    const play = createMockPlay();

    render(
      <PlayForm
        game={game}
        play={play}
        onImageUpload={mockOnImageUpload}
        onEdit={mockOnEdit}
        onDone={mockOnDone}
      />
    );

    // Initial View
    expect(screen.getByText("View 1")).toBeInTheDocument();

    // Next
    fireEvent.click(screen.getAllByRole("button", { name: "Next >" })[0]);
    expect(screen.getByText("View 2")).toBeInTheDocument();

    // Previous
    fireEvent.click(screen.getAllByRole("button", { name: "< Previous" })[0]);
    expect(screen.getByText("View 1")).toBeInTheDocument();

    // Done
    fireEvent.click(screen.getAllByRole("button", { name: "Done" })[0]);
    expect(mockOnDone).toHaveBeenCalled();
  });
});
