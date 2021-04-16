const {
  STAGE_OPERATORS,
  QUERY_OPERATORS,
  EXPRESSION_OPERATORS,
  CONVERSION_OPERATORS,
  ACCUMULATORS,
} = require("mongodb-ace-autocompleter");

export const getStageCompletions = (monaco: any) =>
  STAGE_OPERATORS.reduce(
    (
      prev: Array<any>,
      current: {
        label: string;
        name: string;
        description: string;
        snippet: string;
      }
    ) => {
      let snippet = current.snippet.split("\n");
      snippet[0] = `"\\${current.label}": ${snippet[0]}`;

      const insertText = snippet.join("\n");

      prev.push({
        label: current.label,
        documentation: current.description,
        insertText,
        kind: monaco.languages.CompletionItemKind.Field,
        insertTextRules:
          monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      });
      return prev;
    },
    []
  );

export const getQuerySuggestions = (monaco: any) =>
  [
    ...QUERY_OPERATORS,
    ...EXPRESSION_OPERATORS,
    ...CONVERSION_OPERATORS,
    ...ACCUMULATORS,
  ].reduce((prev: Array<any>, current: { name: string; value: string }) => {
    prev.push({
      label: current.name,
      insertText: `"${current.value}"`,
      documentation: current.name,
      kind: monaco.languages.CompletionItemKind.Text,
    });
    return prev;
  }, []);

export const getCommandSuggestions = (monaco: any) => [
  {
    label: "aggregate",
    // eslint-disable-next-line
    insertText: "db.${1:collection}.aggregate([\n\t${2:pipeline}\n])",
    kind: monaco.languages.CompletionItemKind.Operator,
    insertTextRules:
      monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
  },
  {
    label: "find",
    // eslint-disable-next-line
    insertText: 'db.${1:collection}.find({\n\t"${2:field}": ${3:value}\n})',
    kind: monaco.languages.CompletionItemKind.Operator,
    insertTextRules:
      monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
  },
];
