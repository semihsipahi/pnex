/**
 * PNEX — Private Network Exchange
 * Design tokens. Splash & auth lean into the black/gold luxury identity,
 * while the in-app surfaces are predominantly light/premium with
 * black-gold accents (footer/tab bar, badges, dividers).
 */

import { Platform } from "react-native"

export const Colors = {
  // Core dark luxury palette
  obsidian: "#0A0A0A",
  obsidianSoft: "#121110",
  onyx: "#1A1714",

  // Gold accents (figma palette — updated 2026-06-28)
  gold: "#D4AF37",
  goldBright: "#F3E5AB",
  goldDeep: "#997A15",
  goldFaint: "rgba(212,175,55,0.08)",

  // Light premium palette (in-app body)
  paper: "#FBFAF8",
  paperAlt: "#F2F0EC",
  card: "#FFFFFF",
  ink: "#16140F",
  inkSoft: "#4A453C",
  inkFaint: "#8C8676",
  hairline: "#E7E3DB",
  hairlineStrong: "#D8D2C6",

  // Utility
  white: "#FFFFFF",
  black: "#000000",
  success: "#2E7D5B",
  danger: "#A8392F",
  overlay: "rgba(10,10,10,0.6)",
} as const

/**
 * Typography system:
 * - Display: Cormorant Garamond (serif) — brand, headings, large text
 * - UI/Body: SF Pro Display on Apple, system sans elsewhere
 */
export const Fonts = {
  // Brand serif — Cormorant Garamond
  serif: "CormorantGaramond",
  serifSemiBold: "CormorantGaramond-SemiBold",
  serifBold: "CormorantGaramond-Bold",

  // Body / UI — SF Pro on Apple, system sans fallback
  sans: Platform.select({
    ios: "System",
    default: "-apple-system, BlinkMacSystemFont, sans-serif",
  }),
  sansMedium: Platform.select({
    ios: "System",
    default: "-apple-system, BlinkMacSystemFont, sans-serif",
  }),
  sansSemibold: Platform.select({
    ios: "System",
    default: "-apple-system, BlinkMacSystemFont, sans-serif",
  }),
} as const

/**
 * Tracking (letter-spacing) scale — premium feel requires open tracking
 */
export const Tracking = {
  display: 18,
  logo: 8,
  headline: 4,
  subtitle: 3,
  label: 2.5,
  button: 1.5,
  body: 0.5,
  tight: 0.2,
} as const

/**
 * Type scale — harmonious sizes across the app
 */
export const TypeSize = {
  logo: 64,
  display: 42,
  h1: 32,
  h2: 26,
  h3: 20,
  body: 15,
  caption: 12,
  small: 11,
  micro: 9,
} as const

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const

export const Radius = {
  sm: 10,
  md: 16,
  lg: 24,
  pill: 999,
} as const
