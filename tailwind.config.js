const { hairlineWidth } = require('nativewind/theme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './features/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Figtree_500Medium'],
        'sans-regular': ['Figtree_400Regular'],
        'sans-medium': ['Figtree_500Medium'],
        'sans-semibold': ['Figtree_600SemiBold'],
        'sans-bold': ['Figtree_700Bold'],
        display: ['Fraunces_600SemiBold'],
        'display-medium': ['Fraunces_500Medium'],
        'display-bold': ['Fraunces_700Bold'],
        mono: ['IBMPlexMono_400Regular'],
        'mono-medium': ['IBMPlexMono_500Medium'],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        sea: {
          DEFAULT: 'hsl(var(--sea))',
          foreground: 'hsl(var(--sea-foreground))',
        },
        copper: 'hsl(var(--copper))',
        ink: 'hsl(var(--ink))',
        tape: {
          1: 'hsl(var(--tape-1))',
          2: 'hsl(var(--tape-2))',
          3: 'hsl(var(--tape-3))',
          4: 'hsl(var(--tape-4))',
          5: 'hsl(var(--tape-5))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      borderWidth: {
        hairline: hairlineWidth(),
      },
    },
  },
  future: {
    hoverOnlyWhenSupported: true,
  },
  plugins: [require('tailwindcss-animate')],
};
