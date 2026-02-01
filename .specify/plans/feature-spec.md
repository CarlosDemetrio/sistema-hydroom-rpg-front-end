# Feature Specification: Complete Frontend for RPG Character Sheet System

## Executive Summary
Develop a complete Angular 21+ frontend for a configurable RPG character sheet system with PrimeNG UI components, supporting dual-role users (Mestre/Jogador), mobile-first responsive design, and full integration with an existing Spring Boot backend.

## Background & Context

### Existing Backend (Spring Boot)
- **Authentication**: OAuth2 with Google, httpOnly cookies, CSRF protection
- **User Management**: Users with dual roles (Mestre/Jogador)
- **Game Management**: CRUD for games, participant approval system
- **Character Sheets**: Fully configurable system with 13+ entity types
- **Configuration System**: All game mechanics configurable via database tables (no hardcoded JSON)

### Current Frontend State
- Basic structure: auth guards, interceptors, pages (login, home, oauth-callback, unauthorized, not-found)
- Angular 21 with Signals and Standalone Components
- PrimeNG 18+ with Aura theme
- PrimeFlex for CSS utilities
- Authentication flow working

### Legacy System (React)
Previous version had 13 sections in character sheet with complex calculations and responsive mobile interface. User feedback: "Very usable on mobile, clear navigation".

## Problem Statement
Users need a complete, production-ready web application to:
1. **Mestre (Game Master)**: Create/manage games, approve players, configure game system, view all character sheets
2. **Jogador (Player)**: Create/edit own character sheets, join games, view own characters only
3. **Both**: Switch roles dynamically, use system on mobile devices efficiently

## Goals & Success Criteria

### Primary Goals
1. ✅ Complete CRUD for Games (Mestre only)
2. ✅ Complete CRUD for Character Sheets (Jogador owns, Mestre views all)
3. ✅ Configuration panel for system mechanics (Mestre only)
4. ✅ Mobile-optimized interface (especially character sheet)
5. ✅ Role switching without re-login

### Success Metrics
- **Performance**: < 3s initial load on 3G
- **Mobile UX**: Single-hand operation for 80% of player actions
- **Code Quality**: 70%+ test coverage on services
- **Accessibility**: WCAG 2.1 AA compliance
- **User Satisfaction**: Pilot users rate mobile experience 4/5+

## Functional Requirements

### FR1: Authentication & Authorization
- FR1.1: OAuth2 login with Google (existing)
- FR1.2: Role-based routing (Mestre/Jogador)
- FR1.3: Role switcher component in header/sidebar
- FR1.4: Session management with idle timeout (30 min)
- FR1.5: Logout functionality

### FR2: Dashboard
- FR2.1: Mestre dashboard shows: games list, stats, recent activity
- FR2.2: Jogador dashboard shows: my characters, game invitations, quick actions
- FR2.3: Responsive layout with PrimeNG cards/grids

### FR3: Game Management (Mestre)
- FR3.1: List all games with filters (status, date)
- FR3.2: Create game form (name, description, system config)
- FR3.3: Edit game details
- FR3.4: Delete game (with confirmation)
- FR3.5: Manage participants (approve/reject requests)
- FR3.6: View game's character sheets

### FR4: Character Sheet Management (Jogador)
- FR4.1: List my character sheets
- FR4.2: Create new character (wizard with steps):
  - Step 1: Identification (name, player, origin, alignment, lineage, presence, heroic tier)
  - Step 2: Attributes (7 configurable attributes with base/level/others/total)
  - Step 3: Health (life, blood %, limb integrity)
  - Step 4: Skills/Aptitudes (24 configurable skills)
  - Step 5: Equipment (weapons, armor, resistances)
  - Step 6: Advantages/Abilities (purchasable with XP)
  - Step 7: Titles & Runes
  - Step 8: Notes & Summary
- FR4.3: Edit character (same sections, tabbed interface)
- FR4.4: View character (read-only formatted display)
- FR4.5: Delete character (with confirmation)
- FR4.6: Auto-calculate derived stats (Ímpeto, BBA, BBM, Reflexo, etc.)

