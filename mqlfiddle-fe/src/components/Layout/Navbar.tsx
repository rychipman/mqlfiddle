import React, { useState } from "react";
import { useHistory } from "react-router";
import Button from "@leafygreen-ui/button";
import { LogoMark } from "@leafygreen-ui/logo";
import { H2 } from "@leafygreen-ui/typography";

import LoadDialog from "../LoadDialog";

interface NavbarProps {
  onSave: () => void;
  onExecute: () => void;
  onReset: () => void;
  onLoadTemplate: () => void;
  isBlank: boolean;
}

const Navbar = ({
  onSave,
  onExecute,
  onReset,
  onLoadTemplate,
  isBlank,
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
        <div className="flex space-x-5 items-center">
          <LogoMark />
          <H2 className="font-black text-primary">MQL FIDDLE</H2>
        </div>
        <div className="flex items-center space-x-2">
          {isBlank ? (
            <Button onClick={onLoadTemplate}>Template</Button>
          ) : (
            <Button onClick={onReset}>Reset</Button>
          )}
          <Button onClick={onLoad}>Load</Button>
          <Button onClick={onSave} disabled={isBlank}>
            Save
          </Button>
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
