import { useNavigate } from "react-router-dom";
import React, { FormEvent, useEffect, useState } from "react";
import EditGameBasicInfo from "./EditGameBasicInfo";
import {
  GameBasicInfoDefinition,
  GameDefinition,
  GameExpansionDefinition,
  GameFieldDefinition,
  GameMiscFieldDefinition,
  GameScoreFieldDefinition,
} from "../domain/game";
import EditGameScoreField from "./EditGameScoreField";
import Heading2 from "../common/components/typography/Heading2";
import ButtonLight from "../common/components/buttons/ButtonLight";
import { omit } from "lodash-es";
import EditGameMiscField from "./EditGameMiscField";
import ButtonPrimary from "../common/components/buttons/ButtonPrimary";
import Spinner from "../common/components/Spinner";
import { IconSmileyFace } from "../common/components/icons/IconSmileyFace";
import classNames from "classnames";
import saveGame from "../utils/saveGame";
import EditGameExpansion, {
  KeyedExpansion,
  KeyedMiscFields,
  KeyedScoreFields,
} from "./EditGameExpansion";

interface GameEditViewProps {
  game?: GameDefinition;
}

interface KeyedExpansions {
  [key: string]: KeyedExpansion;
}

function toKeyedFields<
  T extends GameFieldDefinition<number | string | string[]>,
>(fields: T[]): { [key: string]: T } {
  return fields.reduce(
    (result, field) => ({ ...result, [crypto.randomUUID()]: field }),
    {},
  );
}

function slugify(input: string): string {
  return (
    input
      .trim()
      .toLowerCase()
      .normalize("NFKD")
      .replaceAll(/[^\w\s-]+/g, "")
      .replaceAll(/\s+/g, "-") ?? ""
  );
}

function generateMissingIds(game: GameDefinition): void {
  if (!game.id && game.name) {
    game.id = slugify(game.name);
  }
  const processFields = (
    fields: GameFieldDefinition<number | string | string[]>[],
  ) => {
    fields.forEach((field) => {
      if (!field.id && field.name) {
        field.id = slugify(field.name);
      }
      if (field.type === "text") {
        field.options?.forEach((option) => {
          if (!option.value && option.label) {
            option.value = slugify(option.label);
          }
        });
      }
    });
  };

  processFields(game.scoreFields);
  processFields(game.miscFields ?? []);

  game.expansions?.forEach((expansion) => {
    if (!expansion.id && expansion.name) {
      expansion.id = slugify(expansion.name);
    }
    processFields(expansion.scoreFields ?? []);
    processFields(expansion.miscFields ?? []);
  });
}

function getInitialBasicInfo(game?: GameDefinition): GameBasicInfoDefinition {
  return {
    id: game?.id ?? "",
    name: game?.name ?? "",
    icon: game?.icon ?? "",
    simultaneousTurns: game?.simultaneousTurns ?? false,
  };
}

function getInitialScoreFields(
  scoreFields?: GameScoreFieldDefinition[],
): KeyedScoreFields {
  const fields: GameScoreFieldDefinition[] =
    scoreFields && scoreFields?.length > 0
      ? scoreFields
      : [{ id: "", name: "", type: "number" }];
  return toKeyedFields(fields);
}

function getInitialMiscFields(
  miscFields?: GameMiscFieldDefinition[],
): KeyedMiscFields {
  return toKeyedFields(miscFields ?? []);
}

function getInitialExpansions(
  expansions?: GameExpansionDefinition[],
): KeyedExpansions {
  return (expansions ?? []).reduce(
    (result, expansion) => ({
      ...result,
      [crypto.randomUUID()]: {
        id: expansion.id,
        name: expansion.name,
        scoreFields: toKeyedFields(expansion.scoreFields ?? []),
        miscFields: toKeyedFields(expansion.miscFields ?? []),
      },
    }),
    {},
  );
}

function getEmptyScoreField(): GameScoreFieldDefinition {
  return { id: "", name: "", type: "number" };
}

function getEmptyMiscField(): GameMiscFieldDefinition<string> {
  return { id: "", name: "", type: "text" };
}

function getEmptyExpansion(): KeyedExpansion {
  return {
    id: "",
    name: "",
    scoreFields: {},
    miscFields: {},
  };
}

