import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ReportGameList } from "./ReportGameList";
import { Game, GameDefinition } from "./domain/game";
import { useGames } from "./common/hooks/useGames";
import { usePlays } from "./common/hooks/usePlays";

// Mock the hooks
vi.mock("./common/hooks/useGames");
vi.mock("./common/hooks/usePlays");

// Helper function to create mock Game instances
const createMockGame = (overrides: Partial<GameDefinition> = {}): Game => {
  const gameData: GameDefinition = {
    id: "game-1",
    name: "Test Board Game",
    icon: "https://example.com/game-icon.jpg",
    scoreFields: [],
    simultaneousTurns: false,
    ...overrides,
  };
  return new Game(gameData);
};

// Wrapper component to provide routing context
const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

describe("ReportGameList Component", () => {
  const mockGames = [
    createMockGame({ id: "game-1", name: "Chess" }),
    createMockGame({ id: "game-2", name: "Go" }),
    createMockGame({ id: "game-3", name: "Backgammon" }),
  ];

  it("renders and filters games by name", async () => {
    vi.mocked(useGames).mockReturnValue([mockGames, false, undefined]);
    vi.mocked(usePlays).mockReturnValue([[], false, undefined]);

    const user = userEvent.setup();
    render(
      <Wrapper>
        <ReportGameList />
      </Wrapper>,
    );

    // Initially all games are shown
    expect(screen.getByText("Chess")).toBeInTheDocument();
    expect(screen.getByText("Go")).toBeInTheDocument();
    expect(screen.getByText("Backgammon")).toBeInTheDocument();

    // Search for "Go"
    const searchInput = screen.getByLabelText("Search...");
    await user.type(searchInput, "Go");

    expect(screen.getByText("Go")).toBeInTheDocument();
    expect(screen.queryByText("Chess")).not.toBeInTheDocument();
    expect(screen.queryByText("Backgammon")).not.toBeInTheDocument();

    // Clear search
    const clearButton = screen.getByLabelText("Clear");
    await user.click(clearButton);

    expect(screen.getByText("Chess")).toBeInTheDocument();
    expect(screen.getByText("Go")).toBeInTheDocument();
    expect(screen.getByText("Backgammon")).toBeInTheDocument();
  });

  it('shows "No games found" message', async () => {
    vi.mocked(useGames).mockReturnValue([mockGames, false, undefined]);
    vi.mocked(usePlays).mockReturnValue([[], false, undefined]);

    const user = userEvent.setup();
    render(
      <Wrapper>
        <ReportGameList />
      </Wrapper>,
    );

    const searchInput = screen.getByLabelText("Search...");
    await user.type(searchInput, "Zebra");

    expect(screen.getByText('No games found for "Zebra"')).toBeInTheDocument();
    expect(screen.queryByText("Chess")).not.toBeInTheDocument();
  });

  it("supports multi-word search (AND logic)", async () => {
    vi.mocked(useGames).mockReturnValue([mockGames, false, undefined]);
    vi.mocked(usePlays).mockReturnValue([[], false, undefined]);

    const user = userEvent.setup();
    render(
      <Wrapper>
        <ReportGameList />
      </Wrapper>,
    );

    const searchInput = screen.getByLabelText("Search...");
    await user.type(searchInput, "Back gammon");

    expect(screen.getByText("Backgammon")).toBeInTheDocument();
    expect(screen.queryByText("Chess")).not.toBeInTheDocument();
  });
});
