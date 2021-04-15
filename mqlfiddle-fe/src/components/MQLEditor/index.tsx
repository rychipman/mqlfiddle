import React, {
  Dispatch,
  forwardRef,
  SetStateAction,
  useRef,
  useImperativeHandle,
} from "react";
import Editor from "@monaco-editor/react";
import { Disclaimer, Subtitle } from "@leafygreen-ui/typography";
import { uiColors } from "@leafygreen-ui/palette";

import clsx from "clsx";

import { useTheme } from "../../hooks/useTheme";

import { QuerySyntaxOptionProps, QUERY_SYNTAX_OPTIONS } from "../../constants";
import isEmpty from "is-empty";

interface MQLEditorProps {
  mql: string | undefined;
  setMql: Dispatch<SetStateAction<string | undefined>>;
  querySyntax: QuerySyntaxOptionProps | undefined;
  setQuerySyntax: Dispatch<SetStateAction<QuerySyntaxOptionProps | undefined>>;
}

const MQLEditor = forwardRef(
  ({ mql, setMql, querySyntax, setQuerySyntax }: MQLEditorProps, ref) => {
    const { dark } = useTheme();
    const editorRef = useRef<any>(null);

    useImperativeHandle(ref, () => ({
      forceFormatDocument() {
        setTimeout(() => {
          editorRef.current.getAction("editor.action.formatDocument").run();
        }, 50);
      },
    }));

    const onSyntaxChange = (newSyntax: QuerySyntaxOptionProps) => {
      setQuerySyntax(newSyntax);
      if (!isEmpty(mql)) {
        setMql(querySyntax!.conversions[newSyntax.value]!(mql!));
        setTimeout(() => {
          editorRef.current.getAction("editor.action.formatDocument").run();
        }, 50);
      }
    };

    const handleEditorWillMount = (monaco: any) => {
      monaco.editor.defineTheme("dark-theme", {
        base: "vs-dark",
        inherit: true,
        rules: [],
        colors: { "editor.background": uiColors.black },
      });
    };

    const handleEditorDidMount = (editor: any) => {
      editorRef.current = editor;
    };

    return (
      <div className="h-full w-full space-y-1 flex flex-col">
        <div className="w-full flex items-center space-x-1 justify-end">
          <div className="w-1/2 pr-5">
            <div className="w-full flex justify-between items-center">
              <Subtitle className="font-bold font-mono text-center dark:text-white">
                MQL
              </Subtitle>
              <div className="flex items-center space-x-3">
                <Disclaimer className="font-mono dark:text-white">
                  Syntax:
                </Disclaimer>
                {QUERY_SYNTAX_OPTIONS.map((option) => (
                  <Disclaimer
                    key={`syntax-toggle-${option.value}`}
                    onClick={() => onSyntaxChange(option)}
                    className={clsx(
                      "font-mono",
                      option!.value === querySyntax!.value
                        ? "font-bold text-primary"
                        : "dark:text-white hover:cursor-pointer hover:text-opacity-80"
                    )}
                  >
                    {option.value}
                  </Disclaimer>
                ))}
              </div>
            </div>
          </div>
        </div>
        <Editor
          theme={dark ? "dark-theme" : "light"}
          language={querySyntax!.language}
          beforeMount={handleEditorWillMount}
          onMount={handleEditorDidMount}
          value={mql}
          onChange={setMql}
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
  }
);

export default MQLEditor;
