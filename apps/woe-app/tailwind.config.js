/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--primary)",
        "primary-600": "var(--primary-600)",
        "primary-300": "var(--primary-300)",
        accent: "var(--accent)",
        background: "var(--background)",
        text: "var(--text)",
        border: "var(--neutral-200)",
        success: "#16a34a",
        secondary: "#64748b",
        brand: {
          primary: "var(--primary)",
        },
      },
      boxShadow: {
        soft: "0 6px 20px rgba(0,0,0,0.06)",
        brand: "0 8px 24px rgba(236,93,58,0.25)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "Segoe UI", "Roboto", "Helvetica", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};
