import { useMemo, useReducer, useState } from "react";
import { Play } from "./domain/play";
import { orderBy } from "lodash-es";
import { Game } from "./domain/game";
import List from "./common/components/lists/List";
import ListItemIcon from "./common/components/lists/ListItemIcon";
import ListItemText from "./common/components/lists/ListItemText";
import ListItemDescription from "./common/components/lists/ListItemDescription";
import ButtonTextOnly from "./common/components/buttons/ButtonTextOnly";
import ListLinkItem from "./common/components/lists/ListLinkItem";
import { convertToLocaleDateString } from "./common/dateUtils";
import { Comment } from "./domain/comment";
import { IconComment } from "./common/components/icons/IconComment";
import InputTextField from "./common/components/inputs/InputTextField";

interface PlayListProps {
  plays: Play[];
  games: Game[];
  comments: Comment[];
}

function getPlayLabel(play: Play) {
  if (!play.isResolved()) {
    return "(Ongoing)";
  }
  const winners = play.getWinners();
  if (winners.length !== 1) {
    return `(Tied)`;
  }
  return winners[0].player.name;
}

const PlayList = (props: PlayListProps) => {
  const { plays, games, comments } = props;
  const [search, setSearch] = useState("");

  const sortedData = useMemo(
    () =>
      orderBy(
        plays,
        [(play) => play.getDate().epochMilliseconds, "created"],
        ["desc", "desc"],
      ),
    [plays],
  );

  // Pre-calculate searchable strings for performance during typing
  const searchableData = useMemo(() => {
    return sortedData.map((play) => {
      const game = games.find((g) => g.id === play.gameId);
      const playComments = comments.filter((c) => c.playId === play.id);
      const parts = [
        play.getName() ?? "",
        game?.name ?? "",
        ...play.players.map((p) => p.name),
        ...(game?.expansions
          ?.filter((e) => play.expansions.includes(e.id))
          .map((e) => e.name) ?? []),
        ...playComments.map((c) => c.comment),
      ].map((part) => String(part).toLowerCase());

      return { play, parts };
    });
  }, [sortedData, games, comments]);

  const filteredData = useMemo(() => {
    if (!search.trim()) {
      return sortedData;
    }
    const words = search.toLowerCase().split(/\s+/).filter(Boolean);
    return searchableData
      .filter(({ parts }) =>
        words.every((word) => parts.some((part) => part.includes(word))),
      )
      .map(({ play }) => play);
  }, [searchableData, search, sortedData]);

  const [limit, increaseLimit] = useReducer((oldLimit) => oldLimit * 2, 10);
  const currentData = filteredData.slice(0, limit);
  const hasMore = limit < filteredData.length;

  return (
    <>
      <div className="px-2 mb-4">
        <InputTextField
          label="Search..."
          value={search}
          onChange={setSearch}
          onClear={() => setSearch("")}
        />
      </div>
      <List>
        {currentData.map((play) => {
          const game = games.find((g) => g.id === play.gameId);
          const noOfPlayComments =
            comments.filter((x) => x.playId === play.id)?.length ?? 0;
          return (
            <ListLinkItem
              key={play.id}
              to={`/view/${play.id}?from=${window.location.pathname}`}
            >
              <ListItemIcon>
                {game ? (
                  <img
                    alt="gamepic"
                    src={game.icon}
                    className="mx-auto object-cover rounded-full h-14 w-14 "
                  />
                ) : (
                  <div
                    className="mx-auto object-cover rounded-full h-14 w-14 background-gray"
                    data-testid="game-icon-placeholder"
                  />
                )}
              </ListItemIcon>
              <ListItemText
                title={play.getName() ?? ""}
                description={game?.name}
              />
              <ListItemDescription>
                {convertToLocaleDateString(play.getDate())}
                <br />
                <span className="text-slate-300">{getPlayLabel(play)}</span>
                {noOfPlayComments > 0 ? (
                  <>
                    <div className="flex-col text-slate-400">
                      <IconComment className="h-6 w-6 inline" />
                      {noOfPlayComments}
                    </div>
                  </>
                ) : (
                  <></>
                )}
              </ListItemDescription>
            </ListLinkItem>
          );
        })}
      </List>
      {search && filteredData.length === 0 && (
        <div className="p-8 text-center text-slate-500">
          No plays found for "{search}"
        </div>
      )}
      {hasMore && (
        <div className="mt-1 flex flex-col items-center">
          <ButtonTextOnly onClick={increaseLimit}>Show more</ButtonTextOnly>
        </div>
      )}
    </>
  );
};

export default PlayList;
