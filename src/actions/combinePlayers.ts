import {
  collection,
  getDocs,
  writeBatch,
  Firestore,
} from "firebase/firestore";
import { PlayDTO } from "../domain/play";

/**
 * Combines two players into one.
 * All plays referring to deletePlayerId will be updated to keepPlayerId.
 * The name for keepPlayerId will be updated to newPlayerName in all relevant records.
 */
export const combinePlayers = async (
  db: Firestore,
  keepPlayerId: string,
  deletePlayerId: string,
  newPlayerName: string,
  dryRun: boolean = false
) => {
  const batch = writeBatch(db);
  let operationCount = 0;

  // 1. Update Plays
  const playsSnap = await getDocs(collection(db, "plays-v1"));
  for (const playDoc of playsSnap.docs) {
    const play = playDoc.data() as PlayDTO;
    let modified = false;

    // Update players array
    const newPlayers = play.players.map(p => {
      if (p.id === deletePlayerId || p.id === keepPlayerId) {
        modified = true;
        return { ...p, id: keepPlayerId, name: newPlayerName };
      }
      return p;
    });

    // Handle potential duplicates if both players were in the same play
    const uniquePlayers = [];
    const seenIds = new Set();
    for (const p of newPlayers) {
      if (!seenIds.has(p.id)) {
        seenIds.add(p.id);
        uniquePlayers.push(p);
      }
    }

    if (modified) {
      // Update scores
      const newScores = play.scores.map(s => {
        if (s.playerId === deletePlayerId) {
          return { ...s, playerId: keepPlayerId };
        }
        return s;
      });

      // Update misc
      const newMisc = play.misc.map(m => {
        if (m.playerId === deletePlayerId) {
          return { ...m, playerId: keepPlayerId };
        }
        return m;
      });

      const updateData = {
        players: uniquePlayers,
        scores: newScores,
        misc: newMisc
      };

      if (dryRun) {
        console.log(`DRY RUN: Combine in play ${playDoc.id} (${play.gameId})`);
        console.log("BEFORE:", play);
        console.log("AFTER:", { ...play, ...updateData });
      } else {
        batch.update(playDoc.ref, updateData);
        operationCount++;
      }
    }
  }

  if (!dryRun && operationCount > 0) {
    await batch.commit();
  } else if (dryRun) {
    console.log(`DRY RUN COMPLETE: Would have updated ${operationCount} plays.`);
  }
};
