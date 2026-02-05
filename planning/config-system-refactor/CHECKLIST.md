# ✅ Checklist Executivo - Refatoração Sistema de Configurações

**Data Início**: 2026-02-05  
**Data Conclusão Prevista**: 2026-02-19  
**Responsável**: GitHub Copilot

---

## 🎯 Status Geral

- [x] **Planejamento Completo** ✅
- [x] **Infraestrutura Implementada** ✅ (INF-0, INF-1, INF-2, INF-3 completos!)
- [x] **Configurações Implementadas** (13/13) ✅ **100% COMPLETO!**
- [ ] **Testes Passando**
- [ ] **Deploy em Produção**

---

## 📋 FASE 1: Infraestrutura (Crítico)

### INF-0: Infraestrutura Genérica (15-20h)

- [x] **Issue #INF-0.1**: Interfaces Base criadas
  - [x] `BaseConfig`, `JogoScopedConfig`, `NamedConfig`
  - [x] Exportadas no barrel file
  - [x] Documentação JSDoc completa

- [x] **Issue #INF-0.2**: DTOs Genéricos criados
  - [x] `CreateConfigDto<T>`
  - [x] `UpdateConfigDto<T>`
  - [x] Type-safe e funcionando

- [x] **Issue #INF-0.3**: BaseConfigService criado
  - [x] Classe abstrata implementada
  - [x] Métodos CRUD genéricos funcionando
  - [x] Integração com CurrentGameService
  - [x] Método `ensureGameSelected()` implementado

- [x] **Issue #INF-0.4**: IConfigComponent criado
  - [x] Interface definida
  - [x] Todos métodos e properties documentados

- [x] **Issue #INF-0.5**: BaseConfigComponent criado
  - [x] Classe abstrata implementada
  - [x] Integração com ToastService (não MessageService!)
  - [x] Loading delegado para LoadingInterceptor
  - [x] Erros delegados para ErrorInterceptor

- [x] **Issue #INF-0.6**: Template Base criado
  - [x] Cada componente terá seu próprio template
  - [x] BaseConfigComponent fornece lógica comum
  - [x] Templates seguirão estrutura padrão documentada

**Checkpoint INF-0**: ✅ Infraestrutura genérica completa!

---

### INF-1: Business Services (6h)

- [x] Atributo ConfigService
- [x] Aptidao ConfigService
- [x] Nivel ConfigService
- [x] Limitador ConfigService
- [x] Classe ConfigService
- [x] Raca ConfigService
- [x] Vantagem ConfigService
- [x] Prospeccao ConfigService
- [x] Presenca ConfigService
- [x] Genero ConfigService
- [x] Indole ConfigService
- [x] MembroCorpo ConfigService
- [x] Bonus ConfigService

**Validação**: ✅ Todos estendem `BaseConfigService<T>` e compilam sem erros

---

### INF-2: ConfigApiService Atualizado (4h)

- [x] Métodos de Atributos aceitam `jogoId`
- [x] Métodos de Aptidões aceitam `jogoId`
- [x] Métodos de Níveis aceitam `jogoId`
- [x] Métodos de Limitadores aceitam `jogoId`
- [x] Métodos de Classes aceitam `jogoId`
- [x] Métodos de Raças aceitam `jogoId`
- [x] Métodos de Vantagens aceitam `jogoId`
- [x] Métodos de Prospecção aceitam `jogoId`
- [x] Métodos de Presenças aceitam `jogoId`
- [x] Métodos de Gêneros aceitam `jogoId`
- [x] Métodos de Índoles aceitam `jogoId` (NOVO)
- [x] Métodos de Membros do Corpo aceitam `jogoId` (NOVO)
- [x] Métodos de Bônus aceitam `jogoId` (NOVO)

**Validação**: ✅ Todos os endpoints atualizados com parâmetro jogoId

---

### INF-3: ConfigFacadeService (3h)

- [x] Service criado
- [x] Injeta os 13 Business Services
- [x] Expõe signals `currentGameId`, `hasCurrentGame` e `currentGame`
- [x] Métodos delegados para todos os tipos (via properties readonly)
- [x] Método `loadAllBasicConfigs()` implementado

**Validação**: ✅ ConfigFacadeService criado e compilando sem erros

---

## 📦 FASE 2: Configurações (55h)

