/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: [
    "./App.tsx",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        montserrat: ["Montserrat-Regular", "sans-serif"],
        "montserrat-bold": ["Montserrat-Bold", "sans-serif"],
        "montserrat-light": ["Montserrat-Light", "sans-serif"],
        "montserrat-black": ["Montserrat-Black", "sans-serif"],
        "montserrat-semiBold": ["Montserrat-SemiBold", "sans-serif"],
        "montserrat-extraBold": ["Montserrat-ExtraBold", "sans-serif"],
      },
      colors: {
        primary: "#696969",
        secondary: "#66797F",
        tertiary: "#D9D9D9",
        accent: "##F9F9F9",
        white: "#FEFEFE",
        text: "#374151",
        subtext: {
          100: "#9ca3af",
          200: "#374151",
        },
      },
    },
  },
  plugins: [],
};
