/**
 * ShopEase Design System
 *
 * A warm editorial commerce system: deep pine ink, oat paper, and a restrained
 * terracotta accent. The tokens are consumed by the existing Tailwind config
 * and shared primitives so every route moves together without changing logic.
 */

export const colors = {
  surface: '#f5f1ea',
  'surface-dim': '#ded8cf',
  'surface-bright': '#fffdf9',
  'surface-container-lowest': '#fffdf9',
  'surface-container-low': '#fbf7f1',
  'surface-container': '#f2ebe2',
  'surface-container-high': '#e9dfd3',
  'surface-container-highest': '#ded2c5',
  'on-surface': '#1f241f',
  'on-surface-variant': '#746e65',
  'inverse-surface': '#1f2b26',
  'inverse-on-surface': '#f8f4ec',
  outline: '#968d81',
  'outline-variant': '#d7ccc0',
  'surface-tint': '#61705f',
  primary: '#1f3029',
  'on-primary': '#fffdf9',
  'primary-container': '#31483d',
  'on-primary-container': '#dbe9db',
  'inverse-primary': '#c8d8c6',
  secondary: '#c86b49',
  'on-secondary': '#fffaf5',
  'secondary-container': '#f2d3c5',
  'on-secondary-container': '#6d2f1e',
  tertiary: '#1f4b52',
  'on-tertiary': '#f7fffd',
  'tertiary-container': '#c7e1df',
  'on-tertiary-container': '#12363b',
  error: '#b5483f',
  'on-error': '#fff8f6',
  'error-container': '#f7d7d2',
  'on-error-container': '#6e211b',
  'primary-fixed': '#dbe9db',
  'primary-fixed-dim': '#b8cab8',
  'on-primary-fixed': '#17241e',
  'on-primary-fixed-variant': '#3a5043',
  'secondary-fixed': '#f2d3c5',
  'secondary-fixed-dim': '#e5ae98',
  'on-secondary-fixed': '#4e2115',
  'on-secondary-fixed-variant': '#7c3d2b',
  'tertiary-fixed': '#c7e1df',
  'tertiary-fixed-dim': '#9fc5c2',
  'on-tertiary-fixed': '#12363b',
  'on-tertiary-fixed-variant': '#2f5e63',
  background: '#f5f1ea',
  'on-background': '#1f241f',
  'surface-variant': '#ded2c5',
  'system-gray': '#f1eee8',
};

