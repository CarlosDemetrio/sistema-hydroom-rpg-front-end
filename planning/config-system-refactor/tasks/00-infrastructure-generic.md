# TASK INF-0: Criar Infraestrutura Genérica e Reutilizável

**Tipo**: 🏗️ Infraestrutura Base  
**Prioridade**: CRÍTICA ⚠️  
**Dependências**: Nenhuma (deve ser executada PRIMEIRO)  
**Diretório Base**: `src/app/core/services/business/config/`

---

## 🎯 Resumo Executivo

Esta task cria a **fundação genérica** que será reutilizada por TODAS as 13 configurações do sistema. Ao invés de repetir código em cada service e componente, criamos classes abstratas, interfaces e utilitários que reduzem **73% do código total** (de ~2.600 linhas para ~690 linhas).

### Por que Fazer Isso Primeiro?

- ⚠️ **Bloqueante**: Tasks INF-1, INF-2, INF-3 e Tasks 4-10 dependem desta
- 🎯 **Eficiência**: Sem isso, teríamos que escrever 2.600 linhas repetitivas
- ✅ **Qualidade**: Garante consistência total entre todas as configurações
- 🚀 **Velocidade**: Depois desta task, cada service leva 15 minutos ao invés de 2 horas

### O que Será Criado?

1. **Interfaces Base** (`BaseConfig`, `JogoScopedConfig`, `NamedConfig`)
2. **DTOs Genéricos** (`CreateConfigDto<T>`, `UpdateConfigDto<T>`)
3. **Classe Base de Service** (`BaseConfigService<T>`) - 90% do código comum
4. **Interface de Componente** (`IConfigComponent<T>`) - contrato
5. **Classe Base de Componente** (`BaseConfigComponent<T,S>`) - 85% do código comum
6. **Template Base** (`base-config-template.html`) - HTML reutilizável
7. **Validadores** (`uniqueOrderValidator`, `uniqueNameValidator`, etc)
8. **Form Helpers** (`markFormGroupTouched`, `getErrorMessage`)

### Economia de Código

| Sem Genéricos | Com Genéricos | Economia |
|----------------|---------------|----------|
| ~200 linhas/service × 13 | ~300 linhas (base) + 25 × 13 | **-73%** |
| ~150 linhas/component × 13 | ~400 linhas (base) + 40 × 13 | **-69%** |
| **Total: 4.550 linhas** | **Total: 1.245 linhas** | **-73%** 🎉 |

---

## 📋 Overview

Criar interfaces, classes abstratas e utilitários genéricos que serão reutilizados por TODOS os 13 tipos de configuração. Isso garante:
- ✅ **Consistência**: Todos seguem o mesmo padrão
- ✅ **Redução de código**: Menos duplicação
- ✅ **Manutenibilidade**: Mudanças em um lugar afetam todos
- ✅ **Type Safety**: TypeScript garante contratos corretos

---

## Issue #INF-0.1: Criar Interfaces Base

**Arquivo**: `src/app/core/models/config-base.model.ts`

### Descrição

Criar interfaces base que representam a estrutura comum de TODAS as entidades de configuração.

### Interfaces a Criar

#### 1. `BaseConfig` - Interface base para todas as configs

Representa os campos que TODAS as configurações têm:

```typescript
/**
 * Interface base para todas as entidades de configuração
 * Todos os tipos de configuração (Atributo, Aptidão, etc) estendem desta interface
 */
export interface BaseConfig {
  id?: number;                    // ID da entidade (opcional na criação)
  ativo: boolean;                 // Flag de ativo/inativo (soft delete)
  createdAt?: Date;               // Data de criação (gerenciado pelo backend)
  updatedAt?: Date;               // Data de atualização (gerenciado pelo backend)
  ordemExibicao?: number;         // Ordem de exibição na lista
}
```

#### 2. `JogoScopedConfig` - Para configs vinculadas a um jogo

Estende `BaseConfig` adicionando referência ao jogo:

```typescript
/**
 * Interface para configurações que pertencem a um jogo específico
 * 99% das configs são deste tipo
 */
export interface JogoScopedConfig extends BaseConfig {
  jogoId?: number;                // ID do jogo (obrigatório no backend)
  jogo?: Jogo;                    // Objeto Jogo completo (populado pelo backend)
}
```

#### 3. `NamedConfig` - Para configs com nome

Estende `JogoScopedConfig` adicionando nome:

```typescript
/**
 * Interface para configurações que têm nome
 * A maioria das configs (Atributo, Aptidão, Classe, etc) são deste tipo
 */
export interface NamedConfig extends JogoScopedConfig {
  nome: string;                   // Nome da configuração (obrigatório)
  descricao?: string;             // Descrição opcional
}
```

### Exemplo de Uso

