# TASK 01: Atributos - Implementação Completa

**Tipo**: 📝 Componente de Configuração  
**Prioridade**: ALTA  
**Dependências**: INF-0, INF-1, INF-2, INF-3  
**Estimativa**: 4 horas

---

## 📋 Visão Geral

Implementar o componente completo de **Atributos** (FOR, DES, CON, INT, SAB, CAR, etc.) usando a infraestrutura genérica criada em INF-0.

## 🎯 Contrato Backend (api.json)

### Schema: `AtributoConfig`

```json
{
  "id": "integer(int64)",
  "jogo": "Jogo (object)",
  "nome": "string (maxLength: 50, required)",
  "abreviacao": "string (minLength: 2, maxLength: 5)",
  "descricao": "string (maxLength: 500)",
  "formulaImpeto": "string (maxLength: 100)",
  "descricaoImpeto": "string (maxLength: 200)",
  "valorMinimo": "integer(int32)",
  "valorMaximo": "integer(int32)",
  "ordemExibicao": "integer(int32)",
  "ativo": "boolean",
  "createdAt": "date-time",
  "updatedAt": "date-time"
}
```

**Campos obrigatórios**: `jogo`, `nome`

### Endpoints

| Método | Endpoint | Query/Body | Descrição |
|--------|----------|------------|-----------|
| GET | `/api/v1/configuracoes/atributos` | `?jogoId={id}` | Lista atributos do jogo |
| GET | `/api/v1/configuracoes/atributos/{id}` | - | Busca atributo por ID |
| POST | `/api/v1/configuracoes/atributos` | Body com `jogoId` | Cria novo atributo |
| PUT | `/api/v1/configuracoes/atributos/{id}` | Body | Atualiza atributo |
| DELETE | `/api/v1/configuracoes/atributos/{id}` | - | Soft delete (ativo=false) |

---

## Issue #01.1: Criar AtributoConfigService

**Arquivo**: `src/app/core/services/business/config/atributo-config.service.ts`

### Descrição

Criar Business Service específico para Atributos que estende `BaseConfigService<AtributoConfig>`.

### Responsabilidades

- Estender `BaseConfigService<AtributoConfig>`
- Implementar os 5 métodos abstratos
- Criar alias de métodos com nomes legíveis
- Integrar com `ConfigApiService` e `CurrentGameService` (via classe base)

### Estrutura Esperada

```
AtributoConfigService extends BaseConfigService<AtributoConfig>
  ↓
Implementa:
- getEndpointName(): 'Atributos'
- getApiListMethod(): this.configApi.listAtributos
- getApiCreateMethod(): this.configApi.createAtributo
- getApiUpdateMethod(): this.configApi.updateAtributo
- getApiDeleteMethod(): this.configApi.deleteAtributo

Alias públicos:
- loadAtributos()
- createAtributo(data)
- updateAtributo(id, data)
- deleteAtributo(id)
```

### Validações de Negócio

Nenhuma validação adicional necessária neste service. Validações de formulário serão feitas no componente.

### Critérios de Aceitação

- [ ] Service criado com `@Injectable({ providedIn: 'root' })`
- [ ] Estende `BaseConfigService<AtributoConfig>`
- [ ] Implementa os 5 métodos abstratos corretamente
- [ ] Alias de métodos criados com nomes legíveis
- [ ] Imports corretos de `AtributoConfig` e `CreateConfigDto<AtributoConfig>`
- [ ] Documentação JSDoc no cabeçalho

---

## Issue #01.2: Atualizar Interface AtributoConfig

**Arquivo**: `src/app/core/models/atributo-config.model.ts`

### Descrição

Atualizar a interface TypeScript para refletir EXATAMENTE o schema do backend conforme api.json.

### Interface Esperada

```typescript
import { JogoScopedConfig } from './config-base.model';
import { Jogo } from './jogo.model';

/**
 * Atributo de Configuração
 * Representa um atributo base do sistema (FOR, DES, CON, etc)
 * 
 * Backend Schema: AtributoConfig (api.json)
 */
export interface AtributoConfig extends JogoScopedConfig {
  // Campos obrigatórios
  nome: string;                    // maxLength: 50
  
  // Campos opcionais
  abreviacao?: string;             // minLength: 2, maxLength: 5
  descricao?: string;              // maxLength: 500
  formulaImpeto?: string;          // maxLength: 100 (campo de texto por enquanto)
  descricaoImpeto?: string;        // maxLength: 200
  valorMinimo?: number;            // int32
  valorMaximo?: number;            // int32
  ordemExibicao?: number;          // int32
  
  // Nested object (populado pelo backend)
  jogo?: Jogo;
}
```

