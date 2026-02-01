# Tasks: Character Sheets - View

**Phase**: 2B (Parallel with 2A)  
**Duration**: 5 days  
**Dependencies**: Core Infrastructure (Phase 1)  
**Parallel with**: Dashboard & Games (Phase 2A)

---

## Overview

This phase implements the read-only view of character sheets, including list display and detailed view with all sections (attributes, skills, health, equipment, advantages, titles/runes, notes).

**Deliverables**:
- ✅ Character Sheet List (p-dataView with cards, mobile-friendly)
- ✅ Character Sheet View (read-only with accordion sections)
- ✅ 7 section components (reusable for wizard and edit phases)
- ✅ Navigation between list and detail views

---

## Tasks

### Section 1: Character Sheet List (Day 1)

#### List Component

- [ ] SHEET-001 Create SheetListComponent in `src/app/features/character-sheets/sheet-list/sheet-list.component.ts`
  - Standalone: true
  - Imports: DataViewModule, CardModule, ButtonModule, TagModule, InputTextModule (PrimeNG), RouterModule
  - Inject: `fichasState = inject(FichasStateService)`, `authService = inject(AuthService)`, `router = inject(Router)`
  - Effect: `effect(() => { fichasState.loadFichas(); })`
  - Computed: `fichas = computed(() => authService.isMestre() ? fichasState.fichas() : fichasState.minhasFichas())`
  - Signal: `loading = signal<boolean>(false)`
  - Signal: `searchTerm = signal<string>('')`
  - Signal: `layout = signal<'grid' | 'list'>('grid')`
  - Template: `<p-dataView [value]="filteredFichas()" [layout]="layout()" [loading]="loading()">`
  - Style: PrimeFlex (surface-card, p-4, border-round)

- [ ] SHEET-002 Add filters to SheetListComponent template
  - Search input: `<input type="text" pInputText [(ngModel)]="searchTerm" placeholder="Buscar por nome...">`
  - Layout toggle: Grid vs List view (buttons with icons)
  - [+ Nova Ficha] button (visible only to Jogador)
  - Style: PrimeFlex (flex, align-items-center, justify-content-between, mb-4, gap-3)

- [ ] SHEET-003 Implement filteredFichas computed in SheetListComponent
  - Filter by searchTerm (nome or jogador.nome contains)
  - Sort by dataCriacao desc

#### Card Template (Grid Layout)

- [ ] SHEET-004 Create grid item template in SheetListComponent
  - `<ng-template let-ficha pTemplate="gridItem">`
  - Card content:
    - Character name (heading)
    - Player name (if mestre view)
    - Level badge
    - Game name (if assigned)
    - Stats preview (3 key attributes or health)
  - Card actions:
    - [Ver] button
    - [Editar] button (if owner or mestre)
    - [Excluir] button (if owner)
  - Style: PrimeFlex (surface-card, p-4, border-round, flex, flex-column, gap-3)

#### List Template (List Layout)

- [ ] SHEET-005 Create list item template in SheetListComponent
  - `<ng-template let-ficha pTemplate="listItem">`
  - Row content:
    - Character avatar (placeholder icon)
    - Name, level, player
    - Game (if assigned)
    - Last updated date
    - Actions (same as grid)
  - Style: PrimeFlex (flex, align-items-center, gap-3, p-3, border-bottom-1, surface-border)

#### Actions

- [ ] SHEET-006 Implement view action in SheetListComponent
  - Method: `viewSheet(id: number): void` - navigate to `/fichas/${id}`

- [ ] SHEET-007 Implement edit action in SheetListComponent
  - Method: `editSheet(id: number): void` - navigate to `/fichas/${id}/editar`
  - Visible only if current user is owner or mestre

- [ ] SHEET-008 Implement delete action in SheetListComponent
  - Method: `async deleteSheet(id: number): Promise<void>`
  - Show confirm dialog: "Tem certeza que deseja excluir esta ficha?"
  - On confirm: Call `fichasState.deleteFicha(id)`, show success toast
  - Visible only if current user is owner

#### Empty State

- [ ] SHEET-009 Add empty state to SheetListComponent
  - `@if (filteredFichas().length === 0)`
  - Use EmptyStateComponent with icon "pi pi-book", title "Nenhuma ficha encontrada", action "[+ Nova Ficha]" (if jogador)

---

### Section 2: Character Sheet View Component (Day 2)

