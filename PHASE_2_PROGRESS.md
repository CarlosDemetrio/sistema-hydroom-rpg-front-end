# Phase 2 - Dashboard & Games + NOVA ARQUITETURA UX - Progress Tracker

**Status Geral**: 🚧 **EM ANDAMENTO (75%)**

---

## 🎯 NOVA ARQUITETURA UX (2026-02-01) ✅ COMPLETO

### UX-001: CurrentGameService ✅
**Arquivo**: `src/app/core/services/current-game.service.ts`
- ✅ Signal `_currentGameId` com localStorage persistence
- ✅ Computed `currentGame` (jogo completo)
- ✅ Computed `availableGames` (apenas ATIVO)
- ✅ Computed `hasCurrentGame`
- ✅ Method `selectGame(id)`, `clearGame()`
- ✅ Auto-seleção do primeiro jogo
- ✅ Effect para persistência

### UX-002: HeaderComponent ✅
**Arquivo**: `src/app/shared/components/header/header.component.ts`
- ✅ Logo + App name
- ✅ Seletor de jogo atual (p-select)
- ✅ FormsModule + ngModel para binding
- ✅ Signal local `selectedGameId` sincronizado com CurrentGameService
- ✅ User avatar + menu dropdown
- ✅ Menu items: Perfil, Configurações (mestre only), Sair
- ✅ 100% PrimeFlex responsivo
- ✅ Mobile: Flex vertical, elementos hidden
- ✅ Desktop: Flex horizontal, tudo visível

### UX-003: MainLayoutComponent ✅
**Arquivo**: `src/app/shared/layout/main-layout.component.ts`
- ✅ Wrapper com Header + RouterOutlet
- ✅ Integrado nas rotas autenticadas
- ✅ Layout responsivo

### UX-004: JogadorDashboard REFATORADO ✅
**Arquivo**: `src/app/features/dashboard/jogador-dashboard/jogador-dashboard.component.ts`
- ✅ **FOCO EM FICHAS** do jogo atual
- ✅ Inject CurrentGameService
- ✅ Computed `fichasDoJogoAtual` (filtro por gameId + userId)
- ✅ Computed `totalFichasNoJogo`
- ✅ Computed `fichasRecentes` (5 mais recentes)
- ✅ Empty state: Sem jogo selecionado
- ✅ Empty state: Sem fichas no jogo
- ✅ Cards com preview (Nível, Origem)
- ✅ Botões: Ver, Editar
- ✅ Navigation: criarFicha(), verFichas(), editarFicha(id)

### UX-005: FichaListComponent ✅ NOVO
**Arquivo**: `src/app/features/jogador/pages/fichas-list/fichas-list.component.ts`
- ✅ Lista de fichas do jogo atual
- ✅ Signal `searchTerm` com FormsModule
- ✅ Computed `fichasDoJogo` (filtro por gameId + userId)
- ✅ Computed `fichasFiltradas` (busca por nome)
- ✅ Grid responsivo de cards
- ✅ Preview: Nível, XP, Ímpeto
- ✅ Ações: Ver, Editar, Excluir
- ✅ ConfirmDialog para exclusão
- ✅ Toast messages
- ✅ Empty states: Sem jogo, sem fichas, sem resultados
- ✅ Loading state
- ✅ 100% PrimeFlex

---

## ✅ COMPLETO (Day 1 - Dashboard)

### Section 1: Dashboard Component

#### ✅ GAME-001: DashboardComponent (Main Router)
**Arquivo**: `src/app/pages/dashboard/dashboard.component.ts`
- ✅ Standalone: true
- ✅ Imports: MestreDashboard, JogadorDashboard
- ✅ Inject: AuthService
- ✅ Computed: isMestre(), isJogador()
- ✅ Template: @if conditional rendering baseado em role
- ✅ Style: PrimeFlex (min-h-screen, surface-ground, p-4)

#### ✅ GAME-002: MestreDashboardComponent
**Arquivo**: `src/app/features/dashboard/mestre-dashboard/mestre-dashboard.component.ts`
- ✅ Standalone: true
- ✅ Imports: CardModule, ButtonModule, RouterModule
- ✅ Inject: JogosStore, FichasStore, AuthService
- ✅ Effect: loadJogos(), loadFichas() (sem allowSignalWrites - deprecated)
- ✅ Computed: totalJogos, totalJogadores (unique), totalFichas
- ✅ Computed: jogosRecentes (5 most recent, sorted by dataCriacao desc)
- ✅ Template: Stats cards (3 cards com ícones e números)
- ✅ Template: Quick actions (4 cards: Novo Jogo, Meus Jogos, Config, Relatórios)
- ✅ Template: Recent games list com navegação
- ✅ Navigation: criarJogo(), verJogos(), verConfig(), verJogo(id)

