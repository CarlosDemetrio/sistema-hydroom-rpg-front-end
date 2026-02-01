# Tasks: Dashboard & Games

**Phase**: 2A (Parallel with 2B)  
**Duration**: 5 days  
**Dependencies**: Core Infrastructure (Phase 1)  
**Parallel with**: Character Sheets View (Phase 2B)

---

## Overview

This phase implements the dashboard for both Mestre and Jogador roles, plus full CRUD functionality for Games (Jogos) and Participant Management.

**Deliverables**:
- ✅ Dashboard with role-based variants (Mestre/Jogador)
- ✅ Game List with filters and search (p-table)
- ✅ Game Form for create/edit (p-dialog)
- ✅ Game Detail with tabs (info, participants, character sheets)
- ✅ Participant Manager (approve/reject UI for Mestre)
- ✅ Join game flow (Jogador requests, selects character)

---

## Tasks

### Section 1: Dashboard Component (Day 1)

#### Main Dashboard Router

- [ ] GAME-001 Create DashboardComponent in `src/app/features/dashboard/dashboard.component.ts`
  - Standalone: true
  - Imports: CommonModule (for @if), RouterModule
  - Inject: `authService = inject(AuthService)`
  - Computed: `isMestre = computed(() => authService.isMestre())`
  - Computed: `isJogador = computed(() => authService.isJogador())`
  - Template: `@if (isMestre()) { <app-mestre-dashboard> } @else { <app-jogador-dashboard> }`
  - Style: PrimeFlex (min-h-screen, surface-ground, p-4)

#### Mestre Dashboard

- [ ] GAME-002 Create MestreDashboardComponent in `src/app/features/dashboard/mestre-dashboard/mestre-dashboard.component.ts`
  - Standalone: true
  - Imports: CardModule, ButtonModule (PrimeNG), RouterModule
  - Inject: `jogosState = inject(JogosStateService)`, `fichasState = inject(FichasStateService)`
  - Effect: `effect(() => { jogosState.loadJogos(); fichasState.loadFichas(); })`
  - Computed: `totalJogos = computed(() => jogosState.jogos().length)`
  - Computed: `totalJogadores = computed(() => count unique jogadores from participantes)`
  - Computed: `totalFichas = computed(() => fichasState.fichas().length)`
  - Computed: `jogosRecentes = computed(() => jogosState.jogos().slice(0, 5).sort by dataCriacao desc)`
  - Template: Stats cards (total jogos, jogadores, fichas), recent games list, quick actions ([+ Novo Jogo] button)
  - Style: PrimeFlex (grid, col-12, md:col-6, lg:col-4, gap-4)

- [ ] GAME-003 Add stats cards to MestreDashboardComponent template
  - Card 1: Total Jogos (icon: pi pi-globe)
  - Card 2: Total Jogadores (icon: pi pi-users)
  - Card 3: Total Fichas (icon: pi pi-book)
  - Each card: Title, number, icon, PrimeFlex classes (surface-card, p-4, border-round)

- [ ] GAME-004 Add recent games list to MestreDashboardComponent template
  - Section title: "Meus Jogos Recentes"
  - `@for (jogo of jogosRecentes(); track jogo.id)`
  - Each game: name, status badge, participant count, [Ver Detalhes] button
  - Style: PrimeFlex (flex, flex-column, gap-3)

#### Jogador Dashboard

- [ ] GAME-005 Create JogadorDashboardComponent in `src/app/features/dashboard/jogador-dashboard/jogador-dashboard.component.ts`
  - Standalone: true
  - Imports: CardModule, ButtonModule, DataViewModule (PrimeNG), RouterModule
  - Inject: `fichasState = inject(FichasStateService)`, `jogosState = inject(JogosStateService)`
  - Effect: `effect(() => { fichasState.loadFichas(); jogosState.loadJogos(); })`
  - Computed: `minhasFichas = computed(() => fichasState.minhasFichas())`
  - Computed: `meusJogos = computed(() => jogos where I'm a participant)`
  - Computed: `convitesPendentes = computed(() => participantes with status PENDENTE for current user)`
  - Template: My characters list (cards), my games list, pending invitations, quick actions ([+ Nova Ficha] button)
  - Style: PrimeFlex (grid, col-12, md:col-6, gap-4)

