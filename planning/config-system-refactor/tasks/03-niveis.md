# TASK 03: Níveis Config

**Tipo**: 📝 Componente de Configuração  
**Prioridade**: ALTA  
**Dependências**: INF-0, INF-1, INF-2, INF-3  
**Estimativa**: 5 horas

---

## 📋 Visão Geral

Criar o componente de gerenciamento de **Níveis** (Level Progression) que define a progressão de personagens por experiência (XP) e os benefícios ganhos em cada nível.

### Por Que Este Módulo?

Níveis são fundamentais para **progressão de personagens**. Define quanto XP é necessário para avançar, quantos pontos de atributo e aptidão o personagem ganha, e limitadores de crescimento. É a **curva de progressão** do jogo.

### O Que Faz?

Permite ao Mestre configurar:
- Tabela de progressão de XP (quanto XP precisa para cada nível)
- Recompensas por nível (pontos de atributo, pontos de aptidão)
- Limitadores de atributo por nível
- Progressão deve ser **crescente** (XP aumenta a cada nível)

---

## 🎯 Contrato Backend (api.json)

### Schema: `NivelConfig`

**Campos**:
- `id`: integer (int64)
- `jogo`: Jogo (object, required)
- `nivel`: integer (int32, minimum: 0, required) - **único por jogo**
- `xpNecessaria`: integer (int64, minimum: 0, required) - XP acumulada
- `pontosAtributo`: integer (int32, minimum: 0, required)
- `pontosAptidao`: integer (int32, minimum: 0)
- `limitadorAtributo`: integer (int32, minimum: 1, required) - Valor máximo de atributo
- `ativo`: boolean (required)
- `createdAt`, `updatedAt`: date-time

**Campos obrigatórios**: `jogo`, `nivel`, `xpNecessaria`, `pontosAtributo`, `limitadorAtributo`, `ativo`

### Endpoints

| Método | Endpoint | Query/Body | Descrição |
|--------|----------|------------|-----------|
| GET | `/api/v1/configuracoes/niveis` | `?jogoId={id}` | Lista níveis do jogo |
| GET | `/api/v1/configuracoes/niveis/{id}` | - | Busca nível por ID |
| POST | `/api/v1/configuracoes/niveis` | Body com `jogoId` | Cria novo nível |
| PUT | `/api/v1/configuracoes/niveis/{id}` | Body | Atualiza nível |
| DELETE | `/api/v1/configuracoes/niveis/{id}` | - | Soft delete |

---

## Issue #03.1: Criar NivelConfigService

**Arquivo**: `src/app/core/services/business/config/nivel-config.service.ts`

### Descrição

Criar Business Service para Níveis estendendo `BaseConfigService<NivelConfig>`.

### Responsabilidades

- Gerenciar CRUD de níveis
- Validar progressão de XP (pode adicionar lógica de validação)
- Expor métodos: `loadNiveis()`, `createNivel()`, `updateNivel()`, `deleteNivel()`

### Critérios de Aceitação

- [ ] Service estende `BaseConfigService<NivelConfig>`
- [ ] Implementa os 5 métodos abstratos
- [ ] Alias de métodos criados
- [ ] `@Injectable({ providedIn: 'root' })`

---

## Issue #03.2: Atualizar Interface NivelConfig

**Arquivo**: `src/app/core/models/nivel-config.model.ts`

### Descrição

Atualizar interface TypeScript para refletir exatamente o schema do backend.

### Interface NivelConfig

Deve estender `JogoScopedConfig` (não tem `nome`, é identificado por número).

Campos específicos:
- `nivel`: number (único, minimum 0)
- `xpNecessaria`: number (crescente, minimum 0)
- `pontosAtributo`: number (minimum 0)
- `pontosAptidao`: number (minimum 0)
- `limitadorAtributo`: number (minimum 1)

### Nota sobre Campo `pontosAptidao`

No schema backend está listado nos properties mas **não está** em `required`. Verificar se é opcional ou se documentação está inconsistente.

### Critérios de Aceitação

- [ ] Interface estende `JogoScopedConfig`
- [ ] Todos campos com tipos number
- [ ] Comentários JSDoc com constraints (minimum)
- [ ] Exportada no barrel file

