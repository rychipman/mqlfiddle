import React from "react";

interface NavbarProps {
  onSave: () => void;
  onExecute: () => void;
}

const Navbar = ({ onSave, onExecute }: NavbarProps) => {
  return (
    <div className="w-screen h-16 bg-gray-100 border-b flex items-center justify-between px-5">
      <h1 className="font-bold text-xl">MQL FIDDLE</h1>
      <div className="flex items-center space-x-5">
        <button onClick={onExecute}>Execute</button>
        <button onClick={onSave}>Save</button>
      </div>
    </div>
  );
};

export default Navbar;
