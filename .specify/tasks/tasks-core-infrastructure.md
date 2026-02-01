# Tasks: Core Infrastructure

**Phase**: 1 (Foundation)  
**Duration**: 5 days  
**Dependencies**: None (START HERE)  
**Parallel Opportunities**: High (models, services, components can be built in parallel)

---

## Overview

This phase builds the foundational infrastructure that all other features depend on:
- TypeScript models/interfaces for all entities
- API services for backend communication
- State management services using Signals
- Shared UI components (loading, dialogs, form errors)
- Layout components (header, sidebar, navigation)
- Routing structure with lazy-loaded modules

**Deliverables**:
- ✅ 20+ TypeScript interfaces in `/src/app/core/models/`
- ✅ 3 API services in `/src/app/core/services/api/`
- ✅ 3 state services in `/src/app/core/services/state/`
- ✅ 4 shared UI components in `/src/app/shared/components/`
- ✅ 2 layout components in `/src/app/shared/layout/`
- ✅ Updated routing with lazy-loaded feature modules
- ✅ Unit tests (70%+ coverage on services)

---

## Tasks

### Section 1: TypeScript Models (Day 1)

#### Core Entity Models

- [ ] CORE-001 [P] Create User model in `src/app/core/models/user.model.ts`
  - Properties: id, nome, email, avatarUrl, roles[], dataCriacao
  - Validation: email format, roles must be MESTRE | JOGADOR

- [ ] CORE-002 [P] Create Jogo model in `src/app/core/models/jogo.model.ts`
  - Properties: id, nome, descricao, mestreId, status, dataCriacao
  - Nested: mestre (User), participantes (Participante[])
  - Status enum: ATIVO | PAUSADO | FINALIZADO

- [ ] CORE-003 [P] Create Participante model in `src/app/core/models/participante.model.ts`
  - Properties: id, jogoId, jogadorId, fichaId, status, dataParticipacao
  - Nested: jogador (User), ficha (Ficha)
  - Status enum: PENDENTE | APROVADO | REJEITADO

- [ ] CORE-004 [P] Create Ficha model in `src/app/core/models/ficha.model.ts`
  - Properties: id, jogadorId, jogoId, nome, nivel, experiencia
  - Sections: identificacao, progressao, descricaoFisica
  - Collections: atributos[], aptidoes[], vantagens[], equipamentos[], titulos[], runas[]

- [ ] CORE-005 [P] Create FichaIdentificacao model in `src/app/core/models/ficha-identificacao.model.ts`
  - Properties: origem, indole, linhagem, presencaId, tipoHeroico

- [ ] CORE-006 [P] Create FichaProgressao model in `src/app/core/models/ficha-progressao.model.ts`
  - Properties: nivel, experiencia, limitadorId, renascimento, insolitus, nvs

- [ ] CORE-007 [P] Create FichaDescricaoFisica model in `src/app/core/models/ficha-descricao-fisica.model.ts`
  - Properties: idade, altura, peso, olhos, cabelo

#### Attribute and Skill Models

- [ ] CORE-008 [P] Create FichaAtributo model in `src/app/core/models/ficha-atributo.model.ts`
  - Properties: id, fichaId, atributoConfigId, base, nivel, outros, total
  - Nested: atributoConfig (AtributoConfig)

- [ ] CORE-009 [P] Create AtributoConfig model in `src/app/core/models/atributo-config.model.ts`
  - Properties: id, nome, abreviacao, ordem, formulaCalculo, ativo

- [ ] CORE-010 [P] Create FichaAptidao model in `src/app/core/models/ficha-aptidao.model.ts`
  - Properties: id, fichaId, aptidaoConfigId, nivel, bonus
  - Nested: aptidaoConfig (AptidaoConfig)

- [ ] CORE-011 [P] Create AptidaoConfig model in `src/app/core/models/aptidao-config.model.ts`
  - Properties: id, nome, tipoAptidaoId, ordem, ativo
  - Nested: tipoAptidao (TipoAptidao)