---

## Issue #03.3: Criar NiveisConfigComponent

**Arquivo**: `src/app/features/mestre/pages/config/configs/niveis-config.component.ts`

### Descrição

Criar componente de gerenciamento de Níveis estendendo `BaseConfigComponent`.

### Complexidade Adicional

Este componente é **mais complexo** porque precisa:
1. **Validar progressão crescente** de XP
2. **Impedir níveis duplicados**
3. **Sugerir próximo nível** automaticamente
4. **Exibir progressão visual** na tabela

### Validações Especiais

#### Validador de XP Crescente

Ao criar/editar, validar que:
- XP do nível N > XP do nível N-1
- Não pode editar XP para valor menor que o nível anterior

#### Validador de Nível Único

Impedir criação de nível já existente no jogo.

### Funcionalidades Extras (Recomendado)

#### Auto-sugestão de Próximo Nível

Ao clicar em "Novo Nível":
- Detectar último nível cadastrado
- Pré-preencher campo `nivel` com próximo número
- Sugerir XP baseado em progressão (ex: +1000 XP)

#### Cálculo de Diferença na Tabela

Exibir coluna "Δ XP" mostrando diferença para nível anterior.

### Responsabilidades

- Estender `BaseConfigComponent<NivelConfig, NivelConfigService>`
- Implementar validadores customizados de progressão
- Auto-sugerir próximo nível
- Ordenar tabela por nível (sempre)

### Critérios de Aceitação

- [ ] Componente estende `BaseConfigComponent`
- [ ] Validador de XP crescente implementado
- [ ] Validador de nível único implementado
- [ ] Auto-sugestão de próximo nível funcional
- [ ] Tabela sempre ordenada por nível ascendente

---

## Issue #03.4: Criar Template do Componente

**Arquivo**: `src/app/features/mestre/pages/config/configs/niveis-config.component.html`

### Descrição

Criar template usando `<app-base-config-template>` com customizações específicas.

### Seções Customizadas

#### Título e Subtítulo
- Ícone: `pi pi-chart-line`
- Título: "Níveis"
- Subtítulo: "Configure a progressão de experiência e recompensas por nível"

#### Tabela
Colunas:
- Nível (sortable, sempre crescente)
- XP Necessária (formato com separador de milhares)
- Δ XP (diferença para nível anterior) - **calculado**
- Pontos Atributo
- Pontos Aptidão
- Limitador Atributo
- Ativo
- Ações

#### Formatação Especial na Tabela

**XP Necessária**: Formatar números grandes
- 1000 → "1.000"
- 50000 → "50.000"

**Δ XP**: Exibir com cor
- Verde: Progressão normal
- Amarelo: Salto muito grande
- Não exibir para nível 1

**Limitador Atributo**: Highlight se mudar
- Ex: Se passou de 10 para 15, destacar

#### Formulário
Campos:
- Nível (inputNumber, min=0, step=1, **auto-sugerido**)
- XP Necessária (inputNumber, min=0, **validação de progressão**)
- Pontos de Atributo (inputNumber, min=0, default=1)
- Pontos de Aptidão (inputNumber, min=0, default=2)
- Limitador de Atributo (inputNumber, min=1, default=10)
- Ativo (checkbox)

#### Dicas no Formulário

Adicionar `<small>` informativos:
- "XP acumulada necessária para atingir este nível"
- "Quantos pontos o jogador ganha para distribuir em atributos"
- "Valor máximo que um atributo pode ter neste nível"

### Critérios de Aceitação

- [ ] Template usa `<app-base-config-template>`
- [ ] Tabela ordenada por nível sempre
- [ ] Coluna Δ XP calculada e exibida
- [ ] Números formatados com separador
- [ ] Formulário com auto-sugestão de nível
- [ ] Dicas informativas em campos complexos
- [ ] Validações exibidas corretamente

---

## Issue #03.5: Adicionar Validadores Customizados

**Arquivo**: `src/app/shared/validators/nivel-validators.ts` (novo)

### Descrição

Criar validadores específicos para Níveis que serão usados no formulário.

