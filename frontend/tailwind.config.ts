import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Vert prairie - inspiré du logo (herbe, feuilles)
        prairie: {
          50: '#f4f9f0',
          100: '#e4f0d9',
          200: '#c9e2b3',
          300: '#a5cf82',
          400: '#7db94d',
          500: '#5b9a2d',
          600: '#4a7d24',
          700: '#3d6620',
          800: '#2f4f19',
          900: '#243d14',
        },
        // Doré/Jaune - inspiré du soleil et du blé du logo
        terre: {
          50: '#fefcf3',
          100: '#fdf6dc',
          200: '#fbedb8',
          300: '#f7df85',
          400: '#f2c94c',
          500: '#d4a82a',
          600: '#b8891f',
          700: '#96691a',
          800: '#7a5316',
          900: '#5c3e11',
        },
        // Marron chaud - inspiré de la clôture et du texte du logo
        warm: {
          50: '#faf8f5',
          100: '#f3efe8',
          200: '#e5ded2',
          300: '#d4c9b8',
          400: '#b5a48c',
          500: '#8b7355',
          600: '#6b5640',
          700: '#574636',
          800: '#3d312a',
          900: '#2a211c',
        },
        // Crème/Gris clair - fond du logo
        cream: {
          50: '#FAFAF8',
          100: '#F5F4F0',
          200: '#EDECE6',
          300: '#E0DED6',
        },
      },
      fontFamily: {
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'warm': '0 4px 6px -1px rgba(139, 115, 85, 0.15), 0 2px 4px -1px rgba(139, 115, 85, 0.1)',
        'warm-lg': '0 10px 15px -3px rgba(139, 115, 85, 0.15), 0 4px 6px -2px rgba(139, 115, 85, 0.08)',
        'prairie': '0 4px 6px -1px rgba(91, 154, 45, 0.15), 0 2px 4px -1px rgba(91, 154, 45, 0.1)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-pattern': "url('/images/farm/hero-pattern.svg')",
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
