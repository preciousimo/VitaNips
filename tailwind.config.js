/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Scan all relevant files in src
  ],
  theme: {
    extend: {
      colors: {
        // Define colors based on your logo
        primary: {
          light: '#6fbf73', // Lighter shade of green
          DEFAULT: '#4CAF50', // Main green (adjust if you have the exact hex)
          dark: '#388e3c', // Darker shade of green
        },
        secondary: '#333333', // Dark gray / Almost black for text
        accent: '#ffc107',   // Example accent color (Amber) - choose one if needed
        background: '#ffffff', // White background
        surface: '#f7fafc',    // Slightly off-white for cards/surfaces
        muted: '#6b7280',     // Gray for secondary text
        error: '#dc2626',     // Red for errors
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Example: Using Inter font
      },
    },
  },
  plugins: [],
}
