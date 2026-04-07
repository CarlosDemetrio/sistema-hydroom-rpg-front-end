# TECH LEAD FRONTEND REVIEW -- Analise de Impacto das Decisoes do PO

> **Data:** 2026-04-02
> **Base branch:** `feature/009-npc-fichas-mestre`
> **Frontend:** Angular 21, PrimeNG 21.1.1, @ngrx/signals 21, Vitest
> **Documento fonte:** `docs/gaps/BA-GAPS-2026-04-02.md`

---

## SUMARIO EXECUTIVO

As decisoes do PO impactam **7 areas principais** do frontend. O item de maior impacto e
a substituicao do `FichaFormComponent` atual (scroll unico enviando apenas `{nome}`) por
um wizard de 5-6 passos com auto-save e distribuicao de atributos. O segundo maior impacto
e a integracao do `VantagemEfeito` na tela de configuracao de Vantagens, que o PO priorizou
como pre-requisito para qualquer trabalho no modulo Ficha.

**Estimativa geral:** ~35-40 componentes novos/modificados, ~15 novos metodos de API,
3 stores com mudancas significativas.

---

## INDICE

1. [GAP-01: Wizard de Criacao de Ficha](#gap-01-wizard-de-criacao-de-ficha)
2. [GAP-02: XP Read-Only para Jogador](#gap-02-xp-read-only-para-jogador)
3. [GAP-03: VantagemEfeito -- PRIORIDADE](#gap-03-vantageméfeito--prioridade)
4. [GAP-05: NPC -- Toggle de Visibilidade](#gap-05-npc--toggle-de-visibilidade)
5. [GAP-06: Nivel -- Pontos Disponiveis](#gap-06-nivel--pontos-disponiveis)
6. [GAP-07/08: Essencia e Prospeccao](#gap-0708-essencia-e-prospeccao)
7. [GAP-09: Insolitus](#gap-09-insolitus)
8. [GAP-10: Roles -- ADMIN](#gap-10-roles--admin)
9. [Mudancas Transversais](#mudancas-transversais)
10. [Ordem de Implementacao Sugerida](#ordem-de-implementacao-sugerida)
11. [Riscos e Padroes](#riscos-e-padroes)

---

## GAP-01: WIZARD DE CRIACAO DE FICHA

### Decisao do PO
- Wizard de 5-6 passos com auto-save a cada passo
- Backend salva rascunho incompleto; ficha so entra em sessao quando completa
- Todos os campos obrigatorios para ficha completa: nome, racaId, classeId, generoId, indoleId, presencaId
- Passo de atributos: distribuicao de pontos com pontos disponiveis calculados
- Insolitus/Titulo Heroico/Arquetipo: Mestre concede depois (NAO entram no wizard)

### Estado Atual

O `FichaFormComponent` em `features/jogador/pages/ficha-form/` e um scroll unico com 10 sections,
mas o submit envia apenas `{ nome }`. Os campos racaId, classeId, generoId, indoleId e presencaId
existem no `CreateFichaDto` mas NAO sao populados pelo formulario. As sections existentes
(identificacao, progressao, descricao-fisica, atributos, vida, observacoes, pericias,
equipamentos, vantagens, titulos-runas) nao correspondem ao wizard necessario.

### Componentes a CRIAR

| Componente | Path Sugerido | Responsabilidade | Complexidade |
|---|---|---|---|
| `FichaWizardComponent` (Smart) | `features/jogador/pages/ficha-wizard/ficha-wizard.component.ts` | Orquestra os passos, gerencia estado do wizard, auto-save, navegacao entre passos | **P1** |
| `WizardStepIndicatorComponent` (Dumb) | `shared/components/wizard-step-indicator/` | Barra visual de progresso dos passos (step 1/5, completo/atual/futuro) | P2 |
| `WizardStep1IdentidadeComponent` (Dumb) | `features/jogador/pages/ficha-wizard/steps/step-1-identidade.component.ts` | Nome, Raca (p-select), Classe (p-select), Genero (p-select) | **P1** |
| `WizardStep2IndolePresencaComponent` (Dumb) | `features/jogador/pages/ficha-wizard/steps/step-2-indole-presenca.component.ts` | Indole (p-select), Presenca (p-select), Descricao (textarea, opcional) | **P1** |
| `WizardStep3AtributosComponent` (Dumb) | `features/jogador/pages/ficha-wizard/steps/step-3-atributos.component.ts` | Distribuicao de pontos de atributo. Recebe config de atributos + pontos disponiveis via input. Emite alteracoes via output. | **P1** |
| `WizardStep4AptidoesComponent` (Dumb) | `features/jogador/pages/ficha-wizard/steps/step-4-aptidoes.component.ts` | Distribuicao de pontos de aptidao. Similar ao step 3. | P2 |
| `WizardStep5RevisaoComponent` (Dumb) | `features/jogador/pages/ficha-wizard/steps/step-5-revisao.component.ts` | Exibe resumo de todas as escolhas para confirmacao final | P2 |
| `PontosDistribuicaoComponent` (Dumb) | `shared/components/pontos-distribuicao/` | Widget reutilizavel: lista de itens com +/- e saldo de pontos restantes. Usado nos steps 3 e 4 | **P1** |

### Componentes a MODIFICAR

| Componente | O que Muda | Complexidade |
|---|---|---|
| `FichaFormComponent` | **DESCARTADO** ou refatorado para modo edicao apenas. O wizard substitui a criacao. Manter apenas para edicao simples de campos (nome, descricao) pos-criacao. | **P1** |
| `FichasListComponent` | Botao "Nova Ficha" redireciona para `/jogador/fichas/wizard` em vez de `/jogador/fichas/nova` | P3 |

### Novos Metodos de API

| Metodo | FichasApiService | Descricao |
|---|---|---|
| `salvarRascunho(jogoId, dto)` | `PUT /api/v1/jogos/{jogoId}/fichas/{id}/rascunho` | Salva versao incompleta da ficha (auto-save). **REQUER endpoint no backend** |
| `completarFicha(fichaId)` | `POST /api/v1/fichas/{id}/completar` | Marca ficha como completa. **REQUER endpoint no backend** |

### Mudancas no FichasStore

- Adicionar `wizardDraft: Partial<CreateFichaDto> | null` ao state para manter rascunho local
- Adicionar `setWizardDraft()`, `clearWizardDraft()`, `updateWizardStep()` methods
- Adicionar `wizardCurrentStep: number` para restaurar posicao apos reload

### Mudancas no FichaBusinessService

- `saveDraft(jogoId, fichaId, stepData)` -- auto-save debounced (500ms)
- `completeFicha(fichaId)` -- finaliza wizard
- `loadDraft(fichaId)` -- carrega rascunho em andamento

### Mudancas em Rotas

```
{ path: 'fichas/wizard', loadComponent: ... FichaWizardComponent }
{ path: 'fichas/wizard/:id', loadComponent: ... FichaWizardComponent }  // retomar rascunho
```

### Dependencias

- **Backend**: endpoint de rascunho/auto-save, campo `status` na Ficha (RASCUNHO | COMPLETA)
- **ConfigStore**: precisa estar carregado com racas, classes, generos, indoles, presencas, atributos, aptidoes do jogo
- **NivelConfig**: precisa de `pontosAtributo` e `pontosAptidao` do nivel 1 para o wizard

---

## GAP-02: XP READ-ONLY PARA JOGADOR

### Decisao do PO
- XP e read-only para JOGADOR
- Apenas MESTRE pode conceder XP
- Concessao em lote e desejavel mas nao e requisito MVP
- Historico de XP e futuro

### Componentes a CRIAR

| Componente | Path Sugerido | Responsabilidade | Complexidade |
|---|---|---|---|
| `ConcederXpDialogComponent` (Dumb) | `features/mestre/components/conceder-xp-dialog/` | Dialog para Mestre conceder XP a uma ficha: input de quantidade + confirmacao | P2 |
| `ConcederXpLoteDialogComponent` (Dumb) | `features/mestre/components/conceder-xp-lote-dialog/` | Dialog para Mestre conceder XP a todas as fichas do jogo de uma vez | P3 |

### Componentes a MODIFICAR

| Componente | O que Muda | Complexidade |
|---|---|---|
| `FichaHeaderComponent` | Exibir XP como read-only para JOGADOR. Para MESTRE, adicionar botao "Conceder XP" que abre dialog | P2 |
| `FichaDetailComponent` | Injetar role awareness: se MESTRE, mostrar botao de concessao XP no header. Remover qualquer possibilidade de edicao de XP pelo jogador | P2 |
| `FichaFormComponent` (edicao) | Remover campo XP do formulario de edicao do jogador. Mestre ve campo editavel | P3 |

### Novos Metodos de API

| Metodo | Service | Descricao |
|---|---|---|
| `concederXp(fichaId, { quantidade })` | FichasApiService | `POST /api/v1/fichas/{id}/xp` -- **REQUER endpoint no backend** |
| `concederXpLote(jogoId, { quantidade })` | FichasApiService | `POST /api/v1/jogos/{jogoId}/fichas/xp` -- **REQUER endpoint no backend** |

### Dependencias
- **Backend**: endpoints de concessao de XP (individual e lote)
- **Auth**: `isMestre()` computed do AuthService ja existe

---

## GAP-03: VANTAGEMÉFEITO -- PRIORIDADE

### Decisao do PO
- **TODAS as configuracoes precisam estar 100% antes do modulo Ficha**
- UI de gerenciamento de efeitos na tela de VantagensConfig
- FormulaEditor integrado para FORMULA_CUSTOMIZADA
- Seletor de dado para DADO_UP (d6/d8/d10/d12/d20)

### Estado Atual

- `VantagemEfeito` model e DTOs existem em `core/models/vantagem-efeito.model.ts`
- Endpoints CRUD existem em `ConfigApiService` (list, criar, deletar)
- `VantagensConfigComponent` tem 2 abas (Dados Gerais + Pre-requisitos) mas **ZERO UI para Efeitos**
- `FormulaEditorComponent` existe em `shared/components/formula-editor/`
- `VantagemConfig.efeitos: VantagemEfeito[]` ja esta no modelo

### Componentes a CRIAR

| Componente | Path Sugerido | Responsabilidade | Complexidade |
|---|---|---|---|
| `VantagemEfeitosTabComponent` (Dumb) | `features/mestre/pages/config/configs/vantagens-config/components/vantagem-efeitos-tab.component.ts` | Nova aba "Efeitos" no drawer de VantagensConfig. Lista efeitos existentes, permite adicionar/remover. | **P1** |
| `EfeitoFormComponent` (Dumb) | `features/mestre/pages/config/configs/vantagens-config/components/efeito-form.component.ts` | Formulario de criacao de um efeito: select TipoEfeito, campos condicionais por tipo (alvo, valor, formula). Integra FormulaEditor para FORMULA_CUSTOMIZADA e seletor de dado para DADO_UP | **P1** |
| `DadoSelectorComponent` (Dumb) | `shared/components/dado-selector/` | Widget reutilizavel para selecionar tipo de dado (d6/d8/d10/d12/d20). Usa p-selectbutton ou p-dropdown com icones de dados | P2 |

### Componentes a MODIFICAR

| Componente | O que Muda | Complexidade |
|---|---|---|
| `VantagensConfigComponent` | Adicionar 3a aba "Efeitos" (alem de "Dados Gerais" e "Pre-requisitos"). A aba so habilita em modo edicao (igual Pre-requisitos). Badge com contagem de efeitos. | **P1** |

### Detalhamento: Campos condicionais do EfeitoFormComponent por TipoEfeito

```
BONUS_ATRIBUTO       -> select AtributoConfig (alvo) + valorFixo + valorPorNivel
BONUS_APTIDAO        -> select AptidaoConfig (alvo) + valorFixo + valorPorNivel
BONUS_DERIVADO       -> select BonusConfig (alvo) + valorFixo + valorPorNivel
BONUS_VIDA           -> valorFixo + valorPorNivel (sem alvo)
BONUS_VIDA_MEMBRO    -> select MembroCorpoConfig (alvo) + valorFixo + valorPorNivel
BONUS_ESSENCIA       -> valorFixo + valorPorNivel (sem alvo)
DADO_UP              -> DadoSelectorComponent (sem valor numerico)
FORMULA_CUSTOMIZADA  -> FormulaEditorComponent (formula obrigatoria)
```

### Novos Metodos de API

Ja existem no `ConfigApiService`:
- `listVantagemEfeitos(jogoId, vantagemId)` -- OK
- `criarVantagemEfeito(jogoId, vantagemId, dto)` -- OK
- `deletarVantagemEfeito(jogoId, vantagemId, efeitoId)` -- OK

**Nenhum novo endpoint necessario.** Porem o `EfeitoFormComponent` precisa carregar listas de alvos possiveis:
- Atributos, Aptidoes, Bonus, MembrosCorpo do jogo -- ja disponivel via `ConfigStore`

### Dependencias
- **ConfigStore** carregado com atributos, aptidoes, bonus, membrosCorpo do jogo
- **FormulaEditorComponent** ja existe e funcional
- Backend ja implementado -- este e puramente trabalho de frontend

---

## GAP-05: NPC -- TOGGLE DE VISIBILIDADE

### Decisao do PO
- NPC e mecanicamente identico a ficha de jogador (mesmo motor)
- Mestre pode revelar stats de NPC para jogadores especificos
- Campo `descricao` existe em todas as fichas (opcional para jogadores)

### Componentes a CRIAR

| Componente | Path Sugerido | Responsabilidade | Complexidade |
|---|---|---|---|
| `NpcVisibilidadeDialogComponent` (Dumb) | `features/mestre/pages/npcs/components/npc-visibilidade-dialog.component.ts` | Dialog com multiselect de jogadores do jogo para definir visibilidade do NPC | P2 |

### Componentes a MODIFICAR

| Componente | O que Muda | Complexidade |
|---|---|---|
| `NpcsComponent` | Adicionar coluna "Visibilidade" na tabela. Botao para abrir dialog de toggle. Adicionar campo `descricao` no drawer de criacao | P2 |
| `FichaHeaderComponent` | Exibir campo `descricao` se presente. Adicionar badge "NPC" com indicador de visibilidade | P3 |
| `FichaDetailComponent` | Carregar e exibir `descricao` da ficha. Para NPCs do Mestre, exibir controle de visibilidade | P2 |
| `FichaFormComponent` / `FichaWizardComponent` | Adicionar campo `descricao` (textarea, opcional) | P3 |

### Mudancas nos Models

```typescript
// ficha.model.ts -- adicionar
interface Ficha {
  // ... existentes
  descricao: string | null;           // NOVO
  npcVisivelPara: number[] | null;    // NOVO -- IDs dos jogadores que podem ver
}

// ficha.dto.ts -- adicionar
interface CreateFichaDto {
  // ... existentes
  descricao?: string;                 // NOVO
}
interface UpdateFichaDto {
  // ... existentes
  descricao?: string;                 // NOVO
}
interface NpcCreateDto {
  // ... existentes
  descricao?: string;                 // NOVO
}
```

### Novos Metodos de API

| Metodo | Service | Descricao |
|---|---|---|
| `atualizarVisibilidadeNpc(fichaId, jogadorIds[])` | FichasApiService | `PUT /api/v1/fichas/{id}/visibilidade` -- **REQUER endpoint no backend** |
| `getParticipantesJogo(jogoId)` | JogosApiService | Ja pode existir parcialmente; necessario para popular multiselect de jogadores |

### Dependencias
- **Backend**: campo `descricao` na Ficha, campo `npcVisivelPara`, endpoint de visibilidade
- **ParticipanteBusinessService**: lista de jogadores do jogo para o multiselect

---

## GAP-06: NIVEL -- PONTOS DISPONIVEIS

### Decisao do PO
- Exibir `pontosAtributoDisponiveis`, `pontosAptidaoDisponiveis`, `pontosVantagemDisponiveis`
- Pontos acumulam ao longo dos niveis (saldo = ganhos - gastos), irreversivel
- Level up automatico ao acumular XP -- libera pontos para distribuir

### Componentes a CRIAR

| Componente | Path Sugerido | Responsabilidade | Complexidade |
|---|---|---|---|
| `PontosDisponiveisCardComponent` (Dumb) | `features/jogador/pages/ficha-detail/components/pontos-disponiveis-card/` | Card compacto exibindo 3 contadores: pontos de atributo, aptidao e vantagem disponiveis | P2 |

### Componentes a MODIFICAR

| Componente | O que Muda | Complexidade |
|---|---|---|
| `FichaResumoTabComponent` | Adicionar secao "Pontos Disponiveis" com os 3 contadores. Exibir aviso visual quando ha pontos nao distribuidos | P2 |
| `FichaHeaderComponent` | Badge "Pontos!" quando ha pontos nao distribuidos (incentiva o jogador a distribuir) | P3 |
| `FichaAtributosTabComponent` | Mostrar botao "Distribuir Pontos" quando `pontosAtributoDisponiveis > 0`. Integrar com `PontosDistribuicaoComponent` | P2 |
| `FichaAptidoesTabComponent` | Similar ao atributos: botao "Distribuir Pontos" quando `pontosAptidaoDisponiveis > 0` | P2 |
| `FichaVantagensTabComponent` | Exibir `pontosVantagemDisponiveis` e habilitar compra de vantagem apenas se pontos > 0 | P2 |

### Mudancas nos Models

```typescript
// ficha.model.ts -- FichaResumo
interface FichaResumo {
  // ... existentes
  pontosAtributoDisponiveis: number;   // NOVO
  pontosAptidaoDisponiveis: number;    // NOVO
  pontosVantagemDisponiveis: number;   // NOVO
  essenciaAtual: number;               // NOVO (ver GAP-07)
  vidaAtual: number;                   // NOVO (ver GAP-07)
}
```

### Dependencias
- **Backend**: `FichaResumoResponse` precisa incluir os 3 campos de pontos disponiveis
- Nenhum novo endpoint -- apenas enriquecimento do resumo existente

---

## GAP-07/08: ESSENCIA E PROSPECCAO

### Decisao do PO
- Barra de essencia reativa (nao hardcoded 100%)
- Mestre pode resetar todos os estados (vida, essencia, etc.)
- Jogador pode usar prospeccao; Mestre marca como usada e pode reverter

### Componentes a CRIAR

| Componente | Path Sugerido | Responsabilidade | Complexidade |
|---|---|---|---|
| `EssenciaBarComponent` (Dumb) | `features/jogador/pages/ficha-detail/components/essencia-bar/` | Barra de progresso reativa: essenciaAtual / essenciaTotal. Cores por faixa (verde > amarelo > vermelho) | P2 |
| `VidaBarComponent` (Dumb) | `features/jogador/pages/ficha-detail/components/vida-bar/` | Barra de progresso reativa: vidaAtual / vidaTotal. Cores por faixa | P2 |
| `UsarProspeccaoDialogComponent` (Dumb) | `features/jogador/pages/ficha-detail/components/usar-prospeccao-dialog/` | Dialog para jogador usar prospeccao: confirma acao irreversivel (para jogador) | P2 |
| `ResetEstadoDialogComponent` (Dumb) | `features/mestre/components/reset-estado-dialog/` | Dialog para Mestre resetar vida/essencia/prospeccao de uma ficha | P2 |

### Componentes a MODIFICAR

| Componente | O que Muda | Complexidade |
|---|---|---|
| `FichaHeaderComponent` | Substituir barras hardcoded (value=100) por `EssenciaBarComponent` e `VidaBarComponent` reativos. Adicionar botao "Usar Prospeccao" para JOGADOR | **P1** |
| `FichaResumoTabComponent` | Exibir essenciaAtual/essenciaTotal em vez de apenas essenciaTotal | P3 |
| `FichaDetailComponent` | Orquestrar acoes de prospeccao e reset. Carregar dados de vida/essencia atuais | P2 |

### Novos Metodos de API

| Metodo | Service | Descricao |
|---|---|---|
| `usarProspeccao(fichaId)` | FichasApiService | `POST /api/v1/fichas/{id}/prospeccao/usar` -- **REQUER endpoint** |
| `resetarEstado(fichaId)` | FichasApiService | `POST /api/v1/fichas/{id}/reset` -- **REQUER endpoint** |

### Mudancas no FichasStore

- Adicionar campos `vidaAtual`, `essenciaAtual`, `prospeccaoDisponivel` ao state (ou usar FichaResumo enriquecido)

### Dependencias
- **Backend**: `FichaResumo` precisa de `essenciaAtual`, `vidaAtual`; endpoints de prospeccao e reset
- **GAP-06**: compartilha mudanca no `FichaResumo` model

---

## GAP-09: INSOLITUS

### Decisao do PO
- Insolitus e na mesma categoria das vantagens (pode conceder raca, classe, vantagem, bonus, aptidao, etc.)
- Apenas Mestre concede
- Nao e obrigatorio para criar ficha

### Componentes a CRIAR

| Componente | Path Sugerido | Responsabilidade | Complexidade |
|---|---|---|---|
| `ConcederInsolitusDialogComponent` (Dumb) | `features/mestre/components/conceder-insolitus-dialog/` | Dialog para Mestre conceder Insolitus a uma ficha. Permite descrever o efeito (tipo vantagem livre) | P2 |

### Componentes a MODIFICAR

| Componente | O que Muda | Complexidade |
|---|---|---|
| `FichaDetailComponent` | Se MESTRE: botao "Conceder Insolitus" no header ou na aba de vantagens | P3 |
| `FichaHeaderComponent` | Exibir indicador de Insolitus se presente | P3 |

### Dependencias
- **Backend**: modelo de Insolitus (provavelmente sub-recurso da ficha), endpoint de concessao
- **GAP-03**: depende da estrutura de VantagemEfeito estar completa (Insolitus pode ter efeitos similares)

---

## GAP-10: ROLES -- ADMIN

### Decisao do PO
- 3 perfis: ADMIN, MESTRE, JOGADOR
- ADMIN tem acesso a tudo
- MESTRE acessa jogos que criou
- JOGADOR acessa jogos que participa

### Estado Atual

- `AuthService.UserInfo.role` e `'MESTRE' | 'JOGADOR'` (string unica, nao array)
- `User.roles` em `user.model.ts` e `('MESTRE' | 'JOGADOR')[]` (array, mas sem ADMIN)
- `roleGuard` checa `user.role` (singular) contra `route.data['roles']`
- Rotas: `/mestre` requer `['MESTRE']`, `/jogador` requer `['JOGADOR']`

### Componentes a MODIFICAR

| Componente/Service | O que Muda | Complexidade |
|---|---|---|
| `AuthService` | `UserInfo.role` precisa suportar `'ADMIN' \| 'MESTRE' \| 'JOGADOR'`. Adicionar `isAdmin = computed(...)` | **P1** |
| `User model` | `roles` array deve incluir `'ADMIN'` | P3 |
| `roleGuard` | ADMIN deve passar em qualquer checagem de role. Refatorar para: se `user.role === 'ADMIN'` -> sempre retorna true | **P1** |
| `app.routes.ts` | ADMIN pode acessar tanto `/mestre` quanto `/jogador`. Adicionar rota `/admin` para painel administrativo futuro | P2 |
| `SidebarComponent` | Exibir menus de ambos MESTRE e JOGADOR para ADMIN | P2 |
| `DashboardComponent` | Dashboard especifico para ADMIN (ou combinado MESTRE+JOGADOR) | P3 |

### Mudancas nos Guards

```typescript
// role.guard.ts -- logica proposta
if (user.role === 'ADMIN') return true; // ADMIN bypassa qualquer checagem de role

// Manter checagem existente para MESTRE e JOGADOR
if (requiredRoles?.includes(user.role)) return true;
```

### Dependencias
- **Backend**: role ADMIN no sistema de autenticacao/OAuth2
- **Impacto transversal**: toda checagem de `isMestre()` no frontend precisa considerar que ADMIN tambem pode fazer tudo que MESTRE faz

---

## MUDANCAS TRANSVERSAIS

### 1. Models que precisam de atualizacao

| Model | Arquivo | Mudancas |
|---|---|---|
| `Ficha` | `core/models/ficha.model.ts` | + `descricao`, `status` (RASCUNHO/COMPLETA), `npcVisivelPara` |
| `FichaResumo` | `core/models/ficha.model.ts` | + `pontosAtributoDisponiveis`, `pontosAptidaoDisponiveis`, `pontosVantagemDisponiveis`, `essenciaAtual`, `vidaAtual`, `prospeccaoDisponivel` |
| `CreateFichaDto` | `core/models/dtos/ficha.dto.ts` | + `descricao` |
| `UpdateFichaDto` | `core/models/dtos/ficha.dto.ts` | + `descricao`, remover `xp` para JOGADOR |
| `NpcCreateDto` | `core/models/dtos/ficha.dto.ts` | + `descricao` |
| `UserInfo` | `services/auth.service.ts` | `role` aceita `'ADMIN'` |
| `User` | `core/models/user.model.ts` | `roles` array aceita `'ADMIN'` |

### 2. FichasStore -- mudancas consolidadas

```typescript
interface FichasState {
  fichas: Ficha[];
  npcs: Ficha[];                              // NOVO -- lista separada de NPCs
  currentFicha: Ficha | null;
  currentResumo: FichaResumo | null;          // NOVO -- resumo da ficha atual
  wizardDraft: Partial<CreateFichaDto> | null; // NOVO -- rascunho do wizard
  wizardCurrentStep: number;                   // NOVO
  loading: boolean;
  error: string | null;
}
```

Novos metodos:
- `setNpcs(npcs)`, `addNpc(npc)`, `removeNpc(id)`
- `setCurrentResumo(resumo)`
- `setWizardDraft(draft)`, `clearWizardDraft()`, `updateWizardStep(step)`

### 3. ConfigStore -- sem mudancas estruturais

O ConfigStore ja armazena todas as configs necessarias (atributos, aptidoes, bonus, membrosCorpo,
racas, classes, generos, indoles, presencas). Nenhuma mudanca de state necessaria, apenas
garantir que esteja carregado antes do wizard e das telas de efeitos.

### 4. Novos metodos consolidados em FichasApiService

| Metodo | Endpoint | GAP |
|---|---|---|
| `salvarRascunho(jogoId, fichaId, dto)` | `PUT /fichas/{id}/rascunho` | GAP-01 |
| `completarFicha(fichaId)` | `POST /fichas/{id}/completar` | GAP-01 |
| `concederXp(fichaId, dto)` | `POST /fichas/{id}/xp` | GAP-02 |
| `concederXpLote(jogoId, dto)` | `POST /jogos/{jogoId}/fichas/xp` | GAP-02 |
| `usarProspeccao(fichaId)` | `POST /fichas/{id}/prospeccao/usar` | GAP-08 |
| `resetarEstado(fichaId)` | `POST /fichas/{id}/reset` | GAP-07 |
| `atualizarVisibilidadeNpc(fichaId, ids)` | `PUT /fichas/{id}/visibilidade` | GAP-05 |
| `concederInsolitus(fichaId, dto)` | `POST /fichas/{id}/insolitus` | GAP-09 |

### 5. FichaBusinessService -- novos metodos

- `saveDraft()`, `completeFicha()`, `loadDraft()` (GAP-01)
- `concederXp()`, `concederXpLote()` (GAP-02)
- `usarProspeccao()`, `resetarEstado()` (GAP-07/08)
- `atualizarVisibilidadeNpc()` (GAP-05)
- `concederInsolitus()` (GAP-09)

---

## ORDEM DE IMPLEMENTACAO SUGERIDA

Baseada nas dependencias e na prioridade definida pelo PO.

### Fase 0 -- Pre-requisito (backend e modelos)
1. Atualizar models (`Ficha`, `FichaResumo`, DTOs, `UserInfo`) com novos campos
2. Atualizar `FichasApiService` com novos metodos (stubs que compilam, aguardando backend)

### Fase 1 -- GAP-03: VantagemEfeito (PRIORIDADE PO)
> "TODAS as configuracoes precisam estar 100% antes do modulo Ficha"

3. `EfeitoFormComponent` (Dumb)
4. `DadoSelectorComponent` (Dumb, shared)
5. `VantagemEfeitosTabComponent` (Dumb)
6. Integrar 3a aba no `VantagensConfigComponent`
7. Testes

**Estimativa: 3-4 dias**

### Fase 2 -- GAP-10: Roles ADMIN
> Impacto transversal -- melhor resolver cedo

8. Atualizar `AuthService`, `User` model, `roleGuard`
9. Ajustar rotas e sidebar
10. Testes de guards

**Estimativa: 1-2 dias**

### Fase 3 -- GAP-01: Wizard de Criacao de Ficha
> Maior feature; depende de ConfigStore e modelos atualizados

11. `WizardStepIndicatorComponent` (Dumb, shared)
12. `PontosDistribuicaoComponent` (Dumb, shared)
13. Steps 1-5 (Dumb)
14. `FichaWizardComponent` (Smart) com auto-save
15. Rotas e integracao
16. Refatorar `FichaFormComponent` para modo edicao apenas
17. Testes

**Estimativa: 5-7 dias**

### Fase 4 -- GAP-06 + GAP-07/08: Nivel, Essencia, Prospeccao
> Compartilham mudanca no FichaResumo

18. `PontosDisponiveisCardComponent`
19. `EssenciaBarComponent`, `VidaBarComponent`
20. `UsarProspeccaoDialogComponent`
21. `ResetEstadoDialogComponent`
22. Modificar `FichaHeaderComponent`, `FichaResumoTabComponent`
23. Modificar tabs de atributos/aptidoes/vantagens para usar pontos
24. Testes

**Estimativa: 4-5 dias**

### Fase 5 -- GAP-02 + GAP-05: XP e NPC Visibilidade
25. `ConcederXpDialogComponent`
26. `NpcVisibilidadeDialogComponent`
27. Modificar `NpcsComponent`
28. Testes

**Estimativa: 2-3 dias**

### Fase 6 -- GAP-09: Insolitus
29. `ConcederInsolitusDialogComponent`
30. Modificar `FichaDetailComponent`
31. Testes

**Estimativa: 1-2 dias**

---

## RISCOS E PADROES

### R1: Backend nao pronto para endpoints novos
**Risco alto.** Pelo menos 8 novos endpoints sao necessarios (rascunho, completar, XP, prospeccao,
reset, visibilidade, insolitus, XP lote). O frontend pode criar stubs de servico que compilam,
mas os componentes nao podem ser testados end-to-end sem backend.

**Mitigacao:** Implementar GAP-03 primeiro (VantagemEfeito) -- e 100% frontend, backend ja pronto.
Enquanto isso, alinhar contratos dos novos endpoints com o backend.

### R2: FichaResumo enriquecido pode quebrar frontend existente
**Risco medio.** Adicionar 6+ campos ao `FichaResumo` pode causar `undefined` em componentes que
usam o modelo antigo sem os novos campos.

**Mitigacao:** Todos os novos campos devem ser opcionais (`?`) no model. Componentes devem usar
fallback: `resumo().pontosAtributoDisponiveis ?? 0`.

### R3: Wizard de 5-6 passos e a feature mais complexa
**Risco alto.** Auto-save, restauracao de rascunho, validacao por passo, distribuicao de pontos
com saldo -- muita logica de estado.

**Mitigacao:** Usar `PontosDistribuicaoComponent` reutilizavel para atributos E aptidoes. Manter
wizard state no FichasStore com persistencia via auto-save no backend. Considerar
`@defer` para steps pesados.

### R4: ADMIN bypassa tudo -- risco de regressao em guards
**Risco medio.** Se `ADMIN` nao for considerado em TODOS os lugares onde `isMestre()` e usado,
o admin pode ficar bloqueado em certas telas.

**Mitigacao:** Refatorar `isMestre()` no `AuthService` para retornar `true` tambem quando
`role === 'ADMIN'`. Criar `isAdminOrMestre = computed(() => this.isAdmin() || this.isMestre())`.
Revisar todos os usos de `isMestre()` e `isJogador()`.

### R5: Dois servicos fazem a mesma coisa (FichaBusinessService vs FichaManagementFacadeService)
**Risco baixo mas divida tecnica.** Ambos existem em `core/services/business/` e
`features/jogador/services/` com logica duplicada.

**Mitigacao:** Consolidar em `FichaBusinessService` (que ja e mais completo). Deprecar
`FichaManagementFacadeService` ou transforma-lo em thin facade que delega.

### Padroes a seguir

1. **Smart/Dumb boundary** -- Wizard (Smart) orquestra; Steps (Dumb) recebem dados via `input()`, emitem via `output()`
2. **ConfigStore pre-loaded** -- Resolver ou guard que garante ConfigStore carregado antes do wizard
3. **OnPush everywhere** -- Todos os novos componentes com `ChangeDetectionStrategy.OnPush`
4. **PrimeFlex only** -- Zero CSS customizado nos novos componentes; usar classes utilitarias
5. **Signal inputs** -- Novos componentes usam `input()` e `output()` signal-based
6. **FormulaEditor reutilizavel** -- Ja existe, apenas integrar no EfeitoForm
7. **Vitest tests** -- Cada componente novo vem com `.spec.ts` usando `vi.fn()` e `@testing-library/angular`
8. **Debounced auto-save** -- Wizard usa `debounceTime(500)` antes de chamar `saveDraft()`

---

## CONTAGEM DE ITENS

| Categoria | Quantidade |
|---|---|
| Componentes novos | 16 |
| Componentes a modificar | 15 |
| Novos metodos de API | 8 |
| Models a atualizar | 7 |
| Store state changes | 2 (FichasStore, AuthService) |
| Guard changes | 1 (roleGuard) |
| Rota changes | 3 (wizard, wizard/:id, admin) |
| **Total de itens de trabalho** | **~52** |

---

*Produzido por: Tech Lead Frontend | 2026-04-02*
*Proximo passo: alinhar com backend os 8 endpoints novos necessarios antes de iniciar Fase 1*
