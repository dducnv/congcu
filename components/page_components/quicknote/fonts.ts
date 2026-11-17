import { Be_Vietnam_Pro, JetBrains_Mono, Literata } from "next/font/google";

// Reading fonts for the preview and the editor. All three cover Vietnamese
// fully, so stacked diacritics (ằ, ữ, ộ…) render cleanly. Fonts are
// self-hosted by next/font and only downloaded when a style uses them.

export const sansFont = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--qn-font-sans",
  display: "swap",
  preload: false,
});

export const serifFont = Literata({
  subsets: ["latin", "vietnamese"],
  style: ["normal", "italic"],
  variable: "--qn-font-serif",
  display: "swap",
  preload: false,
});

export const monoFont = JetBrains_Mono({
  subsets: ["latin", "vietnamese"],
  variable: "--qn-font-mono",
  display: "swap",
  preload: false,
});

export const fontVariables = `${sansFont.variable} ${serifFont.variable} ${monoFont.variable}`;
