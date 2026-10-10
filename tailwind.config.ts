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
        'accent-cyan': 'rgb(var(--accent-cyan) / <alpha-value>)',
        'accent-teal': 'rgb(var(--accent-teal) / <alpha-value>)',
        'accent-aqua': 'rgb(var(--accent-aqua) / <alpha-value>)',
        'accent-soft': 'rgb(var(--accent-soft) / <alpha-value>)',
        'accent-pale': 'rgb(var(--accent-pale) / <alpha-value>)',
        'accent-hover': 'rgb(var(--accent-hover) / <alpha-value>)',
        'accent-deep': 'rgb(var(--accent-deep) / <alpha-value>)',
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
