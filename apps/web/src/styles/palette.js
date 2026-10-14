// Xtin design palette — the single source of truth for colour.
//
// Light mode is pure white, dark mode near-black (both modelled on
// GeeksforGeeks), with one brand green and gold as the premium accent.
//
// Tailwind's 22 default hues are collapsed onto 8 families (see HUE_FAMILY),
// so every existing `bg-emerald-600`, `text-slate-500`, `border-indigo-200`
// … resolves to the same consistent palette without touching component code.
// Shades keep Tailwind's 50–950 lightness ladder, so `dark:` variants that
// already pick a dark shade (e.g. `dark:bg-slate-900`) still land on a dark
// colour — now black instead of navy.
//
// The dark-mode overrides in index.css and the hex colours written into
// components (charts, SVG diagrams) were mapped shade-for-shade onto these
// same values, so change a colour here first.

export const families = {
  // Text, surfaces, borders — GeeksforGeeks' neutrals. Light mode is pure
  // white with #F5F5F7 panels; dark mode is #131417 with #1F1F1F cards.
  neutral: {
    50: '#F5F5F7', 100: '#EEEEF1', 200: '#E4E4EA', 300: '#CFD0D3', 400: '#A0A3AA',
    500: '#717680', 600: '#555A63', 700: '#373A41', 800: '#2A2A2C', 900: '#1F1F1F', 950: '#131417',
  },
  // Brand / profit. 600 = buttons & light-mode text, 400 = dark-mode text.
  brand: {
    50: '#EEF9F4', 100: '#D5F2E5', 200: '#ABE5CC', 300: '#77D3AE', 400: '#3CCB97',
    500: '#1FA978', 600: '#12805A', 700: '#0E6A4A', 800: '#0D543C', 900: '#0B4532', 950: '#052A1E',
  },
  // Loss / destructive.
  negative: {
    50: '#FDF1F1', 100: '#FBE1E1', 200: '#F6C3C3', 300: '#F09B9B', 400: '#F26B6B',
    500: '#E04848', 600: '#C7363B', 700: '#A52A2F', 800: '#842428', 900: '#6B2023', 950: '#3B0D0F',
  },
  // Premium accent, warnings.
  gold: {
    50: '#FBF7EC', 100: '#F6ECCE', 200: '#EDD89D', 300: '#E2C273', 400: '#CDAA5F',
    500: '#B8923F', 600: '#9A7634', 700: '#7C5D2B', 800: '#654B26', 900: '#533E22', 950: '#2E2110',
  },
  terracotta: {
    50: '#FCF3EE', 100: '#F8E2D6', 200: '#F0C2A9', 300: '#EBA584', 400: '#E3906B',
    500: '#D2754C', 600: '#C0623B', 700: '#9C4D2E', 800: '#7D3F28', 900: '#663524', 950: '#381A10',
  },
  // Info / secondary series.
  slateBlue: {
    50: '#F1F4F9', 100: '#E0E7F1', 200: '#C3D0E4', 300: '#9FB3D3', 400: '#7C95C4',
    500: '#5A77AA', 600: '#3E5C8A', 700: '#344C72', 800: '#2C3F5E', 900: '#26354F', 950: '#172033',
  },
  violet: {
    50: '#F6F2FB', 100: '#ECE4F6', 200: '#D9CBEE', 300: '#C0A9E2', 400: '#A88BD9',
    500: '#8F6FC4', 600: '#7A5BA6', 700: '#654B8A', 800: '#533F70', 900: '#46365D', 950: '#2A1F3A',
  },
  teal: {
    50: '#EEF8F9', 100: '#D3EEF1', 200: '#A9DDE3', 300: '#82CDD6', 400: '#4FB5C2',
    500: '#33A0AE', 600: '#2A8C9A', 700: '#23727E', 800: '#1F5D67', 900: '#1C4D55', 950: '#0E2E33',
  },
};

// Which family each Tailwind hue now draws from.
export const HUE_FAMILY = {
  slate: 'neutral', gray: 'neutral', zinc: 'neutral', neutral: 'neutral', stone: 'neutral',
  green: 'brand', emerald: 'brand', lime: 'brand',
  red: 'negative', rose: 'negative',
  amber: 'gold', yellow: 'gold',
  orange: 'terracotta',
  blue: 'slateBlue', sky: 'slateBlue',
  indigo: 'violet', violet: 'violet', purple: 'violet', fuchsia: 'violet', pink: 'violet',
  teal: 'teal', cyan: 'teal',
};

// Tailwind `theme.colors` overrides: every hue name → its family's scale.
export const tailwindHues = Object.fromEntries(
  Object.entries(HUE_FAMILY).map(([hue, fam]) => [hue, families[fam]]),
);