- [ ] GAME-006 Add my characters section to JogadorDashboardComponent template
  - Section title: "Minhas Fichas"
  - `<p-dataView [value]="minhasFichas()" layout="grid">`
  - Each character card: name, level, game (if assigned), [Ver] and [Editar] buttons
  - Empty state: Use EmptyStateComponent with message "Você ainda não criou nenhuma ficha" and [+ Nova Ficha] button
  - Style: PrimeFlex (grid, col-12, md:col-6, lg:col-4)

- [ ] GAME-007 Add pending invitations section to JogadorDashboardComponent template
  - Section title: "Convites Pendentes"
  - `@if (convitesPendentes().length > 0)`
  - Each invitation: game name, mestre name, date, [Ver Jogo] button
  - Badge: "PENDENTE" (severity: warning)
  - Empty state: "Nenhum convite pendente"

---

### Section 2: Game List Component (Day 2)

#### List View

- [ ] GAME-008 Create GameListComponent in `src/app/features/games/game-list/game-list.component.ts`
  - Standalone: true
  - Imports: TableModule, ButtonModule, InputTextModule, DropdownModule, TagModule (PrimeNG), RouterModule
  - Inject: `jogosState = inject(JogosStateService)`, `authService = inject(AuthService)`, `router = inject(Router)`
  - Effect: `effect(() => { jogosState.loadJogos(); })`
  - Computed: `jogos = computed(() => jogosState.jogos())`
  - Signal: `loading = signal<boolean>(false)`
  - Signal: `searchTerm = signal<string>('')`
  - Signal: `statusFilter = signal<string | null>(null)`
  - Template: `<p-table [value]="filteredJogos()" [loading]="loading()">`
  - Columns: Nome, Mestre, Status, Participantes, Data Criação, Ações
  - Actions: [Ver], [Editar] (Mestre only), [Excluir] (Mestre only)
  - Style: PrimeFlex (surface-card, p-4, border-round)

- [ ] GAME-009 Add filters to GameListComponent template
  - Search input: `<input type="text" pInputText [(ngModel)]="searchTerm" placeholder="Buscar por nome...">`
  - Status dropdown: `<p-dropdown [options]="statusOptions" [(ngModel)]="statusFilter" placeholder="Filtrar por status">`
  - Status options: [{ label: 'Todos', value: null }, { label: 'Ativo', value: 'ATIVO' }, ...]
  - Clear filters button: [Limpar Filtros]
  - Style: PrimeFlex (flex, gap-3, mb-4)

- [ ] GAME-010 Implement filteredJogos computed in GameListComponent
  - Filter by searchTerm (nome contains)
  - Filter by statusFilter (status equals)
  - Sort by dataCriacao desc

- [ ] GAME-011 Add create button to GameListComponent template
  - Button: [+ Novo Jogo] (visible only if isMestre)
  - Click: Navigate to '/jogos/novo'
  - Style: PrimeFlex (mb-4), PrimeNG severity="success"

#### Table Actions

- [ ] GAME-012 Implement view action in GameListComponent
  - Method: `viewGame(id: number): void` - navigate to `/jogos/${id}`

- [ ] GAME-013 Implement edit action in GameListComponent
  - Method: `editGame(id: number): void` - navigate to `/jogos/${id}/editar`
  - Visible only if current user is mestre of game

- [ ] GAME-014 Implement delete action in GameListComponent
  - Method: `async deleteGame(id: number): Promise<void>`
  - Show confirm dialog: "Tem certeza que deseja excluir este jogo?"
  - On confirm: Call `jogosState.deleteJogo(id)`, show success toast
  - On error: Show error toast
  - Visible only if current user is mestre of game

---

### Section 3: Game Form Component (Day 3)

#### Create/Edit Form

- [ ] GAME-015 Create GameFormComponent in `src/app/features/games/game-form/game-form.component.ts`
  - Standalone: true
  - Imports: ReactiveFormsModule, InputTextModule, InputTextareaModule, ButtonModule (PrimeNG), RouterModule
  - Inject: `fb = inject(FormBuilder)`, `jogosState = inject(JogosStateService)`, `router = inject(Router)`, `route = inject(ActivatedRoute)`
  - Signal: `loading = signal<boolean>(false)`
  - Signal: `editMode = signal<boolean>(false)`
  - Signal: `jogoId = signal<number | null>(null)`
  - Form: `form = this.fb.group({ nome: ['', [Validators.required, Validators.minLength(3)]], descricao: [''] })`
  - Effect: `effect(() => { if (route.snapshot.paramMap.has('id')) loadGameForEdit(); })`
  - Template: Dialog with form fields, [Salvar] and [Cancelar] buttons
  - Style: PrimeFlex (flex, flex-column, gap-4)

