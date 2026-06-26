/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // SLDS Brand Colors
        brand: {
          DEFAULT: '#0176d3',
          dark: '#014486',
          light: '#eef4ff',
          secondary: '#f28500',
        },
        // SLDS Semantic Colors
        slds: {
          'text-primary': '#001526',
          'text-secondary': '#444746',
          'text-placeholder': '#8e8f8e',
          success: '#2e844a',
          'success-dark': '#226b3a',
          warning: '#fe9339',
          error: '#ea001e',
          info: '#0176d3',
          border: '#d8d8d8',
          'border-light': '#ecebea',
          background: '#f3f3f3',
          surface: '#ffffff',
          inverse: '#032d47',
        },
        // Keep shadcn/ui variables mapped to SLDS
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', '"Fira Sans"', '"Droid Sans"', '"Helvetica Neue"', 'sans-serif'],
      },
      fontSize: {
        // SLDS font scale
        'slds-xxs': ['0.625rem', { lineHeight: '1.2' }],
        'slds-xs': ['0.75rem', { lineHeight: '1.5' }],
        'slds-sm': ['0.875rem', { lineHeight: '1.5' }],
        'slds-md': ['1rem', { lineHeight: '1.5' }],
        'slds-lg': ['1.25rem', { lineHeight: '1.2' }],
        'slds-xl': ['2rem', { lineHeight: '1.2' }],
        'slds-xxl': ['3.5rem', { lineHeight: '1.1' }],
      },
      spacing: {
        // SLDS 4px grid spacing tokens
        'slds-xxs': '4px',
        'slds-xs': '8px',
        'slds-sm': '12px',
        'slds-md': '16px',
        'slds-lg': '24px',
        'slds-xl': '32px',
        'slds-xxl': '48px',
        'slds-xxxl': '64px',
      },
      borderRadius: {
        'slds-sm': '4px',
        'slds-md': '8px',
        'slds-lg': '12px',
        'slds-pill': '9999px',
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        'slds-sm': '0 2px 4px rgba(0, 0, 0, 0.06)',
        'slds-md': '0 2px 8px rgba(0, 0, 0, 0.1)',
        'slds-lg': '0 4px 16px rgba(0, 0, 0, 0.12)',
        'slds-overlay': '0 8px 32px rgba(0, 0, 0, 0.16)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
