# TASKS 04-13: Configurações Restantes - Guia de Expansão

**Status**: 📝 Planejamento - REQUER EXPANSÃO INDIVIDUAL  
**Dependências**: INF-0, INF-1, INF-2, INF-3  

---

## 🤖 PROMPT PADRÃO PARA GERAÇÃO (Use em TODAS as tasks 04-13)

```
Atue como um Arquiteto de Software Especialista em Angular 21 e PrimeNG 21.

Gere os artefatos de código para o componente: [NOME]ConfigComponent

### 1. Contexto de Estilização (CRÍTICO)
* **Tema:** PrimeNG Custom Preset (Aura/Lara) configurado globalmente.
* **Regra de Ouro:** NÃO force cores hexadecimais ou classes de cores arbitrárias do Tailwind (ex: evite `bg-blue-600`).
* **Uso de Tokens:** Utilize as classes utilitárias semânticas do PrimeNG ou classes do Tailwind que mapeiam para variáveis CSS do tema:
    * Use `surface-card`, `surface-border`, `surface-ground`, `text-color`, `text-color-secondary`.
    * Para cores primárias, confie no comportamento padrão do componente (que puxará a cor do Preset) ou use `text-primary`.
* **Responsividade:** Utilize o sistema de grid do PrimeNG ou Flexbox com Tailwind (`flex`, `grid`, `gap-4`, `col-12`, `md:col-6`).

### 2. Angular 21 - Modern Core (Strict Signals)
* **Inputs/Outputs:** Use APENAS a API de Signals:
    * `input()`, `input.required()`
    * `output()` (no lugar de `@Output` EventEmitter)
    * `model()` (para two-way binding, se aplicável)
* **Queries:** `viewChild()`, `contentChild()` (obrigatório signal-based).
* **DI:** Use `inject(ServiceType)` (nada de construtor).
* **Forms:** Use `ReactiveFormsModule` com **Typed Forms**.
* **Control Flow:** `@if`, `@for`, `@switch` (proibido usar `*ngIf`, `*ngFor`).

### 3. PrimeNG 21 Best Practices
* **Componentes:** Use componentes Standalone.
* **Iconografia:** Use PrimeIcons (ex: `pi pi-check`).
* **Propriedades:** Utilize a propriedade `fluid` (se disponível na v21 para o componente) ou a classe `p-fluid` no container para garantir largura total em mobile.
* **Acessibilidade:** Garanta que todos os inputs tenham `aria-label` ou `id` conectado a um `label`.

### 4. Entregáveis (Formato Copy-Paste para IntelliJ)
Gere os arquivos abaixo separadamente. Não use blocos de código únicos.

#### A. `[nome]-config.component.ts`
* Lógica limpa.
* `ChangeDetectionStrategy.OnPush`.
* Imports enxutos.
* Estende BaseConfigComponent<[Config], [ConfigService]>.

#### B. `[nome]-config.component.html`
* Template responsivo.
* Uso correto de ng-template se necessário (ex: body de tabelas).

---
**Descrição da Funcionalidade Desejada:**
[INSIRA AQUI O QUE O COMPONENTE FAZ]
```

---

## ⚠️ IMPORTANTE

Este documento lista os **schemas do backend** (extraídos de `api.json`) para cada uma das 10 configurações restantes. 

**NÃO use este resumo para implementação!** Cada task deve ser expandida em arquivo individual seguindo o modelo detalhado de:
- **TASK 01** (Atributos) - [tasks/01-atributos.md](./01-atributos.md)
- **TASK 04** (Classes) - [tasks/04-classes.md](./04-classes.md)

---

## 📋 Padrão Comum a Todas

Cada configuração deve ter arquivo individual com 6 sub-issues:

1. **Criar XXXConfigService** - Business Service estendendo `BaseConfigService<T>`
2. **Atualizar Interface TypeScript** - Refletir schema do backend EXATAMENTE
3. **Criar XXXConfigComponent** - Componente estendendo `BaseConfigComponent<T,S>`
4. **Criar Template HTML** - Usando `<app-base-config-template>`
5. **Adicionar Rota** - Em `mestre.routes.ts`
6. **Atualizar Menu** - Em `config-sidebar.component.ts`