### FR5: Game Participation (Jogador)
- FR5.1: Browse available games
- FR5.2: Request to join game (select character)
- FR5.3: View invitation status
- FR5.4: Leave game

### FR6: Configuration Panel (Mestre)
- FR6.1: Manage Attributes (name, formula, order)
- FR6.2: Manage Aptitudes/Skills (name, type, category)
- FR6.3: Manage Levels/XP (level thresholds, bonuses)
- FR6.4: Manage Limiters (growth constraints)
- FR6.5: Manage Classes (name, bonuses, requirements)
- FR6.6: Manage Advantages (name, cost, effects, categories)
- FR6.7: Manage Races (name, bonuses, restrictions)
- FR6.8: Manage Prospecting Dice (D4, D6, D8, D10, D12 rules)
- FR6.9: Manage Presences (aura types, effects)
- FR6.10: Manage Genders (character options)

### FR7: Responsive Design
- FR7.1: Desktop (>1024px): Multi-column layouts, side-by-side forms
- FR7.2: Tablet (768-1024px): Adaptive grid, collapsible sidebars
- FR7.3: Mobile (<768px): Single column, bottom navigation, accordions for sections
- FR7.4: Touch-optimized inputs (larger tap targets, native pickers)

### FR8: User Feedback
- FR8.1: Toast notifications (success/error/info/warning)
- FR8.2: Loading spinners for async operations
- FR8.3: Confirmation dialogs for destructive actions
- FR8.4: Form validation messages
- FR8.5: Skeleton loaders for initial data fetch

## Non-Functional Requirements

### NFR1: Performance
- Initial bundle size < 500KB gzipped
- Lazy load feature modules
- API response caching (5 min TTL for config data)
- Debounce search inputs (300ms)

### NFR2: Security
- All sensitive operations require authentication
- Role guards on routes
- Sanitize user inputs (XSS prevention)
- CSRF token handling (existing interceptor)
- No sensitive data in localStorage

### NFR3: Maintainability
- Strict TypeScript mode
- ESLint + Prettier configured
- Component size < 300 lines
- Service size < 500 lines
- No duplicate code (DRY principle)

### NFR4: Testability
- Unit tests for services (70% coverage)
- Unit tests for complex components (50% coverage)
- Mock data factories for testing
- Integration test for auth flow

### NFR5: Accessibility
- ARIA labels on interactive elements
- Keyboard navigation support
- Color contrast ratio > 4.5:1
- Screen reader compatible

## User Stories

### Epic 1: Mestre Workflows
**US1.1**: As a Mestre, I want to create a new game so that players can join and create characters.
- **AC**: Form with name, description, system config selection; validation; success message

**US1.2**: As a Mestre, I want to approve player join requests so that I control who participates.
- **AC**: List of pending requests; approve/reject buttons; updates participant list

**US1.3**: As a Mestre, I want to configure game attributes so that the system matches my RPG variant.
- **AC**: CRUD interface for attributes; preview calculated stats; save/reset

**US1.4**: As a Mestre, I want to view all character sheets in my game so that I can prepare sessions.
- **AC**: Filterable list; click to view full sheet; export option

### Epic 2: Jogador Workflows
**US2.1**: As a Jogador, I want to create a character sheet step-by-step so that I don't feel overwhelmed.
- **AC**: Wizard with 8 steps; back/next navigation; save draft; preview

**US2.2**: As a Jogador, I want to edit my character on mobile easily so that I can update during sessions.
- **AC**: Tabbed sections; large input fields; numeric keypad for numbers; auto-save

**US2.3**: As a Jogador, I want to see calculated stats auto-update so that I don't need to do math.
- **AC**: Change attribute → recalculates bonuses; real-time; shows formula on hover

**US2.4**: As a Jogador, I want to join a game so that I can play with my group.
- **AC**: Browse games; request join with character selection; notification on approval

