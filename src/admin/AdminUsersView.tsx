import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUsers, linkUserToPlayer } from "../common/hooks/useUsers";
import ViewContentLayout from "../common/components/ViewContentLayout";
import Heading1 from "../common/components/typography/Heading1";
import { LoadingSpinner } from "../common/components/LoadingSpinner";
import List from "../common/components/lists/List";
import ListItem from "../common/components/lists/ListItem";
import ListItemText from "../common/components/lists/ListItemText";
import ListItemDescription from "../common/components/lists/ListItemDescription";
import ListItemIcon from "../common/components/lists/ListItemIcon";
import { IconPerson } from "../common/components/icons/IconPerson";
import Heading2 from "../common/components/typography/Heading2";
import { pluralize } from "../common/stringUtils";
import { groupBy, orderBy, flatMap } from "lodash-es";
import { usePlays } from "../common/hooks/usePlays";
import ButtonLight from "../common/components/buttons/ButtonLight";
import ButtonPrimary from "../common/components/buttons/ButtonPrimary";
import Button from "../common/components/buttons/Button";
import CardButtonRow from "../common/components/buttons/CardButtonRow";
import { UserDTO } from "../domain/user";
import { Player } from "../domain/play";
import { db } from "../common/firebase";
import useCurrentUser from "../common/hooks/useCurrentUser";
import { isAdmin } from "../auth/auth";
import { combinePlayers } from "../actions/combinePlayers";

interface LinkPlayerModalProps {
  user: UserDTO;
  players: Record<string, Player[]>;
  onClose: () => void;
  onConfirm: (playerId: string, playerName: string) => void;
}

const LinkPlayerModal = ({
  user,
  players,
  onClose,
  onConfirm,
}: LinkPlayerModalProps) => {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>("");

  const sortedPlayerIds = orderBy(
    Object.keys(players),
    (id) => players[id][0].name
  );

  const handleConfirm = () => {
    if (selectedPlayerId) {
      const playerName = players[selectedPlayerId][0].name;
      onConfirm(selectedPlayerId, playerName);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]">
        <div className="p-6 border-b border-slate-100">
          <Heading2 className="!mb-0">Link {user.displayName} to player</Heading2>
        </div>

        <div className="overflow-y-auto flex-1 p-4">
          <select
            className="w-full p-2 border border-slate-300 rounded-lg mb-4"
            value={selectedPlayerId}
            onChange={(e) => setSelectedPlayerId(e.target.value)}
          >
            <option value="">Select a player...</option>
            {sortedPlayerIds.map((id) => (
              <option key={id} value={id}>
                {players[id][0].name} ({players[id].length} plays)
              </option>
            ))}
          </select>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100">
          <CardButtonRow>
            <Button onClick={onClose}>Cancel</Button>
            <ButtonPrimary onClick={handleConfirm} disabled={!selectedPlayerId}>
              OK
            </ButtonPrimary>
          </CardButtonRow>
        </div>
      </div>
    </div>
  );
};

interface CombinePlayersModalProps {
  player: Player;
  allPlayers: Record<string, Player[]>;
  onClose: () => void;
  onConfirm: (keepPlayerId: string, deletePlayerId: string, playerName: string, dryRun: boolean) => void;
}

