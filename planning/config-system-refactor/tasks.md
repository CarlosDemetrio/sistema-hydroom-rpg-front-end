# Tasks: Refatoração do Sistema de Configurações

## 📋 Overview

Este documento organiza as tasks para refatoração completa do sistema de configurações do front-end, garantindo integração correta com o backend e o conceito de "Jogo Ativo".

## 🎯 Objetivo

Corrigir e padronizar todas as 13 configurações para:
1. **Enviar `jogoId`** em todas as requisições
2. **Integrar com `CurrentGameService`** para pegar o jogo ativo
3. **Validar dados** conforme contratos do backend (api.json)
4. **Seguir padrões** do projeto (Signals, inject, standalone)

## 🏛️ Nova Arquitetura (Com Genéricos)

```
┌─────────────────────────────────────────────────────────────┐
│                    CAMADA DE APRESENTAÇÃO                   │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐  │
│  │ Atributos Comp │  │ Aptidoes Comp  │  │  Classes...  │  │
│  │ (extends Base) │  │ (extends Base) │  │ (extends...) │  │
│  └────────┬───────┘  └────────┬───────┘  └──────┬───────┘  │
└───────────┼──────────────────┼─────────────────┼───────────┘
            │                  │                 │
            └──────────────────┼─────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │  ConfigFacadeService │
                    │   (Thin - Delega)   │
                    └──────────┬──────────┘
                               │
         ┌─────────────────────┼─────────────────────┐
         │                     │                     │
┌────────▼──────────┐ ┌────────▼──────────┐ ┌──────▼────────┐
│ AtributoConfig    │ │ AptidaoConfig     │ │ ClasseConfig  │
│ Service           │ │ Service           │ │ Service...    │
│ (extends Base)    │ │ (extends Base)    │ │ (extends...)  │
└────────┬──────────┘ └────────┬──────────┘ └──────┬────────┘
         └─────────────────────┼─────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │ BaseConfigService<T>│ ◄── INFRAESTRUTURA
                    │  (Generic/Reusable) │     GENÉRICA (INF-0)
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
    ┌─────────▼─────────┐ ┌───▼───────┐ ┌─────▼──────────┐
    │ CurrentGameService│ │ConfigApi  │ │  Interfaces    │
    │  (jogoId atual)   │ │ Service   │ │  Base + DTOs   │
    └───────────────────┘ └───────────┘ └────────────────┘
```

### 🎁 Benefícios da Arquitetura Genérica

- ✅ **73% menos código** (2.600 → 690 linhas)
- ✅ **Consistência total** entre todas as 13 configurações
- ✅ **Type-safe** com TypeScript genéricos
- ✅ **Fácil manutenção** - mudança em um lugar afeta todos
- ✅ **Rápida implementação** - cada service/componente tem ~25 linhas
- ✅ **Testável** - testa a base uma vez, todos herdam

## 📦 Tipos de Configuração

| # | Configuração | Endpoint | Schema | Status | Detalhes |
|---|--------------|----------|--------|--------|----------|
| 1 | Atributos | `/configuracoes/atributos` | `AtributoConfig` | ✅ Planejado | [Ver Task](./tasks/01-atributos.md) |
| 2 | Aptidões | `/configuracoes/aptidoes` | `AptidaoConfig` | ✅ Planejado | [Ver Task](./tasks/02-aptidoes.md) |
| 3 | Níveis | `/configuracoes/niveis` | `NivelConfig` | ✅ Planejado | [Ver Task](./tasks/03-niveis.md) |
| 4-13 | **Demais Configs** | (vários) | (vários) | 📝 Resumo | [Ver Resumo](./tasks/04-13-resumo-configs.md) |

### Detalhamento das Configs 4-13

As seguintes configurações estão resumidas no arquivo [04-13-resumo-configs.md](./tasks/04-13-resumo-configs.md):

- **Task 04**: Classes (`ClassePersonagem`) - 🟢 Baixa complexidade
- **Task 05**: Raças (`Raca`) - 🟢 Baixa complexidade
- **Task 06**: Vantagens (`VantagemConfig`) - 🟡 Média complexidade
- **Task 07**: Bônus (`BonusConfig`) - 🟢 Baixa complexidade
- **Task 08**: Prospecção (`DadoProspeccaoConfig`) - 🟡 Média complexidade
- **Task 09**: Presenças (`PresencaConfig`) - 🟢 Baixa complexidade
- **Task 10**: Gêneros (`GeneroConfig`) - 🟢 Baixa complexidade
- **Task 11**: Índoles (`IndoleConfig`) - 🟢 Baixa complexidade
- **Task 12**: Membros do Corpo (`MembroCorpoConfig`) - 🔴 Alta complexidade

**Nota**: Tipos de Aptidão está incluído na Task 02 (Aptidões).

## 🏗️ Tasks de Infraestrutura (Pré-requisitos)

Estas tasks devem ser executadas ANTES das tasks de configuração específicas.

