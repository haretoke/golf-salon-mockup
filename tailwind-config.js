// Golf Salon Admin - 共通Tailwind CSS設定
tailwind.config = {
  theme: {
    extend: {
      colors: {
        'primary': {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        'dark-green': '#1A3A1D',
        'primary-green': '#2C5530',
        'gray-light': '#f8fafc',
        'gray-medium': '#e5e7eb',
        'gray-dark': '#6b7280',
        'gold': '#D4AF37',
        'dark-gold': '#B8941F',
        'bronze': '#CD7F32',
        'off-white': '#FAFAFA',
        'dark-gray': '#1A1A1A',
      },
      backgroundColor: {
        'standard-bg': 'rgba(44, 85, 48, 0.1)',
        'gold-bg': 'rgba(212, 175, 55, 0.1)',
      },
      backgroundImage: {
        'green-gradient': 'linear-gradient(180deg, #1A3A1D 0%, #2C5530 100%)',
        'gold-gradient': 'linear-gradient(135deg, #FFD700 0%, #D4AF37 50%, #B8860B 100%)',
        'platinum-gradient': 'linear-gradient(135deg, #E2E8F0, #F1F5F9, #FFFFFF, #F1F5F9, #E2E8F0)',
        'platinum-gradient-dark': 'linear-gradient(135deg, #4A5568, #64748B, #94A3B8, #64748B, #4A5568)',
      },
      fontFamily: {
        'serif': ['Noto Serif JP', 'serif'],
        'sans': ['Noto Sans JP', 'sans-serif'],
      },
      boxShadow: {
        'sm': '0 2px 4px rgba(0,0,0,0.1)',
        'md': '0 4px 6px rgba(0,0,0,0.1)',
        'lg': '0 10px 15px rgba(0,0,0,0.1)',
      },
      borderRadius: {
        'sm': '4px',
        'md': '8px',
        'lg': '16px',
      },
      keyframes: {
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-in-left': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-out-right': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'slide-out-left': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' },
        },
      },
      animation: {
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'slide-in-left': 'slide-in-left 0.3s ease-out',
        'slide-out-right': 'slide-out-right 0.3s ease-out',
        'slide-out-left': 'slide-out-left 0.3s ease-out',
      },
    }
  }
}