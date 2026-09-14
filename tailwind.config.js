/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Cosmetics palette — violet · fuchsia · pink · lilac with rose-gold accent.
        // (Token group kept as "wood" so existing utility classes recolor app-wide.)
        wood: {
          dark: '#3B0764', // deep violet — headings / sidebar top
          medium: '#9333C4', // purple-mauve (muted text, readable)
          warm: '#C026D3', // signature fuchsia (primary)
          light: '#E879F9', // soft pink-purple
          blonde: '#F5C2F1', // light blush lilac
          cream: '#FAEAFB', // lavender blush cream
          white: '#FDF6FE', // pearl lilac
        },
        gold: {
          DEFAULT: '#C9789A', // rose-gold accent
          light: '#F0B6D8',
        },
        sage: '#3F9E84', // fresh emerald — success / sale price / paid
        terracotta: '#E24A6A', // rose-red — danger / debt / alerts
        charcoal: '#2A1140', // near-black violet — body text
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        sans: ['Inter', 'Cairo', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        arabic: ['Cairo', 'sans-serif'],
      },
      backgroundImage: {
        'wood-sidebar': 'linear-gradient(180deg, #2E0A57 0%, #6D28D9 52%, #DB2777 100%)',
        'wood-header': 'linear-gradient(135deg, #7E22CE 0%, #DB2777 100%)',
        'wood-btn': 'linear-gradient(135deg, #9333EA 0%, #DB2777 100%)',
        'wood-bg': 'linear-gradient(135deg, #FDF6FE 0%, #FAEAFB 60%, #FCE7F3 100%)',
        'wood-card': 'linear-gradient(145deg, #FFFFFF 0%, #FDF6FE 100%)',
        'gold-shine': 'linear-gradient(135deg, #C9789A 0%, #F0B6D8 100%)',
        'rose-shine': 'linear-gradient(135deg, #9333EA 0%, #C026D3 50%, #DB2777 100%)',
      },
      boxShadow: {
        wood: '0 4px 20px rgba(59, 7, 100, 0.12)',
        'wood-lg': '0 12px 40px rgba(59, 7, 100, 0.20)',
        'wood-inset': 'inset 0 1px 0 rgba(255,255,255,0.6)',
        gold: '0 4px 16px rgba(201, 120, 154, 0.35)',
        rose: '0 6px 20px rgba(192, 38, 211, 0.32)',
      },
      borderColor: {
        woodborder: 'rgba(232, 121, 249, 0.25)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        bloom: {
          '0%': { transform: 'scale(0.96)', opacity: '0.7' },
          '50%': { transform: 'scale(1.02)', opacity: '1' },
          '100%': { transform: 'scale(0.96)', opacity: '0.7' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(226, 74, 106, 0.45)' },
          '50%': { boxShadow: '0 0 0 6px rgba(226, 74, 106, 0)' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      animation: {
        shimmer: 'shimmer 2.5s linear infinite',
        float: 'float 6s ease-in-out infinite',
        bloom: 'bloom 4s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'gradient-shift': 'gradientShift 8s ease infinite',
      },
    },
  },
  plugins: [],
}
