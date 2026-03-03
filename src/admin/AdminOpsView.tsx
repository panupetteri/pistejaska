import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { Temporal } from "@js-temporal/polyfill";
import ViewContentLayout from "../common/components/ViewContentLayout";
import Heading1 from "../common/components/typography/Heading1";
import { LoadingSpinner } from "../common/components/LoadingSpinner";
import ButtonPrimary from "../common/components/buttons/ButtonPrimary";
import useCurrentUser from "../common/hooks/useCurrentUser";
import { isAdmin } from "../auth/auth";
import { db } from "../common/firebase";
import { PlayDTO, Play } from "../domain/play";
import { UserDTO } from "../domain/user";
import { CommentDTO } from "../domain/comment";
import List from "../common/components/lists/List";
import ListItem from "../common/components/lists/ListItem";
import ListItemText from "../common/components/lists/ListItemText";
import ListItemDescription from "../common/components/lists/ListItemDescription";
import Heading2 from "../common/components/typography/Heading2";
import { orderBy } from "lodash-es";

interface CreatedNotification {
  toUserName: string;
  playName: string;
  toUserId: string;
  playId: string;
  commentAuthor: string;
}

export const AdminOpsView = () => {
  const [user, loadingUser] = useCurrentUser();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [createdNotifications, setCreatedNotifications] = useState<CreatedNotification[]>([]);

  useEffect(() => {
    if (!loadingUser && (!user || !isAdmin(user))) {
      navigate("/");
    }
  }, [user, loadingUser, navigate]);

  if (loadingUser) {
    return <LoadingSpinner />;
  }

  const handleTestNotifications = async () => {
    if (!user) return;
    setIsProcessing(true);
    setStatus("Fetching data...");
    setCreatedNotifications([]);
    console.log("Starting notification test creation (one per play per player)...");

    try {
      // 1. Fetch all plays
      const playsSnap = await getDocs(collection(db, "plays-v1"));
      const allPlays = playsSnap.docs.map((d) => d.data() as PlayDTO);
      
      // 2. Fetch all users
      const usersSnap = await getDocs(collection(db, "users-v1"));
      const allUsers = usersSnap.docs.map((d) => d.data() as UserDTO);
      
      // 3. Fetch all comments
      const commentsSnap = await getDocs(collection(db, "comments-v1"));
      const allComments = commentsSnap.docs.map((d) => d.data() as CommentDTO);

      // Sort comments by createdOn date (oldest first)
      const sortedComments = orderBy(allComments, [(c) => c.createdOn], ["asc"]);

      // Track which users have been notified for which plays: "playId-userId"
      const notifiedPairs = new Set<string>();
      const newCreatedNotifications: CreatedNotification[] = [];

      for (const commentDTO of sortedComments) {
        const playDTO = allPlays.find(p => p.id === commentDTO.playId);
        if (!playDTO) continue;

        const playObj = new Play(playDTO);
        const playName = playObj.getName() || "Unknown play";
        const playersInPlay = playDTO.players.map((p) => p.id);
        
        // Find all commenters for this play (potential recipients)
        const playComments = allComments.filter(c => c.playId === playDTO.id);
        const playCommenterIds = new Set(playComments.map(c => c.userId));

        const usersToNotifyBatch: UserDTO[] = [];

        allUsers.forEach((u) => {
          // Rule 1: Don't notify the author of the current comment
          if (u.id === commentDTO.userId) return;

          // Rule 2: Only 1 notification per play per recipient
          if (notifiedPairs.has(`${playDTO.id}-${u.id}`)) return;

          let shouldNotify = false;
          // Notify if they are a player in this play
          if (u.playerId && playersInPlay.includes(u.playerId)) {
            shouldNotify = true;
          }

          // Notify if they have commented on this play
          if (playCommenterIds.has(u.id)) {
            shouldNotify = true;
          }
          
          // Notify the creator of the play
          if (u.id === playDTO.createdBy) {
            shouldNotify = true;
          }

          if (shouldNotify) {
            usersToNotifyBatch.push(u);
          }
        });

        if (usersToNotifyBatch.length > 0) {
          const author = allUsers.find(u => u.id === commentDTO.userId)?.displayName || "Unknown";
          console.log(`Comment by ${author} on Play: ${playName} - Notifying ${usersToNotifyBatch.length} new recipients.`);

          const notifications = usersToNotifyBatch.map((targetUser) => {
            const notificationId = window.crypto.randomUUID();
            
            // Mark as notified for this play
            notifiedPairs.add(`${playDTO.id}-${targetUser.id}`);

            newCreatedNotifications.push({
              toUserName: targetUser.displayName,
              playName: playName,
              toUserId: targetUser.id,
              playId: playDTO.id,
              commentAuthor: author
            });

            return setDoc(doc(db, "notifications-v1", notificationId), {
              id: notificationId,
              toUserId: targetUser.id,
              fromUserId: commentDTO.userId,
              playId: playDTO.id,
              playName: playName,
              gameId: playDTO.gameId,
              isRead: false,
              created: commentDTO.createdOn || Temporal.Now.instant().toString(),
            });
          });

          await Promise.all(notifications);
        }
      }

      setCreatedNotifications(newCreatedNotifications);
      setStatus(`Success! Created ${newCreatedNotifications.length} notification entities.`);
    } catch (err) {
      console.error("Failed to create test notifications", err);
      setStatus("Error: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ViewContentLayout>
      <Heading1>Admin Operations</Heading1>

      <div className="flex flex-col gap-4 max-w-xl mx-auto mt-6">
        <ButtonPrimary 
          onClick={handleTestNotifications} 
          disabled={isProcessing}
        >
          {isProcessing ? "Processing..." : "danger: create notifications for all comments (one per play per player)"}
          </ButtonPrimary>

          {status && (
          <div className={`p-4 rounded-lg ${status.startsWith("Error") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
            {status}
          </div>
          )}

          {createdNotifications.length > 0 && (
          <div className="mt-8">
            <Heading2>Created Notifications</Heading2>
            <List className="mt-4">
              {createdNotifications.map((n, i) => (
                <ListItem key={`${n.toUserId}-${n.playId}-${i}`} className="flex flex-col items-start!">
                  <ListItemText title={`To: ${n.toUserName}`} />
                  <ListItemDescription>
                    Regarding comment by <strong>{n.commentAuthor}</strong> on <strong>{n.playName}</strong>
                  </ListItemDescription>
                </ListItem>
              ))}
            </List>
          </div>
          )}

          <div className="text-sm text-slate-500 mt-4">
          <p><strong>danger: create notifications for all comments (one per play per player):</strong></p>
          <p className="text-red-500 font-bold mt-1 italic">CAVEAT: This command does not check for existing notifications and will create doubles if run multiple times!</p>
          <ul className="list-disc ml-5 mt-2">

            <li>Iterates through all comments, oldest first.</li>
            <li>For each comment, identifies eligible recipients (players, commenters, creator).</li>
            <li>**Only creates a notification if the recipient hasn't been notified for this play yet.**</li>
            <li>Ensures exactly one notification per (Play, Recipient) pair, triggered by the first eligible comment.</li>
            <li>Uses the comment author as <code>fromUserId</code>.</li>
          </ul>
        </div>
      </div>
    </ViewContentLayout>
  );
};
