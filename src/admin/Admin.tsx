import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Button from "../common/components/buttons/Button";
import ButtonDanger from "../common/components/buttons/ButtonDanger";
import ButtonPrimary from "../common/components/buttons/ButtonPrimary";
import CardButtonRow from "../common/components/buttons/CardButtonRow";
import Heading1 from "../common/components/typography/Heading1";
import ViewContentLayout from "../common/components/ViewContentLayout";
import { useGames } from "../common/hooks/useGames";
import NativeSelectField from "../common/components/inputs/NativeSelectField";
import deleteGame from "../utils/deleteGame";
import useCurrentUser from "../common/hooks/useCurrentUser";
import { isAdmin } from "../auth/auth";

export default function Admin() {
  const navigate = useNavigate();
  const [user] = useCurrentUser();
  const [games] = useGames();
  const [gameId, setGameId] = useState<string | null>(null);

  const onDelete = async (gameId: string) => {
    if (
      gameId &&
      window.confirm(
        "Are you sure you want to permanently delete the game? This can't be undone."
      )
    ) {
      await deleteGame(gameId);
      setGameId(null);
    }
  };

  return (
    <ViewContentLayout>
      <Heading1>Add and edit games</Heading1>
      <CardButtonRow>
        <ButtonPrimary onClick={() => navigate("/admin/add-game")}>
          Add new game (beta)
        </ButtonPrimary>
        <Button onClick={() => navigate("/admin/edit-game-json")}>
          Game JSON Editor
        </Button>
        {user && isAdmin(user) && (
          <Button onClick={() => navigate("/admin_users")}>
            Users & Players
          </Button>
        )}
        {user && isAdmin(user) && (
          <Button onClick={() => navigate("/admin_ops")}>
            Admin Operations
          </Button>
        )}
      </CardButtonRow>

      <div className="flex flex-row gap-2 items-center max-w-xl mx-auto mt-3">
        <NativeSelectField
          className="flex-1"
          label="Select game"
          value={gameId}
          onChange={setGameId}
          options={games.map((game) => ({
            value: game.id,
            label: game.name || game.id,
          }))}
        />
        <ButtonPrimary
          onClick={() => navigate(`/admin/edit-game/${gameId}`)}
          disabled={!gameId}
        >
          Edit game (beta)
        </ButtonPrimary>
        {user && isAdmin(user) && (
          <ButtonDanger onClick={() => onDelete(gameId!)} disabled={!gameId}>
            Delete game
          </ButtonDanger>
        )}
      </div>
    </ViewContentLayout>
  );
}