### Notas sobre Campos

- **formulaImpeto**: Por enquanto é apenas um campo de texto. Futuramente teremos um editor de fórmulas.
- **valorMinimo/valorMaximo**: Define range permitido para valores de atributo nas fichas
- **abreviacao**: Será usada em displays compactos (ex: "FOR" ao invés de "Força")

### Critérios de Aceitação

- [ ] Interface atualizada conforme schema do backend
- [ ] Estende `JogoScopedConfig`
- [ ] Todos os campos com tipos corretos
- [ ] Comentários JSDoc descrevendo constraints (maxLength, etc)
- [ ] Exportada no barrel file `src/app/core/models/index.ts`

---

## Issue #01.3: Criar AtributosConfigComponent

**Arquivo**: `src/app/features/mestre/pages/config/configs/atributos-config.component.ts`

### Descrição

Criar componente de gerenciamento de Atributos que estende `BaseConfigComponent`.

### Responsabilidades

- Estender `BaseConfigComponent<AtributoConfig, AtributoConfigService>`
- Implementar `buildForm()` com validações corretas
- Implementar métodos abstratos (`getEntityName`, `getEntityNamePlural`)
- Sobrescrever `confirmDelete()` para usar `ConfirmationService`

### Estrutura do Componente

```
AtributosConfigComponent extends BaseConfigComponent<AtributoConfig, AtributoConfigService>
  ↓
Injeções:
- service: AtributoConfigService
- confirmationService: ConfirmationService

Implementa:
- buildForm(): FormGroup com validações
- getEntityName(): 'Atributo'
- getEntityNamePlural(): 'Atributos'
- confirmDelete(id): usa ConfirmationService
```

### Formulário e Validações

#### Campos do Formulário

| Campo | Tipo | Validações | Placeholder |
|-------|------|------------|-------------|
| nome | text | required, minLength(3), maxLength(50) | Ex: Força |
| abreviacao | text | minLength(2), maxLength(5), pattern(/^[A-Z]+$/), uppercase | Ex: FOR |
| descricao | textarea | maxLength(500) | Descrição do atributo |
| formulaImpeto | text | maxLength(100) | Ex: FOR * 2 + nivel |
| descricaoImpeto | textarea | maxLength(200) | Explica como o ímpeto é calculado |
| valorMinimo | number | min(0) | Valor mínimo permitido |
| valorMaximo | number | min(valorMinimo) | Valor máximo permitido |
| ordemExibicao | number | required, min(1) | Ordem de exibição |
| ativo | checkbox | - | Ativo? |

#### Validadores Customizados

- **uppercaseValidator**: Para campo `abreviacao` - força maiúsculas
- **uniqueOrderValidator**: Para campo `ordemExibicao` - valida ordem única no jogo
- **valorMaximoValidator**: Valida que `valorMaximo >= valorMinimo`

### Critérios de Aceitação

- [ ] Componente standalone criado
- [ ] Estende `BaseConfigComponent`
- [ ] Provider apenas de `ConfirmationService`
- [ ] Formulário com todas as validações
- [ ] Mensagens de erro customizadas para cada campo
- [ ] Método `confirmDelete()` sobrescrito
- [ ] Imports corretos dos módulos PrimeNG

---

## Issue #01.4: Criar Template do Componente

**Arquivo**: `src/app/features/mestre/pages/config/configs/atributos-config.component.html`

### Descrição

Criar template HTML usando o template base e customizando as seções específicas.

### Estrutura do Template

