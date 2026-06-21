---
name: Blueprint Narrative
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#45464d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#0058be'
  on-secondary: '#ffffff'
  secondary-container: '#2170e4'
  on-secondary-container: '#fefcff'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#002113'
  on-tertiary-container: '#009668'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc6ff'
  on-secondary-fixed: '#001a42'
  on-secondary-fixed-variant: '#004395'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
  surface-studio: '#F8FAFC'
  border-subtle: '#E2E8F0'
  maintenance-urgent: '#EF4444'
  tenant-active: '#10B981'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  headline-md-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 26px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  container-margin-desktop: 40px
  container-margin-mobile: 16px
  gutter: 24px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style

The design system is built on a foundation of **Utility-First Minimalism**. It targets property managers and landlords who require a high-density, high-clarity interface that feels like a precision tool rather than a generic template. 

The aesthetic is "Custom-Engineered"—meaning every element serves a functional purpose with zero ornamental "fluff." We leverage heavy whitespace to reduce cognitive load during complex tasks like tenant screening or financial reporting. The emotional response is one of **calculated reliability** and **composed efficiency**.

**Design Style: Modern Corporate**
- **Cleanliness:** Sharp layouts with generous internal padding.
- **Precision:** Use of micro-interactions and subtle borders to define interactive zones.
- **Trust:** A high-contrast typographic hierarchy that ensures data is never misread.

## Colors

The palette is anchored by **Deep Slate (#0F172A)**, providing a sense of architectural stability and authority. 

- **Primary:** Deep Slate is used for high-level navigation and primary headers to establish a strong hierarchy.
- **Secondary:** A vibrant **Electric Blue (#3B82F6)** is reserved strictly for primary actions and interactive states (links, buttons, active toggles).
- **Tertiary:** **Emerald (#10B981)** represents positive status (Paid, Occupied, Resolved).
- **Neutrals:** We use a range of cool grays (`#F8FAFC` to `#64748B`) to layer information without adding visual noise. Backgrounds remain predominantly white or near-white to maintain a "paper-like" clarity.

## Typography

This system uses a tri-font approach to differentiate between branding, reading, and technical data.

- **Hanken Grotesk (Headlines):** A sharp, contemporary grotesque that feels "engineered." It provides the professional character of the application.
- **Inter (Body):** Chosen for its exceptional legibility on mobile devices. It handles long-form lease agreements and maintenance logs with ease.
- **JetBrains Mono (Labels/Data):** Used sparingly for "technical" data such as unit numbers, ID codes, currency, and timestamps. This reinforces the "custom-engineered" feel.

**Hierarchy Rules:**
- All labels for forms and status tags use `label-caps` in uppercase.
- Maintenance alerts and urgent property notifications use `headline-sm` with increased weight.

## Layout & Spacing

The layout utilizes a **12-column Fluid Grid** for desktop and a **Single-Column Stack** for mobile. 

- **Rhythm:** We operate on a 4px baseline grid. All padding and margins are multiples of 4 (8, 16, 24, 32).
- **Mobile Density:** To optimize for property managers on-site, we use "Comfortable Tap Targets" (minimum 44x44px) but maintain tight internal spacing for data tables to ensure maximum information density.
- **Reflow:** Components transition from horizontal layouts (Desktop) to card-based stacks (Mobile) at the 768px breakpoint.

## Elevation & Depth

We avoid the "floating" look of heavy shadows. Instead, we use **Tonal Layering** and **Low-Contrast Outlines**.

- **Surface Levels:** 
    - Level 0 (Background): `#F8FAFC`
    - Level 1 (Cards/Sidebar): `#FFFFFF` with a 1px border of `#E2E8F0`.
- **Shadows:** Use only one "Ambient Shadow" for active elements or modals: `0px 4px 20px rgba(15, 23, 42, 0.08)`. It should be subtle, almost imperceptible, serving only to lift the element off the page.
- **Depth:** Interaction is signaled by a slight shift in border color (from Slate-200 to Blue-500) rather than an increase in shadow depth.

## Shapes

The shape language is **Soft-Geometric**. By using a `0.25rem` (4px) base radius, we maintain a professional, architectural feel that avoids the "bubbly" appearance of consumer apps.

- **Standard Elements:** Buttons, Input fields, and small cards use the base `rounded` (4px).
- **Containers:** Large property summary cards use `rounded-lg` (8px).
- **Status Tags:** Use a "Squircle" (not a full pill) to maintain the technical aesthetic.

## Components

### Buttons
- **Primary:** Deep Slate background, white text. No gradient. 
- **Secondary:** Transparent background, Slate-200 border.
- **State:** On hover, primary buttons shift to Blue-600.

### Input Fields
- **Style:** Flat white background with a 1px Slate-200 border. 
- **Focus:** Border changes to Blue-500 with a 2px outer "halo" of Blue-500 at 10% opacity.
- **Labels:** Use `label-caps` positioned strictly above the input.

### Property Cards
- Use a white background, 1px border, and a vertical layout on mobile.
- Use a 1/3 image and 2/3 data split on desktop.
- Property status (e.g., "Vacant") is pinned to the top-right corner using a high-contrast tag.

### Data Lists
- For maintenance logs, use "Zebra Striping" with a very faint Gray-50 (`#F9FAFB`) instead of borders to separate rows, maximizing horizontal space.

### Chips/Tags
- **Occupied:** Soft Emerald background with Deep Emerald text.
- **Past Due:** Soft Red background with Deep Red text.
- Text must be in `label-caps` for maximum readability at small sizes.
