import React from "react";
import { Option, Select, Size } from "@leafygreen-ui/select";

import { useTheme } from "../../hooks/useTheme";

interface VersionToggleProps {
	currentVersion: string | undefined;
	onVersionChange: (newVersion: string) => void;
	availableVersions: Array<string> | undefined;
}

const VersionToggle = ({
	currentVersion,
	onVersionChange,
	availableVersions,
}: VersionToggleProps) => {
	const { dark } = useTheme();
	return (
		<div className="w-40">
			<Select
				aria-labelledby="version-toggle"
				description=""
				placeholder={availableVersions ? "Select Version" : "Loading..."}
				name="Version"
				size={Size.Default}
				value={currentVersion}
				onChange={(newVersion) => onVersionChange(newVersion)}
				darkMode={dark}
			>
				{availableVersions?.map((v) => (
					<Option key={`version-option-${v}`} value={v}>
						MongoDB {v}
					</Option>
				))}
			</Select>
		</div >
	);
};

export default VersionToggle;