**Use como modelo**: [tasks/04-classes.md](./04-classes.md)


---

## TASK 04: Classes Config ✅

**Arquivo Detalhado**: [tasks/04-classes.md](./04-classes.md)

Schema já documentado no arquivo individual.

---

## TASK 05: Raças Config

**Estimativa**: 4 horas  
**Icon**: `pi pi-users`  
**Arquivo a Criar**: `tasks/05-racas.md`

### Schema Backend EXATO (api.json linha 3203)

```json
{
  "id": "integer(int64)",
  "jogo": "Jogo (required)",
  "nome": "string (minLength: 2, maxLength: 100, required)",
  "descricao": "string (maxLength: 2000)",
  "ordemExibicao": "integer(int32)",
  "ativo": "boolean",
  "createdAt": "date-time",
  "updatedAt": "date-time"
}
```

**Campos obrigatórios**: `jogo`, `nome`

### Diferenças vs Classes

**Nenhuma!** Schema é **idêntico** a Classes. 

### Particularidades

- Representa raça/espécie do personagem (Humano, Elfo, Anão, etc.)
- Exemplos de descrição: características físicas, cultura, expectativa de vida
- Estrutura e validações **exatamente iguais** a Classes
- Pode compartilhar código/template com Classes no futuro

### Como Expandir

Copiar `04-classes.md` e ajustar:
- Trocar "Classe" por "Raça"
- Ícone: `pi pi-users`
- Endpoint: `/configuracoes/racas`
- Exemplos: "Humano", "Elfo", "Anão"
- Descrição no formulário: "Descreva a raça, suas características físicas e culturais"

---

## TASK 06: Vantagens Config

**Estimativa**: 6 horas  
**Icon**: `pi pi-star-fill`  
**Arquivo a Criar**: `tasks/06-vantagens.md`

### Schema Backend EXATO (api.json linha 3105)

```json
{
  "id": "integer(int64)",
  "jogo": "Jogo (required)",
  "nome": "string (maxLength: 100, required)",
  "descricao": "string (maxLength: 1000)",
  "nivelMaximo": "integer(int32, minimum: 1, required)",
  "formulaCusto": "string (maxLength: 100, required)",
  "descricaoEfeito": "string (maxLength: 500)",
  "ordemExibicao": "integer(int32)",
  "ativo": "boolean",
  "createdAt": "date-time",
  "updatedAt": "date-time"
}
```

**Campos obrigatórios**: `jogo`, `nome`, `nivelMaximo`, `formulaCusto`

### Particularidades IMPORTANTES

1. **nivelMaximo**: Vantagem pode ter múltiplos níveis
   - Ex: "Pontos de Vida Extra I" (nível 1), "Pontos de Vida Extra II" (nível 2)
   - Validação: `min(1)`

2. **formulaCusto**: Campo **obrigatório**, fórmula de cálculo do custo
   - Ex: "nivel * 10" (nível 1 = 10, nível 2 = 20)
   - Campo de texto por enquanto (futuramente editor de fórmulas)
   - Validação: `required`, `maxLength(100)`

3. **descricaoEfeito**: Separado de `descricao`
   - `descricao`: O que é a vantagem
   - `descricaoEfeito`: O que ela faz mecanicamente
   - MaxLength: 500

### Validações Específicas

- Nome: maxLength 100 (não 50!)
- Nível Máximo: required, min(1)
- Fórmula Custo: required, maxLength(100)

### Formulário Extra

Campo `nivelMaximo` merece destaque visual - indica se vantagem pode ser comprada múltiplas vezes.

---

## TASK 07: Bônus Config

**Estimativa**: 4 horas  
**Icon**: `pi pi-plus-circle`  
**Arquivo a Criar**: `tasks/07-bonus.md`

### Schema Backend EXATO (api.json linha 3561)

```json
{
  "id": "integer(int64)",
  "jogo": "Jogo (required)",
  "nome": "string (maxLength: 50, required)",
  "descricao": "string (maxLength: 500)",
  "formulaBase": "string (maxLength: 200)",
  "ordemExibicao": "integer(int32)",
  "ativo": "boolean",
  "createdAt": "date-time",
  "updatedAt": "date-time"
}
```

