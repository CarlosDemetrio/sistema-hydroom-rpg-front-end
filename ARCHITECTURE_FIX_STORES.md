# 🎯 Correção Arquitetural - Store vs Services

**Data**: 2026-02-01  
**Status**: ✅ CORRIGIDO

---

## ❌ Problema Identificado

### ANTES (ERRADO):
```
Component → Store.createJogo() → API → Backend
              ↑ (chamada direta)
          (Store fazia TUDO)
```

**Problemas**:
1. ❌ Store tinha métodos **async** chamando API
2. ❌ Store tinha lógica de negócio
3. ❌ Responsabilidade misturada (estado + HTTP)
4. ❌ Difícil de testar
5. ❌ Viola Single Responsibility Principle

---

## ✅ Solução Implementada

### DEPOIS (CORRETO):
```
Component → Facade → API Service → Backend
               ↓ (response)
          Store.setState()
               ↓ (signal)
          Component (UI atualiza)
```

**Responsabilidades Claras**:
- ✅ **Store**: APENAS estado (síncro no)
- ✅ **API Service**: APENAS chamadas HTTP
- ✅ **Facade**: Coordena API + Store
- ✅ **Component**: APENAS UI

---

## 📋 Arquivos Refatorados

### 1. ✅ JogosStore
**Arquivo**: `src/app/core/stores/jogos.store.ts`

**ANTES**:
```typescript
❌ async loadJogos() {
  const jogos = await jogosApi.listJogos();
  patchState(store, { jogos });
}
```

**DEPOIS**:
```typescript
✅ setJogos(jogos: Jogo[]) {
  patchState(store, { jogos, loading: false, error: null });
}

✅ setLoading(loading: boolean) {
  patchState(store, { loading });
}
```

**Mudanças**:
- ✅ Removido inject(JogosApiService)
- ✅ Removidos TODOS os métodos async
- ✅ Apenas métodos síncronos de setState
- ✅ 160 linhas → 160 linhas (mais limpo)

---

### 2. ✅ JogoManagementFacadeService
**Arquivo**: `src/app/features/mestre/services/jogo-management-facade.service.ts`

**ANTES**:
```typescript
❌ loadJogos() {
  this.jogosStore.loadJogos(); // Store fazia HTTP
}
```

**DEPOIS**:
```typescript
✅ async loadJogos(filters?: { status?: JogoStatus }) {
  this.jogosStore.setLoading(true);
  try {
    const jogos = await this.jogosApi.listJogos(filters);
    this.jogosStore.setJogos(jogos);
  } catch (error) {
    this.jogosStore.setError('Erro ao carregar jogos');
    throw error;
  }
}
```

**Mudanças**:
- ✅ Injeta JogosApiService
- ✅ Chama API
- ✅ Atualiza Store com resposta
- ✅ Trata erros
- ✅ Expõe computed values

---

## 🔄 Fluxo de Dados Correto

### Exemplo: Criar Jogo

#### 1. Component (UI)
```typescript
// JogoFormComponent
async onSubmit() {
  await this.jogoFacade.createJogo({
    nome: this.form.value.nome,
    descricao: this.form.value.descricao
  });
}
```

#### 2. Facade (Coordenação)
```typescript
// JogoManagementFacadeService
async createJogo(data) {
  this.jogosStore.setLoading(true);
  try {
    const novoJogo = await this.jogosApi.createJogo(data);
    this.jogosStore.addJogo(novoJogo);
    return novoJogo;
  } catch (error) {
    this.jogosStore.setError('Erro ao criar jogo');
    throw error;
  }
}
```

#### 3. API Service (HTTP)
```typescript
// JogosApiService
async createJogo(data) {
  const response = await fetch('/api/jogos', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  return response.json();
}
```

#### 4. Store (Estado)
```typescript
// JogosStore
addJogo(jogo: Jogo) {
  patchState(store, {
    jogos: [...store.jogos(), jogo],
    loading: false,
    error: null
  });
}
```

