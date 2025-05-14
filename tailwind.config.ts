import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./apps/**/*.{js,ts,jsx,tsx,mdx}",
    "./packages/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class", // Activate dark mode with the 'dark' class
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
