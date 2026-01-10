/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        enikin: {
          red: "#E63946", 
          dark: "#1F2937",
          light: "#F3F4F6"
        }
      }
    },
  },
  plugins: [],
}