### Epic 3: Dual-Role User
**US3.1**: As a user with both roles, I want to switch between Mestre and Jogador views so that I don't need separate accounts.
- **AC**: Role switcher in header; persists choice in session; updates available routes

## Technical Architecture

### Frontend Stack
- **Framework**: Angular 21+ (Signals, Standalone Components)
- **UI Library**: PrimeNG 18+ (Aura theme)
- **CSS**: PrimeFlex (utility-first)
- **State Management**: SignalStore (@ngrx/signals)
- **Forms**: Reactive Forms (FormBuilder)
- **HTTP**: HttpClient with interceptors
- **Testing**: Jest + @testing-library/angular
- **Build**: Angular CLI with esbuild

### Architectural Patterns

#### 1. State Management: SignalStore
- **SEMPRE use SignalStore** (`@ngrx/signals`) para gerenciamento de estado.
- Centraliza estado, reduz boilerplate, integra-se nativamente com Signals.
- Stores em `src/app/core/stores/`:
  - `JogosStore`: estado de jogos, participantes, filtros
  - `FichasStore`: estado de fichas, ficha atual em edição
  - `ConfigStore`: estado de todas as configurações do sistema
  - `UserStore`: estado do usuário logado, preferências

#### 2. Business Logic: Business Services
- **Regras de negócio NUNCA vão nos componentes**.
- Services dedicados em `src/app/core/services/business/`:
  - `FichaCalculationService`: cálculos de atributos, fórmulas, stats derivadas
  - `ParticipanteBusinessService`: regras de aprovação, validações de join
  - `ConfigValidationService`: validação de configurações, consistência
  - `FormulaParserService`: parse e execução de fórmulas configuráveis
- Business services injetam API services e stores, mas **não manipulam UI**.

#### 3. Facade Services: Simplificação de Telas Complexas
- **Use Facade Services** para telas muito complexas que consomem múltiplos stores/services.
- Facade Service agrega lógica de coordenação e expõe uma API simplificada.
- Providein: `component` (cada componente tem sua instância).
- Exemplos:
  - `CharacterSheetFacadeService`: coordena FichasStore + ConfigStore + FichaCalculationService
  - `GameManagementFacadeService`: coordena JogosStore + ParticipanteBusinessService
  - `ConfigurationFacadeService`: coordena ConfigStore + ConfigValidationService

#### 4. Componentes: SEMPRE Dumb Components
- **Componentes são APENAS UI**: recebem dados via `input()`, emitem eventos via `output()`.
- **ZERO lógica de negócio ou chamadas HTTP** nos componentes.
- **ZERO acesso direto a stores** em componentes dumb (exceto smart/page components).
- Toda lógica de cálculos, validações, transformações vai nos services.
- Tipos de componentes:
  - **Dumb Components** (`src/app/shared/components/`): Apenas UI, inputs/outputs
  - **Smart/Page Components** (`src/app/features/*/pages/`): Injetam stores/facades, orquestram fluxo

#### Data Flow Architecture
```
Backend API
    ↓
API Services (src/app/core/services/api/)
    ↓
SignalStores (src/app/core/stores/)
    ↓
Business Services (src/app/core/services/business/) [optional]
    ↓
Facade Services (src/app/features/*/services/) [optional, for complex pages]
    ↓
Smart/Page Components (src/app/features/*/pages/)
    ↓
Dumb Components (src/app/shared/components/)
```

