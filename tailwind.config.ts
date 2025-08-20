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
        // Write on English Brand Colors
        primary: {
          DEFAULT: '#E55A3C',
          light: '#F47B5C',
          dark: '#C4472B',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#2E5A8A',
          light: '#5B9BD5',
          foreground: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#7BA05B',
          light: '#A8C686',
          foreground: '#FFFFFF',
        },
        
        // Modern Minimalist Neutrals
        white: '#FFFFFF',
        warm: {
          50: '#FDF7F2',
        },
        gray: {
          50: '#FAFAFA',
          100: '#F3F4F6',
          400: '#9CA3AF',
          600: '#6B7280',
          800: '#374151',
        },
        
        // Semantic Colors
        background: '#FFFFFF',
        foreground: '#374151',
        border: '#F3F4F6',
        input: '#F3F4F6',
        ring: '#E55A3C',
        
        // Status Colors
        success: '#7BA05B',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#5B9BD5',
        
        // Muted variants
        muted: {
          DEFAULT: '#FAFAFA',
          foreground: '#6B7280',
        },
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