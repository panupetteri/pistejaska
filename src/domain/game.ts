import { getTodayAsString } from "../common/dateUtils";
import { MiscDataDTO } from "./play";
import { JSONSchema7 } from "json-schema";
import { sortBy } from "lodash-es";

const fieldIdSchema: JSONSchema7 = {
  title: "Field ID",
  description: "Must be unique among all fields of the game",
  type: "string",
  minLength: 1,
};
const fieldNameSchema: JSONSchema7 = {
  title: "Field display name",
  type: "string",
  minLength: 1,
};
const fieldDescriptionSchema: JSONSchema7 = {
  title: "Field description",
  description: "Please describe e.g. how to calculate this score",
  type: "string",
};
const commonMiscFieldProperties = {
  group: {
    title: "Group name",
    description: "Show this field together with other fields in the same group",
    type: "string",
    minLength: 1,
  },
  valuePerPlayer: {
    title: "Value for each player?",
    type: "boolean",
  },
  affectsScoring: {
    title: "Affects scoring reports?",
    type: "boolean",
  },
  isRelevantReportDimension: {
    title: "Is relevant report dimension?",
    type: "boolean",
  },
};

const numberFieldSchema: JSONSchema7 = {
  type: "object",
  properties: {
    id: fieldIdSchema,
    name: fieldNameSchema,
    description: fieldDescriptionSchema,
    type: {
      title: "Field data type",
      type: "string",
      enum: ["number"],
    },
    options: {
      title: "Valid value options",
      type: "array",
      minItems: 1,
      items: {
        type: "object",
        properties: {
          value: {
            title: "Value",
            type: "number",
          },
          label: {
            title: "Display name",
            type: "string",
            minLength: 1,
          },
        },
        required: ["value", "label"],
      },
    },
    minValue: {
      title: "Minimun value",
      description: "Only values equal or greater than this are allowed",
      type: "number",
    },
    maxValue: {
      title: "Maximum value",
      description:
        "Only values equal or less than this are allowed. Use 0 for negative values.",
      type: "number",
    },
    step: {
      title: "Value step",
      description: "Value should be divisible by this number",
      type: "number",
    },
  },
  required: ["id", "name", "type"],
};

const textFieldSchema: JSONSchema7 = {
  type: "object",
  properties: {
    id: fieldIdSchema,
    name: fieldNameSchema,
    description: fieldDescriptionSchema,
    type: {
      title: "Field data type",
      type: "string",
      enum: ["text"],
    },
    options: {
      title: "Valid value options",
      type: "array",
      minItems: 1,
      items: {
        type: "object",
        properties: {
          value: {
            title: "Value",
            type: "string",
          },
          label: {
            title: "Display name",
            type: "string",
            minLength: 1,
          },
        },
        required: ["value", "label"],
      },
    },
  },
  required: ["id", "name", "type"],
};

const booleanFieldSchema: JSONSchema7 = {
  type: "object",
  properties: {
    id: fieldIdSchema,
    name: fieldNameSchema,
    description: fieldDescriptionSchema,
    type: {
      title: "Field data type",
      type: "string",
      enum: ["boolean"],
    },
  },
  required: ["id", "name", "type"],
};

const miscFieldSchema: JSONSchema7 = {
  anyOf: [
    {
      title: "Number field",
      ...numberFieldSchema,
    },
    {
      title: "Text field",
      ...textFieldSchema,
    },
    {
      title: "Boolean field",
      ...booleanFieldSchema,
    },
  ].map(
    (fieldSchema) =>
      ({
        ...fieldSchema,
        properties: {
          ...fieldSchema.properties,
          ...commonMiscFieldProperties,
        },
      }) as JSONSchema7,
  ),
};

