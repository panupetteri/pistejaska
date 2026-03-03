import { useEffect, useState } from "react";
import { Play, Player } from "./domain/play";
import { usePlayers } from "./common/hooks/usePlayers";
import { useGames } from "./common/hooks/useGames";
import ViewContentLayout from "./common/components/ViewContentLayout";
import { LoadingSpinner } from "./common/components/LoadingSpinner";
import { getFirestore, setDoc, doc } from "firebase/firestore";
import { Game } from "./domain/game";
import { app } from "./common/firebase";
import CardButtonRow from "./common/components/buttons/CardButtonRow";
import Button from "./common/components/buttons/Button";
import ButtonPrimary from "./common/components/buttons/ButtonPrimary";
import Heading1 from "./common/components/typography/Heading1";
import List from "./common/components/lists/List";
import ListItem from "./common/components/lists/ListItem";
import ListItemIcon from "./common/components/lists/ListItemIcon";
import ListItemText from "./common/components/lists/ListItemText";
import { orderBy, shuffle } from "lodash-es";
import InputTextField from "./common/components/inputs/InputTextField";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { Temporal } from "@js-temporal/polyfill";
import SelectPlayersRandomizerButton from "./SelectPlayersRandomizerButton";
import usePlaysByPlayerId from "./common/hooks/usePlaysByPlayerId";
import { IconPerson } from "./common/components/icons/IconPerson";
import { IconSmileyFace } from "./common/components/icons/IconSmileyFace";
import { IconPlus } from "./common/components/icons/IconPlus";

function shiftRandomly<T>(values: T[]) {
  const offset = Math.floor(Math.random() * values.length);
  return shiftValues(values, offset);
}

function shiftValues<T>(values: T[], offset: number) {
  const shift = offset % values.length;
  return [...values.slice(shift), ...values.slice(0, shift)];
}

async function createPlay(
  gameId: string,
  players: Player[],
  userId: string,
): Promise<Play> {
  const playId = `${gameId}-${window.crypto.randomUUID()}`;
  const play = new Play({
    gameId: gameId,
    id: playId,
    players: players,
    expansions: [],
    scores: [],
    misc: Game.getDefaultMiscFieldValues(),
    createdBy: userId,
    created: Temporal.Now.instant().toString({
      fractionalSecondDigits: 3,
    }),
  });

  const db = getFirestore(app);
  await setDoc(doc(db, "plays-v1", playId), play.toDTO());
  return play;
}