#### ✅ GAME-003: JogadorDashboardComponent
**Arquivo**: `src/app/features/dashboard/jogador-dashboard/jogador-dashboard.component.ts`
- ✅ Standalone: true
- ✅ Imports: CardModule, ButtonModule
- ✅ Inject: FichasStore, JogosStore, AuthService
- ✅ Effect: loadFichas(), loadJogos()
- ✅ Computed: totalFichas, jogosAtivos, solicitacoesPendentes
- ✅ Computed: fichasRecentes (5 most recent)
- ✅ Template: Stats cards (3 cards)
- ✅ Template: Quick actions (3 cards: Nova Ficha, Minhas Fichas, Buscar Jogos)
- ✅ Template: Recent characters list
- ✅ Navigation: criarFicha(), verFichas(), buscarJogos(), verFicha(id)
- ✅ **FIX**: Corrigido userId → jogadorId, statusParticipacao → status
- ✅ **FIX**: Corrigido nomePersonagem → nome, nivel.nivelAtual → progressao.nivel

---

### Section 2: Game List (Day 2)

#### ✅ GAME-004: JogosListComponent
**Arquivo**: `src/app/features/mestre/pages/jogos-list/jogos-list.component.ts`
- ✅ Standalone: true
- ✅ Imports: TableModule, CardModule, ButtonModule, InputTextModule, SelectModule, TagModule, TooltipModule, ConfirmDialogModule
- ✅ Inject: JogosStore, Router, ConfirmationService, MessageService
- ✅ Providers: ConfirmationService, MessageService
- ✅ Signal: searchTerm, statusFilter
- ✅ Computed: jogosFiltrados (filter by search + status)
- ✅ Template: Header com título + "Novo Jogo" button
- ✅ Template: Filters (search input, status dropdown, clear button)
- ✅ Template: Loading state (@if loading)
- ✅ Template: Error state (@if error)
- ✅ Template: Empty state (no games)
- ✅ Template: Empty search results
- ✅ Template: p-table com columns (Nome, Participantes, Status, Data, Ações)
- ✅ Template: Row actions (Ver, Editar, Excluir)
- ✅ Template: p-confirmDialog para confirmação de exclusão
- ✅ Method: criarJogo(), verJogo(id), editarJogo(id), limparFiltros()
- ✅ Method: confirmarExclusao(jogo), excluirJogo(id) - com try/catch e mensagens
- ✅ Helper: getStatusLabel(status), getStatusSeverity(status)
- ✅ **FIX**: Removido RASCUNHO (não existe em JogoStatus)
- ✅ **FIX**: isLoading → loading
- ✅ **FIX**: DropdownModule → SelectModule (PrimeNG 21)
- ✅ **FIX**: Adicionado CommonModule para pipes (date, slice)
- ✅ **FIX**: severity com binding [severity]="'secondary'" e [severity]="'danger'"

---

## 🚧 EM ANDAMENTO

### Section 3: Game Form (Day 2-3)

#### ⏳ GAME-005: JogoFormComponent (Create/Edit)
**Arquivo**: `src/app/features/mestre/pages/jogo-form/jogo-form.component.ts`
**Status**: ❌ NÃO INICIADO

**Requisitos**:
- [ ] Standalone: true
- [ ] Imports: ReactiveFormsModule, CardModule, ButtonModule, InputTextModule, InputTextareaModule, SelectModule
- [ ] Inject: JogosStore, Router, ActivatedRoute, FormBuilder, MessageService
- [ ] Signal: isEditMode, jogoId
- [ ] FormGroup: jogoForm (nome, descricao, status, maxParticipantes)
- [ ] Validators: nome (required, minLength: 3), maxParticipantes (min: 1, max: 20)
- [ ] Effect: loadJogo(id) se edit mode
- [ ] Method: onSubmit() - createJogo() ou updateJogo()
- [ ] Method: cancel() - navigate back
- [ ] Template: Form com validação e mensagens de erro
- [ ] Template: Save/Cancel buttons
- [ ] Integration: FormFieldErrorComponent para erros

---

### Section 4: Game Detail (Day 3-4)

#### ⏳ GAME-006: JogoDetailComponent
**Arquivo**: `src/app/features/mestre/pages/jogo-detail/jogo-detail.component.ts`
**Status**: ❌ NÃO INICIADO

