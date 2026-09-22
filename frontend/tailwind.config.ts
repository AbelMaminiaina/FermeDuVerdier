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
        // Couleur d'accent (boutons, liens, actifs) — reprise de la maquette ShopWise (#0d9488 = 600)
        prairie: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
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
        // Neutres du texte — maquette ShopWise : texte courant #5a6577 (600), titres #10243d (800)
        warm: {
          50: '#f5f7f9',
          100: '#eceff3',
          200: '#dde2e8',
          300: '#c3cad3',
          400: '#8e98a6',
          500: '#6f7a8a',
          600: '#5a6577',
          700: '#3a4a5f',
          800: '#10243d',
          900: '#0b1a2d',
        },
        // Fonds clairs — maquette ShopWise (sections « light-background » #f4f7f6)
        cream: {
          50: '#f4f7f6',
          100: '#edf1f0',
          200: '#e2e8e6',
          300: '#d3dbd9',
        },
      },
      fontFamily: {
        display: ['var(--font-quicksand)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-roboto)', 'system-ui', 'sans-serif'],
        nav: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'warm': '0 4px 6px -1px rgba(16, 36, 61, 0.1), 0 2px 4px -1px rgba(16, 36, 61, 0.06)',
        'warm-lg': '0 10px 15px -3px rgba(16, 36, 61, 0.1), 0 4px 6px -2px rgba(16, 36, 61, 0.05)',
        'prairie': '0 4px 6px -1px rgba(13, 148, 136, 0.15), 0 2px 4px -1px rgba(13, 148, 136, 0.1)',
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
