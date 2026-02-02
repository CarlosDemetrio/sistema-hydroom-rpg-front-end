/**
 * Configuração Centralizada de Cores - Sky Theme
 *
 * ✨ ÚNICO LOCAL para configurar todas as cores do sistema
 *
 * Para mudar o tema, basta alterar as cores aqui!
 */

// ========================================
// 🎨 PALETA PRIMÁRIA (Sky)
// ========================================
export const PRIMARY_COLORS = {
  50: '#f0f9ff',
  100: '#e0f2fe',
  200: '#bae6fd',
  300: '#7dd3fc',
  400: '#38bdf8',
  500: '#0ea5e9',  // ⭐ COR PRINCIPAL
  600: '#0284c7',
  700: '#0369a1',
  800: '#075985',
  900: '#0c4a6e',
  950: '#082f49'
} as const;

// ========================================
// 🌍 LIGHT MODE - Surface Colors (Zinc)
// ========================================
export const LIGHT_SURFACE_COLORS = {
  0: '#ffffff',
  50: '#fafafa',
  100: '#f4f4f5',
  200: '#e4e4e7',
  300: '#d4d4d8',
  400: '#a1a1aa',
  500: '#71717a',
  600: '#52525b',
  700: '#3f3f46',
  800: '#27272a',
  900: '#18181b',
  950: '#09090b'
} as const;

// ========================================
// 🌙 DARK MODE - Surface Colors (Slate)
// ========================================
export const DARK_SURFACE_COLORS = {
  0: '#ffffff',
  50: '#f8fafc',
  100: '#f1f5f9',
  200: '#e2e8f0',
  300: '#cbd5e1',
  400: '#94a3b8',
  500: '#64748b',
  600: '#475569',
  700: '#334155',
  800: '#1e293b',
  900: '#0f172a',
  950: '#020617'
} as const;

// ========================================
// 🎨 SEMANTIC COLORS - Light Mode
// ========================================
export const LIGHT_THEME = {
  // Primary
  primary: PRIMARY_COLORS[500],
  primaryHover: PRIMARY_COLORS[600],
  primaryActive: PRIMARY_COLORS[700],
  primaryContrast: '#ffffff',

  // Background
  background: `linear-gradient(135deg, ${PRIMARY_COLORS[50]} 0%, ${PRIMARY_COLORS[100]} 50%, ${PRIMARY_COLORS[200]} 100%)`,
  backgroundSolid: LIGHT_SURFACE_COLORS[0],

  // Text
  textPrimary: LIGHT_SURFACE_COLORS[700],
  textSecondary: LIGHT_SURFACE_COLORS[500],
  textMuted: LIGHT_SURFACE_COLORS[400],

  // Surface
  surfaceCard: LIGHT_SURFACE_COLORS[0],
  surface100: LIGHT_SURFACE_COLORS[100],
  surface200: LIGHT_SURFACE_COLORS[200],
  surfaceBorder: LIGHT_SURFACE_COLORS[200],

  // Gradients
  gradientPrimary: `linear-gradient(135deg, ${PRIMARY_COLORS[500]} 0%, ${PRIMARY_COLORS[600]} 100%)`,
  gradientReverse: `linear-gradient(135deg, ${PRIMARY_COLORS[50]} 0%, ${PRIMARY_COLORS[100]} 100%)`,

  // Shadows
  shadowCard: `0 4px 6px -1px rgba(14, 165, 233, 0.1), 0 2px 4px -2px rgba(14, 165, 233, 0.05)`,
  shadowHover: `0 20px 25px -5px rgba(14, 165, 233, 0.15), 0 10px 10px -5px rgba(14, 165, 233, 0.08)`,
  shadowButton: `0 4px 6px -1px rgba(14, 165, 233, 0.3), 0 2px 4px -2px rgba(14, 165, 233, 0.2)`,
  shadowButtonHover: `0 10px 15px -3px rgba(14, 165, 233, 0.4), 0 4px 6px -4px rgba(14, 165, 233, 0.3)`,
  shadowFocus: `0 0 0 4px rgba(14, 165, 233, 0.2)`,

  // Highlight
  highlight: PRIMARY_COLORS[50],
  highlightHover: PRIMARY_COLORS[100],

  // Scrollbar
  scrollbarTrack: LIGHT_SURFACE_COLORS[100],
  scrollbarThumb: LIGHT_SURFACE_COLORS[400],
  scrollbarThumbHover: PRIMARY_COLORS[500]
} as const;

// ========================================
// 🌙 SEMANTIC COLORS - Dark Mode
// ========================================
export const DARK_THEME = {
  // Primary
  primary: PRIMARY_COLORS[400],
  primaryHover: PRIMARY_COLORS[300],
  primaryActive: PRIMARY_COLORS[200],
  primaryContrast: DARK_SURFACE_COLORS[900],

  // Background
  background: `linear-gradient(135deg, ${DARK_SURFACE_COLORS[900]} 0%, ${DARK_SURFACE_COLORS[800]} 50%, ${DARK_SURFACE_COLORS[700]} 100%)`,
  backgroundSolid: DARK_SURFACE_COLORS[950],

  // Text
  textPrimary: DARK_SURFACE_COLORS[50],
  textSecondary: DARK_SURFACE_COLORS[400],
  textMuted: DARK_SURFACE_COLORS[500],

  // Surface
  surfaceCard: DARK_SURFACE_COLORS[800],
  surface100: DARK_SURFACE_COLORS[700],
  surface200: DARK_SURFACE_COLORS[600],
  surfaceBorder: DARK_SURFACE_COLORS[600],

  // Gradients
  gradientPrimary: `linear-gradient(135deg, ${PRIMARY_COLORS[400]} 0%, ${PRIMARY_COLORS[300]} 100%)`,
  gradientReverse: `linear-gradient(135deg, ${DARK_SURFACE_COLORS[900]} 0%, ${DARK_SURFACE_COLORS[800]} 100%)`,

  // Shadows
  shadowCard: `0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.2)`,
  shadowHover: `0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)`,
  shadowButton: `0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.2)`,
  shadowButtonHover: `0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.3)`,
  shadowFocus: `0 0 0 4px rgba(56, 189, 248, 0.2)`,

  // Highlight
  highlight: 'color-mix(in srgb, ' + PRIMARY_COLORS[400] + ' 10%, transparent)',
  highlightHover: 'color-mix(in srgb, ' + PRIMARY_COLORS[400] + ' 20%, transparent)',

  // Scrollbar
  scrollbarTrack: DARK_SURFACE_COLORS[700],
  scrollbarThumb: DARK_SURFACE_COLORS[500],
  scrollbarThumbHover: PRIMARY_COLORS[400]
} as const;

// ========================================
// 🎯 HELPER FUNCTIONS
// ========================================

/**
 * Converte objeto de cores para CSS Variables
 */
export function generateCSSVariables(theme: typeof LIGHT_THEME, prefix = '--app') {
  return Object.entries(theme)
    .map(([key, value]) => `${prefix}-${kebabCase(key)}: ${value};`)
    .join('\n  ');
}

function kebabCase(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

// ========================================
// 📋 EXPORT CONFIGURAÇÕES
// ========================================

export const THEME_CONFIG = {
  light: LIGHT_THEME,
  dark: DARK_THEME,
  primary: PRIMARY_COLORS,
  lightSurface: LIGHT_SURFACE_COLORS,
  darkSurface: DARK_SURFACE_COLORS
} as const;

export type ThemeConfig = typeof THEME_CONFIG;
export type LightTheme = typeof LIGHT_THEME;
export type DarkTheme = typeof DARK_THEME;
