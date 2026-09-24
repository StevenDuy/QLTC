import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#000000",
        surface: {
          DEFAULT: "#121214",
          card: "#18181b",
          elevated: "#232328",
        },
      },
      borderRadius: {
        "3xl": "1.75rem",
        "4xl": "2.25rem",
      },
      height: {
        "screen-ios": "-webkit-fill-available",
      },
    },
  },
  plugins: [
    plugin(function ({ addUtilities }) {
      addUtilities({
        /* Apple Safe Area Insets Utilities */
        ".pt-safe": {
          paddingTop: "env(safe-area-inset-top, 0px)",
        },
        ".pb-safe": {
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        },
        ".pl-safe": {
          paddingLeft: "env(safe-area-inset-left, 0px)",
        },
        ".pr-safe": {
          paddingRight: "env(safe-area-inset-right, 0px)",
        },
        ".mb-safe": {
          marginBottom: "env(safe-area-inset-bottom, 0px)",
        },
        ".mt-safe": {
          marginTop: "env(safe-area-inset-top, 0px)",
        },
        /* Hide scrollbar for Chrome, Safari and Opera */
        ".no-scrollbar::-webkit-scrollbar": {
          display: "none",
        },
        /* Hide scrollbar for IE, Edge and Firefox */
        ".no-scrollbar": {
          "-ms-overflow-style": "none",
          "scrollbar-width": "none",
        },
      });
    }),
  ],
};

export default config;
