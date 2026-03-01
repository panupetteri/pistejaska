import { useEffect, useRef } from "react";
import {
  createJSONEditor,
  JSONEditorPropsOptional,
  JsonEditor as JsonEditorType,
} from "vanilla-jsoneditor";

interface JsonEditorProps extends JSONEditorPropsOptional {
  className?: string;
}

const JsonEditor = (props: JsonEditorProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<JsonEditorType | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      editorRef.current = createJSONEditor({
        target: containerRef.current,
        props,
      });
    }

    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
    // Initialization only. Updates are handled by the second useEffect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.updateProps(props);
    }
  }, [props]);

  return <div ref={containerRef} className={props.className} />;
};

export default JsonEditor;