const CombinePlayersModal = ({
  player,
  allPlayers,
  onClose,
  onConfirm,
}: CombinePlayersModalProps) => {
  const [targetPlayerId, setTargetPlayerId] = useState<string>("");
  const [keepPlayerId, setKeepPlayerId] = useState<string>(player.id);
  
  const sortedPlayerIds = orderBy(
    Object.keys(allPlayers).filter(id => id !== player.id),
    (id) => allPlayers[id][0].name
  );

  const targetPlayer = targetPlayerId ? allPlayers[targetPlayerId][0] : null;

  const handleConfirm = (dryRun: boolean) => {
    if (targetPlayerId && keepPlayerId) {
      const deleteId = keepPlayerId === player.id ? targetPlayerId : player.id;
      const keepName = allPlayers[keepPlayerId][0].name;
      onConfirm(keepPlayerId, deleteId, keepName, dryRun);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]">
        <div className="p-6 border-b border-slate-100">
          <Heading2 className="!mb-0">Combine "{player.name}"</Heading2>
        </div>

        <div className="overflow-y-auto flex-1 p-4">
          <p className="mb-4 text-slate-600">Select another player to combine with:</p>
          <select
            className="w-full p-2 border border-slate-300 rounded-lg mb-6"
            value={targetPlayerId}
            onChange={(e) => {
              setTargetPlayerId(e.target.value);
              if (!keepPlayerId) setKeepPlayerId(player.id);
            }}
          >
            <option value="">Select a player...</option>
            {sortedPlayerIds.map((id) => (
              <option key={id} value={id}>
                {allPlayers[id][0].name} ({allPlayers[id].length} plays)
              </option>
            ))}
          </select>

          {targetPlayer && (
            <div className="space-y-4">
              <p className="font-semibold text-slate-700">Which identity to keep?</p>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                  <input 
                    type="radio" 
                    name="keep" 
                    value={player.id} 
                    checked={keepPlayerId === player.id}
                    onChange={() => setKeepPlayerId(player.id)}
                  />
                  <div>
                    <div className="font-bold">{player.name}</div>
                    <div className="text-xs text-slate-500">ID: {player.id}</div>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                  <input 
                    type="radio" 
                    name="keep" 
                    value={targetPlayer.id} 
                    checked={keepPlayerId === targetPlayer.id}
                    onChange={() => setKeepPlayerId(targetPlayer.id)}
                  />
                  <div>
                    <div className="font-bold">{targetPlayer.name}</div>
                    <div className="text-xs text-slate-500">ID: {targetPlayer.id}</div>
                  </div>
                </label>
              </div>

              <p className="text-xs text-red-500 italic">
                This will modify all plays of the deleted player.
              </p>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100">
          <CardButtonRow>
            <Button onClick={onClose}>Cancel</Button>
            <Button onClick={() => handleConfirm(true)} disabled={!targetPlayerId}>
              Dry Run
            </Button>
            <ButtonPrimary onClick={() => handleConfirm(false)} disabled={!targetPlayerId}>
              Run
            </ButtonPrimary>
          </CardButtonRow>
        </div>
      </div>
    </div>
  );
};

export const AdminUsersView = () => {
  const [user, loadingUser] = useCurrentUser();
  const navigate = useNavigate();
  const [plays, loadingPlays, errorPlays] = usePlays();
  const [users, loadingUsers, errorUsers] = useUsers();
  const [linkingUser, setLinkingUser] = useState<UserDTO | null>(null);
  const [combiningPlayer, setCombiningPlayer] = useState<Player | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!loadingUser && (!user || !isAdmin(user))) {
      navigate("/");
    }
  }, [user, loadingUser, navigate]);

  if (loadingPlays || loadingUsers || loadingUser || isProcessing) {
    return <LoadingSpinner />;
  }

  if (errorPlays || errorUsers) {
    return <div>Error loading data.</div>;
  }

  const playersFromPlays = groupBy(
    orderBy(
      flatMap(plays, (p) => p.players),
      (p) => p.name,
    ),
    (p) => p.id
  );

  const sortedUsers = orderBy(users, (u) => u.displayName);

  const handleLinkConfirm = async (playerId: string, playerName: string) => {
    if (linkingUser) {
      try {
        await linkUserToPlayer(db, linkingUser.id, playerId, playerName);
        setLinkingUser(null);
      } catch (err) {
        console.error("Failed to link user", err);
        alert("Failed to link user");
      }
    }
  };

  const handleCombineConfirm = async (keepPlayerId: string, deletePlayerId: string, playerName: string, dryRun: boolean) => {
    const confirmationMsg = dryRun 
      ? `Are you sure you want to run a dry run? Changes will only be logged to console.`
      : `Are you sure you want to combine these players? This action cannot be undone.`;

    if (confirm(confirmationMsg)) {
      if (!dryRun) setIsProcessing(true);
      try {
        await combinePlayers(db, keepPlayerId, deletePlayerId, playerName, dryRun);
        if (!dryRun) {
          setCombiningPlayer(null);
          window.location.reload();
        } else {
          alert("Dry run complete. Check console for details.");
        }
      } catch (err) {
        console.error("Failed to combine players", err);
        alert("Failed to combine players");
        setIsProcessing(false);
      }
    }
  };

  return (
    <ViewContentLayout>
      <Heading1>Admin Users & Players</Heading1>

      <Heading2>Authenticated Users (userIds)</Heading2>
      <List>
        {sortedUsers.map((user) => (
          <ListItem key={user.id} className="flex flex-row justify-between items-center!">
            <div className="flex flex-row items-center flex-1">
              <ListItemIcon>
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName} 
                    className="w-10 h-10 rounded-full object-cover shadow-sm border border-slate-200"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shadow-sm border border-slate-200">
                    <IconPerson />
                  </div>
                )}
              </ListItemIcon>
              <div className="flex flex-col items-start">
                <ListItemText title={user.displayName} />
                <ListItemDescription>
                  UID: {user.id}
                  {user.lastSignInTime && ` | Last Login: ${user.lastSignInTime}`}
                  {user.playerId && (
                    <div className="text-purple-600 font-bold">
                      Linked to: {user.playerName || "Unknown"} ({user.playerId})
                    </div>
                  )}
                </ListItemDescription>
              </div>
            </div>
            <ButtonLight onClick={() => setLinkingUser(user)}>
              {user.playerId ? "Re-link" : "Link"}
            </ButtonLight>
          </ListItem>
        ))}
      </List>

      <Heading2 className="mt-8">Distinct Players (from plays)</Heading2>
      <List>
        {Object.keys(playersFromPlays).map((playerId) => {
          const player = playersFromPlays[playerId][0];
          const playCount = playersFromPlays[playerId].length;
          return (
            <ListItem key={player.id} className="flex flex-row justify-between items-center!">
              <div className="flex flex-col items-start">
                <ListItemText title={player.name} />
                <ListItemDescription>
                  ID: {player.id} | {pluralize(playCount, "play", "plays")}
                </ListItemDescription>
              </div>
              <ButtonLight onClick={() => setCombiningPlayer(player)}>
                Combine
              </ButtonLight>
            </ListItem>
          );
        })}
      </List>

      {linkingUser && (
        <LinkPlayerModal
          user={linkingUser}
          players={playersFromPlays}
          onClose={() => setLinkingUser(null)}
          onConfirm={handleLinkConfirm}
        />
      )}

      {combiningPlayer && (
        <CombinePlayersModal
          player={combiningPlayer}
          allPlayers={playersFromPlays}
          onClose={() => setCombiningPlayer(null)}
          onConfirm={handleCombineConfirm}
        />
      )}
    </ViewContentLayout>
  );
};