Cada tipo de configuração estende uma destas interfaces:

```typescript
// AtributoConfig estende NamedConfig e adiciona campos específicos
export interface AtributoConfig extends NamedConfig {
  abreviacao: string;
  formulaImpeto?: string;
  valorMinimo?: number;
  valorMaximo?: number;
}

// AptidaoConfig também estende NamedConfig
export interface AptidaoConfig extends NamedConfig {
  tipoAptidaoId: number;
  tipoAptidao?: TipoAptidao;
}
```

### Critérios de Aceitação

- [ ] Interface `BaseConfig` criada com campos comuns
- [ ] Interface `JogoScopedConfig` criada estendendo BaseConfig
- [ ] Interface `NamedConfig` criada estendendo JogoScopedConfig
- [ ] Documentação JSDoc completa em cada interface
- [ ] Exportado no barrel file `src/app/core/models/index.ts`

---

## Issue #INF-0.2: Criar DTOs Genéricos

**Arquivo**: `src/app/core/models/dtos/config-base.dto.ts`

### Descrição

Criar tipos utilitários para operações CRUD (Create, Update) que funcionam com qualquer tipo de configuração.

### DTOs a Criar

#### 1. `CreateConfigDto<T>` - Para criação

```typescript
/**
 * DTO genérico para criar qualquer tipo de configuração
 * Remove campos gerenciados pelo backend (id, createdAt, updatedAt, jogo)
 * Adiciona jogoId como obrigatório
 */
export type CreateConfigDto<T extends JogoScopedConfig> = Omit<
  T,
  'id' | 'createdAt' | 'updatedAt' | 'jogo'
> & {
  jogoId: number; // jogoId obrigatório na criação
};
```

Exemplo de uso:
```typescript
type CreateAtributoDto = CreateConfigDto<AtributoConfig>;
// Result: { nome: string, abreviacao: string, jogoId: number, ... }
```

#### 2. `UpdateConfigDto<T>` - Para atualização

```typescript
/**
 * DTO genérico para atualizar qualquer tipo de configuração
 * Todos os campos são opcionais (Partial)
 * Remove campos que não podem ser atualizados
 */
export type UpdateConfigDto<T extends BaseConfig> = Partial<
  Omit<T, 'id' | 'createdAt' | 'updatedAt' | 'jogo' | 'jogoId'>
>;
```

Exemplo de uso:
```typescript
type UpdateAtributoDto = UpdateConfigDto<AtributoConfig>;
// Result: { nome?: string, abreviacao?: string, ativo?: boolean, ... }
```

### Critérios de Aceitação

- [ ] `CreateConfigDto<T>` criado e documentado
- [ ] `UpdateConfigDto<T>` criado e documentado
- [ ] Tipos funcionam com todas as interfaces de config
- [ ] Exportado no barrel file

---

## Issue #INF-0.3: Criar Classe Abstrata Base para Business Services

**Arquivo**: `src/app/core/services/business/config/base-config.service.ts`

### Descrição

Criar uma classe abstrata que implementa TODA a lógica comum dos Business Services. Cada service específico apenas estende esta classe e define seu tipo.

### Classe Abstrata: `BaseConfigService<T>`

```typescript
/**
 * Classe abstrata base para todos os Business Services de configuração
 * 
 * Implementa:
 * - Integração com CurrentGameService
 * - Validação de jogo selecionado
 * - Métodos CRUD genéricos
 * - Exposição de signals de estado
 * 
 * Cada service específico apenas:
 * - Estende esta classe
 * - Define o tipo genérico T
 * - Implementa métodos abstratos
 * 
 * @template T - Tipo da configuração (AtributoConfig, AptidaoConfig, etc)
 */
@Injectable()
export abstract class BaseConfigService<T extends JogoScopedConfig> {
  // Injeções comuns
  protected currentGameService = inject(CurrentGameService);
  protected configApi = inject(ConfigApiService);
  
  // Signals expostos (iguais para todos)
  currentGameId = this.currentGameService.currentGameId;
  hasCurrentGame = this.currentGameService.hasCurrentGame;
  
  // Métodos abstratos (cada service implementa)
  protected abstract getEndpointName(): string;
  protected abstract getApiListMethod(): (jogoId: number) => Observable<T[]>;
  protected abstract getApiCreateMethod(): (jogoId: number, data: any) => Observable<T>;
  protected abstract getApiUpdateMethod(): (id: number, data: any) => Observable<T>;
  protected abstract getApiDeleteMethod(): (id: number) => Observable<void>;
  
  // Validação de jogo (implementada aqui, usada por todos)
  protected ensureGameSelected(): number {
    const jogoId = this.currentGameId();
    if (!jogoId) {
      throw new Error(
        `Nenhum jogo selecionado. Selecione um jogo no cabeçalho para gerenciar ${this.getEndpointName()}.`
      );
    }
    return jogoId;
  }
  
  // Métodos CRUD genéricos (implementados aqui, usados por todos)
  loadItems(): Observable<T[]> {
    const jogoId = this.ensureGameSelected();
    return this.getApiListMethod()(jogoId);
  }
  
  createItem(data: CreateConfigDto<T>): Observable<T> {
    const jogoId = this.ensureGameSelected();
    return this.getApiCreateMethod()(jogoId, data);
  }
  
  updateItem(id: number, data: UpdateConfigDto<T>): Observable<T> {
    return this.getApiUpdateMethod()(id, data);
  }
  
  deleteItem(id: number): Observable<void> {
    return this.getApiDeleteMethod()(id);
  }
}
```