### Validadores a Criar

#### `progressiveXpValidator`

**Objetivo**: Garantir que XP é maior que o nível anterior.

**Inputs**:
- Lista de níveis existentes
- Nível atual sendo editado (para excluir da comparação)

**Lógica**:
- Buscar nível imediatamente anterior
- Comparar XP necessária
- Retornar erro se não for crescente

#### `uniqueLevelValidator`

**Objetivo**: Garantir que número do nível não está duplicado.

**Inputs**:
- Lista de níveis existentes
- ID do nível atual (null se criando)

**Lógica**:
- Verificar se já existe nível com mesmo número
- Excluir o nível atual da verificação (se editando)
- Retornar erro se duplicado

### Critérios de Aceitação

- [ ] Arquivo de validadores criado
- [ ] `progressiveXpValidator` implementado
- [ ] `uniqueLevelValidator` implementado
- [ ] Funções retornam `ValidationErrors | null`
- [ ] Mensagens de erro descritivas
- [ ] Exportado no barrel file de validators

---

## Issue #03.6: Adicionar Rota

**Arquivo**: `src/app/features/mestre/mestre.routes.ts`

### Descrição

Adicionar rota para o componente de Níveis.

### Rota

```
/mestre/config/niveis (NiveisConfigComponent)
```

### Critérios de Aceitação

- [ ] Rota adicionada com guards
- [ ] Título: "Configurações - Níveis"

---

## Issue #03.7: Atualizar Menu de Navegação

**Arquivo**: `src/app/features/mestre/pages/config/config-sidebar.component.ts`

### Descrição

Adicionar item no menu lateral.

### Item do Menu

- Label: "Níveis"
- Icon: "pi pi-chart-line"
- RouterLink: "/mestre/config/niveis"
- Badge: Quantidade de níveis ativos (opcional)

### Critérios de Aceitação

- [ ] Item adicionado
- [ ] Ícone apropriado
- [ ] RouterLink correto

---

## 🧪 Testes Manuais

### Cenário 1: Criar Progressão de Níveis

1. Login como Mestre, selecionar jogo
2. Navegar para Níveis
3. Criar Nível 1 com XP 0
4. Criar Nível 2 com XP 1000
5. Criar Nível 3 com XP 3000
6. **Esperado**: Tabela ordenada, Δ XP exibido corretamente

### Cenário 2: Validação de XP Não Crescente

1. Criar Nível 1 com XP 0
2. Criar Nível 2 com XP 1000
3. Tentar criar Nível 3 com XP 500 (menor que nível 2)
4. **Esperado**: Erro de validação impedindo salvar

### Cenário 3: Nível Duplicado

1. Criar Nível 1
2. Tentar criar outro Nível 1
3. **Esperado**: Erro de validação, não permite

### Cenário 4: Auto-sugestão

1. Criar Níveis 1, 2, 3
2. Clicar em "Novo Nível"
3. **Esperado**: Campo nível pré-preenchido com "4"

### Cenário 5: Edição de Nível Intermediário

1. Criar Níveis 1 (0 XP), 2 (1000 XP), 3 (3000 XP)
2. Editar Nível 2 para 2500 XP
3. **Esperado**: Salva com sucesso (ainda é progressivo)
4. Editar Nível 2 para 3500 XP (maior que nível 3)
5. **Esperado**: Erro de validação (quebra progressão)

---

## 📚 Referências

- **Backend Controller**: `NivelController.java`
- **Backend Schema**: `api.json` linha 3288
- **Validadores Genéricos**: `src/app/shared/validators/config-validators.ts`

---

## ✅ Checklist de Conclusão

- [ ] #03.1: NivelConfigService criado
- [ ] #03.2: Interface NivelConfig atualizada
- [ ] #03.3: NiveisConfigComponent criado
- [ ] #03.4: Template HTML criado
- [ ] #03.5: Validadores customizados criados
- [ ] #03.6: Rota adicionada
- [ ] #03.7: Menu atualizado
- [ ] Validação de progressão funciona
- [ ] Auto-sugestão funciona
- [ ] Coluna Δ XP calculada corretamente
- [ ] Todos os testes manuais passando
