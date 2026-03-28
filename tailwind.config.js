module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { jakarta: ['Plus Jakarta Sans', 'sans-serif'] },
      colors: {
        forest: { DEFAULT: '#0D2B1E', light: '#1A4A35' },
        emerald: { DEFAULT: '#10B981', light: '#D1FAE5', mid: '#A7F3D0' },
        coral: { DEFAULT: '#FF6B6B', light: '#FFF0F0' },
        mint: { DEFAULT: '#F7FDF9', border: '#E0F2E9' },
      },
    },
  },
  plugins: [],
};
