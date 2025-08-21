import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand Palette
        brand: {
          primary: '#EC5D3A',
          'primary-600': '#EB5733',
          'primary-300': '#F3947D',
        },
        
        // Neutral Scale
        neutral: {
          50: '#F9FAFB',
          200: '#DBDBDB',
          700: '#6B7280',
        },
        
        // Text Colors
        text: {
          main: '#111827',
        },
        
        // Support Colors
        support: {
          navy: '#1B2A49',
          teal: '#3AAFA9',
          yellow: '#FFD166',
        },
        
        white: '#FFFFFF',
        
        // Semantic Aliases (for component compatibility)
        primary: {
          DEFAULT: '#EC5D3A',
          foreground: '#FFFFFF',
          600: '#EB5733',
          300: '#F3947D',
        },
        secondary: {
          DEFAULT: '#3AAFA9',
          foreground: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#FFD166',
          foreground: '#1B2A49',
        },
        background: '#F9FAFB',
        foreground: '#111827',
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#111827',
        },
        popover: {
          DEFAULT: '#FFFFFF',
          foreground: '#111827',
        },
        muted: {
          DEFAULT: '#F9FAFB',
          foreground: '#6B7280',
        },
        destructive: {
          DEFAULT: '#EC5D3A',
          foreground: '#FFFFFF',
        },
        border: '#DBDBDB',
        input: '#FFFFFF',
        ring: '#EC5D3A',
      },
      borderRadius: {
        lg: '0.75rem',
        md: '0.5rem',
        sm: '0.25rem',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 8px 0 rgba(229, 90, 60, 0.1)',
        'brand': '0 4px 14px 0 rgba(229, 90, 60, 0.2)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
    },
  },
  plugins: [],
}

export default config