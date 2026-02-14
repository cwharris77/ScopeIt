/**
 * Color constants for the ScopedIn app
 * Mobile brand color: teal (#087f8c) instead of web's indigo
 */

export const Colors = {
  // Brand colors
  primary: '#087f8c',
  primaryLight: '#0a9dae',
  primaryDark: '#066a75',

  // Status colors
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#EF4444',

  // Priority colors
  lowPriority: '#10b981',
  mediumPriority: '#f59e0b',
  highPriority: '#EF4444',

  // Background colors (dark theme)
  background: '#181922',
  backgroundSecondary: '#1f2937',
  backgroundTertiary: '#252a36',
  backgroundCard: '#1f2937',

  // Text colors
  text: '#f3f4f6',
  textSecondary: '#9ca3af',
  textMuted: '#6b7280',

  // Border colors
  border: '#433e3f',
  borderLight: '#555150',

  // Utility
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
} as const;

export type ColorKey = keyof typeof Colors;

export const PROJECT_COLORS = [
  '#087f8c', // teal (primary)
  '#10b981', // green
  '#f59e0b', // amber
  '#EF4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#6b7280', // gray
] as const;
