# 🚀 PRÓXIMOS PASSOS - Implementação

**Data**: 2026-02-05  
**Status**: ✅ Pronto para Começar

---

## ⚠️ IMPORTANTE - Leia Antes de Implementar

Este planejamento foi criado com **descrições detalhadas SEM código** propositalmente para evitar que IAs generativas "alucionem". 

**Regras de Ouro**:
1. ✅ **SEMPRE consulte o arquivo de task específico**
2. ✅ **NUNCA invente schemas** - use o documentado em api.json
3. ✅ **SIGA a ordem** - infraestrutura primeiro
4. ❌ **NÃO copie código dos arquivos de planejamento** - são apenas descrições

---

## 📋 Checklist PRÉ-IMPLEMENTAÇÃO (EXECUTAR AGORA)

### 1. Verificar Services Globais Existentes

#### ToastService
```bash
# Procurar se existe
find src -name "*toast*.service.ts" -o -name "*toast*.ts"
```

**Se encontrar**: Verificar se tem métodos `success()`, `error()`, `warn()`, `info()`  
**Se NÃO encontrar**: Criar antes de começar INF-0

#### LoadingInterceptor
```bash
# Procurar interceptor de loading
find src -name "*loading*.interceptor.ts"
```

**Se encontrar**: Verificar se gerencia loading global  
**Se NÃO encontrar**: Criar antes de começar INF-0

#### ErrorInterceptor
```bash
# Procurar interceptor de erros
find src -name "*error*.interceptor.ts"
```

**Se encontrar**: Verificar se captura erros HTTP e exibe toast  
**Se NÃO encontrar**: Criar antes de começar INF-0

#### CurrentGameService
```bash
# Verificar se existe
ls -la src/app/core/services/current-game.service.ts
```

**Se encontrar**: Verificar signals `currentGameId` e `currentGame`  
**Se NÃO encontrar**: ⚠️ **BLOQUEANTE** - criar este service primeiro!

---

### 2. Verificar Backend

```bash
# Testar endpoints de configuração
curl -X GET "http://localhost:8080/api/v1/configuracoes/atributos?jogoId=1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Verificar**:
- [ ] Endpoint retorna 200
- [ ] Requer `jogoId` no query param
- [ ] Retorna array vazio se não houver dados (não erro)
- [ ] Schema do retorno bate com api.json

---

### 3. Verificar Ambiente

```bash
# Node e npm
node --version  # >= 18
npm --version   # >= 9

# Angular
ng version      # >= 21

# Compilar projeto
npm run build   # Deve compilar sem erros
```

---

## 🎯 Ordem de Implementação

### AGORA: Validações Pré-Implementação

- [ ] Executar checklist acima
- [ ] Confirmar que todos services globais existem
- [ ] Validar backend acessível
- [ ] Projeto compila

---

### DEPOIS: Implementação

#### Fase 0: Services Globais (Se não existirem)

**Se ToastService não existe**:
1. Criar `src/app/services/toast.service.ts`
2. Implementar com Signals
3. Métodos: `success()`, `error()`, `warn()`, `info()`
4. Integrar com PrimeNG Toast

**Se LoadingInterceptor não existe**:
1. Criar `src/app/interceptors/loading.interceptor.ts`
2. Gerenciar loading global em requisições HTTP

**Se ErrorInterceptor não existe**:
1. Criar `src/app/interceptors/error.interceptor.ts`
2. Capturar erros HTTP
3. Exibir toast via ToastService

**Se CurrentGameService não existe**:
1. Criar `src/app/core/services/current-game.service.ts`
2. Signal `currentGameId`
3. Signal `currentGame`
4. Método `setCurrentGame()`

---

#### Fase 1: Infraestrutura Genérica (DIA 1-4)

**Consultar**: [tasks/00-infrastructure-generic.md](./tasks/00-infrastructure-generic.md)

**Ordem obrigatória**:
1. INF-0.1: Interfaces Base
2. INF-0.2: DTOs Genéricos
3. INF-0.3: BaseConfigService
4. INF-0.4: IConfigComponent
5. INF-0.5: BaseConfigComponent
6. INF-0.6: Template Base
7. INF-0.7: Validadores
8. INF-0.8: Form Helpers

**Depois**:
- INF-1: 13 Business Services
- INF-2: ConfigApiService
- INF-3: ConfigFacadeService

---

#### Fase 2: Primeira Configuração (DIA 5)

**Consultar**: [tasks/01-atributos.md](./tasks/01-atributos.md)

**Objetivo**: Validar TODO o fluxo com Atributos.

**Issues**:
1. Criar AtributoConfigService
2. Atualizar interface AtributoConfig
3. Criar AtributosConfigComponent
4. Criar template HTML
5. Adicionar rota
6. Atualizar menu

**Testar manualmente TUDO** antes de prosseguir!

---

#### Fase 3: Demais Configurações (DIA 6-14)

**Ordem sugerida** (do mais simples ao mais complexo):

1. **Simples** (DIA 6-9):
   - Gêneros, Índoles, Presenças
   - Bônus
   - Classes, Raças

2. **Média** (DIA 10-12):
   - Aptidões + Tipos
   - Níveis
   - Vantagens

3. **Complexa** (DIA 13-14):
   - Prospecção
   - Membros do Corpo

---

## 📚 Documentação de Referência

### Documentos Principais

| Documento | Quando Usar |
|-----------|-------------|
| [README.md](./README.md) | Visão geral, antes de começar |
| [INDEX.md](./INDEX.md) | Navegação rápida |
| [VALIDATION.md](./VALIDATION.md) | Checklist de validação (ESTE DOC) |
| [CHECKLIST.md](./CHECKLIST.md) | Acompanhamento durante implementação |

### Tasks de Infraestrutura

| Task | Arquivo |
|------|---------|
| INF-0 | [tasks/00-infrastructure-generic.md](./tasks/00-infrastructure-generic.md) |
| INF-1,2,3 | [tasks.md](./tasks.md) |

### Tasks de Configurações

| Config | Arquivo |
|--------|---------|
| Atributos | [tasks/01-atributos.md](./tasks/01-atributos.md) |
| Aptidões | [tasks/02-aptidoes.md](./tasks/02-aptidoes.md) |
| Níveis | [tasks/03-niveis.md](./tasks/03-niveis.md) |
| Classes | [tasks/04-classes.md](./tasks/04-classes.md) |
| Demais | [tasks/04-13-resumo-configs.md](./tasks/04-13-resumo-configs.md) |

---

## 🎯 Comandos Úteis

### Durante Implementação

```bash
# Compilar e ver erros
npm run build