**Campos obrigatórios**: `jogo`, `nome`

**ATENÇÃO**: No schema, falta listar explicitamente quais são os `required`, mas pelo padrão assume-se `jogo` e `nome`.

### Particularidades

- Bônus são **modificadores genéricos** aplicáveis por raças, classes, vantagens
- `formulaBase`: Campo **opcional** (diferente de Vantagens onde é obrigatório)
- MaxLength: 200 (maior que formulaCusto de Vantagens que é 100)
- Exemplos: "Bônus de Força por Raça", "Resistência a Fogo"

### Validações

- Nome: maxLength 50
- Descrição: maxLength 500
- FormulaBase: **opcional**, maxLength 200

---

## TASK 08: Prospecção Config (Dados)

**Estimativa**: 5 horas  
**Icon**: `pi pi-box`  
**Arquivo a Criar**: `tasks/08-prospeccao.md`

### Schema Backend EXATO (api.json linha 3472)

```json
{
  "id": "integer(int64)",
  "jogo": "Jogo (required)",
  "nome": "string (maxLength: 20, required)",
  "descricao": "string (maxLength: 200)",
  "numeroFaces": "integer(int32, minimum: 1, maximum: 100, required)",
  "ordemExibicao": "integer(int32)",
  "ativo": "boolean",
  "createdAt": "date-time",
  "updatedAt": "date-time"
}
```

**Campos obrigatórios**: `jogo`, `nome`, `numeroFaces`

### Particularidades IMPORTANTES

1. **numeroFaces**: Campo **obrigatório**
   - Define tipo de dado (d4, d6, d8, d10, d12, d20, d100)
   - Validação: `min(1)`, `max(100)`
   - **Sugestão**: Select com opções comuns + InputNumber para custom

2. **nome**: MaxLength **20** (bem menor que outras configs!)
   - Exemplos curtos: "d6", "d20", "Dado de Vida"

3. **descricao**: MaxLength **200** (não 500!)

### Formulário Especial

Campo `numeroFaces` deve ter UX especial:
- **Opção A**: Select com [4, 6, 8, 10, 12, 20, 100] + opção "Outro"
- **Opção B**: InputNumber com sugestões visuais
- **Opção C**: Botões rápidos para valores comuns + input manual

### Validação Extra (Recomendada)

Avisar se `numeroFaces` não é valor comum (não está em [4,6,8,10,12,20,100]).

---

## TASK 09: Presenças Config

**Estimativa**: 4 horas  
**Icon**: `pi pi-sun`  
**Arquivo a Criar**: `tasks/09-presencas.md`

### Schema Backend EXATO (api.json linha 3245)

```json
{
  "id": "integer(int64)",
  "jogo": "Jogo (required)",
  "nome": "string (maxLength: 50, required)",
  "descricao": "string (maxLength: 200)",
  "ordem": "integer(int32, required)",
  "ativo": "boolean (required)",
  "createdAt": "date-time",
  "updatedAt": "date-time"
}
```

**Campos obrigatórios**: `ativo`, `jogo`, `nome`, `ordem`

### Particularidades CRÍTICAS

⚠️ **DIFERENÇA IMPORTANTE**: Campo é `ordem`, **NÃO** `ordemExibicao`!

- Outras configs: `ordemExibicao` (opcional)
- Presenças: `ordem` (obrigatório!)

### Validações

- Nome: maxLength 50
- Descrição: maxLength 200 (não 500!)
- Ordem: **required**, min(1), uniqueOrder
- Ativo: **required** (diferente de outras que é opcional/default)

### Interface TypeScript

**ATENÇÃO**: Não estender `NamedConfig` pois campo é `ordem` não `ordemExibicao`!

Opções:
1. Criar campo `ordem` e `ordemExibicao?: never` na interface
2. Estender `JogoScopedConfig` diretamente e adicionar campos manualmente

---

## TASK 10: Gêneros Config

**Estimativa**: 3 horas  
**Icon**: `pi pi-id-card`  
**Arquivo a Criar**: `tasks/10-generos.md`