export const schema: JSONSchema7 = {
  type: "object",
  properties: {
    id: {
      title: "Unique ID",
      description: "Must be unique to the game",
      type: "string",
      minLength: 1,
    },
    name: {
      title: "Display name",
      type: "string",
      minLength: 1,
    },
    icon: {
      title: "Icon image URL",
      type: "string",
      format: "uri",
    },
    simultaneousTurns: {
      title: "Simultaneous turns (no starting player order)",
      type: "boolean",
    },
    scoreFields: {
      title: "Score fields",
      type: "array",
      items: numberFieldSchema,
    },
    miscFields: {
      title: "Other fields",
      type: "array",
      items: miscFieldSchema,
    },
    expansions: {
      title: "Extensions",
      type: "array",
      items: {
        type: "object",
        properties: {
          id: fieldIdSchema,
          name: fieldNameSchema,
          scoreFields: {
            title: "Score fields",
            type: "array",
            items: numberFieldSchema,
          },
          miscFields: {
            title: "Other fields",
            type: "array",
            items: miscFieldSchema,
          },
        },
        required: ["id", "name"],
      },
    },
  },
  required: ["id", "name", "icon", "simultaneousTurns", "scoreFields"],
};

export const durationField: GameMiscFieldDefinition<number> = {
  id: "duration",
  name: "Duration",
  description: "Please enter the duration IN HOURS. Use decimals if needed.",
  type: "duration",
  step: 0.1,
};
export const locationField: GameMiscFieldDefinition<string> = {
  id: "location",
  name: "Location",
  type: "text",
  group: "Metadata",
};
export const nameField: GameMiscFieldDefinition<string> = {
  id: "name",
  name: "Name",
  type: "text",
  group: "Metadata",
};
export const dateField: GameMiscFieldDefinition<string> = {
  id: "date",
  name: "Date",
  type: "date",
  getDefaultValue: () => getTodayAsString(),
  group: "Metadata",
};
export const imageField: GameMiscFieldDefinition<string[]> = {
  id: "images",
  name: "Images",
  type: "images",
  group: "Metadata",
};

export class Game implements GameDefinition {
  name: string;
  id: string;
  icon: string;
  simultaneousTurns: boolean;
  scoreFields: GameScoreFieldDefinition[];
  miscFields?: GameMiscFieldDefinition[] | undefined;
  expansions?: GameExpansionDefinition[];

  constructor(game: GameDefinition) {
    this.name = game.name;
    this.id = game.id;
    this.icon = game.icon;
    this.scoreFields = game.scoreFields;
    this.simultaneousTurns = game.simultaneousTurns;
    this.miscFields = game.miscFields;
    this.expansions = game.expansions;
    this.name = game.name;
  }

  public static getDefaultMiscFieldValues(): MiscDataDTO[] {
    return this.getDefaultMiscFields().map((f) => {
      return {
        fieldId: f.id,
        data: f.getDefaultValue ? f.getDefaultValue() : "",
      };
    });
  }
  private static getDefaultMiscFields(): GameMiscFieldDefinition[] {
    return [durationField, locationField, nameField, dateField, imageField];
  }

  private static getDefaultScoreFields(): GameScoreFieldDefinition[] {
    return [
      {
        id: "tie-breaker",
        name: "Tie breaker",
        type: "number",
        description:
          "Give a number that determines the winner in case of a tie",
      },
      {
        id: "misc",
        name: "Misc (unknown category)",
        type: "number",
        description:
          "Give scores that don't belong to any other category, eg. when playing new expansion",
      },
    ];
  }

  public getScoreFields(expansionIds: string[] = []): GameScoreFieldItem[] {
    const { scoreFields, expansions = [] } = this;
    return [
      ...scoreFields.map(
        (field) => ({ field, type: "score", order: 1 }) as const,
      ),
      ...expansions
        .filter(({ id }) => expansionIds.includes(id))
        .flatMap((expansion) => expansion.scoreFields || [])
        .map((field) => ({ field, type: "score", order: 2 }) as const),
      ...Game.getDefaultScoreFields().map(
        (field) => ({ field, type: "score", order: 9999 }) as const,
      ),
    ];
  }

