---
name: Padroes criticos de testes JIT Angular (Vitest)
description: 8 armadilhas JIT confirmadas no projeto — input.required, templateUrl, static attrs, fake timers, Subject, p-button click, detectChanges pos-Subject, p-togglebutton aria-label
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

### 8. p-button com (onClick) requer click no inner <button> + detectChanges
`p-button` com `(onClick)` renderiza um `<button>` interno. `fireEvent.click(hostElement)` nem sempre dispara o handler Angular. Alem disso, componentes OnPush nao re-renderizam apos eventos sem `fixture.detectChanges()`.
**Correcao**: usar helper `clickPButton(nativeElement, ariaLabel)` que tenta o `querySelector('p-button[aria-label="..."] button')` primeiro. Sempre chamar `fixture.detectChanges()` apos o click.
Padrão para `p-togglebutton`: verificar presença via `nativeElement.querySelector('p-togglebutton')` — o aria-label pode nao ser propagado ao elemento host em JIT.

### 9. Subject.next() em Observable de service requer detectChanges manual
Quando um componente OnPush chama `subject.next(dados)` e exibe os dados via `@if`/`@for`, o template nao re-renderiza automaticamente. Sempre chamar `fixture.detectChanges()` apos `subject.next()`.
**Correcao**: padrao correto:
```typescript
anotacoesSubject.next([anotacaoMock]);
anotacoesSubject.complete();
fixture.detectChanges(); // obrigatorio
```

**Why:** Vitest roda em modo JIT sem o plugin Angular (que usa Ivy compiler com template URLs). Todos esses problemas sao especificos do ambiente JIT do Vitest.

**How to apply:** Verificar estas armadilhas ao escrever qualquer spec de componente. Sempre: template inline, overrideTemplate para smart components, Subject para observable testing, rotas stub. Se o componente tem providers locais (ConfirmationService, etc.), usar overrideProvider no configureTestBed. Sempre detectChanges apos Subject.next() e apos click em p-button.