# Rodar em dev
npm start

# Executar testes
npm test

# Verificar lint
npm run lint

# Criar novo service
ng generate service core/services/business/config/atributo-config --skip-tests

# Criar novo component
ng generate component features/mestre/pages/config/configs/atributos-config --standalone
```

---

## ✅ Checkpoints de Validação

### Checkpoint 1: Após INF-0
- [ ] Todas interfaces base criadas
- [ ] BaseConfigService compila
- [ ] BaseConfigComponent compila
- [ ] Template base existe
- [ ] Projeto compila sem erros

### Checkpoint 2: Após INF-1,2,3
- [ ] 13 Business Services criados
- [ ] ConfigApiService atualizado
- [ ] ConfigFacadeService funciona
- [ ] Testes unitários passam (se existirem)

### Checkpoint 3: Após Task 01 (Atributos)
- [ ] Componente renderiza
- [ ] Formulário valida
- [ ] CRUD completo funciona
- [ ] Toast exibe mensagens
- [ ] Loading funciona
- [ ] Erros são tratados
- [ ] Mudança de jogo recarrega dados

### Checkpoint 4: Após Cada Config
- [ ] Componente funciona
- [ ] Validações específicas ok
- [ ] Rota acessível
- [ ] Menu atualizado

---

## 🚨 Problemas Comuns e Soluções

### Erro: "Cannot find module BaseConfigService"
**Solução**: Verificar se INF-0.3 foi concluída, checar imports

### Erro: "jogoId is required"
**Solução**: Verificar se ConfigApiService foi atualizado (INF-2)

### Toast não aparece
**Solução**: Verificar se ToastService global existe, se app.component.html tem `<p-toast>`

### Loading não aparece
**Solução**: Verificar se LoadingInterceptor está registrado em app.config.ts

### Dados não carregam
**Solução**: 
1. Verificar CurrentGameService retorna jogoId
2. Ver Network tab se requisição envia `?jogoId=X`
3. Verificar backend responde

---

## 📞 Suporte

### Dúvidas sobre Arquitetura
Consultar: [ARCHITECTURE.md](../../ARCHITECTURE.md)

### Dúvidas sobre Padrões
Consultar: [.github/copilot-instructions.md](../../.github/copilot-instructions.md)

### Dúvidas sobre Schema Específico
Consultar: [docs/api.json](../../docs/api.json)

---

## ✅ PRONTO PARA COMEÇAR?

Se você:
- ✅ Executou o checklist pré-implementação
- ✅ Validou que services globais existem
- ✅ Backend está acessível
- ✅ Projeto compila

**Então pode começar!** 🚀

**Primeira task**: [tasks/00-infrastructure-generic.md](./tasks/00-infrastructure-generic.md)

---

**Boa sorte na implementação!** 💪
