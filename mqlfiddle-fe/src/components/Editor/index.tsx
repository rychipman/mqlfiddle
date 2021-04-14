import React, { Dispatch, SetStateAction } from "react";
import MEditor from "@monaco-editor/react";
import { Subtitle } from "@leafygreen-ui/typography";
import { uiColors } from "@leafygreen-ui/palette";

import { useTheme } from "../../hooks/useTheme";
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
  const { dark } = useTheme();

  const handleEditorWillMount = (monaco: any) => {
    monaco.editor.defineTheme("dark-theme", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: { "editor.background": uiColors.black },
    });
  };

  return (
    <div className="h-full w-full space-y-1 flex flex-col">
      <Subtitle className="font-mono text-center dark:text-white">
        {title}
      </Subtitle>
      <MEditor
        theme={dark ? "dark-theme" : "light"}
        defaultLanguage={defaultLanguage}
        beforeMount={handleEditorWillMount}
        value={data}
        onChange={setData}
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

Editor.defaultProps = {
  defaultLanguage: "javascript",
};

export default Editor;