- [ ] CORE-012 [P] Create TipoAptidao model in `src/app/core/models/tipo-aptidao.model.ts`
  - Properties: id, nome (FISICO | MENTAL)

#### Health and Combat Models

- [ ] CORE-013 [P] Create FichaVida model in `src/app/core/models/ficha-vida.model.ts`
  - Properties: id, fichaId, vidaTotal, vidaVigor, vidaOutros, vidaNivel, sanguePercentual
  - Collections: membros (FichaVidaMembro[])

- [ ] CORE-014 [P] Create FichaVidaMembro model in `src/app/core/models/ficha-vida-membro.model.ts`
  - Properties: id, fichaVidaId, membro (enum: CABECA | TORSO | BRACO_ESQ | BRACO_DIR | PERNA_ESQ | PERNA_DIR), integridade

- [ ] CORE-015 [P] Create FichaEquipamento model in `src/app/core/models/ficha-equipamento.model.ts`
  - Properties: id, fichaId, nome, tipo, dano, defesa, peso, descricao

#### Advantages and Progression Models

- [ ] CORE-016 [P] Create FichaVantagem model in `src/app/core/models/ficha-vantagem.model.ts`
  - Properties: id, fichaId, vantagemConfigId, nivel, bonus, dano
  - Nested: vantagemConfig (VantagemConfig)

- [ ] CORE-017 [P] Create VantagemConfig model in `src/app/core/models/vantagem-config.model.ts`
  - Properties: id, nome, categoriaVantagemId, custo, descricao, ativo
  - Nested: categoriaVantagem (CategoriaVantagem)

- [ ] CORE-018 [P] Create CategoriaVantagem model in `src/app/core/models/categoria-vantagem.model.ts`
  - Properties: id, nome

- [ ] CORE-019 [P] Create NivelConfig model in `src/app/core/models/nivel-config.model.ts`
  - Properties: id, nivel, xpMinimo, xpMaximo, bonusAtributo

- [ ] CORE-020 [P] Create LimitadorConfig model in `src/app/core/models/limitador-config.model.ts`
  - Properties: id, nome, descricao, penalidade

#### Character Customization Models

- [ ] CORE-021 [P] Create ClassePersonagem model in `src/app/core/models/classe-personagem.model.ts`
  - Properties: id, nome, descricao, bonusAtributos

- [ ] CORE-022 [P] Create Raca model in `src/app/core/models/raca.model.ts`
  - Properties: id, nome, descricao, bonusAtributos

- [ ] CORE-023 [P] Create PresencaConfig model in `src/app/core/models/presenca-config.model.ts`
  - Properties: id, nome, descricao, efeito

- [ ] CORE-024 [P] Create GeneroConfig model in `src/app/core/models/genero-config.model.ts`
  - Properties: id, nome, descricao

- [ ] CORE-025 [P] Create FichaTitulo model in `src/app/core/models/ficha-titulo.model.ts`
  - Properties: id, fichaId, nome, descricao

- [ ] CORE-026 [P] Create FichaRuna model in `src/app/core/models/ficha-runa.model.ts`
  - Properties: id, fichaId, nome, poder, descricao

#### DTO Models (Request/Response)

- [ ] CORE-027 [P] Create CreateJogoDto in `src/app/core/models/dtos/create-jogo.dto.ts`
  - Properties: nome, descricao

- [ ] CORE-028 [P] Create UpdateJogoDto in `src/app/core/models/dtos/update-jogo.dto.ts`
  - Properties: nome, descricao, status

- [ ] CORE-029 [P] Create CreateFichaDto in `src/app/core/models/dtos/create-ficha.dto.ts`
  - Properties: nome, jogoId (optional)

- [ ] CORE-030 [P] Create UpdateFichaDto in `src/app/core/models/dtos/update-ficha.dto.ts`
  - Properties: all Ficha fields (partial update)

---

### Section 2: API Services (Day 2)

#### Jogos API Service

