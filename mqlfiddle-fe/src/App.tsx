import React, { useState } from "react";
import axios from "axios";

import Editor from "@monaco-editor/react";

const executeFiddle = (data: any) =>
  axios({
    method: "post",
    url: "/execute",
    data: data,
  });

const defaultSchema = JSON.stringify(
  {
    foo: [{ a: 1 }, { a: 2 }],
    bar: [{ b: 1 }, { b: 2 }],
  },
  null,
  2
);

const defaultMQL = JSON.stringify(
  {
    collection: "foo",
    pipeline: [
      { $lookup: { from: "bar", as: "bar", pipeline: [] } },
      { $addFields: { c: "abc" } },
    ],
  },
  null,
  2
);

const defaultOutput = "Output";

function App() {
  const [schema, setSchema] = useState<string | undefined>(defaultSchema);
  const [mql, setMql] = useState<string | undefined>(defaultMQL);
  const [output, setOutput] = useState<string | undefined>(defaultOutput);

  const onExecute = () => {
    executeFiddle({
      schema: JSON.parse(schema!),
      query: JSON.parse(mql!),
    })
      .then((res) => setOutput(JSON.stringify(res.data.result)))
      .catch((e) => console.error(e));
  };

  return (
    <div className="w-full h-full flex flex-col space-y-2">
      <button onClick={onExecute}>Execute</button>
      <div className="w-full h-3/5 flex space-x-2">
        <div className="w-1/2">
          <Editor
            theme="vs-dark"
            defaultLanguage="javascript"
            value={schema}
            onChange={setSchema}
            options={{ fontFamily: "Roboto Mono, monospace", fontSize: "20px" }}
          />
        </div>
        <div className="w-1/2">
          <Editor
            theme="vs-dark"
            defaultLanguage="javascript"
            options={{ fontFamily: "Roboto Mono, monospace", fontSize: "20px" }}
            value={mql}
            onChange={setMql}
          />
        </div>
      </div>
      <div className="w-full h-2/5 font-mono text-lg">{output}</div>
    </div>
  );
}

export default App;
