# Especificação: Refatoração do Sistema de Configurações

## 📋 Visão Geral

**Objetivo**: Corrigir e padronizar o sistema de configurações do front-end para trabalhar corretamente com o conceito de "Jogo Ativo" e enviar o `jogoId` em todas as requisições.

**Problema Atual**: 
- Os endpoints de configuração do backend **SEMPRE** exigem `jogoId` como query parameter
- O front-end atual **NÃO** envia o `jogoId` nas requisições
- Não há integração com o `CurrentGameService` para pegar o jogo ativo
- As configurações são POR JOGO, mas o front-end trata como globais

**Solução Proposta**:
- Criar um `ConfigBusinessService` que integra com `CurrentGameService`
- Atualizar `ConfigApiService` para aceitar `jogoId` em todos os métodos
- Criar um `ConfigFacadeService` para coordenar as operações
- Atualizar todos os componentes de configuração para usar o novo padrão
- Adicionar validações adequadas em cada formulário

## 🎯 Conceito: Configurações por Jogo

### Arquitetura Backend (Atual)
Todos os controllers de configuração seguem o padrão:
```java
@GetMapping
public ResponseEntity<List<Config>> listar(
    @RequestParam Long jogoId) {
    // ...
}

@PostMapping
public ResponseEntity<Config> criar(
    @Valid @RequestBody Config config) {
    // config.jogoId deve estar presente no body
}
```

### Fluxo Esperado no Frontend
1. Usuário seleciona um jogo no header (via `CurrentGameService`)
2. Sistema armazena o `jogoId` atual
3. Todas as requisições de configuração enviam o `jogoId`
4. Componentes exibem apenas configs do jogo ativo
5. Criação/edição vincula automaticamente ao jogo ativo

## 📦 Módulos de Configuração

### 1. **Atributos** (FOR, DES, CON, INT, SAB, CAR)
- **Endpoint**: `/api/v1/configuracoes/atributos?jogoId={id}`
- **Campos**: nome, abreviacao, ordem, formulaCalculo, ativo
- **Validações**: 
  - Nome obrigatório (3-50 chars)
  - Abreviacao obrigatória (2-5 chars, uppercase)
  - Ordem única por jogo
  - Fórmula opcional (validar sintaxe)

### 2. **Aptidões** (Skills)
- **Endpoint**: `/api/v1/configuracoes/aptidoes?jogoId={id}`
- **Campos**: nome, descricao, tipoAptidaoId, atributoBaseId, ordem, ativo
- **Validações**:
  - Nome obrigatório (3-100 chars)
  - TipoAptidao obrigatório (select)
  - AtributoBase obrigatório (select)
  - Ordem única por jogo
  
### 3. **Níveis** (Level Progression)
- **Endpoint**: `/api/v1/configuracoes/niveis?jogoId={id}`
- **Campos**: nivel, xpNecessario, pontosAtributo, pontosAptidao, ativo
- **Validações**:
  - Nível único por jogo
  - XP necessário crescente
  - Pontos >= 0

### 4. **Limitadores** (Limiters)
- **Endpoint**: `/api/v1/configuracoes/limitadores?jogoId={id}`
- **Campos**: nome, descricao, valorLimite, formulaCalculo, ordem, ativo
- **Validações**:
  - Nome obrigatório
  - Valor ou fórmula obrigatório

### 5. **Classes** (Character Classes)
- **Endpoint**: `/api/v1/configuracoes/classes?jogoId={id}`
- **Campos**: nome, descricao, bonusAtributos (JSON), pontosVidaBase, ordem, ativo
- **Validações**:
  - Nome obrigatório (3-100 chars)
  - Pontos de vida >= 1
  - BonusAtributos validar JSON

### 6. **Vantagens** (Advantages/Disadvantages)
- **Endpoint**: `/api/v1/configuracoes/vantagens?jogoId={id}`
- **Campos**: nome, descricao, custo, categoriaId, efeitos (JSON), ordem, ativo
- **Validações**:
  - Nome obrigatório
  - Custo pode ser negativo (desvantagens)
  - Categoria obrigatória

### 7. **Raças** (Races)
- **Endpoint**: `/api/v1/configuracoes/racas?jogoId={id}`
- **Campos**: nome, descricao, bonusAtributos (JSON), habilidadesEspeciais, ordem, ativo
- **Validações**:
  - Nome obrigatório (3-100 chars)
  - BonusAtributos validar JSON

### 8. **Prospecção** (Prospecting Dice)
- **Endpoint**: `/api/v1/configuracoes/prospeccao?jogoId={id}`
- **Campos**: nome, descricao, tipoDado, modificador, ordem, ativo
- **Validações**:
  - Nome obrigatório
  - TipoDado obrigatório (d4, d6, d8, d10, d12, d20)
  - Modificador numérico

