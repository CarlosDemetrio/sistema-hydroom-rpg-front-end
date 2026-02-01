# 🎯 Boas Práticas RxJS - Como Usar Facade com Observables

**Data**: 2026-02-01  
**Status**: ✅ PADRÃO CORRETO IMPLEMENTADO

---

## ✅ Arquitetura Correta

```
Component → Facade (Observable) → API Service (Observable) → Backend
               ↓ tap(Store.setState())
          | async pipe OU subscribe/unsubscribe
```

---

## 📋 Regras de Ouro

### ✅ DO (Fazer)

#### 1. **Facade SEMPRE retorna Observable**
```typescript
// ✅ CORRETO - Facade retorna Observable
createJogo(data: CreateJogoDto): Observable<Jogo> {
  return this.jogosApi.createJogo(data).pipe(
    tap(novoJogo => this.jogosStore.addJogo(novoJogo))
  );
}
```

#### 2. **Component usa | async pipe (PREFERIDO)**
```typescript
// ✅ MELHOR - Auto unsubscribe
@Component({
  template: `
    @if (jogo$ | async; as jogo) {
      <div>{{ jogo.nome }}</div>
    }
  `
})
export class JogoDetailComponent {
  jogo$: Observable<Jogo>;
  
  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    this.jogo$ = this.facade.loadJogo(id);
  }
}
```

#### 3. **Component subscribe manualmente (quando necessário)**
```typescript
// ✅ CORRETO - Gerencia subscriptions manualmente
@Component({
  template: `<div>{{ jogo()?.nome }}</div>`
})
export class JogoFormComponent implements OnDestroy {
  private facade = inject(JogoManagementFacadeService);
  private subscriptions: Subscription[] = [];
  
  jogo = signal<Jogo | null>(null);
  
  ngOnInit() {
    const sub = this.facade.loadJogo(1).subscribe({
      next: (jogo) => this.jogo.set(jogo),
      error: (err) => console.error(err)
    });
    this.subscriptions.push(sub);
  }
  
  onSubmit() {
    const sub = this.facade.createJogo(this.form.value).subscribe({
      next: (jogo) => {
        this.router.navigate(['/jogos', jogo.id]);
      }
    });
    this.subscriptions.push(sub);
  }
  
  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
```

#### 4. **Usar takeUntilDestroyed (Angular 16+)**
```typescript
// ✅ MELHOR AINDA - Auto unsubscribe com DestroyRef
@Component({})
export class MyComponent {
  private facade = inject(JogoManagementFacadeService);
  private destroyRef = inject(DestroyRef);
  
  ngOnInit() {
    this.facade.loadJogos().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (jogos) => console.log(jogos)
    });
  }
}
```

---

### ❌ DON'T (Evitar)

#### 1. **NUNCA use await/async com lastValueFrom sem cleanup**
```typescript
// ❌ ERRADO - Memory leak potencial
async loadJogo() {
  const jogo = await lastValueFrom(this.facade.loadJogo(1));
  // Se component for destruído durante await, subscription fica aberta
}
```

#### 2. **NUNCA subscribe sem unsubscribe**
```typescript
// ❌ ERRADO - Memory leak garantido
ngOnInit() {
  this.facade.loadJogos().subscribe(jogos => {
    this.jogos.set(jogos);
  });
  // Esqueceu de guardar subscription e fazer unsubscribe
}
```

#### 3. **NUNCA use firstValueFrom em loop/repetidamente**
```typescript
// ❌ ERRADO - Cria múltiplas subscriptions
async loadMultiple() {
  for (let id of ids) {
    const jogo = await firstValueFrom(this.facade.loadJogo(id));
    // Múltiplas HTTP requests sequenciais
  }
}

// ✅ CORRETO - Usa forkJoin ou combineLatest
loadMultiple() {
  const requests = ids.map(id => this.facade.loadJogo(id));
  return forkJoin(requests).pipe(
    takeUntilDestroyed(this.destroyRef)
  ).subscribe(jogos => {
    // Todas as requests em paralelo
  });
}
```

---

## 📝 Exemplos Completos

### Exemplo 1: Component com | async pipe

```typescript
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { JogoManagementFacadeService } from './services';
import { Jogo } from './models';

@Component({
  selector: 'app-jogos-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      @if (jogos$ | async; as jogos) {
        @for (jogo of jogos; track jogo.id) {
          <div>{{ jogo.nome }}</div>
        }
      }
      
      @if (facade.loading() | async) {
        <div>Carregando...</div>
      }
    </div>
  `
})
export class JogosListComponent implements OnInit {
  facade = inject(JogoManagementFacadeService);
  jogos$!: Observable<Jogo[]>;
  
