/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/app/**/*.{js,ts,jsx,tsx}', './src/components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        /**
         * PALETA OFICIAL PHAROS
         * Sistema enxuto, acessível (WCAG 2.1 AA/AAA)
         * Proporção 70/20/10 (neutros/primária/acento)
         */
        
        // Primárias
        pharos: {
          // Blue - Ação primária, links, CTAs
          blue: {
            500: '#054ADA', // AAA em white (7.00:1)
            600: '#043BAE', // hover
            700: '#032C83', // active
          },
          
          // Navy - Header, footer, títulos
          navy: {
            900: '#192233', // AAA em white (15.93:1)
          },
          
          // Neutros frios (70% do uso)
          slate: {
            700: '#2C3444', // Texto principal - AAA em white (12.49:1)
            500: '#585E6B', // Texto secundário - AA em white (6.50:1)
            300: '#ADB4C0', // Bordas/divisores APENAS (não texto)
          },
          
          // Base
          base: {
            white: '#FFFFFF',
            off: '#F7F9FC', // Fundo premium
          },
          
          // Acento metálico (10% - micro-detalhes)
          gold: {
            500: '#C89C4D', // Ícones, filetes (não texto longo)
          },
          
          // Feedback
          success: '#2FBF71',
          error: '#C53A3A',
          warning: '#F5A524',
        },
        
        // Aliases para compatibilidade (migrar gradualmente)
        primary: {
          DEFAULT: '#054ADA',
          50: '#E6EFFC',
          100: '#CCDFF9',
          200: '#99BFF3',
          300: '#669FED',
          400: '#337FE7',
          500: '#054ADA',
          600: '#043BAE',
          700: '#032C83',
          800: '#021D57',
          900: '#010E2C',
        },
        
        navy: {
          DEFAULT: '#192233',
          900: '#192233',
        },
        
        // Aliases para compatibilidade (secondary → slate/navy)
        secondary: {
          DEFAULT: '#192233',
          50: '#F5F7FA',
          100: '#E8ECF2',
          200: '#ADB4C0',
          300: '#ADB4C0',
          400: '#8E99AB',
          500: '#585E6B',
          600: '#585E6B',
          700: '#2C3444',
          800: '#192233',
          900: '#192233',
        },
      },
      
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        serif: ['var(--font-inter)', 'Inter', 'sans-serif'],
        heading: ['var(--font-inter)', 'Inter', 'sans-serif'],
      },
      
      fontSize: {
        // Hierarquia Pharos
        'xs': ['13px', { lineHeight: '1.5', fontWeight: '400' }],
        'sm': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        'base': ['16px', { lineHeight: '1.5', fontWeight: '400' }],
        'lg': ['18px', { lineHeight: '1.5', fontWeight: '400' }],
        'xl': ['20px', { lineHeight: '1.4', fontWeight: '500' }],
        '2xl': ['24px', { lineHeight: '1.35', fontWeight: '600' }],
        '3xl': ['28px', { lineHeight: '1.3', fontWeight: '600' }],
        '4xl': ['32px', { lineHeight: '1.25', fontWeight: '700' }],
        '5xl': ['36px', { lineHeight: '1.2', fontWeight: '700' }],
        
        // Headings semânticos
        'h1': ['3.5rem', { lineHeight: '1.2', fontWeight: '700' }],
        'h2': ['2.25rem', { lineHeight: '1.25', fontWeight: '700' }], // 36px
        'h3': ['1.75rem', { lineHeight: '1.3', fontWeight: '600' }],  // 28px
        'h4': ['1.5rem', { lineHeight: '1.35', fontWeight: '600' }],  // 24px
        'h5': ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }],  // 20px
        'h6': ['1.125rem', { lineHeight: '1.45', fontWeight: '600' }], // 18px
        
        // Body
        'body': ['1rem', { lineHeight: '1.5', fontWeight: '400' }],
        'body-lg': ['1.125rem', { lineHeight: '1.5', fontWeight: '400' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
        'caption': ['0.8125rem', { lineHeight: '1.35', fontWeight: '400' }], // 13px
      },
      
      spacing: {
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        5: '20px',
        6: '24px',
        8: '32px',
        10: '40px',
        12: '48px',
        16: '64px',
        20: '80px',
        24: '96px',
        32: '128px',
      },
      
      maxWidth: {
        container: '1280px',
      },
      
      borderRadius: {
        'sm': '8px',
        'md': '12px',
        'lg': '14px',
        'xl': '20px',
        '2xl': '24px',
        'full': '9999px',
      },
      
      boxShadow: {
        'sm': '0 2px 8px rgba(25, 34, 51, 0.04)',
        'card': '0 6px 20px rgba(25, 34, 51, 0.08)',
        'card-hover': '0 10px 28px rgba(25, 34, 51, 0.12)',
        'lg': '0 10px 28px rgba(25, 34, 51, 0.12)',
        'xl': '0 16px 40px rgba(25, 34, 51, 0.16)',
        'dropdown': '0 2px 8px rgba(25, 34, 51, 0.1)',
      },
      
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      
      zIndex: {
        'base': '0',
        'header': '200',
        'sticky-filter': '400',
        'dropdown': '700',
        'popover': '750',
        'sheet': '900',
        'toast': '1000',
      },
      
      transitionDuration: {
        'fast': '120ms',
        'base': '200ms',
        'slow': '300ms',
      },
      
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      
      // Gradientes personalizados (via plugin abaixo)
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #054ADA 0%, #192233 60%)',
      },
      
      // Animações
      keyframes: {
        'slide-in': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'spin': {
          'to': { transform: 'rotate(360deg)' },
        },
        'gentle-pulse': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.02)' },
        },
      },
      animation: {
        'slide-in': 'slide-in 0.3s ease-out',
        'spin': 'spin 1s linear infinite',
        'gentle-pulse': 'gentle-pulse 2s ease-in-out infinite',
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar'),
    require('@tailwindcss/aspect-ratio'),
    
    // Plugin para altura mínima de toque (44px)
    function ({ addUtilities }) {
      addUtilities({
        '.touch-target': {
          minHeight: '44px',
          minWidth: '44px',
        },
      });
    },
  ],
};