- [ ] GAME-016 Add form fields to GameFormComponent template
  - Field: Nome (required, 3-50 chars)
    - `<input type="text" pInputText formControlName="nome" placeholder="Nome do jogo">`
    - Error: Use FormFieldErrorComponent
  - Field: Descrição (optional, textarea)
    - `<textarea pInputTextarea formControlName="descricao" rows="5" placeholder="Descrição do jogo"></textarea>`
  - Style: PrimeFlex (flex, flex-column, gap-2)

- [ ] GAME-017 Implement save logic in GameFormComponent
  - Method: `async onSubmit(): Promise<void>`
  - If editMode: Call `jogosState.updateJogo(jogoId, form.value)`, show "Jogo atualizado com sucesso"
  - If create mode: Call `jogosState.createJogo(form.value)`, show "Jogo criado com sucesso"
  - On success: Navigate to '/jogos'
  - On error: Show error toast, keep form open
  - Disable [Salvar] button while loading

- [ ] GAME-018 Implement loadGameForEdit in GameFormComponent
  - Method: `async loadGameForEdit(): Promise<void>`
  - Get jogoId from route params
  - Call `jogosState.getJogo(jogoId)` (needs implementation in state service)
  - Patch form values with loaded data
  - Set editMode = true

- [ ] GAME-019 Implement cancel action in GameFormComponent
  - Method: `onCancel(): void`
  - If form dirty: Show confirm dialog "Descartar alterações?"
  - On confirm or if not dirty: Navigate to '/jogos'

---

### Section 4: Game Detail Component (Day 4)

#### Detail View with Tabs

- [ ] GAME-020 Create GameDetailComponent in `src/app/features/games/game-detail/game-detail.component.ts`
  - Standalone: true
  - Imports: TabViewModule, CardModule, ButtonModule, TagModule (PrimeNG), RouterModule
  - Inject: `jogosState = inject(JogosStateService)`, `route = inject(ActivatedRoute)`, `authService = inject(AuthService)`
  - Signal: `jogo = signal<Jogo | null>(null)`
  - Signal: `loading = signal<boolean>(true)`
  - Effect: `effect(() => { const id = route.snapshot.paramMap.get('id'); loadJogo(id); })`
  - Computed: `isMestre = computed(() => jogo()?.mestreId === authService.currentUser()?.id)`
  - Template: `<p-tabView>` with 3 tabs: Informações, Participantes, Fichas
  - Style: PrimeFlex (surface-card, p-4, border-round)

- [ ] GAME-021 Implement loadJogo in GameDetailComponent
  - Method: `async loadJogo(id: string): Promise<void>`
  - Call `jogosState.getJogo(Number(id))`
  - Update jogo signal
  - Set loading = false
  - On error: Navigate to '/404'

#### Tab 1: Informações

- [ ] GAME-022 Add "Informações" tab to GameDetailComponent template
  - Display: Nome (heading)
  - Display: Descrição (paragraph or "Sem descrição")
  - Display: Mestre (nome + avatar)
  - Display: Status (badge with color: ATIVO = success, PAUSADO = warning, FINALIZADO = secondary)
  - Display: Data de Criação (formatted date)
  - Actions: [Editar] (if isMestre), [Excluir] (if isMestre)
  - Style: PrimeFlex (flex, flex-column, gap-3)

#### Tab 2: Participantes

- [ ] GAME-023 Add "Participantes" tab to GameDetailComponent template
  - Import: ParticipantManagerComponent
  - Template: `<app-participant-manager [jogoId]="jogo()!.id" [isMestre]="isMestre()" />`

#### Tab 3: Fichas

- [ ] GAME-024 Add "Fichas" tab to GameDetailComponent template
  - Computed: `fichasDoJogo = computed(() => get fichas for this jogo from fichasState)`
  - Display: List of character sheets (cards)
  - Each card: Character name, player name, level, [Ver] button
  - Empty state: "Nenhuma ficha associada a este jogo"
  - Style: PrimeFlex (grid, col-12, md:col-6, lg:col-4, gap-3)

---

### Section 5: Participant Manager Component (Day 5)

#### Participant List with Actions