### ⚠️ TASK INF-0: Infraestrutura Genérica e Reutilizável

**CRÍTICO**: Esta task deve ser executada **PRIMEIRO**, antes de INF-1, INF-2 e INF-3.

**Descrição**: Criar interfaces, classes abstratas, templates e utilitários genéricos que serão reutilizados por TODAS as 13 configurações. Isso reduz ~73% do código repetitivo e garante consistência total.

**Detalhes**: [Ver Task Completa](./tasks/00-infrastructure-generic.md)

**Issues**:
- #INF-0.1: Criar Interfaces Base (`BaseConfig`, `JogoScopedConfig`, `NamedConfig`)
- #INF-0.2: Criar DTOs Genéricos (`CreateConfigDto<T>`, `UpdateConfigDto<T>`)
- #INF-0.3: Criar Classe Abstrata `BaseConfigService<T>`
- #INF-0.4: Criar Interface `IConfigComponent<T>`
- #INF-0.5: Criar Classe Abstrata `BaseConfigComponent<T,S>`
- #INF-0.6: Criar Template Base Reutilizável
- #INF-0.7: Criar Validadores Customizados
- #INF-0.8: Criar Helpers de Formulário

**Economia**: De ~2.600 linhas para ~690 linhas de código! 🎉

---


### TASK INF-1: Criar 13 Business Services Específicos

**Tipo**: 🏗️ Infraestrutura  
**Prioridade**: CRÍTICA  
**Dependências**: **INF-0** (Infraestrutura Genérica)  
**Diretório**: `src/app/core/services/business/config/`

#### Descrição

Criar **13 Business Services específicos**, um para cada tipo de configuração. Como agora temos a classe `BaseConfigService<T>`, cada service fica **extremamente simples** - apenas estende a base e implementa os métodos abstratos.

#### Estrutura de Diretório

```
src/app/core/services/business/config/
  ├── base-config.service.ts           (criado em INF-0.3)
  ├── atributo-config.service.ts       (criar nesta task)
  ├── aptidao-config.service.ts        (criar nesta task)
  ├── tipo-aptidao-config.service.ts   (criar nesta task)
  ├── nivel-config.service.ts          (criar nesta task)
  ├── classe-config.service.ts         (criar nesta task)
  ├── raca-config.service.ts           (criar nesta task)
  ├── vantagem-config.service.ts       (criar nesta task)
  ├── bonus-config.service.ts          (criar nesta task)
  ├── prospeccao-config.service.ts     (criar nesta task)
  ├── presenca-config.service.ts       (criar nesta task)
  ├── genero-config.service.ts         (criar nesta task)
  ├── indole-config.service.ts         (criar nesta task)
  └── membro-corpo-config.service.ts   (criar nesta task)
```

#### Padrão de Implementação

