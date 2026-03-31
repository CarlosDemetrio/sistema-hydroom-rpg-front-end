import { definePreset } from '@primeng/themes';
import Aura from '@primeng/themes/aura';

/**
 * Custom Preset – Klayrah RPG Design System
 *
 * Light mode : primary = Sky  (azul vibrante, #0ea5e9)
 * Dark mode  : primary = Amber/Gold (#f59e0b) — identidade RPG de mesa
 *
 * Surface:
 *   Light → Zinc  (neutro e moderno)
 *   Dark  → tons navy/slate escuros customizados via CSS vars
 *
 * O darkModeSelector é '.app-dark' (configurado no app.config.ts).
 * O body recebe essa classe por padrão ao inicializar em dark mode.
 */
export const CustomPreset = definePreset(Aura, {
  semantic: {
    // Paleta primária base (usada no light mode)
    primary: {
      50:  '{sky.50}',
      100: '{sky.100}',
      200: '{sky.200}',
      300: '{sky.300}',
      400: '{sky.400}',
      500: '{sky.500}',   // #0ea5e9
      600: '{sky.600}',
      700: '{sky.700}',
      800: '{sky.800}',
      900: '{sky.900}',
      950: '{sky.950}'
    },

    // Focus ring acessível
    focusRing: {
      width: '2px',
      style: 'solid',
      color: '{primary.500}',
      offset: '2px',
      shadow: 'none'
    },

    transitionDuration: '0.2s',

    colorScheme: {
      // ---- LIGHT ------------------------------------------------
      light: {
        surface: {
          0:   '#ffffff',
          50:  '{zinc.50}',
          100: '{zinc.100}',
          200: '{zinc.200}',
          300: '{zinc.300}',
          400: '{zinc.400}',
          500: '{zinc.500}',
          600: '{zinc.600}',
          700: '{zinc.700}',
          800: '{zinc.800}',
          900: '{zinc.900}',
          950: '{zinc.950}'
        },
        primary: {
          color:         '{sky.500}',
          contrastColor: '#ffffff',
          hoverColor:    '{sky.600}',
          activeColor:   '{sky.700}'
        },
        highlight: {
          background:      '{sky.50}',
          focusBackground: '{sky.100}',
          color:           '{sky.700}',
          focusColor:      '{sky.800}'
        },
        formField: {
          hoverBorderColor: '{sky.500}',
          focusBorderColor: '{sky.600}'
        }
      },

      // ---- DARK (identidade RPG âmbar/dourado) ------------------
      dark: {
        surface: {
          0:   '#ffffff',
          50:  '#dde3f0',
          100: '#b0bdd6',
          200: '#8494bc',
          300: '#5a6e9e',
          400: '#3d4e7a',
          500: '#2e3a60',
          600: '#253050',
          700: '#1e2740',
          800: '#161d30',
          900: '#0f1625',
          950: '#0a0e1a'
        },
        primary: {
          color:         '{amber.400}',   // #fbbf24
          contrastColor: '#0a0e1a',
          hoverColor:    '{amber.300}',   // #fcd34d
          activeColor:   '{amber.200}'    // #fde68a
        },
        highlight: {
          background:      'color-mix(in srgb, {amber.400} 12%, transparent)',
          focusBackground: 'color-mix(in srgb, {amber.400} 22%, transparent)',
          color:           '{amber.200}',
          focusColor:      '{amber.100}'
        },
        formField: {
          hoverBorderColor: '{amber.400}',
          focusBorderColor: '{amber.300}'
        }
      }
    }
  }
});