### Como Usar (Exemplo)

Um service específico fica muito simples:

```typescript
@Injectable({ providedIn: 'root' })
export class AtributoConfigService extends BaseConfigService<AtributoConfig> {
  
  protected getEndpointName(): string {
    return 'Atributos';
  }
  
  protected getApiListMethod() {
    return this.configApi.listAtributos.bind(this.configApi);
  }
  
  protected getApiCreateMethod() {
    return this.configApi.createAtributo.bind(this.configApi);
  }
  
  protected getApiUpdateMethod() {
    return this.configApi.updateAtributo.bind(this.configApi);
  }
  
  protected getApiDeleteMethod() {
    return this.configApi.deleteAtributo.bind(this.configApi);
  }
  
  // Alias para API mais legível (opcional)
  loadAtributos = () => this.loadItems();
  createAtributo = (data: CreateConfigDto<AtributoConfig>) => this.createItem(data);
  updateAtributo = (id: number, data: UpdateConfigDto<AtributoConfig>) => this.updateItem(id, data);
  deleteAtributo = (id: number) => this.deleteItem(id);
}
```

### Benefícios

- ✅ **90% do código está na classe base** - não se repete
- ✅ **Type-safe** - TypeScript garante que tudo está correto
- ✅ **Fácil adicionar funcionalidade** - adiciona na base, todos herdam
- ✅ **Testável** - testa a base uma vez, todos herdam comportamento

### Critérios de Aceitação

- [ ] Classe abstrata `BaseConfigService<T>` criada
- [ ] Injeções de `CurrentGameService` e `ConfigApiService`
- [ ] Signals `currentGameId` e `hasCurrentGame` expostos
- [ ] Método `ensureGameSelected()` implementado
- [ ] Métodos CRUD genéricos implementados
- [ ] Métodos abstratos definidos para subclasses
- [ ] Documentação JSDoc completa
- [ ] Decorator `@Injectable()` (sem providedIn, cada subclasse define)

---

## Issue #INF-0.4: Criar Interface de Componente Base

**Arquivo**: `src/app/shared/interfaces/config-component.interface.ts`

### Descrição

Criar interface que define o contrato que TODOS os componentes de configuração devem seguir.

### Interface: `IConfigComponent<T>`

```typescript
/**
 * Interface que define o contrato para componentes de configuração
 * Garante consistência entre todos os componentes
 * 
 * IMPORTANTE:
 * - Loading é gerenciado pelo LoadingInterceptor (global)
 * - Erros são tratados pelo ErrorInterceptor (global)
 * - Toasts são gerenciados pelo ToastService (global)
 * 
 * @template T - Tipo da configuração (AtributoConfig, AptidaoConfig, etc)
 */
export interface IConfigComponent<T extends JogoScopedConfig> {
  // Estado local
  items: Signal<T[]>;                           // Lista de itens
  dialogVisible: WritableSignal<boolean>;       // Visibilidade do dialog
  editMode: Signal<boolean>;                    // Modo edição ou criação
  form: FormGroup;                              // Formulário reativo
  
  // Referências do jogo
  hasGame: Signal<boolean>;                     // Se há jogo selecionado
  currentGameId: Signal<number | null>;         // ID do jogo atual
  currentGameName: Signal<string | undefined>;  // Nome do jogo atual
  
  // Métodos de ciclo de vida
  ngOnInit(): void;
  
  // Métodos CRUD (sem tratamento de erro - delegado para interceptors)
  loadData(): void;                             // Carrega lista
  openDialog(item?: T): void;                   // Abre dialog (criar ou editar)
  closeDialog(): void;                          // Fecha dialog
  save(): void;                                 // Salva (create ou update)
  confirmDelete(id: number): void;              // Confirma exclusão
  delete(id: number): void;                     // Executa exclusão
  
  // Utilitários
  buildForm(): FormGroup;                       // Constrói o formulário
  resetForm(): void;                            // Reseta o formulário
}
```

### Critérios de Aceitação