#### Main View Component

- [ ] SHEET-010 Create SheetViewComponent in `src/app/features/character-sheets/sheet-view/sheet-view.component.ts`
  - Standalone: true
  - Imports: AccordionModule, CardModule, ButtonModule, TagModule (PrimeNG), RouterModule
  - Inject: `fichasState = inject(FichasStateService)`, `route = inject(ActivatedRoute)`, `authService = inject(AuthService)`, `router = inject(Router)`
  - Signal: `ficha = signal<Ficha | null>(null)`
  - Signal: `loading = signal<boolean>(true)`
  - Effect: `effect(() => { const id = route.snapshot.paramMap.get('id'); loadFicha(id); })`
  - Computed: `isOwner = computed(() => ficha()?.jogadorId === authService.currentUser()?.id)`
  - Computed: `canEdit = computed(() => isOwner() || authService.isMestre())`
  - Template: Header (name, level, actions), accordion with 7 sections
  - Style: PrimeFlex (surface-card, p-4, border-round)

- [ ] SHEET-011 Implement loadFicha in SheetViewComponent
  - Method: `async loadFicha(id: string): Promise<void>`
  - Call `fichasState.getFicha(Number(id))`
  - Update ficha signal
  - Set loading = false
  - On error: Navigate to '/404'

#### Header Section

- [ ] SHEET-012 Add header to SheetViewComponent template
  - Character name (h1)
  - Player name (subtitle, if mestre view)
  - Level badge
  - Game badge (if assigned)
  - Actions: [Editar] (if canEdit), [Excluir] (if isOwner), [Voltar] button
  - Style: PrimeFlex (flex, align-items-center, justify-content-between, mb-4, pb-3, border-bottom-1)

#### Accordion Sections

- [ ] SHEET-013 Add accordion to SheetViewComponent template
  - `<p-accordion [multiple]="true" [activeIndex]="[0, 1, 2, 3, 4, 5, 6]">`
  - 7 tabs (all expanded by default):
    1. Identificação & Progressão
    2. Atributos
    3. Vida & Membros
    4. Aptidões
    5. Equipamentos
    6. Vantagens
    7. Títulos, Runas & Anotações
  - Each tab: Use section component (created below)
  - Style: PrimeFlex (mb-3)

---

### Section 3: Section Components - Identification & Progression (Day 2 continued)

#### Identification Section

- [ ] SHEET-014 Create IdentificationSectionComponent in `src/app/features/character-sheets/shared/sections/identification-section/identification-section.component.ts`
  - Standalone: true
  - Input: `ficha = input.required<Ficha>()`
  - Input: `readonly = input<boolean>(true)`
  - Template (readonly mode):
    - Grid with fields: Nome, Origem, Índole, Linhagem, Presença, Tipo Heroico
    - Each field: Label + value (or "Não informado")
  - Style: PrimeFlex (grid, col-12, md:col-6, gap-3)

#### Progression Section

- [ ] SHEET-015 Create ProgressionSectionComponent in `src/app/features/character-sheets/shared/sections/progression-section/progression-section.component.ts`
  - Standalone: true
  - Input: `ficha = input.required<Ficha>()`
  - Input: `readonly = input<boolean>(true)`
  - Template (readonly mode):
    - Grid with fields: Nível, Experiência (with XP bar), Limitador, Renascimento, Insolitus, NVs
    - XP bar: `<p-progressBar [value]="xpPercent()">`
  - Computed: `xpPercent = computed(() => calculate % towards next level)`
  - Style: PrimeFlex (grid, col-12, md:col-6, gap-3)

#### Physical Description Section

- [ ] SHEET-016 Create PhysicalDescriptionSectionComponent in `src/app/features/character-sheets/shared/sections/physical-description-section/physical-description-section.component.ts`
  - Standalone: true
  - Input: `ficha = input.required<Ficha>()`
  - Input: `readonly = input<boolean>(true)`
  - Template (readonly mode):
    - Grid with fields: Idade, Altura, Peso, Olhos, Cabelo
    - Each field: Label + value (or "Não informado")
  - Style: PrimeFlex (grid, col-12, md:col-4, gap-3)

---

### Section 4: Section Components - Attributes (Day 3)

#### Attributes Section

