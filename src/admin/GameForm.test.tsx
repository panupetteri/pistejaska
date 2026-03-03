import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import GameForm from "./GameForm";
import { GameDefinition } from "../domain/game";
import saveGame from "../utils/saveGame";
import { createMockGameDefinition } from "../test-utils/factories";

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock saveGame
vi.mock("../utils/saveGame", () => ({
  default: vi.fn().mockResolvedValue(undefined),
}));

describe("GameForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderGameForm = (game?: GameDefinition) => {
    return render(
      <MemoryRouter>
        <GameForm game={game} />
      </MemoryRouter>
    );
  };

  it("renders with initial empty state for a new game", () => {
    renderGameForm();

    expect(screen.getAllByLabelText(/Name/i)[0]).toHaveValue("");
    expect(screen.getByLabelText(/Icon URL/i)).toHaveValue("");
    // By default one empty score field is added
    expect(screen.getAllByLabelText(/Name/i)).toHaveLength(2); // One for basic info, one for score field
  });

  it("renders with existing game data", () => {
    const existingGame = createMockGameDefinition({
      id: "test-game",
      name: "Test Game",
      icon: "https://example.com/icon.png",
      simultaneousTurns: true,
      scoreFields: [{ id: "points", name: "Points", type: "number" }],
      miscFields: [{ id: "round", name: "Round", type: "number" }],
    });

    renderGameForm(existingGame);

    const nameInputs = screen.getAllByLabelText("Name");
    expect(nameInputs[0]).toHaveValue("Test Game");
    expect(nameInputs[1]).toHaveValue("Points");
    expect(nameInputs[2]).toHaveValue("Round");

    expect(screen.getByLabelText("Icon URL")).toHaveValue("https://example.com/icon.png");
    expect(screen.getByLabelText("Simultaneous turns")).toBeChecked();
  });

  it("adds and removes score fields", async () => {
    const user = userEvent.setup();
    renderGameForm();

    // Initially 1 score field (+1 name field = 2 name inputs)
    expect(screen.getAllByLabelText("Name")).toHaveLength(2);

    await user.click(screen.getByText("Add score field"));
    expect(screen.getAllByLabelText("Name")).toHaveLength(3);

    await user.click(screen.getAllByText("Remove score field")[0]);
    expect(screen.getAllByLabelText("Name")).toHaveLength(2);
  });

  it("adds and removes miscellaneous fields", async () => {
    const user = userEvent.setup();
    renderGameForm();

    // Initially 0 misc fields
    expect(screen.queryByText("Remove miscellaneous field")).not.toBeInTheDocument();

    await user.click(screen.getByText("Add miscellaneous field"));
    expect(screen.getByText("Remove miscellaneous field")).toBeInTheDocument();

    await user.click(screen.getByText("Remove miscellaneous field"));
    expect(screen.queryByText("Remove miscellaneous field")).not.toBeInTheDocument();
  });

  it("adds and removes expansions", async () => {
    const user = userEvent.setup();
    renderGameForm();

    expect(screen.queryByText("Remove extension")).not.toBeInTheDocument();

    await user.click(screen.getByText("Add extension"));
    expect(screen.getByText("Remove extension")).toBeInTheDocument();

    await user.click(screen.getByText("Remove extension"));
    expect(screen.queryByText("Remove extension")).not.toBeInTheDocument();
  });

  it("saves game and redirects", async () => {
    const user = userEvent.setup();
    renderGameForm();

    const nameInputs = screen.getAllByLabelText("Name");
    await user.type(nameInputs[0], "New Game");
    await user.type(nameInputs[1], "Total Points");

    await user.click(screen.getByText("Save game"));

    await waitFor(() => {
      expect(saveGame).toHaveBeenCalledWith(expect.objectContaining({
        id: "new-game",
        name: "New Game",
        scoreFields: [
            expect.objectContaining({ name: "Total Points", id: "total-points" })
        ],
      }));
    });

    await waitFor(() => {
      expect(screen.getByText("Game saved!")).toBeInTheDocument();
    }, { timeout: 3000 });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/admin");
    }, { timeout: 3000 });
  });

  it("shows an error message if saving fails", async () => {
    const user = userEvent.setup();
    const errorMessage = "Failed to save game";
    vi.mocked(saveGame).mockRejectedValueOnce(new Error(errorMessage));
    
    // Mock window.alert
    const alertMock = vi.spyOn(window, "alert").mockImplementation(() => {});
    // Mock console.error
    const consoleMock = vi.spyOn(console, "error").mockImplementation(() => {});

    renderGameForm();

    const nameInputs = screen.getAllByLabelText("Name");
    await user.type(nameInputs[0], "New Game");
    await user.type(nameInputs[1], "Points"); // Fill required score field name
    await user.click(screen.getByText("Save game"));

    await waitFor(() => {
      expect(saveGame).toHaveBeenCalled();
    });

    expect(alertMock).toHaveBeenCalledWith(expect.any(Error));
    expect(alertMock.mock.calls[0][0].message).toContain(errorMessage);
    expect(screen.queryByText("Game saved!")).not.toBeInTheDocument();
    
    alertMock.mockRestore();
    consoleMock.mockRestore();
  });

  it("saves expansions with score and misc fields", async () => {
    const user = userEvent.setup();
    renderGameForm();

    const nameInputs = screen.getAllByLabelText("Name");
    await user.type(nameInputs[0], "Main Game");
    await user.type(nameInputs[1], "Main Points");

    await user.click(screen.getByText("Add extension"));
    
    const expansionNameInput = screen.getByLabelText("Extension Name");
    await user.type(expansionNameInput, "Great Expansion");

    // Use within to target the expansion's buttons
    const expansionContainer = screen.getByDisplayValue("Great Expansion").closest("div.p-4")!;
    const { getByText: withinExpansion } = within(expansionContainer as HTMLElement);

    // Add score field to expansion
    await user.click(withinExpansion("Add score field"));
    const updatedNameInputs = screen.getAllByLabelText("Name");
    const expansionScoreFieldNameInput = updatedNameInputs.find(input => (input as HTMLInputElement).value === "") as HTMLInputElement;
    await user.type(expansionScoreFieldNameInput, "Exp Points");

    // Add misc field to expansion
    await user.click(withinExpansion("Add miscellaneous field"));
    const finalNameInputs = screen.getAllByLabelText("Name");
    const expansionMiscFieldNameInput = finalNameInputs.find(input => (input as HTMLInputElement).value === "") as HTMLInputElement;
    await user.type(expansionMiscFieldNameInput, "Exp Round");

    await user.click(screen.getByText("Save game"));

    await waitFor(() => {
      expect(saveGame).toHaveBeenCalledWith(expect.objectContaining({
        expansions: [
          expect.objectContaining({
            name: "Great Expansion",
            id: "great-expansion",
            scoreFields: [expect.objectContaining({ name: "Exp Points", id: "exp-points" })],
            miscFields: [expect.objectContaining({ name: "Exp Round", id: "exp-round" })],
          })
        ]
      }));
    });
  });

  it("generates IDs from names if missing", async () => {
    const user = userEvent.setup();
    renderGameForm();

    const nameInputs = screen.getAllByLabelText("Name");
    await user.type(nameInputs[0], "My Awesome Game!");
    await user.type(nameInputs[1], "Player Score");

    await user.click(screen.getByText("Save game"));

    await waitFor(() => {
      expect(saveGame).toHaveBeenCalledWith(expect.objectContaining({
        id: "my-awesome-game",
        scoreFields: [
            expect.objectContaining({ id: "player-score" })
        ],
      }));
    });
  });
});
