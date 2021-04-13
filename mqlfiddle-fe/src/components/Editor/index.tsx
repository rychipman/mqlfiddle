import React, { Dispatch, SetStateAction } from "react";
import MEditor from "@monaco-editor/react";
import { Subtitle } from "@leafygreen-ui/typography";

interface SchemaEditorProps {
  data: string | undefined;
  setData: Dispatch<SetStateAction<string | undefined>>;
  title: string;
  defaultLanguage: "json" | "javascript";
}

const Editor = ({
  data,
  setData,
  title,
  defaultLanguage,
}: SchemaEditorProps) => {
  return (
    <div className="h-full w-full space-y-1 flex flex-col">
      <Subtitle className="flex-none font-mono text-center">{title}</Subtitle>
      <MEditor
        defaultLanguage={defaultLanguage}
        value={data}
        onChange={setData}
        className="flex-grow bg-black"
        options={{
          fontFamily: "Roboto Mono, monospace",
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
        }}
      />
    </div>
  );
};

Editor.defaultProps = {
  defaultLanguage: "javascript",
};

export default Editor;
