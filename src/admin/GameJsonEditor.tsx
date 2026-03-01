import { useEffect, useState, useMemo, useCallback } from "react";
import { GameDefinition, schema } from "../domain/game";
import JsonEditor from "../common/components/JsonEditor";
import { isEqual } from "lodash-es";
import useConfirmLeave from "../common/hooks/useConfirmLeave";
import ButtonDanger from "../common/components/buttons/ButtonDanger";
import ButtonPrimary from "../common/components/buttons/ButtonPrimary";
import {
  Content,
  OnChangeStatus,
  createAjvValidator,
  Mode,
  JSONSchema,
} from "vanilla-jsoneditor";
import addFormats from "ajv-formats";

interface AdminGameEditorProps {
  json: GameDefinition;
  onSubmit: (json: GameDefinition) => void;
  onDelete: null | (() => void);
  submitButtonLabel: string;
}

function GameJsonEditor({
  json,
  onSubmit,
  onDelete,
  submitButtonLabel,
}: AdminGameEditorProps) {
  // content is the current state of the editor
  const [content, setContent] = useState<Content>(() => ({
    json: json as unknown,
  }));
  const [isValid, setIsValid] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Reset content when the json prop changes (e.g. user selects another game)
  useEffect(() => {
    setContent({ json: json as unknown });
    setIsValid(true);
  }, [json]);

  const validator = useMemo(
    () =>
      createAjvValidator({
        schema: schema as unknown as JSONSchema,
        onCreateAjv: (ajv) => {
          addFormats(ajv);
        },
      }),
    [],
  );

  const onChange = useCallback(
    (
      newContent: Content,
      _previousContent: Content,
      status: OnChangeStatus,
    ) => {
      setContent(newContent);
      setIsValid(!status.contentErrors);
    },
    [],
  );

  // Derive the actual JSON object from content for submission and comparison
  const outputJson = useMemo<GameDefinition | null>(() => {
    if ("json" in content) {
      return content.json as GameDefinition;
    }
    try {
      return JSON.parse(content.text);
    } catch {
      return null;
    }
  }, [content]);

  const hasChanges = useMemo(
    () => !isEqual(json, outputJson),
    [json, outputJson],
  );
  const isSubmitDisabled = !isValid || !outputJson || isLoading || !hasChanges;
  const isDeleteDisabled = !onDelete || isLoading;

  const onSubmitClick = async () => {
    if (!isSubmitDisabled && outputJson) {
      try {
        setIsLoading(true);
        await onSubmit(outputJson);
      } finally {
        setIsLoading(false);
      }
    }
  };

  useConfirmLeave(hasChanges);

  return (
    <>
      <div className="h-[600px] mb-2">
        <JsonEditor
          className="h-full jse-main"
          content={content}
          onChange={onChange}
          validator={validator}
          mode={Mode.text}
        />
      </div>
      <div>
        <ButtonPrimary disabled={isSubmitDisabled} onClick={onSubmitClick}>
          {submitButtonLabel}
        </ButtonPrimary>
        <ButtonDanger
          disabled={isDeleteDisabled}
          onClick={onDelete ?? undefined}
        >
          Delete game
        </ButtonDanger>
      </div>
    </>
  );
}

export default GameJsonEditor;
