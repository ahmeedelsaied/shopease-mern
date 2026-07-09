/**
 * ShopEase Design System
 * Extracted from Stitch UI — /src/design/stitch/
 * DO NOT modify tokens without updating Stitch source.
 */

export const colors = {
  surface: '#fcf8fb',
  'surface-dim': '#dcd9dc',
  'surface-bright': '#fcf8fb',
  'surface-container-lowest': '#ffffff',
  'surface-container-low': '#f6f3f5',
  'surface-container': '#f0edef',
  'surface-container-high': '#eae7ea',
  'surface-container-highest': '#e4e2e4',
  'on-surface': '#1b1b1d',
  'on-surface-variant': '#4c4546',
  'inverse-surface': '#303032',
  'inverse-on-surface': '#f3f0f2',
  outline: '#7e7576',
  'outline-variant': '#cfc4c5',
  'surface-tint': '#5e5e5e',
  primary: '#0f172a',
  'on-primary': '#ffffff',
  'primary-container': '#1e293b',
  'on-primary-container': '#cbd5e1',
  'inverse-primary': '#c6c6c6',
  secondary: '#2563eb',
  'on-secondary': '#ffffff',
  'secondary-container': '#dbeafe',
  'on-secondary-container': '#1d4ed8',
  tertiary: '#111827',
  'on-tertiary': '#ffffff',
  'tertiary-container': '#1f2937',
  'on-tertiary-container': '#d1d5db',
  error: '#b42318',
  'on-error': '#ffffff',
  'error-container': '#fee4e2',
  'on-error-container': '#b42318',
  'primary-fixed': '#e2e2e2',
  'primary-fixed-dim': '#c6c6c6',
  'on-primary-fixed': '#1b1b1b',
  'on-primary-fixed-variant': '#474747',
  'secondary-fixed': '#d7e3ff',
  'secondary-fixed-dim': '#aac7ff',
  'on-secondary-fixed': '#001b3e',
  'on-secondary-fixed-variant': '#00458e',
  'tertiary-fixed': '#e2e2e4',
  'tertiary-fixed-dim': '#c6c6c8',
  'on-tertiary-fixed': '#1a1c1d',
  'on-tertiary-fixed-variant': '#454749',
  background: '#fcf8fb',
  'on-background': '#1b1b1d',
  'surface-variant': '#e4e2e4',
  'system-gray': '#f5f5f7',
};

export const typography = {
  'display-lg': {
    fontFamily: 'Inter, sans-serif',
    fontSize: '64px',
    fontWeight: '600',
    lineHeight: '72px',
    letterSpacing: '-0.02em',
  },
  'display-lg-mobile': {
    fontFamily: 'Inter, sans-serif',
    fontSize: '40px',
    fontWeight: '600',
    lineHeight: '48px',
    letterSpacing: '-0.02em',
  },
  'headline-lg': {
    fontFamily: 'Inter, sans-serif',
    fontSize: '32px',
    fontWeight: '600',
    lineHeight: '40px',
    letterSpacing: '-0.01em',
  },
  'headline-md': {
    fontFamily: 'Inter, sans-serif',
    fontSize: '24px',
    fontWeight: '500',
    lineHeight: '32px',
    letterSpacing: '-0.01em',
  },
  'body-lg': {
    fontFamily: 'Inter, sans-serif',
    fontSize: '18px',
    fontWeight: '400',
    lineHeight: '28px',
    letterSpacing: '0',
  },
  'body-md': {
    fontFamily: 'Inter, sans-serif',
    fontSize: '16px',
    fontWeight: '400',
    lineHeight: '24px',
    letterSpacing: '0',
  },
  'label-md': {
    fontFamily: 'Inter, sans-serif',
    fontSize: '14px',
    fontWeight: '500',
    lineHeight: '20px',
    letterSpacing: '0.02em',
  },
  'label-sm': {
    fontFamily: 'Inter, sans-serif',
    fontSize: '12px',
    fontWeight: '600',
    lineHeight: '16px',
    letterSpacing: '0.05em',
  },
};

export const spacing = {
  unit: '8px',
  'container-max': '1440px',
  gutter: '24px',
  'margin-desktop': '64px',
  'margin-mobile': '20px',
  'stack-sm': '8px',
  'stack-md': '16px',
  'stack-lg': '32px',
  'stack-xl': '64px',
};

export const borderRadius = {
  sm: '0.5rem',
  DEFAULT: '0.75rem',
  md: '1rem',
  lg: '1.25rem',
  xl: '1.5rem',
  '2xl': '1.75rem',
  '3xl': '2rem',
  full: '9999px',
};

export const shadows = {
  invisible: '0 20px 40px rgba(15, 23, 42, 0.06)',
  soft: '0 16px 30px rgba(15, 23, 42, 0.06)',
  lg: '0 24px 60px rgba(15, 23, 42, 0.10)',
  xl: '0 30px 80px rgba(15, 23, 42, 0.14)',
};

