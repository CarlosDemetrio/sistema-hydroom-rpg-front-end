# ✅ Checklist Executivo - Refatoração Sistema de Configurações

**Data Início**: 2026-02-05  
**Data Conclusão Prevista**: 2026-02-19  
**Responsável**: GitHub Copilot

---

## 🎯 Status Geral

- [x] **Planejamento Completo** ✅
- [x] **Infraestrutura Implementada** ✅ (INF-0 concluído!)
- [ ] **Configurações Implementadas** (0/13)
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
- [ ] Métodos de Gêneros aceitam `jogoId`
- [ ] Métodos de Índoles aceitam `jogoId`
- [ ] Métodos de Membros do Corpo aceitam `jogoId`

**Validação**: GET envia `?jogoId=X`, POST envia `{ ...data, jogoId }`

---

### INF-3: ConfigFacadeService (3h)

- [ ] Service criado
- [ ] Injeta os 13 Business Services
- [ ] Expõe signals `currentGameId` e `hasCurrentGame`
- [ ] Métodos delegados para todos os tipos
- [ ] Método `loadAllBasicConfigs()` (opcional)

---

## 📦 FASE 2: Configurações (55h)

### Task 01: Atributos (4h)

- [ ] AtributoConfigService criado
- [ ] Interface AtributoConfig atualizada
- [ ] AtributosConfigComponent criado
- [ ] Template HTML criado
- [ ] Rota adicionada
- [ ] Menu atualizado
- [ ] ✅ **Testado manualmente**

---

### Task 02: Aptidões (5h)

- [ ] AptidaoConfigService criado
- [ ] TipoAptidaoConfigService criado
- [ ] Interfaces atualizadas
- [ ] AptidoesConfigComponent criado
- [ ] TiposAptidaoConfigComponent criado (opcional)
- [ ] Templates HTML criados
- [ ] Rotas adicionadas
- [ ] Menu atualizado
- [ ] ✅ **Testado manualmente**

---

### Task 03: Níveis (5h)

- [ ] NivelConfigService criado
- [ ] Interface NivelConfig atualizada
- [ ] NiveisConfigComponent criado
- [ ] Template HTML criado
- [ ] Validadores customizados criados
  - [ ] `progressiveXpValidator`
  - [ ] `uniqueLevelValidator`
- [ ] Rota adicionada
- [ ] Menu atualizado
- [ ] ✅ **Testado manualmente**

---

### Task 04: Classes (5h)

- [ ] ClasseConfigService criado
- [ ] Interface ClassePersonagem atualizada
- [ ] ClassesConfigComponent criado
- [ ] Template HTML criado
- [ ] Rota adicionada
- [ ] Menu atualizado
- [ ] ✅ **Testado manualmente**

---

### Task 05: Raças (5h)

- [ ] RacaConfigService criado
- [ ] Interface Raca atualizada
- [ ] RacasConfigComponent criado
- [ ] Template HTML criado
- [ ] Rota adicionada
- [ ] Menu atualizado
- [ ] ✅ **Testado manualmente**

---

### Task 06: Vantagens (6h)

- [ ] VantagemConfigService criado
- [ ] Interface VantagemConfig atualizada
- [ ] VantagensConfigComponent criado
- [ ] Template HTML criado
- [ ] Preview de custo por nível (opcional)
- [ ] Rota adicionada
- [ ] Menu atualizado
- [ ] ✅ **Testado manualmente**

---

### Task 07: Bônus (5h)

- [ ] BonusConfigService criado
- [ ] Interface BonusConfig atualizada
- [ ] BonusConfigComponent criado
- [ ] Template HTML criado
- [ ] Rota adicionada
- [ ] Menu atualizado
- [ ] ✅ **Testado manualmente**

---

### Task 08: Prospecção (5h)

- [ ] ProspeccaoConfigService criado
- [ ] Interface DadoProspeccaoConfig atualizada
- [ ] ProspeccaoConfigComponent criado
- [ ] Template HTML criado
- [ ] Select de tipos de dado implementado
- [ ] Rota adicionada
- [ ] Menu atualizado
- [ ] ✅ **Testado manualmente**

---

### Task 09: Presenças (4h)

- [ ] PresencaConfigService criado
- [ ] Interface PresencaConfig atualizada
- [ ] PresencasConfigComponent criado
- [ ] Template HTML criado
- [ ] Rota adicionada
- [ ] Menu atualizado
- [ ] ✅ **Testado manualmente**

---

### Task 10: Gêneros (3h)

- [ ] GeneroConfigService criado
- [ ] Interface GeneroConfig atualizada
- [ ] GenerosConfigComponent criado
- [ ] Template HTML criado
- [ ] Rota adicionada
- [ ] Menu atualizado
- [ ] ✅ **Testado manualmente**

---

### Task 11: Índoles (3h)

- [ ] IndoleConfigService criado
- [ ] Interface IndoleConfig atualizada
- [ ] IndolesConfigComponent criado
- [ ] Template HTML criado
- [ ] Rota adicionada
- [ ] Menu atualizado
- [ ] ✅ **Testado manualmente**

---

### Task 12: Membros do Corpo (5h)

- [ ] MembroCorpoConfigService criado
- [ ] Interface MembroCorpoConfig atualizada
- [ ] MembrosCorpoConfigComponent criado
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
