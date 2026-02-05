# TASK 02: Aptidões Config

**Tipo**: 📝 Componente de Configuração  
**Prioridade**: ALTA  
**Dependências**: INF-0, INF-1, INF-2, INF-3  
**Estimativa**: 5 horas

---

## 📋 Visão Geral

Criar o componente de gerenciamento de **Aptidões** (Skills) que representa as habilidades e perícias dos personagens. Aptidões são organizadas por **Tipos de Aptidão** e podem estar vinculadas a atributos base.

### Por Que Este Módulo?

Aptidões definem **o que os personagens podem fazer** além de seus atributos brutos. Exemplos: "Espadas", "Furtividade", "Persuasão", "Alquimia", etc. Cada sistema de RPG tem seu próprio conjunto de aptidões.

### O Que Faz?

Permite ao Mestre configurar:
- Quais aptidões existem no jogo
- Como são categorizadas (por tipo de aptidão)
- Relação com atributos base (se aplicável)
- Ordem de exibição nas fichas

---

## 🎯 Contrato Backend (api.json)

### Schema: `AptidaoConfig`

**Campos**:
- `id`: integer (int64)
- `jogo`: Jogo (object, required)
- `tipoAptidao`: TipoAptidao (object, required)
- `nome`: string (maxLength: 50, required)
- `descricao`: string (maxLength: 500)
- `ordemExibicao`: integer (int32)
- `ativo`: boolean
- `createdAt`, `updatedAt`: date-time

**Campos obrigatórios**: `jogo`, `nome`, `tipoAptidao`

### Schema: `TipoAptidao`

**Campos**:
- `id`: integer (int64)
- `jogo`: Jogo (object, required)
- `nome`: string (maxLength: 50, required)
- `descricao`: string (maxLength: 500)
- `ordemExibicao`: integer (int32)
- `ativo`: boolean

**Campos obrigatórios**: `jogo`, `nome`

### Endpoints

#### Aptidões

| Método | Endpoint | Query/Body | Descrição |
|--------|----------|------------|-----------|
| GET | `/api/v1/configuracoes/aptidoes` | `?jogoId={id}` | Lista aptidões do jogo |
| GET | `/api/v1/configuracoes/aptidoes/{id}` | - | Busca aptidão por ID |
| POST | `/api/v1/configuracoes/aptidoes` | Body com `jogoId` e `tipoAptidaoId` | Cria nova aptidão |
| PUT | `/api/v1/configuracoes/aptidoes/{id}` | Body | Atualiza aptidão |
| DELETE | `/api/v1/configuracoes/aptidoes/{id}` | - | Soft delete |

#### Tipos de Aptidão

| Método | Endpoint | Query/Body | Descrição |
|--------|----------|------------|-----------|
| GET | `/api/v1/configuracoes/tipos-aptidao` | `?jogoId={id}` | Lista tipos do jogo |
| POST | `/api/v1/configuracoes/tipos-aptidao` | Body com `jogoId` | Cria novo tipo |
| PUT | `/api/v1/configuracoes/tipos-aptidao/{id}` | Body | Atualiza tipo |
| DELETE | `/api/v1/configuracoes/tipos-aptidao/{id}` | - | Soft delete |

---

## Issue #02.1: Criar AptidaoConfigService

**Arquivo**: `src/app/core/services/business/config/aptidao-config.service.ts`

### Descrição

Criar Business Service para Aptidões estendendo `BaseConfigService<AptidaoConfig>`.

### Responsabilidades

- Gerenciar CRUD de aptidões
- Integrar automaticamente com `CurrentGameService` para jogoId
- Expor métodos: `loadAptidoes()`, `createAptidao()`, `updateAptidao()`, `deleteAptidao()`

### Critérios de Aceitação

- [ ] Service estende `BaseConfigService<AptidaoConfig>`
- [ ] Implementa os 5 métodos abstratos da classe base
- [ ] Alias de métodos com nomes legíveis criados
- [ ] `@Injectable({ providedIn: 'root' })`

---

## Issue #02.2: Criar TipoAptidaoConfigService

**Arquivo**: `src/app/core/services/business/config/tipo-aptidao-config.service.ts`

### Descrição

Criar Business Service para Tipos de Aptidão estendendo `BaseConfigService<TipoAptidao>`.

### Por Que Separado?

Tipos de Aptidão são uma **entidade independente** que precisa ser gerenciada antes das aptidões (hierarquia de dados). Exemplos de tipos: "Combate", "Conhecimento", "Social", "Ofícios".

