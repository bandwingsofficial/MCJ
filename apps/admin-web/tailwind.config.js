/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        admin: {
          primary: "#2563EB",
          "primary-hover": "#1D4ED8",
          navy: "#102A56",
          muted: "#647A9B",
          sidebar: "#F8FBFF",
          "sidebar-end": "#D7ECFF",
          surface: "#F6F9FD",
          border: "#DCE8F5",
          "table-border": "#E1EBF5",
          offwhite: "#FBFDFF",
          pale: "#F4F9FF",
        },
      },
      boxShadow: {
        "admin-card": "0 2px 10px rgba(16, 42, 86, 0.05)",
        "admin-nav": "0 2px 10px rgba(16, 42, 86, 0.07)",
        "admin-btn": "0 4px 14px rgba(37, 99, 235, 0.2)",
      },
      borderRadius: {
        "admin-input": "12px",
        "admin-btn": "14px",
        "admin-card": "16px",
      },
    },
  },
  plugins: [],
};
