import { useCollectionData } from "react-firebase-hooks/firestore";
import { app } from "../firebase";
import {
  getFirestore,
  collection,
  FirestoreDataConverter,
  doc,
  setDoc,
  Firestore,
} from "firebase/firestore";
import { User } from "firebase/auth";
import { toUserDTO, UserDTO } from "../../domain/user";

const commentConverter: FirestoreDataConverter<UserDTO> = {
  fromFirestore: (snapshot) => snapshot.data() as UserDTO,
  toFirestore: (data: UserDTO) => data,
};

export const useUsers = (): [UserDTO[], boolean, Error | undefined] => {
  const firestore = getFirestore(app);
  const allComments = collection(firestore, "users-v1").withConverter(
    commentConverter
  );

  const [entities, loading, error] = useCollectionData(allComments);
  return [loading || !entities ? [] : entities, loading, error];
};

export const addOrUpdateUser = async (db: Firestore, user: User) => {
  await setDoc(doc(db, "users-v1", user.uid), toUserDTO(user), { merge: true });
};

export const linkUserToPlayer = async (
  db: Firestore,
  userId: string,
  playerId: string,
  playerName: string
) => {
  await setDoc(
    doc(db, "users-v1", userId),
    { playerId, playerName },
    { merge: true }
  );
};