**Requisitos**:
- [ ] Standalone: true
- [ ] Imports: TabViewModule, CardModule, ButtonModule, TableModule, TagModule, DialogModule
- [ ] Inject: JogosStore, Router, ActivatedRoute
- [ ] Signal: jogoId, activeTabIndex
- [ ] Computed: jogo (from store), participantes, fichas
- [ ] Effect: loadJogo(id), loadParticipantes(id)
- [ ] Template: Header com nome do jogo + Edit/Delete buttons
- [ ] Template: p-tabView com 3 tabs
- [ ] Tab 1 - Info: Detalhes básicos (nome, descrição, status, participantes)
- [ ] Tab 2 - Participantes: Tabela com status (APROVADO/PENDENTE/REJEITADO)
- [ ] Tab 3 - Fichas: Grid de fichas dos participantes
- [ ] Method: editJogo(), deleteJogo(), changeTab(index)

#### ⏳ GAME-007: ParticipantManagerComponent
**Arquivo**: `src/app/features/mestre/components/participant-manager/participant-manager.component.ts`
**Status**: ❌ NÃO INICIADO

**Requisitos**:
- [ ] DUMB Component
- [ ] Input: participantes[]
- [ ] Output: onApprove(participanteId), onReject(participanteId), onRemove(participanteId)
- [ ] Template: Lista de participantes com ações
- [ ] Template: Badge de status colorido
- [ ] Template: Botões Aprovar/Rejeitar para PENDENTE
- [ ] Template: Botão Remover para APROVADO/REJEITADO

---

### Section 5: Join Game Flow (Day 4-5)

#### ⏳ GAME-008: JogosDisponiveisComponent (Jogador)
**Arquivo**: `src/app/features/jogador/pages/jogos-disponiveis/jogos-disponiveis.component.ts`
**Status**: ❌ NÃO INICIADO

**Requisitos**:
- [ ] Standalone: true
- [ ] Imports: CardModule, ButtonModule, InputTextModule, DataViewModule, TagModule
- [ ] Inject: JogosStore, FichasStore, Router
- [ ] Signal: searchTerm, selectedJogo, showJoinDialog
- [ ] Computed: jogosDisponiveis (status=ATIVO, not full, not already joined)
- [ ] Template: Search bar
- [ ] Template: p-dataView grid de jogos
- [ ] Template: Card por jogo (nome, descrição, participantes count, Solicitar button)
- [ ] Method: solicitarParticipacao(jogoId)
- [ ] Integration: JoinGameDialogComponent

#### ⏳ GAME-009: JoinGameDialogComponent
**Arquivo**: `src/app/features/jogador/components/join-game-dialog/join-game-dialog.component.ts`
**Status**: ❌ NÃO INICIADO

**Requisitos**:
- [ ] DUMB Component
- [ ] Input: visible, jogo, fichasDisponiveis[]
- [ ] Output: onConfirm(fichaId), onCancel()
- [ ] Template: p-dialog
- [ ] Template: Dropdown de fichas do jogador
- [ ] Template: Mensagem "Selecione uma ficha para participar"
- [ ] Template: Confirm/Cancel buttons
- [ ] Validation: fichaId required

---

## 📋 RESUMO DO PROGRESSO

### 🎯 MUDANÇA DE FOCO: JOGO → FICHAS
**Antes**: Dashboard com stats gerais de jogos  
**Agora**: **Header com seletor de jogo** → Dashboard focado em **FICHAS do jogo atual**

### Nova Arquitetura UX: 5/5 (100%) ✅
✅ CurrentGameService  
✅ HeaderComponent (seletor de jogo)  
✅ MainLayoutComponent  
✅ JogadorDashboard (refatorado para fichas)  
✅ FichaListComponent (NOVO - lista de fichas)  

### Componentes Originais: 4/9 (44%)
✅ DashboardComponent  
✅ MestreDashboardComponent (precisa refatorar para fichas)  
✅ JogadorDashboardComponent (**REFATORADO** ✅)  
✅ JogosListComponent  
✅ JogoFormComponent (existe mas será movido para Configurações)  
✅ JogoDetailComponent (existe mas será movido para Configurações)  
⏳ ParticipantManagerComponent (mover para Configurações)  
⏳ JogosDisponiveisComponent (baixa prioridade)  
⏳ JoinGameDialogComponent (baixa prioridade)  

### Por Seção (NOVA PRIORIDADE):
- ✅ **Nova Arquitetura UX**: 100% (5/5 componentes)
- ✅ **Section 1 - Dashboard**: 100% (3/3 componentes)
- ✅ **Section 2 - Game List**: 100% (1/1 componente)
- ✅ **Section 3 - Game Form**: 100% (1/1 componente - existe)
- ✅ **Section 4 - Game Detail**: 100% (1/2 componentes - existe)
- ⏳ **Section 5 - Join Game**: 0% (0/2 componentes - baixa prioridade)
- 🎯 **NOVA PRIORIDADE - Fichas**: 20% (1/5 componentes)
  - ✅ FichaListComponent
  - ⏳ FichaFormComponent (PRÓXIMO)
  - ⏳ FichaDetailComponent
  - ⏳ FichaSelectorComponent (para jogo)
  - ⏳ MestreDashboard (refatorar para fichas)