  ngOnInit() {
    // async pipe gerencia unsubscribe automaticamente
    this.jogos$ = this.facade.loadJogos();
  }
}
```

### Exemplo 2: Component com Subscription manual

```typescript
import { Component, inject, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { JogoManagementFacadeService } from './services';
import { Router } from '@angular/router';

@Component({
  selector: 'app-jogo-form',
  standalone: true,
  template: `
    <form (submit)="onSubmit()">
      <!-- form fields -->
      <button type="submit" [disabled]="isSubmitting()">
        {{ isEditMode() ? 'Atualizar' : 'Criar' }}
      </button>
    </form>
  `
})
export class JogoFormComponent implements OnDestroy {
  private facade = inject(JogoManagementFacadeService);
  private router = inject(Router);
  private subscriptions: Subscription[] = [];
  
  isSubmitting = signal(false);
  isEditMode = signal(false);
  
  onSubmit() {
    this.isSubmitting.set(true);
    
    const sub = this.facade.createJogo(this.form.value).subscribe({
      next: (jogo) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Jogo criado!'
        });
        this.router.navigate(['/jogos', jogo.id]);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        // Error já foi tratado pelo interceptor
      },
      complete: () => {
        this.isSubmitting.set(false);
      }
    });
    
    this.subscriptions.push(sub);
  }
  
  ngOnDestroy() {
    // Limpa todas as subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
```

### Exemplo 3: Component com takeUntilDestroyed (Recomendado)

```typescript
import { Component, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { JogoManagementFacadeService } from './services';

@Component({
  selector: 'app-jogo-detail',
  standalone: true,
  template: `
    <div>
      <h1>{{ jogo()?.nome }}</h1>
    </div>
  `
})
export class JogoDetailComponent {
  private facade = inject(JogoManagementFacadeService);
  private destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);
  
  jogo = signal<Jogo | null>(null);
  
  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    
    // takeUntilDestroyed gerencia unsubscribe automaticamente
    this.facade.loadJogo(id).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (jogo) => this.jogo.set(jogo)
    });
  }
}
```

---

## 🎯 Benefícios do Padrão Correto

### 1. **Sem Memory Leaks**
- ✅ | async pipe: unsubscribe automático
- ✅ takeUntilDestroyed: unsubscribe quando component destruído
- ✅ Manual unsubscribe: controle total

### 2. **Cancelamento de Requests**
```typescript
// Se component for destruído, HTTP request é cancelado automaticamente
this.facade.loadJogos().pipe(
  takeUntilDestroyed(this.destroyRef)
).subscribe();
```

### 3. **Testabilidade**
```typescript
// Fácil de mockar Observables
it('should load jogos', () => {
  const mockJogos = [{ id: 1, nome: 'Teste' }];
  spyOn(facade, 'loadJogos').and.returnValue(of(mockJogos));
  
  component.ngOnInit();
  
  expect(component.jogos$).toBeDefined();
});
```

### 4. **Composabilidade RxJS**
```typescript
// Combina múltiplos Observables facilmente
combineLatest([
  this.facade.loadJogo(1),
  this.facade.loadParticipantes(1)
]).pipe(
  takeUntilDestroyed(this.destroyRef)
).subscribe(([jogo, participantes]) => {
  // ...
});
```

---

## 📊 Checklist de Qualidade

### Facade Service
- ✅ Retorna `Observable<T>`
- ✅ Usa `tap()` para atualizar Store
- ✅ NÃO usa `async/await`
- ✅ NÃO usa `lastValueFrom/firstValueFrom`

### Component
- ✅ Usa `| async` pipe (PREFERIDO)
- ✅ OU usa `takeUntilDestroyed()`
- ✅ OU guarda subscriptions e faz unsubscribe no `ngOnDestroy`
- ✅ NUNCA subscribe sem cleanup

### Store
- ✅ Métodos SÍNCRONOS apenas
- ✅ NÃO faz chamadas HTTP
- ✅ APENAS atualiza estado

### API Service
- ✅ Retorna `Observable<T>`
- ✅ NÃO usa `async/await`
- ✅ HttpClient já retorna Observable

---

**Status**: ✅ **PADRÃO RxJS CORRETO IMPLEMENTADO**

**Próximo**: Atualizar todos os Components para usar o padrão correto
