import React, { useState, useEffect } from "react";
import axios from "axios";
import isEmpty from "is-empty";

import { useToasts } from "../../hooks/useToast";
import { VERSIONS } from "../../constants";

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

const defaultVersion = VERSIONS[VERSIONS.length - 1].value;

const Layout = () => {
  const [schema, setSchema] = useState<string | undefined>(defaultSchema);
  const [mql, setMql] = useState<string | undefined>(defaultMQL);
  const [output, setOutput] = useState<string | undefined>(undefined);
  const [version, setVersion] = useState(defaultVersion);
  const { code } = useParams<{ code?: string }>();
  const { addToast } = useToasts();

  useEffect(() => {
    if (code) {
      loadFiddle(code)
        .then(({ data }) => {
          setSchema(data.schema);
          setMql(data.query);
        })
        .catch((e) => console.error(e));
    }
  }, [code]);

  const onExecute = () => {
    executeFiddle({
      schema: JSON.parse(schema!),
      query: JSON.parse(mql!),
    })
      .then((res) => {
        setOutput(JSON.stringify(res.data.result));
        addToast("success", "Fiddle Executed", "Trace through the output");
      })
      .catch((e) => console.error(e));
  };

  const onSave = () => {
    saveFiddle({
      schema: schema!,
      query: mql!,
    })
      .then((res) => {
        const saveUrl = `${window.location.protocol}//${window.location.host}/${res.data.code}`;
        navigator.clipboard.writeText(saveUrl);
        addToast(
          "success",
          "Fiddle Saved",
          "Unique URL has been copied to clipboard"
        );
      })
      .catch((e) => console.error(e));
  };

  const onReset = () => {
    setMql(undefined);
    setSchema(undefined);
    if (output !== undefined) setOutput(undefined);
    addToast("info", "Fiddle Reset", "Be Free!!");
  };

  const onLoadTemplate = () => {
    setMql(defaultMQL);
    setSchema(defaultSchema);
    if (output !== undefined) setOutput(undefined);
    addToast("info", "Fiddle Template Loaded", "Have Fun!!");
  };

  const onVersionChange = (newVersion: string) => {
    const _newVersion = isEmpty(newVersion) ? defaultVersion : newVersion;
    setVersion(_newVersion);
    addToast(
      "success",
      "Fiddle Version",
      `MongoDB v${_newVersion} is active now`
    );
  };

  return (
    <div className="h-full w-full">
      <Navbar
        onExecute={onExecute}
        onSave={onSave}
        onReset={onReset}
        onLoadTemplate={onLoadTemplate}
        isBlank={isEmpty(mql) && isEmpty(schema)}
        version={version}
        onVersionChange={onVersionChange}
      />
      <div className="w-full flex flex-col content-container">
        <div className="w-full h-3/5 flex">
          <div className="w-1/2 h-full py-1.5">
            <Editor
              data={schema}
              setData={setSchema}
              title="Data"
              defaultLanguage="json"
            />
          </div>
          <div className="border-r border-gray-light h-full" />
          <div className="w-1/2 h-full py-1.5">
            <Editor
              data={mql}
              setData={setMql}
              title="MQL"
              defaultLanguage="json"
            />
          </div>
        </div>
        <div className="w-full h-2/5 font-mono text-lg border-t border-gray-light p-4">
          {output || "Execute to see output"}
        </div>
      </div>
    </div>
  );
};

export default Layout;
