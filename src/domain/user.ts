import { User } from "firebase/auth";

export type UserDTO = {
  id: string;
  photoURL?: string | null;
  displayName: string;
  playerId?: string;
  playerName?: string;
  lastSignInTime?: string;
};

export const toUserDTO = (user: User) => ({
  id: user.uid,
  photoURL: user.photoURL,
  displayName: user.displayName,
  lastSignInTime: user.metadata.lastSignInTime,
});