export const typography = {
  'display-lg': { fontFamily: 'Georgia, "Times New Roman", serif', fontSize: '68px', fontWeight: '500', lineHeight: '0.98', letterSpacing: '-0.045em' },
  'display-lg-mobile': { fontFamily: 'Georgia, "Times New Roman", serif', fontSize: '44px', fontWeight: '500', lineHeight: '1.02', letterSpacing: '-0.04em' },
  'headline-lg': { fontFamily: 'Georgia, "Times New Roman", serif', fontSize: '36px', fontWeight: '500', lineHeight: '1.1', letterSpacing: '-0.035em' },
  'headline-md': { fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif', fontSize: '22px', fontWeight: '650', lineHeight: '1.2', letterSpacing: '-0.02em' },
  'body-lg': { fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif', fontSize: '18px', fontWeight: '400', lineHeight: '1.6', letterSpacing: '-0.01em' },
  'body-md': { fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif', fontSize: '15px', fontWeight: '400', lineHeight: '1.6', letterSpacing: '0' },
  'label-md': { fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif', fontSize: '14px', fontWeight: '600', lineHeight: '1.4', letterSpacing: '0.01em' },
  'label-sm': { fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif', fontSize: '11px', fontWeight: '700', lineHeight: '1.3', letterSpacing: '0.16em' },
};

export const spacing = {
  unit: '8px',
  'container-max': '1440px',
  gutter: '24px',
  'margin-desktop': '56px',
  'margin-mobile': '18px',
  'stack-sm': '8px',
  'stack-md': '16px',
  'stack-lg': '28px',
  'stack-xl': '72px',
};

export const borderRadius = {
  sm: '0.55rem',
  DEFAULT: '0.85rem',
  md: '1.15rem',
  lg: '1.5rem',
  xl: '1.8rem',
  '2xl': '2.25rem',
  '3xl': '2.8rem',
  full: '9999px',
};

export const shadows = {
  invisible: '0 18px 42px rgba(31, 36, 31, 0.06)',
  soft: '0 18px 40px rgba(31, 36, 31, 0.08)',
  lg: '0 28px 72px rgba(31, 36, 31, 0.13)',
  xl: '0 34px 100px rgba(31, 36, 31, 0.18)',
};

export const elevation = {
  glass: { background: 'rgba(255, 253, 249, 0.78)', backdropFilter: 'blur(22px)' },
  nav: { background: 'rgba(245, 241, 234, 0.84)', backdropFilter: 'blur(24px)' },
};

export const transitions = {
  default: 'all 0.2s cubic-bezier(0.23, 1, 0.32, 1)',
  press: 'transform 0.16s cubic-bezier(0.23, 1, 0.32, 1)',
  image: 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
  fadeUp: 'opacity 0.7s cubic-bezier(0.23, 1, 0.32, 1), transform 0.7s cubic-bezier(0.23, 1, 0.32, 1)',
  toast: 'all 0.24s cubic-bezier(0.23, 1, 0.32, 1)',
};

export const components = {
  button: {
    base: 'inline-flex items-center justify-center gap-2 rounded-full border border-transparent text-label-md font-label-md transition-all duration-200 ease-out active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-55 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-secondary/20',
    primary: 'bg-primary text-on-primary shadow-[0_10px_24px_rgba(31,48,41,0.18)] hover:bg-primary-container',
    primarySolid: 'bg-primary text-on-primary shadow-[0_10px_24px_rgba(31,48,41,0.18)] hover:bg-primary-container',
    secondary: 'border border-outline-variant/70 bg-surface-container-lowest/60 text-primary hover:border-secondary/50 hover:bg-secondary-container/30 hover:shadow-sm',
    ghost: 'bg-transparent text-primary hover:bg-surface-container-high/70',
    chip: 'px-4 py-2 rounded-full text-label-sm font-label-sm whitespace-nowrap transition-all active:scale-[0.98]',
    chipActive: 'bg-primary text-on-primary shadow-sm',
    chipInactive: 'bg-surface-container-high/65 text-on-surface hover:bg-surface-container-highest',
    icon: 'inline-flex items-center justify-center rounded-full p-2.5 text-primary transition-all duration-200 hover:bg-surface-container-high/70 hover:shadow-sm active:scale-[0.97]',
    sizes: {
      default: 'px-5 py-3 min-h-11',
      compact: 'px-4 py-2.5 min-h-10',
      bag: 'px-6 py-4 min-h-12',
      checkout: 'px-6 py-4 min-h-12 uppercase tracking-[0.16em]',
      sm: 'px-3 py-2 min-h-9 text-sm',
    },
  },
  input: {
    floating: 'peer w-full rounded-2xl border border-outline-variant/70 bg-surface-container-lowest px-4 py-3 text-body-md font-body-md text-on-surface shadow-sm outline-none transition-all duration-200 placeholder:text-transparent focus:border-secondary focus:ring-4 focus:ring-secondary/10',
    floatingLabel: 'absolute left-4 top-3 text-label-sm font-label-sm text-on-surface-variant transition-all peer-placeholder-shown:text-body-md peer-placeholder-shown:top-3 peer-focus:-top-4 peer-focus:text-label-sm peer-focus:text-secondary cursor-text',
    underline: 'w-full rounded-2xl border border-outline-variant/70 bg-surface-container-lowest px-4 py-3 text-body-md font-body-md text-on-surface shadow-sm outline-none transition-all duration-200 placeholder:text-on-surface-variant/60 focus:border-secondary focus:ring-4 focus:ring-secondary/10',
    label: 'text-label-sm font-label-sm text-on-surface-variant',
  },
  card: {
    product: 'overflow-hidden rounded-[1.6rem] border border-outline-variant/35 bg-surface-container-lowest shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lg',
    panel: 'rounded-[1.6rem] border border-outline-variant/35 bg-surface-container-lowest p-6 shadow-soft',
    summary: 'rounded-[1.6rem] border border-outline-variant/35 bg-primary p-8 text-on-primary shadow-lg',
    login: 'rounded-[2rem] border border-outline-variant/35 bg-surface-container-lowest p-8 shadow-lg',
    featured: 'overflow-hidden rounded-[1.6rem] border border-outline-variant/35 bg-surface-container-lowest shadow-soft',
  },
  modal: {
    overlay: 'fixed inset-0 z-[150] bg-inverse-surface/35 backdrop-blur-sm',
    panel: 'rounded-[2rem] border border-outline-variant/40 bg-surface-container-lowest p-6 shadow-xl',
  },
  loader: {
    skeleton: 'bg-surface-container-high animate-pulse',
    skeletonBlock: 'bg-surface-container-high rounded-[1.25rem] animate-pulse',
  },
};

const typographyFontSize = Object.fromEntries(
  Object.entries(typography).map(([key, value]) => [key, [value.fontSize, { lineHeight: value.lineHeight, letterSpacing: value.letterSpacing, fontWeight: value.fontWeight }]])
);

const typographyFontFamily = Object.fromEntries(
  Object.entries(typography).map(([key, value]) => [key, value.fontFamily.split(',').map((font) => font.trim())])
);

export const tailwindTheme = {
  colors,
  borderRadius,
  spacing,
  fontFamily: typographyFontFamily,
  fontSize: typographyFontSize,
  boxShadow: { invisible: shadows.invisible, soft: shadows.soft, lg: shadows.lg, xl: shadows.xl },
  maxWidth: { 'container-max': spacing['container-max'] },
};

export const cn = (...classes) => classes.filter(Boolean).join(' ');

export default { colors, typography, spacing, borderRadius, shadows, elevation, transitions, components, tailwindTheme, cn };
