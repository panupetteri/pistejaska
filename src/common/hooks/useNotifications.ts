import { useCollectionData } from "react-firebase-hooks/firestore";
import { app } from "../firebase";
import {
  getFirestore,
  collection,
  FirestoreDataConverter,
  query,
  where,
  doc,
  writeBatch,
  updateDoc,
} from "firebase/firestore";
import { Notification, NotificationDTO } from "../../domain/notification";
import useCurrentUser from "./useCurrentUser";

const notificationConverter: FirestoreDataConverter<NotificationDTO> = {
  fromFirestore: (snapshot) => snapshot.data() as NotificationDTO,
  toFirestore: (data: NotificationDTO) => data,
};

export const useNotifications = (): {
  notifications: Notification[];
  loading: boolean;
  error: Error | undefined;
  dismissNotification: (id: string) => Promise<void>;
  dismissAll: () => Promise<void>;
} => {
  const [user] = useCurrentUser();
  const firestore = getFirestore(app);
  const notificationCollection = collection(firestore, "notifications-v1").withConverter(
    notificationConverter
  );

  const q = user
    ? query(
        notificationCollection,
        where("toUserId", "==", user.uid)
      )
    : null;

  const [entities, loading, error] = useCollectionData(q);

  const notifications = entities?.map((dto) => new Notification(dto)) || [];

  const dismissNotification = async (id: string) => {
    await updateDoc(doc(firestore, "notifications-v1", id), { isRead: true });
  };

  const dismissAll = async () => {
    const batch = writeBatch(firestore);
    notifications.forEach((n) => {
      batch.update(doc(firestore, "notifications-v1", n.id), { isRead: true });
    });
    await batch.commit();
  };

  return {
    notifications,
    loading,
    error,
    dismissNotification,
    dismissAll,
  };
};
