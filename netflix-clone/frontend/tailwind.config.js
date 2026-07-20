/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        netflix: { red: "#E50914", dark: "#141414" },
      },
      fontFamily: { sans: ["Netflix Sans", "Helvetica Neue", "Helvetica", "Arial", "sans-serif"] },
    },
  },
  plugins: [],
};
