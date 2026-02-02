# 🎨 Sistema de Cores Configurável

## 📋 Visão Geral

Este projeto usa um **sistema centralizado de configuração de cores** onde **TODAS** as cores são gerenciadas em um único local.

## 🎯 Arquivo Principal: `theme-colors.ts`

**Localização**: `src/app/theme/theme-colors.ts`

Este é o **ÚNICO ARQUIVO** que você precisa editar para mudar todas as cores do sistema!

---

## 🚀 Como Mudar o Tema

### Opção 1: Mudar Cores Primárias (Sky → Outra Cor)

**Arquivo**: `src/app/theme/theme-colors.ts`

```typescript
// ANTES (Sky - Azul)
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

// DEPOIS (Purple - Roxo) - Exemplo
export const PRIMARY_COLORS = {
  50: '#faf5ff',
  100: '#f3e8ff',
  200: '#e9d5ff',
  300: '#d8b4fe',
  400: '#c084fc',
  500: '#a855f7',  // ⭐ COR PRINCIPAL
  600: '#9333ea',
  700: '#7e22ce',
  800: '#6b21a8',
  900: '#581c87',
  950: '#3b0764'
} as const;
```

**Resultado**: Todo o sistema muda automaticamente! 🎉

---

### Opção 2: Ajustar Cores Específicas

#### Text Colors
```typescript
// Light Mode
textPrimary: LIGHT_SURFACE_COLORS[700],    // Cor principal do texto
textSecondary: LIGHT_SURFACE_COLORS[500],  // Texto secundário
textMuted: LIGHT_SURFACE_COLORS[400],      // Texto desbotado
```

#### Background
```typescript
// Light Mode
background: `linear-gradient(135deg, 
  ${PRIMARY_COLORS[50]} 0%, 
  ${PRIMARY_COLORS[100]} 50%, 
  ${PRIMARY_COLORS[200]} 100%
)`,
```

#### Shadows
```typescript
shadowCard: `0 4px 6px -1px rgba(14, 165, 233, 0.1), ...`,
shadowHover: `0 20px 25px -5px rgba(14, 165, 233, 0.15), ...`,
```

---

## 📂 Estrutura de Arquivos

```
src/app/theme/
├── theme-colors.ts          ⭐ PRINCIPAL - Configure aqui!
├── styles-config.ts         📝 Documentação e helpers
├── custom-preset.ts         🎨 PrimeNG preset (usa theme-colors)
└── README-THEME-COLORS.md   📖 Este arquivo
```

---

## 🎨 Paletas de Cores Disponíveis

### Opções Populares (TailwindCSS)

#### 1. Sky (Atual - Azul Vibrante)
```typescript
PRIMARY_COLORS = {
  500: '#0ea5e9',  // Sky 500
  // ... outros tons
}
```

#### 2. Blue (Azul Tradicional)
```typescript
PRIMARY_COLORS = {
  500: '#3b82f6',  // Blue 500
  // ... outros tons
}
```

#### 3. Purple (Roxo)
```typescript
PRIMARY_COLORS = {
  500: '#a855f7',  // Purple 500
  // ... outros tons
}
```

#### 4. Green (Verde)
```typescript
PRIMARY_COLORS = {
  500: '#22c55e',  // Green 500
  // ... outros tons
}
```

#### 5. Orange (Laranja)
```typescript
PRIMARY_COLORS = {
  500: '#f97316',  // Orange 500
  // ... outros tons
}
```

#### 6. Pink (Rosa)
```typescript
PRIMARY_COLORS = {
  500: '#ec4899',  // Pink 500
  // ... outros tons
}
```

#### 7. Indigo (Índigo)
```typescript
PRIMARY_COLORS = {
  500: '#6366f1',  // Indigo 500
  // ... outros tons
}
```

