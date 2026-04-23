/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Sora", "sans-serif"],
        body: ["Nunito Sans", "sans-serif"],
      },
      boxShadow: {
        glass: "0 10px 35px rgba(15, 23, 42, 0.15)",
      },
      keyframes: {
        floatIn: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        floatIn: "floatIn 0.7s ease-out forwards",
      },
    },
  },
  plugins: [],
};
