---
name: Premium Industrial Marketplace
colors:
  surface: '#f9faf6'
  surface-dim: '#dadad7'
  surface-bright: '#f9faf6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f1'
  surface-container: '#eeeeeb'
  surface-container-high: '#e8e8e5'
  surface-container-highest: '#e2e3e0'
  on-surface: '#1a1c1a'
  on-surface-variant: '#414844'
  inverse-surface: '#2f312f'
  inverse-on-surface: '#f0f1ee'
  outline: '#717973'
  outline-variant: '#c1c8c2'
  surface-tint: '#3f6653'
  primary: '#012d1d'
  on-primary: '#ffffff'
  primary-container: '#1b4332'
  on-primary-container: '#86af99'
  inverse-primary: '#a5d0b9'
  secondary: '#5c5f60'
  on-secondary: '#ffffff'
  secondary-container: '#dee0e2'
  on-secondary-container: '#606365'
  tertiary: '#401b1b'
  on-tertiary: '#ffffff'
  tertiary-container: '#5a302f'
  on-tertiary-container: '#d29895'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c1ecd4'
  primary-fixed-dim: '#a5d0b9'
  on-primary-fixed: '#002114'
  on-primary-fixed-variant: '#274e3d'
  secondary-fixed: '#e1e2e4'
  secondary-fixed-dim: '#c5c6c8'
  on-secondary-fixed: '#191c1e'
  on-secondary-fixed-variant: '#444749'
  tertiary-fixed: '#ffdad8'
  tertiary-fixed-dim: '#f5b7b4'
  on-tertiary-fixed: '#331111'
  on-tertiary-fixed-variant: '#673a39'
  background: '#f9faf6'
  on-background: '#1a1c1a'
  surface-variant: '#e2e3e0'
typography:
  display-xl:
    fontFamily: Inter
    fontSize: 64px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  h1:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  h2:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  h3:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-base:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.4'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1440px
  gutter: 32px
  margin-page: 64px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
  section-gap: 80px
---

## Brand & Style

The design system is engineered to convey industrial reliability and high-capital trust. Given that the marketplace handles heavy machinery, the UI must feel as sturdy and precise as the equipment it lists. The brand personality is authoritative, transparent, and hyper-efficient.

The visual style is a fusion of **Modern Minimalism** and **Corporate Precision**. It avoids all decorative fluff to focus on high-resolution photography of the machinery and clear technical data. The emotional response should be one of "expensive simplicity"—where the user feels they are using a high-end tool designed for professional procurement. The layout is optimized for 4K displays, utilizing generous whitespace to ensure that even complex data sets feel digestible and premium.

## Colors

The palette for this design system is strictly professional, leaning on a high-contrast light mode to maximize legibility.

- **Primary:** The Deep Forest Green (#1B4332) is used sparingly for primary actions, navigation accents, and brand touchpoints. It signifies growth, stability, and agricultural/industrial heritage.
- **Surface:** Pure White (#FFFFFF) is the primary canvas color. Subtle Cool Grey (#F4F5F7) is reserved for secondary surfaces like sidebar backgrounds, card containers, and page-level sectioning.
- **Interactive:** Borders use a crisp, light-grey stroke to define structure without adding visual noise.
- **Typography:** Deep slate tones are used instead of pure black to maintain a sophisticated, modern appearance while ensuring AAA accessibility.

## Typography

The design system utilizes **Inter** for all interface elements to leverage its exceptional clarity on high-resolution screens.

Typographic hierarchy is the primary driver of layout. Large display sizes are used for machine titles and high-level metrics, while technical specifications rely on a rigorous 16px body grid. For data-heavy tables and specifications, "label-sm" provides a clear, all-caps header to differentiate metadata from values. Line heights are intentionally generous to prevent information density from becoming overwhelming during long procurement sessions.

## Layout & Spacing

The layout philosophy follows a **Fixed-Width Grid** model centered on the screen, designed to maintain a premium feel on ultra-wide and 4K displays. By capping the content width at 1440px, we ensure optimal line lengths for technical reading.

The spacing rhythm is built on an 8px baseline.

- **Page Margins:** 64px on desktops to provide a "frame" that highlights the content.
- **Sectioning:** Large vertical gaps (80px+) are used to separate distinct stages of the rental funnel (e.g., Search from Featured Listings).
- **Density:** Inside cards and data tables, spacing is tightened to "stack-sm" (8px) to maintain a cohesive relationship between related technical specs.

## Elevation & Depth

To maintain a minimalist and polished aesthetic, this design system avoids heavy shadows and skeuomorphism. Depth is achieved through **Low-Contrast Outlines** and **Ambient Shadows**.

1.  **Level 0 (Base):** The primary background (#FFFFFF).
2.  **Level 1 (Sub-surface):** Secondary containers in #F4F5F7, used for background grouping or sidebar navigation.
3.  **Level 2 (Cards/Modules):** Elements that sit on the base surface are defined by a 1px border (#E2E8F0).
4.  **Level 3 (Interactive):** On hover or selection, elements receive an ambient, extra-diffused shadow (0px 10px 30px rgba(0,0,0,0.04)). This creates a sense of "lift" without looking cluttered.

No heavy blurs or colorful glows are permitted; the depth must feel architectural and subtle.

## Shapes

The design system utilizes **Soft** roundedness (Level 1). This choice ensures that while the interface feels modern and accessible, it maintains the "crisp edges" required for an industrial machinery brand.

- **Buttons & Inputs:** 0.25rem (4px) corner radius. This provides a sharp, professional look that aligns with the structural lines of heavy equipment.
- **Cards & Containers:** 0.5rem (8px) for larger components to provide a subtle distinction from the tighter radius of interactive elements.
- **Strictness:** Rounding should never exceed 0.75rem. Pill-shaped buttons are prohibited as they detract from the serious, utility-first nature of the marketplace.

## Components

### Buttons

Primary buttons utilize the Forest Green (#1B4332) with white text. Secondary buttons are ghost-style with a 1px stroke in #E2E8F0. All buttons use 4px rounded corners and 16px horizontal padding.

### Input Fields

Inputs are minimalist: a 1px border (#E2E8F0) that darkens on focus. Labels are always positioned above the field in "label-sm" typography. No icons should be used inside inputs unless strictly functional (e.g., search magnifying glass).

### Machinery Cards

The centerpiece of the marketplace. Cards feature a high-resolution machine image, a sharp H3 title, and a grid of 3-4 key specs (e.g., Weight, Power, Availability). The "Availability" status is a small chip with a 2px radius.

### Availability Chips

Small, low-profile indicators. "Available" uses a light tint of the primary green with dark green text. "Rented" or "Maintenance" uses cool grey tones.

### Data Tables

Used for fleet management and pricing tiers. Tables use horizontal lines only (no vertical borders) to maintain a clean, readable flow. Headers are sticky and use a light grey background (#F4F5F7).

### Filter Sidebar

A critical component for machinery rental. Filters use a vertical accordion style with subtle separators. Interaction is immediate, with no "Apply" button required for a seamless browsing experience.