### Schema Backend EXATO (api.json linha 3429)

```json
{
  "id": "integer(int64)",
  "jogo": "Jogo (required)",
  "nome": "string (maxLength: 50, required)",
  "descricao": "string (maxLength: 200)",
  "ordem": "integer(int32, required)",
  "ativo": "boolean (required)",
  "createdAt": "date-time",
  "updatedAt": "date-time"
}
```

**Campos obrigatórios**: `ativo`, `jogo`, `nome`, `ordem`

### Particularidades

- Schema **idêntico** a Presenças!
- Mesma observação: campo é `ordem` (obrigatório), não `ordemExibicao`
- Exemplos: "Masculino", "Feminino", "Não-binário"
- Configuração **mais simples** de todas

### Validações

- Idênticas a Presenças
- Nome: maxLength 50, uniqueName
- Ordem: required, min(1), uniqueOrder

---

## TASK 11: Índoles Config

**Estimativa**: 3 horas  
**Icon**: `pi pi-compass`  
**Arquivo a Criar**: `tasks/11-indoles.md`

### Schema Backend EXATO (api.json linha 3386)

```json
{
  "id": "integer(int64)",
  "jogo": "Jogo (required)",
  "nome": "string (maxLength: 50, required)",
  "descricao": "string (maxLength: 200)",
  "ordem": "integer(int32, required)",
  "ativo": "boolean (required)",
  "createdAt": "date-time",
  "updatedAt": "date-time"
}
```

**Campos obrigatórios**: `ativo`, `jogo`, `nome`, `ordem`

### Particularidades

- Schema **idêntico** a Gêneros e Presenças!
- Representa alinhamento/índole do personagem
- Exemplos: "Bom", "Neutro", "Mal", ou sistema D&D (Leal Bom, etc.)
- Mestre pode criar sistema customizado

---

## TASK 12: Membros do Corpo Config

**Estimativa**: 6 horas  
**Icon**: `pi pi-user`  
**Arquivo a Criar**: `tasks/12-membros-corpo.md`

### Schema Backend EXATO (api.json linha 3344)

```json
{
  "id": "integer(int64)",
  "jogo": "Jogo (required)",
  "nome": "string (maxLength: 50, required)",
  "porcentagemVida": "number (minimum: 0.01, maximum: 1, required)",
  "ordemExibicao": "integer(int32)",
  "ativo": "boolean",
  "createdAt": "date-time",
  "updatedAt": "date-time"
}
```

**Campos obrigatórios**: `jogo`, `nome`, `porcentagemVida`

### Particularidades CRÍTICAS

⚠️ **CAMPO ESPECIAL**: `porcentagemVida` é **número decimal** (0.01 a 1.0)!

1. **porcentagemVida**: 
   - Type: `number` (não integer!)
   - Range: 0.01 (1%) a 1.0 (100%)
   - Representa porcentagem da vida total do personagem
   - Ex: Cabeça = 0.15 (15%), Braço = 0.10 (10%)

2. **Validação Global Especial**:
   - Soma de `porcentagemVida` de todos membros **ativos** deve ser ≤ 1.0 (100%)
   - Validação deve ser feita no componente (não dá pra fazer no formulário isolado)

3. **UX do Campo**:
   - InputNumber com mode="decimal"
   - MinFractionDigits: 2, MaxFractionDigits: 2
   - Suffix: "%" (exibir como porcentagem)
   - Conversão: Backend espera 0.15, exibir como "15%"

### Validações Complexas

1. **Validação de Campo**:
   - Min: 0.01 (1%)
   - Max: 1.0 (100%)
   - Step: 0.01

2. **Validação Global** (ao salvar):
   - Calcular soma de todos membros ativos (incluindo o atual)
   - Se soma > 1.0, exibir erro
   - Mensagem: "A soma das porcentagens excede 100%. Total atual: X%"

### Funcionalidade Extra (Recomendada)

**Rodapé da Tabela**: Exibir total de porcentagens
```
Total: 85% (15% disponível)
```

Cor:
- Verde se < 90%
- Amarelo se 90-100%
- Vermelho se > 100%

