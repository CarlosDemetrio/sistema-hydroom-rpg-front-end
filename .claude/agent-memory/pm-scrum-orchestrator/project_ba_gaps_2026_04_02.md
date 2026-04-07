---
name: BA Gaps Dossie 2026-04-02
description: 4 bloqueadores (GAP-01 wizard, GAP-02 XP, GAP-03 VantagemEfeito, GAP-04 participantes) + 4 alta prioridade + 5 inconsistencias tecnicas que redefiniram Sprint 2
type: project
---

BA entregou dossie de gaps em 2026-04-02 com impacto direto no caminho critico.

**GAP-01 (wizard):** FichaForm envia apenas {nome}. Decisao provisoria: wizard 4 passos, obrigatorios nome/raca/classe.
**GAP-02 (XP):** Jogador pode alterar propria XP. Decisao provisoria: XP so MESTRE, endpoint em lote, historico via Envers.
**GAP-03 (VantagemEfeito):** Motor ignora 8 tipos de efeito. Decisao: aceitar VT=0 temporariamente, integrar APOS wizard.
**GAP-04 (participantes):** Maquina de estados indefinida. Decisao: REJEITADO re-solicita, BANIDO reversivel, DELETE=soft.

**Why:** Sem estas decisoes, US-FICHA-01 (wizard), US-FICHA-04 (XP) e Spec 005 inteira ficam bloqueados.
**How to apply:** Sprint 2 comeca com FASE 0 de decisoes. Backend fixes (restringir XP, pontosDisponiveis, essenciaAtual) em paralelo. Wizard e o bloqueador #1.
