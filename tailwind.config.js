/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Channels live in src/index.css :root so the palette has one source of truth.
        primary: 'oklch(var(--ink-lch) / <alpha-value>)',
        surface: 'oklch(var(--surface-lch) / <alpha-value>)',
      },
      fontFamily: {
        serif: ['"Fraunces"', 'serif'],
      },
    },
  },
  plugins: [],
}
