---
name: Padroes criticos de testes JIT Angular (Vitest)
description: 4 armadilhas JIT confirmadas no projeto + correcao do erro templateUrl
type: feedback
---

## Regras criticas para testes em modo JIT (Vitest sem plugin Angular)

### 1. input.required() causa NG0950 em componentes filhos
Componentes dumb com `input.required()` lançam NG0950 quando renderizados dentro do Smart Component em JIT.
**Correcao**: usar `configureTestBed: (tb) => tb.overrideTemplate(SmartComponent, TEMPLATE_STUB)` para substituir o template por um stub que nao instancia os filhos.

### 2. templateUrl nao funciona em JIT — SEMPRE usar template inline
Componentes com `templateUrl: './meu.component.html'` lançam o erro:
```
Component 'X' is not resolved: templateUrl. Did you run resolveComponentResources()?
```
**Correcao**: mover template para inline no `@Component({ template: \`...\` })`. Nunca usar `templateUrl` em componentes que precisam ser testados com Vitest.

### 3. input() com atributos estaticos nao propagam em JIT
Atributos estaticos como `message="Texto"` passados para componentes com `input()` nao são propagados em JIT. O componente filho renderiza com o valor default do signal.
**Correcao**: testar o comportamento (ex: renderiza componente filho) em vez do conteudo de texto.

### 4. Fake timers antes de `fixture.whenStable()` travam o test
Nao usar `vi.useFakeTimers()` antes de `fixture.whenStable()`.
**Correcao**: resolver a fixture antes de ativar fake timers, ou usar `Subject` do RxJS para controlar a emissao de observables em vez de timers.

### 5. Mock de Observable com Promise causa "pipe is not a function"
Quando o componente espera um Observable e o mock retorna uma Promise (ex: `new Promise(r => { ... })`), o `.pipe()` falha.
**Correcao**: usar `Subject<T>` do RxJS para controlar quando o observable resolve:
```typescript
const subject = new Subject<T>();
mockService.metodo.mockReturnValue(subject.asObservable());
// ... invocar o metodo ...
subject.next(valor); // resolve o observable
subject.complete();
```

### 6. Rotas nao registradas causam Unhandled Error no test runner
O `provideRouter([])` sem rotas faz o router lancar NG04002 quando o componente navega.
**Correcao**: registrar rotas stub com `provideRouter([{ path: 'destino', component: StubComponent }])`.

### 7. providers locais no @Component ignoram mocks do TestBed
Quando um componente declara `providers: [ConfirmationService]` no seu decorator, o Angular cria uma instância local que ignora o `{ provide: ConfirmationService, useValue: mock }` no nível do TestBed.
**Correcao**: usar `configureTestBed: (tb) => { tb.overrideTemplate(...); tb.overrideProvider(ConfirmationService, { useValue: mock }); }` para substituir o provider no nivel do componente.
Exemplo confirmado: `LevelUpDialogComponent` (level-up-dialog.component.spec.ts).

**Why:** Vitest roda em modo JIT sem o plugin Angular (que usa Ivy compiler com template URLs). Todos esses problemas sao especificos do ambiente JIT do Vitest.

**How to apply:** Verificar estas armadilhas ao escrever qualquer spec de componente. Sempre: template inline, overrideTemplate para smart components, Subject para observable testing, rotas stub. Se o componente tem providers locais (ConfirmationService, etc.), usar overrideProvider no configureTestBed.
