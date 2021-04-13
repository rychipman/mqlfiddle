const { uiColors } = require("@leafygreen-ui/palette");

module.exports = {
  purge: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  darkMode: "class",
  theme: {
    colors: {
      transparent: "transparent",
      white: uiColors.white,
      black: uiColors.black,
      focus: uiColors.focus,
      primary: {
        light: uiColors.green.light2,
        DEFAULT: uiColors.green.base,
        dark: uiColors.green.dark2,
      },
      gray: {
        light: uiColors.gray.light2,
        DEFAULT: uiColors.gray.base,
        dark: uiColors.gray.dark2,
      },
      blue: {
        DEFAULT: uiColors.blue.base,
      },
      yellow: {
        DEFAULT: uiColors.yellow.base,
      },
      red: {
        DEFAULT: uiColors.red.base,
      },
    },
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
