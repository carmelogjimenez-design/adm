import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        adm: {
          blue: '#0F5EFF',
          green: '#39E6A5',
        },
      },
    },
  },
  plugins: [],
} satisfies Config
