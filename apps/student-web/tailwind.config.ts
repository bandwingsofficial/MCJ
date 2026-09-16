export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0F2044",   // navy headings / structure
        secondary: "#2563D9", // brand blue
        accent: "#F5A623",    // gold / orange accent
        muted: "#6B7280",
      },
      container: {
        center: true,
        padding: "1rem",
      },
    },
  },
  plugins: [],
};