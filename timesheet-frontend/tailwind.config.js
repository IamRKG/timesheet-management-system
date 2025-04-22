export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    plugins: [
      require("@tailwindcss/forms"),
      require("@tailwindcss/typography"),
      require("@tailwindcss/aspect-ratio"),
      require("tailwindcss-animate"),
    ],
    theme: {
        extend: {
          colors: {
            navy: {
              50: '#f0f4f8',
              100: '#d9e2ec',
              200: '#bcccdc',
              300: '#9fb3c8',
              400: '#829ab1',
              500: '#627d98',
              600: '#486581',
              700: '#334e68',
              800: '#243b53',
              900: '#102a43',
            },
            accent: {
              50: '#eef2ff',
              100: '#e0e7ff',
              200: '#c7d2fe',
              300: '#a5b4fc',
              400: '#818cf8',
              500: '#6366f1',
              600: '#4f46e5',
              700: '#4338ca',
              800: '#3730a3',
              900: '#312e81',
            },
            success: {
              50: '#ecfdf5',
              500: '#10b981',
              600: '#059669',
            },
            warning: {
              50: '#fffbeb',
              500: '#f59e0b',
              600: '#d97706',
            },
            danger: {
              50: '#fef2f2',
              500: '#ef4444',
              600: '#dc2626',
            }
          },
          borderRadius: {
            'lg': '0.625rem',
          },
          boxShadow: {
            'card': '0 2px 8px rgba(0, 0, 0, 0.08)',
            'dropdown': '0 4px 12px rgba(0, 0, 0, 0.1)',
          },
          animation: {
            'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          },
        },
      }
  }