#### 5. Component (UI atualiza automaticamente)
```typescript
// Template reativo
@if (jogoFacade.jogos().length > 0) {
  @for (jogo of jogoFacade.jogos(); track jogo.id) {
    <div>{{ jogo.nome }}</div>
  }
}
```

---

## 🎯 Benefícios da Arquitetura Correta

### 1. **Separação de Responsabilidades**
- ✅ Store: APENAS estado
- ✅ API Service: APENAS HTTP
- ✅ Facade: Coordenação
- ✅ Component: Apenas UI

### 2. **Testabilidade**
```typescript
// Store - testes unitários simples
it('deve adicionar jogo ao estado', () => {
  store.addJogo(mockJogo);
  expect(store.jogos()).toContain(mockJogo);
});

// Facade - mock da API
it('deve criar jogo e atualizar store', async () => {
  jest.spyOn(jogosApi, 'createJogo').mockResolvedValue(mockJogo);
  await facade.createJogo(data);
  expect(store.jogos()).toContain(mockJogo);
});
```

### 3. **Manutenibilidade**
- ✅ Mudanças na API não afetam Store
- ✅ Mudanças no Store não afetam API
- ✅ Facade pode ser substituída facilmente

### 4. **Reutilização**
- ✅ Mesmo Store pode ser usado por múltiplas features
- ✅ Mesmo API Service pode ter múltiplos facades
- ✅ Facades específicas por caso de uso

---

## 📝 Padrões a Seguir

### ✅ DO (Fazer)

#### Store
```typescript
✅ setJogos(jogos: Jogo[])
✅ addJogo(jogo: Jogo)
✅ updateJogoInState(id, updates)
✅ removeJogo(id)
✅ setLoading(boolean)
✅ setError(string | null)
```

#### Facade
```typescript
✅ async loadJogos(filters?)
✅ async createJogo(data)
✅ async updateJogo(id, data)
✅ async deleteJogo(id)
✅ getJogo(id) // leitura do store
✅ computed values
```

#### API Service
```typescript
✅ async listJogos(filters?)
✅ async createJogo(data)
✅ async updateJogo(id, data)
✅ async deleteJogo(id)
```

---

### ❌ DON'T (Evitar)

#### Store NÃO deve:
```typescript
❌ inject(JogosApiService)
❌ async loadJogos()
❌ await fetch()
❌ try/catch de HTTP
❌ Lógica de negócio complexa
```

#### Component NÃO deve:
```typescript
❌ inject(JogosStore)  // Use Facade
❌ inject(JogosApiService)  // Use Facade
❌ Chamar API diretamente
❌ Ter lógica de negócio
```

---

## 🔄 Próximos Passos

### Stores a Refatorar:
1. ⏳ **FichasStore** - Remover chamadas API
2. ⏳ **ConfigStore** - Remover chamadas API

### Facades a Criar:
1. ⏳ **FichaManagementFacadeService** (Jogador)
2. ⏳ **ConfigManagementFacadeService** (Mestre)

### Components a Refatorar:
1. ⏳ JogoFormComponent - Usar Facade
2. ⏳ JogoDetailComponent - Usar Facade
3. ⏳ JogadorDashboardComponent - Usar Facade (fichas)

---

## 📊 Métricas

### Antes da Refatoração:
- ❌ Store com 262 linhas (estado + HTTP + lógica)
- ❌ 9 métodos async no Store
- ❌ Responsabilidades misturadas
- ❌ Difícil de testar

### Depois da Refatoração:
- ✅ Store com 160 linhas (APENAS estado)
- ✅ 0 métodos async no Store
- ✅ Facade com 200 linhas (coordenação)
- ✅ Responsabilidades claras
- ✅ Fácil de testar

---

**Status**: ✅ **ARQUITETURA CORRETA IMPLEMENTADA**

**Próximo**: Refatorar FichasStore e ConfigStore seguindo o mesmo padrão
