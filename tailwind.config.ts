import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";
import typography from "@tailwindcss/typography";

/**
 * Brand Color Palette Overrides
 * 
 * Instead of editing 50+ component files, we remap Tailwind's default
 * purple, violet, indigo, slate, and gray palettes to brand-derived colors.
 * 
 * Brand: #FF00BF (magenta), #000000 (black), #444343 (dark gray),
 *        #A2A1A3 (light gray), #6683A0 (blue-gray), #FFFFFF (white)
 * 
 * purple → magenta-derived shades
 * violet → magenta-derived shades (slightly shifted)
 * indigo → blue-gray-derived shades
 * slate 800-950 → brand dark backgrounds
 * gray 800-950 → brand dark backgrounds
 */

// Magenta-derived palette (replaces purple & violet)
const magentaShades = {
  50: '#fdf0fa',
  100: '#fce4f7',
  200: '#fac8ef',
  300: '#f79fe2',
  400: '#f06dce',
  500: '#e63db3',
  600: '#cc1d93',
  700: '#a81577',
  800: '#8a1461',
  900: '#721453',
  950: '#4a0534',
};

// Blue-gray-derived palette (replaces indigo)
const blueGrayShades = {
  50: '#f0f4f8',
  100: '#dce5ed',
  200: '#bdcfdd',
  300: '#92b1c7',
  400: '#6683A0',
  500: '#526d87',
  600: '#455a72',
  700: '#3c4d5f',
  800: '#354250',
  900: '#303945',
  950: '#1e252d',
};

// Slate-magenta palette (replaces violet - slightly different from purple)
const violetShades = {
  50: '#fdf2fa',
  100: '#fce7f6',
  200: '#fbcfee',
  300: '#f9a8df',
  400: '#f472c9',
  500: '#e946ad',
  600: '#d6268d',
  700: '#b91a72',
  800: '#98185e',
  900: '#7f1a51',
  950: '#50072e',
};

/**
 * Override slate dark shades so bg-slate-900, bg-slate-800 etc.
 * render brand-appropriate dark backgrounds instead of Tailwind defaults.
 * Lighter shades (50-600) are kept close to defaults for text readability.
 */
const slateOverrides = {
  50: '#f8fafc',
  100: '#f1f5f9',
  200: '#e2e8f0',
  300: '#cbd5e1',
  400: '#94a3b8',
  500: '#A2A1A3',   // brand light-gray
  600: '#6683A0',   // brand blue-gray
  700: '#444343',   // brand dark-gray
  800: '#1a1a1a',   // brand-appropriate dark card bg
  900: '#111111',   // brand-appropriate near-black
  950: '#080808',   // deepest dark
};

const grayOverrides = {
  50: '#f9fafb',
  100: '#f3f4f6',
  200: '#e5e7eb',
  300: '#d1d5db',
  400: '#A2A1A3',   // brand light-gray
  500: '#A2A1A3',   // brand light-gray
  600: '#6683A0',   // brand blue-gray
  700: '#444343',   // brand dark-gray
  800: '#1a1a1a',   // brand-appropriate dark card bg
  900: '#111111',   // brand-appropriate near-black
  950: '#080808',   // deepest dark
};

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      colors: {
        brand: {
          black: '#000000',
          magenta: '#FF00BF',
          'blue-gray': '#6683A0',
          'dark-gray': '#444343',
          'light-gray': '#A2A1A3',
          white: '#FFFFFF',
        },
        // Override purple → magenta-derived
        purple: magentaShades,
        // Override violet → violet-magenta-derived
        violet: violetShades,
        // Override indigo → blue-gray-derived
        indigo: blueGrayShades,
        // Override slate → brand dark backgrounds
        slate: slateOverrides,
        // Override gray → brand dark backgrounds
        gray: grayOverrides,

        
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        lg: 'calc(var(--radius) + 2px)',
        md: 'var(--radius)',
        sm: 'calc(var(--radius) - 2px)'
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-in': {
          from: { transform: 'translateY(10px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-in': 'slide-in 0.3s ease-out',
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: '#A2A1A3',
            a: {
              color: '#FF00BF',
              '&:hover': { color: '#FF00BF' },
            },
            h1: { color: '#FFFFFF' },
            h2: { color: '#FFFFFF' },
            h3: { color: '#FFFFFF' },
            h4: { color: '#FFFFFF' },
          },
        },
      },
    }
  },
  plugins: [
    animate,
    typography,
  ],
} satisfies Config;
