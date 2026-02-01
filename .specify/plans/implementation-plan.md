# Implementation Plan: RPG Character Sheet Frontend

**Project**: ficha-controlador-front-end  
**Feature**: Complete Frontend Implementation  
**Date**: 2026-02-01  
**Status**: Planning Phase

---

## 1. Technical Context

### Technologies
- **Framework**: Angular 21+ (Signals API, Standalone Components, Control Flow Syntax)
- **UI Library**: PrimeNG 21+ (Aura Theme preset)
- **Styling**: PrimeFlex (utility classes only - NO custom CSS)
- **State Management**: Angular Signals (signal, computed, effect, toSignal)
- **Forms**: Angular Reactive Forms (FormBuilder, Validators)
- **HTTP**: HttpClient with auth interceptor (credentials, XSRF-TOKEN)
- **Testing**: Jest + @testing-library/angular
- **Build Tool**: Angular CLI with esbuild
- **TypeScript**: Strict mode enabled

### Existing Infrastructure
✅ **Completed**:
- Authentication system (OAuth2 Google, httpOnly cookies)
- Auth guards (authGuard, roleGuard)
- Auth interceptor (credentials, CSRF token)
- Core services (AuthService, IdleService, ErrorHandler, SanitizerService)
- Basic pages (login, home, oauth-callback, unauthorized, not-found)
- Routing structure with guards
- App configuration with PrimeNG Aura theme

🔄 **To Build**:
- Feature modules (games, character-sheets, configuration, profile)
- Data models/interfaces for all entities
- API services for backend communication
- Shared UI components (loading, dialogs, forms)
- Mobile-optimized layouts
- Complex form wizards
- Data tables with filters

### Backend API
**Base URL**: `/api` (proxied via proxy.conf.json)

**Key Endpoints**:
```
Authentication:
  GET  /api/auth/me                    → CurrentUser
  POST /api/auth/logout                → void

Games:
  GET    /api/jogos                    → Jogo[]
  POST   /api/jogos                    → Jogo
  GET    /api/jogos/{id}               → Jogo
  PUT    /api/jogos/{id}               → Jogo
  DELETE /api/jogos/{id}               → void

Participants:
  GET    /api/jogos/{id}/participantes         → Participante[]
  POST   /api/jogos/{id}/participantes         → Participante
  PUT    /api/jogos/{id}/participantes/{pid}   → Participante
  DELETE /api/jogos/{id}/participantes/{pid}   → void

Character Sheets:
  GET    /api/fichas                   → Ficha[]
  POST   /api/fichas                   → Ficha
  GET    /api/fichas/{id}              → Ficha
  PUT    /api/fichas/{id}              → Ficha
  DELETE /api/fichas/{id}              → void

Configuration (Mestre only):
  GET    /api/config/atributos         → AtributoConfig[]
  POST   /api/config/atributos         → AtributoConfig
  PUT    /api/config/atributos/{id}    → AtributoConfig
  DELETE /api/config/atributos/{id}    → void
  
  # Similar for: aptidoes, niveis, limitadores, classes, 
  # vantagens, racas, prospeccao, presencas, generos
```

### Key Unknowns
- ❓ **NEEDS CLARIFICATION**: Exact response DTOs from backend (nested vs. flat?)
- ❓ **NEEDS CLARIFICATION**: Formula evaluation engine location (frontend or backend calculates derived stats?)
- ❓ **NEEDS CLARIFICATION**: Pagination strategy (server-side or client-side for tables?)
- ❓ **NEEDS CLARIFICATION**: File upload support (character avatars, game images?)
- ❓ **NEEDS CLARIFICATION**: Real-time updates needed (WebSockets) or polling sufficient?

---

## 2. Constitution Check

### ✅ Alignment with Constitution