- [ ] CORE-031 Create JogosApiService in `src/app/core/services/api/jogos-api.service.ts`
  - Method: `listJogos(filters?: JogoFilters): Promise<Jogo[]>`
  - Method: `getJogo(id: number): Promise<Jogo>`
  - Method: `createJogo(jogo: CreateJogoDto): Promise<Jogo>`
  - Method: `updateJogo(id: number, jogo: UpdateJogoDto): Promise<Jogo>`
  - Method: `deleteJogo(id: number): Promise<void>`
  - Use: `inject(HttpClient)`, `firstValueFrom()` for async/await
  - Base URL: `/api/jogos`

- [ ] CORE-032 Add participant methods to JogosApiService in `src/app/core/services/api/jogos-api.service.ts`
  - Method: `listParticipantes(jogoId: number): Promise<Participante[]>`
  - Method: `solicitarParticipacao(jogoId: number, fichaId: number): Promise<Participante>`
  - Method: `aprovarParticipante(jogoId: number, participanteId: number): Promise<Participante>`
  - Method: `rejeitarParticipante(jogoId: number, participanteId: number): Promise<void>`
  - Method: `removerParticipante(jogoId: number, participanteId: number): Promise<void>`

- [ ] CORE-033 Write unit tests for JogosApiService in `src/app/core/services/api/jogos-api.service.spec.ts`
  - Test: listJogos calls GET /api/jogos
  - Test: createJogo calls POST /api/jogos with body
  - Test: updateJogo calls PUT /api/jogos/{id} with body
  - Test: deleteJogo calls DELETE /api/jogos/{id}
  - Test: error handling (400, 401, 403, 404, 500)
  - Use: jest.fn() to mock HttpClient

#### Fichas API Service

- [ ] CORE-034 Create FichasApiService in `src/app/core/services/api/fichas-api.service.ts`
  - Method: `listFichas(filters?: FichaFilters): Promise<Ficha[]>`
  - Method: `getFicha(id: number): Promise<Ficha>`
  - Method: `createFicha(ficha: CreateFichaDto): Promise<Ficha>`
  - Method: `updateFicha(id: number, ficha: UpdateFichaDto): Promise<Ficha>`
  - Method: `deleteFicha(id: number): Promise<void>`
  - Use: `inject(HttpClient)`, `firstValueFrom()` for async/await
  - Base URL: `/api/fichas`

- [ ] CORE-035 Write unit tests for FichasApiService in `src/app/core/services/api/fichas-api.service.spec.ts`
  - Test: listFichas calls GET /api/fichas
  - Test: getFicha calls GET /api/fichas/{id}
  - Test: createFicha calls POST /api/fichas with body
  - Test: updateFicha calls PUT /api/fichas/{id} with body
  - Test: deleteFicha calls DELETE /api/fichas/{id}
  - Test: error handling (400, 401, 403, 404, 500)
  - Coverage: 70%+

#### Config API Service

- [ ] CORE-036 Create ConfigApiService in `src/app/core/services/api/config-api.service.ts`
  - Atributos: listAtributos(), createAtributo(), updateAtributo(), deleteAtributo()
  - Aptidões: listAptidoes(), createAptidao(), updateAptidao(), deleteAptidao()
  - Níveis: listNiveis(), createNivel(), updateNivel(), deleteNivel()
  - Limitadores: listLimitadores(), createLimitador(), updateLimitador(), deleteLimitador()
  - Classes: listClasses(), createClasse(), updateClasse(), deleteClasse()
  - Vantagens: listVantagens(), createVantagem(), updateVantagem(), deleteVantagem()
  - Raças: listRacas(), createRaca(), updateRaca(), deleteRaca()
  - Prospecção: listProspeccao(), createProspeccao(), updateProspeccao(), deleteProspeccao()
  - Presenças: listPresencas(), createPresenca(), updatePresenca(), deletePresenca()
  - Gêneros: listGeneros(), createGenero(), updateGenero(), deleteGenero()
  - Base URL: `/api/config`

