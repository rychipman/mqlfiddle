import React from "react";
import { Option, Select, Size } from "@leafygreen-ui/select";

import { VERSIONS } from "../../constants";
import { useTheme } from "../../hooks/useTheme";

interface VersionToggleProps {
  currentVersion: string;
  onVersionChange: (newVersion: string) => void;
}

const VersionToggle = ({
  currentVersion,
  onVersionChange,
}: VersionToggleProps) => {
  const { dark } = useTheme();

  return (
    <div className="w-40">
      <Select
        aria-labelledby="version-toggle"
        description=""
        placeholder="Default"
        name="Version"
        size={Size.Default}
        value={currentVersion}
        onChange={(newVersion) => onVersionChange(newVersion)}
        darkMode={dark}
      >
        {VERSIONS.map((version) => (
          <Option key={`version-option-${version.value}`} value={version.value}>
            {version.label}
          </Option>
        ))}
      </Select>
    </div>
  );
};

export default VersionToggle;