```html
<app-base-config-template>
  
  <!-- Título -->
  <ng-container title>
    <i class="pi pi-star text-primary mr-2"></i>
    Atributos
  </ng-container>
  
  <!-- Subtítulo -->
  <ng-container subtitle>
    Configure os atributos base do sistema (FOR, DES, CON, INT, SAB, CAR, etc.)
  </ng-container>
  
  <!-- Indicador de jogo -->
  <ng-container gameIndicator>
    Configurando: {{ currentGameName() }}
  </ng-container>
  
  <!-- Colunas da tabela -->
  <ng-container tableColumns>
    <ng-template #header>
      <tr>
        <th pSortableColumn="nome">Nome <p-sortIcon field="nome" /></th>
        <th>Abreviação</th>
        <th pSortableColumn="ordemExibicao">Ordem <p-sortIcon field="ordemExibicao" /></th>
        <th>Range</th>
        <th>Fórmula Ímpeto</th>
        <th>Ativo</th>
        <th style="width: 150px">Ações</th>
      </tr>
    </ng-template>
    <ng-template #body let-item>
      <tr>
        <td><span class="font-bold">{{ item.nome }}</span></td>
        <td><span class="text-primary font-bold">{{ item.abreviacao }}</span></td>
        <td>{{ item.ordemExibicao }}</td>
        <td>
          @if (item.valorMinimo !== undefined && item.valorMaximo !== undefined) {
            <span class="text-sm">{{ item.valorMinimo }} - {{ item.valorMaximo }}</span>
          } @else {
            <span class="text-color-secondary text-sm">-</span>
          }
        </td>
        <td>
          @if (item.formulaImpeto) {
            <code class="text-xs">{{ item.formulaImpeto }}</code>
          } @else {
            <span class="text-color-secondary text-sm">-</span>
          }
        </td>
        <td>
          <i [class]="item.ativo ? 'pi pi-check-circle text-green-500' : 'pi pi-times-circle text-red-500'"></i>
        </td>
        <td>
          <div class="flex gap-2">
            <p-button
              icon="pi pi-pencil"
              [text]="true"
              [rounded]="true"
              severity="info"
              (onClick)="openDialog(item)"
            />
            <p-button
              icon="pi pi-trash"
              [text]="true"
              [rounded]="true"
              severity="danger"
              (onClick)="confirmDelete(item.id!)"
            />
          </div>
        </td>
      </tr>
    </ng-template>
  </ng-container>
  
  <!-- Campos do formulário -->
  <ng-container formFields>
    <div class="flex flex-column gap-3">
      
      <!-- Nome -->
      <div>
        <label class="block font-semibold mb-2">Nome *</label>
        <input 
          pInputText 
          formControlName="nome" 
          class="w-full" 
          placeholder="Ex: Força"
        />
        @if (form.get('nome')?.invalid && form.get('nome')?.touched) {
          <small class="text-red-500 block mt-1">
            {{ getErrorMessage(form.get('nome')!) }}
          </small>
        }
      </div>
      
      <!-- Abreviação -->
      <div>
        <label class="block font-semibold mb-2">Abreviação</label>
        <input 
          pInputText 
          formControlName="abreviacao" 
          class="w-full" 
          placeholder="Ex: FOR"
          maxlength="5"
          style="text-transform: uppercase"
        />
        <small class="text-color-secondary block mt-1">
          2-5 caracteres em maiúsculo
        </small>
        @if (form.get('abreviacao')?.invalid && form.get('abreviacao')?.touched) {
          <small class="text-red-500 block mt-1">
            {{ getErrorMessage(form.get('abreviacao')!) }}
          </small>
        }
      </div>
      
      <!-- Grid 2 colunas -->
      <div class="grid">
        
        <!-- Valor Mínimo -->
        <div class="col-12 md:col-6">
          <label class="block font-semibold mb-2">Valor Mínimo</label>
          <p-inputNumber
            formControlName="valorMinimo"
            class="w-full"
            [showButtons]="true"
            [min]="0"
            placeholder="Ex: 0"
          />
        </div>
        
        <!-- Valor Máximo -->
        <div class="col-12 md:col-6">
          <label class="block font-semibold mb-2">Valor Máximo</label>
          <p-inputNumber
            formControlName="valorMaximo"
            class="w-full"
            [showButtons]="true"
            [min]="0"
            placeholder="Ex: 20"
          />
        </div>
        
        <!-- Ordem de Exibição -->
        <div class="col-12 md:col-6">
          <label class="block font-semibold mb-2">Ordem de Exibição *</label>
          <p-inputNumber
            formControlName="ordemExibicao"
            class="w-full"
            [showButtons]="true"
            [min]="1"
          />
          @if (form.get('ordemExibicao')?.invalid && form.get('ordemExibicao')?.touched) {
            <small class="text-red-500 block mt-1">
              {{ getErrorMessage(form.get('ordemExibicao')!) }}
            </small>
          }
        </div>
        
        <!-- Ativo -->
        <div class="col-12 md:col-6 flex align-items-center">
          <p-checkbox
            formControlName="ativo"
            [binary]="true"
            label="Ativo"
          />
        </div>
        
      </div>
      
      <!-- Descrição -->
      <div>
        <label class="block font-semibold mb-2">Descrição</label>
        <textarea
          pTextarea
          formControlName="descricao"
          class="w-full"
          rows="3"
          maxlength="500"
          placeholder="Descreva o atributo"
        ></textarea>
        <small class="text-color-secondary block mt-1">
          Máximo 500 caracteres
        </small>
      </div>
      
      <!-- Fórmula de Ímpeto -->
      <div>
        <label class="block font-semibold mb-2">Fórmula de Ímpeto</label>
        <input
          pInputText
          formControlName="formulaImpeto"
          class="w-full font-mono"
          maxlength="100"
          placeholder="Ex: FOR * 2 + nivel"
        />
        <small class="text-color-secondary block mt-1">
          Fórmula para calcular ímpeto (campo de texto por enquanto)
        </small>
      </div>
      
      <!-- Descrição do Ímpeto -->
      <div>
        <label class="block font-semibold mb-2">Descrição do Ímpeto</label>
        <textarea
          pTextarea
          formControlName="descricaoImpeto"
          class="w-full"
          rows="2"
          maxlength="200"
          placeholder="Explique como o ímpeto é calculado"
        ></textarea>
      </div>
      
    </div>
  </ng-container>
  
</app-base-config-template>
```