export const elevation = {
  glass: {
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(20px)',
  },
  nav: {
    background: 'rgba(252, 248, 251, 0.8)',
    backdropFilter: 'blur(24px)',
  },
};

export const transitions = {
  default: 'all 0.2s ease',
  press: 'transform 0.2s ease',
  image: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
  fadeUp: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
  toast: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
};

export const components = {
  button: {
    base: 'inline-flex items-center justify-center gap-2 rounded-full border border-transparent text-label-md font-label-md transition-all duration-200 ease-out active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/10',
    primary: 'bg-primary text-on-primary shadow-sm hover:bg-primary/90',
    primarySolid: 'bg-primary text-on-primary shadow-sm hover:bg-primary/90',
    secondary: 'border border-outline-variant bg-surface-container-low/70 text-primary hover:bg-surface-container-low hover:shadow-sm',
    ghost: 'bg-transparent text-primary hover:bg-surface-container-low',
    chip: 'px-5 py-2 rounded-full text-label-sm font-label-sm whitespace-nowrap transition-transform active:scale-[0.98]',
    chipActive: 'bg-primary text-on-primary shadow-sm',
    chipInactive: 'bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors',
    icon: 'inline-flex items-center justify-center rounded-full p-2 text-primary transition-all duration-200 hover:bg-surface-container-low hover:shadow-sm active:scale-[0.98]',
    sizes: {
      default: 'px-5 py-3 min-h-11',
      compact: 'px-4 py-2.5 min-h-10',
      bag: 'px-6 py-4 min-h-12',
      checkout: 'px-6 py-4 min-h-12 uppercase tracking-[0.2em]',
      sm: 'px-3 py-2 min-h-9 text-sm',
    },
  },
  input: {
    floating: 'peer w-full rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md font-body-md text-on-surface shadow-sm outline-none transition-all duration-200 placeholder:text-transparent focus:border-secondary focus:ring-4 focus:ring-secondary/10',
    floatingLabel: 'absolute left-4 top-3 text-label-sm font-label-sm text-on-surface-variant transition-all peer-placeholder-shown:text-body-md peer-placeholder-shown:top-3 peer-focus:-top-4 peer-focus:text-label-sm peer-focus:text-secondary cursor-text',
    underline: 'w-full rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md font-body-md text-on-surface shadow-sm outline-none transition-all duration-200 placeholder:text-outline-variant focus:border-secondary focus:ring-4 focus:ring-secondary/10',
    label: 'text-label-sm font-label-sm text-on-surface-variant',
  },
  card: {
    product: 'overflow-hidden rounded-[1.75rem] border border-outline-variant/30 bg-surface-container-lowest shadow-soft transition-all duration-200 hover:-translate-y-1 hover:shadow-lg',
    panel: 'rounded-[1.75rem] border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-soft',
    summary: 'rounded-[1.75rem] border border-outline-variant/30 bg-surface-container-low p-8 shadow-soft',
    login: 'rounded-[2rem] border border-outline-variant/40 bg-surface-container-lowest p-8 shadow-lg backdrop-blur-xl',
    featured: 'overflow-hidden rounded-[1.75rem] border border-outline-variant/30 bg-surface-container-lowest shadow-soft',
  },
  modal: {
    overlay: 'fixed inset-0 z-[150] bg-inverse-surface/20 backdrop-blur-sm',
    panel: 'rounded-[2rem] border border-outline-variant/40 bg-surface-container-lowest p-6 shadow-xl backdrop-blur-2xl',
  },
  loader: {
    skeleton: 'bg-surface-container-high animate-pulse',
    skeletonBlock: 'bg-surface-container-high rounded-[1.5rem] animate-pulse',
  },
};

const typographyFontSize = Object.fromEntries(
  Object.entries(typography).map(([key, value]) => [
    key,
    [
      value.fontSize,
      {
        lineHeight: value.lineHeight,
        letterSpacing: value.letterSpacing,
        fontWeight: value.fontWeight,
      },
    ],
  ])
);

const typographyFontFamily = Object.fromEntries(
  Object.keys(typography).map((key) => [key, ['Inter', 'sans-serif']])
);

export const tailwindTheme = {
  colors,
  borderRadius,
  spacing,
  fontFamily: typographyFontFamily,
  fontSize: typographyFontSize,
  boxShadow: {
    invisible: shadows.invisible,
    soft: shadows.soft,
    lg: shadows.lg,
  },
  maxWidth: {
    'container-max': spacing['container-max'],
  },
};

export const cn = (...classes) => classes.filter(Boolean).join(' ');

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  elevation,
  transitions,
  components,
  tailwindTheme,
  cn,
};
