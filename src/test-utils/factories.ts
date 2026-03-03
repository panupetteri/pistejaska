import { Game, GameDefinition } from "../domain/game";
import { Play, PlayDTO, Player } from "../domain/play";
import { Comment, CommentDTO } from "../domain/comment";
import { UserDTO } from "../domain/user";

export function createMockPlayer(idOrOverrides?: string | Partial<Player>, name?: string): Player {
  if (typeof idOrOverrides === "string") {
    return {
      id: idOrOverrides,
      name: name || "Alice",
    };
  }
  return {
    id: "player-1",
    name: "Alice",
    ...idOrOverrides,
  };
}

export const createMockGameDefinition = (
  overrides: Partial<GameDefinition> = {},
): GameDefinition => ({
  id: "game-1",
  name: "Test Board Game",
  icon: "https://example.com/game-icon.jpg",
  scoreFields: [],
  simultaneousTurns: false,
  ...overrides,
});

export const createMockGame = (
  overrides: Partial<GameDefinition> = {},
): Game => {
  return new Game(createMockGameDefinition(overrides));
};

export const createMockPlayDTO = (
  overrides: Partial<PlayDTO> = {},
): PlayDTO => ({
  id: "play-1",
  gameId: "game-1",
  expansions: [],
  scores: [],
  players: [
    createMockPlayer({ id: "player-1", name: "Alice" }),
    createMockPlayer({ id: "player-2", name: "Bob" }),
  ],
  misc: [
    { fieldId: "name", data: "Test Game Session" },
    { fieldId: "date", data: "2024-01-15T10:00:00Z" },
  ],
  created: "2024-01-15T10:00:00.000Z",
  createdBy: "user-1",
  ...overrides,
});

export const createMockPlay = (overrides: Partial<PlayDTO> = {}): Play => {
  return new Play(createMockPlayDTO(overrides));
};

export const createMockCommentDTO = (
  overrides: Partial<CommentDTO> = {},
): CommentDTO => ({
  id: "comment-1",
  playId: "play-1",
  comment: "Great game!",
  createdOn: "2024-01-15T11:00:00.000Z",
  userId: "user-1",
  ...overrides,
});

export const createMockUser = (overrides: Partial<UserDTO> = {}): UserDTO => ({
  id: "user-1",
  displayName: "Test User",
  ...overrides,
});

export const createMockComment = (
  commentOverrides: Partial<CommentDTO> = {},
  users: UserDTO[] = [createMockUser()],
): Comment => {
  return new Comment(createMockCommentDTO(commentOverrides), users);
};

import { Notification, NotificationDTO } from "../domain/notification";

export const createMockNotificationDTO = (
  overrides: Partial<NotificationDTO> = {},
): NotificationDTO => ({
  id: "notif-1",
  toUserId: "user-target",
  fromUserId: "user-sender",
  playId: "play-1",
  playName: "Test Play",
  gameId: "game-1",
  isRead: false,
  created: "2024-01-15T12:00:00.000Z",
  ...overrides,
});

export const createMockNotification = (
  overrides: Partial<NotificationDTO> = {},
): Notification => {
  return new Notification(createMockNotificationDTO(overrides));
};