### Critérios de Aceitação

- [ ] Template usa `<app-base-config-template>`
- [ ] Todas as seções customizadas (title, subtitle, gameIndicator, tableColumns, formFields)
- [ ] Tabela mostra todos os campos relevantes
- [ ] Formulário com todos os campos e validações
- [ ] Mensagens de erro exibidas condicionalmente
- [ ] Hints informativos em campos complexos
- [ ] Ícones do PrimeNG Icons usados apropriadamente

---

## Issue #01.5: Adicionar Rota

**Arquivo**: `src/app/features/mestre/mestre.routes.ts`

### Descrição

Adicionar rota para o componente de Atributos no módulo de rotas do Mestre.

### Rota Esperada

```typescript
{
  path: 'config/atributos',
  component: AtributosConfigComponent,
  canActivate: [authGuard, roleGuard(['MESTRE'])],
  title: 'Configurações - Atributos'
}
```

### Critérios de Aceitação

- [ ] Rota adicionada em `mestre.routes.ts`
- [ ] Guards de autenticação e role aplicados
- [ ] Título da página configurado
- [ ] Import do componente correto

---

## Issue #01.6: Atualizar Menu de Navegação

**Arquivo**: `src/app/features/mestre/pages/config/config-sidebar.component.ts`

### Descrição

Adicionar link para Atributos no menu lateral de configurações.

### Item do Menu

```typescript
{
  label: 'Atributos',
  icon: 'pi pi-star',
  routerLink: '/mestre/config/atributos',
  badge: computed(() => this.getActiveCount('atributos'))
}
```

### Critérios de Aceitação

- [ ] Item adicionado no menu
- [ ] Ícone apropriado
- [ ] RouterLink correto
- [ ] Badge com contagem de itens ativos (opcional)

---

## 🧪 Testes Manuais

### Cenário 1: Criar Atributo

1. Login como Mestre
2. Selecionar jogo no header
3. Navegar para `/mestre/config/atributos`
4. Clicar em "Novo Atributo"
5. Preencher formulário:
   - Nome: "Força"
   - Abreviação: "FOR"
   - Ordem: 1
   - Valor Mínimo: 0
   - Valor Máximo: 20
6. Salvar
7. **Esperado**: Toast de sucesso, item aparece na lista

### Cenário 2: Editar Atributo

1. Clicar no botão de editar em um atributo
2. Modificar campos
3. Salvar
4. **Esperado**: Toast de sucesso, mudanças refletidas na lista

### Cenário 3: Deletar Atributo

1. Clicar no botão de deletar
2. Confirmar no dialog
3. **Esperado**: Toast de sucesso, item removido da lista

### Cenário 4: Validações

1. Tentar salvar com nome vazio → **Erro de validação**
2. Tentar salvar com abreviação em minúsculo → **Erro de validação**
3. Tentar salvar com ordem duplicada → **Backend retorna erro, toast exibido**
4. Tentar salvar com valorMaximo < valorMinimo → **Erro de validação**

### Cenário 5: Sem Jogo Selecionado

1. Desselecionar jogo (se possível)
2. Navegar para `/mestre/config/atributos`
3. **Esperado**: Toast de aviso, lista vazia, botão "Novo" desabilitado

---

## 📚 Referências

- **Backend Controller**: `AtributoController.java`
- **Backend Schema**: `api.json` linha 3607
- **Interface Atual**: `src/app/core/models/atributo-config.model.ts`
- **Template Base**: `src/app/shared/components/base-config/base-config-template.html`
- **Validadores**: `src/app/shared/validators/config-validators.ts`

---

## ✅ Checklist de Conclusão

- [ ] #01.1: AtributoConfigService criado
- [ ] #01.2: Interface AtributoConfig atualizada
- [ ] #01.3: AtributosConfigComponent criado
- [ ] #01.4: Template HTML criado
- [ ] #01.5: Rota adicionada
- [ ] #01.6: Menu atualizado
- [ ] Todos os testes manuais passando
- [ ] Código compila sem erros
- [ ] Nenhum erro no console do browser
- [ ] Code review aprovado
