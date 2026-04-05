# Estrutura do Projeto

- `src/app/core/`: Serviços globais, interceptors, guards e estados globais (Signals).
- `src/app/shared/`: Componentes burros (UI), pipes e diretivas reutilizáveis.
- `src/app/features/`: Componentes de página e lógica de negócio específica por módulo.
- `src/app/models/`: Interfaces e types TypeScript.

### Fluxo de Dados
Os dados fluem através de Signals. Serviços expõem `readonly signals` para os componentes.

## ⚠️ Cálculos: Frontend Temporário vs Backend Oficial

**IMPORTANTE**: Cálculos de fórmulas (BBA, BBM, Ímpeto, vidaTotal, etc.) têm dois momentos:

### 1. Cálculos TEMPORÁRIOS (Frontend - para UX responsiva):
- **Quando**: Usuário está editando, antes de salvar
- **Onde**: `FichaCalculationService` (client-side)
- **Por quê**: Feedback imediato - valores atualizam enquanto usuário digita
- **Status**: NÃO PERSISTIDOS - apenas para display
- **Exemplo**:
```typescript
// Usuário altera base de Força de 10 para 12
// Frontend recalcula TEMPORARIAMENTE BBA para mostrar na tela
// Valores NÃO são salvos ainda
const tempBBA = calculationService.calcularBBA(ficha);
```

### 2. Cálculos OFICIAIS (Backend - fonte da verdade):
- **Quando**: Após salvar (POST/PUT `/api/fichas/{id}`)
- **Onde**: Backend `FichaCalculationService` (server-side)
- **Por quê**: Garantir consistência, segurança, centralizar lógica de negócio
- **Status**: VALORES OFICIAIS - persistidos no banco
- **Fluxo**:
```typescript
// 1. Frontend envia ficha com valores base (FOR: 12, DEX: 10, ...)
await fichasStore.updateFicha(id, fichaComValoresBase);

// 2. Backend recalcula TODOS os valores derivados
// 3. Backend retorna ficha com valores OFICIAIS
// 4. Frontend SUBSTITUI valores temporários pelos oficiais
patchState(store, { currentFicha: fichaOficialDoBackend });
```

### Regras:
✅ **Frontend pode calcular para preview** (UX responsiva)  
✅ **Backend SEMPRE recalcula ao salvar** (fonte oficial)  
✅ **Frontend SEMPRE usa valores do backend após save** (substitui temporários)  
❌ **Frontend NUNCA persiste cálculos próprios** (backend é fonte da verdade)


# 🚀 Biblioteca de Prompts - Angular 21 & PrimeNG

Este documento contém prompts otimizados para gerar código de alta qualidade usando Copilot/ChatGPT/Claude, focando em Signals, Standalone Components e PrimeNG.

---

## 1. Criação de Componente (Arquitetura Moderna)
**Contexto:** Use este prompt para criar novas funcionalidades de interface.

> "Crie um componente Standalone chamado [NOME] seguindo os padrões do Angular 21:
> - **Lógica:** Use `signal`, `computed`, `model()` e `input()`/`output()` (nova sintaxe).
> - **Injeção:** Use a função `inject()` para serviços, dispense o constructor.
> - **Template:** Use obrigatoriamente o novo Control Flow (`@if`, `@for`, `@empty`).
> - **UI:** Integre componentes do PrimeNG ([LISTAR COMPONENTES]) e use classes do PrimeFlex/Tailwind para layout.
> - **Performance:** Considere uma abordagem zoneless se necessário."

---

## 2. Geração de Testes Unitários (Vitest + Testing Library)
**Contexto:** Use após criar um componente ou serviço para garantir cobertura.

> "Gere a suíte de testes unitários em Vitest para o arquivo aberto:
> - **Setup:** Use `@testing-library/angular`.
> - **Mocks:** Use `vi.fn()` para mockar dependências injetadas via `inject()`.
> - **Signals:** Garanta que os testes verifiquem mudanças de estado nos signals após interações do usuário (fireEvent).
> - **Padrão:** Siga a estrutura Describe/It com a metodologia AAA (Arrange-Act-Assert)."

---

## 3. Refatoração: Legacy para Angular 21
**Contexto:** Use para converter código antigo (RxJS/Decorators) para o padrão de Signals.

> "Refatore o código selecionado para os padrões modernos do Angular 21:
> - Substitua `BehaviorSubject` ou `ReplaySubject` por `signal()`.
> - Converta `combineLatest` ou `map` de observables locais para `computed()`.
> - Troque `@Input()` e `@Output()` pela sintaxe funcional `input()` e `output()`.
> - Substitua `*ngIf` e `*ngFor` pelo novo Control Flow Syntax do Angular.
> - Remova o `constructor` e use `inject()`."

---

## 4. Serviço de Dados com Signal Store Pattern
**Contexto:** Use para criar serviços que gerenciam estado global ou chamadas de API.

> "Crie um serviço Angular chamado [NOME]Service:
> - **API:** Use `HttpClient` via `inject()`.
> - **Estado:** Mantenha um `signal` privado para o estado dos dados e um `computed` público (readonly) para exposição.
> - **Fluxo:** Use `toSignal` para converter chamadas HTTP ou atualize o signal manualmente no `subscribe` da chamada.
> - **Métodos:** Implemente métodos de CRUD que atualizam o estado de forma imutável usando `.update()`."

---

## 5. Formulário Reativo com PrimeNG
**Contexto:** Use para criar telas de cadastro ou edição complexas.

> "Crie um formulário reativo usando `FormBuilder` e `inject()`:
> - **Componentes:** Use `p-inputGroup`, `p-floatLabel`, `p-inputNumber` e `p-button` do PrimeNG.
> - **Validação:** Adicione validações síncronas e exiba mensagens de erro usando o estado do formulário.
> - **Layout:** Organize os campos em um grid responsivo usando classes do PrimeFlex (grid, col-12, md:col-6)."


## Referências de Documentação (Sempre consultar)
Ao gerar componentes PrimeNG, utilize as definições das versões mais recentes (v18+):
- Contexto Geral: https://primeng.org/llm.txt
- Guia de Migração/Estilo: https://primeng.org/tailwind
- Use o modo "Styled" com o tema Aura, a menos que especificado "Unstyled".
