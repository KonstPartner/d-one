import { Theme } from '@emotion/react';

const base = {
  border: {
    width: { none: 0, sm: 1, md: 2 },
  },

  control: {
    height: { sm: 32, md: 44, lg: 52 },
  },

  weight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    heavy: '800',
    black: '900',
  },

  lineHeight: {
    xs: 14,
    sm: 18,
    md: 20,
    lg: 24,
    xl: 28,
    '2xl': 34,
    '3xl': 40,
  },

  spacing: {
    '3xs': 1,
    xxs: 2,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    '4xl': 40,
    '5xl': 48,
  },

  radius: { xs: 4, sm: 6, md: 12, lg: 20, xl: 24, full: 999 },

  size: {
    xs: 10,
    sm: 12,
    base: 14,
    md: 16,
    lg: 22,
    xl: 28,
    '2xl': 34,
    '3xl': 36,
  },
};

const whiteAlpha = {
  sm: 'rgba(255, 255, 255, 0.12)',
  md: 'rgba(255, 255, 255, 0.28)',
  lg: 'rgba(255, 255, 255, 0.66)',
  xl: 'rgba(255, 255, 255, 0.82)',
};

const blackAlpha = {
  sm: 'rgba(0, 0, 0, 0.08)',
  md: 'rgba(0, 0, 0, 0.16)',
  lg: 'rgba(0, 0, 0, 0.32)',
  xl: 'rgba(0, 0, 0, 0.5)',
};

export const lightTheme: Theme = {
  mode: 'light',
  colors: {
    bg: '#F9FAFB',
    text: '#111827',
    card: '#FFFFFF',
    primary: '#EA580C',
    border: '#E5E7EB',
    muted: '#6B7280',
    input: '#F3F4F6',
    success: '#16A34A',
    warning: '#EAB308',
    danger: '#DC2626',
    white: '#FFFFFF',
    black: '#000000',

    shades: {
      primary: {
        sm: '#FFF7ED',
        md: '#FFEDD5',
        lg: '#FED7AA',
        xl: '#EA580C',
        text: '#9A3412',
        mutedText: 'rgba(154, 52, 18, 0.72)',
      },
      success: {
        sm: '#ECFDF5',
        md: '#D1FAE5',
        lg: '#A7F3D0',
        xl: '#047857',
        text: '#065F46',
        mutedText: 'rgba(6, 95, 70, 0.72)',
      },
      warning: {
        sm: '#FEFCE8',
        md: '#FEF3C7',
        lg: '#FDE68A',
        text: '#854D0E',
        mutedText: 'rgba(133, 77, 14, 0.72)',
      },
      danger: {
        sm: '#FEF2F2',
        md: '#FEE2E2',
        lg: '#FECACA',
        text: '#991B1B',
        mutedText: 'rgba(153, 27, 27, 0.72)',
      },
    },

    whiteAlpha,
    blackAlpha,
  },
  ...base,
};

export const darkTheme: Theme = {
  mode: 'dark',
  colors: {
    bg: '#0A092B',
    text: '#F5F7FA',
    card: '#191932',
    primary: '#EA580C',
    border: '#303854',
    muted: '#959BB2',
    input: '#20203E',
    success: '#16A34A',
    warning: '#EAB308',
    danger: '#DC2626',
    white: '#FFFFFF',
    black: '#000000',

    shades: {
      primary: {
        sm: 'rgba(234, 88, 12, 0.14)',
        md: 'rgba(234, 88, 12, 0.22)',
        lg: 'rgba(234, 88, 12, 0.34)',
        xl: '#F97316',
        text: '#FDBA74',
        mutedText: 'rgba(253, 186, 116, 0.72)',
      },

      success: {
        sm: 'rgba(22, 163, 74, 0.14)',
        md: 'rgba(22, 163, 74, 0.22)',
        lg: 'rgba(22, 163, 74, 0.34)',
        xl: '#22C55E',
        text: '#86EFAC',
        mutedText: 'rgba(134, 239, 172, 0.72)',
      },

      warning: {
        sm: 'rgba(234, 179, 8, 0.14)',
        md: 'rgba(234, 179, 8, 0.22)',
        lg: 'rgba(234, 179, 8, 0.34)',
        text: '#FDE68A',
        mutedText: 'rgba(253, 230, 138, 0.72)',
      },

      danger: {
        sm: 'rgba(220, 38, 38, 0.14)',
        md: 'rgba(220, 38, 38, 0.22)',
        lg: 'rgba(220, 38, 38, 0.34)',
        text: '#FCA5A5',
        mutedText: 'rgba(252, 165, 165, 0.72)',
      },
    },

    whiteAlpha,
    blackAlpha,
  },
  ...base,
};
