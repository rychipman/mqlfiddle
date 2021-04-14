import React from "react";
import { Option, Select, Size } from "@leafygreen-ui/select";

import { VERSIONS } from "../../constants";

interface VersionToggleProps {
  currentVersion: string;
  onVersionChange: (newVersion: string) => void;
}

const VersionToggle = ({
  currentVersion,
  onVersionChange,
}: VersionToggleProps) => {
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