Cada service é **muito simples** graças à classe base. Exemplo:

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
  
  // Alias para API mais legível (opcional mas recomendado)
  loadAtributos = () => this.loadItems();
  createAtributo = (data: CreateConfigDto<AtributoConfig>) => this.createItem(data);
  updateAtributo = (id: number, data: UpdateConfigDto<AtributoConfig>) => this.updateItem(id, data);
  deleteAtributo = (id: number) => this.deleteItem(id);
}
```

**Cada service tem apenas ~20-30 linhas!** 🎉

#### O que a Classe Base Fornece (de graça):

- ✅ Injeção de `CurrentGameService` e `ConfigApiService`
- ✅ Signals `currentGameId` e `hasCurrentGame`
- ✅ Método `ensureGameSelected()` com validação e erro claro
- ✅ Métodos CRUD genéricos: `loadItems()`, `createItem()`, `updateItem()`, `deleteItem()`
- ✅ Type-safety completo com genéricos

#### O que Cada Service Específico Faz:

1. Define o tipo genérico `T` (ex: `AtributoConfig`)
2. Implementa `getEndpointName()` para mensagens de erro
3. Implementa os 4 métodos abstratos que retornam funções do ConfigApiService
4. Opcionalmente cria alias com nomes legíveis (ex: `loadAtributos()`)

#### Benefícios

- ✅ **Consistência total**: Todos seguem exatamente o mesmo padrão
- ✅ **Código mínimo**: ~25 linhas por service ao invés de ~200
- ✅ **Type-safe**: TypeScript garante que tudo está correto
- ✅ **Testável**: Testa a base uma vez, todos herdam
- ✅ **Manutenível**: Mudança na base afeta todos instantaneamente

#### Naming Convention

- Arquivo: `{tipo}-config.service.ts` (kebab-case)
- Classe: `{Tipo}ConfigService` (PascalCase)
- Métodos alias: `load{Tipos}()`, `create{Tipo}()`, etc

#### Critérios de Aceitação

- [ ] 13 Business Services criados, um para cada configuração
- [ ] Todos estendem `BaseConfigService<T>` com tipo correto
- [ ] Todos com `@Injectable({ providedIn: 'root' })`
- [ ] Todos implementam os 5 métodos abstratos
- [ ] Todos têm alias de métodos com nomes legíveis
- [ ] Nenhuma lógica duplicada (tudo na base)
- [ ] Documentação JSDoc no cabeçalho de cada classe
- [ ] Imports corretos de interfaces e DTOs

#### Sub-issues por Service

- [ ] #INF-1.1: Criar `AtributoConfigService`
- [ ] #INF-1.2: Criar `AptidaoConfigService`
- [ ] #INF-1.3: Criar `TipoAptidaoConfigService`
- [ ] #INF-1.4: Criar `NivelConfigService`
- [ ] #INF-1.5: Criar `ClasseConfigService`
- [ ] #INF-1.6: Criar `RacaConfigService`
- [ ] #INF-1.7: Criar `VantagemConfigService`
- [ ] #INF-1.8: Criar `BonusConfigService`
- [ ] #INF-1.9: Criar `ProspeccaoConfigService`
- [ ] #INF-1.10: Criar `PresencaConfigService`
- [ ] #INF-1.11: Criar `GeneroConfigService`
- [ ] #INF-1.12: Criar `IndoleConfigService`
- [ ] #INF-1.13: Criar `MembroCorpoConfigService`

---


### TASK INF-2: Atualizar ConfigApiService para aceitar jogoId

**Tipo**: 🔧 Correção de Endpoint  
**Prioridade**: CRÍTICA  
**Dependências**: Nenhuma (pode ser paralela a INF-1)  
**Arquivo**: `src/app/core/services/api/config-api.service.ts`

#### Descrição

Atualizar TODOS os métodos do ConfigApiService para aceitar `jogoId` como parâmetro e enviá-lo corretamente nas requisições. O backend SEMPRE requer `jogoId` nas requisições de configuração.

#### Problema Atual

Os métodos atuais **NÃO** enviam `jogoId`:
- `listAtributos()` não tem parâmetro `jogoId`
- `createAtributo(config)` não inclui `jogoId` no body
- Isso causa erro 400 (Bad Request) no backend

#### Solução

**Para métodos GET (listar)**:
- Adicionar parâmetro `jogoId: number`
- Enviar como query parameter: `?jogoId=X`
- Usar `HttpParams` do Angular

**Para métodos POST (criar)**:
- Adicionar parâmetro `jogoId: number`
- Incluir `jogoId` no body do request
- Spread operator: `{ ...config, jogoId }`

**Para métodos PUT/DELETE**:
- Não precisam de `jogoId` (usam o ID direto da entidade)
- Manter assinatura atual

#### Contratos Backend (do api.json)

Todos os endpoints GET exigem `jogoId` query param:
- `GET /api/v1/configuracoes/atributos?jogoId={id}`
- `GET /api/v1/configuracoes/aptidoes?jogoId={id}`
- ... (e assim por diante para todos)

Todos os endpoints POST exigem `jogoId` no body:
- O backend espera `jogo` (objeto completo) no schema
- Frontend deve enviar `jogoId` que o backend converte

#### Critérios de Aceitação

- [ ] TODOS os métodos `list*` aceitam parâmetro `jogoId: number`
- [ ] TODOS os métodos `list*` enviam `?jogoId=X` na URL
- [ ] TODOS os métodos `create*` aceitam parâmetro `jogoId: number`
- [ ] TODOS os métodos `create*` incluem `jogoId` no body
- [ ] Métodos `update*` e `delete*` mantidos como estão
- [ ] Tipagem TypeScript correta mantida
- [ ] Imports de `HttpParams` adicionados se necessário

#### Sub-issues por Configuração

- [ ] #INF-2.1: Atualizar endpoints de Atributos
- [ ] #INF-2.2: Atualizar endpoints de Aptidões
- [ ] #INF-2.3: Atualizar endpoints de Tipos de Aptidão
- [ ] #INF-2.4: Atualizar endpoints de Níveis
- [ ] #INF-2.5: Atualizar endpoints de Classes
- [ ] #INF-2.6: Atualizar endpoints de Raças
- [ ] #INF-2.7: Atualizar endpoints de Vantagens
- [ ] #INF-2.8: Atualizar endpoints de Bônus
- [ ] #INF-2.9: Atualizar endpoints de Prospecção
- [ ] #INF-2.10: Atualizar endpoints de Presenças
- [ ] #INF-2.11: Atualizar endpoints de Gêneros
- [ ] #INF-2.12: Atualizar endpoints de Índoles
- [ ] #INF-2.13: Atualizar endpoints de Membros do Corpo

---


### TASK INF-3: Criar ConfigFacadeService (Orquestrador Leve)

**Tipo**: 🏗️ Infraestrutura  
**Prioridade**: ALTA  
**Dependências**: INF-1 (Business Services específicos)  
**Arquivo**: `src/app/features/mestre/services/config-facade.service.ts`

#### Descrição

Criar um Facade Service **leve** para orquestrar os 13 Business Services específicos. Este facade serve apenas como **ponto de entrada único** para os componentes, delegando todas as operações para os services específicos.

#### Princípio: Thin Facade / Fat Services

- **Facade = Thin (Leve)**: Apenas delega, não tem lógica
- **Business Services = Fat (Ricos)**: Contêm toda a lógica e chamadas API

#### Responsabilidades do Facade

1. **Injetar os 13 Business Services específicos**
2. **Expor estado global**: `currentGameId`, `hasCurrentGame` (de qualquer um dos services)
3. **Delegar operações**: Cada método chama o service específico
4. **Coordenar** (futuro): Se precisar combinar múltiplos services

#### Estrutura Esperada

**Injeções** (13 services):
- `atributoService = inject(AtributoConfigService)`
- `aptidaoService = inject(AptidaoConfigService)`
- `tipoAptidaoService = inject(TipoAptidaoConfigService)`
- ... (e assim por diante para os 13 tipos)

**Signals expostos** (reutiliza de qualquer service):
- `currentGameId = this.atributoService.currentGameId`
- `hasCurrentGame = this.atributoService.hasCurrentGame`

**Métodos delegados** (exemplos):
- `loadAtributos()` → `this.atributoService.loadAtributos()`
- `createAtributo(data)` → `this.atributoService.createAtributo(data)`
- `loadAptidoes()` → `this.aptidaoService.loadAptidoes()`
- `createAptidao(data)` → `this.aptidaoService.createAptidao(data)`

**Métodos de coordenação** (opcional):
- `loadAllBasicConfigs()`: Usa `forkJoin` para carregar múltiplos tipos de uma vez
- Útil para páginas que precisam de vários tipos simultaneamente

#### Por que usar Facade?

- ✅ **Componentes mais simples**: Injetam apenas o facade
- ✅ **Flexibilidade**: Se a estrutura interna mudar, componentes não precisam saber
- ✅ **Testabilidade**: Mock único do facade nos testes de componente
- ✅ **Descobribilidade**: Desenvolvedor sabe que ConfigFacade tem tudo
- ✅ **Coordenação**: Lugar natural para operações que envolvem múltiplos tipos

#### Exemplo de Uso no Componente

```
Component injeta apenas:
- configFacade = inject(ConfigFacadeService)

