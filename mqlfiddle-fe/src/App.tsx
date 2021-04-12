import React, { useState } from "react";
import ReactDOM from "react-dom";
import axios from "axios";

import Editor from "@monaco-editor/react";
import "./App.css";

const executeFiddle = (data: any) => axios({
	method: 'post',
	url: '/execute',
	data: data,
});

const defaultSchema = JSON.stringify({
	foo: [{ a: 1 }, { a: 2 }],
	bar: [{ b: 1 }, { b: 2 }],
}, null, 2);

const defaultMQL = JSON.stringify({
	collection: 'foo',
	pipeline: [
		{ '$lookup': { 'from': 'bar', 'as': 'bar', 'pipeline': [] } },
		{ '$addFields': { c: 'abc' } },
	],
}, null, 2);

const defaultOutput = 'Output';

function App() {
	const [schema, setSchema] = useState<string | undefined>(defaultSchema);
	const [mql, setMql] = useState<string | undefined>(defaultMQL);
	const [output, setOutput] = useState<string | undefined>(defaultOutput);

	const onExecute = () => {
		executeFiddle({
			schema: JSON.parse(schema!),
			query: JSON.parse(mql!),
		}).then(
			res => setOutput(JSON.stringify(res.data.result))
		).catch(
			e => console.error(e)
		)
	}

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
