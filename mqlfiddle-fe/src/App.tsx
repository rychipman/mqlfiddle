import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useParams,
} from "react-router-dom";

import Editor from "@monaco-editor/react";
import "./App.css";

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
  return (
    <Router>
      <Switch>
        <Route exact path="/" children={<Fiddle />} />
        <Route path="/:code" children={<Fiddle />} />
      </Switch>
    </Router>
  );
}

function Fiddle() {
  const { code } = useParams<{ code: string }>();
  const [schema, setSchema] = useState<string | undefined>(defaultSchema);
  const [mql, setMql] = useState<string | undefined>(defaultMQL);
  const [output, setOutput] = useState<string | undefined>(defaultOutput);

  useEffect(() => {
    if (code !== undefined) {
      (async () => {
        let response = await axios({ method: "get", url: `/${code}` });
        let { schema, query } = response.data;
        setSchema(schema);
        setMql(query);
      })();
    }
  });

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
      .then((res) => {
        const saveUrl = window.location + res.data.code;
        navigator.clipboard.writeText(saveUrl);
        setOutput(
          JSON.stringify(
            `Unique url for this fiddle: ${saveUrl} (already copied to clipboard)`
          )
        );
      })
      .catch((e) => console.error(e));
  };

  return (
    <div className="app">
      <div className="schema">
        <Editor
          theme="vs-dark"
          defaultLanguage="javascript"
          height="50vh"
          width="50vw"
          value={schema}
          onChange={setSchema}
          options={{ fontFamily: "Roboto Mono, monospace", fontSize: "20px" }}
        />
        <button onClick={onExecute}>Execute</button>
        <button onClick={onSave}>Save</button>
      </div>
      <Editor
        className="editor"
        theme="vs-dark"
        defaultLanguage="javascript"
        options={{ fontFamily: "Roboto Mono, monospace", fontSize: "20px" }}
        height="50vh"
        width="50vw"
        value={mql}
        onChange={setMql}
      />
      <div className="output">{output}</div>
    </div>
  );
}

export default App;