### Task 01: Atributos (4h)

- [x] AtributoConfigService criado
- [x] Interface AtributoConfig atualizada
- [x] AtributosConfigComponent criado
- [x] Template HTML criado
- [x] Rota já existe
- [ ] Menu verificado/atualizado (se necessário)
- [ ] ✅ **Testado manualmente**

---

### Task 02: Aptidões (5h)

- [x] AptidaoConfigService criado
- [x] TipoAptidaoConfigService criado (não necessário - usa endpoint global)
- [x] Interfaces atualizadas
- [x] AptidoesConfigComponent criado
- [x] Templates HTML criados
- [x] Rota já existe
- [ ] Menu verificado
- [ ] ✅ **Testado manualmente**

---

### Task 03: Níveis (5h)

- [x] NivelConfigService criado
- [x] Interface NivelConfig atualizada
- [x] NiveisConfigComponent criado
- [x] Template HTML criado
- [x] Validadores progressivos implementados
- [x] Rota já existe
- [ ] Menu verificado
- [ ] ✅ **Testado manualmente**

---

### Task 04: Classes (5h)

- [x] ClasseConfigService criado
- [x] Interface ClassePersonagem atualizada
- [x] ClassesConfigComponent criado
- [x] Template HTML criado
- [x] Rota já existe
- [ ] Menu verificado
- [ ] ✅ **Testado manualmente**

---

### Task 05: Raças (5h)

- [x] RacaConfigService criado
- [x] Interface Raca atualizada
- [x] RacasConfigComponent criado
- [x] Template HTML criado
- [x] Rota já existe
- [ ] Menu verificado
- [ ] ✅ **Testado manualmente**

---

### Task 06: Vantagens (6h)

- [x] VantagemConfigService criado
- [x] Interface VantagemConfig atualizada
- [x] VantagensConfigComponent criado
- [x] Template HTML criado
- [x] Dropdown de categoria implementado
- [x] Rota já existe
- [ ] Menu verificado
- [ ] ✅ **Testado manualmente**

---

### Task 07: Limitadores (5h)

- [x] LimitadorConfigService criado
- [x] Interface LimitadorConfig atualizada
- [x] LimitadoresConfigComponent criado
- [x] Template HTML criado
- [x] Rota já existe
- [ ] Menu verificado
- [ ] ✅ **Testado manualmente**

---

### Task 08: Prospecção (5h)

- [x] ProspeccaoConfigService criado
- [x] Interface ProspeccaoConfig atualizada
- [x] ProspeccaoConfigComponent criado
- [x] Template HTML criado
- [x] Rota já existe
- [ ] Menu verificado
- [ ] ✅ **Testado manualmente**

---

### Task 09: Presenças (4h)

- [x] PresencaConfigService criado
- [x] Interface PresencaConfig atualizada
- [x] PresencasConfigComponent criado
- [x] Template HTML criado
- [x] Rota já existe
- [ ] Menu verificado
- [ ] ✅ **Testado manualmente**

---

### Task 10: Gêneros (3h)

- [x] GeneroConfigService criado
- [x] Interface GeneroConfig atualizada
- [x] GenerosConfigComponent criado
- [x] Template HTML criado
- [x] Rota já existe
- [ ] Menu verificado
- [ ] ✅ **Testado manualmente**

---

### Task 11: Índoles (3h)

- [x] IndoleConfigService criado
- [x] Interface IndoleConfig atualizada
- [x] IndolesConfigComponent criado
- [x] Template HTML criado
- [x] Rota já existe
- [ ] Menu verificado
- [ ] ✅ **Testado manualmente**

---

### Task 12: Membros do Corpo (5h)

- [x] MembroCorpoConfigService criado
- [x] Interface MembroCorpoConfig atualizada
- [x] MembrosCorpoConfigComponent criado
- [x] Template HTML criado
- [x] Rota já existe
- [ ] Menu verificado
- [ ] ✅ **Testado manualmente**

---

### Task 13: Bônus (5h)

- [x] BonusConfigService criado
- [x] Interface BonusConfig atualizada
- [x] BonusConfigComponent criado
- [x] Template HTML criado
- [x] Rota já existe
- [ ] Menu verificado
- [ ] ✅ **Testado manualmente**
- [ ] Template HTML criado
- [ ] Validação de soma de porcentagens ≤ 100%
- [ ] Total de porcentagens no rodapé da tabela
- [ ] Campo porcentagem formatado corretamente
- [ ] Rota adicionada
- [ ] Menu atualizado
- [ ] ✅ **Testado manualmente**

