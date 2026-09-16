/** @type {import('nativewind').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./registry/nativewind/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/dist/tailwind")],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#0f76e0',
        secondary: '#f2f5f9',
        accent: '#ffb300',
        border: '#e5e7eb',
        input: '#e5e7eb',
        ring: '#3b82f6',
        destructive: '#ef4444',
        background: '#ffffff',
        foreground: '#111827',
        card: '#ffffff',
        'card-foreground': '#111827',
        muted: '#f3f4f6',
        'muted-foreground': '#6b7280',
        'accent-foreground': '#111827',
      },
    },
  },
  plugins: [],
};
