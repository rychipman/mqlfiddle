import React from "react";
import { Option, OptionGroup, Select, Size } from "@leafygreen-ui/select";

import { useTheme } from "../../hooks/useTheme";
import { FiddleDescriptor } from "../../types";

interface SavedFiddleToggleProps {
	fiddles: Array<FiddleDescriptor> | undefined;
	onSelect: (fiddleId: string) => void;
	currentFiddle: string | undefined;
}

const SavedFiddleToggle = ({
	fiddles,
	onSelect,
	currentFiddle,
}: SavedFiddleToggleProps) => {
	const { dark } = useTheme();
	return (
		<div className="w-60">
			<Select
				aria-labelledby="saved-fiddle-toggle"
				description=""
				placeholder={fiddles ? "Load Fiddle" : "Loading..."}
				name="Saved Fiddle"
				size={Size.Default}
				value={currentFiddle}
				onChange={onSelect}
				darkMode={dark}
			>
				{fiddles && (
					<OptionGroup label="My Saved Fiddles">
						{fiddles.map(f => (
							<Option key={`fiddle-option-saved-${f.code}`} value={f.code}>
								{f.name}
							</Option>
						))}
					</OptionGroup>
				)}
			</Select>
		</div >
	);
};

export default SavedFiddleToggle;
