import React from "react";
import { Option, Select, Size } from "@leafygreen-ui/select";

import { useTheme } from "../../hooks/useTheme";

interface SavedFiddleToggleProps {
	fiddles: Array<string> | undefined;
	onSelect: (fiddleId: string) => void;
}

const SavedFiddleToggle = ({
	fiddles,
	onSelect,
}: SavedFiddleToggleProps) => {
	const { dark } = useTheme();
	return (
		<div className="w-40">
			<Select
				aria-labelledby="saved-fiddle-toggle"
				description=""
				placeholder={fiddles ? "Load Fiddle" : "Loading..."}
				name="Saved Fiddle"
				size={Size.Default}
				value={undefined}
				onChange={onSelect}
				darkMode={dark}
			>
				{fiddles?.map(f => (
					<Option key={`fiddle-option-${f}`} value={f}>
						{f}
					</Option>
				))}
			</Select>
		</div >
	);
};

export default SavedFiddleToggle;