Component usa:
- configFacade.hasCurrentGame() para verificar estado
- configFacade.loadAtributos() para carregar
- configFacade.createAtributo(data) para criar
```

Componente **NÃO** precisa conhecer:
- AtributoConfigService
- ConfigApiService
- CurrentGameService

#### Critérios de Aceitação

- [ ] Service criado com `@Injectable({ providedIn: 'root' })`
- [ ] Usa `inject()` para injetar os 13 Business Services
- [ ] Expõe signals: `currentGameId`, `hasCurrentGame`
- [ ] Métodos delegados para TODAS as operações dos 13 tipos
- [ ] Método `loadAllBasicConfigs()` usando `forkJoin` (opcional)
- [ ] **NENHUMA lógica de negócio** - apenas delegação
- [ ] **NENHUMA chamada HTTP direta** - sempre delega
- [ ] Documentação clara de quais métodos cada tipo oferece

#### Sub-issues

- [ ] #INF-3.1: Criar estrutura básica e injetar os 13 services
- [ ] #INF-3.2: Expor signals de estado
- [ ] #INF-3.3: Adicionar métodos delegados para Atributos
- [ ] #INF-3.4: Adicionar métodos delegados para Aptidões e Tipos
- [ ] #INF-3.5: Adicionar métodos delegados para Níveis
- [ ] #INF-3.6: Adicionar métodos delegados para Classes e Raças
- [ ] #INF-3.7: Adicionar métodos delegados para Vantagens e Bônus
- [ ] #INF-3.8: Adicionar métodos delegados para Prospecção e Presenças
- [ ] #INF-3.9: Adicionar métodos delegados para Gêneros, Índoles e Membros
- [ ] #INF-3.10: Adicionar método `loadAllBasicConfigs()` (opcional)
- [ ] #INF-3.11: Adicionar testes unitários do facade

---

## TASK 4: 📝 Atualizar Componente Atributos Config

### Descrição
Refatorar componente de Atributos para usar o novo sistema de serviços e incluir todas as validações.

### Arquivos a Modificar
- `src/app/features/mestre/pages/config/configs/atributos-config.component.ts`

### Issues Relacionadas

#### Issue #4.1: 🔧 Corrigir integração com ConfigFacadeService
**Mudanças**:
```typescript
export class AtributosConfigComponent implements OnInit {
  private configFacade = inject(ConfigFacadeService);
  private messageService = inject(MessageService);
  private destroyRef = inject(DestroyRef);
  
  items = signal<AtributoConfig[]>([]);
  loading = signal(false);
  
  // Verifica se há jogo
  hasGame = this.configFacade.hasCurrentGame;
  
