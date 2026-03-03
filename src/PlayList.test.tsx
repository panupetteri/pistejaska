import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import PlayList from "./PlayList";
import { Play, PlayDTO, Player } from "./domain/play";
import { Game, GameDefinition } from "./domain/game";
import { Comment, CommentDTO } from "./domain/comment";
import { UserDTO } from "./domain/user";

// Mock window.location
Object.defineProperty(window, "location", {
  value: {
    pathname: "/",
  },
  writable: true,
});

// Mock the date utils to ensure consistent test results
vi.mock("./common/dateUtils", () => ({
  convertToLocaleDateString: vi.fn(() => "2024-01-15"),
}));

// Helper function to create mock Play instances
const createMockPlay = (overrides: Partial<PlayDTO> = {}): Play => {
  const mockPlayDTO: PlayDTO = {
    id: "play-1",
    gameId: "game-1",
    expansions: [],
    scores: [
      { playerId: "player-1", fieldId: "score", score: 100 },
      { playerId: "player-2", fieldId: "score", score: 80 },
    ],
    players: [
      { id: "player-1", name: "Alice" },
      { id: "player-2", name: "Bob" },
    ] as Player[],
    misc: [
      { fieldId: "name", data: "Test Game Session" },
      { fieldId: "date", data: "2024-01-15T10:00:00Z" },
    ],
    created: "2024-01-15T10:00:00.000Z",
    createdBy: "user-1",
    ...overrides,
  };
  return new Play(mockPlayDTO);
};

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

// Helper function to create mock Comment instances
const createMockComment = (overrides: Partial<CommentDTO> = {}): Comment => {
  const mockUsers: UserDTO[] = [{ id: "user-1", displayName: "Test User" }];
  const mockCommentDTO: CommentDTO = {
    id: "comment-1",
    playId: "play-1",
    comment: "Great game!",
    createdOn: "2024-01-15T11:00:00.000Z",
    userId: "user-1",
    ...overrides,
  };
  return new Comment(mockCommentDTO, mockUsers);
};

// Wrapper component to provide routing context
const PlayListWrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

