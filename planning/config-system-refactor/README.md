# 📋 Planejamento: Refatoração do Sistema de Configurações

## 🎯 Visão Geral

Este planejamento detalha a refatoração completa do sistema de configurações do front-end para corrigir a integração com o backend e implementar o conceito de "Jogo Ativo".

## ⚠️ Problema Atual

- ❌ Endpoints **NÃO** enviam `jogoId` nas requisições
- ❌ Backend **SEMPRE** requer `jogoId` (erro 400 Bad Request)
- ❌ Não há integração com `CurrentGameService`
- ❌ Configurações tratadas como globais, mas são **por jogo**
- ❌ Muito código duplicado entre as 13 configurações

## ✅ Solução Proposta

Criar arquitetura em camadas com **infraestrutura genérica reutilizável**:

```
BaseConfigService<T> (genérico)
    ↓
13 Business Services específicos (herdam da base)
    ↓
ConfigFacadeService (orquestra os 13)
    ↓
BaseConfigComponent<T,S> (genérico)
    ↓
13 Componentes específicos (herdam da base)
```

### 🎁 Benefícios

- ✅ **73% menos código** (2.600 → 690 linhas)
- ✅ **Consistência total** entre todas as configurações
- ✅ **Type-safe** com TypeScript genéricos
- ✅ **Fácil manutenção** - mudança em um lugar afeta todos
- ✅ **Rápida implementação** - cada novo service/componente: 15 minutos

## 📚 Documentação

### Arquivos Principais

| Arquivo | Descrição |
|---------|-----------|
| [spec.md](./spec.md) | Especificação completa do sistema |
| [tasks.md](./tasks.md) | Índice de todas as tasks |
| [tasks/00-infrastructure-generic.md](./tasks/00-infrastructure-generic.md) | **Task INF-0: Infraestrutura Genérica** |

### Tasks de Infraestrutura (Pré-requisitos)

Devem ser executadas **nesta ordem**:

1. **INF-0**: Criar Infraestrutura Genérica ⚠️ **CRÍTICO - PRIMEIRO**
   - Interfaces base, DTOs, classes abstratas
   - Validadores e helpers
   - Template base
   - [Ver detalhes](./tasks/00-infrastructure-generic.md)

2. **INF-1**: Criar 13 Business Services (herdam da base)
   - AtributoConfigService
   - AptidaoConfigService
   - ... (11 restantes)

3. **INF-2**: Atualizar ConfigApiService (adicionar `jogoId`)
   - Todos métodos GET: `?jogoId=X`
   - Todos métodos POST: `{ ...data, jogoId }`

4. **INF-3**: Criar ConfigFacadeService (orquestra os 13)
   - Delega para Business Services
   - Ponto único de entrada para componentes

### Tasks de Componentes (Por Configuração)

Após a infraestrutura, cada configuração tem sua própria task:

