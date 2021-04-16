import React, { useState, useEffect } from "react";
import { useHistory } from "react-router";
import Button from "@leafygreen-ui/button";
import { LogoMark } from "@leafygreen-ui/logo";
import { H2 } from "@leafygreen-ui/typography";
import axios from "axios";

import VersionToggle from "../VersionToggle";
import SavedFiddleToggle from "../SavedFiddleToggle";
import ActionMenu, { ActionMenuItemProps } from "../ActionMenu";
import SaveFiddleModal from '../SaveFiddleModal';
import { useTheme } from "../../hooks/useTheme";

interface NavbarProps {
	onSave: (fiddleName: string) => void;
	onExecute: () => void;
	onReset: () => void;
	onLoadTemplate: () => void;
	isBlank: boolean;
	version: string | undefined;
	onVersionChange: (newVersion: string) => void;
	availableVersions: Array<string> | undefined;
	canExecute: boolean;
	currentFiddleId: string | undefined;
	currentFiddleName: string | undefined;
}

const setUpTriggers = (
	isBlank: boolean,
	onReset: Function,
	onLoadTemplate: Function
): Array<ActionMenuItemProps> => {
	return [
		{
			disabled: isBlank,
			func: onReset,
			description: "Reset Fiddle",
			label: "Reset",
			glyph: "Refresh",
		},
		{
			disabled: !isBlank,
			func: onLoadTemplate,
			description: "Load Fiddle Template",
			label: "Template",
			glyph: "CurlyBraces",
		},
	];
};

const getUsername = () =>
	axios({
		method: "get",
		url: "/api/current_user",
	})
		.then((res) => res.data.username)
		.catch((e) => {
			console.error(JSON.stringify(e.data.response));
		});

const getMyFiddles = () =>
	axios({
		method: "get",
		url: "/api/current_user/my_fiddles",
	})
		.then(res => res.data.fiddle_codes)
		.catch(e => {
			console.error(JSON.stringify(e.data.response))
		});

const Navbar = ({
	onSave,
	onExecute,
	onReset,
	onLoadTemplate,
	isBlank,
	version,
	onVersionChange,
	availableVersions,
	canExecute,
	currentFiddleId,
	currentFiddleName,
}: NavbarProps) => {
	const [savedFiddles, setSavedFiddles] = useState<Array<string> | undefined>();
	const [username, setUsername] = useState<string>("");
	const [confirmSaveDialogOpen, setConfirmSaveDialogOpen] = useState<boolean>(false);
	const history = useHistory();
	const { dark } = useTheme();

	useEffect(() => {
		getUsername().then(setUsername);
	}, []);

	useEffect(() => {
		getMyFiddles().then(setSavedFiddles);
	}, []);

	const onSelectFiddle = (fiddleId: string) => {
		history.push(fiddleId);
		getMyFiddles().then(setSavedFiddles);
	};

	const onBeginSave = () => {
		setConfirmSaveDialogOpen(true);
	};

	const onConfirmSave = (fiddleName: string) => {
		onSave(fiddleName);
		setConfirmSaveDialogOpen(false);
	};

	const onCancelSave = () => {
		setConfirmSaveDialogOpen(false);
	};

	return (
		<>
			<div className="w-screen h-16 border-b border-gray-light dark:border-gray-dark flex items-center justify-between px-5">
				<div className="flex space-x-5 items-center flex-none">
					<LogoMark />
					<H2 className="font-black text-primary">MQL FIDDLE</H2>
					<VersionToggle
						currentVersion={version}
						onVersionChange={onVersionChange}
						availableVersions={availableVersions}
					/>
					<SavedFiddleToggle
						currentFiddle={currentFiddleId}
						fiddles={savedFiddles}
						onSelect={onSelectFiddle}
					/>
				</div>
				<div className="flex items-center space-x-2 flex-grow justify-end">
					<p className="text-gray-dark dark:text-gray-light">{username}</p>
					<ActionMenu
						triggers={setUpTriggers(
							isBlank,
							onReset,
							onLoadTemplate
						)}
					/>
					<Button
						onClick={onExecute}
						variant="primary"
						disabled={isBlank || !canExecute}
						darkMode={dark}
					>
						Execute
					</Button>
					<Button
						onClick={onBeginSave}
						disabled={isBlank || !canExecute}
						darkMode={dark}
					>
						Save
					</Button>
				</div>
				<SaveFiddleModal
					open={confirmSaveDialogOpen}
					onConfirm={onConfirmSave}
					onCancel={onCancelSave}
					defaultName={currentFiddleName}
				/>
			</div>
		</>
	);
};

export default Navbar;