---

## 🧪 FASE 3: Testes E2E (8h)

- [ ] Cenário: Criar config sem jogo selecionado
- [ ] Cenário: Criar config com jogo selecionado
- [ ] Cenário: Editar config existente
- [ ] Cenário: Deletar config
- [ ] Cenário: Trocar jogo no header
- [ ] Cenário: Validações de formulário
- [ ] Cenário: Ordem única por jogo
- [ ] Cenário: Fluxo completo (Tipos → Aptidões)
- [ ] Todos testes passando em todos os browsers

---

## 📚 FASE 4: Documentação (Incluída nas tasks)

- [ ] README atualizado
- [ ] ARCHITECTURE.md atualizado
- [ ] Comentários JSDoc em todos os services
- [ ] Comentários JSDoc em todas as interfaces
- [ ] Guia de uso para Mestre (opcional)

---

## ✅ Critérios de Sucesso Global

- [ ] **Todas requisições de config enviam `jogoId`**
- [ ] **Sem erro 400/500 em requisições de config**
- [ ] **Componentes exibem apenas configs do jogo ativo**
- [ ] **Mudança de jogo recarrega configs automaticamente**
- [ ] **Validações de formulário funcionando**
- [ ] **Mensagens toast exibidas corretamente**
- [ ] **Loading gerenciado por interceptor (não local)**
- [ ] **Erros gerenciados por interceptor (não local)**
- [ ] **Código compila sem erros**
- [ ] **Sem erros no console do browser**
- [ ] **Code review aprovado**
- [ ] **Deploy em produção realizado**

---

## 📊 Métricas de Acompanhamento

### Horas Trabalhadas

| Fase | Previsto | Real | Diferença |
|------|----------|------|-----------|
| INF-0 | 15-20h | ___h | ___h |
| INF-1,2,3 | 13h | ___h | ___h |
| Configs | 55h | ___h | ___h |
| Testes | 8h | ___h | ___h |
| **TOTAL** | **91-96h** | **___h** | **___h** |

### Progresso por Sprint

| Sprint | Tasks | Previsto | Concluído | % |
|--------|-------|----------|-----------|---|
| 0 (Infra) | INF-0,1,2,3 | 28-33h | ___h | ___% |
| 1 (Modelo) | 01,02,03 | 14h | ___h | ___% |
| 2 (Simples) | 04,05,07,09,10,11 | 25h | ___h | ___% |
| 3 (Complexas) | 06,08,12 | 16h | ___h | ___% |
| 4 (Testes) | E2E | 8h | ___h | ___% |

---

## 🚨 Bloqueadores / Riscos

| # | Bloqueador | Impacto | Status | Solução |
|---|------------|---------|--------|---------|
| 1 | Schema backend diferente do api.json | Alto | ⚠️ | Validar com backend |
| 2 | ToastService não existe | Alto | ⚠️ | Verificar implementação atual |
| 3 | LoadingInterceptor não existe | Alto | ⚠️ | Verificar implementação atual |
| 4 | ErrorInterceptor não existe | Alto | ⚠️ | Verificar implementação atual |
| 5 | BonusAtributos não no schema | Médio | ⚠️ | Confirmar se será adicionado |

---

## 📝 Notas / Observações

_Use este espaço para anotações durante a implementação_

```
Data: _____/_____
Nota: ________________________________________________
_____________________________________________________
_____________________________________________________

Data: _____/_____
Nota: ________________________________________________
_____________________________________________________
_____________________________________________________
```

---

## 🎉 Conclusão

- [ ] ✅ Todos checkboxes marcados
- [ ] ✅ Todos testes passando
- [ ] ✅ Code review aprovado
- [ ] ✅ Deploy em produção
- [ ] ✅ Documentação atualizada
- [ ] 🎊 **PROJETO CONCLUÍDO!**

---

**Assinaturas**:

Desenvolvedor: _____________________ Data: _____/_____/_____  
Revisor: ___________________________ Data: _____/_____/_____  
Aprovador: _________________________ Data: _____/_____/_____
