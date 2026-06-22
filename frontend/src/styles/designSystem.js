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
  primary: '#000000',
  'on-primary': '#ffffff',
  'primary-container': '#1b1b1b',
  'on-primary-container': '#848484',
  'inverse-primary': '#c6c6c6',
  secondary: '#005cba',
  'on-secondary': '#ffffff',
  'secondary-container': '#5095fe',
  'on-secondary-container': '#002d61',
  tertiary: '#000000',
  'on-tertiary': '#ffffff',
  'tertiary-container': '#1a1c1d',
  'on-tertiary-container': '#838486',
  error: '#ba1a1a',
  'on-error': '#ffffff',
  'error-container': '#ffdad6',
  'on-error-container': '#93000a',
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
  sm: '0.25rem',
  DEFAULT: '0.5rem',
  md: '0.75rem',
  lg: '1rem',
  xl: '1.5rem',
  '2xl': '1rem',
  full: '9999px',
};

export const shadows = {
  invisible: '0 20px 40px rgba(0, 0, 0, 0.06)',
  soft: '0 20px 40px rgba(0, 0, 0, 0.04)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
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
    base: 'inline-flex items-center justify-center text-label-md font-label-md transition-all duration-200 active:scale-[0.98]',
    primary:
      'bg-primary text-on-primary hover:opacity-80 active:scale-[0.98]',
    primarySolid:
      'bg-primary text-on-primary hover:opacity-90 active:scale-[0.98]',
    secondary:
      'border border-outline bg-transparent text-primary hover:bg-surface-container-low active:scale-[0.98]',
    ghost:
      'bg-transparent text-primary border border-surface-variant hover:bg-surface-container-low active:scale-[0.98]',
    chip:
      'px-5 py-2 rounded-full text-label-sm font-label-sm whitespace-nowrap transition-transform active:scale-[0.98]',
    chipActive: 'bg-primary text-on-primary',
    chipInactive:
      'bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors',
    icon: 'hover:opacity-70 transition-opacity active:scale-[0.98]',
    sizes: {
      default: 'px-8 py-3 rounded-full',
      compact: 'py-3 px-6 rounded',
      bag: 'py-4 px-6 rounded-full',
      checkout: 'py-4 px-6 rounded-lg uppercase tracking-widest',
    },
  },
  input: {
    floating:
      'peer w-full bg-transparent border-0 border-b border-surface-variant focus:border-secondary focus:ring-0 px-0 py-unit text-body-lg font-body-lg text-on-surface placeholder-transparent transition-colors duration-200',
    floatingLabel:
      'absolute left-0 -top-4 text-label-sm font-label-sm text-on-surface-variant transition-all peer-placeholder-shown:text-body-lg peer-placeholder-shown:top-2 peer-focus:-top-4 peer-focus:text-label-sm peer-focus:text-secondary cursor-text',
    underline:
      'w-full bg-transparent border-0 border-b border-outline-variant focus:border-secondary focus:ring-0 pb-unit text-body-md font-body-md text-on-surface placeholder-outline-variant transition-colors duration-200 outline-none',
    label:
      'text-label-sm font-label-sm text-on-surface-variant',
  },
  card: {
    product:
      'bg-system-gray rounded-xl overflow-hidden',
    panel:
      'bg-surface-container-low p-gutter rounded-lg',
    summary:
      'bg-surface-container-low rounded-xl p-8 border border-outline-variant/30',
    login:
      'bg-surface-container-lowest rounded-xl p-stack-lg border border-surface-variant backdrop-blur-2xl shadow-invisible',
    featured:
      'bg-surface-container overflow-hidden rounded-2xl',
  },
  modal: {
    overlay: 'fixed inset-0 z-[150] bg-inverse-surface/20 backdrop-blur-sm',
    panel:
      'bg-surface-container-lowest rounded-xl p-stack-lg border border-surface-variant backdrop-blur-2xl shadow-invisible',
  },
  toast: {
    pill: 'bg-white/80 backdrop-blur-md border border-outline-variant/30 px-6 py-3 rounded-full shadow-lg text-body-md',
    status:
      'bg-surface-container-highest text-on-surface px-gutter py-unit rounded shadow-lg flex items-center gap-unit text-label-md font-label-md',
  },
  loader: {
    skeleton: 'bg-surface-container-high animate-pulse',
    skeletonBlock: 'bg-surface-container-high rounded-xl animate-pulse',
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
