import { Temporal } from "@js-temporal/polyfill";

export type NotificationDTO = {
  id: string;
  toUserId: string;      // The user being notified
  fromUserId: string;    // The user who commented
  playId: string;        // To create the link to the play
  playName: string;      // The name of the play (e.g. "Game Night at Panu's")
  gameId: string;
  isRead: boolean;       // Status flag
  created: string;       // ISO Timestamp
};

export class Notification {
  constructor(dto: NotificationDTO) {
    this.id = dto.id;
    this.toUserId = dto.toUserId;
    this.fromUserId = dto.fromUserId;
    this.playId = dto.playId;
    this.playName = dto.playName;
    this.gameId = dto.gameId;
    this.isRead = dto.isRead;
    this.created = Temporal.Instant.from(dto.created);
  }

  public id: string;
  public toUserId: string;
  public fromUserId: string;
  public playId: string;
  public playName: string;
  public gameId: string;
  public isRead: boolean;
  public created: Temporal.Instant;
}
