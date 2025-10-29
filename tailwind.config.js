/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Scan all relevant files in src
  ],
  theme: {
    extend: {
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '1.25rem',
          md: '2rem',
          lg: '2.5rem',
          xl: '3rem',
        },
      },
      colors: {
        // Define colors based on your logo (#32a852)
        primary: {
          light: '#5bc475',   // Lighter shade
          DEFAULT: '#32a852', // VitaNips brand green
          dark: '#267a3e',    // Darker shade
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
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        card: '0 10px 30px -12px rgba(0,0,0,0.2)',
      },
    },
  },
  plugins: [],
}
