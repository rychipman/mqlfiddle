import React, { useState } from "react";
import { useHistory } from "react-router";

interface NavbarProps {
  onSave: () => void;
  onExecute: () => void;
}

const Navbar = ({ onSave, onExecute }: NavbarProps) => {
  const [fiddleId, setFiddleId] = useState<string>("");
  const history = useHistory();

  const onLoad = () => {
    if (fiddleId) {
      history.push(fiddleId);
      setFiddleId("");
    }
  };

  return (
    <div className="w-screen h-16 bg-gray-100 border-b flex items-center justify-between px-5">
      <h1 className="font-bold text-xl">MQL FIDDLE</h1>
      <div className="space-x-5">
        <input
          onChange={(e) => setFiddleId(e.target.value)}
          value={fiddleId}
          placeholder="Load saved fiddle"
        />
        <button onClick={onLoad}>Load</button>
      </div>
      <div className="flex items-center space-x-5">
        <button onClick={onExecute}>Execute</button>
        <button onClick={onSave}>Save</button>
      </div>
    </div>
  );
};

export default Navbar;