- [ ] CORE-037 Write unit tests for ConfigApiService in `src/app/core/services/api/config-api.service.spec.ts`
  - Test: each list method calls correct GET endpoint
  - Test: each create method calls correct POST endpoint
  - Test: each update method calls correct PUT endpoint
  - Test: each delete method calls correct DELETE endpoint
  - Test: error handling (400, 401, 403, 404, 500)
  - Coverage: 70%+

---

### Section 3: SignalStores (Day 3) - Using @ngrx/signals

**IMPORTANTE**: Use SEMPRE `@ngrx/signals` (SignalStore pattern) para gerenciamento de estado.

#### Jogos SignalStore

- [ ] CORE-038 Create JogosStore in `src/app/core/stores/jogos.store.ts`
  - Use: `signalStore()` from @ngrx/signals
  - State: `jogos: Jogo[]`, `loading: boolean`, `error: string | null`
  - Computed: `jogosAtivos` (filters by status === 'ATIVO')
  - Computed: `meusJogos` (filters by current user as mestre)
  - Methods: `loadJogos()`, `createJogo()`, `updateJogo()`, `deleteJogo()`
  - Methods use `patchState()` to update state
  - Inject: `JogosApiService`
  - ProvidedIn: 'root'

- [ ] CORE-039 Add participant state to JogosStore
  - State: `participantes: Map<number, Participante[]>`, `participantesLoading: boolean`
  - Methods: `loadParticipantes(jogoId)`, `solicitarParticipacao()`, `aprovarParticipante()`, `rejeitarParticipante()`
  - Computed: `getParticipantes(jogoId)` - returns participantes for specific game

- [ ] CORE-040 Write unit tests for JogosStore in `src/app/core/stores/jogos.store.spec.ts`
  - Test: loadJogos updates state with API response
  - Test: createJogo adds new jogo to state
  - Test: updateJogo updates existing jogo in state
  - Test: deleteJogo removes jogo from state
  - Test: jogosAtivos computed filters correctly
  - Test: error handling updates error state
  - Coverage: 70%+

#### Fichas SignalStore

- [ ] CORE-041 Create FichasStore in `src/app/core/stores/fichas.store.ts`
  - Use: `signalStore()` from @ngrx/signals
  - State: `fichas: Ficha[]`, `currentFicha: Ficha | null`, `loading: boolean`, `error: string | null`
  - Computed: `minhasFichas` (filters by current user as jogador)
  - Computed: `fichasPorJogo(jogoId)` (filters by jogoId)
  - Methods: `loadFichas()`, `getFicha(id)`, `createFicha()`, `updateFicha()`, `deleteFicha()`
  - Methods: `setCurrentFicha(id)`, `clearCurrentFicha()`
  - Inject: `FichasApiService`
  - ProvidedIn: 'root'

- [ ] CORE-042 Write unit tests for FichasStore in `src/app/core/stores/fichas.store.spec.ts`
  - Test: loadFichas updates state with API response
  - Test: createFicha adds new ficha to state
  - Test: updateFicha updates existing ficha in state
  - Test: deleteFicha removes ficha from state
  - Test: minhasFichas computed filters correctly
  - Test: setCurrentFicha updates currentFicha state
  - Coverage: 70%+

#### Config SignalStore

- [ ] CORE-043 Create ConfigStore in `src/app/core/stores/config.store.ts`
  - Use: `signalStore()` from @ngrx/signals
  - State: separate signals for each config type (atributos, aptidoes, niveis, limitadores, classes, vantagens, racas, prospeccao, presencas, generos)
  - State: `loading: boolean`, `error: string | null`
  - Methods for Atributos: `loadAtributos()`, `createAtributo()`, `updateAtributo()`, `deleteAtributo()`
  - Similar methods for all 10 config entity types
  - Inject: `ConfigApiService`
  - ProvidedIn: 'root'

- [ ] CORE-044 Write unit tests for ConfigStore in `src/app/core/stores/config.store.spec.ts`
  - Test: loadAtributos updates state
  - Test: createAtributo adds to state
  - Test: updateAtributo updates in state
  - Test: deleteAtributo removes from state
  - Test: same for at least 3 other config types
  - Coverage: 70%+

