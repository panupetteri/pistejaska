import { User } from "firebase/auth";
import { doc, setDoc, getFirestore } from "firebase/firestore";
import { app } from "../common/firebase";
import { toUserDTO } from "../domain/user";

export default async function addOrUpdateUser(user: User) {
  const db = getFirestore(app);
  await setDoc(doc(db, "users-v1", user.uid), toUserDTO(user), { merge: true });
}
