import React, { Dispatch, SetStateAction } from "react";
import MEditor from "@monaco-editor/react";

interface SchemaEditorProps {
  data: string | undefined;
  setData: Dispatch<SetStateAction<string | undefined>>;
}

const Editor = ({ data, setData }: SchemaEditorProps) => {
  return (
    <MEditor
      theme="vs-dark"
      defaultLanguage="javascript"
      value={data}
      onChange={setData}
      options={{
        fontFamily: "Roboto Mono, monospace",
        fontSize: "20px",
        minimap: {
          enabled: false,
        },
        scrollBeyondLastLine: false,
      }}
    />
  );
};

export default Editor;