---

### Section 4: Business Services (Day 3 continued)

**IMPORTANTE**: Regras de negócio e cálculos NUNCA vão nos componentes. Use Business Services.

#### Ficha Calculation Business Service

**IMPORTANTE**: Cálculos OFICIAIS são feitos no BACKEND. Este service provê cálculos TEMPORÁRIOS para feedback imediato no frontend.
Após qualquer alteração, o backend deve ser chamado para recalcular valores oficiais.

- [ ] CORE-045 Create FichaCalculationService in `src/app/core/services/business/ficha-calculation.service.ts`
  - **Purpose**: Cálculos CLIENT-SIDE TEMPORÁRIOS para feedback imediato (antes de salvar no backend)
  - Method: `calcularAtributoTotal(base: number, nivel: number, outros: number): number` - simple sum
  - Method: `calcularImpeto(ficha: Ficha, configs: AtributoConfig[]): number` - applies formula from config (CLIENT-SIDE preview)
  - Method: `calcularBBA(ficha: Ficha): number` - Base Bonus Attack calculation (CLIENT-SIDE preview)
  - Method: `calcularBBM(ficha: Ficha): number` - Base Bonus Magic calculation (CLIENT-SIDE preview)
  - Method: `calcularReflexo(ficha: Ficha): number` - Reflex calculation (CLIENT-SIDE preview)
  - Method: `calcularVidaTotal(ficha: Ficha): number` - Total health calculation (CLIENT-SIDE preview)
  - Method: `parseFormula(formula: string, context: Record<string, number>): number` - evaluates formula string
  - **NOTE**: Após salvar, usar valores retornados pelo backend (fonte oficial)
  - Use: inject(ConfigStore) for formulas, NO UI logic
  - ProvidedIn: 'root'

- [ ] CORE-046 Write unit tests for FichaCalculationService in `src/app/core/services/business/ficha-calculation.service.spec.ts`
  - Test: calcularAtributoTotal with various inputs
  - Test: calcularImpeto with sample ficha and configs
  - Test: parseFormula with valid formulas (e.g., "FOR + DEX * 2")
  - Test: parseFormula handles invalid formulas gracefully
  - Test: all calculation methods return correct values
  - **NOTE**: Tests validate CLIENT-SIDE logic only, backend is source of truth
  - Coverage: 80%+

#### Participante Business Service

- [ ] CORE-047 Create ParticipanteBusinessService in `src/app/core/services/business/participante-business.service.ts`
  - Method: `canJoinGame(jogo: Jogo, jogador: User): { allowed: boolean, reason?: string }` - validation rules
  - Method: `canApproveParticipante(participante: Participante, currentUser: User): boolean` - check if user is mestre
  - Method: `validateFichaForGame(ficha: Ficha, jogo: Jogo): { valid: boolean, errors: string[] }` - check compatibility
  - Use: NO UI logic, pure business rules
  - ProvidedIn: 'root'

- [ ] CORE-048 Write unit tests for ParticipanteBusinessService in `src/app/core/services/business/participante-business.service.spec.ts`
  - Test: canJoinGame returns false if user is already participant
  - Test: canApproveParticipante returns true only for mestre
  - Test: validateFichaForGame checks level, attributes, etc.
  - Coverage: 80%+

---

### Section 5: Shared UI Components (Day 4) - DUMB COMPONENTS ONLY

---

### Section 5: Shared UI Components (Day 4) - DUMB COMPONENTS ONLY

**IMPORTANTE**: Componentes são APENAS UI. ZERO lógica de negócio, ZERO chamadas HTTP, ZERO acesso direto a stores.
Usam apenas `input()` e `output()` signals.

#### Loading Spinner Component