- [ ] Interface `IConfigComponent<T>` criada
- [ ] Todas propriedades e métodos documentados
- [ ] Genérico `T` com constraint `extends JogoScopedConfig`
- [ ] Exportado no barrel file

---

## Issue #INF-0.5: Criar Classe Abstrata Base para Componentes

**Arquivo**: `src/app/shared/components/base-config/base-config.component.ts`

### Descrição

Criar classe abstrata que implementa lógica comum de TODOS os componentes de configuração. Esta classe **NÃO** gerencia toast, loading ou tratamento de erros - isso é delegado para interceptors globais.

### Responsabilidades

**O que a classe faz**:
- ✅ Gerencia estado local (items, dialogVisible, editMode)
- ✅ Integra com Business Service específico
- ✅ Gerencia ciclo de vida do formulário
- ✅ Valida jogo selecionado
- ✅ Delega operações CRUD para o service

**O que a classe NÃO faz** (delegado para interceptors):
- ❌ **Loading**: `LoadingInterceptor` gerencia automaticamente
- ❌ **Erros**: `ErrorInterceptor` captura e exibe toast automaticamente
- ❌ **Toast de sucesso**: `ToastService` global gerencia

### Arquitetura de Mensagens do Projeto

```
HTTP Request
    ↓
LoadingInterceptor (mostra loading global)
    ↓
ErrorInterceptor (captura erros, exibe toast)
    ↓
ToastService (toast global via signals)
```

Componentes **NÃO** devem:
- Injetar `MessageService` do PrimeNG
- Gerenciar estado de `loading` local
- Fazer tratamento de erro em subscribe

### Classe Abstrata: `BaseConfigComponent<T, S>`

```typescript
/**
 * Classe abstrata base para componentes de configuração
 * 
 * IMPORTANTE: 
 * - Loading é gerenciado pelo LoadingInterceptor (global)
 * - Erros são tratados pelo ErrorInterceptor (global)
 * - Toasts são gerenciados pelo ToastService (global)
 * - Componentes apenas delegam para services e atualizam estado local
 * 
 * Implementa:
 * - Ciclo de vida padrão
 * - Métodos CRUD genéricos (sem tratamento de erro)
 * - Integração com services
 * - Gerenciamento de formulário
 * - Validação de jogo selecionado
 * 
 * @template T - Tipo da configuração (AtributoConfig, etc)
 * @template S - Tipo do service (AtributoConfigService, etc)
 */
@Directive() // Usar @Directive() ao invés de @Component() para classes abstratas
export abstract class BaseConfigComponent<
  T extends JogoScopedConfig,
  S extends BaseConfigService<T>
> implements IConfigComponent<T>, OnInit {
  
  // Injeções comuns (REMOVIDO MessageService e ConfirmationService)
  protected destroyRef = inject(DestroyRef);
  protected fb = inject(FormBuilder);
  protected toastService = inject(ToastService); // Toast global do projeto
  
  // Service específico (cada subclasse injeta o seu)
  protected abstract service: S;
  
  // Estado local (REMOVIDO loading - gerenciado por interceptor)
  items = signal<T[]>([]);
  dialogVisible = signal(false);
  editMode = signal(false);
  currentEditId = signal<number | null>(null);
  
  // Referências do jogo
  hasGame = computed(() => this.service.hasCurrentGame());
  currentGameId = computed(() => this.service.currentGameId());
  currentGameName = computed(() => {
    // Assumindo que CurrentGameService expõe currentGame
    return this.service.currentGame?.()?.nome;
  });
  
  // Formulário (cada subclasse implementa buildForm)
  form!: FormGroup;
  
  // Métodos abstratos (cada subclasse implementa)
  protected abstract buildForm(): FormGroup;
  protected abstract getEntityName(): string; // Ex: "Atributo"
  protected abstract getEntityNamePlural(): string; // Ex: "Atributos"
  
  // ngOnInit (implementado aqui)
  ngOnInit(): void {
    this.form = this.buildForm();
    
    if (!this.hasGame()) {
      this.toastService.warn(
        'Aviso',
        `Selecione um jogo no cabeçalho para gerenciar ${this.getEntityNamePlural()}`
      );
      return;
    }
    
    this.loadData();
  }
  
  // loadData (implementado aqui - SEM tratamento de erro)
  loadData(): void {
    // LoadingInterceptor gerencia loading automaticamente
    // ErrorInterceptor gerencia erros automaticamente
    this.service.loadItems()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (items) => {
          this.items.set(items);
          // Sucesso: não precisa toast (operação de leitura)
        }
        // Não precisa error handler - ErrorInterceptor cuida
      });
  }
  
  // openDialog (implementado aqui)
  openDialog(item?: T): void {
    if (item?.id) {
      this.editMode.set(true);
      this.currentEditId.set(item.id);
      this.form.patchValue(item);
    } else {
      this.editMode.set(false);
      this.currentEditId.set(null);
      this.resetForm();
    }
    this.dialogVisible.set(true);
  }
  
  // closeDialog (implementado aqui)
  closeDialog(): void {
    this.dialogVisible.set(false);
    this.resetForm();
  }
  
  // save (implementado aqui - SEM tratamento de erro)
  save(): void {
    if (this.form.invalid) {
      markFormGroupTouched(this.form); // Helper do INF-0.8
      this.toastService.warn('Atenção', 'Preencha todos os campos obrigatórios');
      return;
    }
    
    const data = this.form.value;
    const operation$ = this.editMode()
      ? this.service.updateItem(this.currentEditId()!, data)
      : this.service.createItem(data);
    
    // LoadingInterceptor gerencia loading
    // ErrorInterceptor gerencia erros
    operation$.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          // Sucesso: exibe toast
          const action = this.editMode() ? 'atualizado' : 'criado';
          this.toastService.success(
            'Sucesso',
            `${this.getEntityName()} ${action} com sucesso`
          );
          this.closeDialog();
          this.loadData();
        }
        // Não precisa error handler - ErrorInterceptor cuida
      });
  }
  
  // confirmDelete (implementado aqui - USA ConfirmationService do PrimeNG)
  confirmDelete(id: number): void {
    // Nota: ConfirmationService é usado apenas para confirmação, não para toasts
    // Cada componente deve injetar ConfirmationService
    // Esta é uma exceção - confirmação é UI, não mensagem de erro/sucesso
    
    // Subclasses devem implementar este método se usarem confirmação
    // Ou podemos usar um dialog service customizado do projeto
    this.delete(id);
  }
  
  // delete (implementado aqui - SEM tratamento de erro)
  delete(id: number): void {
    this.service.deleteItem(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toastService.success(
            'Sucesso',
            `${this.getEntityName()} excluído com sucesso`
          );
          this.loadData();
        }
        // Não precisa error handler - ErrorInterceptor cuida
      });
  }
  
  // resetForm (implementado aqui)
  resetForm(): void {
    this.form.reset();
    this.form.markAsUntouched();
    this.form.markAsPristine();
  }
}
```

