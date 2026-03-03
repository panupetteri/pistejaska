import {
  collection,
  doc,
  getDocs,
  getFirestore,
  query,
  where,
  writeBatch,
} from "firebase/firestore";
import { app } from "../common/firebase";

export const deletePlay = async (playId: string) => {
  const db = getFirestore(app);
  const batch = writeBatch(db);

  // 1. Delete the play document
  const playRef = doc(db, "plays-v1", playId);
  batch.delete(playRef);

  // 2. Delete all comments for this play
  const commentsQuery = query(
    collection(db, "comments-v1"),
    where("playId", "==", playId)
  );
  const commentsSnap = await getDocs(commentsQuery);
  commentsSnap.docs.forEach((d) => {
    batch.delete(d.ref);
  });

  // 3. Delete all notifications for this play
  const notificationsQuery = query(
    collection(db, "notifications-v1"),
    where("playId", "==", playId)
  );
  const notificationsSnap = await getDocs(notificationsQuery);
  notificationsSnap.docs.forEach((d) => {
    batch.delete(d.ref);
  });

  // 4. Commit the batch
  await batch.commit();
};