  public getMiscFields(expansionIds: string[] = []): GameMiscFieldItem[] {
    const { miscFields = [], expansions = [] } = this;
    return [
      ...miscFields.map(
        (field) => ({ field, type: "misc", order: 3 }) as const,
      ),
      ...expansions
        .filter(({ id }) => expansionIds.includes(id))
        .flatMap((expansion) => expansion.miscFields || [])
        .map((field) => ({ field, type: "misc", order: 4 }) as const),
      ...Game.getDefaultMiscFields().map(
        (field) => ({ field, type: "misc", order: 5 }) as const,
      ),
    ];
  }

  public getFields(expansionIds: string[] = []): GameFieldItem[] {
    return sortBy(
      [
        ...this.getScoreFields(expansionIds),
        ...this.getMiscFields(expansionIds),
      ],
      (x) => x.order,
    );
  }

  public hasExpansions(): boolean {
    return !!this.expansions && this.expansions.length > 0;
  }

  public toDTO(): GameDefinition {
    const {
      id,
      name,
      scoreFields,
      simultaneousTurns,
      icon,
      expansions,
      miscFields,
    } = this;
    return {
      id,
      name,
      scoreFields,
      simultaneousTurns,
      icon,
      expansions,
      miscFields,
    };
  }

  public getRelevantReportFields(): GameMiscFieldDefinition<string>[] {
    return this.miscFields?.filter(isRelevantReportField) ?? [];
  }
}
export type GameBasicInfoDefinition = {
  name: string;
  // please use human-readable, slugified ids, like "terraforming-mars". Do not change once created!
  id: string;
  icon: string;
  simultaneousTurns: boolean;
};

export type GameDefinition = GameBasicInfoDefinition & {
  scoreFields: GameScoreFieldDefinition[];
  miscFields?: GameMiscFieldDefinition[];
  expansions?: GameExpansionDefinition[];
};

type GameScoreFieldItem = {
  type: "score";
  order: number;
  field: GameScoreFieldDefinition;
};

type GameMiscFieldItem = {
  type: "misc";
  order: number;
  field: GameMiscFieldDefinition;
};

type GameFieldItem = GameScoreFieldItem | GameMiscFieldItem;

export interface GameFieldOption<T> {
  value: T;
  label: string;
}

export interface GameFieldDefinition<T> {
  type: T extends number
    ? "number" | "duration"
    : "date" | "text" | "boolean" | "images";
  // please use human-readable, slugified ids, like "terraforming-rating". Do not change once created!
  id: string;
  // A human-readable, short name for this field
  name: string;
  // Name of a group, if this field should be grouped together with some other fields with the same group
  group?: string;
  // A description how the field value should be calculated and entered
  description?: string;
  // If defined, then only allow choosing one of these values
  options?: Array<GameFieldOption<T>>;
  // The min, max and step values for the value. Only meaninful for numeric fields
  minValue?: T & number;
  maxValue?: T & number;
  step?: number;
}

export type GameScoreFieldDefinition = GameFieldDefinition<number>;

export interface GameMiscFieldDefinition<T = string | number | string[]>
  extends GameFieldDefinition<T> {
  valuePerPlayer?: boolean; // defaults to false
  getDefaultValue?: () => string;
  affectsScoring?: boolean; // defaults to false, used in reporting to define if scores should be be filterable by this field. e.g play location does not affect scoring, but used add-ons will affect
  isRelevantReportDimension?: boolean; // defaults to false, used in reporting to define if scores are grouped by this dimension, e.g. player race/class/corporation
}

export type GameExpansionDefinition = {
  name: string;
  // please use human-readable, slugified ids, like "terraforming-mars". Do not change once created!
  id: string;
  scoreFields?: GameScoreFieldDefinition[];
  miscFields?: GameMiscFieldDefinition[];
};

function isRelevantReportField(
  field: GameMiscFieldDefinition,
): field is GameMiscFieldDefinition<string> {
  return (field.isRelevantReportDimension ?? false) && field.type !== "number";
}
