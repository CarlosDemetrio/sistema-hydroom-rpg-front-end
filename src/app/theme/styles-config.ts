/**
 * Gerador de Estilos CSS a partir de Configuração Centralizada
 *
 * ✨ Este arquivo gera CSS dinamicamente usando as cores de theme-colors.ts
 */

import { LIGHT_THEME, DARK_THEME, PRIMARY_COLORS } from './theme-colors';

/**
 * Gera CSS Variables para o tema
 */
export function generateThemeCSS(): string {
  return `
/* ========================================
   CSS VARIABLES - Generated from theme-colors.ts
   ======================================== */

:root {
  /* Primary Colors */
  --app-primary: ${LIGHT_THEME.primary};
  --app-primary-hover: ${LIGHT_THEME.primaryHover};
  --app-primary-active: ${LIGHT_THEME.primaryActive};
  --app-primary-contrast: ${LIGHT_THEME.primaryContrast};

  /* Background */
  --app-background: ${LIGHT_THEME.backgroundSolid};

  /* Text */
  --app-text-primary: ${LIGHT_THEME.textPrimary};
  --app-text-secondary: ${LIGHT_THEME.textSecondary};

  /* Surface */
  --app-surface-card: ${LIGHT_THEME.surfaceCard};
  --app-surface-100: ${LIGHT_THEME.surface100};
  --app-surface-border: ${LIGHT_THEME.surfaceBorder};
}

.app-dark {
  /* Primary Colors */
  --app-primary: ${DARK_THEME.primary};
  --app-primary-hover: ${DARK_THEME.primaryHover};
  --app-primary-active: ${DARK_THEME.primaryActive};
  --app-primary-contrast: ${DARK_THEME.primaryContrast};

  /* Background */
  --app-background: ${DARK_THEME.backgroundSolid};

  /* Text */
  --app-text-primary: ${DARK_THEME.textPrimary};
  --app-text-secondary: ${DARK_THEME.textSecondary};

  /* Surface */
  --app-surface-card: ${DARK_THEME.surfaceCard};
  --app-surface-100: ${DARK_THEME.surface100};
  --app-surface-border: ${DARK_THEME.surfaceBorder};
}
`;
}

/**
 * Documentação das cores disponíveis para uso no CSS
 */
export const CSS_COLOR_GUIDE = `
/*
 * ========================================
 * 🎨 GUIA DE CORES CONFIGURÁVEIS
 * ========================================
 *
 * Todas as cores abaixo são configuráveis em:
 * src/app/theme/theme-colors.ts
 *
 * Para usar no CSS/SCSS:
 * - color: ${PRIMARY_COLORS[500]};
 * - background: ${LIGHT_THEME.primary};
 *
 * Light Mode:
 * - Background Gradient: ${LIGHT_THEME.background}
 * - Primary: ${LIGHT_THEME.primary}
 * - Text: ${LIGHT_THEME.textPrimary}
 * - Surface Card: ${LIGHT_THEME.surfaceCard}
 *
 * Dark Mode:
 * - Background Gradient: ${DARK_THEME.background}
 * - Primary: ${DARK_THEME.primary}
 * - Text: ${DARK_THEME.textPrimary}
 * - Surface Card: ${DARK_THEME.surfaceCard}
 *
 * Shadows (Light):
 * - Card: ${LIGHT_THEME.shadowCard}
 * - Hover: ${LIGHT_THEME.shadowHover}
 * - Button: ${LIGHT_THEME.shadowButton}
 * - Focus: ${LIGHT_THEME.shadowFocus}
 *
 * ========================================
 */
`;

export { LIGHT_THEME, DARK_THEME, PRIMARY_COLORS };
