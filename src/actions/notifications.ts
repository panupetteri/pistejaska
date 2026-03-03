import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { app } from "../common/firebase";
import { CommentDTO } from "../domain/comment";
import { Play, PlayDTO } from "../domain/play";
import { UserDTO } from "../domain/user";

export const notifyUsersOfComment = async (comment: CommentDTO) => {
  const db = getFirestore(app);

  try {
    // 1. Fetch the play
    const playSnap = await getDoc(doc(db, "plays-v1", comment.playId));
    if (!playSnap.exists()) return;
    const playDTO = playSnap.data() as PlayDTO;
    const playObj = new Play(playDTO);
    const playName = playObj.getName() || "Unknown play";

    // 2. Identify relevant users
    const playersInPlay = playDTO.players.map((p) => p.id);

    // Get all previous comments for this play to find other commenters
    const commentsQuery = query(
      collection(db, "comments-v1"),
      where("playId", "==", comment.playId),
    );
    const commentsSnap = await getDocs(commentsQuery);
    const previousCommenterIds = new Set(
      commentsSnap.docs.map((d) => (d.data() as CommentDTO).userId),
    );

    // 3. Find all users to notify (Currently fetching all users - see performance note in review)
    const usersSnap = await getDocs(collection(db, "users-v1"));
    const allUsers = usersSnap.docs.map((d) => d.data() as UserDTO);
    
    const userIdsToNotify = new Set<string>();

    allUsers.forEach((u) => {
      // Don't notify the person who just commented
      if (u.id === comment.userId) return;

      let shouldNotify = false;
      
      // Notify if they are a player in this play
      if (u.playerId && playersInPlay.includes(u.playerId)) {
        shouldNotify = true;
      }

      // Notify if they have commented on this play before
      if (previousCommenterIds.has(u.id)) {
        shouldNotify = true;
      }
      
      // Notify the creator of the play
      if (u.id === playDTO.createdBy) {
        shouldNotify = true;
      }

      if (shouldNotify) {
        userIdsToNotify.add(u.id);
      }
    });

    // 4. Create notification documents
    const notifications = Array.from(userIdsToNotify).map((toUserId) => {
      const notificationId = window.crypto.randomUUID();
      return setDoc(doc(db, "notifications-v1", notificationId), {
        id: notificationId,
        toUserId,
        fromUserId: comment.userId,
        playId: comment.playId,
        playName: playName,
        gameId: playDTO.gameId,
        isRead: false,
        created: comment.createdOn,
      });
    });

    await Promise.all(notifications);
  } catch (error) {
    console.error("Failed to create notifications", error);
  }
};