### Como Usar (Exemplo)

Um componente específico fica muito simples:

```typescript
@Component({
  selector: 'app-atributos-config',
  standalone: true,
  imports: [/* PrimeNG modules */],
  providers: [ConfirmationService], // Apenas para dialog de confirmação
  templateUrl: './atributos-config.component.html'
})
export class AtributosConfigComponent extends BaseConfigComponent<
  AtributoConfig,
  AtributoConfigService
> {
  protected service = inject(AtributoConfigService);
  private confirmationService = inject(ConfirmationService); // Para dialogs
  
  protected getEntityName(): string {
    return 'Atributo';
  }
  
  protected getEntityNamePlural(): string {
    return 'Atributos';
  }
  
  protected buildForm(): FormGroup {
    return this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      abreviacao: ['', [Validators.required, Validators.pattern(/^[A-Z]+$/)]],
      ordemExibicao: [1, [Validators.required, Validators.min(1)]],
      ativo: [true]
    });
  }
  
  // Sobrescreve confirmDelete para usar ConfirmationService
  override confirmDelete(id: number): void {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir este ${this.getEntityName()}?`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      accept: () => this.delete(id)
    });
  }
}
```

### Integração com Interceptors Globais

#### 1. LoadingInterceptor

Já existe no projeto e gerencia loading automaticamente:
- Detecta requisições HTTP
- Mostra loading spinner global
- Esconde quando resposta chega

**Componentes não precisam fazer nada** - loading é automático.

#### 2. ErrorInterceptor

Já existe no projeto e gerencia erros:
- Captura erros HTTP (4xx, 5xx)
- Exibe toast de erro via `ToastService`
- Log de erros no console (dev)

**Componentes não precisam try/catch** - erros são capturados globalmente.

#### 3. ToastService

Service global do projeto (via Signals):
- `toastService.success(title, message)`
- `toastService.error(title, message)`
- `toastService.warn(title, message)`
- `toastService.info(title, message)`

**Componentes usam apenas para sucesso** - erros são automáticos.

### Benefícios desta Abordagem

- ✅ **Separação de responsabilidades**: Componente não sabe de HTTP/erros
- ✅ **Menos código**: Não precisa error handlers em todo subscribe
- ✅ **Consistência**: Todos os erros tratados da mesma forma
- ✅ **Testabilidade**: Fácil mockar ToastService
- ✅ **Manutenibilidade**: Mudança em mensagens = um lugar só

### Critérios de Aceitação

- [ ] Classe abstrata `BaseConfigComponent<T, S>` criada
- [ ] Decorator `@Directive()` aplicado
- [ ] Implementa interface `IConfigComponent<T>`
- [ ] **NÃO** injeta `MessageService` do PrimeNG
- [ ] **NÃO** gerencia estado de `loading` local
- [ ] **NÃO** tem error handlers em subscribes
- [ ] Injeta `ToastService` global do projeto
- [ ] Usa `toastService.success()` apenas para operações de sucesso
- [ ] Delega loading e erros para interceptors
- [ ] Documentação JSDoc completa
- [ ] Comentários explicando a arquitetura

---

## Issue #INF-0.6: Criar Template Base Reutilizável

**Arquivo**: `src/app/shared/components/base-config/base-config-template.html`

### Descrição

Criar um template HTML reutilizável que serve de base para TODOS os componentes de configuração. Usa `ng-content` e `ng-template` para permitir customização.

### Estrutura do Template

```html
<!-- Header com indicador de jogo -->
<div class="surface-card shadow-2 border-round p-4">
  
  <!-- Indicador de Jogo Atual -->
  @if (hasGame()) {
    <div class="flex align-items-center gap-2 mb-3 p-3 bg-primary-50 border-round">
      <i class="pi pi-book text-primary"></i>
      <span class="font-semibold text-primary">
        <ng-content select="[gameIndicator]"></ng-content>
      </span>
    </div>
  }
  
  <!-- Header com título e botão -->
  <div class="flex align-items-center justify-content-between mb-4">
    <div>
      <h2 class="text-2xl font-bold m-0 mb-2">
        <ng-content select="[title]"></ng-content>
      </h2>
      <p class="text-color-secondary m-0">
        <ng-content select="[subtitle]"></ng-content>
      </p>
    </div>
    <p-button
      icon="pi pi-plus"
      [label]="'Novo ' + getEntityName()"
      (onClick)="openDialog()"
      [disabled]="!hasGame()"
    />
  </div>
  
  <!-- REMOVIDO: Loading state (gerenciado por LoadingInterceptor global) -->
  
  <!-- Tabela (customizável via ng-content) -->
  <p-table
    [value]="items()"
    [paginator]="true"
    [rows]="10"
  >
    <!-- Slot para colunas customizadas -->
    <ng-content select="[tableColumns]"></ng-content>
  </p-table>
  
  <!-- Dialog (customizável via ng-content) -->
  <p-dialog
    [(visible)]="dialogVisible"
    [header]="editMode() ? 'Editar ' + getEntityName() : 'Novo ' + getEntityName()"
    [modal]="true"
  >
    <form [formGroup]="form" (ngSubmit)="save()">
      
      <!-- Slot para campos customizados -->
      <ng-content select="[formFields]"></ng-content>
      
      <!-- Botões do formulário (padrão) -->
      <div class="flex justify-content-end gap-2 mt-4">
        <p-button
          label="Cancelar"
          severity="secondary"
          (onClick)="closeDialog()"
          [outlined]="true"
        />
        <p-button
          label="Salvar"
          type="submit"
          [disabled]="form.invalid"
        />
      </div>
    </form>
  </p-dialog>
  
  <!-- ConfirmDialog (apenas para confirmações, NÃO para toasts) -->
  <p-confirmDialog></p-confirmDialog>
  
  <!-- REMOVIDO: p-toast (ToastService global gerencia) -->