- [ ] SHEET-017 Create AttributesSectionComponent in `src/app/features/character-sheets/shared/sections/attributes-section/attributes-section.component.ts`
  - Standalone: true
  - Imports: TableModule, TagModule (PrimeNG)
  - Input: `ficha = input.required<Ficha>()`
  - Input: `readonly = input<boolean>(true)`
  - Computed: `atributos = computed(() => ficha().atributos)`
  - Template (readonly mode):
    - `<p-table [value]="atributos()">`
    - Columns: Atributo, Base, Nível, Outros, Total
    - Each row: Attribute name (from config), values, total (bold)
  - Style: PrimeFlex (surface-card, p-3)

- [ ] SHEET-018 Add derived stats to AttributesSectionComponent
  - Below table, show calculated bonuses:
    - BBA (Bônus Base de Ataque): (Força + Agilidade) / 3
    - BBM (Bônus Base Mágico): (Sabedoria + Inteligência) / 3
    - Reflexo: (Agilidade + Astúcia) / 3
    - Bloqueio: (Força + Vigor) / 3
    - Percepção: (Inteligência + Intuição) / 3
    - Raciocínio: (Inteligência + Astúcia) / 3
    - Essência: (Vigor + Sabedoria) / 2
    - Ímpeto: Força * 5
  - Computed: `derivedStats = computed(() => calculate all derived stats)`
  - Template: Grid with cards, each showing stat name + value
  - Style: PrimeFlex (grid, col-6, md:col-4, lg:col-3, gap-2, mt-3)

---

### Section 5: Section Components - Health & Skills (Day 3 continued)

#### Health Section

- [ ] SHEET-019 Create HealthSectionComponent in `src/app/features/character-sheets/shared/sections/health-section/health-section.component.ts`
  - Standalone: true
  - Imports: ProgressBarModule, CardModule (PrimeNG)
  - Input: `ficha = input.required<Ficha>()`
  - Input: `readonly = input<boolean>(true)`
  - Computed: `vida = computed(() => ficha().vida)`
  - Template (readonly mode):
    - Vida Total (with progress bar showing current/max)
    - Breakdown: Vida Vigor, Vida Outros, Vida Nível
    - Sangue Percentual (%)
    - Limb Integrity table (6 members with % integrity)
  - Style: PrimeFlex (grid, col-12, md:col-6, gap-3)

- [ ] SHEET-020 Add limb integrity table to HealthSectionComponent
  - `<p-table [value]="vida().membros">`
  - Columns: Membro, Integridade (%)
  - Progress bar for each limb (color: success > 70%, warning 40-70%, danger < 40%)
  - Style: PrimeFlex (mt-3)

#### Skills Section

- [ ] SHEET-021 Create SkillsSectionComponent in `src/app/features/character-sheets/shared/sections/skills-section/skills-section.component.ts`
  - Standalone: true
  - Imports: TableModule, AccordionModule, TagModule (PrimeNG)
  - Input: `ficha = input.required<Ficha>()`
  - Input: `readonly = input<boolean>(true)`
  - Computed: `aptidoes = computed(() => ficha().aptidoes)`
  - Computed: `aptidoesFisicas = computed(() => filter by tipoAptidao === 'FISICO')`
  - Computed: `aptidoesMentais = computed(() => filter by tipoAptidao === 'MENTAL')`
  - Template (readonly mode):
    - `<p-accordion>`
    - Tab 1: Aptidões Físicas (table)
    - Tab 2: Aptidões Mentais (table)
  - Columns: Aptidão, Nível, Bônus
  - Style: PrimeFlex (surface-card, p-3)

---

### Section 6: Section Components - Equipment & Advantages (Day 4)

#### Equipment Section

- [ ] SHEET-022 Create EquipmentSectionComponent in `src/app/features/character-sheets/shared/sections/equipment-section/equipment-section.component.ts`
  - Standalone: true
  - Imports: TableModule, DataViewModule (PrimeNG)
  - Input: `ficha = input.required<Ficha>()`
  - Input: `readonly = input<boolean>(true)`
  - Computed: `equipamentos = computed(() => ficha().equipamentos)`
  - Computed: `armas = computed(() => filter by tipo === 'ARMA')`
  - Computed: `armaduras = computed(() => filter by tipo === 'ARMADURA')`
  - Computed: `outros = computed(() => filter by tipo === 'OUTRO')`
  - Template (readonly mode):
    - `<p-accordion>`
    - Tab 1: Armas (table: Nome, Dano, Peso)
    - Tab 2: Armaduras (table: Nome, Defesa, Peso)
    - Tab 3: Outros (dataView with cards)
  - Style: PrimeFlex (surface-card, p-3)

