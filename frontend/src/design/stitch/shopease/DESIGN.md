---
name: ShopEase
colors:
  surface: '#fcf8fb'
  surface-dim: '#dcd9dc'
  surface-bright: '#fcf8fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f5'
  surface-container: '#f0edef'
  surface-container-high: '#eae7ea'
  surface-container-highest: '#e4e2e4'
  on-surface: '#1b1b1d'
  on-surface-variant: '#4c4546'
  inverse-surface: '#303032'
  inverse-on-surface: '#f3f0f2'
  outline: '#7e7576'
  outline-variant: '#cfc4c5'
  surface-tint: '#5e5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1b1b1b'
  on-primary-container: '#848484'
  inverse-primary: '#c6c6c6'
  secondary: '#005cba'
  on-secondary: '#ffffff'
  secondary-container: '#5095fe'
  on-secondary-container: '#002d61'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#1a1c1d'
  on-tertiary-container: '#838486'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c6'
  on-primary-fixed: '#1b1b1b'
  on-primary-fixed-variant: '#474747'
  secondary-fixed: '#d7e3ff'
  secondary-fixed-dim: '#aac7ff'
  on-secondary-fixed: '#001b3e'
  on-secondary-fixed-variant: '#00458e'
  tertiary-fixed: '#e2e2e4'
  tertiary-fixed-dim: '#c6c6c8'
  on-tertiary-fixed: '#1a1c1d'
  on-tertiary-fixed-variant: '#454749'
  background: '#fcf8fb'
  on-background: '#1b1b1d'
  surface-variant: '#e4e2e4'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 64px
    fontWeight: '600'
    lineHeight: 72px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: '0'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: '0'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1440px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
  stack-xl: 64px
---

## Brand & Style
The design system is anchored in a philosophy of "Quiet Luxury." It targets a discerning audience that values clarity, precision, and a frictionless shopping experience. The visual narrative draws heavily from **Minimalism** and **Glassmorphism**, prioritizing the product as the hero while the interface recedes into the background.

The emotional response should be one of calm, confidence, and exclusivity. By utilizing expansive white space, a monochromatic palette, and subtle depth through translucency, the design system creates a digital environment that feels like a high-end gallery rather than a traditional marketplace.

## Colors
The palette is intentionally restrained to maintain a premium editorial feel. 

- **Primary:** Pure Black (#000000) is reserved for high-level headings and primary calls to action, providing maximum contrast against the white canvas.
- **Secondary:** A sophisticated "Deep Electric Blue" (#0066CC) is used sparingly as a functional accent for links, active states, and focus indicators.
- **Backgrounds:** The interface utilizes a "System Gray" (#F5F5F7) to differentiate surface levels from the base White (#FFFFFF) page, creating a soft, layered appearance.
- **Neutral:** Dark Charcoal (#1D1D1F) is used for body text to ensure high readability without the harshness of pure black on light backgrounds.

## Typography
The typography system uses **Inter** to emulate a modern, systematic sans-serif aesthetic. It relies on tight tracking for large headlines and generous leading for body copy to ensure a "breathable" reading experience. 

High-level headings (Display and Headline LG) should utilize semi-bold weights with negative letter-spacing to create a compact, authoritative look. Body text scales from 16px to 18px to maintain accessibility while feeling premium. Labels use slightly increased letter-spacing and medium weights to provide clear metadata hierarchy.

## Layout & Spacing
This design system utilizes a **12-column fixed grid** for desktop and a **4-column fluid grid** for mobile. The layout philosophy is defined by "Luxurious Negative Space," where margins are intentionally wide to center the user's focus on the content.

- **Desktop:** 1440px max-width container with 64px side margins. 
- **Rhythm:** All spacing is derived from a base-8 unit. Vertical stacks (rhythm) should prioritize `stack-xl` (64px) between major sections to emphasize the premium, unhurried nature of the brand.
- **Alignment:** All elements must align to the grid. Images should span full column widths, never partial columns, to maintain a geometric, structured feel.

## Elevation & Depth
Depth is communicated through **Glassmorphism** and **Tonal Layers** rather than heavy shadows.

1.  **The Base:** Pure White (#FFFFFF).
2.  **The Canvas:** System Gray (#F5F5F7) used to define cards or secondary content areas.
3.  **The Floating Layer:** Used for navigation bars and modals. These elements utilize a backdrop blur (20px - 30px) and 80% opacity white fill.
4.  **Shadows:** When necessary, use "Invisible Shadows"—highly diffused, 4-8% opacity black with a 20px-40px blur radius, creating a soft glow rather than a hard lift.

## Shapes
The shape language is defined by "Soft Precision." Standard UI elements like buttons and input fields utilize a 0.5rem (8px) radius, while larger containers and product cards utilize 1rem (16px) or 1.5rem (24px) for a softer, more inviting appearance. This juxtaposition of sharp typography and soft containers creates a modern, balanced aesthetic.

## Components

### Buttons
Primary buttons are solid black with white text, using a 12px vertical padding and 24px horizontal padding. Secondary buttons are ghost-style with a thin 1px border (#E5E5E7) or a subtle gray fill (#F5F5F7). Interactive states should involve a slight scale-down effect (0.98x) to simulate a tactile physical press.

### Input Fields
Fields should be minimalist: a 1px bottom border or a very light gray (#F5F5F7) filled background with no border. Placeholder text should be light gray (#86868B). On focus, the bottom border transitions to the accent blue (#0066CC).

### Cards
Product cards are borderless. They rely on the `System Gray` background or the product image itself to define their boundaries. Content within cards is left-aligned with generous internal padding (24px).

### Navigation Bar
The top navigation is always fixed, using a backdrop-blur (Glassmorphism) effect. It features a thin 0.5px bottom separator in a very light gray to provide just enough definition against the content below.

### Chips & Tags
Used for categories or status. These are small, pill-shaped elements with a subtle gray background and medium-weight 12px typography. They should never have heavy borders.