  ngOnInit() {
    if (!this.hasGame()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Aviso',
        detail: 'Selecione um jogo no cabeçalho para gerenciar configurações'
      });
      return;
    }
    this.loadData();
  }
  
  private loadData() {
    this.loading.set(true);
    this.configFacade.loadAtributos()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (items) => {
          this.items.set(items);
          this.loading.set(false);
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Falha ao carregar atributos'
          });
          this.loading.set(false);
        }
      });
  }
}
```

#### Issue #4.2: 📝 Adicionar validações no formulário
**Validações a implementar**:
- **nome**: Required, minLength(3), maxLength(50)
- **abreviacao**: Required, minLength(2), maxLength(5), pattern(/^[A-Z]+$/)
- **ordem**: Required, min(1), validador customizado de unicidade
- **formulaCalculo**: Optional, validador de sintaxe customizado
- **ativo**: Boolean default true

**Código**:
```typescript
private buildForm(): FormGroup {
  return this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
    abreviacao: ['', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(5),
      Validators.pattern(/^[A-Z]+$/)
    ]],
    ordem: [1, [Validators.required, Validators.min(1)]],
    formulaCalculo: [''],
    ativo: [true]
  });
}
```

#### Issue #4.3: 📝 Adicionar mensagens de validação no template
**Template**:
```html
<div>
  <label class="block font-semibold mb-2">Abreviação *</label>
  <input pInputText formControlName="abreviacao" class="w-full" />
  @if (form.get('abreviacao')?.invalid && form.get('abreviacao')?.touched) {
    <small class="text-red-500">
      @if (form.get('abreviacao')?.errors?.['required']) {
        Abreviação é obrigatória
      }
      @if (form.get('abreviacao')?.errors?.['pattern']) {
        Use apenas letras maiúsculas (ex: FOR)
      }
    </small>
  }
</div>
```

#### Issue #4.4: 🔧 Adicionar indicador de jogo atual
**Template (no topo)**:
```html
<div class="flex align-items-center gap-2 mb-3 p-3 bg-primary-50 border-round">
  <i class="pi pi-book text-primary"></i>
  <span class="font-semibold text-primary">
    Configurando Jogo: {{ currentGameService.currentGame()?.nome }}
  </span>
</div>
```

### Critérios de Aceitação
- [ ] Componente usa ConfigFacadeService
- [ ] Verifica jogo selecionado antes de carregar
- [ ] Todas validações implementadas
- [ ] Mensagens de erro claras no formulário
- [ ] Indicador de jogo atual visível
- [ ] Loading state funcional

---

## TASK 5: 📝 Atualizar Componente Aptidões Config

### Descrição
Refatorar componente de Aptidões com integração ao novo sistema e validações.

### Arquivos a Modificar
- `src/app/features/mestre/pages/config/configs/aptidoes-config.component.ts`

### Issues Relacionadas

#### Issue #5.1: 🔧 Corrigir integração com ConfigFacadeService
Similar ao #4.1, adaptar para Aptidões

#### Issue #5.2: 📝 Adicionar validações no formulário
**Validações**:
- **nome**: Required, minLength(3), maxLength(100)
- **descricao**: Optional, maxLength(500)
- **tipoAptidaoId**: Required (select)
- **atributoBaseId**: Required (select)
- **ordem**: Required, min(1)
- **ativo**: Boolean default true

#### Issue #5.3: 📝 Carregar selects de Tipos e Atributos
**Implementação**:
```typescript
tiposAptidao = signal<TipoAptidao[]>([]);
atributos = signal<AtributoConfig[]>([]);

ngOnInit() {
  forkJoin({
    tipos: this.configFacade.loadTiposAptidao(),
    atributos: this.configFacade.loadAtributos()
  }).pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe(({ tipos, atributos }) => {
      this.tiposAptidao.set(tipos);
      this.atributos.set(atributos);
    });
}
```

#### Issue #5.4: 📝 Template com selects
**Template**:
```html
<div>
  <label class="block font-semibold mb-2">Tipo de Aptidão *</label>
  <p-select
    [options]="tiposAptidao()"
    formControlName="tipoAptidaoId"
    optionLabel="nome"
    optionValue="id"
    placeholder="Selecione o tipo"
    class="w-full"
  />