export default function GameForm({ game }: GameEditViewProps) {
  const navigate = useNavigate();
  const [basicInfo, setBasicInfo] = useState(() => getInitialBasicInfo(game));
  const [scoreFields, setScoreFields] = useState(() =>
    getInitialScoreFields(game?.scoreFields),
  );
  const [miscFields, setMiscFields] = useState(() =>
    getInitialMiscFields(game?.miscFields),
  );
  const [expansions, setExpansions] = useState(() =>
    getInitialExpansions(game?.expansions),
  );
  const [isInitialRender, setIsInitialRender] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => setIsInitialRender(false), []);

  const addScoreField = () => {
    setScoreFields({
      ...scoreFields,
      [crypto.randomUUID()]: getEmptyScoreField(),
    });
  };

  const addMiscField = () => {
    setMiscFields({
      ...miscFields,
      [crypto.randomUUID()]: getEmptyMiscField(),
    });
  };

  const addExpansion = () => {
    setExpansions({
      ...expansions,
      [crypto.randomUUID()]: getEmptyExpansion(),
    });
  };

  const onSave = async (event: FormEvent) => {
    event.preventDefault();
    if (isSaving || isSaved) return;
    setIsSaving(true);

    try {
      const updatedGame: GameDefinition = {
        ...game,
        ...basicInfo,
        scoreFields: Object.values(scoreFields),
        miscFields: Object.values(miscFields),
        expansions: Object.values(expansions).map((e) => ({
          id: e.id,
          name: e.name,
          scoreFields: Object.values(e.scoreFields),
          miscFields: Object.values(e.miscFields),
        })),
      };
      generateMissingIds(updatedGame);

      await saveGame(updatedGame);
      setIsSaving(false);
      setIsSaved(true);
      setTimeout(() => navigate("/admin"), 2000);
    } catch (e) {
      setIsSaving(false);
      setIsSaved(false);
      console.error(e);
      alert(e);
    }
  };

  return (
    <form onSubmit={onSave}>
      <fieldset disabled={isSaving || isSaved}>
        <div className="flex flex-col items-center pb-2 space-y-1">
          <EditGameBasicInfo
            basicInfo={basicInfo}
            onBasicInfoChange={(updatedBasicInfo) =>
              setBasicInfo({ ...basicInfo, ...updatedBasicInfo })
            }
          />
        </div>

        <Heading2 className="mt-6">Score fields</Heading2>
        <div className="flex flex-row flex-wrap gap-1.5 justify-center">
          {Object.entries(scoreFields).map(([key, scoreField]) => (
            <EditGameScoreField
              key={key}
              scoreField={scoreField}
              onScoreFieldChange={(updatedScoreField) =>
                setScoreFields({ ...scoreFields, [key]: updatedScoreField })
              }
              onScoreFieldRemove={() => setScoreFields(omit(scoreFields, key))}
              enableAutoFocus={!isInitialRender}
            />
          ))}
        </div>
        <div className="text-center mt-3">
          <ButtonLight onClick={addScoreField}>Add score field</ButtonLight>
        </div>

        <Heading2 className="mt-6">Miscellaneous fields</Heading2>
        <div className="flex flex-row flex-wrap gap-1.5 justify-center">
          {Object.entries(miscFields).map(([key, miscField]) => (
            <EditGameMiscField
              key={key}
              miscField={miscField}
              onMiscFieldChange={(updatedMiscField) =>
                setMiscFields({ ...miscFields, [key]: updatedMiscField })
              }
              onMiscFieldRemove={() => setMiscFields(omit(miscFields, key))}
              enableAutoFocus={!isInitialRender}
            />
          ))}
        </div>
        <div className="text-center mt-3">
          <ButtonLight onClick={addMiscField}>
            Add miscellaneous field
          </ButtonLight>
        </div>

        <Heading2 className="mt-6">Extensions</Heading2>
        <div className="flex flex-col items-center gap-4">
          {Object.entries(expansions).map(([key, expansion]) => (
            <EditGameExpansion
              key={key}
              expansion={expansion}
              onExpansionChange={(updatedExpansion) =>
                setExpansions({ ...expansions, [key]: updatedExpansion })
              }
              onExpansionRemove={() => setExpansions(omit(expansions, key))}
              enableAutoFocus={!isInitialRender}
            />
          ))}
        </div>
        <div className="text-center mt-3">
          <ButtonLight onClick={addExpansion}>Add extension</ButtonLight>
        </div>

        <div className="flex flex-col items-center my-6">
          <ButtonPrimary
            type="submit"
            className={classNames({ "w-32": !isSaved })}
          >
            {!isSaving && !isSaved && "Save game"}
            {isSaving && <Spinner className="inline-block w-5 h-5" />}
            {isSaved && (
              <>
                <IconSmileyFace className="inline-block w-5 h-5 mr-2" />
                Game saved!
                <IconSmileyFace className="inline-block w-5 h-5 ml-2" />
              </>
            )}
          </ButtonPrimary>
        </div>
      </fieldset>
    </form>
  );
}