### Project Structure
```
src/app/
├── core/                  # Singleton services, guards, interceptors
│   ├── guards/
│   ├── interceptors/
│   ├── services/
│   │   ├── api/          # HTTP services (JogosApiService, FichasApiService, ConfigApiService)
│   │   └── business/     # Business logic (FichaCalculationService, ParticipanteBusinessService)
│   ├── stores/           # SignalStores (JogosStore, FichasStore, ConfigStore)
│   └── models/           # Shared interfaces/types
├── shared/               # Reusable components, pipes, directives
│   ├── components/       # Dumb UI components (loading, confirm-dialog, etc.)
│   ├── pipes/
│   └── directives/
├── features/             # Feature modules (lazy loaded)
│   ├── dashboard/
│   │   ├── pages/        # Smart components
│   │   └── components/   # Feature-specific dumb components
│   ├── games/
│   │   ├── pages/
│   │   ├── components/
│   │   └── services/     # Facade services (GameManagementFacadeService)
│   ├── character-sheets/
│   │   ├── pages/
│   │   ├── components/
│   │   └── services/     # Facade services (CharacterSheetFacadeService)
│   ├── configuration/
│   │   ├── pages/
│   │   ├── components/
│   │   └── services/     # Facade services (ConfigurationFacadeService)
│   └── profile/
└── pages/                # Top-level pages (login, home, 404, etc.)
```

### Backend API Endpoints (Expected)
```
# Authentication
POST   /api/auth/login          # OAuth2 redirect
GET    /api/auth/me             # Current user info
POST   /api/auth/logout         # End session

# Games
GET    /api/jogos               # List games (filtered by role)
POST   /api/jogos               # Create game (Mestre)
GET    /api/jogos/{id}          # Get game details
PUT    /api/jogos/{id}          # Update game (Mestre)
DELETE /api/jogos/{id}          # Delete game (Mestre)

# Participants
GET    /api/jogos/{id}/participantes       # List participants
POST   /api/jogos/{id}/participantes       # Request to join (Jogador)
PUT    /api/jogos/{id}/participantes/{pid} # Approve/reject (Mestre)
DELETE /api/jogos/{id}/participantes/{pid} # Leave/remove

# Character Sheets
GET    /api/fichas                         # List sheets (filtered by ownership)
POST   /api/fichas                         # Create sheet
GET    /api/fichas/{id}                    # Get sheet details
PUT    /api/fichas/{id}                    # Update sheet
DELETE /api/fichas/{id}                    # Delete sheet

# Configuration (Mestre only)
GET    /api/config/atributos               # List attributes config
POST   /api/config/atributos               # Create attribute
PUT    /api/config/atributos/{id}          # Update attribute
DELETE /api/config/atributos/{id}          # Delete attribute

# Similar CRUD for:
# - /api/config/aptidoes
# - /api/config/niveis
# - /api/config/limitadores
# - /api/config/classes
# - /api/config/vantagens
# - /api/config/racas
# - /api/config/prospeccao
# - /api/config/presencas
# - /api/config/generos
```

## UI/UX Requirements

### Color Palette (Aura Theme)
- Primary: PrimeNG Aura default
- Success: Green tones
- Warning: Amber tones
- Danger: Red tones
- Neutral: Gray tones

### Typography
- Headings: Aura theme defaults
- Body: 16px base (mobile), 14px (desktop)
- Monospace: For dice notation (1d20, 2d6+3)

### Components to Use (PrimeNG)
- **Navigation**: Menubar, Breadcrumb, Steps (wizard)
- **Data Display**: Table, DataView, Card, Panel, Accordion
- **Forms**: InputText, InputNumber, Dropdown, MultiSelect, Checkbox, RadioButton, Calendar, InputTextarea
- **Buttons**: Button, SplitButton, ToggleButton
- **Overlays**: Dialog, ConfirmDialog, Sidebar, Toast
- **Feedback**: ProgressBar, ProgressSpinner, Message, Skeleton
- **Misc**: Avatar, Badge, Chip, Divider, Tag

### Mobile Optimizations
- Bottom navigation bar (sticky)
- Pull-to-refresh on lists
- Swipe gestures for delete/edit
- Collapsible sections with expand/collapse all
- Large tap targets (min 48x48px)
- Native date/number pickers

## Data Models (Frontend Interfaces)