</div>
```

### Critérios de Aceitação
- [ ] Integração com facade funcional
- [ ] Selects carregam dados do jogo atual
- [ ] Validações implementadas
- [ ] UI com PrimeNG Select

---

## TASK 6: 📝 Atualizar Componente Níveis Config

### Descrição
Refatorar componente de Níveis com validações especiais de progressão.

### Arquivos a Modificar
- `src/app/features/mestre/pages/config/configs/niveis-config.component.ts`

### Issues Relacionadas

#### Issue #6.1: 🔧 Corrigir integração com ConfigFacadeService
Similar aos anteriores

#### Issue #6.2: 📝 Adicionar validações no formulário
**Validações**:
- **nivel**: Required, min(1), validador de unicidade
- **xpNecessario**: Required, min(0), validador de progressão crescente
- **pontosAtributo**: Required, min(0)
- **pontosAptidao**: Required, min(0)
- **ativo**: Boolean default true

#### Issue #6.3: 📝 Validador customizado de XP crescente
**Implementação**:
```typescript
private validarXpCrescente(items: NivelConfig[]): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const nivel = control.parent?.get('nivel')?.value;
    const xp = control.value;
    
    const nivelAnterior = items.find(n => n.nivel === nivel - 1);
    if (nivelAnterior && xp <= nivelAnterior.xpNecessario) {
      return { xpNaoCrescente: true };
    }
    return null;
  };
}
```

#### Issue #6.4: 📝 Exibir progressão de níveis em tabela
**Template** com coluna adicional mostrando progressão:
```html
<th>Progressão</th>
<!-- ... -->
<td>
  @if (item.nivel > 1) {
    <span class="text-green-500">+{{ calcularDiferenca(item) }} XP</span>
  }
</td>
```

### Critérios de Aceitação
- [ ] Validação de XP crescente funcional
- [ ] Não permite XP menor que nível anterior
- [ ] Tabela mostra progressão visual
- [ ] Todas validações numéricas ok

---

## TASK 7: 📝 Atualizar Componentes Classes e Raças

### Descrição
Refatorar componentes de Classes e Raças que têm campo JSON de bonusAtributos.

### Arquivos a Modificar
- `src/app/features/mestre/pages/config/configs/classes-config.component.ts`
- `src/app/features/mestre/pages/config/configs/racas-config.component.ts`

### Issues Relacionadas

#### Issue #7.1: 🔧 Corrigir integração - Classes
#### Issue #7.2: 🔧 Corrigir integração - Raças

#### Issue #7.3: 📝 Adicionar validações - Classes
**Validações**:
- **nome**: Required, minLength(3), maxLength(100)
- **descricao**: Optional, maxLength(1000)
- **pontosVidaBase**: Required, min(1)
- **bonusAtributos**: JSON válido
- **ordem**: Required, min(1)
- **ativo**: Boolean

#### Issue #7.4: 📝 Adicionar validações - Raças
Similar ao #7.3

#### Issue #7.5: 📝 Editor de Bonus de Atributos (Shared)
**Criar componente reutilizável**:
`src/app/shared/components/bonus-atributos-editor/bonus-atributos-editor.component.ts`

```typescript
@Component({
  selector: 'app-bonus-atributos-editor',
  standalone: true,
  // ...
  template: `
    <div class="grid">
      @for (atributo of atributos(); track atributo.id) {
        <div class="col-12 md:col-6 lg:col-4">
          <label class="block font-semibold mb-2">{{ atributo.nome }}</label>
          <p-inputnumber
            [(ngModel)]="bonusValues[atributo.id!]"
            [showButtons]="true"
            [min]="-10"
            [max]="10"
            (ngModelChange)="onChange()"
          />
        </div>
      }
    </div>
  `
})
export class BonusAtributosEditorComponent {
  atributos = input.required<AtributoConfig[]>();
  bonusAtributos = model<Record<number, number>>({});
  
  bonusValues: Record<number, number> = {};
  
  ngOnInit() {
    this.bonusValues = { ...this.bonusAtributos() };
  }
  
  onChange() {
    this.bonusAtributos.set(this.bonusValues);
  }
}
```

#### Issue #7.6: 📝 Integrar editor nos componentes
Usar o editor compartilhado em Classes e Raças

### Critérios de Aceitação
- [ ] Componente de edição de bonus reutilizável
- [ ] Validação de JSON
- [ ] Interface amigável para editar bonus
- [ ] Funciona em Classes e Raças

---

## TASK 8: 📝 Atualizar Componente Vantagens Config

### Descrição
Refatorar componente de Vantagens com categorias e custo negativo para desvantagens.

### Arquivos a Modificar
- `src/app/features/mestre/pages/config/configs/vantagens-config.component.ts`

### Issues Relacionadas

#### Issue #8.1: 🔧 Corrigir integração com ConfigFacadeService

#### Issue #8.2: 📝 Adicionar validações no formulário
**Validações**:
- **nome**: Required, minLength(3), maxLength(100)
- **descricao**: Optional, maxLength(1000)
- **custo**: Required, pode ser negativo (desvantagens)
- **categoriaId**: Required (select)
- **efeitos**: JSON opcional
- **ordem**: Required, min(1)
- **ativo**: Boolean

#### Issue #8.3: 📝 Carregar categorias de vantagem
```typescript
categorias = signal<CategoriaVantagem[]>([]);

ngOnInit() {
  this.configFacade.loadCategoriasVantagem()
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe(cats => this.categorias.set(cats));
}
```

#### Issue #8.4: 📝 Indicador visual de Vantagem/Desvantagem
**Template**:
```html
<td>
  @if (item.custo >= 0) {
    <span class="text-green-600 font-bold">+{{ item.custo }}</span>
    <small class="text-color-secondary ml-1">Vantagem</small>
  } @else {
    <span class="text-red-600 font-bold">{{ item.custo }}</span>
    <small class="text-color-secondary ml-1">Desvantagem</small>
  }
