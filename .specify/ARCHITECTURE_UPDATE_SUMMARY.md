# Resumo das Atualizações de Arquitetura

**Data**: 2026-02-01  
**Objetivo**: Documentar padrões de desenvolvimento e esclarecer estratégia de cálculos frontend/backend

---

## 📋 Alterações Realizadas

### 1. ARCHITECTURE.md
✅ Adicionada seção completa sobre **Padrões de Arquitetura**:
- **SignalStore (@ngrx/signals)**: State management padronizado
- **Business Services**: Regras de negócio isoladas dos componentes
- **Facade Services**: Coordenação para telas complexas
- **Dumb Components**: Componentes puramente de UI

✅ Adicionada seção **Cálculos: Frontend Temporário vs Backend Oficial**:
- Explica quando usar cálculos no frontend (preview temporário)
- Explica quando usar cálculos no backend (valores oficiais)
- Define fluxo completo de dados e responsabilidades

### 2. feature-spec.md
✅ Atualizado **Technical Architecture**:
- State Management agora usa SignalStore (@ngrx/signals)
- Adicionados padrões de Business Services
- Adicionados padrões de Facade Services
- Documentada arquitetura em camadas (API → Store → Business → Facade → Component)

### 3. tasks-core-infrastructure.md
✅ Substituídos "State Services" por **SignalStores**:
- CORE-038 a CORE-044: Agora usam `signalStore()` do @ngrx/signals
- Adicionado ProvidedIn: 'root' para stores globais
- Métodos usam `patchState()` para atualizar estado

✅ Adicionados **Business Services** (Section 4):
- CORE-045/046: FichaCalculationService - cálculos TEMPORÁRIOS client-side
- CORE-047/048: ParticipanteBusinessService - regras de aprovação

✅ **IMPORTANTE**: FichaCalculationService agora CLARAMENTE documentado como:
- Cálculos CLIENT-SIDE TEMPORÁRIOS apenas para feedback imediato
- Backend é fonte oficial - recalcula ao salvar
- Frontend substitui valores temporários pelos oficiais após save

✅ Atualizados Deliverables:
- 3 SignalStores (não "state services")
- 2 Business Services adicionados
- Componentes marcados como DUMB

### 4. backend-debt.md
✅ Substituída seção **"Formula Calculation: Frontend or Backend?"** por **"Formula Calculation: Frontend AND Backend"**:
- Define estratégia HYBRID com backend como fonte oficial
- Frontend calcula temporariamente para UX responsiva
- Backend recalcula ao salvar (POST/PUT /api/fichas/*)

✅ Adicionadas tarefas de backend:
- BACKEND-067: Implementar calculation engine no backend
- BACKEND-068: Validar fórmulas em config endpoints

✅ Atualizados endpoints de fichas (BACKEND-015, 016, 017):
- Especificado que backend DEVE retornar valores RECALCULADOS
- Enfatizado que backend é fonte oficial para calculated values

### 5. copilot-instructions.md
✅ Adicionada seção **"🏗️ Arquitetura e Padrões"**:
- SignalStore para state management
- Business Services para regras de negócio
- Facade Services para telas complexas
- Dumb Components sempre

✅ Adicionada seção **"⚠️ Cálculos: Frontend Temporário vs Backend Oficial"**:
- Explica dois momentos de cálculos
- Define regras claras (✅ permitido / ❌ proibido)

---

## 🎯 Principais Conceitos Estabelecidos

### 1. State Management
```
API Services → SignalStores → Business Services → Facade Services → Components
```

### 2. Responsabilidades Claras

| Camada | Responsabilidade | Exemplo |
|--------|------------------|---------|
| **API Services** | HTTP calls | `JogosApiService.listJogos()` |
| **SignalStores** | Estado global | `JogosStore` (jogos, loading, error) |
| **Business Services** | Regras de negócio | `FichaCalculationService.calcularBBA()` |
| **Facade Services** | Coordenação complexa | `CharacterSheetFacadeService` |
| **Smart Components** | Orquestração | `CharactersPageComponent` |
| **Dumb Components** | UI pura | `CharacterCardComponent` |

### 3. Fluxo de Cálculos

#### Fase 1: Edição (Frontend Temporário)
```typescript
// Usuário edita atributo
const tempBBA = calculationService.calcularBBA(ficha); // preview
```

#### Fase 2: Salvar (Backend Oficial)
```typescript
// 1. Frontend envia valores base
await fichasStore.updateFicha(id, fichaComValoresBase);

// 2. Backend recalcula TODOS os valores derivados
// (acontece automaticamente no servidor)

// 3. Backend retorna ficha com valores oficiais
// 4. Frontend substitui temporários pelos oficiais
patchState(store, { currentFicha: fichaOficialDoBackend });
```

---

## ✅ Benefícios das Mudanças

### Para Desenvolvimento Frontend
- ✅ **Arquitetura clara**: Cada camada tem responsabilidade bem definida
- ✅ **Testabilidade**: Business logic isolada facilita testes
- ✅ **Manutenibilidade**: Mudanças em regras de negócio não afetam UI
- ✅ **Escalabilidade**: Padrão Facade permite gerenciar complexidade

### Para UX
- ✅ **Responsividade**: Cálculos temporários no frontend = feedback imediato
- ✅ **Consistência**: Valores oficiais do backend = dados corretos sempre
- ✅ **Confiabilidade**: Backend valida e recalcula = sem manipulação

### Para Integração Frontend/Backend
- ✅ **Separação clara**: Frontend faz preview, backend valida/calcula oficialmente
- ✅ **Contrato definido**: Backend sempre retorna valores recalculados em responses
- ✅ **Fonte única da verdade**: Backend é autoridade para cálculos

---

## 📝 Próximos Passos

### Frontend
1. ✅ Documentação atualizada (CONCLUÍDO)
2. ⏳ Implementar SignalStores conforme tasks
3. ⏳ Implementar Business Services conforme tasks
4. ⏳ Criar Facade Services para telas complexas
5. ⏳ Garantir que componentes são DUMB

### Backend
1. ⏳ Implementar calculation engine (BACKEND-067)
2. ⏳ Validar fórmulas em config endpoints (BACKEND-068)
3. ⏳ Garantir que POST/PUT /api/fichas/* retornem valores recalculados
4. ⏳ Documentar formulas suportadas e syntax

### Integração
1. ⏳ Testar fluxo completo de cálculos (frontend preview → backend oficial)
2. ⏳ Validar que frontend substitui valores temporários após save
3. ⏳ Criar testes de integração para verificar consistência

---

## 📚 Referências

- **ARCHITECTURE.md**: Estrutura completa do projeto
- **feature-spec.md**: Technical Architecture section
- **tasks-core-infrastructure.md**: Section 3 (SignalStores) e Section 4 (Business Services)
- **backend-debt.md**: Formula Calculation section + BACKEND-067/068
- **copilot-instructions.md**: Arquitetura e Padrões + Cálculos

---

**Status**: ✅ DOCUMENTAÇÃO COMPLETA  
**Próximo**: Iniciar implementação das tasks conforme especificado