| # | Configuração | Endpoint | Status | Task File |
|---|--------------|----------|--------|-----------|
| 1 | Atributos | `/configuracoes/atributos` | ✅ Planejado | [tasks/01-atributos.md](./tasks/01-atributos.md) |
| 2 | Aptidões + Tipos | `/configuracoes/aptidoes` | ✅ Planejado | [tasks/02-aptidoes.md](./tasks/02-aptidoes.md) |
| 3 | Níveis | `/configuracoes/niveis` | ✅ Planejado | [tasks/03-niveis.md](./tasks/03-niveis.md) |
| 4 | Classes | `/configuracoes/classes` | 📝 Resumo | [tasks/04-13-resumo-configs.md](./tasks/04-13-resumo-configs.md#task-04-classes-config) |
| 5 | Raças | `/configuracoes/racas` | 📝 Resumo | [tasks/04-13-resumo-configs.md](./tasks/04-13-resumo-configs.md#task-05-raças-config) |
| 6 | Vantagens | `/configuracoes/vantagens` | 📝 Resumo | [tasks/04-13-resumo-configs.md](./tasks/04-13-resumo-configs.md#task-06-vantagens-config) |
| 7 | Bônus | `/configuracoes/bonus` | 📝 Resumo | [tasks/04-13-resumo-configs.md](./tasks/04-13-resumo-configs.md#task-07-bônus-config) |
| 8 | Prospecção | `/configuracoes/prospeccao` | 📝 Resumo | [tasks/04-13-resumo-configs.md](./tasks/04-13-resumo-configs.md#task-08-prospecção-config-dados) |
| 9 | Presenças | `/configuracoes/presencas` | 📝 Resumo | [tasks/04-13-resumo-configs.md](./tasks/04-13-resumo-configs.md#task-09-presenças-config) |
| 10 | Gêneros | `/configuracoes/generos` | 📝 Resumo | [tasks/04-13-resumo-configs.md](./tasks/04-13-resumo-configs.md#task-10-gêneros-config) |
| 11 | Índoles | `/configuracoes/indoles` | 📝 Resumo | [tasks/04-13-resumo-configs.md](./tasks/04-13-resumo-configs.md#task-11-índoles-config) |
| 12 | Membros do Corpo | `/configuracoes/membros-corpo` | 📝 Resumo | [tasks/04-13-resumo-configs.md](./tasks/04-13-resumo-configs.md#task-12-membros-do-corpo-config) |

### Task de Qualidade

| # | Descrição | Task File |
|---|-----------|-----------|
| 11 | Testes E2E e Documentação | tasks/99-testing-docs.md |

## 📊 Estatísticas

### Por Tipo de Issue

- 🏗️ **Infraestrutura**: 32 issues
- 🔧 **Endpoints**: 24 issues
- 📝 **Formulários**: 22 issues
- ✅ **Testes**: 5 issues
- **Total**: **83 issues**

### Por Sprint

- **Sprint 0**: Infraestrutura Genérica (INF-0) - 1-2 dias
- **Sprint 1**: Fundação (INF-1, INF-2, INF-3) - 2 semanas
- **Sprint 2**: Configs Base (4-6) - 2 semanas
- **Sprint 3**: Configs Avançadas (7-10) - 2 semanas
- **Sprint 4**: Qualidade (11) - 1 semana
- **Total**: **~7 semanas**

## 🚀 Como Começar

### 0. ⚠️ VALIDAÇÃO OBRIGATÓRIA

**ANTES DE IMPLEMENTAR**:
1. 📋 Leia [VALIDATION.md](./VALIDATION.md) - Validação final do planejamento
2. 🚀 Leia [START.md](./START.md) - Checklist pré-implementação e próximos passos

### 1. Entender o Contexto

Leia primeiro:
1. [spec.md](./spec.md) - Entenda o problema e a solução
2. [tasks/00-infrastructure-generic.md](./tasks/00-infrastructure-generic.md) - Veja a infraestrutura genérica

### 2. Executar na Ordem

⚠️ **CRÍTICO**: Siga esta ordem exatamente:

```bash
# Sprint 0 (DIA 1-2)
1. INF-0 (Infraestrutura Genérica) ← FAZER PRIMEIRO!

# Sprint 1 (SEMANA 1-2)
2. INF-1 (13 Business Services)
3. INF-2 (ConfigApiService)
4. INF-3 (ConfigFacadeService)

# Sprint 2 (SEMANA 3-4)
5. Task 4 (Atributos)
6. Task 5 (Aptidões)
7. Task 6 (Níveis)

# Sprint 3 (SEMANA 5-6)
8. Tasks 7-10 (Configs avançadas)

# Sprint 4 (SEMANA 7)
9. Task 11 (Testes e Docs)
```

### 3. Validar Cada Etapa

Após cada task:
- ✅ Código compila sem erros
- ✅ Testes passam
- ✅ Testado manualmente no browser
- ✅ Code review aprovado

## 📐 Padrões e Convenções

### Naming Conventions

| Tipo | Pattern | Exemplo |
|------|---------|---------|
| Interface Config | `{Tipo}Config` | `AtributoConfig` |
| Business Service | `{Tipo}ConfigService` | `AtributoConfigService` |
| Service File | `{tipo}-config.service.ts` | `atributo-config.service.ts` |
| Component | `{Tipos}ConfigComponent` | `AtributosConfigComponent` |
| Component File | `{tipos}-config.component.ts` | `atributos-config.component.ts` |

### Estrutura de Arquivos

```
src/app/
├── core/
│   ├── models/
│   │   ├── config-base.model.ts          (INF-0.1)
│   │   ├── dtos/
│   │   │   └── config-base.dto.ts        (INF-0.2)
│   │   └── atributo-config.model.ts      (atualizar)
│   └── services/
│       ├── api/
│       │   └── config-api.service.ts     (INF-2)
│       └── business/
│           └── config/
│               ├── base-config.service.ts       (INF-0.3)
│               ├── atributo-config.service.ts   (INF-1.1)
│               └── ... (12 outros)
├── features/
│   └── mestre/
│       ├── services/
│       │   └── config-facade.service.ts  (INF-3)
│       └── pages/
│           └── config/
│               └── configs/
│                   ├── atributos-config.component.ts
│                   └── ... (12 outros)
└── shared/
    ├── components/
    │   └── base-config/
    │       ├── base-config.component.ts     (INF-0.5)
    │       └── base-config-template.html    (INF-0.6)
    ├── interfaces/
    │   └── config-component.interface.ts    (INF-0.4)
    ├── validators/
    │   └── config-validators.ts             (INF-0.7)
    └── utils/
        └── form-helpers.ts                  (INF-0.8)
```

## 🔍 Referências

### Backend

- **Controllers**: `/src/main/java/.../controller/configuracao/`
- **Schemas**: `docs/api.json` - OpenAPI 3.1 spec
- **Service**: `ConfiguracaoService.java`

### Frontend Atual

- **API Service**: `src/app/core/services/api/config-api.service.ts`
- **Componentes**: `src/app/features/mestre/pages/config/configs/`
- **CurrentGameService**: `src/app/core/services/current-game.service.ts`

## ❓ FAQ

### Por que criar infraestrutura genérica?

**Sem genéricos**: 2.600 linhas de código repetitivo  
**Com genéricos**: 690 linhas (economia de 73%)

Além disso, garante consistência total e facilita manutenção.

### Por que não um único ConfigBusinessService?

Um service com 13 tipos teria ~2.000 linhas e violaria o Single Responsibility Principle. Ao usar uma classe base genérica, cada service específico tem apenas ~25 linhas.

### Posso pular a Task INF-0?

❌ **NÃO!** Todas as outras tasks dependem dela. Sem INF-0:
- Cada service terá ~200 linhas ao invés de ~25
- Muito código duplicado
- Difícil manter consistência
- ~3 semanas a mais de trabalho

### E se o backend mudar o contrato?

A arquitetura genérica facilita adaptações. Mudanças na classe base afetam todos os 13 tipos automaticamente.

## 📞 Contato

Dúvidas sobre o planejamento? Consulte:
- [spec.md](./spec.md) - Especificação detalhada
- [tasks.md](./tasks.md) - Índice de tasks
- [Architecture Decision Records](../../.specify/plans/) - Decisões de arquitetura

---

**Última atualização**: 2026-02-05  
**Status**: 📝 Em planejamento  
**Estimativa**: 7 semanas (35 dias úteis)