- [ ] CORE-049 [P] Create LoadingSpinnerComponent in `src/app/shared/components/loading-spinner/loading-spinner.component.ts`
  - Standalone: true
  - Imports: ProgressSpinnerModule (PrimeNG)
  - Input: `message = input<string>('Carregando...')`
  - Template: `<p-progressSpinner>` with message below
  - Style: Use PrimeFlex classes (flex, flex-column, align-items-center)
  - DUMB: No service injection, no logic

#### Confirm Dialog Component

- [ ] CORE-050 [P] Create ConfirmDialogComponent in `src/app/shared/components/confirm-dialog/confirm-dialog.component.ts`
  - Standalone: true
  - Imports: ConfirmDialogModule (PrimeNG)
  - Service: Wraps PrimeNG ConfirmationService
  - Method: `confirm(message: string, header: string, accept: () => void, reject?: () => void)`
  - Template: `<p-confirmDialog>`
  - Use: PrimeFlex for styling
  - DUMB: Only wraps PrimeNG service, no business logic

#### Empty State Component

- [ ] CORE-051 [P] Create EmptyStateComponent in `src/app/shared/components/empty-state/empty-state.component.ts`
  - Standalone: true
  - Imports: ButtonModule (PrimeNG)
  - Input: `icon = input<string>('pi pi-inbox')`
  - Input: `title = input<string>('Nenhum item encontrado')`
  - Input: `message = input<string>('')`
  - Input: `actionLabel = input<string | null>(null)`
  - Output: `actionClick = output<void>()`
  - Template: Icon, title, message, optional button
  - Style: PrimeFlex (flex, flex-column, align-items-center, gap-3, p-5)
  - DUMB: Pure presentational, no logic

#### Form Field Error Component

- [ ] CORE-052 [P] Create FormFieldErrorComponent in `src/app/shared/components/form-field-error/form-field-error.component.ts`
  - Standalone: true
  - Input: `control = input.required<AbstractControl>()`
  - Computed: `errorMessage = computed(() => get first error from control)`
  - Template: `@if (errorMessage()) { <small class="p-error">{{ errorMessage() }}</small> }`
  - Error messages map: required, email, min, max, pattern, etc.
  - Use: PrimeFlex for styling
  - DUMB: Only displays errors, no validation logic

---

### Section 6: Layout Components (Day 4 continued)

#### Header Component

- [ ] CORE-053 Create HeaderComponent in `src/app/shared/layout/header/header.component.ts`
  - Standalone: true
  - Imports: MenubarModule, AvatarModule, ButtonModule (PrimeNG)
  - Inject: AuthService (for currentUser, isMestre, isJogador)
  - Signal: `currentRole = signal<'MESTRE' | 'JOGADOR'>('JOGADOR')`
  - Template: Logo, app name, role switcher dropdown, user avatar/menu
  - Role switcher: Dropdown with MESTRE/JOGADOR options (only if user has both roles)
  - User menu: Profile, Logout
  - Style: PrimeFlex (flex, align-items-center, justify-content-between, p-3)
  - SMART COMPONENT: Can inject services and orchestrate

- [ ] CORE-054 Add role switcher logic to HeaderComponent
  - Method: `switchRole(role: 'MESTRE' | 'JOGADOR'): void` - updates signal, navigates to dashboard
  - Effect: `effect(() => { if (currentRole() === 'MESTRE') navigate('/dashboard/mestre') })`
  - Persist: Store selected role in sessionStorage

#### Sidebar Component

- [ ] CORE-055 Create SidebarComponent in `src/app/shared/layout/sidebar/sidebar.component.ts`
  - Standalone: true
  - Imports: MenuModule, PanelMenuModule (PrimeNG)
  - Inject: AuthService, Router
  - Computed: `menuItems = computed(() => generate menu based on currentUser roles)`
  - Mestre menu: Dashboard, Jogos, Configuração, Perfil
  - Jogador menu: Dashboard, Jogos, Fichas, Perfil
  - Template: `<p-panelMenu [model]="menuItems()">`
  - Style: PrimeFlex (min-w-16rem, h-full, surface-card)
  - SMART COMPONENT: Can inject services and orchestrate

