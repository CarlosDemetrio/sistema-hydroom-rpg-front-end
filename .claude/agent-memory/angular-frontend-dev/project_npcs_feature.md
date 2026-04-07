---
name: Feature NPCs (Mestre)
description: Tela de listagem e criação de NPCs para o Mestre — padrões adotados, dependências e localização dos arquivos
type: project
---

Tela de NPCs implementada em `src/app/features/mestre/pages/npcs/npcs.component.ts`.

**Why:** O backend já expunha `GET/POST /api/v1/jogos/{jogoId}/npcs` mas o frontend estava completamente ausente. A tela é exclusiva do Mestre.

**How to apply:** Para futuras páginas do Mestre que precisem de currentGameId, seguir exatamente este padrão:

- `currentGameId` vem de `inject(CurrentGameService).currentGameId` (signal computed readonly)
- `hasGame = currentGameService.hasCurrentGame` (signal computed boolean)
- `currentGameName = computed(() => currentGameService.currentGame()?.nome ?? null)`
- Dados de config (raças, classes, gêneros, índoles, presenças) vêm do `ConfigStore` injetado diretamente
- `FichaBusinessService.loadNpcs(jogoId)` e `FichaBusinessService.criarNpc(jogoId, dto)` — nunca usar FichasApiService diretamente
- Rota registrada como filho de `mestre` com `canActivate: [currentGameGuard]` (redirecta para /mestre/jogos se sem jogo)
- Navegação para ficha de NPC usa `/jogador/fichas/:id` (mesma rota que fichas de jogadores)
- Acesso à página adicionado como card no `mestre-dashboard` (não há sidebar de navegação geral do Mestre)