### Responsabilidades

- Gerenciar CRUD de tipos de aptidão
- Usado pelo componente de Aptidões para popular select
- Expor métodos: `loadTiposAptidao()`, `createTipoAptidao()`, etc

### Critérios de Aceitação

- [ ] Service estende `BaseConfigService<TipoAptidao>`
- [ ] Implementa os 5 métodos abstratos
- [ ] Alias de métodos criados
- [ ] `@Injectable({ providedIn: 'root' })`

---

## Issue #02.3: Atualizar Interfaces TypeScript

**Arquivos**: 
- `src/app/core/models/aptidao-config.model.ts`
- `src/app/core/models/tipo-aptidao.model.ts`

### Descrição

Atualizar as interfaces TypeScript para refletir exatamente os schemas do backend.

### Interface AptidaoConfig

Deve estender `NamedConfig` e incluir:
- Referência a `TipoAptidao` (object e ID)
- Todos os campos conforme api.json
- Comentários JSDoc com constraints

### Interface TipoAptidao

Deve estender `NamedConfig` e ser uma entidade simples com apenas:
- nome, descricao, ordemExibicao, ativo

### Critérios de Aceitação

- [ ] Ambas interfaces estendem as corretas da base
- [ ] Campos com tipos corretos (string, number, object)
- [ ] Comentários JSDoc com maxLength e constraints
- [ ] Exportadas no barrel file

---

## Issue #02.4: Criar AptidoesConfigComponent

**Arquivo**: `src/app/features/mestre/pages/config/configs/aptidoes-config.component.ts`

### Descrição

Criar componente de gerenciamento de Aptidões estendendo `BaseConfigComponent`.

### Complexidade Adicional

Este componente é **mais complexo** que Atributos porque precisa:
1. Carregar lista de **Tipos de Aptidão** para popular o select
2. Filtrar aptidões por tipo (opcional)
3. Exibir o tipo na tabela

### Responsabilidades

- Estender `BaseConfigComponent<AptidaoConfig, AptidaoConfigService>`
- Injetar também `TipoAptidaoConfigService` para carregar tipos
- Implementar `buildForm()` com validação de tipo obrigatório
- Carregar tipos no `ngOnInit` antes de construir o formulário

### Formulário e Validações

#### Campos do Formulário

| Campo | Tipo | Validações | Notas |
|-------|------|------------|-------|
| nome | text | required, minLength(3), maxLength(50) | Nome da aptidão |
| tipoAptidaoId | select | required | FK para TipoAptidao |
| descricao | textarea | maxLength(500) | Opcional |
| ordemExibicao | number | required, min(1) | Ordem na lista |
| ativo | checkbox | - | Default true |

### Critérios de Aceitação

- [ ] Componente estende `BaseConfigComponent`
- [ ] Injeta `AptidaoConfigService` e `TipoAptidaoConfigService`
- [ ] Carrega tipos de aptidão no `ngOnInit` para popular select
- [ ] Formulário valida tipo obrigatório
- [ ] Provider de `ConfirmationService`

---

## Issue #02.5: Criar Template do Componente

**Arquivo**: `src/app/features/mestre/pages/config/configs/aptidoes-config.component.html`

### Descrição

Criar template usando `<app-base-config-template>` com customizações.

### Seções Customizadas

#### Título e Subtítulo
- Ícone: `pi pi-briefcase`
- Título: "Aptidões"
- Subtítulo: "Configure as habilidades e perícias do sistema"

#### Tabela
Colunas:
- Nome (sortable)
- Tipo de Aptidão (exibir `tipoAptidao.nome`)
- Ordem (sortable)
- Ativo (ícone check/times)
- Ações (editar/deletar)

#### Formulário
Campos:
- Nome (input text)
- Tipo de Aptidão (select com `p-select`)
  - Carregar de `tiposAptidao` signal
  - `optionLabel="nome"`, `optionValue="id"`
  - Exibir mensagem se não houver tipos cadastrados
- Descrição (textarea)
- Ordem de Exibição (inputNumber)
- Ativo (checkbox)

### Critérios de Aceitação

- [ ] Template usa `<app-base-config-template>`
- [ ] Tabela exibe tipo de aptidão (nested object)
- [ ] Select de tipos funcional com dados carregados
- [ ] Mensagem clara se não houver tipos cadastrados
- [ ] Validações exibidas corretamente

---

## Issue #02.6: Criar TiposAptidaoConfigComponent (Opcional)

