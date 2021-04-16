import React, { Dispatch, SetStateAction } from "react";
import Editor from "@monaco-editor/react";
import { Subtitle } from "@leafygreen-ui/typography";
import { uiColors } from "@leafygreen-ui/palette";

import { useTheme } from "../../hooks/useTheme";
import isEmpty from "is-empty";

interface SchemaEditorProps {
  schema: string | undefined;
  setSchema: Dispatch<SetStateAction<string | undefined>>;
  schemaValid: boolean;
  setSchemaValid: (valid: boolean) => void;
}

const SchemaEditor = ({
  schema,
  setSchema,
  schemaValid,
  setSchemaValid,
}: SchemaEditorProps) => {
  const { dark } = useTheme();

  const handleEditorWillMount = (monaco: any) => {
    monaco.editor.defineTheme("dark-theme", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: { "editor.background": uiColors.black },
    });
  };

  const handleEditorValidate = (markers: any) => {
    if (!isEmpty(markers)) {
      if (schemaValid) {
        setSchemaValid(false);
      }
    } else {
      if (!schemaValid) {
        setSchemaValid(true);
      }
    }
  };

  return (
    <div className="h-full w-full space-y-1 flex flex-col">
      <Subtitle className="font-bold font-mono text-center dark:text-white">
        Data
      </Subtitle>
      <Editor
        theme={dark ? "dark-theme" : "light"}
        defaultLanguage="json"
        beforeMount={handleEditorWillMount}
        onValidate={handleEditorValidate}
        value={schema}
        onChange={setSchema}
        height="95%"
        options={{
          fontSize: "18px",
          minimap: {
            enabled: false,
          },
          scrollBeyondLastLine: false,
          glyphMargin: false,
          formatOnPaste: true,
          formatOnType: true,
          hideCursorInOverviewRuler: true,
          overviewRulerBorder: false,
          indentWidth: 4,
        }}
      />
    </div>
  );
};

export default SchemaEditor;
