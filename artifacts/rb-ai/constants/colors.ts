/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    text: '#E0F2FE',
    tint: '#E0F2FE',
    background: '#050A12',
    foreground: '#E0F2FE',
    card: 'rgba(18, 32, 48, 0.74)',
    cardForeground: '#E0F2FE',
    primary: '#E0F2FE',
    primaryForeground: '#061018',
    secondary: 'rgba(25, 43, 60, 0.76)',
    secondaryForeground: '#E0F2FE',
    muted: 'rgba(156, 185, 207, 0.14)',
    mutedForeground: '#7D98AE',
    accent: 'rgba(224, 242, 254, 0.16)',
    accentForeground: '#E0F2FE',
    destructive: '#F87171',
    destructiveForeground: '#FFFFFF',
    border: 'rgba(224, 242, 254, 0.16)',
    input: 'rgba(224, 242, 254, 0.12)',
    navy: '#081322',
    deepNavy: '#02060C',
    glass: 'rgba(14, 29, 45, 0.68)',
    glassStrong: 'rgba(19, 39, 57, 0.86)',
    hairline: 'rgba(224, 242, 254, 0.20)',
    accentSoft: 'rgba(224, 242, 254, 0.08)',
    accentGlow: 'rgba(184, 229, 252, 0.28)',
    whiteSoft: 'rgba(224, 242, 254, 0.72)',
    black: '#000000',
  },

  // Border radius (in px). Sync from the sibling web artifact's --radius
  // CSS variable. This value applies to cards, buttons, inputs, and modals.
  radius: 8,
};

export default colors;