- [ ] SHEET-023 Add resistances display to EquipmentSectionComponent
  - Below equipment, show resistances summary:
    - Defesa Total (sum from armaduras)
    - Peso Total (sum from all equipment)
  - Computed: `defesaTotal = computed(() => sum defesa from armaduras)`
  - Computed: `pesoTotal = computed(() => sum peso from all equipamentos)`
  - Template: Cards with icon, label, value
  - Style: PrimeFlex (grid, col-6, gap-2, mt-3)

#### Advantages Section

- [ ] SHEET-024 Create AdvantagesSectionComponent in `src/app/features/character-sheets/shared/sections/advantages-section/advantages-section.component.ts`
  - Standalone: true
  - Imports: TableModule, TagModule (PrimeNG)
  - Input: `ficha = input.required<Ficha>()`
  - Input: `readonly = input<boolean>(true)`
  - Computed: `vantagens = computed(() => ficha().vantagens)`
  - Template (readonly mode):
    - `<p-table [value]="vantagens()">`
    - Columns: Vantagem, Categoria, Nível, Custo (XP), Descrição
    - Expandable rows for description
  - Style: PrimeFlex (surface-card, p-3)

- [ ] SHEET-025 Add XP cost summary to AdvantagesSectionComponent
  - Below table, show total XP spent on advantages
  - Computed: `custoTotal = computed(() => sum custo from all vantagens)`
  - Template: Card with "XP Investido: {{ custoTotal() }}"
  - Style: PrimeFlex (mt-3, p-3, surface-100, border-round)

---

### Section 7: Section Components - Titles, Runes & Notes (Day 4 continued)

#### Titles Section

- [ ] SHEET-026 Create TitlesRunesSectionComponent in `src/app/features/character-sheets/shared/sections/titles-runes-section/titles-runes-section.component.ts`
  - Standalone: true
  - Imports: DataViewModule, CardModule (PrimeNG)
  - Input: `ficha = input.required<Ficha>()`
  - Input: `readonly = input<boolean>(true)`
  - Computed: `titulos = computed(() => ficha().titulos)`
  - Computed: `runas = computed(() => ficha().runas)`
  - Template (readonly mode):
    - Section 1: Títulos (dataView with cards)
      - Each card: Title name, description
    - Section 2: Runas (dataView with cards)
      - Each card: Rune name, power, description
  - Style: PrimeFlex (grid, col-12, md:col-6, gap-3)

#### Notes Section

- [ ] SHEET-027 Create NotesSectionComponent in `src/app/features/character-sheets/shared/sections/notes-section/notes-section.component.ts`
  - Standalone: true
  - Imports: CardModule (PrimeNG)
  - Input: `ficha = input.required<Ficha>()`
  - Input: `readonly = input<boolean>(true)`
  - Template (readonly mode):
    - `<p-card>`
    - Display: ficha().anotacoes (formatted with line breaks)
    - Empty state: "Nenhuma anotação"
  - Style: PrimeFlex (surface-card, p-3, white-space-pre-wrap)

---

### Section 8: Navigation & Integration (Day 5)

#### Routing

- [ ] SHEET-028 Verify sheets.routes.ts in `src/app/features/character-sheets/sheets.routes.ts`
  - Route: '' → SheetListComponent (already defined in Phase 1)
  - Route: ':id' → SheetViewComponent (already defined in Phase 1)
  - Ensure canActivate: [authGuard] applied

#### Back Navigation

- [ ] SHEET-029 Add breadcrumb to SheetViewComponent
  - Imports: BreadcrumbModule (PrimeNG)
  - Signal: `breadcrumbItems = signal([{ label: 'Fichas', routerLink: '/fichas' }, { label: ficha()?.nome }])`
  - Template: `<p-breadcrumb [model]="breadcrumbItems()">`
  - Style: PrimeFlex (mb-3)

#### Integration with Dashboard

- [ ] SHEET-030 Verify dashboard links to sheet list
  - In JogadorDashboardComponent: [+ Nova Ficha] button → '/fichas/novo'
  - In JogadorDashboardComponent: Character card [Ver] button → '/fichas/:id'
  - In JogadorDashboardComponent: Character card [Editar] button → '/fichas/:id/editar'