| Principle | Status | Notes |
|-----------|--------|-------|
| Angular 21+ Signals | ✅ Aligned | All state via signal/computed/effect |
| Standalone Components | ✅ Aligned | No NgModules, only standalone |
| inject() for DI | ✅ Aligned | No constructor injection |
| Control Flow Syntax | ✅ Aligned | @if/@for only, no *ngIf/*ngFor |
| PrimeFlex Only | ✅ Aligned | No custom CSS/SCSS |
| Security (XSS, CSRF) | ✅ Aligned | Sanitizer service, auth interceptor |
| Mobile First | ✅ Aligned | Responsive breakpoints, touch optimization |
| Testing (Jest 70%) | ✅ Aligned | Unit tests for services |
| TypeScript Strict | ✅ Aligned | Strict mode enabled |
| Accessibility | ✅ Aligned | ARIA labels, keyboard nav |

### 🚫 Potential Violations
None identified. Architecture fully compliant with constitution.

---

## 3. Pre-Development Gates

### Gate 1: Requirements Clarity ⚠️
**Status**: NEEDS CLARIFICATION (5 unknowns above)  
**Action**: Phase 0 research to resolve unknowns

### Gate 2: Architecture Review ✅
**Status**: PASS  
**Reason**: Extends existing clean architecture, no new patterns needed

### Gate 3: Security Review ✅
**Status**: PASS  
**Reason**: Reuses existing auth system, follows constitution security rules

### Gate 4: Performance Budget ✅
**Status**: PASS  
**Reason**: Lazy loading planned, PrimeFlex lightweight, esbuild optimized

---

## Phase 0: Research & Planning

### Objectives
1. Resolve all "NEEDS CLARIFICATION" items
2. Document backend API contracts (OpenAPI/Swagger)
3. Define calculation formulas for derived stats
4. Create component wireframes
5. Define mobile navigation patterns

### Research Tasks

#### R0.1: Backend API Contract Discovery
**Task**: Examine backend controllers/DTOs to document exact response structures  
**Deliverable**: `research.md` section "Backend API Contracts"  
**Agent Task**: "Analyze backend Spring Boot controllers to extract REST endpoint signatures, request/response DTOs, and error response formats for /api/jogos, /api/fichas, and /api/config/* endpoints"

#### R0.2: Formula Engine Strategy
**Task**: Determine if formulas execute on frontend or backend  
**Deliverable**: `research.md` section "Calculation Strategy"  
**Decision Factors**: 
- Performance (recalc on every keystroke vs. server round-trip)
- Security (user could manipulate client-side calcs)
- Complexity (parsing formula strings in TS vs. Java)

#### R0.3: Pagination Pattern
**Task**: Research PrimeNG p-table pagination with backend APIs  
**Deliverable**: `research.md` section "Pagination Best Practices"  
**Agent Task**: "Research PrimeNG p-table lazy loading pagination patterns with Spring Boot backend, including query params, page/size/sort handling, and response format"

#### R0.4: File Upload Architecture
**Task**: Investigate if avatars/images needed, multipart upload patterns  
**Deliverable**: `research.md` section "File Upload Strategy"  
**Decision**: Defer to Phase 2+ if not MVP requirement

#### R0.5: Real-time Updates
**Task**: Assess need for WebSockets vs. polling for game/character updates  
**Deliverable**: `research.md` section "Real-time Strategy"  
**Decision**: Start with polling (simpler), add WebSockets in Phase 3+ if needed

#### R0.6: PrimeNG Best Practices
**Task**: Study PrimeNG 18 Aura theme documentation for form patterns  
**Deliverable**: `research.md` section "PrimeNG Patterns"  
**Agent Task**: "Study PrimeNG 18 documentation for best practices with p-table, p-dialog, p-steps (wizard), reactive forms integration, and mobile responsive patterns"

#### R0.7: Mobile Navigation Patterns
**Task**: Design bottom nav bar vs. hamburger menu for mobile  
**Deliverable**: Wireframe in `research.md` section "Mobile UX"  
**Pattern**: Bottom nav for primary actions (Dashboard, Games, Sheets, Profile), hamburger for secondary (Config, Logout)

### Outputs
- ✅ `research.md` with all clarifications
- ✅ Updated constitution if new patterns needed
- ✅ Wireframes for key screens (optional: Figma/Excalidraw)

---

## Phase 1: Design & Contracts

### Objectives
1. Define TypeScript interfaces for all entities
2. Generate API service contracts
3. Create data model documentation
4. Design component tree
5. Update agent context with new technologies

### Tasks

#### D1.1: Data Model Design
**Deliverable**: `data-model.md`

**Entities to Model**:

1. **User** (existing, document only)
   - id, nome, email, avatarUrl, roles[], dataCriacao
   
2. **Jogo** (Game)
   - id, nome, descricao, mestreId, status, dataCriacao
   - Relationships: mestre (User), participantes[] (Participante)
   
3. **Participante** (Participant)
   - id, jogoId, jogadorId, fichaId, status, dataParticipacao
   - Relationships: jogador (User), ficha (Ficha)
   
4. **Ficha** (Character Sheet)
   - id, jogadorId, jogoId, nome, nivel, experiencia
   - Nested: identificacao, progressao, descricaoFisica
   - Collections: atributos[], aptidoes[], vantagens[], etc.
   
5. **FichaAtributo** (Sheet Attribute)
   - id, fichaId, atributoConfigId, base, nivel, outros, total
   
6. **AtributoConfig** (Attribute Configuration)
   - id, nome, abreviacao, ordem, formulaCalculo, ativo
   
7. **FichaAptidao** (Sheet Skill)
   - id, fichaId, aptidaoConfigId, nivel, bonus
   
8. **AptidaoConfig** (Skill Configuration)
   - id, nome, tipoAptidaoId, ordem, ativo
   
9. **TipoAptidao** (Skill Type: Physical/Mental)
   - id, nome (FISICO/MENTAL)
   
10. **FichaVida** (Sheet Health)
    - id, fichaId, vidaTotal, vidaVigor, vidaOutros, vidaNivel, sanguePercentual
    
11. **FichaVidaMembro** (Limb Integrity)
    - id, fichaVidaId, membro (enum), integridade (%)
    
12. **FichaVantagem** (Sheet Advantage)
    - id, fichaId, vantagemConfigId, nivel, bonus, dano
    
13. **VantagemConfig** (Advantage Configuration)
    - id, nome, categoriaVantagemId, custo, descricao, ativo
    
14. **CategoriaVantagem** (Advantage Category)
    - id, nome
    
15. **NivelConfig** (Level Configuration)
    - id, nivel, xpMinimo, xpMaximo, bonusAtributo
    
16. **LimitadorConfig** (Limiter Configuration)
    - id, nome, descricao, penalidade
    
17. **ClassePersonagem** (Character Class)
    - id, nome, descricao, bonusAtributos
    
18. **Raca** (Race)
    - id, nome, descricao, bonusAtributos
    
19. **PresencaConfig** (Presence/Aura Configuration)
    - id, nome, descricao, efeito
    
20. **GeneroConfig** (Gender Configuration)
    - id, nome, descricao

**Validation Rules**:
- Nome: required, 3-50 chars
- Email: required, valid format
- Nivel: required, 1-100
- Experiencia: required, >= 0
- Status enums: validate against allowed values

**State Transitions**:
- Jogo: ATIVO → PAUSADO → ATIVO | FINALIZADO
- Participante: PENDENTE → APROVADO | REJEITADO

#### D1.2: API Service Contracts
**Deliverable**: `/contracts/api-services.ts`

Create TypeScript interfaces for all API services:

```typescript
// contracts/api-services.ts

// Base response types
interface ApiResponse<T> {
  data: T;
  message?: string;
}

interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

// Auth API
interface AuthApi {
  getCurrentUser(): Promise<User>;
  logout(): Promise<void>;
}

// Jogos API
interface JogosApi {
  listJogos(filters?: JogoFilters): Promise<Jogo[]>;
  getJogo(id: number): Promise<Jogo>;
  createJogo(jogo: CreateJogoDto): Promise<Jogo>;
  updateJogo(id: number, jogo: UpdateJogoDto): Promise<Jogo>;
  deleteJogo(id: number): Promise<void>;
  
  listParticipantes(jogoId: number): Promise<Participante[]>;
  solicitarParticipacao(jogoId: number, fichaId: number): Promise<Participante>;
  aprovarParticipante(jogoId: number, participanteId: number): Promise<Participante>;
  rejeitarParticipante(jogoId: number, participanteId: number): Promise<void>;
  removerParticipante(jogoId: number, participanteId: number): Promise<void>;
}

// Fichas API
interface FichasApi {
  listFichas(filters?: FichaFilters): Promise<Ficha[]>;
  getFicha(id: number): Promise<Ficha>;
  createFicha(ficha: CreateFichaDto): Promise<Ficha>;
  updateFicha(id: number, ficha: UpdateFichaDto): Promise<Ficha>;
  deleteFicha(id: number): Promise<void>;
}

// Config API (Mestre only)
interface ConfigApi {
  // Atributos
  listAtributos(): Promise<AtributoConfig[]>;
  createAtributo(config: CreateAtributoDto): Promise<AtributoConfig>;
  updateAtributo(id: number, config: UpdateAtributoDto): Promise<AtributoConfig>;
  deleteAtributo(id: number): Promise<void>;
  
  // Aptidões
  listAptidoes(): Promise<AptidaoConfig[]>;
  createAptidao(config: CreateAptidaoDto): Promise<AptidaoConfig>;
  updateAptidao(id: number, config: UpdateAptidaoDto): Promise<AptidaoConfig>;
  deleteAptidao(id: number): Promise<void>;
  
  // ... similar for niveis, limitadores, classes, vantagens, racas, etc.
}
```

#### D1.3: Component Architecture
**Deliverable**: `quickstart.md` (updated)

**Component Tree**:

```
App
├── Header (role switcher, user menu)
├── Sidebar/Navigation (conditional by role)
└── Router Outlet
    ├── Dashboard (Mestre/Jogador variants)
    ├── Games Module (lazy)
    │   ├── GameListComponent
    │   ├── GameFormComponent
    │   ├── GameDetailComponent
    │   └── ParticipantManagerComponent
    ├── Character Sheets Module (lazy)
    │   ├── SheetListComponent
    │   ├── SheetWizardComponent (8 steps)
    │   ├── SheetEditComponent (tabs)
    │   ├── SheetViewComponent (read-only)
    │   └── Sub-components:
    │       ├── AttributesSectionComponent
    │       ├── SkillsSectionComponent
    │       ├── HealthSectionComponent
    │       ├── EquipmentSectionComponent
    │       ├── AdvantagesSectionComponent
    │       ├── TitlesRunesSectionComponent
    │       └── NotesSectionComponent
    ├── Configuration Module (lazy, Mestre only)
    │   ├── ConfigDashboardComponent
    │   ├── AttributesConfigComponent
    │   ├── SkillsConfigComponent
    │   ├── LevelsConfigComponent
    │   ├── LimitersConfigComponent
    │   ├── ClassesConfigComponent
    │   ├── AdvantagesConfigComponent
    │   ├── RacesConfigComponent
    │   ├── ProspectingConfigComponent
    │   ├── PresencesConfigComponent
    │   └── GendersConfigComponent
    └── Profile Module (lazy)
        ├── ProfileViewComponent
        └── ProfileEditComponent
```

**Shared Components**:
- LoadingSpinnerComponent
- ConfirmDialogComponent
- ErrorMessageComponent
- EmptyStateComponent
- PageHeaderComponent
- FormFieldErrorComponent

#### D1.4: Routing Structure
**Deliverable**: Update `app.routes.ts`

```typescript
// app.routes.ts
export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'oauth2/callback', component: OAuthCallbackComponent },
  
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component'),
    canActivate: [authGuard]
  },
  
  {
    path: 'jogos',
    loadChildren: () => import('./features/games/games.routes'),
    canActivate: [authGuard]
  },
  
  {
    path: 'fichas',
    loadChildren: () => import('./features/character-sheets/sheets.routes'),
    canActivate: [authGuard]
  },
  
  {
    path: 'config',
    loadChildren: () => import('./features/configuration/config.routes'),
    canActivate: [authGuard, roleGuard],
    data: { role: 'MESTRE' }
  },
  
  {
    path: 'perfil',
    loadComponent: () => import('./features/profile/profile.component'),
    canActivate: [authGuard]
  },
  
  { path: 'unauthorized', component: UnauthorizedComponent },
  { path: '404', component: NotFoundComponent },
  { path: '**', redirectTo: '/404' }
];
```

#### D1.5: State Management Strategy
**Deliverable**: `research.md` section "State Management"

**Pattern**: Service with Signals

```typescript
// Example: JogosStateService
@Injectable({ providedIn: 'root' })
export class JogosStateService {
  private http = inject(HttpClient);
  
  // Private writable signal
  private jogosSignal = signal<Jogo[]>([]);
  
  // Public readonly computed
  public jogos = computed(() => this.jogosSignal());
  public jogosAtivos = computed(() => 
    this.jogosSignal().filter(j => j.status === 'ATIVO')
  );
  
  // Methods
  async loadJogos(): Promise<void> {
    const data = await firstValueFrom(this.http.get<Jogo[]>('/api/jogos'));
    this.jogosSignal.set(data);
  }
  
  async createJogo(jogo: CreateJogoDto): Promise<Jogo> {
    const newJogo = await firstValueFrom(this.http.post<Jogo>('/api/jogos', jogo));
    this.jogosSignal.update(jogos => [...jogos, newJogo]);
    return newJogo;
  }
  
  // ... update, delete methods
}
```

#### D1.6: Update Agent Context
**Script**: `.specify/scripts/bash/update-agent-context.sh copilot`

**Action**: Add to `.github/copilot-instructions.md`:
- New feature modules (games, sheets, config)
- State management pattern (service with signals)
- API service pattern (HttpClient + firstValueFrom)
- Form wizard pattern (PrimeNG p-steps)
- Mobile navigation pattern (bottom nav)

### Outputs
- ✅ `data-model.md` with all 20 entities
- ✅ `/contracts/api-services.ts` with typed interfaces
- ✅ Updated `quickstart.md` with component tree and routing
- ✅ Updated `.github/copilot-instructions.md` with new patterns

---

## Phase 2: Planning & Prioritization

### Feature Priority (MoSCoW)

#### Must Have (MVP - Phase 1 Implementation)
1. **Dashboard** (Mestre + Jogador variants)
2. **Games CRUD** (Mestre: create/edit/delete, Jogador: view/join)
3. **Participant Management** (Mestre: approve/reject, Jogador: request)
4. **Character Sheet CRUD** (create/edit/delete/view)
5. **Character Sheet Wizard** (8-step creation)
6. **Auto-calculated Stats** (formulas for bonuses)

#### Should Have (Phase 2 Implementation)
7. **Configuration Panel - Attributes** (Mestre only)
8. **Configuration Panel - Skills** (Mestre only)
9. **Configuration Panel - Levels** (Mestre only)
10. **Configuration Panel - Advantages** (Mestre only)
11. **Mobile Optimization** (bottom nav, touch targets)
12. **Profile Management** (view/edit user profile)

#### Could Have (Phase 3 Implementation)
13. **Configuration Panel - All remaining** (limiters, classes, races, etc.)
14. **Advanced Filters** (tables with multi-column sorting/filtering)
15. **Bulk Actions** (select multiple, delete/export)
16. **Character Sheet Templates** (save/load presets)
17. **Game Invitation System** (email notifications)

#### Won't Have (Future)
18. Real-time chat
19. Virtual dice roller
20. PDF export
21. Image uploads
22. Dark mode
23. i18n

### Implementation Sequence

#### Sprint 1 (5 days): Core Infrastructure
**Goal**: Shared components, models, base services

**Tasks**:
1. Create TypeScript interfaces for all entities (`src/app/core/models/`)
2. Create API services (JogosApiService, FichasApiService, ConfigApiService)
3. Create shared UI components (Loading, ConfirmDialog, EmptyState, FormFieldError)
4. Create layout components (Header with role switcher, Sidebar)
5. Update routing with lazy-loaded feature modules
6. Write unit tests for API services

**Deliverables**:
- ✅ `/src/app/core/models/*.ts` (20 interfaces)
- ✅ `/src/app/core/services/*-api.service.ts` (3 API services)
- ✅ `/src/app/shared/components/*` (4 shared components)
- ✅ `/src/app/shared/layout/*` (Header, Sidebar)
- ✅ Updated `app.routes.ts` with lazy routes
- ✅ Unit tests (70%+ coverage on services)

#### Sprint 2 (5 days): Dashboard & Games
**Goal**: Mestre and Jogador dashboards, Games CRUD

**Tasks**:
1. Create DashboardComponent with role-based variants
   - Mestre: Game stats, recent activity, quick actions
   - Jogador: My characters, game invitations, quick actions
2. Create GameListComponent (p-table with filters)
3. Create GameFormComponent (create/edit with p-dialog)
4. Create GameDetailComponent (tabs: info, participants, sheets)
5. Create ParticipantManagerComponent (approve/reject UI)
6. Implement JogosStateService (signal-based state)
7. Write component tests (critical paths)

**Deliverables**:
- ✅ `/src/app/features/dashboard/` (2 variants)
- ✅ `/src/app/features/games/` (4 components)
- ✅ `/src/app/core/services/jogos-state.service.ts`
- ✅ Component tests for Games module

#### Sprint 3 (5 days): Character Sheets List & View
**Goal**: Display and navigate character sheets

**Tasks**:
1. Create SheetListComponent (p-dataView with cards, mobile-friendly)
2. Create SheetViewComponent (read-only display with accordion sections)
3. Create sub-components for each section (Attributes, Skills, Health, etc.)
4. Implement FichasStateService (signal-based state)
5. Add routing (/fichas, /fichas/:id)
6. Write unit tests for FichasStateService

**Deliverables**:
- ✅ `/src/app/features/character-sheets/list/`
- ✅ `/src/app/features/character-sheets/view/`
- ✅ `/src/app/features/character-sheets/shared/sections/` (7 section components)
- ✅ `/src/app/core/services/fichas-state.service.ts`

#### Sprint 4 (5 days): Character Sheet Wizard (Create)
**Goal**: 8-step wizard for creating new characters

**Tasks**:
1. Create SheetWizardComponent (p-steps wrapper)
2. Create 8 step components:
   - Step1IdentificationComponent
   - Step2ProgressionComponent
   - Step3PhysicalDescriptionComponent
   - Step4AttributesComponent
   - Step5HealthComponent
   - Step6SkillsComponent
   - Step7EquipmentComponent
   - Step8SummaryComponent
3. Implement form validation per step
4. Implement "Save Draft" functionality
5. Implement "Preview" mode
6. Add navigation (back/next/finish buttons)

**Deliverables**:
- ✅ `/src/app/features/character-sheets/wizard/` (9 components)
- ✅ Form validation logic
- ✅ Draft save mechanism

#### Sprint 5 (5 days): Character Sheet Edit & Calculations
**Goal**: Tabbed edit interface, auto-calculate derived stats

**Tasks**:
1. Create SheetEditComponent (p-tabView for sections)
2. Implement calculation service (CalculationService)
   - Parse formulas (e.g., "(FOR + AGI) / 3" for BBA)
   - Recalculate on attribute changes (computed signals)
3. Create FormulaDisplayPipe (show formula on hover)
4. Implement auto-save (debounced, every 5s)
5. Add "Discard Changes" confirmation
6. Write tests for CalculationService

**Deliverables**:
- ✅ `/src/app/features/character-sheets/edit/`
- ✅ `/src/app/core/services/calculation.service.ts`
- ✅ `/src/app/shared/pipes/formula-display.pipe.ts`
- ✅ Unit tests for calculations (100% coverage)

#### Sprint 6 (3 days): Configuration Panel - Attributes & Skills
**Goal**: Mestre can configure game system

**Tasks**:
1. Create ConfigDashboardComponent (grid of config sections)
2. Create AttributesConfigComponent (p-table with inline edit)
3. Create SkillsConfigComponent (p-table with categories)
4. Implement ConfigStateService (signal-based)
5. Add drag-and-drop ordering (p-orderList)
6. Write unit tests for ConfigStateService

**Deliverables**:
- ✅ `/src/app/features/configuration/dashboard/`
- ✅ `/src/app/features/configuration/attributes/`
- ✅ `/src/app/features/configuration/skills/`
- ✅ `/src/app/core/services/config-state.service.ts`

#### Sprint 7 (2 days): Configuration Panel - Levels, Advantages, Races
**Goal**: Complete essential configuration sections

**Tasks**:
1. Create LevelsConfigComponent (table with XP ranges)
2. Create AdvantagesConfigComponent (table with categories)
3. Create RacesConfigComponent (table with bonuses)
4. Add import/export config (JSON format)

**Deliverables**:
- ✅ `/src/app/features/configuration/levels/`
- ✅ `/src/app/features/configuration/advantages/`
- ✅ `/src/app/features/configuration/races/`
- ✅ Config import/export feature

#### Sprint 8 (3 days): Mobile Optimization
**Goal**: Perfect mobile UX, especially for character sheets

**Tasks**:
1. Implement bottom navigation bar (sticky, 4 main routes)
2. Optimize character sheet for mobile:
   - Collapsible sections (p-accordion)
   - Large tap targets (min 48px)
   - Native input types (number, date)
   - Swipe gestures for delete
3. Add pull-to-refresh on lists
4. Test on iOS Safari and Android Chrome
5. Fix responsive issues

**Deliverables**:
- ✅ `/src/app/shared/layout/bottom-nav/`
- ✅ Mobile-optimized character sheet
- ✅ Touch gesture support
- ✅ Cross-browser testing report

#### Sprint 9 (2 days): Profile & Polish
**Goal**: User profile, final polish

**Tasks**:
1. Create ProfileViewComponent (display user info)
2. Create ProfileEditComponent (edit name, avatar selection)
3. Add Toast notifications throughout (success/error/info)
4. Improve loading states (skeleton loaders)
5. Add empty states (friendly messages when no data)
6. Final accessibility pass (ARIA labels, keyboard nav)

**Deliverables**:
- ✅ `/src/app/features/profile/` (2 components)
- ✅ Toast service integrated
- ✅ Skeleton loaders on all lists
- ✅ Accessibility audit report

#### Sprint 10 (3 days): Testing & Bug Fixes
**Goal**: Comprehensive testing, fix issues

**Tasks**:
1. Run full test suite (aim for 70%+ coverage)
2. Manual testing on all supported browsers
3. Mobile device testing (iOS, Android)
4. Performance profiling (Lighthouse audit)
5. Fix identified bugs
6. Update documentation

**Deliverables**:
- ✅ Test coverage report
- ✅ Browser compatibility matrix
- ✅ Performance audit results
- ✅ Bug fix log
- ✅ Updated README and QUICK_START

### Total Timeline
**10 Sprints × ~3 days = 30 days (~6 weeks)**

---

## Phase 3: Post-Design Constitution Check

### Re-evaluation After Design

| Gate | Status | Notes |
|------|--------|-------|
| Architecture Integrity | ✅ PASS | Lazy loading, feature modules, clean separation |
| Security Compliance | ✅ PASS | Auth guards on all routes, role checks, sanitization |
| Performance Budget | ✅ PASS | Lazy loading keeps initial bundle < 500KB |
| Accessibility | ✅ PASS | PrimeNG components WCAG compliant, added ARIA labels |
| Mobile First | ✅ PASS | Bottom nav, touch optimization, responsive grid |
| Testing Coverage | ✅ PASS | 70%+ services, 50%+ components achievable |
| Code Standards | ✅ PASS | All signals, inject(), control flow, PrimeFlex |

### New Patterns Introduced
1. **Wizard Pattern**: PrimeNG p-steps for multi-step forms
2. **Calculation Service**: Formula parsing and evaluation (computed signals)
3. **Auto-save**: Debounced form updates (RxJS debounceTime with toSignal)
4. **Bottom Navigation**: Mobile-first navigation pattern

All patterns comply with constitution. No violations.

---

## 4. Implementation Checklist

### Sprint 1: Core Infrastructure
- [ ] Create all TypeScript interfaces in `/src/app/core/models/`
  - [ ] user.model.ts
  - [ ] jogo.model.ts
  - [ ] participante.model.ts
  - [ ] ficha.model.ts (with nested structures)
  - [ ] config.model.ts (all 10 config entities)
- [ ] Create API services in `/src/app/core/services/api/`
  - [ ] jogos-api.service.ts (with unit tests)
  - [ ] fichas-api.service.ts (with unit tests)
  - [ ] config-api.service.ts (with unit tests)
- [ ] Create shared components in `/src/app/shared/components/`
  - [ ] loading-spinner.component.ts
  - [ ] confirm-dialog.component.ts
  - [ ] empty-state.component.ts
  - [ ] form-field-error.component.ts
- [ ] Create layout components in `/src/app/shared/layout/`
  - [ ] header.component.ts (with role switcher)
  - [ ] sidebar.component.ts (with conditional menu items)
- [ ] Update `app.routes.ts` with lazy-loaded feature routes
- [ ] Verify all tests pass (`npm run test`)

### Sprint 2: Dashboard & Games
- [ ] Create dashboard feature in `/src/app/features/dashboard/`
  - [ ] dashboard.component.ts (checks role, renders variant)
  - [ ] mestre-dashboard/mestre-dashboard.component.ts
  - [ ] jogador-dashboard/jogador-dashboard.component.ts
- [ ] Create games feature in `/src/app/features/games/`
  - [ ] game-list/game-list.component.ts (p-table)
  - [ ] game-form/game-form.component.ts (p-dialog)
  - [ ] game-detail/game-detail.component.ts (p-tabView)
  - [ ] participant-manager/participant-manager.component.ts
- [ ] Create JogosStateService in `/src/app/core/services/state/`
  - [ ] jogos-state.service.ts (with signals, CRUD methods)
- [ ] Update `games.routes.ts` with feature routes
- [ ] Write component tests for critical paths
- [ ] Manual test: Mestre can create/edit/delete games
- [ ] Manual test: Jogador can view and request to join games

### Sprint 3: Character Sheets List & View
- [ ] Create character sheets feature in `/src/app/features/character-sheets/`
  - [ ] sheet-list/sheet-list.component.ts (p-dataView)
  - [ ] sheet-view/sheet-view.component.ts (p-accordion sections)
  - [ ] shared/sections/attributes-section.component.ts
  - [ ] shared/sections/skills-section.component.ts
  - [ ] shared/sections/health-section.component.ts
  - [ ] shared/sections/equipment-section.component.ts
  - [ ] shared/sections/advantages-section.component.ts
  - [ ] shared/sections/titles-runes-section.component.ts
  - [ ] shared/sections/notes-section.component.ts
- [ ] Create FichasStateService in `/src/app/core/services/state/`
  - [ ] fichas-state.service.ts (with unit tests)
- [ ] Update `sheets.routes.ts` with feature routes
- [ ] Manual test: View character sheet with all sections expanded

### Sprint 4: Character Sheet Wizard
- [ ] Create wizard in `/src/app/features/character-sheets/wizard/`
  - [ ] sheet-wizard.component.ts (p-steps wrapper)
  - [ ] step1-identification/step1-identification.component.ts
  - [ ] step2-progression/step2-progression.component.ts
  - [ ] step3-physical/step3-physical.component.ts
  - [ ] step4-attributes/step4-attributes.component.ts
  - [ ] step5-health/step5-health.component.ts
  - [ ] step6-skills/step6-skills.component.ts
  - [ ] step7-equipment/step7-equipment.component.ts
  - [ ] step8-summary/step8-summary.component.ts
- [ ] Implement form validation for each step
- [ ] Implement "Save Draft" (localStorage or backend endpoint)
- [ ] Implement step navigation (back/next/finish buttons)
- [ ] Manual test: Create character end-to-end, verify data saved

### Sprint 5: Character Sheet Edit & Calculations
- [ ] Create edit component in `/src/app/features/character-sheets/edit/`
  - [ ] sheet-edit.component.ts (p-tabView)
- [ ] Create CalculationService in `/src/app/core/services/`
  - [ ] calculation.service.ts (formula parser, computed signals)
  - [ ] Unit tests for all formulas (BBA, BBM, Reflexo, etc.)
- [ ] Create FormulaDisplayPipe in `/src/app/shared/pipes/`
  - [ ] formula-display.pipe.ts
- [ ] Implement auto-save (debounced observable)
- [ ] Implement "Discard Changes" confirmation (p-confirmDialog)
- [ ] Manual test: Edit attribute, verify bonuses recalculate
- [ ] Manual test: Auto-save works, can discard changes

### Sprint 6: Configuration Panel - Attributes & Skills
- [ ] Create configuration feature in `/src/app/features/configuration/`
  - [ ] config-dashboard/config-dashboard.component.ts
  - [ ] attributes-config/attributes-config.component.ts (p-table)
  - [ ] skills-config/skills-config.component.ts (p-table)
- [ ] Create ConfigStateService in `/src/app/core/services/state/`
  - [ ] config-state.service.ts (with unit tests)
- [ ] Implement drag-and-drop ordering (p-orderList)
- [ ] Update `config.routes.ts` with feature routes
- [ ] Manual test: Mestre can add/edit/delete attributes
- [ ] Manual test: Mestre can reorder attributes

### Sprint 7: Configuration Panel - Levels, Advantages, Races
- [ ] Create additional config components
  - [ ] levels-config/levels-config.component.ts
  - [ ] advantages-config/advantages-config.component.ts
  - [ ] races-config/races-config.component.ts
- [ ] Implement import/export config (JSON download/upload)
- [ ] Manual test: Mestre can configure levels/XP
- [ ] Manual test: Mestre can export/import config

### Sprint 8: Mobile Optimization
- [ ] Create bottom navigation in `/src/app/shared/layout/`
  - [ ] bottom-nav/bottom-nav.component.ts (sticky, 4 main routes)
- [ ] Optimize character sheet for mobile
  - [ ] Use p-accordion for collapsible sections
  - [ ] Increase tap target sizes (min 48x48px)
  - [ ] Use native input types (type="number", inputmode="numeric")
  - [ ] Add swipe gestures for delete (hammer.js or native)
- [ ] Implement pull-to-refresh on lists (p-table onRefresh)
- [ ] Test on iOS Safari (real device or BrowserStack)
- [ ] Test on Android Chrome (real device or emulator)
- [ ] Fix responsive issues (use Chrome DevTools device mode)
- [ ] Document mobile UX decisions in README

### Sprint 9: Profile & Polish
- [ ] Create profile feature in `/src/app/features/profile/`
  - [ ] profile-view/profile-view.component.ts
  - [ ] profile-edit/profile-edit.component.ts
- [ ] Integrate Toast service (PrimeNG p-toast)
  - [ ] Add to app.component.ts template
  - [ ] Create ToastService wrapper
  - [ ] Add toasts for success/error actions
- [ ] Add skeleton loaders (PrimeNG p-skeleton)
  - [ ] Game list loading state
  - [ ] Character sheet loading state
- [ ] Add empty states
  - [ ] No games found (with "Create Game" CTA)
  - [ ] No characters found (with "Create Character" CTA)
- [ ] Accessibility audit
  - [ ] Run axe DevTools on all pages
  - [ ] Add missing ARIA labels
  - [ ] Test keyboard navigation (Tab, Enter, Escape)
  - [ ] Verify color contrast (WCAG AA)

### Sprint 10: Testing & Bug Fixes
- [ ] Run full test suite
  - [ ] `npm run test -- --coverage`
  - [ ] Verify 70%+ coverage on services
  - [ ] Verify 50%+ coverage on components
- [ ] Browser compatibility testing
  - [ ] Chrome (latest)
  - [ ] Firefox (latest)
  - [ ] Safari (latest)
  - [ ] Edge (latest)
- [ ] Mobile device testing
  - [ ] iOS Safari (iPhone 12+)
  - [ ] Android Chrome (Pixel 5+)
- [ ] Performance audit
  - [ ] Run Lighthouse on all pages
  - [ ] Verify Performance score > 90
  - [ ] Verify Accessibility score > 90
  - [ ] Verify Best Practices score > 90
- [ ] Fix identified bugs
  - [ ] Create bug list in GitHub Issues
  - [ ] Prioritize by severity
  - [ ] Fix all critical and high severity
- [ ] Update documentation
  - [ ] README.md (setup, architecture, deployment)
  - [ ] QUICK_START.md (developer guide)
  - [ ] ARCHITECTURE.md (updated component tree)
  - [ ] CHANGELOG.md (all changes since start)

---

## 5. Risk Management

### Technical Risks

| Risk | Impact | Probability | Mitigation | Owner |
|------|--------|-------------|------------|-------|
| Formula parsing errors | High | Medium | Unit test all formulas; add error handling; fallback to backend calc | Dev |
| Mobile performance issues | Medium | Low | Profile early; optimize images; lazy load | Dev |
| Backend API changes | High | Medium | Version API endpoints; maintain changelog; use OpenAPI spec | Backend Team |
| PrimeNG component bugs | Medium | Low | Stay on stable releases; check GitHub issues before upgrade | Dev |
| Complex form validation | Medium | Medium | Break into smaller steps; reuse validators; test edge cases | Dev |
| State sync issues (optimistic updates) | Medium | Medium | Implement rollback on API failure; show loading states | Dev |
| Accessibility violations | Low | Low | Use axe DevTools; follow WCAG 2.1 AA; test with screen reader | Dev |

### Schedule Risks

| Risk | Impact | Probability | Mitigation | Owner |
|------|--------|-------------|------------|-------|
| Scope creep (new features mid-sprint) | High | High | Strict change control; defer to Phase 2+; document in backlog | PM |
| Dependencies on backend APIs | High | Medium | Use mock services; coordinate with backend team; parallel dev | Dev + Backend |
| Testing takes longer than estimated | Medium | Medium | Allocate buffer time; prioritize critical path tests | Dev |
| Mobile device testing delays | Low | Medium | Use BrowserStack; test on emulators early | Dev |

---

## 6. Success Metrics

### Technical Metrics
- ✅ **Test Coverage**: 70%+ services, 50%+ components (measured by Jest)
- ✅ **Performance**: Lighthouse score > 90 on all audits
- ✅ **Bundle Size**: Initial load < 500KB gzipped
- ✅ **Code Quality**: ESLint 0 errors, 0 warnings
- ✅ **Accessibility**: axe DevTools 0 violations

### User Experience Metrics
- ✅ **Mobile Usability**: SUS (System Usability Scale) score > 70 from pilot users
- ✅ **Task Completion**: 90%+ success rate for key tasks (create game, create character)
- ✅ **Error Rate**: < 5% of user actions result in errors
- ✅ **Loading Time**: 95th percentile API response < 2s

### Business Metrics
- ✅ **Adoption**: 80%+ of pilot users complete onboarding
- ✅ **Retention**: 70%+ of pilot users return after 1 week
- ✅ **Satisfaction**: Average rating 4/5 or higher

---

## 7. Deployment Strategy

### Environments
1. **Development**: Local (`npm start`, proxied to localhost:8080 backend)
2. **Staging**: Docker container on staging server (nginx + backend)
3. **Production**: Docker container on production server (nginx + backend)

### CI/CD Pipeline
```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint
      - run: npm run test -- --coverage
      - run: npm run build -- --configuration production
```

### Rollback Plan
- Keep previous Docker image tagged
- Nginx config to switch between versions
- Database migrations must be backward compatible

---

## 8. Documentation Plan

### Developer Documentation
- ✅ README.md: Project setup, architecture overview, contribution guidelines
- ✅ QUICK_START.md: Step-by-step dev environment setup
- ✅ ARCHITECTURE.md: Detailed architecture, design decisions, patterns
- ✅ API_CONTRACTS.md: Backend API documentation (endpoints, DTOs)

### User Documentation
- ✅ USER_GUIDE.md: How to use the system (Mestre and Jogador workflows)
- ✅ FAQ.md: Common questions and troubleshooting

### Code Documentation
- ✅ JSDoc comments on all public service methods
- ✅ Inline comments for complex logic (formulas, calculations)
- ✅ README in each feature module (purpose, components, routes)

---

## 9. Handoff Checklist

### Code Deliverables
- [ ] All source code in Git repository (main branch protected)
- [ ] All dependencies listed in package.json (with versions)
- [ ] All environment variables documented (.env.example)
- [ ] All tests passing (CI green)
- [ ] All linting passing (ESLint, Prettier)

### Documentation Deliverables
- [ ] README.md (updated)
- [ ] ARCHITECTURE.md (updated)
- [ ] QUICK_START.md (updated)
- [ ] USER_GUIDE.md (new)
- [ ] CHANGELOG.md (new)

### Deployment Deliverables
- [ ] Dockerfile for production build
- [ ] docker-compose.yml for full stack
- [ ] nginx.conf for reverse proxy
- [ ] CI/CD pipeline configured (.github/workflows/ci.yml)

### Knowledge Transfer
- [ ] Walkthrough session with team (record video)
- [ ] Q&A document (common issues, solutions)
- [ ] Contact info for support (Discord, email)

---

## 10. Next Steps (Post-MVP)

### Phase 2 Features
- Complete Configuration Panel (limiters, classes, prospecting, presences, genders)
- Advanced table filters (multi-column, saved filters)
- Bulk actions (select multiple, delete, export)
- Character sheet templates (save/load presets)

### Phase 3 Features
- Real-time updates (WebSockets for game/character changes)
- Chat system (game-specific channels)
- Virtual dice roller (with animation)
- PDF export (character sheets)
- Image uploads (avatars, game covers)

### Phase 4 Features
- PWA support (offline mode, service workers)
- Dark mode toggle
- Internationalization (i18n for pt-BR, en-US)
- Advanced permissions (custom roles beyond Mestre/Jogador)
- Audit log (track all changes to characters/games)

---

## Appendix A: Technology Stack Details

### Core Dependencies
```json
{
  "dependencies": {
    "@angular/animations": "^21.0.0",
    "@angular/common": "^21.0.0",
    "@angular/compiler": "^21.0.0",
    "@angular/core": "^21.0.0",
    "@angular/forms": "^21.0.0",
    "@angular/platform-browser": "^21.0.0",
    "@angular/platform-browser-dynamic": "^21.0.0",
    "@angular/router": "^21.0.0",
    "primeng": "^18.0.0",
    "primeflex": "^3.3.0",
    "primeicons": "^7.0.0",
    "rxjs": "^7.8.0",
    "tslib": "^2.6.0",
    "zone.js": "^0.14.0"
  },
  "devDependencies": {
    "@angular-devkit/build-angular": "^21.0.0",
    "@angular/cli": "^21.0.0",
    "@angular/compiler-cli": "^21.0.0",
    "@testing-library/angular": "^14.0.0",
    "@types/jest": "^29.5.0",
    "eslint": "^8.50.0",
    "jest": "^29.7.0",
    "jest-preset-angular": "^13.1.0",
    "prettier": "^3.0.0",
    "typescript": "~5.5.0"
  }
}
```

### ESLint Configuration
```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@angular-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@angular-eslint/component-class-suffix": "error",
    "@angular-eslint/directive-class-suffix": "error"
  }
}
```

### Jest Configuration
```javascript
// jest.config.js
module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/app/**/*.ts',
    '!src/app/**/*.spec.ts',
    '!src/app/**/*.module.ts',
    '!src/app/**/index.ts'
  ],
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 70,
      functions: 70,
      lines: 70
    }
  }
};
```

---

## Appendix B: Formula Reference

### Derived Stats Formulas
```typescript
// Bonuses Físicos
BBA = (Força + Agilidade) / 3;
Bloqueio = (Força + Vigor) / 3;
Reflexo = (Agilidade + Astúcia) / 3;

