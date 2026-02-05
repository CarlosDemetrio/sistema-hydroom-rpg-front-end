# 📑 Índice de Tasks - Sistema de Configurações

**Última atualização**: 2026-02-05  
**Status**: ✅ Planejamento Completo

---

## 🗂️ Estrutura de Documentação

```
planning/config-system-refactor/
├── README.md                          # Visão geral do planejamento
├── spec.md                            # Especificação completa do sistema
├── tasks.md                           # Índice principal de tasks
├── INDEX.md                           # Este arquivo (navegação rápida)
└── tasks/
    ├── 00-infrastructure-generic.md   # INF-0: Infraestrutura genérica
    ├── 01-atributos.md               # Task 01: Atributos Config
    ├── 02-aptidoes.md                # Task 02: Aptidões + Tipos Config
    ├── 03-niveis.md                  # Task 03: Níveis Config
    └── 04-13-resumo-configs.md       # Tasks 04-13: Demais configurações
```

---

## 🚀 Quick Start

### Para Começar o Planejamento

1. **Leia primeiro**: [README.md](./README.md) - Visão geral completa
2. **Entenda o problema**: [spec.md](./spec.md) - Especificação detalhada
3. **Veja a infraestrutura**: [tasks/00-infrastructure-generic.md](./tasks/00-infrastructure-generic.md)

### Para Implementar

**Ordem obrigatória**:

1. ⚠️ **PRIMEIRO**: [INF-0: Infraestrutura Genérica](./tasks/00-infrastructure-generic.md)
2. Depois: INF-1, INF-2, INF-3 (descritas no [tasks.md](./tasks.md))
3. Por fim: Tasks de configuração (01, 02, 03, 04-13)

---

## 📋 Tasks de Infraestrutura