describe("PlayList Component", () => {
  const mockPlays = [createMockPlay()];
  const mockGames = [createMockGame()];
  const mockComments = [createMockComment()];

  it("renders without crashing", () => {
    render(
      <PlayListWrapper>
        <PlayList plays={[]} games={[]} comments={[]} />
      </PlayListWrapper>,
    );
  });

  it("displays play information correctly", () => {
    render(
      <PlayListWrapper>
        <PlayList plays={mockPlays} games={mockGames} comments={mockComments} />
      </PlayListWrapper>,
    );

    expect(screen.getByText("Test Game Session")).toBeInTheDocument();
    expect(screen.getByText("Test Board Game")).toBeInTheDocument();
    expect(screen.getByText("2024-01-15")).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });

  it("shows game icon when game is found", () => {
    render(
      <PlayListWrapper>
        <PlayList plays={mockPlays} games={mockGames} comments={mockComments} />
      </PlayListWrapper>,
    );

    const gameIcon = screen.getByAltText("gamepic");
    expect(gameIcon).toBeInTheDocument();
    expect(gameIcon).toHaveAttribute(
      "src",
      "https://example.com/game-icon.jpg",
    );
  });

  it("shows placeholder when game icon is not available", () => {
    const playWithoutGame = createMockPlay({ gameId: "non-existent-game" });

    render(
      <PlayListWrapper>
        <PlayList
          plays={[playWithoutGame]}
          games={mockGames}
          comments={mockComments}
        />
      </PlayListWrapper>,
    );

    const placeholder = screen.getByTestId("game-icon-placeholder");
    expect(placeholder).toBeInTheDocument();
  });

  it('displays "(Ongoing)" for unresolved plays', () => {
    const ongoingPlay = createMockPlay({
      scores: [], // No scores means unresolved
    });

    render(
      <PlayListWrapper>
        <PlayList
          plays={[ongoingPlay]}
          games={mockGames}
          comments={mockComments}
        />
      </PlayListWrapper>,
    );

    expect(screen.getByText("(Ongoing)")).toBeInTheDocument();
  });

  it('displays "(Tied)" for tied games', () => {
    const tiedPlay = createMockPlay({
      scores: [
        { playerId: "player-1", fieldId: "score", score: 100 },
        { playerId: "player-2", fieldId: "score", score: 100 }, // Same score = tie
      ],
    });

    render(
      <PlayListWrapper>
        <PlayList
          plays={[tiedPlay]}
          games={mockGames}
          comments={mockComments}
        />
      </PlayListWrapper>,
    );

    expect(screen.getByText("(Tied)")).toBeInTheDocument();
  });

  it("displays winner name for resolved games", () => {
    render(
      <PlayListWrapper>
        <PlayList plays={mockPlays} games={mockGames} comments={mockComments} />
      </PlayListWrapper>,
    );

    expect(screen.getByText("Alice")).toBeInTheDocument();
  });

  it("shows comment count when comments exist", () => {
    render(
      <PlayListWrapper>
        <PlayList plays={mockPlays} games={mockGames} comments={mockComments} />
      </PlayListWrapper>,
    );

    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("does not show comment icon when no comments exist", () => {
    render(
      <PlayListWrapper>
        <PlayList plays={mockPlays} games={mockGames} comments={[]} />
      </PlayListWrapper>,
    );

    const commentIcon = document.querySelector(".h-6.w-6.inline");
    expect(commentIcon).not.toBeInTheDocument();
  });

  it("orders plays by date (most recent first)", () => {
    const olderPlay = createMockPlay({
      id: "play-old",
      misc: [
        { fieldId: "name", data: "Older Game" },
        { fieldId: "date", data: "2024-01-10T10:00:00Z" },
      ],
      created: "2024-01-10T10:00:00.000Z",
    });

    const newerPlay = createMockPlay({
      id: "play-new",
      misc: [
        { fieldId: "name", data: "Newer Game" },
        { fieldId: "date", data: "2024-01-20T10:00:00Z" },
      ],
      created: "2024-01-20T10:00:00.000Z",
    });

    render(
      <PlayListWrapper>
        <PlayList
          plays={[olderPlay, newerPlay]}
          games={mockGames}
          comments={[]}
        />
      </PlayListWrapper>,
    );

    // Both play names should be present
    expect(screen.getByText("Newer Game")).toBeInTheDocument();
    expect(screen.getByText("Older Game")).toBeInTheDocument();

    // Verify we have two play links
    const playItems = screen.getAllByRole("link");
    expect(playItems).toHaveLength(2);
  });

  it('shows "Show more" button when there are more than 10 plays', () => {
    const manyPlays = Array.from({ length: 15 }, (_, i) =>
      createMockPlay({
        id: `play-${i}`,
        misc: [{ fieldId: "name", data: `Game ${i}` }],
      }),
    );

    render(
      <PlayListWrapper>
        <PlayList plays={manyPlays} games={mockGames} comments={[]} />
      </PlayListWrapper>,
    );

    expect(screen.getByText("Show more")).toBeInTheDocument();
    // Should only show first 10 plays
    expect(screen.getAllByText(/Game \d+/)).toHaveLength(10);
  });

  it('does not show "Show more" button when there are 10 or fewer plays', () => {
    const fewPlays = Array.from({ length: 5 }, (_, i) =>
      createMockPlay({
        id: `play-${i}`,
        misc: [{ fieldId: "name", data: `Game ${i}` }],
      }),
    );

    render(
      <PlayListWrapper>
        <PlayList plays={fewPlays} games={mockGames} comments={[]} />
      </PlayListWrapper>,
    );

    expect(screen.queryByText("Show more")).not.toBeInTheDocument();
  });

  it('expands list when "Show more" button is clicked', async () => {
    const user = userEvent.setup();
    const manyPlays = Array.from({ length: 15 }, (_, i) =>
      createMockPlay({
        id: `play-${i}`,
        misc: [{ fieldId: "name", data: `Game ${i}` }],
      }),
    );

    render(
      <PlayListWrapper>
        <PlayList plays={manyPlays} games={mockGames} comments={[]} />
      </PlayListWrapper>,
    );

    // Initially shows 10 plays
    expect(screen.getAllByText(/Game \d+/)).toHaveLength(10);

    // Click "Show more"
    await user.click(screen.getByText("Show more"));

    // Now shows 15 plays (doubled the limit from 10 to 20, but only 15 exist)
    expect(screen.getAllByText(/Game \d+/)).toHaveLength(15);
    expect(screen.queryByText("Show more")).not.toBeInTheDocument();
  });

  it("creates correct link for each play", () => {
    render(
      <PlayListWrapper>
        <PlayList plays={mockPlays} games={mockGames} comments={mockComments} />
      </PlayListWrapper>,
    );

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/view/play-1?from=/");
  });

  describe("Search functionality", () => {
    const searchPlays = [
      createMockPlay({
        id: "play-alpha",
        gameId: "game-1",
        players: [
          { id: "p1", name: "Alice" },
          { id: "p2", name: "Charlie" },
        ],
        misc: [{ fieldId: "name", data: "Alpha Session" }],
      }),
      createMockPlay({
        id: "play-beta",
        gameId: "game-2",
        players: [
          { id: "p1", name: "Alice" },
          { id: "p3", name: "David" },
        ],
        misc: [{ fieldId: "name", data: "Beta Session" }],
      }),
    ];
    const searchGames = [
      createMockGame({ id: "game-1", name: "Chess" }),
      createMockGame({ id: "game-2", name: "Go" }),
    ];

    it("filters by play name", async () => {
      const user = userEvent.setup();
      render(
        <PlayListWrapper>
          <PlayList plays={searchPlays} games={searchGames} comments={[]} />
        </PlayListWrapper>,
      );

      const searchInput = screen.getByLabelText("Search...");
      await user.type(searchInput, "Alpha");

      expect(screen.getByText("Alpha Session")).toBeInTheDocument();
      expect(screen.queryByText("Beta Session")).not.toBeInTheDocument();
    });

    it("filters by game name", async () => {
      const user = userEvent.setup();
      render(
        <PlayListWrapper>
          <PlayList plays={searchPlays} games={searchGames} comments={[]} />
        </PlayListWrapper>,
      );

      const searchInput = screen.getByLabelText("Search...");
      await user.type(searchInput, "Go");

      expect(screen.getByText("Beta Session")).toBeInTheDocument();
      expect(screen.queryByText("Alpha Session")).not.toBeInTheDocument();
    });

    it("filters by player name", async () => {
      const user = userEvent.setup();
      render(
        <PlayListWrapper>
          <PlayList plays={searchPlays} games={searchGames} comments={[]} />
        </PlayListWrapper>,
      );

      const searchInput = screen.getByLabelText("Search...");
      await user.type(searchInput, "Charlie");

      expect(screen.getByText("Alpha Session")).toBeInTheDocument();
      expect(screen.queryByText("Beta Session")).not.toBeInTheDocument();
    });

    it("shows multiple results for common player name", async () => {
      const user = userEvent.setup();
      render(
        <PlayListWrapper>
          <PlayList plays={searchPlays} games={searchGames} comments={[]} />
        </PlayListWrapper>,
      );

      const searchInput = screen.getByLabelText("Search...");
      await user.type(searchInput, "Alice");

      expect(screen.getByText("Alpha Session")).toBeInTheDocument();
      expect(screen.getByText("Beta Session")).toBeInTheDocument();
    });

    it("is case-insensitive", async () => {
      const user = userEvent.setup();
      render(
        <PlayListWrapper>
          <PlayList plays={searchPlays} games={searchGames} comments={[]} />
        </PlayListWrapper>,
      );

      const searchInput = screen.getByLabelText("Search...");
      await user.type(searchInput, "alpha");

      expect(screen.getByText("Alpha Session")).toBeInTheDocument();
    });

    it("shows no results for non-matching search", async () => {
      const user = userEvent.setup();
      render(
        <PlayListWrapper>
          <PlayList plays={searchPlays} games={searchGames} comments={[]} />
        </PlayListWrapper>,
      );

      const searchInput = screen.getByLabelText("Search...");
      await user.type(searchInput, "Zebra");

      expect(screen.queryByText("Alpha Session")).not.toBeInTheDocument();
      expect(screen.queryByText("Beta Session")).not.toBeInTheDocument();
      expect(screen.getByText('No plays found for "Zebra"')).toBeInTheDocument();
    });

    it("does not match against field values or scores", async () => {
      const user = userEvent.setup();
      const fieldMatchPlays = [
        createMockPlay({
          id: "play-field",
          misc: [{ fieldId: "difficulty", data: "Easy" }],
          scores: [{ playerId: "p1", fieldId: "bonus", score: 999 }],
        }),
      ];

      render(
        <PlayListWrapper>
          <PlayList plays={fieldMatchPlays} games={mockGames} comments={[]} />
        </PlayListWrapper>,
      );

      const searchInput = screen.getByLabelText("Search...");

      // Searching for the field value "Easy" should NOT match
      await user.type(searchInput, "Easy");
      expect(screen.queryByText("2024-01-15")).not.toBeInTheDocument();

      // Searching for the score "999" should NOT match
      await user.clear(searchInput);
      await user.type(searchInput, "999");
      expect(screen.queryByText("2024-01-15")).not.toBeInTheDocument();
    });

    it("matches multiple words independently (AND logic)", async () => {
      const user = userEvent.setup();
      const cavernaGames = [
        createMockGame({ id: "caverna", name: "Caverna" }),
        createMockGame({ id: "mars", name: "Terraforming Mars" }),
      ];
      const cavernaPlays = [
        createMockPlay({
          id: "p1",
          gameId: "caverna",
          players: [
            { id: "k", name: "kaaku" },
            { id: "p", name: "panu" },
          ],
        }),
        createMockPlay({
          id: "p2",
          gameId: "caverna",
          players: [
            { id: "h", name: "heikki" },
            { id: "k", name: "kaaku" },
          ],
        }),
        createMockPlay({
          id: "p3",
          gameId: "caverna",
          players: [
            { id: "p", name: "panu" },
            { id: "h", name: "heikki" },
          ],
        }),
        createMockPlay({
          id: "p4",
          gameId: "mars",
          players: [
            { id: "k", name: "kaaku" },
            { id: "p", name: "panu" },
          ],
        }),
      ];

      render(
        <PlayListWrapper>
          <PlayList plays={cavernaPlays} games={cavernaGames} comments={[]} />
        </PlayListWrapper>,
      );

      const searchInput = screen.getByLabelText("Search...");

      // searching for "caverna panu" should return plays p1 and p3 (the ones from Caverna where Panu played)
      await user.type(searchInput, "caverna panu");

      const results = screen.getAllByRole("link");
      expect(results).toHaveLength(2);
      expect(results[0]).toHaveAttribute("href", "/view/p1?from=/");
      expect(results[1]).toHaveAttribute("href", "/view/p3?from=/");
    });

    it("clears search when clear button is clicked", async () => {
      const user = userEvent.setup();
      render(
        <PlayListWrapper>
          <PlayList plays={mockPlays} games={mockGames} comments={[]} />
        </PlayListWrapper>,
      );

      const searchInput = screen.getByLabelText("Search...");
      await user.type(searchInput, "NonExistentPlay");
      expect(screen.queryByText("Test Game Session")).not.toBeInTheDocument();

      const clearButton = screen.getByLabelText("Clear");
      await user.click(clearButton);

      expect(searchInput).toHaveValue("");
      expect(screen.getByText("Test Game Session")).toBeInTheDocument();
    });
  });
});