// Bonuses Mentais
BBM = (Sabedoria + Inteligência) / 3;
Percepção = (Inteligência + Intuição) / 3;
Raciocínio = (Inteligência + Astúcia) / 3;

// Vida
VidaTotal = VidaVigor + VidaOutros + VidaNivel;

// Essência
Essência = (Vigor + Sabedoria) / 2;

// Ímpeto (Kg/Mts)
Ímpeto = Força * 5; // Example, configurable
```

---

## Appendix C: Wireframes (Text-Based)

### Dashboard (Mestre)
```
+--------------------------------------------------+
| [Logo] RPG System            [Mestre ▼] [Avatar] |
+--------------------------------------------------+
| [Sidebar]    |  Dashboard - Mestre               |
|  Dashboard   |  +----------------------------+   |
|  Jogos       |  | 📊 Estatísticas            |   |
|  Config      |  | 3 Jogos Ativos             |   |
|  Perfil      |  | 12 Jogadores               |   |
|  Sair        |  | 45 Fichas                  |   |
|              |  +----------------------------+   |
|              |                                   |
|              |  +----------------------------+   |
|              |  | 🎲 Meus Jogos              |   |
|              |  | [+ Novo Jogo]              |   |
|              |  | - Campanha de Verão (5 🧑) |   |
|              |  | - Aventura Épica (3 🧑)    |   |
|              |  +----------------------------+   |
+--------------------------------------------------+
```

### Character Sheet (Mobile)
```
+-------------------------+
| < Klayrah: Coração      |
| Inerte                  |
+-------------------------+
| [Accordion Section 1]   |
| ▼ Identificação         |
|   Nome: Klayrah         |
|   Jogador: Carlos       |
|   Origem: Norte         |
+-------------------------+
| [Accordion Section 2]   |
| ▶ Atributos             |
+-------------------------+
| [Accordion Section 3]   |
| ▶ Aptidões              |
+-------------------------+
| [Bottom Nav]            |
| [Home] [Jogos] [Fichas] |
+-------------------------+
```

---

**END OF IMPLEMENTATION PLAN**
