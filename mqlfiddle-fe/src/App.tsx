import React, { useState } from "react";
import axios from "axios";

import Editor from "./components/Editor";

const executeFiddle = (data: any) =>
  axios({
    method: "post",
    url: "/execute",
    data: data,
  });

const saveFiddle = (data: any) =>
  axios({
    method: "post",
    url: "/save",
    data,
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

  const onSave = () => {
    saveFiddle({
      schema: schema!,
      query: mql!,
    })
      .then((res) => setOutput(JSON.stringify(res.data.result)))
      .catch((e) => console.error(e));
  };

  return (
    <div className="w-full h-full flex flex-col space-y-2">
      <button onClick={onExecute}>Execute</button>
      <button onClick={onSave}>Save</button>
      <div className="w-full h-3/5 flex space-x-2">
        <div className="w-1/2">
          <Editor data={schema} setData={setSchema} />
        </div>
        <div className="w-1/2">
          <Editor data={mql} setData={setMql} />
        </div>
      </div>
      <div className="w-full h-2/5 font-mono text-lg">{output}</div>
    </div>
  );
}

export default App;