### 9. **Presenças** (Presences/Auras)
- **Endpoint**: `/api/v1/configuracoes/presencas?jogoId={id}`
- **Campos**: nome, descricao, efeito, custoAtivacao, ordem, ativo
- **Validações**:
  - Nome obrigatório (3-100 chars)
  - Efeito obrigatório

### 10. **Gêneros** (Genders)
- **Endpoint**: `/api/v1/configuracoes/generos?jogoId={id}`
- **Campos**: nome, descricao, ordem, ativo
- **Validações**:
  - Nome obrigatório (2-50 chars)
  - Nome único por jogo

## 🏗️ Arquitetura de Serviços

### Camadas

```
Component (Dumb)
    ↓
ConfigFacadeService (Coordenação)
    ↓
ConfigBusinessService (Lógica de Negócio + CurrentGameService)
    ↓
ConfigApiService (HTTP)
    ↓
Backend API
```

### ConfigBusinessService (NOVO)
```typescript
@Injectable({ providedIn: 'root' })
export class ConfigBusinessService {
  private currentGameService = inject(CurrentGameService);
  private configApi = inject(ConfigApiService);
  
  // Expõe jogoId atual
  currentGameId = this.currentGameService.currentGameId;
  
  // Métodos que já incluem jogoId automaticamente
  loadAtributos(): Observable<AtributoConfig[]> {
    const jogoId = this.currentGameId();
    if (!jogoId) throw new Error('Nenhum jogo selecionado');
    return this.configApi.listAtributos(jogoId);
  }
  
  // ... similar para todos os tipos de config
}
```

### ConfigApiService (ATUALIZADO)
```typescript
@Injectable({ providedIn: 'root' })
export class ConfigApiService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/configuracoes`;
  
  // TODOS os métodos recebem jogoId
  listAtributos(jogoId: number): Observable<AtributoConfig[]> {
    return this.http.get<AtributoConfig[]>(
      `${this.baseUrl}/atributos`,
      { params: { jogoId: jogoId.toString() } }
    );
  }
  
  createAtributo(jogoId: number, config: Partial<AtributoConfig>): Observable<AtributoConfig> {
    return this.http.post<AtributoConfig>(
      `${this.baseUrl}/atributos`,
      { ...config, jogoId }
    );
  }
  
  // ... similar para todos os endpoints
}
```

### ConfigFacadeService (NOVO)
```typescript
@Injectable({ providedIn: 'root' })
export class ConfigFacadeService {
  private configService = inject(ConfigBusinessService);
  
  // Expõe estados
  currentGameId = this.configService.currentGameId;
  hasCurrentGame = computed(() => !!this.currentGameId());
  
  // Coordena múltiplos services se necessário
  loadAllConfigs(): Observable<ConfigBundle> {
    return forkJoin({
      atributos: this.configService.loadAtributos(),
      aptidoes: this.configService.loadAptidoes(),
      // ...
    });
  }
}
```

## 📝 Padrões de Componentes

### Estrutura de Componente
```typescript
@Component({
  selector: 'app-atributos-config',
  standalone: true,
  // ...
})
export class AtributosConfigComponent implements OnInit {
  private configFacade = inject(ConfigFacadeService);
  private messageService = inject(MessageService);
  
  items = signal<AtributoConfig[]>([]);
  loading = signal(false);
  
  ngOnInit() {
    this.loadData();
  }
  
  private loadData() {
    if (!this.configFacade.hasCurrentGame()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Aviso',
        detail: 'Selecione um jogo primeiro'
      });
      return;
    }
    
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

## 🔄 Fluxo de Dados

### Carregamento
1. Usuário acessa página de configuração (ex: `/mestre/config/atributos`)
2. Componente verifica se há jogo selecionado via `ConfigFacadeService`
3. Se não houver, exibe aviso e não faz requisição
4. Se houver, chama `configFacade.loadAtributos()`
5. Facade delega para `ConfigBusinessService`
6. Business Service pega `jogoId` do `CurrentGameService`
7. Business Service chama `ConfigApiService.listAtributos(jogoId)`
8. API Service faz GET com query parameter `?jogoId=X`

### Criação/Edição
1. Usuário preenche formulário
2. Componente valida dados
3. Componente chama `configFacade.createAtributo(formData)`
4. Facade delega para Business Service
5. Business Service adiciona `jogoId` ao payload
6. API Service faz POST com body `{ ...formData, jogoId: X }`

