import React from "react";
import ReactDOM from "react-dom";
import axios from "axios";

import Editor from "@monaco-editor/react";
import "./App.css";

const executeFiddle = (data: any) => axios({
	method: 'post',
	url: '/execute',
	data: data,
});

const data = {
	schema: {
		foo: [{ a: 1 }, { a: 2 }],
		bar: [{ b: 1 }, { b: 2 }],
	},
	query: {
		collection: 'foo',
		pipeline: [
			{ '$lookup': { 'from': 'foo' } },
			{ '$addFields': { c: 'abc' } },
		],
	},
};

function App() {

	return (
		<div className="app">
			<div className="schema">
				<Editor
					theme="vs-dark"
					defaultLanguage="javascript"
					defaultValue="collection.insertMany({'a': 1}, {'a': 2})"
					height="50vh"
					width="50vw"
					options={{ fontFamily: "Roboto Mono, monospace", fontSize: "20px" }}
				/>
				<button onClick={() => executeFiddle(data)}>Execute</button>
			</div>
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