- [ ] GAME-025 Create ParticipantManagerComponent in `src/app/features/games/participant-manager/participant-manager.component.ts`
  - Standalone: true
  - Imports: TableModule, ButtonModule, TagModule, AvatarModule (PrimeNG)
  - Input: `jogoId = input.required<number>()`
  - Input: `isMestre = input<boolean>(false)`
  - Inject: `jogosState = inject(JogosStateService)`
  - Signal: `participantes = signal<Participante[]>([])`
  - Signal: `loading = signal<boolean>(true)`
  - Effect: `effect(() => { loadParticipantes(jogoId()); })`
  - Template: `<p-table [value]="participantes()" [loading]="loading()">`
  - Columns: Jogador, Ficha, Status, Data, Ações
  - Style: PrimeFlex (surface-card, p-3, border-round)

- [ ] GAME-026 Implement loadParticipantes in ParticipantManagerComponent
  - Method: `async loadParticipantes(jogoId: number): Promise<void>`
  - Call `jogosState.loadParticipantes(jogoId)`
  - Update participantes signal with result
  - Set loading = false

- [ ] GAME-027 Add status badges to ParticipantManagerComponent template
  - PENDENTE: warning severity
  - APROVADO: success severity
  - REJEITADO: danger severity

#### Mestre Actions

- [ ] GAME-028 Add approve action to ParticipantManagerComponent (Mestre only)
  - Method: `async aprovarParticipante(participanteId: number): Promise<void>`
  - Call `jogosState.aprovarParticipante(jogoId(), participanteId)`
  - Show success toast: "Participante aprovado"
  - Reload participantes list
  - Button visible only if status === 'PENDENTE' and isMestre = true

- [ ] GAME-029 Add reject action to ParticipantManagerComponent (Mestre only)
  - Method: `async rejeitarParticipante(participanteId: number): Promise<void>`
  - Show confirm dialog: "Tem certeza que deseja rejeitar este participante?"
  - On confirm: Call `jogosState.rejeitarParticipante(jogoId(), participanteId)`
  - Show success toast: "Participante rejeitado"
  - Reload participantes list
  - Button visible only if status === 'PENDENTE' and isMestre = true

- [ ] GAME-030 Add remove action to ParticipantManagerComponent (Mestre only)
  - Method: `async removerParticipante(participanteId: number): Promise<void>`
  - Show confirm dialog: "Tem certeza que deseja remover este participante?"
  - On confirm: Call `jogosState.removerParticipante(jogoId(), participanteId)`
  - Show success toast: "Participante removido"
  - Reload participantes list
  - Button visible only if isMestre = true

#### Jogador Actions

- [ ] GAME-031 Add leave game action to ParticipantManagerComponent (Jogador only)
  - Method: `async sairDoJogo(): Promise<void>`
  - Show confirm dialog: "Tem certeza que deseja sair deste jogo?"
  - On confirm: Call `jogosState.removerParticipante(jogoId(), myParticipanteId)`
  - Show success toast: "Você saiu do jogo"
  - Navigate to '/jogos'
  - Button visible only if current user is participant and isMestre = false

---

### Section 6: Join Game Flow (Day 5 continued)

#### Join Request Dialog

- [ ] GAME-032 Add "Solicitar Participação" button to GameDetailComponent (Jogador only)
  - Button: [Solicitar Participação]
  - Visible only if: current user is NOT already a participant and isJogador = true
  - Click: Open join dialog
  - Style: PrimeNG severity="success"

- [ ] GAME-033 Create JoinGameDialogComponent in `src/app/features/games/join-game-dialog/join-game-dialog.component.ts`
  - Standalone: true
  - Imports: DialogModule, DropdownModule, ButtonModule (PrimeNG)
  - Input: `jogoId = input.required<number>()`
  - Input: `visible = model<boolean>(false)`
  - Inject: `fichasState = inject(FichasStateService)`, `jogosState = inject(JogosStateService)`
  - Signal: `selectedFichaId = signal<number | null>(null)`
  - Computed: `minhasFichas = computed(() => fichasState.minhasFichas())`
  - Template: Dialog with dropdown to select character, [Solicitar] and [Cancelar] buttons
  - Style: PrimeFlex (flex, flex-column, gap-3)

