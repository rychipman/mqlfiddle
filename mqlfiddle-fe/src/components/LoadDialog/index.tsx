import React, { Dispatch, SetStateAction, useState, useEffect } from "react";
import ConfirmationModal from "@leafygreen-ui/confirmation-modal";
import TextInput from "@leafygreen-ui/text-input";
import { Select, Option, OptionGroup, Size } from "@leafygreen-ui/select";
import axios from "axios";

interface LoadDialogProps {
	open: boolean;
	onLoad: () => void;
	onCancel: () => void;
	fiddleId: string;
	setFiddleId: Dispatch<SetStateAction<string>>;
}

const getMyFiddleCodes = () => (
	axios({
		method: 'get',
		url: '/api/current_user/my_fiddles',
	}).then(
		res => res.data.fiddle_codes,
	).catch(e => {
		console.error(e)
	})
);

const LoadDialog = ({
	open,
	onLoad,
	onCancel,
	fiddleId,
	setFiddleId,
}: LoadDialogProps) => {
	const [myFiddleCodes, setMyFiddleCodes] = useState<Array<string>>([]);
	const [selectedFiddle, setSelectedFiddle] = useState<string | undefined>();

	useEffect(() => {
		getMyFiddleCodes().then(setMyFiddleCodes)
	}, []);

	return (
		<ConfirmationModal
			open={open}
			onConfirm={onLoad}
			onCancel={onCancel}
			title="Load A Saved Fiddle"
			buttonText="Load"
			submitDisabled={fiddleId === ""}
		>
			<Select
				aria-labelledby="load-select"
				size={Size.Default}
				onChange={val => console.log(val)} >
				<Option value="from-code">From Code</Option>
				<OptionGroup label="My Fiddles">
					{['one', 'two', 'three'].map(code => (
						<Option value={code} key={code}>{code}</Option>
					))}
				</OptionGroup>
			</Select>
			<TextInput
				className="mt-10"
				aria-labelledby="load-input"
				autoComplete="off"
				onChange={(event) => setFiddleId(event.target.value)}
				value={fiddleId}
				placeholder="Code"
			/>
		</ConfirmationModal>
	);
};

export default LoadDialog;
