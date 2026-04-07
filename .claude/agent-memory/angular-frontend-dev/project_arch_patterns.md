---
name: Padrões de Arquitetura Frontend (Klayrah)
description: Padrões estabelecidos no projeto: DI, stores, serviços, roteamento, layout
type: project
---

## Estado e Serviços

- Stores (`@ngrx/signals`): `FichasStore`, `JogosStore`, `ConfigStore` — apenas estado, zero HTTP
- Business services (`core/services/business/`): coordenam API + Store; ex. `FichaBusinessService`
- API services (`core/services/api/`): HTTP puro, sem lógica
- `CurrentGameService`: fonte canônica de `currentGameId` (persiste no localStorage)
- `ToastService`: wrapper de `MessageService` do PrimeNG — usar sempre `success/error/warning`

## Padrões de Componente

- Smart components injetam services via `inject()`, gerenciam estado local com `signal()`
- Dumb components: `input()`/`output()` puros
- `ChangeDetectionStrategy.OnPush` em todos os componentes
- Sem `CommonModule`, sem `*ngIf`/`*ngFor`, apenas control flow novo
- Estilo: somente PrimeFlex — arquivos `.css` ficam vazios

## Layout do Mestre

- Não há sidebar de navegação geral do Mestre
- Hub de navegação: `MestreDashboardComponent` com cards de ação rápida
- Para adicionar nova seção: adicionar card em `mestre-dashboard.component.ts`
- Configurações do sistema: `mestre/config` com layout próprio (`ConfigLayoutComponent` + `ConfigSidebarComponent`)

## Roteamento

- Todas as rotas do Mestre são filhas de `mestre` com `canActivate: [roleGuard]`
- Rotas que requerem jogo selecionado: adicionar `canActivate: [currentGameGuard]`
- `currentGameGuard` redireciona para `/mestre/jogos` se não há jogo

## Testes

- Framework: Vitest + `@testing-library/angular`
- Padrão: `render()` + `screen` + `fireEvent` + providers como `useValue`
- Mocks de signals: funções `() => valor` simples (não `signal()`)

**Why:** Decisões de arquitetura do Tech Lead; desvios causam inconsistência e reviews rejeitados.
**How to apply:** Verificar estes padrões antes de criar qualquer novo componente ou rota.