</div>
```

### Notas sobre o Template

#### Loading

- **REMOVIDO**: Spinner local `<p-progressSpinner />`
- **MOTIVO**: `LoadingInterceptor` gerencia loading global automaticamente
- **RESULTADO**: Todas requisições HTTP mostram loading automático

#### Toast

- **REMOVIDO**: `<p-toast>` local
- **MOTIVO**: `ToastService` global gerencia toasts via signals
- **RESULTADO**: Toast único no `app.component.html` para toda aplicação

#### ConfirmDialog

- **MANTIDO**: `<p-confirmDialog>` para confirmações
- **MOTIVO**: Confirmação é UI/UX, não mensagem de erro/sucesso
- **NOTA**: Componentes devem injetar `ConfirmationService` do PrimeNG

### Como Usar no Componente Específico

**Componente TypeScript**:

```typescript
@Component({
  selector: 'app-atributos-config',
  standalone: true,
  imports: [/* PrimeNG modules, BaseConfigTemplate */],
  providers: [ConfirmationService], // APENAS ConfirmationService
  templateUrl: './atributos-config.component.html'
})
export class AtributosConfigComponent extends BaseConfigComponent<
  AtributoConfig,
  AtributoConfigService
> {
  protected service = inject(AtributoConfigService);
  private confirmationService = inject(ConfirmationService);
  
  // IMPORTANTE: ToastService é global - NÃO injetar aqui
  // IMPORTANTE: Loading é automático - NÃO gerenciar aqui
  
  protected getEntityName(): string {
    return 'Atributo';
  }
  
  protected getEntityNamePlural(): string {
    return 'Atributos';
  }
  
  protected buildForm(): FormGroup {
    return this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      abreviacao: ['', [Validators.required, Validators.pattern(/^[A-Z]+$/)]],
      ordemExibicao: [1, [Validators.required, Validators.min(1)]],
      ativo: [true]
    });
  }
  
  // Sobrescreve para usar ConfirmationService
  override confirmDelete(id: number): void {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir este ${this.getEntityName()}?`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      accept: () => this.delete(id)
    });
  }
}
```

**Template HTML**:

```html
<!-- atributos-config.component.html -->
<app-base-config-template>
  
  <!-- Título -->
  <ng-container title>
    <i class="pi pi-star text-primary mr-2"></i>
    Atributos
  </ng-container>
  
  <!-- Subtítulo -->
  <ng-container subtitle>
    Configure os atributos base do sistema (FOR, DES, CON, etc.)
  </ng-container>
  
  <!-- Indicador de jogo -->
  <ng-container gameIndicator>
    Configurando: {{ currentGameName() }}
  </ng-container>
  
  <!-- Colunas da tabela -->
  <ng-container tableColumns>
    <ng-template #header>
      <tr>
        <th>Nome</th>
        <th>Abreviação</th>
        <th>Ordem</th>
        <th style="width: 150px">Ações</th>
      </tr>
    </ng-template>
    <ng-template #body let-item>
      <tr>
        <td>{{ item.nome }}</td>
        <td>{{ item.abreviacao }}</td>
        <td>{{ item.ordemExibicao }}</td>
        <td>
          <p-button icon="pi pi-pencil" (onClick)="openDialog(item)" />
          <p-button icon="pi pi-trash" (onClick)="confirmDelete(item.id)" />
        </td>
      </tr>
    </ng-template>
  </ng-container>
  
  <!-- Campos do formulário -->
  <ng-container formFields>
    <div class="flex flex-column gap-3">
      <div>
        <label>Nome *</label>
        <input pInputText formControlName="nome" class="w-full" />
      </div>
      <div>
        <label>Abreviação *</label>
        <input pInputText formControlName="abreviacao" class="w-full" />
      </div>
    </div>
  </ng-container>
  
</app-base-config-template>
```

### Critérios de Aceitação

- [ ] Template base criado com estrutura padrão
- [ ] Slots `ng-content` para customização
- [ ] Header com indicador de jogo
- [ ] Botão "Novo" com disable quando sem jogo
- [ ] Loading state com spinner
- [ ] Dialog com título dinâmico
- [ ] ConfirmDialog e Toast incluídos
- [ ] Documentação de uso

---

## Issue #INF-0.7: Criar Utilitários de Validação

**Arquivo**: `src/app/shared/validators/config-validators.ts`

### Descrição

Criar validadores customizados reutilizáveis para formulários de configuração.

### Validadores a Criar

#### 1. `uniqueOrderValidator` - Valida ordem única

```typescript
/**
 * Validador que garante que a ordem de exibição é única
 * 
 * @param existingItems - Lista de itens existentes
 * @param currentItemId - ID do item atual (null se criando)
 */
export function uniqueOrderValidator<T extends BaseConfig>(
  existingItems: T[],
  currentItemId: number | null = null
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const ordem = control.value;
    if (!ordem) return null;
    
    const duplicate = existingItems.find(
      item => item.ordemExibicao === ordem && item.id !== currentItemId
    );
    
    return duplicate ? { uniqueOrder: 'Esta ordem já está em uso' } : null;
  };
}
```

#### 2. `uniqueNameValidator` - Valida nome único

```typescript
/**
 * Validador que garante que o nome é único no jogo
 */
export function uniqueNameValidator<T extends NamedConfig>(
  existingItems: T[],
  currentItemId: number | null = null
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const nome = control.value;
    if (!nome) return null;
    
    const duplicate = existingItems.find(
      item => item.nome.toLowerCase() === nome.toLowerCase() && item.id !== currentItemId
    );
    
    return duplicate ? { uniqueName: 'Este nome já está em uso' } : null;
  };
}
```

#### 3. `uppercaseValidator` - Valida maiúsculas

```typescript
/**
 * Validador que garante que o texto está em maiúsculas
 */
export function uppercaseValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;
    
    return value === value.toUpperCase() 
      ? null 
      : { uppercase: 'Deve estar em maiúsculas' };
  };
}
```

#### 4. `progressiveValueValidator` - Valida valores crescentes

```typescript
/**
 * Validador para garantir que valores são progressivos (ex: XP de níveis)
 * 
 * @param items - Lista ordenada de itens
 * @param field - Campo a validar
 * @param currentIndex - Índice atual
 */
export function progressiveValueValidator<T>(
  items: T[],
  field: keyof T,
  currentIndex: number
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value || currentIndex === 0) return null;
    
    const previousItem = items[currentIndex - 1];
    if (!previousItem) return null;
    
    const previousValue = previousItem[field] as number;
    
    return value > previousValue 
      ? null 
      : { progressive: `Deve ser maior que ${previousValue}` };
  };
}
```

### Critérios de Aceitação

- [ ] Validadores criados e exportados
- [ ] Documentação JSDoc completa
- [ ] Genéricos com type safety
- [ ] Mensagens de erro descritivas
- [ ] Testes unitários dos validadores

---

## Issue #INF-0.8: Criar Helpers de Formulário

**Arquivo**: `src/app/shared/utils/form-helpers.ts`

### Descrição

Criar funções auxiliares para manipulação de formulários.

### Helpers a Criar

#### 1. `markFormGroupTouched` - Marca todos os campos como touched

```typescript
/**
 * Marca todos os campos de um FormGroup como touched
 * Útil para exibir erros de validação após submit
 */
export function markFormGroupTouched(formGroup: FormGroup): void {
  Object.keys(formGroup.controls).forEach(key => {
    const control = formGroup.get(key);
    control?.markAsTouched();
    
    if (control instanceof FormGroup) {
      markFormGroupTouched(control);
    }
  });
}
```

#### 2. `getErrorMessage` - Retorna mensagem de erro formatada

```typescript
/**
 * Retorna mensagem de erro formatada para um control
 */
export function getErrorMessage(control: AbstractControl | null): string | null {
  if (!control || !control.errors) return null;
  
  const errors = control.errors;
  
  if (errors['required']) return 'Campo obrigatório';
  if (errors['minlength']) return `Mínimo de ${errors['minlength'].requiredLength} caracteres`;
  if (errors['maxlength']) return `Máximo de ${errors['maxlength'].requiredLength} caracteres`;
  if (errors['min']) return `Valor mínimo: ${errors['min'].min}`;
  if (errors['max']) return `Valor máximo: ${errors['max'].max}`;
  if (errors['pattern']) return 'Formato inválido';
  if (errors['email']) return 'Email inválido';
  if (errors['uniqueOrder']) return errors['uniqueOrder'];
  if (errors['uniqueName']) return errors['uniqueName'];
  if (errors['uppercase']) return errors['uppercase'];
  if (errors['progressive']) return errors['progressive'];
  
  return 'Valor inválido';
}
```

### Critérios de Aceitação

- [ ] Helpers criados e exportados
- [ ] Documentação JSDoc
- [ ] Cobertura de todos os validadores comuns
- [ ] Type-safe

---

## 📊 Resumo da Infraestrutura Genérica

### O que será reutilizado:

| Componente | Arquivo | Reutilizado por |
|------------|---------|-----------------|
| `BaseConfig` | `config-base.model.ts` | Todas as 13 configs |
| `CreateConfigDto<T>` | `config-base.dto.ts` | Todas as 13 configs |
| `BaseConfigService<T>` | `base-config.service.ts` | 13 Business Services |
| `BaseConfigComponent<T,S>` | `base-config.component.ts` | 13 Componentes |
| Template Base | `base-config-template.html` | 13 Componentes |
| Validadores | `config-validators.ts` | Todos os formulários |
| Form Helpers | `form-helpers.ts` | Todos os formulários |

### Economia de Código:

- **Antes**: ~200 linhas por service × 13 = **2.600 linhas**
- **Depois**: ~300 linhas (base) + (30 linhas × 13) = **690 linhas**
- **Economia**: **~73% menos código** 🎉

---

## 🎯 Ordem de Execução

1. **INF-0.1**: Interfaces Base (1-2 horas)
2. **INF-0.2**: DTOs Genéricos (1 hora)
3. **INF-0.3**: BaseConfigService (3-4 horas)
4. **INF-0.4**: IConfigComponent (1 hora)
5. **INF-0.5**: BaseConfigComponent (4-5 horas)
6. **INF-0.6**: Template Base (2-3 horas)
7. **INF-0.7**: Validadores (2 horas)
8. **INF-0.8**: Form Helpers (1 hora)

**Total estimado**: 15-20 horas

---

## ✅ Critérios de Aceitação Global

- [ ] Todas as interfaces e classes base criadas
- [ ] Documentação JSDoc completa em tudo
- [ ] Exemplos de uso documentados
- [ ] Testes unitários da infraestrutura base
- [ ] Validado com pelo menos 1 configuração (Atributos)
- [ ] Código compila sem erros TypeScript
- [ ] Segue padrões do projeto (Signals, inject, standalone)
