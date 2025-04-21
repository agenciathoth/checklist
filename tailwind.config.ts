import type { Config } from "tailwindcss";

const config: Config = {
  content: ["**/*.tsx"],
  theme: {
    extend: {
      colors: {
        primary: "#5218fa",
        secondary: "#fbbe28",
        tertiary: "#ff003d",
        border: "#eeeeee",
        background: "#f7f7f7",
        shape: "#f8f8f8",
        text: "#1e2022",
        "shape-text": "#c1c1c1",
      },
      dropShadow: {
        custom: "0px 2px 24px rgba(0, 0, 0, 0.13)",
      },
      screens: {
        md: "600px",
      },
      maxHeight: {
        "calc-vh": "calc(100dvh - 80px)",
      },
    },
  },
  plugins: [],
};

export default config;
