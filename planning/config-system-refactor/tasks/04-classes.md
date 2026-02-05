# TASK 04: Classes Config

**Tipo**: 📝 Componente de Configuração  
**Prioridade**: MÉDIA  
**Dependências**: INF-0, INF-1, INF-2, INF-3  
**Estimativa**: 4 horas

---

## 📋 Visão Geral

Criar o componente de gerenciamento de **Classes de Personagem** (ex: Guerreiro, Mago, Ladino, etc.). Classes definem o arquétipo/profissão do personagem e influenciam suas características e habilidades.

### Por Que Este Módulo?

Classes são uma das escolhas **fundamentais** na criação de personagem em sistemas de RPG. Determinam o estilo de jogo, progressão e mecânicas disponíveis. Cada mestre pode criar classes customizadas para seu mundo.

### O Que Faz?

Permite ao Mestre configurar:
- Quais classes existem no jogo
- Nome e descrição detalhada de cada classe
- Ordem de exibição na ficha
- Ativar/desativar classes

---

## 🎯 Contrato Backend (api.json)

### Schema: `ClassePersonagem`

```json
{
  "id": "integer(int64)",
  "jogo": "Jogo (object, required)",
  "nome": "string (minLength: 2, maxLength: 100, required)",
  "descricao": "string (maxLength: 2000)",
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
| GET | `/api/v1/configuracoes/classes` | `?jogoId={id}` | Lista classes do jogo |
| GET | `/api/v1/configuracoes/classes/{id}` | - | Busca classe por ID |
| POST | `/api/v1/configuracoes/classes` | Body com `jogoId` | Cria nova classe |
| PUT | `/api/v1/configuracoes/classes/{id}` | Body | Atualiza classe |
| DELETE | `/api/v1/configuracoes/classes/{id}` | - | Soft delete (ativo=false) |

---

## Issue #04.1: Criar ClasseConfigService

**Arquivo**: `src/app/core/services/business/config/classe-config.service.ts`

### Descrição

Criar Business Service para Classes estendendo `BaseConfigService<ClassePersonagem>`.

### Responsabilidades

- Gerenciar CRUD de classes
- Integrar automaticamente com `CurrentGameService` para jogoId
- Expor métodos: `loadClasses()`, `createClasse()`, `updateClasse()`, `deleteClasse()`

### Critérios de Aceitação

- [ ] Service estende `BaseConfigService<ClassePersonagem>`
- [ ] Implementa os 5 métodos abstratos da classe base
- [ ] Alias de métodos com nomes legíveis criados
- [ ] `@Injectable({ providedIn: 'root' })`
- [ ] `getEndpointName()` retorna "Classes"

---

## Issue #04.2: Atualizar Interface ClassePersonagem

**Arquivo**: `src/app/core/models/classe-personagem.model.ts`

### Descrição

Atualizar a interface TypeScript para refletir EXATAMENTE o schema do backend.

### Interface Esperada

Deve estender `NamedConfig` (tem nome e descrição).

**Campos específicos**:
- Nenhum campo adicional além dos herdados de `NamedConfig`

**Observação Importante**: 
O schema atual do backend **NÃO** tem campo `bonusAtributos` (que estava mencionado em documentações antigas). Se houver necessidade futura de adicionar bônus, será necessário atualizar o backend primeiro.

### Critérios de Aceitação

- [ ] Interface estende `NamedConfig`
- [ ] Comentários JSDoc com constraints (minLength: 2, maxLength: 100 para nome)
- [ ] Comentário JSDoc indicando maxLength: 2000 para descrição
- [ ] Exportada no barrel file `src/app/core/models/index.ts`

---

## Issue #04.3: Criar ClassesConfigComponent

**Arquivo**: `src/app/features/mestre/pages/config/configs/classes-config.component.ts`

### Descrição

Criar componente de gerenciamento de Classes estendendo `BaseConfigComponent`.

### Responsabilidades

- Estender `BaseConfigComponent<ClassePersonagem, ClasseConfigService>`
- Implementar `buildForm()` com validações corretas
- Implementar métodos abstratos (`getEntityName`, `getEntityNamePlural`)
- Sobrescrever `confirmDelete()` para usar `ConfirmationService`

### Formulário e Validações

#### Campos do Formulário

| Campo | Tipo | Validações | Notas |
|-------|------|------------|-------|
| nome | text | required, minLength(2), maxLength(100) | Nome da classe |
| descricao | textarea | maxLength(2000) | Descrição detalhada |
| ordemExibicao | number | min(1) | Ordem na lista |
| ativo | checkbox | - | Default true |

#### Validadores

- **uniqueNameValidator**: Nome único por jogo
- **uniqueOrderValidator**: Ordem única por jogo (se preenchida)

### Particularidades deste Componente

- Componente **simples**, sem dependências de outras configs
- Textarea para descrição deve ter altura adequada (6-8 linhas)
- Descrição pode ser longa (até 2000 caracteres) - considerar contador de caracteres

### Critérios de Aceitação

- [ ] Componente estende `BaseConfigComponent`
- [ ] Provider apenas de `ConfirmationService`
- [ ] Formulário com todas as validações
- [ ] Textarea para descrição com altura adequada
- [ ] Contador de caracteres para descrição (opcional mas recomendado)
- [ ] Método `confirmDelete()` sobrescrito

---

## Issue #04.4: Criar Template do Componente

**Arquivo**: `src/app/features/mestre/pages/config/configs/classes-config.component.html`

### Descrição

Criar template usando `<app-base-config-template>` com customizações.

### Seções Customizadas

#### Título e Subtítulo
- Ícone: `pi pi-shield`
- Título: "Classes de Personagem"
- Subtítulo: "Configure as classes disponíveis no jogo (Guerreiro, Mago, etc.)"

#### Indicador de Jogo
```
Configurando: {{ currentGameName() }}
```

#### Tabela

**Colunas**:
- Nome (sortable, negrito)
- Descrição (truncar se muito longa - max 100 chars com "...")
- Ordem (sortable, se preenchida)
- Ativo (ícone check/times)
- Ações (editar/deletar)

**Dica de Exibição**:
Descrição na tabela deve ser truncada. Usar diretiva ou método para exibir apenas primeiros 100 caracteres seguidos de "..." se maior.

#### Formulário

**Campos**:

1. **Nome** (obrigatório)
   - Input text
   - Placeholder: "Ex: Guerreiro"
   - Mensagem de erro se vazio ou menor que 2 chars

2. **Descrição** (opcional)
   - Textarea
   - Rows: 8
   - Placeholder: "Descreva a classe, suas características e habilidades típicas"
   - Contador de caracteres: "X/2000"
   - Mensagem informativa abaixo

3. **Ordem de Exibição** (opcional)
   - InputNumber
   - Min: 1
   - ShowButtons: true
   - Mensagem: "Ordem em que aparece na lista (opcional)"

4. **Ativo**
   - Checkbox
   - Label: "Classe ativa"

### Critérios de Aceitação

- [ ] Template usa `<app-base-config-template>`
- [ ] Todas as seções customizadas (title, subtitle, gameIndicator, tableColumns, formFields)
- [ ] Tabela trunca descrições longas
- [ ] Textarea com 8 linhas e contador de caracteres
- [ ] Validações exibidas corretamente
- [ ] Mensagens informativas em campos complexos

---

## Issue #04.5: Adicionar Rota

**Arquivo**: `src/app/features/mestre/mestre.routes.ts`

### Descrição

Adicionar rota para o componente de Classes.

### Rota Esperada

```
path: 'config/classes'
component: ClassesConfigComponent
canActivate: [authGuard, roleGuard(['MESTRE'])]
title: 'Configurações - Classes'
```

### Critérios de Aceitação

- [ ] Rota adicionada
- [ ] Guards aplicados
- [ ] Título configurado
- [ ] Import do componente correto

---

## Issue #04.6: Atualizar Menu de Navegação

**Arquivo**: `src/app/features/mestre/pages/config/config-sidebar.component.ts`

### Descrição

Adicionar item no menu lateral de configurações.

### Item do Menu

- Label: "Classes"
- Icon: "pi pi-shield"
- RouterLink: "/mestre/config/classes"
- Badge: Contador de classes ativas (opcional)

### Critérios de Aceitação

- [ ] Item adicionado
- [ ] Ícone apropriado
- [ ] RouterLink correto
- [ ] Posicionamento lógico no menu (próximo a Raças)

---

## 🧪 Testes Manuais

### Cenário 1: Criar Classe Simples

1. Login como Mestre, selecionar jogo
2. Navegar para `/mestre/config/classes`
3. Clicar em "Nova Classe"
4. Preencher:
   - Nome: "Guerreiro"
   - Descrição: "Combatente especializado em armas e armaduras pesadas"
   - Ordem: 1
5. Salvar
6. **Esperado**: Toast de sucesso, classe aparece na lista

### Cenário 2: Validação de Nome Curto

1. Tentar criar classe com nome "A" (1 caractere)
2. **Esperado**: Erro de validação, mínimo 2 caracteres

### Cenário 3: Descrição Longa

1. Criar classe com descrição muito longa (próxima de 2000 chars)
2. **Esperado**: Contador mostra caracteres restantes, salva normalmente
3. Ver na tabela
4. **Esperado**: Descrição truncada com "..."

### Cenário 4: Ordem Duplicada

1. Criar Classe 1 com ordem 1
2. Criar Classe 2 com ordem 1
3. **Esperado**: Permitido (ordem é opcional, não há validação de unicidade estrita se não implementada)

### Cenário 5: Editar e Desativar

1. Editar uma classe existente
2. Desmarcar "Ativo"
3. Salvar
4. **Esperado**: Classe não aparece mais na lista (filtrada por ativo)

---

## 📚 Referências

- **Backend Controller**: `ClasseController.java`
- **Backend Schema**: `api.json` linha 3520
- **Interface Atual**: `src/app/core/models/classe-personagem.model.ts` (se existir)

---

## ✅ Checklist de Conclusão

- [ ] #04.1: ClasseConfigService criado
- [ ] #04.2: Interface ClassePersonagem atualizada
- [ ] #04.3: ClassesConfigComponent criado
- [ ] #04.4: Template HTML criado
- [ ] #04.5: Rota adicionada
- [ ] #04.6: Menu atualizado
- [ ] Todos os testes manuais passando
- [ ] Descrições longas truncadas na tabela
- [ ] Contador de caracteres funcional
- [ ] Código compila sem erros
