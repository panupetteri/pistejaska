import {
  GameMiscFieldDefinition,
  GameScoreFieldDefinition,
} from "../domain/game";
import EditGameScoreField from "./EditGameScoreField";
import EditGameMiscField from "./EditGameMiscField";
import InputTextField from "../common/components/inputs/InputTextField";
import Heading3 from "../common/components/typography/Heading3";
import ButtonLight from "../common/components/buttons/ButtonLight";
import ButtonDanger from "../common/components/buttons/ButtonDanger";
import { omit } from "lodash-es";

export interface KeyedScoreFields {
  [key: string]: GameScoreFieldDefinition;
}

export interface KeyedMiscFields {
  [key: string]: GameMiscFieldDefinition;
}

export interface KeyedExpansion {
  id: string;
  name: string;
  scoreFields: KeyedScoreFields;
  miscFields: KeyedMiscFields;
}

interface EditGameExpansionProps {
  expansion: KeyedExpansion;
  onExpansionChange: (expansion: KeyedExpansion) => void;
  onExpansionRemove: () => void;
  enableAutoFocus?: boolean;
}

function getEmptyScoreField(): GameScoreFieldDefinition {
  return { id: "", name: "", type: "number" };
}

function getEmptyMiscField(): GameMiscFieldDefinition<string> {
  return { id: "", name: "", type: "text" };
}

export default function EditGameExpansion({
  expansion,
  onExpansionChange,
  onExpansionRemove,
  enableAutoFocus = false,
}: EditGameExpansionProps) {
  const { name, scoreFields, miscFields } = expansion;

  const addScoreField = () => {
    onExpansionChange({
      ...expansion,
      scoreFields: {
        ...scoreFields,
        [crypto.randomUUID()]: getEmptyScoreField(),
      },
    });
  };

  const addMiscField = () => {
    onExpansionChange({
      ...expansion,
      miscFields: {
        ...miscFields,
        [crypto.randomUUID()]: getEmptyMiscField(),
      },
    });
  };

  return (
    <div className="p-4 space-y-4 border-2 rounded-md border-blue-400 w-full max-w-4xl">
      <div className="flex flex-row items-end gap-2">
        <div className="flex-grow">
          <InputTextField
            autoFocus={enableAutoFocus}
            required
            label="Extension Name"
            value={name}
            onChange={(name) => onExpansionChange({ ...expansion, name })}
          />
        </div>
        <div className="pb-1">
          <ButtonDanger onClick={onExpansionRemove}>
            Remove extension
          </ButtonDanger>
        </div>
      </div>

      <div>
        <Heading3>Extension score fields</Heading3>
        <div className="flex flex-row flex-wrap gap-1.5 justify-center mt-2">
          {Object.entries(scoreFields).map(([key, scoreField]) => (
            <EditGameScoreField
              key={key}
              scoreField={scoreField}
              onScoreFieldChange={(updatedScoreField) =>
                onExpansionChange({
                  ...expansion,
                  scoreFields: { ...scoreFields, [key]: updatedScoreField },
                })
              }
              onScoreFieldRemove={() =>
                onExpansionChange({
                  ...expansion,
                  scoreFields: omit(scoreFields, key),
                })
              }
            />
          ))}
        </div>
        <div className="text-center mt-3">
          <ButtonLight onClick={addScoreField}>Add score field</ButtonLight>
        </div>
      </div>

      <div>
        <Heading3>Extension miscellaneous fields</Heading3>
        <div className="flex flex-row flex-wrap gap-1.5 justify-center mt-2">
          {Object.entries(miscFields).map(([key, miscField]) => (
            <EditGameMiscField
              key={key}
              miscField={miscField}
              onMiscFieldChange={(updatedMiscField) =>
                onExpansionChange({
                  ...expansion,
                  miscFields: { ...miscFields, [key]: updatedMiscField },
                })
              }
              onMiscFieldRemove={() =>
                onExpansionChange({
                  ...expansion,
                  miscFields: omit(miscFields, key),
                })
              }
            />
          ))}
        </div>
        <div className="text-center mt-3">
          <ButtonLight onClick={addMiscField}>
            Add miscellaneous field
          </ButtonLight>
        </div>
      </div>
    </div>
  );
}
