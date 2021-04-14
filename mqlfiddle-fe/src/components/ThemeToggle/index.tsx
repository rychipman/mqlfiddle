import React from "react";
import { DarkModeSwitch } from "react-toggle-dark-mode";

import { useTheme } from "../../hooks/useTheme";

const ThemeToggle = () => {
  const { dark, setTheme } = useTheme();

  return (
    <DarkModeSwitch
      className="absolute focus:outline-none bottom-5 right-5 z-50"
      onChange={(isDark) => setTheme(isDark ? "dark" : "light")}
      checked={dark}
      size={40}
      sunColor="orange"
      moonColor="gray"
    />
  );
};

export default ThemeToggle;
