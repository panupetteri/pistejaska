import { User } from "firebase/auth";
import {
  doc,
  getFirestore,
  setDoc,
} from "firebase/firestore";
import { app } from "../common/firebase";
import { CommentDTO } from "../domain/comment";
import addOrUpdateUser from "./addOrUpdateUser";
import { notifyUsersOfComment } from "./notifications";

export const addComment = async (comment: CommentDTO, user: User) => {
  const db = getFirestore(app);

  await addOrUpdateUser(user);
  await setDoc(doc(db, "comments-v1", comment.id), comment);

  // Trigger notifications
  await notifyUsersOfComment(comment);
};