const SelectPlayers = (props: {
  gameId: string;
  initialPlayers?: Player[];
}) => {
  const navigate = useNavigate();
  const [games, isLoadingGames] = useGames();
  const { gameId, initialPlayers = [] } = props;
  const game = games?.find((g) => g.id === gameId);
  const auth = getAuth();
  const [user] = useAuthState(auth);

  const [playsByPlayerId] = usePlaysByPlayerId();
  const [allPlayers] = usePlayers();

  const [searchTerm, setSearchTerm] = useState("");
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [isStarting, setIsStarting] = useState<boolean>(false);
  const [showAllPlayers, setShowAllPlayers] = useState<boolean>(false);
  const [currentPlayerName, setCurrentPlayerName] = useState<string>("");
  const [isRandomizingStarter, setIsRandomizingStarter] = useState(false);
  const [isRandomizingOrder, setIsRandomizingOrder] = useState(false);
  const isRandomizing = isRandomizingStarter || isRandomizingOrder;

  const selectablePlayers = orderBy(
    allPlayers
      .filter((p) => players.every((selectPlayer) => selectPlayer.id !== p.id))
      .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase())),
    // Sort by the number of plays in which this player has played together
    // with every player selected so far.
    ({ id }) => {
      const playerPlays = playsByPlayerId[id] ?? [];
      return playerPlays.reduce(
        (count, play) =>
          players.every((other) => play.hasPlayer(other.id))
            ? count + 1
            : count,
        0,
      );
    },
    "desc",
  );
  const visiblePlayers = showAllPlayers
    ? selectablePlayers
    : selectablePlayers.slice(0, 6);

  const onStartGame = async (userId: string) => {
    setIsStarting(true);
    try {
      const play = await createPlay(gameId, players, userId);
      navigate(`/edit/${play.id}`);
    } catch (error) {
      console.error(error);
      setIsStarting(false);
    }
  };

  const onAddPlayer = () => {
    setPlayers([
      ...players,
      { name: currentPlayerName, id: window.crypto.randomUUID() },
    ]);
    setCurrentPlayerName("");
  };

  const onSelectPlayer = (player: Player) => {
    setPlayers([...players, player]);
    setSearchTerm("");
    setShowAllPlayers(false);
  };

  const onDeSelectPlayer = (player: Player) => {
    setPlayers(players.filter((p) => p.id !== player.id));
  };

  const onSearch = (searchTerm: string) => {
    setSearchTerm(searchTerm);
    setShowAllPlayers(false);
  };

  const randomizeStartingPlayer = () => {
    setPlayers(shiftRandomly(players));
    setIsRandomizingStarter(true);
  };

  const randomizeOrder = () => {
    setPlayers(shuffle(players));
    setIsRandomizingOrder(true);
  };

  useEffect(() => {
    if (!isRandomizing) {
      return undefined;
    }
    let hasEnded = false;
    let animation = requestAnimationFrame(animate);
    function animate() {
      if (hasEnded) return;
      setPlayers(
        isRandomizingStarter
          ? // Animating random starting player: just shift players without changing order
            (oldPlayers) => shiftValues(oldPlayers, 1)
          : // Shuffle players
            (oldPlayers) => shuffle(oldPlayers),
      );
      animation = requestAnimationFrame(animate);
    }
    function endAnimation() {
      hasEnded = true;
      cancelAnimationFrame(animation);
      clearTimeout(timeout);
    }
    const timeout = setTimeout(() => {
      setIsRandomizingOrder(false);
      setIsRandomizingStarter(false);
      endAnimation();
    }, 1000);

    return endAnimation;
  }, [isRandomizing, isRandomizingStarter]);

  if (isLoadingGames || isStarting) {
    return <LoadingSpinner />;
  }
  if (!game) {
    return <ViewContentLayout>Unknown game!</ViewContentLayout>;
  }

  if (!user) {
    return <></>;
  }

  return (
    <ViewContentLayout
      footer={
        <CardButtonRow>
          {game.simultaneousTurns ? null : (
            <SelectPlayersRandomizerButton
              onRandomizeStartingPlayer={randomizeStartingPlayer}
              onRandomizeOrder={randomizeOrder}
              disabled={players.length < 2 || isRandomizing}
            />
          )}
          <ButtonPrimary
            onClick={() => onStartGame(user.uid)}
            disabled={players.length < 1 || isRandomizing}
          >
            Start
          </ButtonPrimary>
        </CardButtonRow>
      }
    >
      <Heading1>Select players</Heading1>

      <p>
        {`Add players to the new game of `}
        <strong>{game.name}</strong>
        {game.simultaneousTurns ? "" : ` in the playing order.`}
      </p>
      <div>
        <InputTextField
          className="my-3"
          label="Search..."
          value={searchTerm}
          autoFocus
          onChange={onSearch}
        />
        <List>
          {visiblePlayers.map((player) => (
            <ListItem onClick={() => onSelectPlayer(player)} key={player.id}>
              <ListItemIcon>
                <IconPerson />
              </ListItemIcon>
              <ListItemText title={player.name} />
            </ListItem>
          ))}
          {!showAllPlayers && selectablePlayers.length > 6 ? (
            <ListItem onClick={() => setShowAllPlayers(true)} key="showmore">
              Show more...
            </ListItem>
          ) : showAllPlayers && selectablePlayers.length > 6 ? (
            <ListItem onClick={() => setShowAllPlayers(false)} key="showless">
              Show less...
            </ListItem>
          ) : (
            <></>
          )}

          <ListItem key="currentplayer">
          <ListItemIcon>
            <IconPlus />
          </ListItemIcon>
          <InputTextField
            className="mb-2"
            label="New player"
            value={currentPlayerName}
            onChange={setCurrentPlayerName}
          />
          <Button className="ml-4" onClick={onAddPlayer}>
            Add
          </Button>
          </ListItem>
          </List>
          {searchTerm && visiblePlayers.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              No players found for "{searchTerm}"
            </div>
          )}

          </div>
      <List className="mt-8">
        {players.map((player) => (
          <ListItem key={player.id}>
            <ListItemIcon>
              <IconSmileyFace />
            </ListItemIcon>
            <ListItemText title={player.name} />
            <ListItemIcon
              onClick={() => onDeSelectPlayer(player)}
              className={isRandomizing ? "invisible" : ""}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
              >
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
              </svg>
            </ListItemIcon>
          </ListItem>
        ))}
      </List>
    </ViewContentLayout>
  );
};

export default SelectPlayers;