### Mudança de Jogo
1. Usuário troca jogo no header
2. `CurrentGameService` atualiza signal
3. Effect nos componentes detecta mudança
4. Componentes recarregam dados automaticamente

## 🧪 Validações por Tipo

### Validações Comuns
- **jogoId**: Obrigatório em toda operação
- **nome**: 3-100 caracteres (exceto Gênero: 2-50)
- **ordem**: Número positivo, único por jogo
- **ativo**: Boolean (default: true)

### Validações Específicas

#### Atributos
- `abreviacao`: 2-5 chars, uppercase, único por jogo
- `formulaCalculo`: Regex para validar sintaxe (opcional)

#### Aptidões
- `tipoAptidaoId`: FK válido (select)
- `atributoBaseId`: FK válido (select)

#### Níveis
- `nivel`: Inteiro positivo, único por jogo
- `xpNecessario`: Crescente (validar que nivel N+1 > nivel N)
- `pontosAtributo`, `pontosAptidao`: >= 0

#### Classes
- `pontosVidaBase`: >= 1
- `bonusAtributos`: JSON válido

#### Vantagens
- `custo`: Pode ser negativo
- `categoriaId`: FK válido

#### Raças
- `bonusAtributos`: JSON válido

#### Prospecção
- `tipoDado`: Enum (d4, d6, d8, d10, d12, d20, d100)
- `modificador`: Número inteiro

## 📊 Cenários de Teste

### Cenário 1: Sem Jogo Selecionado
- **Given**: Usuário não selecionou jogo
- **When**: Acessa página de configuração
- **Then**: Exibe mensagem de aviso, não faz requisição

### Cenário 2: Com Jogo Selecionado
- **Given**: Jogo ID=5 está selecionado
- **When**: Acessa página de atributos
- **Then**: Faz GET `/atributos?jogoId=5`, exibe lista

### Cenário 3: Criar Config
- **Given**: Jogo selecionado, formulário válido
- **When**: Clica em "Salvar"
- **Then**: POST `/atributos` com `{ ...data, jogoId: 5 }`

### Cenário 4: Mudança de Jogo
- **Given**: Visualizando configs do Jogo 5
- **When**: Usuário troca para Jogo 8
- **Then**: Recarrega configs do Jogo 8 automaticamente

### Cenário 5: Validação de Ordem
- **Given**: Já existe ordem=1 no Jogo 5
- **When**: Tenta criar outro com ordem=1
- **Then**: Backend retorna erro, frontend exibe mensagem

## 🎨 UI/UX

### Indicador de Jogo Atual
Cada página de configuração deve exibir:
```
🎮 Configurando: [Nome do Jogo Atual]
```

### Navegação
```
/mestre/config/atributos
/mestre/config/aptidoes
/mestre/config/niveis
/mestre/config/limitadores
/mestre/config/classes
/mestre/config/vantagens
/mestre/config/racas
/mestre/config/prospeccao
/mestre/config/presencas
/mestre/config/generos
```

### Menu Lateral (config-sidebar)
- Ícones para cada tipo
- Badge com contagem de itens ativos
- Highlight na seção atual

## 🚀 Ordem de Implementação

### Fase 1: Infraestrutura (Tasks 1-3)
1. Criar `ConfigBusinessService`
2. Atualizar `ConfigApiService`
3. Criar `ConfigFacadeService`

### Fase 2: Configurações Base (Tasks 4-6)
4. Atualizar Atributos
5. Atualizar Aptidões
6. Atualizar Níveis

### Fase 3: Configurações Avançadas (Tasks 7-10)
7. Atualizar Classes e Raças
8. Atualizar Vantagens
9. Atualizar Prospecção e Presenças
10. Atualizar Gêneros e Limitadores

### Fase 4: Integração e Testes (Task 11)
11. Testes E2E, documentação final

## 📚 Referências

- Backend Controllers: `/src/main/java/br/com/hydroom/rpg/fichacontrolador/controller/configuracao/`
- Frontend Service Atual: `/src/app/core/services/api/config-api.service.ts`
- Componentes Atuais: `/src/app/features/mestre/pages/config/configs/`
- CurrentGameService: `/src/app/core/services/current-game.service.ts`

## ✅ Critérios de Sucesso

1. ✅ Todas as requisições de config enviam `jogoId`
2. ✅ Sem erro 400/500 em requisições de config
3. ✅ Componentes exibem apenas configs do jogo ativo
4. ✅ Mudança de jogo recarrega configs automaticamente
5. ✅ Validações de formulário funcionando
6. ✅ Mensagens de erro/sucesso claras
7. ✅ Código segue padrões do projeto (Signals, inject, standalone)
