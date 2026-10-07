/**
 * Design tokens ported from the web app's `app/globals.css`.
 *
 * The web app is Tailwind v4 + shadcn, driven entirely by CSS custom properties.
 * React Native has no CSS variables, so the scale is reproduced here as plain
 * constants and consumed through `StyleSheet.create`.
 *
 * The oklch() neutrals in globals.css are the standard shadcn `neutral` ramp, so
 * they map cleanly onto their hex equivalents. Brand colours (`#f1a10d`
 * primary, `#ffc300` gold) are already hex in the web app and are copied as-is.
 *
 * Light-only on purpose: `app/layout.tsx` never sets the `.dark` class, so the
 * web app renders light-only too. `app.json` pins userInterfaceStyle to "light"
 * so the native UI matches.
 */

export const colors = {
  // Brand
  primary: '#f1a10d',
  primaryHover: '#e6b000',
  /** Accent gold used for payment CTAs and highlights (payment + admin screens). */
  gold: '#ffc300',
  goldHover: '#e6b000',
  /** Sits behind `primary` logos/icons — matches `bg-primary text-dark` in the web app. */
  onPrimaryDark: '#0a0a0a',

  // Neutrals (shadcn neutral ramp)
  background: '#ffffff',
  foreground: '#0a0a0a',
  card: '#ffffff',
  cardForeground: '#0a0a0a',
  popover: '#ffffff',
  popoverForeground: '#0a0a0a',
  primaryForeground: '#fafafa',
  secondary: '#f5f5f5',
  secondaryForeground: '#171717',
  muted: '#f5f5f5',
  mutedForeground: '#8a8a8a',
  accent: '#f5f5f5',
  accentForeground: '#171717',
  border: '#e5e5e5',
  input: '#e5e5e5',
  ring: '#b8b8b8',
  textMuted: '#555555',

  // Status
  destructive: '#dc2626',
  destructiveBg: '#fef2f2',
  destructiveBorder: '#fecaca',
  success: '#16a34a',
  successBg: '#dcfce7',
  successBorder: '#bbf7d0',
  successText: '#15803d',
  warning: '#f59e0b',
  warningBg: '#fffbeb',
  warningBorder: '#fde68a',
  warningText: '#b45309',

  // Overlays
  overlay: 'rgba(0,0,0,0.45)',
  /** Bottom scrim on property card images, matching `from-black/70`. */
  imageScrim: 'rgba(0,0,0,0.7)',
  transparent: 'transparent',
} as const;

export const radius = {
  sm: 6,
  md: 8,
  lg: 10,
  xl: 14,
  '2xl': 18,
  '3xl': 22,
  '4xl': 26,
  full: 9999,
} as const;

export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

/** Work Sans, matching `body { font-family: var(--font-work-sans) }`. */
export const fontFamily = {
  light: 'WorkSans_300Light',
  regular: 'WorkSans_400Regular',
  medium: 'WorkSans_500Medium',
  semibold: 'WorkSans_600SemiBold',
  bold: 'WorkSans_700Bold',
  extrabold: 'WorkSans_800ExtraBold',
  mono: 'monospace',
} as const;

/**
 * Typography presets mirroring the Tailwind classes used across the web app
 * (text-xs / text-sm / text-base / text-lg / text-2xl / text-4xl and the
 * font-weight utilities).
 */
export const type = {
  xs: { fontFamily: fontFamily.medium, fontSize: 12, lineHeight: 16 },
  sm: { fontFamily: fontFamily.medium, fontSize: 14, lineHeight: 20 },
  base: { fontFamily: fontFamily.regular, fontSize: 16, lineHeight: 24 },
  lg: { fontFamily: fontFamily.regular, fontSize: 18, lineHeight: 26 },
  xl: { fontFamily: fontFamily.semibold, fontSize: 20, lineHeight: 28 },
  '2xl': { fontFamily: fontFamily.bold, fontSize: 24, lineHeight: 32 },
  '3xl': { fontFamily: fontFamily.extrabold, fontSize: 30, lineHeight: 38 },
  '4xl': { fontFamily: fontFamily.extrabold, fontSize: 36, lineHeight: 42 },
  '5xl': { fontFamily: fontFamily.extrabold, fontSize: 48, lineHeight: 54 },
} as const;

export const theme = { colors, radius, spacing, fontFamily, type } as const;

export type Theme = typeof theme;