</td>
```

#### Issue #8.5: 📝 Filtros por categoria
Adicionar filtro dropdown para filtrar por categoria

### Critérios de Aceitação
- [ ] Custo aceita valores negativos
- [ ] Visual diferencia vantagem de desvantagem
- [ ] Select de categorias funcional
- [ ] Filtro por categoria implementado

---

## TASK 9: 📝 Atualizar Componentes Prospecção e Presenças

### Descrição
Refatorar componentes de Prospecção (dados) e Presenças (auras).

### Arquivos a Modificar
- `src/app/features/mestre/pages/config/configs/prospeccao-config.component.ts`
- `src/app/features/mestre/pages/config/configs/presencas-config.component.ts`

### Issues Relacionadas

#### Issue #9.1: 🔧 Corrigir integração - Prospecção
#### Issue #9.2: 🔧 Corrigir integração - Presenças

#### Issue #9.3: 📝 Adicionar validações - Prospecção
**Validações**:
- **nome**: Required, minLength(3), maxLength(100)
- **descricao**: Optional, maxLength(500)
- **tipoDado**: Required, enum (d4, d6, d8, d10, d12, d20, d100)
- **modificador**: Required, número inteiro
- **ordem**: Required, min(1)
- **ativo**: Boolean

#### Issue #9.4: 📝 Select de tipos de dado
**Template**:
```html
<p-select
  [options]="tiposDado"
  formControlName="tipoDado"
  placeholder="Selecione o tipo de dado"
>
  <ng-template #item let-tipo>
    <i class="pi pi-box mr-2"></i>{{ tipo }}
  </ng-template>