- [ ] CORE-056 Add responsive behavior to SidebarComponent
  - Signal: `visible = signal<boolean>(false)`
  - Input: `mobileMode = input<boolean>(false)`
  - Template: Conditional `<p-sidebar>` for mobile, static `<div>` for desktop
  - Toggle method: `toggle(): void` - toggles visible signal
  - Style: PrimeFlex responsive classes (hidden, md:block)

---

### Section 7: Routing & Module Structure (Day 5)

#### Routing Configuration

- [ ] CORE-053 Update app.routes.ts in `src/app/app.routes.ts`
  - Add lazy-loaded route for dashboard: `loadComponent: () => import('./features/dashboard/dashboard.component')`
  - Add lazy-loaded route for games: `loadChildren: () => import('./features/games/games.routes')`
  - Add lazy-loaded route for character sheets: `loadChildren: () => import('./features/character-sheets/sheets.routes')`
  - Add lazy-loaded route for configuration: `loadChildren: () => import('./features/configuration/config.routes')`
  - Add lazy-loaded route for profile: `loadComponent: () => import('./features/profile/profile.component')`
  - Apply authGuard to all protected routes
  - Apply roleGuard to configuration route (data: { role: 'MESTRE' })

- [ ] CORE-054 Create games.routes.ts in `src/app/features/games/games.routes.ts`
  - Route: '' → GameListComponent
  - Route: 'novo' → GameFormComponent
  - Route: ':id' → GameDetailComponent
  - Route: ':id/editar' → GameFormComponent (edit mode)
  - All routes: canActivate: [authGuard]

- [ ] CORE-055 Create sheets.routes.ts in `src/app/features/character-sheets/sheets.routes.ts`
  - Route: '' → SheetListComponent
  - Route: 'novo' → SheetWizardComponent
  - Route: ':id' → SheetViewComponent
  - Route: ':id/editar' → SheetEditComponent
  - All routes: canActivate: [authGuard]

- [ ] CORE-056 Create config.routes.ts in `src/app/features/configuration/config.routes.ts`
  - Route: '' → ConfigDashboardComponent
  - Route: 'atributos' → AttributesConfigComponent
  - Route: 'aptidoes' → SkillsConfigComponent
  - Route: 'niveis' → LevelsConfigComponent
  - Route: 'limitadores' → LimitersConfigComponent
  - Route: 'classes' → ClassesConfigComponent
  - Route: 'vantagens' → AdvantagesConfigComponent
  - Route: 'racas' → RacesConfigComponent
  - Route: 'prospeccao' → ProspectingConfigComponent
  - Route: 'presencas' → PresencesConfigComponent
  - Route: 'generos' → GendersConfigComponent
  - All routes: canActivate: [authGuard, roleGuard], data: { role: 'MESTRE' }

#### Feature Module Structure

- [ ] CORE-057 Create feature directories structure
  - Create: `/src/app/features/dashboard/`
  - Create: `/src/app/features/games/`
  - Create: `/src/app/features/character-sheets/`
  - Create: `/src/app/features/configuration/`
  - Create: `/src/app/features/profile/`
  - Create placeholder README.md in each (describes module purpose, components, routes)

---

### Section 7: Integration & Testing (Day 5 continued)

#### Application Integration

- [ ] CORE-058 Update app.component.ts in `src/app/app.ts`
  - Add HeaderComponent to template
  - Add SidebarComponent to template (conditional on route)
  - Add `<router-outlet>` for main content
  - Add `<p-toast>` for global notifications
  - Style: PrimeFlex layout (flex, h-screen)

- [ ] CORE-059 Verify all shared components render correctly
  - Manual test: LoadingSpinner shows on demo page
  - Manual test: ConfirmDialog shows on button click
  - Manual test: EmptyState shows with all input variations
  - Manual test: FormFieldError shows validation messages

#### Service Integration Tests