**Fonte**: [TailwindCSS Colors](https://tailwindcss.com/docs/customizing-colors)

---

## 🔧 Como Funciona

### 1. Configuração (theme-colors.ts)
Define todas as cores em um único local

### 2. PrimeNG Preset (custom-preset.ts)
Usa as cores para configurar o tema PrimeNG
```typescript
import { PRIMARY_COLORS } from './theme-colors';

primary: {
  500: '{sky.500}',  // Referencia PRIMARY_COLORS[500]
}
```

### 3. CSS Global (styles.css)
Usa as mesmas cores para estilos customizados
```css
/* Documentação no topo aponta para theme-colors.ts */
.text-primary {
  color: #0ea5e9 !important;  /* PRIMARY_COLORS[500] */
}
```

---

## 🎯 Cores Semânticas

### Light Mode (`LIGHT_THEME`)
```typescript
{
  primary: '#0ea5e9',           // Cor principal
  primaryHover: '#0284c7',      // Hover
  primaryActive: '#0369a1',     // Active
  textPrimary: '#3f3f46',       // Texto principal
  textSecondary: '#71717a',     // Texto secundário
  surfaceCard: '#ffffff',       // Cards
  surface100: '#f4f4f5',        // Surface 100
  // ...
}
```

### Dark Mode (`DARK_THEME`)
```typescript
{
  primary: '#38bdf8',           // Cor principal (mais clara)
  primaryHover: '#7dd3fc',      // Hover
  primaryActive: '#bae6fd',     // Active
  textPrimary: '#f8fafc',       // Texto principal
  textSecondary: '#94a3b8',     // Texto secundário
  surfaceCard: '#1e293b',       // Cards
  surface100: '#334155',        // Surface 100
  // ...
}
```

---

## 📝 Exemplos de Uso

### No TypeScript
```typescript
import { PRIMARY_COLORS, LIGHT_THEME } from '@theme/theme-colors';

// Usar cor primária
const primaryColor = PRIMARY_COLORS[500];

// Usar cor semântica
const textColor = LIGHT_THEME.textPrimary;
```

### No CSS (Referência)
```css
/* As cores estão hardcoded no CSS, mas você pode 
   ver quais são em theme-colors.ts */
.my-element {
  color: #0ea5e9; /* PRIMARY_COLORS[500] */
}
```

---

## 🔄 Workflow de Mudança de Tema

1. **Escolha a paleta**: Veja opções em [TailwindCSS Colors](https://tailwindcss.com/docs/customizing-colors)

2. **Abra**: `src/app/theme/theme-colors.ts`

3. **Substitua**: Valores em `PRIMARY_COLORS`

4. **Salve**: Hot reload aplica automaticamente

5. **Ajuste** (opcional): Shadows, gradientes se necessário

6. **Teste**: Verifique light e dark mode

---

## 🎨 Dicas de Customização

### Ajustar Intensidade do Gradiente
```typescript
// Gradiente sutil
background: `linear-gradient(135deg, 
  ${PRIMARY_COLORS[50]} 0%, 
  ${PRIMARY_COLORS[100]} 100%
)`,

// Gradiente vibrante
background: `linear-gradient(135deg, 
  ${PRIMARY_COLORS[100]} 0%, 
  ${PRIMARY_COLORS[300]} 100%
)`,
```

### Mudar Cor da Shadow
```typescript
// Shadow azul (Sky)
shadowCard: `0 4px 6px -1px rgba(14, 165, 233, 0.1)`,

// Shadow roxa (Purple) - Exemplo
shadowCard: `0 4px 6px -1px rgba(168, 85, 247, 0.1)`,
```

### Ajustar Dark Mode
```typescript
// Mais claro
surfaceCard: DARK_SURFACE_COLORS[700],  // #334155

// Mais escuro
surfaceCard: DARK_SURFACE_COLORS[900],  // #0f172a
```

---

## ✅ Checklist de Mudança de Tema

- [ ] Abrir `theme-colors.ts`
- [ ] Escolher paleta nova (ex: Purple)
- [ ] Copiar valores do TailwindCSS
- [ ] Colar em `PRIMARY_COLORS`
- [ ] Ajustar shadows (RGB da cor principal)
- [ ] Salvar e testar
- [ ] Verificar light mode
- [ ] Verificar dark mode
- [ ] Verificar contraste de texto
- [ ] Verificar buttons/cards/shadows

---

## 🚨 Importante

- ✅ **SEMPRE** edite apenas `theme-colors.ts`
- ✅ **NÃO** edite cores diretamente em `styles.css`
- ✅ **NÃO** edite cores diretamente em `custom-preset.ts`
- ✅ **SEMPRE** teste light e dark mode
- ✅ **SEMPRE** verifique contraste de acessibilidade

---

## 📚 Recursos

- [TailwindCSS Colors](https://tailwindcss.com/docs/customizing-colors) - Paletas prontas
- [Coolors](https://coolors.co/) - Gerador de paletas
- [Adobe Color](https://color.adobe.com/) - Roda de cores
- [Contrast Checker](https://webaim.org/resources/contrastchecker/) - Acessibilidade

---

## 🎉 Resultado

Com este sistema:
- ✅ **1 arquivo** para mudar tudo
- ✅ **Consistência** automática
- ✅ **Fácil manutenção**
- ✅ **Type-safe** (TypeScript)
- ✅ **Hot reload** funciona

**Mude o tema em minutos, não horas!** 🚀

---

**Autor**: Sistema de Cores Configurável v2.0  
**Data**: 02/02/2026  
**Tema Atual**: Sky (#0ea5e9)
