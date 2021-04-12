import React from "react";
import ReactDOM from "react-dom";

import Editor from "@monaco-editor/react";
import "./App.css";

function App() {
  return (
    <div className="app">
      <Editor
        className="schema"
        theme="vs-dark"
        defaultLanguage="javascript"
        defaultValue="collection.insertMany({'a': 1}, {'a': 2})"
        height="50vh"
        width="50vw"
        options={{ fontFamily: "Roboto Mono, monospace", fontSize: "20px" }}
      />
      <Editor
        className="editor"
        theme="vs-dark"
        defaultLanguage="javascript"
        defaultValue="db.collection.find()"
        options={{ fontFamily: "Roboto Mono, monospace", fontSize: "20px" }}
        height="50vh"
        width="50vw"
      />
      <div className="output">Output</div>
    </div>
  );
}

export default App;
