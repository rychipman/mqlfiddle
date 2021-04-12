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
	const [schema, setSchema] = useState<string | undefined>('// put your schema here');
	const [mql, setMql] = useState<string | undefined>('// put your mql here');
	const [output, setOutput] = useState<string | undefined>('// output will appear here');

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
