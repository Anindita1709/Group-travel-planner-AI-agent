/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ocean: {
          50: "#eff8ff",
          100: "#dbeefe",
          200: "#bfe3fd",
          400: "#3db0f7",
          500: "#1a94e8",
          600: "#0e77cc",
          700: "#0d5fa5",
          800: "#0f4f88",
          900: "#133f6b",
          950: "#0a1628",
        },
        coral: {
          400: "#fb7a6a",
          500: "#f95b47",
          600: "#e63e29",
        },
        sand: {
          50: "#fefbf5",
          100: "#fdf5e4",
          200: "#fae8c3",
          300: "#f6d89a",
          400: "#f0c060",
          500: "#e8a02a",
        },
      },
      fontFamily: {
        display: ["Space Grotesk", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-in-out",
        "slide-up": "slideUp 0.4s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: 0 }, "100%": { opacity: 1 } },
        slideUp: { "0%": { transform: "translateY(16px)", opacity: 0 }, "100%": { transform: "translateY(0)", opacity: 1 } },
        shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
      },
    },
  },
  plugins: [],
};
