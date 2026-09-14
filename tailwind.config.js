/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // --------------------------------------------------------------------
        // Supermarket retail palette — navy structure · blue action · green money.
        // Token group is still named "wood" so every existing utility class in the
        // app recolours from here; the semantics below are what matter:
        //
        //   wood-dark    navy    chrome: sidebar, headers, headings
        //   wood-medium  slate   secondary / muted body text
        //   wood-warm    blue    the primary brand action colour
        //   wood-light   slate   borders and hairlines
        //   wood-cream   slate   subtle surfaces, table stripes
        //   gold         amber   partial payment / warning
        //   sage         green   paid / success / income
        //   terracotta   red     unpaid / danger / debt
        //
        // Every text colour below clears WCAG AA (4.5:1) on a white surface.
        // --------------------------------------------------------------------
        wood: {
          dark: '#0F172A', // slate-900 — 16.7:1 on white
          medium: '#475569', // slate-600 — 7.4:1 on white
          warm: '#0369A1', // sky-700  — 5.6:1 on white (primary)
          light: '#94A3B8', // slate-400 — borders / hairlines
          blonde: '#CBD5E1', // slate-300 — muted text on navy
          cream: '#F1F5F9', // slate-100 — subtle surface
          white: '#F8FAFC', // slate-50
        },
        gold: {
          DEFAULT: '#B45309', // amber-700 — 5.0:1 on white (partial / warning)
          light: '#F59E0B', // amber-500 — accent only, never text on white
        },
        sage: '#15803D', // green-700 — 4.9:1 on white (paid / success)
        terracotta: '#DC2626', // red-600  — 4.8:1 on white (unpaid / danger)
        charcoal: '#0F172A', // body text
      },
      fontFamily: {
        // Retail dashboards read better in one clean grotesk than in a display
        // serif; the mono face carries tabular figures for money columns.
        display: ['Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'Cairo', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
        arabic: ['Cairo', 'sans-serif'],
      },
      backgroundImage: {
        'wood-sidebar': 'linear-gradient(180deg, #0F172A 0%, #14243D 55%, #0C4A6E 100%)',
        'wood-header': 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
        'wood-btn': 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
        'wood-bg': 'linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 100%)',
        'wood-card': 'linear-gradient(145deg, #FFFFFF 0%, #F8FAFC 100%)',
        'gold-shine': 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)',
        'rose-shine': 'linear-gradient(135deg, #0369A1 0%, #0284C7 55%, #0EA5E9 100%)',
      },
      boxShadow: {
        // One elevation scale, navy-tinted so shadows sit in the palette.
        wood: '0 1px 2px rgba(15, 23, 42, 0.06), 0 4px 12px rgba(15, 23, 42, 0.06)',
        'wood-lg': '0 8px 24px rgba(15, 23, 42, 0.12), 0 2px 6px rgba(15, 23, 42, 0.06)',
        'wood-inset': 'inset 0 1px 0 rgba(255, 255, 255, 0.7)',
        gold: '0 2px 10px rgba(180, 83, 9, 0.28)',
        rose: '0 4px 14px rgba(3, 105, 161, 0.26)',
      },
      borderColor: {
        woodborder: 'rgba(148, 163, 184, 0.35)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        // Retained under their original names so existing classes keep working,
        // but retuned to be calm enough for an interface people stare at all day.
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        bloom: {
          '0%, 100%': { opacity: '0.85' },
          '50%': { opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(220, 38, 38, 0.35)' },
          '50%': { boxShadow: '0 0 0 5px rgba(220, 38, 38, 0)' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'none' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.8s linear infinite',
        float: 'float 7s ease-in-out infinite',
        bloom: 'bloom 4s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2.2s ease-out infinite',
        'gradient-shift': 'gradientShift 10s ease infinite',
        'fade-up': 'fadeUp 240ms cubic-bezier(0.22, 1, 0.36, 1) both',
      },
      transitionTimingFunction: {
        // Shared easing tokens: ease-out for entrances, a soft spring for emphasis.
        entrance: 'cubic-bezier(0.22, 1, 0.36, 1)',
        exit: 'cubic-bezier(0.4, 0, 1, 1)',
      },
    },
  },
  plugins: [],
}
