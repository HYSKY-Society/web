import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        white: 'rgb(var(--color-white) / <alpha-value>)',
        hysky: {
          dark: '#04080F',
          navy: '#0B3D91',
          blue: '#1565C0',
          cyan: '#5d00f5',
          light: '#E8F4FD',
        },
      },
    },
  },
  plugins: [],
}

export default config
