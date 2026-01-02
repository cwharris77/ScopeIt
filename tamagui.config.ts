import { createTamagui, createTokens } from 'tamagui';
import { dark, light } from './lib/theme';

const tokens = createTokens({
  color: {
    danger: '#EF4444',
    success: '#10b981',
    warning: '#f59e0b',
    low_priority: '#10b981',
    medium_priority: '#f59e0b',
    high_priority: '#EF4444',
  },
  size: {
    true: 16,
    xs: 24,
    sm: 32,
    md: 40,
    lg: 50,
    xl: 65,
    xxl: 80,
  },
  space: {
    true: 16,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 32,
  },
  radius: {
    true: 4,
    xs: 2,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 24,
  },
  zIndex: {
    true: 0,
    xs: 100,
    sm: 200,
    md: 300,
    lg: 400,
    xl: 500,
    xxl: 600,
  },
  fontSize: {
    true: 14,
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 30,
  },
});

const shorthands = {
  px: 'paddingHorizontal',
  py: 'paddingVertical',
  bc: 'backgroundColor',
  br: 'borderRadius',
  bw: 'borderWidth',
  w: 'width',
  h: 'height',
  m: 'margin',
  mt: 'marginTop',
  mr: 'marginRight',
  mb: 'marginBottom',
  ml: 'marginLeft',
  p: 'padding',
  pt: 'paddingTop',
  pr: 'paddingRight',
  pb: 'paddingBottom',
  pl: 'paddingLeft',
} as const;

const config = createTamagui({
  tokens,
  themes: {
    light,
    dark,
  },
  media: {
    xs: { maxWidth: 660 },
    sm: { maxWidth: 800 },
    md: { maxWidth: 1020 },
    lg: { maxWidth: 1280 },
    xl: { maxWidth: 1420 },
    xxl: { maxWidth: 1600 },
    gtXs: { minWidth: 660 + 1 },
    gtSm: { minWidth: 800 + 1 },
    gtMd: { minWidth: 1020 + 1 },
    gtLg: { minWidth: 1280 + 1 },
    short: { maxHeight: 820 },
    tall: { minHeight: 820 },
    hoverNone: { hover: 'none' },
    pointerCoarse: { pointer: 'coarse' },
  },
  shorthands,
});

export type AppConfig = typeof config;

export default config;