- [ ] CORE-060 Write integration test for auth flow in `src/app/core/services/auth-flow.integration.spec.ts`
  - Test: Login → getCurrentUser → user signal updated
  - Test: Logout → user signal cleared
  - Test: Role switch → navigate to correct dashboard
  - Use: @testing-library/angular

- [ ] CORE-061 Write integration test for API → State flow
  - Test: JogosStateService.loadJogos → calls JogosApiService → updates signal
  - Test: FichasStateService.createFicha → calls API → adds to signal
  - Test: Error handling → ErrorHandler called, toast shown
  - Mock: HttpClient responses

#### Coverage Verification

- [ ] CORE-062 Run test suite and verify coverage
  - Command: `npm run test -- --coverage`
  - Verify: Services coverage > 70%
  - Verify: Models coverage > 90% (mostly interfaces, but test DTOs)
  - Fix: Any failing tests
  - Document: Coverage report in `.specify/coverage-report.md`

---

## Acceptance Criteria

### Models
- ✅ All 20+ TypeScript interfaces created with correct properties
- ✅ Enums defined for status fields (Jogo.status, Participante.status, etc.)
- ✅ Nested relationships clearly defined (User in Jogo, Ficha in Participante)
- ✅ DTO models separate from entity models

### API Services
- ✅ All CRUD methods implemented for Jogos, Fichas, Config
- ✅ Async/await pattern used (firstValueFrom)
- ✅ Error handling implemented (try/catch, throw custom errors)
- ✅ Unit tests pass with 70%+ coverage

### State Services
- ✅ All state services use Signals (signal, computed)
- ✅ Private writable signals, public readonly computed
- ✅ CRUD methods update signals immutably (using .update())
- ✅ Services inject API services via inject()
- ✅ Unit tests pass with 70%+ coverage

### Shared Components
- ✅ All 4 components render without errors
- ✅ Input/output signals used (no @Input/@Output decorators)
- ✅ PrimeNG components integrated correctly
- ✅ PrimeFlex classes used exclusively (no custom CSS)
- ✅ Components responsive on mobile

### Layout Components
- ✅ Header shows role switcher (if user has both roles)
- ✅ Header shows user avatar and menu
- ✅ Sidebar menu items conditional on user role
- ✅ Sidebar responsive (sidebar component on mobile, static on desktop)
- ✅ Layout integrates with router-outlet

### Routing
- ✅ All feature modules lazy-loaded
- ✅ Auth guard applied to protected routes
- ✅ Role guard applied to Mestre-only routes
- ✅ Navigation works between modules
- ✅ 404 route works for invalid paths

### Code Quality
- ✅ No ESLint errors or warnings
- ✅ All files follow constitution patterns (Signals, inject(), control flow)
- ✅ TypeScript strict mode enabled, no `any` types
- ✅ Code formatted with Prettier

---

## Dependencies for Next Phases

### Required for Dashboard & Games (Phase 2A)
- ✅ Jogo, Participante models
- ✅ JogosApiService, JogosStateService
- ✅ Shared components (Loading, ConfirmDialog, EmptyState)
- ✅ Layout (Header, Sidebar)

### Required for Character Sheets (Phase 2B, 3A, 3B)
- ✅ Ficha model + all nested models
- ✅ FichasApiService, FichasStateService
- ✅ Shared components (Loading, FormFieldError)
- ✅ Layout (Header, Sidebar)

### Required for Configuration (Phase 3B)
- ✅ All config models (AtributoConfig, AptidaoConfig, etc.)
- ✅ ConfigApiService, ConfigStateService
- ✅ Shared components (Loading, ConfirmDialog)

---

## Notes

- **Parallel Development**: Models can be created in parallel across multiple developers
- **API Mocking**: If backend not ready, create mock services implementing same interface
- **Testing Strategy**: Focus on services (70%+ coverage), components tested in later phases
- **Error Handling**: All API calls should catch errors and call ErrorHandlerService
- **Type Safety**: Use strict TypeScript, avoid `any`, prefer interfaces over types

---

**Next Step**: Once all tasks checked off, proceed to `tasks-dashboard-games.md` (Phase 2A)