- [ ] GAME-034 Implement join request in JoinGameDialogComponent
  - Method: `async solicitarParticipacao(): Promise<void>`
  - Validate: selectedFichaId is not null
  - Call `jogosState.solicitarParticipacao(jogoId(), selectedFichaId())`
  - Show success toast: "Solicitação enviada! Aguarde aprovação do mestre."
  - Close dialog
  - On error: Show error toast

- [ ] GAME-035 Add JoinGameDialogComponent to GameDetailComponent
  - Import: JoinGameDialogComponent
  - Signal: `joinDialogVisible = signal<boolean>(false)`
  - Template: `<app-join-game-dialog [jogoId]="jogo()!.id" [(visible)]="joinDialogVisible" />`
  - Button click: `joinDialogVisible.set(true)`

---

## Acceptance Criteria

### Dashboard
- ✅ Mestre dashboard shows stats (total jogos, jogadores, fichas)
- ✅ Mestre dashboard shows recent games list
- ✅ Jogador dashboard shows my characters (cards)
- ✅ Jogador dashboard shows my games
- ✅ Jogador dashboard shows pending invitations
- ✅ Quick actions work ([+ Novo Jogo], [+ Nova Ficha])
- ✅ Dashboard responsive on mobile (cards stack)

### Game List
- ✅ Table shows all games with columns (Nome, Mestre, Status, Participantes, Data)
- ✅ Search filter works (by nome)
- ✅ Status filter works (ATIVO, PAUSADO, FINALIZADO)
- ✅ Actions work ([Ver], [Editar], [Excluir])
- ✅ [+ Novo Jogo] button visible only to Mestre
- ✅ Permissions enforced (only mestre can edit/delete their games)

### Game Form
- ✅ Create mode: Form empty, saves new game, navigates to list
- ✅ Edit mode: Form prefilled, updates existing game, navigates to list
- ✅ Validation works (nome required, min 3 chars)
- ✅ Error messages shown (FormFieldErrorComponent)
- ✅ Loading state shown while saving
- ✅ Cancel confirmation works if form dirty

### Game Detail
- ✅ Loads game by ID from route params
- ✅ Tab 1 (Informações): Shows game details
- ✅ Tab 2 (Participantes): Shows ParticipantManagerComponent
- ✅ Tab 3 (Fichas): Shows character sheets for this game
- ✅ [Editar] and [Excluir] buttons visible only to mestre
- ✅ 404 redirect if game not found

### Participant Manager
- ✅ Lists all participants with status badges
- ✅ Mestre can approve/reject pending participants
- ✅ Mestre can remove participants
- ✅ Jogador can leave game (if participant)
- ✅ Confirm dialogs work for destructive actions
- ✅ Success toasts shown after actions
- ✅ List reloads after actions

### Join Game Flow
- ✅ [Solicitar Participação] button visible to jogador (if not already participant)
- ✅ Dialog shows dropdown with jogador's characters
- ✅ Request sent successfully, status = PENDENTE
- ✅ Success toast shown
- ✅ Participant appears in manager with PENDENTE status

### Code Quality
- ✅ No ESLint errors or warnings
- ✅ All components use Signals (no BehaviorSubject)
- ✅ All components use inject() (no constructor DI)
- ✅ All templates use control flow syntax (@if, @for)
- ✅ All styling uses PrimeFlex (no custom CSS)
- ✅ TypeScript strict mode, no `any` types

---

## Dependencies for Next Phases

### Required for Character Sheets (Phase 2B, 3A, 3B)
- ✅ Dashboard component (for navigation)
- ✅ Game List (for joining games)
- ✅ Participant Manager (for character association)

### Required for Mobile Optimization (Phase 5)
- ✅ Dashboard (optimize cards)
- ✅ Game List (optimize table for mobile)
- ✅ Game Detail tabs (optimize for mobile)

---

## Testing Notes

- **Unit Tests**: Focus on methods (deleteGame, aprovarParticipante, etc.)
- **Integration Tests**: Test API → State → Component flow
- **Manual Tests**:
  - Create game as Mestre, verify appears in list
  - Edit game, verify changes saved
  - Delete game, verify removed from list
  - Request join as Jogador, verify status = PENDENTE
  - Approve participant as Mestre, verify status = APROVADO
  - Reject participant as Mestre, verify status = REJEITADO
  - Leave game as Jogador, verify removed from participants

---

**Next Step**: Once all tasks checked off, proceed to `tasks-character-sheets-view.md` (Phase 2B) in parallel or after