---

## 📊 Tabela Comparativa de Schemas (Baseada em api.json)

| Config | maxLen Nome | Campo Ordem | Campos Especiais | Complexidade |
|--------|-------------|-------------|------------------|--------------|
| Classes | 100 | `ordemExibicao` (opcional) | descricao maxLen 2000 | 🟢 Baixa |
| Raças | 100 | `ordemExibicao` (opcional) | descricao maxLen 2000 | 🟢 Baixa |
| Vantagens | 100 | `ordemExibicao` (opcional) | nivelMaximo, formulaCusto (req), descricaoEfeito | 🟡 Média |
| Bônus | 50 | `ordemExibicao` (opcional) | formulaBase (opcional) | 🟢 Baixa |
| Prospecção | 20 | `ordemExibicao` (opcional) | numeroFaces (req, 1-100) | 🟡 Média |
| Presenças | 50 | `ordem` (required!) | descricao maxLen 200 | 🟢 Baixa |
| Gêneros | 50 | `ordem` (required!) | descricao maxLen 200 | 🟢 Baixa |
| Índoles | 50 | `ordem` (required!) | descricao maxLen 200 | 🟢 Baixa |
| Membros | 50 | `ordemExibicao` (opcional) | porcentagemVida (decimal 0.01-1.0, req) | 🔴 Alta |

### ⚠️ Diferenças Críticas a Observar

1. **Campo Ordem**: 3 configs (Presenças, Gêneros, Índoles) usam `ordem` (obrigatório), demais usam `ordemExibicao` (opcional)
2. **MaxLength Nome**: Varia entre 20 (Prospecção), 50 (maioria), 100 (Classes/Raças/Vantagens)
3. **MaxLength Descrição**: 200 ou 500 ou 1000 ou 2000 - verificar para cada!
4. **Ativo**: Presenças, Gêneros, Índoles têm `ativo` como **required**

---

## 📊 Resumo de Schemas

| Task | Config | Complexidade | Motivo |
|------|--------|--------------|--------|
| 04 | Classes | 🟢 Baixa | Simples, campos padrão |
| 05 | Raças | 🟢 Baixa | Idêntico a Classes |
| 06 | Vantagens | 🟡 Média | Níveis múltiplos, fórmula de custo |
| 07 | Bônus | 🟢 Baixa | Simples, fórmula opcional |
| 08 | Prospecção | 🟡 Média | Select de dados, validação de faces |
| 09 | Presenças | 🟢 Baixa | Simples, ordem obrigatória |
| 10 | Gêneros | 🟢 Baixa | Mais simples de todas |
| 11 | Índoles | 🟢 Baixa | Idêntico a Gêneros |
| 12 | Membros | 🔴 Alta | Porcentagem decimal, validação de soma total |

---

## 🔄 Ordem de Implementação Sugerida

### Grupo 1: Simples (Tasks 10, 11, 09)
Começar pelas mais simples para ganhar velocidade.

### Grupo 2: Padrão (Tasks 04, 05, 07)
Configurações padrão sem complexidade extra.

### Grupo 3: Média Complexidade (Tasks 06, 08)
Requerem atenção extra em validações.

### Grupo 4: Complexa (Task 12)
Deixar por último - requer validação global de soma.

---

## 📚 Próximos Passos

1. Expandir cada task acima em arquivo individual (se necessário)
2. Validar schemas com backend (alguns campos podem estar desatualizados)
3. Criar issues específicas para cada sub-tarefa
4. Implementar em ordem sugerida

---

## ✅ Checklist Global

- [ ] TASK 04: Classes Config
- [ ] TASK 05: Raças Config  
- [ ] TASK 06: Vantagens Config
- [ ] TASK 07: Bônus Config
- [ ] TASK 08: Prospecção Config
- [ ] TASK 09: Presenças Config
- [ ] TASK 10: Gêneros Config
- [ ] TASK 11: Índoles Config
- [ ] TASK 12: Membros do Corpo Config
- [ ] Todas configurações funcionando com jogoId
- [ ] Todas validações implementadas
- [ ] Todos componentes no menu de navegação
- [ ] Testes E2E passando