### Features Completas:
- ✅ **Nova Arquitetura UX com Seletor de Jogo no Header**
- ✅ **CurrentGameService** - Gerencia jogo atual persistido
- ✅ Dashboard focado em **FICHAS do jogo atual**
- ✅ Lista de jogos com filtros, busca e CRUD actions
- ✅ **Lista de Fichas** do jogo atual com busca e CRUD
- ✅ Formulário de criação/edição de jogos (será movido para Config)
- ✅ Visualização detalhada de jogos (será movido para Config)
- ⏳ **FichaFormComponent** - Criar/editar fichas (PRÓXIMO)
- ⏳ **FichaDetailComponent** - Ver ficha completa
- ⏳ Gerenciamento de participantes (mover para Configurações)
- ⏳ Fluxo de solicitação de participação (baixa prioridade)

---

## 🎯 PRÓXIMOS PASSOS (NOVA PRIORIDADE)

### 🔥 IMEDIATO - Componentes de Fichas (PRIORIDADE MÁXIMA):
1. **FichaFormComponent** - Formulário completo de criação/edição de fichas
   - Todas as seções: Identificação, Progressão, Atributos, Vida, etc.
   - Validações
   - Cálculos client-side temporários
   - Integração com CurrentGameService
   
2. **FichaDetailComponent** - Visualização completa da ficha
   - Tabs por seção
   - Read-only mode
   - Botões: Editar, Voltar

3. **MestreDashboard** - Refatorar para focar em fichas
   - Fichas do jogo (jogadores + NPCs)
   - Stats relevantes
   - Quick actions

### 📦 Depois - Mover para Configurações:
4. Mover **Gerenciamento de Jogos** para área de Configurações (Mestre)
5. Mover **Gerenciamento de Participantes** para Configurações
6. Criar seção **Configurações** escondida

### 🔜 Futuro - Baixa Prioridade:
7. **JogosDisponiveisComponent** - Buscar jogos para participar
8. **JoinGameDialogComponent** - Dialog de solicitação

5. **JoinGameDialogComponent** - Dialog para selecionar ficha e solicitar participação

---

## ✅ PADRÕES SEGUIDOS

### ✅ Architecture
- ✅ DUMB Components: apenas input/output
- ✅ SMART Components: usam stores e services
- ✅ SignalStore para estado global
- ✅ Computed para valores derivados
- ✅ Effect para side effects (sem allowSignalWrites)

### ✅ PrimeNG 21 APIs
- ✅ SelectModule ao invés de DropdownModule
- ✅ p-select ao invés de p-dropdown
- ✅ [severity] com binding
- ✅ TooltipModule importado
- ✅ CommonModule para pipes (date, slice)
- ✅ @if/@else if/@else (control flow syntax)
- ✅ @for com track
- ✅ Standalone components

### ✅ Signals Pattern
- ✅ signal() para estado mutável
- ✅ computed() para valores derivados
- ✅ effect() para side effects
- ✅ inject() para DI (NUNCA constructor)

### ✅ PrimeFlex Only
- ✅ ZERO CSS customizado
- ✅ Classes: flex, grid, gap-X, p-X, m-X
- ✅ Responsive: md:, lg:
- ✅ Colors: surface-ground, text-primary
- ✅ Typography: text-xl, font-bold

---

## 🐛 FIXES REALIZADOS

### Dashboard Components
1. ✅ Removido `allowSignalWrites` (deprecated no Angular 21)
2. ✅ Corrigido `userId` → `jogadorId` em Participante
3. ✅ Corrigido `statusParticipacao` → `status` em Participante
4. ✅ Corrigido `nomePersonagem` → `nome` em Ficha
5. ✅ Corrigido `nivel.nivelAtual` → `progressao.nivel` em Ficha

### JogosListComponent
6. ✅ Removido `RASCUNHO` (não existe em JogoStatus)
7. ✅ Corrigido `isLoading()` → `loading()`
8. ✅ Substituído `DropdownModule` → `SelectModule`
9. ✅ Substituído `p-dropdown` → `p-select`
10. ✅ Adicionado `TooltipModule` para pTooltip
11. ✅ Adicionado `CommonModule` para pipes
12. ✅ Corrigido severity com binding: `[severity]="'secondary'"`

---

**Última Atualização**: 2026-02-01 (Day 2 - 20% completo)
