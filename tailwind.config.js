/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./pages/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        paper: "#FBFAF5",
        ink: "#16223F",
        inkmuted: "#3D4A6B",
        brass: "#B8722C",
        stamp: "#9A3324",
        sage: "#5F6B4E",
        line: "#D8D3C4",
        // vivid accent set — used sparingly for section markers, links, highlights
        coral: "#E4572E",
        teal: "#0E7C7B",
        gold: "#D4A017",
        indigo: "#3B4A9E",
        plum: "#7A3E65",
        // sepia reading mode
        sepiaBg: "#F1E4CE",
        sepiaInk: "#4B3A26",
        sepiaLine: "#DCC9A3",
        // dark reading mode
        nightBg: "#14161F",
        nightInk: "#E6E4DD",
        nightMuted: "#A7A499",
        nightLine: "#2C2F3D",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        body: ["var(--font-plex)", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
