# Padrões do Projeto Angular 21 + PrimeNG

## Tecnologias e Versões
- Angular 21+ (Foco em Signals e Standalone Components).
- PrimeNG 18+ (Aura Theme).
- Jest para Testes Unitários.
- PrimeFlex para utilitários de CSS (Sem CSS/SCSS customizado).

## Regras de Codificação
- **Signals sobre RxJS**: Use `signal`, `computed`, `effect`, `input()`, `output()` e `model()`. Evite `BehaviorSubject` e `Observable` para estado local.
- **Injeção de Dependência**: Use a função `inject()` SEMPRE. NUNCA use injeção via constructor.
- **Componentes**: Sempre use `standalone: true`. Utilize o `control flow syntax` do Angular (@if, @for, @switch). NUNCA use *ngIf/*ngFor.
- **PrimeNG**: Use componentes nativos do PrimeNG (ex: `p-table`, `p-button`). Não crie wrappers desnecessários se o componente original atender.
- **Estilização**: Use APENAS classes do PrimeFlex. NUNCA crie CSS/SCSS customizado dentro dos componentes.
- **CommonModule**: NÃO importe CommonModule em standalone components (não é necessário).

## 🏗️ Arquitetura e Padrões

### State Management: SignalStore (@ngrx/signals)
- **SEMPRE use SignalStore** para gerenciamento de estado global ou de feature.
- Stores em `src/app/core/stores/` (JogosStore, FichasStore, ConfigStore).
- SignalStore centraliza estado, reduz boilerplate, integra-se nativamente com Signals.

### Business Logic: Business Services
- **Regras de negócio NUNCA vão nos componentes**.
- Services dedicados em `src/app/core/services/business/`:
  - `FichaCalculationService`: cálculos TEMPORÁRIOS (client-side preview)
  - `ParticipanteBusinessService`: regras de aprovação, validações
  - `ConfigValidationService`: validação de configurações
- Business services injetam API services e stores, mas **NÃO manipulam UI**.

### Facade Services: Simplificação de Telas Complexas
- **Use Facade Services** para telas complexas que consomem múltiplos stores/services.
- Facade Service agrega lógica de coordenação e expõe API simplificada.
- Providein: `component` (cada componente tem sua instância).
- Exemplos: `CharacterSheetFacadeService`, `GameManagementFacadeService`.

### Componentes: SEMPRE Dumb Components
- **Componentes são APENAS UI**: recebem dados via `input()`, emitem eventos via `output()`.
- **ZERO lógica de negócio ou chamadas HTTP** nos componentes.
- **ZERO acesso direto a stores** em componentes dumb (exceto smart/page components).
- Toda lógica de cálculos, validações, transformações vai nos services.

### ⚠️ Cálculos: Frontend Temporário vs Backend Oficial
**IMPORTANTE**: Cálculos de fórmulas (BBA, BBM, Ímpeto, vidaTotal, etc.) têm dois momentos:

1. **Cálculos TEMPORÁRIOS (Frontend)**:
   - Para feedback imediato enquanto usuário edita (antes de salvar)
   - `FichaCalculationService` (client-side)
   - NÃO PERSISTIDOS - apenas para display
   
2. **Cálculos OFICIAIS (Backend)**:
   - Após salvar (POST/PUT `/api/fichas/{id}`)
   - Backend recalcula TODOS os valores derivados
   - Frontend SUBSTITUI valores temporários pelos oficiais

**Regras**:
- ✅ Frontend pode calcular para preview (UX responsiva)
- ✅ Backend SEMPRE recalcula ao salvar (fonte oficial)
- ✅ Frontend SEMPRE usa valores do backend após save
- ❌ Frontend NUNCA persiste cálculos próprios

## Exemplos de Padrões

### ✅ Component Structure
```typescript
import { Component, inject, signal, computed } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [ButtonModule],
  template: `
    <div class="flex align-items-center gap-3">
      @if (isVisible()) {
        <p-button [label]="buttonLabel()" />
      }
    </div>
  `
})
export class ExampleComponent {
  private myService = inject(MyService);
  
  isVisible = signal(true);
  count = signal(0);
  buttonLabel = computed(() => `Count: ${this.count()}`);
}
```

### ❌ NUNCA Faça Assim
```typescript
// ❌ ERRADO - Constructor injection
constructor(private myService: MyService) {}

// ❌ ERRADO - BehaviorSubject
private countSubject = new BehaviorSubject<number>(0);

// ❌ ERRADO - *ngIf
<div *ngIf="isVisible">...</div>

// ❌ ERRADO - CSS customizado
styleUrl: './my-component.css'

// ❌ ERRADO - CommonModule em standalone
imports: [CommonModule, ButtonModule]
```

## Testes (Jest)
- Use o padrão "Arrange-Act-Assert".
- Mocke serviços usando `jest.fn()`.

## 🛡️ Segurança Frontend (Angular + PrimeNG) - IMPLEMENTADO

### ✅ Proteções Ativas
- **XSS:** NUNCA use `[innerHTML]`. Prefira interpolação `{{ }}`. Se necessário, use `SanitizerService.sanitizeHtml()`.
- **CSRF:** Configurado automaticamente no `authInterceptor` - lê token XSRF-TOKEN do cookie e adiciona nas requisições POST/PUT/DELETE/PATCH.
- **Data Exposure:** NUNCA armazene JWT ou informações sensíveis no `localStorage`. Use APENAS Signals em memória. Backend gerencia sessão via HttpOnly Cookies.
- **Error Handling:** `GlobalErrorHandler` implementado - não expõe stack traces ao usuário.
- **Idle Timeout:** `IdleService` implementado - logout automático após 30 min de inatividade.
- **CSP:** Content Security Policy configurado no `index.html`.

### Services Disponíveis
- `AuthService` - Autenticação com Signals (currentUser, isAuthenticated, isMestre, isJogador)
- `SanitizerService` - Sanitização segura de HTML/URLs
- `IdleService` - Monitoramento de inatividade
- `GlobalErrorHandler` - Tratamento global de erros

### ❌ NUNCA Faça
```typescript
// ❌ localStorage com dados sensíveis
localStorage.setItem('user', JSON.stringify(user));

// ❌ innerHTML sem sanitizar
<div [innerHTML]="userInput"></div>

// ❌ BehaviorSubject para estado
private user$ = new BehaviorSubject<User>(null);
```

### ✅ SEMPRE Faça
```typescript
// ✅ Signals em memória
private userSignal = signal<User | null>(null);

// ✅ Sanitizar HTML
<div [innerHTML]="sanitizer.sanitizeHtml(userInput)"></div>

// ✅ Usar serviços de segurança
private idleService = inject(IdleService);
```

## PrimeFlex - Classes Principais

### Layout
- `flex flex-column` - Flexbox
- `align-items-center justify-content-center` - Alinhamento
- `gap-2 gap-3 gap-4` - Espaçamento entre elementos
- `min-h-screen` - Altura mínima da tela

### Grid
- `grid` - Grid layout
- `col-12 md:col-6 lg:col-4` - Colunas responsivas

### Spacing
- `p-2 p-3 p-4` - Padding
- `m-0 m-2 mt-4 mb-3` - Margin

### Typography
- `text-xl text-2xl text-3xl` - Tamanhos de texto
- `font-bold font-semibold` - Pesos
- `text-center` - Alinhamento
- `text-color text-color-secondary` - Cores

### Colors & Background
- `surface-ground surface-card` - Backgrounds
- `text-primary` - Cor primária

### Responsive
- `hidden md:block` - Visibilidade responsiva
- `md:w-6 lg:w-4` - Largura responsiva

## Referências de Documentação
Ao gerar componentes PrimeNG, utilize as definições das versões mais recentes (v18+):
- Contexto Geral: https://primeng.org/llm.txt
- Guia de Migração/Estilo: https://primeng.org/tailwind
- Use o modo "Styled" com o tema **Aura** (não Lara), a menos que especificado "Unstyled".
- **IMPORTANTE:** PrimeNG 21+ NÃO usa imports de CSS (primeng.min.css). O tema é configurado em app.config.ts com `providePrimeNG({ theme: { preset: Aura } })`
