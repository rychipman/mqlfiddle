import React, { useState } from "react";
import ConfirmationModal from "@leafygreen-ui/confirmation-modal";
import TextInput from "@leafygreen-ui/text-input";

interface SaveFiddleModalProps {
	open: boolean;
	onConfirm: (fiddleName: string) => void;
	onCancel: () => void;
	defaultName: string | undefined;
}

const SaveFiddleModal = ({
	open,
	onConfirm,
	onCancel,
	defaultName,
}: SaveFiddleModalProps) => {
	const [fiddleName, setFiddleName] = useState<string>(defaultName ? defaultName : "");
	return (
		<ConfirmationModal
			open={open}
			onConfirm={() => onConfirm(fiddleName)}
			onCancel={onCancel}
			title="Save Fiddle"
			buttonText="Save"
			submitDisabled={fiddleName === ""}
		>
			<TextInput
				className="mt-10"
				aria-labelledby="fiddle-name-input"
				autoComplete="off"
				onChange={event => setFiddleName(event.target.value)}
				value={fiddleName}
				placeholder="Fiddle Name"
			/>
		</ConfirmationModal>
	);
};

export default SaveFiddleModal;
