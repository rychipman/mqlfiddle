import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import isEmpty from "is-empty";

import { useToasts } from "../../hooks/useToast";

import { QUERY_SYNTAX_OPTIONS } from "../../constants";
import { QuerySyntaxEnum, QuerySyntaxOptionProps } from "../../constants";

import Navbar from "./Navbar";
import SchemaEditor from "../SchemaEditor";
import MQLEditor from "../MQLEditor";

import Output, { OutputProps } from "../Output";
import ThemeToggle from "../ThemeToggle";

import "./style.css";
import { useHistory, useParams } from "react-router";
import clsx from "clsx";

const executeFiddle = (data: any) =>
	axios({
		method: "post",
		url: "/api/execute",
		data: data,
	});

const saveFiddle = (data: any) =>
	axios({
		method: "post",
		url: "/api/save",
		data,
	});

const loadFiddle = (fiddleId: string) =>
	axios({
		method: "get",
		url: `/api/fiddle/${fiddleId}`,
	});

const fetchAvailableVersions = () =>
	axios({
		method: "get",
		url: "/api/mongodb_versions",
	})

const defaultSchema = JSON.stringify(
	{
		foo: [{ a: 1 }, { a: 2 }],
		bar: [{ b: 1 }, { b: 2 }],
	},
	null,
	2
);

const defaultValidStates = { schema: true, mql: true };

const Layout = () => {
	const [schema, setSchema] = useState<string | undefined>(defaultSchema);
	const [mql, setMql] = useState<string | undefined>(
		QUERY_SYNTAX_OPTIONS[0].template
	);
	const [output, setOutput] = useState<OutputProps | undefined>(undefined);
	const [version, setVersion] = useState<string | undefined>();
	const [availableVersions, setAvailableVersions] = useState<Array<string> | undefined>();
	const { code } = useParams<{ code?: string }>();
	const [querySyntax, setQuerySyntax] = useState<
		QuerySyntaxOptionProps | undefined
	>(QUERY_SYNTAX_OPTIONS[0]);
	const [dataValid, setDataValid] = useState<{ schema: boolean; mql: boolean }>(
		defaultValidStates
	);
	const { addToast } = useToasts();
	const mqlEditorRef = useRef<any | undefined>();
	const history = useHistory();

	useEffect(() => {
		fetchAvailableVersions()
			.then(({ data }) => {
				setAvailableVersions(data.versions);
				if (data.versions.length > 0) {
					setVersion(data.versions[0]);
				}
			})
			.catch(e => {
				console.error(JSON.stringify(e.response));
				addToast(
					"error",
					"Failed to load supported MongoDB versions",
					e.response.data,
				);
			})
	}, [])

	useEffect(() => {
		if (code) {
			loadFiddle(code)
				.then(({ data }) => {
					setSchema(data.schema);
					setMql(data.query);
					setVersion(data.version);
				})
				.catch((e) => {
					console.error(JSON.stringify(e.response));
					addToast(
						"error",
						"Failed to load fiddle",
						e.response.data,
					);
					history.push("/");
				});
		}
	}, [code, addToast, history]);

	const onExecute = () => {
		let query = "";
		try {
			query = querySyntax!.conversions[QuerySyntaxEnum.COMMAND]!(mql!);
		} catch {
			addToast(
				"error",
				"Execution Failed",
				"Conversion to COMMAND did not work as expected (There might be some syntax errors that the editor didn't catch)"
			);
			return;
		}
		executeFiddle({
			schema: JSON.parse(schema!),
			query: JSON.parse(query),
			version,
		})
			.then((res) => {
				const censoredStats = JSON.parse(
					JSON.stringify(res.data.execution_stats)
				);
				// Clean sensitive data
				delete censoredStats["serverInfo"]["host"];
				delete censoredStats["serverInfo"]["port"];

				setOutput({
					results: JSON.parse(JSON.stringify(res.data.result)),
					stats: censoredStats,
				});
				addToast("success", "Fiddle Executed", "Trace through the output");
			})
			.catch((e) => {
				console.error(JSON.stringify(e.response));
				addToast(
					"error",
					"Execution Failed",
					e.response.data,
				);
			});
	};

	const onSave = () => {
		saveFiddle({
			schema: schema!,
			query: mql!,
			version,
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
			.catch((e) => {
				console.error(JSON.stringify(e.response));
				addToast(
					"error",
					"Save Failed",
					e.response.data,
				);
			});
	};

	const onReset = () => {
		setMql(undefined);
		setSchema(undefined);
		setDataValid(defaultValidStates);
		if (output !== undefined) setOutput(undefined);
		addToast("info", "Fiddle Reset", "Be Free!!");
	};

	const onLoadTemplate = () => {
		setMql(querySyntax!.template);
		setSchema(defaultSchema);
		if (output !== undefined) setOutput(undefined);
		addToast("info", "Fiddle Template Loaded", "Have Fun!!");
		mqlEditorRef.current.forceFormatDocument();
	};

	const onVersionChange = (newVersion: string) => {
		setVersion(newVersion);
		addToast(
			"success",
			"Fiddle Version",
			`MongoDB v${newVersion} is active now`
		);
	};

	return (
		<div className="relative h-full w-full dark:bg-black">
			<Navbar
				onExecute={onExecute}
				onSave={onSave}
				onReset={onReset}
				onLoadTemplate={onLoadTemplate}
				isBlank={isEmpty(mql) || isEmpty(schema)}
				canExecute={dataValid.schema && dataValid.mql}
				version={version}
				onVersionChange={onVersionChange}
				availableVersions={availableVersions}
			/>
			<div className="w-full flex flex-col content-container">
				<div
					className={clsx("w-full flex flex-none", output ? "h-3/5" : "h-full")}
				>
					<div className="w-1/2 h-full py-1.5">
						<SchemaEditor
							schema={schema}
							setSchema={setSchema}
							schemaValid={dataValid!.schema}
							setSchemaValid={(valid: boolean) =>
								setDataValid((prev) => ({ ...prev, schema: valid }))
							}
						/>
					</div>
					<div className="border-r border-gray-light dark:border-gray-dark h-full" />
					<div className="w-1/2 h-full py-1.5">
						<MQLEditor
							ref={mqlEditorRef}
							mql={mql}
							setMql={setMql}
							querySyntax={querySyntax}
							setQuerySyntax={setQuerySyntax}
							mqlValid={dataValid!.mql}
							setMqlValid={(valid: boolean) =>
								setDataValid((prev) => ({ ...prev, mql: valid }))
							}
						/>
					</div>
				</div>
				<Output results={output?.results} stats={output?.stats} />
			</div>
			<ThemeToggle />
		</div>
	);
};

export default Layout;