### Core Entities
```typescript
// User
interface User {
  id: number;
  nome: string;
  email: string;
  avatarUrl?: string;
  roles: ('MESTRE' | 'JOGADOR')[];
  dataCriacao: Date;
}

// Game
interface Jogo {
  id: number;
  nome: string;
  descricao?: string;
  mestreId: number;
  mestre?: User;
  status: 'ATIVO' | 'PAUSADO' | 'FINALIZADO';
  dataCriacao: Date;
  participantes?: Participante[];
}

// Participant
interface Participante {
  id: number;
  jogoId: number;
  jogadorId: number;
  jogador?: User;
  fichaId?: number;
  ficha?: Ficha;
  status: 'PENDENTE' | 'APROVADO' | 'REJEITADO';
  dataParticipacao: Date;
}

// Character Sheet (simplified, nested structures)
interface Ficha {
  id: number;
  jogadorId: number;
  jogoId?: number;
  
  // Section 1: Identification
  nome: string;
  origem?: string;
  indole?: string;
  linhagem?: string;
  presencaId?: number;
  tipoHeroico?: string;
  
  // Section 2: Progress
  nivel: number;
  experiencia: number;
  limitadorId?: number;
  renascimento?: number;
  insolitus?: number;
  nvs?: number;
  
  // Section 3: Physical Description
  idade?: number;
  altura?: number;
  peso?: number;
  olhos?: string;
  cabelo?: string;
  
  // Section 4-13: Nested objects
  atributos: FichaAtributo[];
  vida: FichaVida;
  vidaMembros: FichaVidaMembro[];
  aptidoes: FichaAptidao[];
  equipamentos: FichaEquipamento[];
  vantagens: FichaVantagem[];
  titulos: FichaTitulo[];
  runas: FichaRuna[];
  anotacoes?: string;
  
  dataCriacao: Date;
  dataAtualizacao: Date;
}

// Attribute
interface FichaAtributo {
  id?: number;
  atributoConfigId: number;
  atributoConfig?: AtributoConfig;
  base: number;
  nivel: number;
  outros: number;
  total: number; // calculated
}

// Attribute Configuration
interface AtributoConfig {
  id: number;
  nome: string;
  abreviacao: string;
  ordem: number;
  formulaCalculo?: string;
  ativo: boolean;
}

// Similar interfaces for all configuration entities
```

## Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Backend API changes during development | Medium | High | Request OpenAPI spec upfront; use mock services |
| Mobile performance issues | Low | Medium | Profile early; lazy load; optimize images |
| Complex calculations cause bugs | Medium | High | Unit test all formulas; add formula validation in config |
| PrimeNG theme conflicts | Low | Low | Stick to PrimeFlex classes; avoid custom styles |
| User confusion with dual roles | Medium | Medium | Clear role indicator; prominent switcher; tooltips |

## Out of Scope (Future Phases)
- Real-time collaboration (WebSockets)
- Offline mode (PWA with service workers)
- Chat system
- Virtual dice roller
- Character sheet templates
- PDF export
- Image uploads for avatars
- Internationalization (i18n)
- Dark mode toggle

## Dependencies
- Backend API completion (Phase 1 endpoints: /api/auth, /api/jogos, /api/fichas)
- Backend API completion (Phase 2 endpoints: /api/config/*)
- PrimeNG 18+ stable release
- Angular 21+ stable release

## Acceptance Criteria (Overall)
1. ✅ All functional requirements implemented
2. ✅ Passes constitution gates (no violations)
3. ✅ 70%+ test coverage on services
4. ✅ Mobile responsive on iOS Safari and Android Chrome
5. ✅ No console errors in production build
6. ✅ Performance budget met (< 3s load on 3G)
7. ✅ Pilot testing with 5 users (4/5 rating)

## Timeline Estimate
- **Phase 0**: Research & Design (2 days)
- **Phase 1**: Core Features (Games, Sheets CRUD) (10 days)
- **Phase 2**: Configuration Panel (5 days)
- **Phase 3**: Mobile Optimization & Polish (5 days)
- **Phase 4**: Testing & Bug Fixes (3 days)
- **Total**: 25 days (5 weeks, 1 developer)
