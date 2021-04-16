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
import isEmpty from "is-empty";
import clsx from "clsx";

import { useTheme } from "../../hooks/useTheme";
import { useToasts } from "../../hooks/useToast";

import { QuerySyntaxOptionProps, QUERY_SYNTAX_OPTIONS } from "../../constants";

import {
  getCommandSuggestions,
  getQuerySuggestions,
  getStageCompletions,
} from "../../helpers";

interface MQLEditorProps {
  mql: string | undefined;
  setMql: Dispatch<SetStateAction<string | undefined>>;
  querySyntax: QuerySyntaxOptionProps | undefined;
  setQuerySyntax: Dispatch<SetStateAction<QuerySyntaxOptionProps | undefined>>;
  mqlValid: boolean;
  setMqlValid: (valid: boolean) => void;
}

const MQLEditor = forwardRef(
  (
    {
      mql,
      setMql,
      querySyntax,
      setQuerySyntax,
      mqlValid,
      setMqlValid,
    }: MQLEditorProps,
    ref
  ) => {
    const { dark } = useTheme();
    const editorRef = useRef<any>(null);
    const { addToast } = useToasts();

    useImperativeHandle(ref, () => ({
      forceFormatDocument() {
        setTimeout(() => {
          editorRef.current.getAction("editor.action.formatDocument").run();
        }, 100);
      },
    }));

    const onSyntaxChange = (newSyntax: QuerySyntaxOptionProps) => {
      if (!mqlValid || newSyntax!.value === querySyntax!.value) {
        return;
      }
      if (!isEmpty(mql)) {
        let convertedSyntax = "";
        try {
          convertedSyntax = querySyntax!.conversions[newSyntax.value]!(mql!);
        } catch {
          addToast(
            "error",
            "Conversion Failed",
            `Conversion to ${newSyntax.value} did not work as expected (There might be some syntax errors that the editor didn't catch)`
          );
          return;
        }
        setMql(convertedSyntax);
        setQuerySyntax(newSyntax);
        setTimeout(() => {
          editorRef.current.getAction("editor.action.formatDocument").run();
        }, 100);
      } else {
        setMql(mql);
        setQuerySyntax(newSyntax);
      }
    };

    const handleEditorValidate = (markers: any) => {
      if (!isEmpty(markers)) {
        if (mqlValid) {
          setMqlValid(false);
        }
      } else {
        if (!mqlValid) {
          setMqlValid(true);
        }
      }
    };

    const handleEditorWillMount = (monaco: any) => {
      monaco.languages.registerCompletionItemProvider("javascript", {
        provideCompletionItems: (model: any, position: any) => {
          var textUntilPosition = model.getValueInRange({
            startLineNumber: 1,
            startColumn: 1,
            endLineNumber: position.lineNumber,
            endColumn: position.column,
          });

          var match = textUntilPosition.match(/aggregate/);
          if (match) {
            return {
              suggestions: [
                ...getStageCompletions(monaco),
                ...getQuerySuggestions(monaco),
              ],
            };
          }

          match = textUntilPosition.match(/find/);
          if (match) {
            return {
              suggestions: [...getQuerySuggestions(monaco)],
            };
          }

          return {
            suggestions: getCommandSuggestions(monaco),
          };
        },
      });

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
                        : mqlValid &&
                            "dark:text-white hover:cursor-pointer hover:text-opacity-80"
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
          onValidate={handleEditorValidate}
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
            suggest: {
              showClasses: false,
              showFunctions: false,
              showUsers: false,
              showConstructors: false,
              showEvents: false,
              showFolders: false,
              showVariables: false,
              showKeywords: false,
              showModules: false,
            },
          }}
        />
      </div>
    );
  }
);

export default MQLEditor;