**Arquivo**: `src/app/features/mestre/pages/config/configs/tipos-aptidao-config.component.ts`

### Descrição

Criar componente separado para gerenciar **Tipos de Aptidão**. Este é opcional mas **altamente recomendado** para UX melhor.

### Por Que Separado?

- Mestre precisa **primeiro criar tipos** antes de criar aptidões
- Interface mais limpa e focada
- Evita confusão entre "criar tipo" e "criar aptidão"

### Alternativa (se não criar componente separado)

Adicionar botão "Gerenciar Tipos" no componente de Aptidões que abre um dialog para CRUD de tipos. Mais complexo e menos intuitivo.

### Estrutura (se criar)

Componente simples que estende `BaseConfigComponent<TipoAptidao, TipoAptidaoConfigService>`.

Formulário com apenas:
- Nome
- Descrição
- Ordem
- Ativo

### Critérios de Aceitação (se criar)

- [ ] Componente estende `BaseConfigComponent`
- [ ] Formulário simples com 4 campos
- [ ] Template minimalista
- [ ] Rota `/mestre/config/tipos-aptidao`

---

## Issue #02.7: Adicionar Rotas

**Arquivo**: `src/app/features/mestre/mestre.routes.ts`

### Descrição

Adicionar rotas para o(s) componente(s).

### Rotas a Adicionar

```
/mestre/config/aptidoes (AptidoesConfigComponent)
/mestre/config/tipos-aptidao (TiposAptidaoConfigComponent) - se criado
```

### Critérios de Aceitação

- [ ] Rotas adicionadas com guards corretos
- [ ] Títulos de página configurados
- [ ] Ordem lógica no arquivo de rotas

---

## Issue #02.8: Atualizar Menu de Navegação

**Arquivo**: `src/app/features/mestre/pages/config/config-sidebar.component.ts`

### Descrição

Adicionar item(s) no menu lateral de configurações.

### Items do Menu

**Aptidões**:
- Label: "Aptidões"
- Icon: "pi pi-briefcase"
- RouterLink: "/mestre/config/aptidoes"

**Tipos de Aptidão** (se componente separado):
- Label: "Tipos de Aptidão"
- Icon: "pi pi-tags"
- RouterLink: "/mestre/config/tipos-aptidao"
- Posição: Logo acima de "Aptidões" (hierarquia visual)

### Critérios de Aceitação

- [ ] Items adicionados no menu
- [ ] Ícones apropriados
- [ ] Ordem lógica (tipos antes de aptidões)
- [ ] RouterLinks corretos

---

## 🧪 Testes Manuais

### Cenário 1: Fluxo Completo (Tipos → Aptidões)

1. Login como Mestre, selecionar jogo
2. Navegar para Tipos de Aptidão
3. Criar tipo "Combate"
4. Criar tipo "Conhecimento"
5. Navegar para Aptidões
6. Criar aptidão "Espadas" do tipo "Combate"
7. **Esperado**: Aptidão criada com tipo vinculado

### Cenário 2: Validação de Tipo Obrigatório

1. Tentar criar aptidão sem selecionar tipo
2. **Esperado**: Erro de validação, não permite salvar

### Cenário 3: Select Vazio

1. Criar jogo novo sem tipos cadastrados
2. Tentar criar aptidão
3. **Esperado**: Select vazio, mensagem orientando a criar tipos primeiro

### Cenário 4: Filtro por Tipo (se implementado)

1. Criar várias aptidões de tipos diferentes
2. Filtrar por tipo "Combate"
3. **Esperado**: Exibe apenas aptidões do tipo selecionado

---

## 📚 Referências

- **Backend Controller**: `AptidaoController.java`, `TipoAptidaoController.java`
- **Backend Schema**: `api.json` linhas 3671 (AptidaoConfig), 3163 (TipoAptidao)
- **Interface Atual**: `src/app/core/models/aptidao-config.model.ts`

---

## ✅ Checklist de Conclusão

- [ ] #02.1: AptidaoConfigService criado
- [ ] #02.2: TipoAptidaoConfigService criado
- [ ] #02.3: Interfaces TypeScript atualizadas
- [ ] #02.4: AptidoesConfigComponent criado
- [ ] #02.5: Template HTML criado
- [ ] #02.6: TiposAptidaoConfigComponent criado (opcional)
- [ ] #02.7: Rotas adicionadas
- [ ] #02.8: Menu atualizado
- [ ] Todos os testes manuais passando
- [ ] Select de tipos populado corretamente
- [ ] Código compila sem erros