</p-select>
```

```typescript
tiposDado = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'];
```

#### Issue #9.5: 📝 Adicionar validações - Presenças
**Validações**:
- **nome**: Required, minLength(3), maxLength(100)
- **descricao**: Optional, maxLength(1000)
- **efeito**: Required, maxLength(500)
- **custoAtivacao**: Optional, número
- **ordem**: Required, min(1)
- **ativo**: Boolean

### Critérios de Aceitação
- [ ] Select de dados com ícones
- [ ] Validações numéricas corretas
- [ ] Campos de efeito/custo validados

---

## TASK 10: 📝 Atualizar Componentes Gêneros e Limitadores

### Descrição
Refatorar componentes de Gêneros e Limitadores (configurações mais simples).

### Arquivos a Modificar
- `src/app/features/mestre/pages/config/configs/generos-config.component.ts`
- `src/app/features/mestre/pages/config/configs/limitadores-config.component.ts`

### Issues Relacionadas

#### Issue #10.1: 🔧 Corrigir integração - Gêneros
#### Issue #10.2: 🔧 Corrigir integração - Limitadores

#### Issue #10.3: 📝 Adicionar validações - Gêneros
**Validações**:
- **nome**: Required, minLength(2), maxLength(50), único por jogo
- **descricao**: Optional, maxLength(200)
- **ordem**: Required, min(1)
- **ativo**: Boolean

#### Issue #10.4: 📝 Adicionar validações - Limitadores
**Validações**:
- **nome**: Required, minLength(3), maxLength(100)
- **descricao**: Optional, maxLength(500)
- **valorLimite**: Conditional (required se não tiver fórmula)
- **formulaCalculo**: Conditional (required se não tiver valor)
- **ordem**: Required, min(1)
- **ativo**: Boolean

#### Issue #10.5: 📝 Validador condicional - Limitadores
Um dos dois deve estar preenchido: valorLimite OU formulaCalculo

```typescript
private validarLimitador(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const valor = group.get('valorLimite')?.value;
    const formula = group.get('formulaCalculo')?.value;
    
    if (!valor && !formula) {
      return { limitadorInvalido: 'Preencha Valor Limite OU Fórmula' };
    }
    return null;
  };
}
```

### Critérios de Aceitação
- [ ] Gêneros valida unicidade de nome
- [ ] Limitadores valida valor OU fórmula
- [ ] Mensagens de erro claras

---

## TASK 11: ✅ Testes de Integração e Documentação

### Descrição
Criar testes E2E para fluxos completos e documentar o novo sistema.

### Issues Relacionadas

#### Issue #11.1: ✅ Testes E2E - Fluxo completo de CRUD
**Cenário**: Criar/Editar/Deletar Atributo
```typescript
describe('Atributos Config E2E', () => {
  it('deve criar atributo com jogo selecionado', () => {
    // 1. Login como Mestre
    // 2. Selecionar jogo
    // 3. Navegar para /mestre/config/atributos
    // 4. Clicar em "Novo Atributo"
    // 5. Preencher formulário
    // 6. Salvar
    // 7. Verificar que apareceu na lista
  });
  
  it('deve exibir aviso se não houver jogo selecionado', () => {
    // 1. Login
    // 2. Desselecionar jogo (se possível)
    // 3. Navegar para configs
    // 4. Verificar mensagem de aviso
  });
});
```

#### Issue #11.2: ✅ Testes E2E - Mudança de jogo
**Cenário**: Trocar jogo e verificar reload
```typescript
it('deve recarregar configs ao trocar jogo', () => {
  // 1. Login, selecionar Jogo A
  // 2. Ver atributos do Jogo A
  // 3. Trocar para Jogo B no header
  // 4. Verificar que exibe atributos do Jogo B
});
```

#### Issue #11.3: ✅ Testes unitários - ConfigBusinessService
```typescript
describe('ConfigBusinessService', () => {
  it('deve lançar erro se não houver jogo selecionado', () => {
    // Mock currentGameId retornando null
    // Chamar loadAtributos
    // Esperar erro
  });
});
```

#### Issue #11.4: 📚 Atualizar ARCHITECTURE.md
Documentar novo fluxo de configurações:
- Camadas de serviços
- Fluxo de dados
- Integração com CurrentGameService

#### Issue #11.5: 📚 Criar guia de uso para Mestre
Documentar em `docs/MESTRE_CONFIG_GUIDE.md`:
- Como acessar configurações
- Como criar/editar cada tipo
- Validações e regras de negócio
- Troubleshooting

### Critérios de Aceitação
- [ ] Todos os fluxos E2E passando
- [ ] Cobertura de testes > 80%
- [ ] Documentação atualizada
- [ ] Guia do usuário criado

---

## 📊 Resumo de Issues por Task

| Task | Descrição | Total Issues | 🏗️ Infra | 🔧 Endpoint | 📝 Form | ✅ Test |
|------|-----------|--------------|-----------|-------------|---------|---------|
| INF-0 | Infraestrutura Genérica | 8 | 8 | 0 | 0 | 0 |
| INF-1 | Business Services | 13 | 13 | 0 | 0 | 0 |
| INF-2 | Atualizar ConfigApiService | 13 | 0 | 13 | 0 | 0 |
| INF-3 | ConfigFacadeService | 11 | 11 | 0 | 0 | 0 |
| 4 | Atributos Component | 4 | 0 | 2 | 2 | 0 |
| 5 | Aptidões Component | 4 | 0 | 1 | 3 | 0 |
| 6 | Níveis Component | 4 | 0 | 1 | 3 | 0 |
| 7 | Classes e Raças | 6 | 0 | 2 | 4 | 0 |
| 8 | Vantagens Component | 5 | 0 | 1 | 4 | 0 |
| 9 | Prospecção e Presenças | 5 | 0 | 2 | 3 | 0 |
| 10 | Gêneros e Limitadores | 5 | 0 | 2 | 3 | 0 |
| 11 | Testes e Docs | 5 | 0 | 0 | 0 | 5 |
| **TOTAL** | | **83** | **32** | **24** | **22** | **5** |

---

## 🚀 Ordem de Execução Recomendada

### Sprint 0: Infraestrutura Genérica (CRÍTICO - PRIMEIRO)
- **Dia 1-2**: Task INF-0 (Criar toda infraestrutura genérica reutilizável)
  - Interfaces base, DTOs, classes abstratas
  - Validadores e helpers
  - Template base
  - **Sem isso, as outras tasks não podem começar**

### Sprint 1: Fundação (Tasks INF-1, INF-2, INF-3)
- **Semana 1**: Task INF-1 (13 Business Services) + INF-2 (ConfigApiService)
  - Agora super rápido graças à classe base!
- **Semana 2**: Task INF-3 (ConfigFacadeService)

### Sprint 2: Configs Base (Tasks 4-6)
- **Semana 3**: Task 4 (Atributos)
- **Semana 3**: Task 5 (Aptidões)
- **Semana 4**: Task 6 (Níveis)

### Sprint 3: Configs Avançadas (Tasks 7-10)
- **Semana 5**: Task 7 (Classes e Raças)
- **Semana 5**: Task 8 (Vantagens)
- **Semana 6**: Task 9 (Prospecção e Presenças)
- **Semana 6**: Task 10 (Gêneros e Limitadores)

### Sprint 4: Qualidade (Task 11)
- **Semana 7**: Testes e Documentação

**Total**: ~7 semanas (reduzido de ~8-9 semanas graças à infraestrutura genérica)

---

## 📝 Checklist Geral

### Antes de Começar
- [ ] Revisar spec.md completo
- [ ] Entender fluxo de CurrentGameService
- [ ] Configurar ambiente de testes

### Durante Implementação
- [ ] Seguir padrões do projeto (Signals, inject, standalone)
- [ ] Testar cada issue antes de commitar
- [ ] Validar no browser com DevTools

### Após Conclusão
- [ ] Todos os testes passando
- [ ] Sem erros no console
- [ ] Documentação atualizada
- [ ] Code review aprovado
