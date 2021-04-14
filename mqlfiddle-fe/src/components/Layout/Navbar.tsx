import React, { useState } from "react";
import { useHistory } from "react-router";
import Button from "@leafygreen-ui/button";
import { LogoMark } from "@leafygreen-ui/logo";
import { H2 } from "@leafygreen-ui/typography";

import LoadDialog from "../LoadDialog";
import VersionToggle from "../VersionToggle";
import ActionMenu, { ActionMenuItemProps } from "../ActionMenu";

interface NavbarProps {
  onSave: () => void;
  onExecute: () => void;
  onReset: () => void;
  onLoadTemplate: () => void;
  isBlank: boolean;
  version: string;
  onVersionChange: (newVersion: string) => void;
}

const setUpTriggers = (
  isBlank: boolean,
  onSave: Function,
  onLoad: Function,
  onReset: Function,
  onLoadTemplate: Function
): Array<ActionMenuItemProps> => {
  return [
    {
      disabled: isBlank,
      func: onSave,
      description: "Save Current Fiddle",
      label: "Save",
      glyph: "Save",
    },
    {
      disabled: false,
      func: onLoad,
      description: "Load Fiddle",
      label: "Load",
      glyph: "OpenNewTab",
    },
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

const Navbar = ({
  onSave,
  onExecute,
  onReset,
  onLoadTemplate,
  isBlank,
  version,
  onVersionChange,
}: NavbarProps) => {
  const [loadOpen, setLoadOpen] = useState<boolean>(false);
  const [fiddleId, setFiddleId] = useState<string>("");
  const history = useHistory();

  const onLoad = () => {
    if (fiddleId) {
      history.push(fiddleId);
      setFiddleId("");
      setLoadOpen(false);
    } else {
      setLoadOpen(true);
    }
  };

  const onCancel = () => {
    setLoadOpen(false);
    setFiddleId("");
  };

  return (
    <>
      <div className="w-screen h-16 border-b border-gray-light flex items-center justify-between px-5">
        <div className="flex space-x-5 items-center flex-none">
          <LogoMark />
          <H2 className="font-black text-primary">MQL FIDDLE</H2>
          <VersionToggle
            currentVersion={version}
            onVersionChange={onVersionChange}
          />
        </div>
        <div className="flex items-center space-x-2 flex-grow justify-end">
          <ActionMenu
            triggers={setUpTriggers(
              isBlank,
              onSave,
              onLoad,
              onReset,
              onLoadTemplate
            )}
          />
          <Button onClick={onExecute} variant="primary" disabled={isBlank}>
            Execute
          </Button>
        </div>
      </div>
      <LoadDialog
        open={loadOpen}
        fiddleId={fiddleId}
        setFiddleId={setFiddleId}
        onCancel={onCancel}
        onLoad={onLoad}
      />
    </>
  );
};

export default Navbar;
