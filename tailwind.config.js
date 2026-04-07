/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./lib/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#0A0A0B",
        surface: {
          DEFAULT: "#131316",
          elevated: "#1C1C21",
        },
        border: "#2A2A30",
        "text-primary": "#F5F5F7",
        "text-secondary": "#8E8E93",
        "text-muted": "#636366",
        accent: {
          primary: "#4ECDC4",
          warning: "#FFB347",
          danger: "#FF6B6B",
          success: "#7ED321",
        },
      },
      fontFamily: {
        "bricolage": ["BricolageGrotesque"],
        "dm-sans": ["DMSans"],
        "dm-sans-semibold": ["DMSans-SemiBold"],
        "inter": ["Inter"],
        "inter-medium": ["Inter-Medium"],
      },
    },
  },
  plugins: [],
};
