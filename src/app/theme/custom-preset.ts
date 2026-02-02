import { definePreset } from '@primeng/themes';
import Aura from '@primeng/themes/aura';

/**
 * Custom Preset baseado no Aura com paleta Sky para cores primárias
 *
 * ✨ Seguindo as melhores práticas do PrimeNG 21:
 * - Primary color: Sky (azul vibrante #0ea5e9 - céu claro)
 * - Surface colors: Zinc para light mode, Slate para dark mode
 * - Focus ring customizado para melhor acessibilidade
 * - Form fields com hover state em primary color
 * - Animações suaves para transições
 *
 * ⚠️ IMPORTANTE: Mantém estrutura colorScheme porque Aura define tokens assim
 * (Common Pitfall documentado - não ignorar essa estrutura)
 *
 * 🎨 CORES CONFIGURÁVEIS: Todas as cores vêm de ./theme-colors.ts
 * Para mudar o tema, edite apenas theme-colors.ts!
 */
export const CustomPreset = definePreset(Aura, {
  semantic: {
    // ✨ Paleta primária usando Sky - aplica-se a ambos light e dark
    primary: {
      50: '{sky.50}',    // #f0f9ff
      100: '{sky.100}',  // #e0f2fe
      200: '{sky.200}',  // #bae6fd
      300: '{sky.300}',  // #7dd3fc
      400: '{sky.400}',  // #38bdf8
      500: '{sky.500}',  // #0ea5e9 - COR PRINCIPAL
      600: '{sky.600}',  // #0284c7
      700: '{sky.700}',  // #0369a1
      800: '{sky.800}',  // #075985
      900: '{sky.900}',  // #0c4a6e
      950: '{sky.950}'   // #082f49
    },

    // 🎯 Focus ring customizado para melhor acessibilidade
    focusRing: {
      width: '2px',
      style: 'solid',
      color: '{primary.500}',
      offset: '2px',
      shadow: '0 0 0 0.2rem {primary.200}' // Sutil glow sky
    },

    // ⚡ Transições suaves globais
    transitionDuration: '0.2s',

    // 🎨 Tokens específicos por colorScheme (light/dark)
    colorScheme: {
      light: {
        // Surface palette para light mode (Zinc - neutro e moderno)
        surface: {
          0: '#ffffff',
          50: '{zinc.50}',   // #fafafa
          100: '{zinc.100}', // #f4f4f5
          200: '{zinc.200}', // #e4e4e7
          300: '{zinc.300}', // #d4d4d8
          400: '{zinc.400}', // #a1a1aa
          500: '{zinc.500}', // #71717a
          600: '{zinc.600}', // #52525b
          700: '{zinc.700}', // #3f3f46
          800: '{zinc.800}', // #27272a
          900: '{zinc.900}', // #18181b
          950: '{zinc.950}'  // #09090b
        },

        // 🎨 Tokens semânticos dentro de colorScheme.light
        primary: {
          color: '{sky.500}',          // #0ea5e9
          contrastColor: '#ffffff',
          hoverColor: '{sky.600}',     // #0284c7
          activeColor: '{sky.700}'     // #0369a1
        },

        highlight: {
          background: '{sky.50}',      // #f0f9ff - muito sutil
          focusBackground: '{sky.100}', // #e0f2fe
          color: '{sky.700}',          // #0369a1
          focusColor: '{sky.800}'      // #075985
        },

        formField: {
          hoverBorderColor: '{sky.500}', // #0ea5e9
          focusBorderColor: '{sky.600}'  // #0284c7
        }
      },

      dark: {
        // Surface palette para dark mode (Slate - tom azulado sutil)
        surface: {
          0: '#ffffff',
          50: '{slate.50}',   // #f8fafc
          100: '{slate.100}', // #f1f5f9
          200: '{slate.200}', // #e2e8f0
          300: '{slate.300}', // #cbd5e1
          400: '{slate.400}', // #94a3b8
          500: '{slate.500}', // #64748b
          600: '{slate.600}', // #475569
          700: '{slate.700}', // #334155
          800: '{slate.800}', // #1e293b
          900: '{slate.900}', // #0f172a
          950: '{slate.950}'  // #020617
        },

        // 🌙 Tokens semânticos dentro de colorScheme.dark
        primary: {
          color: '{sky.400}',          // #38bdf8 - mais claro para dark mode
          contrastColor: '{slate.900}',
          hoverColor: '{sky.300}',     // #7dd3fc
          activeColor: '{sky.200}'     // #bae6fd
        },

        highlight: {
          background: 'color-mix(in srgb, {sky.400} 10%, transparent)', // sky com transparência
          focusBackground: 'color-mix(in srgb, {sky.400} 20%, transparent)',
          color: '{sky.100}',          // #e0f2fe
          focusColor: '{sky.50}'       // #f0f9ff
        },

        formField: {
          hoverBorderColor: '{sky.400}', // #38bdf8
          focusBorderColor: '{sky.300}'  // #7dd3fc
        }
      }
    }
  }
});