#### Integration with Games

- [ ] SHEET-031 Verify game detail links to sheets
  - In GameDetailComponent, Tab 3 (Fichas): Character card [Ver] button → '/fichas/:id'

---

## Acceptance Criteria

### Character Sheet List
- ✅ Grid and List layout toggle works
- ✅ Search filter works (by character name or player name)
- ✅ Cards show: name, level, player (if mestre), game (if assigned)
- ✅ Actions work: [Ver], [Editar] (if owner/mestre), [Excluir] (if owner)
- ✅ [+ Nova Ficha] button visible only to Jogador
- ✅ Empty state shows when no fichas found
- ✅ Responsive on mobile (cards stack, actions accessible)

### Character Sheet View
- ✅ Loads character by ID from route params
- ✅ Header shows: name, level, player, game, actions
- ✅ All 7 sections display correctly in accordion
- ✅ All sections expanded by default
- ✅ [Editar] button visible only if owner or mestre
- ✅ [Excluir] button visible only if owner
- ✅ [Voltar] button navigates to list
- ✅ Breadcrumb shows navigation path
- ✅ 404 redirect if character not found

### Section Components - Identification & Progression
- ✅ Identification: Shows nome, origem, índole, linhagem, presença, tipo heroico
- ✅ Progression: Shows nível, experiência (with XP bar), limitador, renascimento, insolitus, nvs
- ✅ Physical Description: Shows idade, altura, peso, olhos, cabelo
- ✅ All fields handle null/undefined gracefully ("Não informado")

### Section Components - Attributes
- ✅ Table shows all attributes with Base, Nível, Outros, Total columns
- ✅ Derived stats calculated correctly (BBA, BBM, Reflexo, etc.)
- ✅ Derived stats displayed in cards below table
- ✅ Formula tooltips work (hover to see formula)

### Section Components - Health & Skills
- ✅ Health: Shows vida total (with progress bar), breakdown, sangue %
- ✅ Limb integrity table shows all 6 members with % and color-coded bars
- ✅ Skills: Tabs for Físicas and Mentais
- ✅ Skills table shows aptidão, nível, bônus

### Section Components - Equipment & Advantages
- ✅ Equipment: Tabs for Armas, Armaduras, Outros
- ✅ Equipment tables show nome, dano/defesa, peso
- ✅ Resistances summary shows defesa total, peso total
- ✅ Advantages: Table shows vantagem, categoria, nível, custo, descrição
- ✅ Advantages: Expandable rows for full description
- ✅ XP cost summary shows total XP invested

### Section Components - Titles, Runes & Notes
- ✅ Titles: Cards show title name and description
- ✅ Runes: Cards show rune name, power, description
- ✅ Notes: Displays anotacoes with line breaks preserved
- ✅ Empty states handle null/empty arrays gracefully

### Code Quality
- ✅ All components use Signals (no BehaviorSubject)
- ✅ All components use inject() (no constructor DI)
- ✅ All templates use control flow syntax (@if, @for)
- ✅ All styling uses PrimeFlex (no custom CSS)
- ✅ All section components have `readonly` input for future edit mode
- ✅ TypeScript strict mode, no `any` types

---

## Dependencies for Next Phases

### Required for Character Sheet Wizard (Phase 3A)
- ✅ All section components (reuse in wizard steps)
- ✅ Sheet List (for navigation after creation)

### Required for Character Sheet Edit (Phase 4)
- ✅ All section components (add edit mode)
- ✅ Sheet View (for comparison)

### Required for Mobile Optimization (Phase 5)
- ✅ Sheet List (optimize cards for mobile)
- ✅ Sheet View (optimize accordion for mobile)

---

## Testing Notes

- **Unit Tests**: Focus on computed properties (derivedStats, filteredFichas, etc.)
- **Integration Tests**: Test API → State → Component flow
- **Manual Tests**:
  - View character sheet, verify all sections display correctly
  - Expand/collapse accordion sections
  - Navigate from list to detail and back
  - Test as Mestre (can see all characters)
  - Test as Jogador (can see only own characters)
  - Test empty states (no characters, no equipment, etc.)
  - Test responsive behavior on mobile (cards stack, actions accessible)

---

**Next Step**: Once all tasks checked off, proceed to `tasks-character-sheets-create.md` (Phase 3A)
