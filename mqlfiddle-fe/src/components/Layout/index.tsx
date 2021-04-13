import React, { useState, useEffect } from "react";
import axios from "axios";

import Navbar from "./Navbar";
import Editor from "../Editor";

import "./style.css";
import { useParams } from "react-router";

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

const loadFiddle = (fiddleId: string) =>
  axios({
    method: "get",
    url: `/${fiddleId}`,
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

const Layout = () => {
  const [schema, setSchema] = useState<string | undefined>(defaultSchema);
  const [mql, setMql] = useState<string | undefined>(defaultMQL);
  const [output, setOutput] = useState<string | undefined>(defaultOutput);
  const { fiddleId } = useParams<{ fiddleId?: string }>();

  useEffect(() => {
    if (fiddleId) {
      loadFiddle(fiddleId)
        .then(({ data }) => {
          setSchema(data.schema);
          setMql(data.query);
        })
        .catch((e) => console.error(e));
    }
  }, [fiddleId]);

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
      .then((res) => alert(res.data.code))
      .catch((e) => console.error(e));
  };

  return (
    <div className="h-full w-full">
      <Navbar onExecute={onExecute} onSave={onSave} />
      <div className="w-full flex flex-col space-y-2 content-container">
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
    </div>
  );
};

export default Layout;