| Task | Arquivo | Prioridade | Estimativa |
|------|---------|------------|------------|
| **INF-0** | [00-infrastructure-generic.md](./tasks/00-infrastructure-generic.md) | 🔴 CRÍTICA | 15-20h |
| **INF-1** | Descrito em [tasks.md](./tasks.md#task-inf-1) | 🔴 CRÍTICA | 6h |
| **INF-2** | Descrito em [tasks.md](./tasks.md#task-inf-2) | 🔴 CRÍTICA | 4h |
| **INF-3** | Descrito em [tasks.md](./tasks.md#task-inf-3) | 🟠 ALTA | 3h |

**Total Infraestrutura**: ~28-33 horas

---

## 📦 Tasks de Configurações

### Detalhadas (Modelos de Referência)

| Task | Config | Arquivo | Complexidade | Estimativa |
|------|--------|---------|--------------|------------|
| **01** | Atributos | [01-atributos.md](./tasks/01-atributos.md) | 🟢 Baixa | 4h |
| **02** | Aptidões + Tipos | [02-aptidoes.md](./tasks/02-aptidoes.md) | 🟡 Média | 5h |
| **03** | Níveis | [03-niveis.md](./tasks/03-niveis.md) | 🟡 Média | 5h |

**Subtotal**: 14 horas

### Resumidas (Seguem Mesmo Padrão)

| Task | Config | Complexidade | Estimativa | Link |
|------|--------|--------------|------------|------|
| **04** | Classes | 🟢 Baixa | 5h | [Resumo](./tasks/04-13-resumo-configs.md#task-04-classes-config) |
| **05** | Raças | 🟢 Baixa | 5h | [Resumo](./tasks/04-13-resumo-configs.md#task-05-raças-config) |
| **06** | Vantagens | 🟡 Média | 6h | [Resumo](./tasks/04-13-resumo-configs.md#task-06-vantagens-config) |
| **07** | Bônus | 🟢 Baixa | 5h | [Resumo](./tasks/04-13-resumo-configs.md#task-07-bônus-config) |
| **08** | Prospecção | 🟡 Média | 5h | [Resumo](./tasks/04-13-resumo-configs.md#task-08-prospecção-config-dados) |
| **09** | Presenças | 🟢 Baixa | 4h | [Resumo](./tasks/04-13-resumo-configs.md#task-09-presenças-config) |
| **10** | Gêneros | 🟢 Baixa | 3h | [Resumo](./tasks/04-13-resumo-configs.md#task-10-gêneros-config) |
| **11** | Índoles | 🟢 Baixa | 3h | [Resumo](./tasks/04-13-resumo-configs.md#task-11-índoles-config) |
| **12** | Membros do Corpo | 🔴 Alta | 5h | [Resumo](./tasks/04-13-resumo-configs.md#task-12-membros-do-corpo-config) |

**Subtotal**: 41 horas

---

## ⏱️ Estimativa Total

| Fase | Horas |
|------|-------|
| Infraestrutura (INF-0 a INF-3) | 28-33h |
| Configs Detalhadas (01-03) | 14h |
| Configs Resumidas (04-12) | 41h |
| **TOTAL DESENVOLVIMENTO** | **83-88h** |
| Testes E2E e Docs | +8h |
| **TOTAL GERAL** | **91-96h** |

**Conversão em dias úteis** (6h/dia): ~15-16 dias  
**Conversão em semanas** (5 dias/semana): ~3-4 semanas

---

## 🎯 Ordem de Implementação Recomendada

### Sprint 0 (Dias 1-3): Infraestrutura

```
DIA 1-2: INF-0 (Infraestrutura Genérica)
DIA 3:   INF-1 (Business Services) + INF-2 (API Service)
DIA 4:   INF-3 (Facade Service)
```

### Sprint 1 (Dias 5-8): Configs Modelo

```
DIA 5:   Task 01 (Atributos) - MODELO DE REFERÊNCIA
DIA 6:   Task 02 (Aptidões)
DIA 7:   Task 03 (Níveis)
DIA 8:   Ajustes e revisão
```

### Sprint 2 (Dias 9-12): Configs Simples

```
DIA 9:   Task 10 (Gêneros) + Task 11 (Índoles)
DIA 10:  Task 09 (Presenças) + Task 07 (Bônus)
DIA 11:  Task 04 (Classes) + Task 05 (Raças)
DIA 12:  Revisão
```

### Sprint 3 (Dias 13-15): Configs Complexas

```
DIA 13:  Task 06 (Vantagens)
DIA 14:  Task 08 (Prospecção) + Task 12 (Membros do Corpo)
DIA 15:  Ajustes finais
```

### Sprint 4 (Dia 16): Qualidade

```
DIA 16:  Testes E2E, documentação, deploy
```

---

## 📊 Por Complexidade

### 🟢 Baixa (7 configs) - ~29h

- Gêneros (3h)
- Índoles (3h)
- Presenças (4h)
- Atributos (4h)
- Bônus (5h)
- Classes (5h)
- Raças (5h)

### 🟡 Média (3 configs) - ~16h

- Aptidões (5h)
- Níveis (5h)
- Prospecção (5h)
- Vantagens (6h)

### 🔴 Alta (1 config) - ~5h

- Membros do Corpo (5h) - Validação de soma de porcentagens

---

## 🔍 Como Usar Este Índice

### Eu sou Desenvolvedor - Vou Implementar

1. Comece por [tasks/00-infrastructure-generic.md](./tasks/00-infrastructure-generic.md)
2. Siga para [tasks.md](./tasks.md) para INF-1, INF-2, INF-3
3. Use [tasks/01-atributos.md](./tasks/01-atributos.md) como **modelo de referência**
4. Para demais configs, use [tasks/04-13-resumo-configs.md](./tasks/04-13-resumo-configs.md)

### Eu sou PM - Quero Estimar

- **Total**: 91-96 horas (~16 dias úteis)
- **Sprints**: 4 sprints de 4 dias cada
- **Equipe**: 1 dev full-time = 4 semanas
- **Equipe**: 2 devs = 2 semanas

### Eu sou Arquiteto - Quero Revisar

1. Leia [spec.md](./spec.md) primeiro
2. Revise arquitetura em [tasks/00-infrastructure-generic.md](./tasks/00-infrastructure-generic.md)
3. Valide padrões em [tasks/01-atributos.md](./tasks/01-atributos.md)

---

## 📞 Ajuda Rápida

### Não sei por onde começar
→ Leia [README.md](./README.md)

### Quero entender o problema
→ Leia [spec.md](./spec.md)

### Vou implementar INF-0
→ [tasks/00-infrastructure-generic.md](./tasks/00-infrastructure-generic.md)

### Vou implementar uma config
→ Use [tasks/01-atributos.md](./tasks/01-atributos.md) como modelo

### Preciso de um resumo rápido
→ Este arquivo (INDEX.md)

### Quero ver todas as tasks
→ [tasks.md](./tasks.md)

---

**Pronto para começar?** Leia [README.md](./README.md) e depois [INF-0](./tasks/00-infrastructure-generic.md)! 🚀
