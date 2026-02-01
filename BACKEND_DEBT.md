# 🚨 BACKEND DEBT - Endpoints e Campos Faltantes

**Data Criação**: 2026-02-01  
**Status**: 🔴 **PENDENTE IMPLEMENTAÇÃO**

---

## 📋 DÉBITOS IDENTIFICADOS NA IMPLEMENTAÇÃO DO FRONTEND

### 1. **Endpoints de Fichas** ⚠️ CRÍTICO

#### GET /api/fichas/{id}/calculados
**Descrição**: Retorna valores calculados de uma ficha (BBA, BBM, Ímpeto, etc.)

**Request**: Nenhum body
**Response Esperado**:
```json
{
  "fichaId": 123,
  "BBA": 8,
  "BBM": 5,
  "impeto": 12,
  "vidaTotal": 85,
  "manaTotal": 60,
  // ... outros calculados
}
```

**Justificativa**: Frontend precisa mostrar valores calculados oficiais após save

---

#### POST /api/fichas/{id}/recalcular
**Descrição**: Force recalculate all derived values

**Request**: Nenhum body
**Response Esperado**:
```json
{
  "fichaId": 123,
  "atributos": [
    {
      "nome": "FOR",
      "valorBase": 16,
      "valorTotal": 18,
      "modificador": 4  // ← Calculado
    }
  ],
  "calculados": {
    "BBA": 8,
    "BBM": 5,
    "impeto": 12
  },
  "vida": {
    "vidaTotal": 90  // ← Calculado
  }
}
```

**Justificativa**: Permitir recalcular ficha sem editar (útil quando mestre muda fórmulas)

---

### 2. **Campos Faltantes em Models** ⚠️ IMPORTANTE

#### FichaAtributo
**Campos que devem existir**:
```java
public class FichaAtributo {
    private Long id;
    private Long fichaId;
    private String nome;  // FOR, DES, CON, INT, SAB, CAR
    private Integer valorBase;  // Valor distribuído pelo jogador
    private Integer valorNivel; // Bônus por nível ← FALTA
    private Integer valorOutros; // Bônus diversos ← FALTA
    private Integer valorTotal;  // Calculado: base + nivel + outros
    private Integer modificador; // Calculado: (valorTotal - 10) / 2
}
```

**Campos Faltando**:
- ✅ `valorNivel` (Integer) - Bônus de atributo ganho por nível
- ✅ `valorOutros` (Integer) - Bônus de itens, magias, etc.

---

#### FichaProgressao
**Campos que devem existir**:
```java
public class FichaProgressao {
    private Long id;
    private Long fichaId;
    private Integer nivel;        // Calculado baseado em experiencia
    private Integer experiencia;  // Apenas Mestre pode dar
    private Integer renascimento;
    private Integer insolitus;
    private Integer nvs;
    private Long limitadorId;
    private LimitadorConfig limitador; // Nested
    
    // FALTANDO:
    private Integer pontosAtributo;  // ← FALTA - Pontos disponíveis para distribuir
    private Integer pontosAtributoGastos; // ← FALTA - Pontos já usados
}
```

**Campos Faltando**:
- ✅ `pontosAtributo` (Integer) - Total de pontos disponíveis (baseado em nível)
- ✅ `pontosAtributoGastos` (Integer) - Pontos já distribuídos nos atributos

---

#### FichaVidaMembro (Integridade de Membros)
**Campos que devem existir**:
```java
public class FichaVidaMembro {
    private Long id;
    private Long fichaVidaId;
    private String nome;  // Ex: "Braço Direito", "Perna Esquerda"
    private Integer pvMax;  // PV máximo do membro
    private Integer pvAtual; // PV atual do membro
    private String estado; // INTACTO, FERIDO, MUTILADO, PERDIDO
}
```

**Status**: ⚠️ Model existe mas pode precisar ajustes

---

### 3. **Endpoint de Configurações** ⚠️ IMPORTANTE

#### GET /api/jogos/{jogoId}/configuracoes
**Descrição**: Retorna configurações de fórmulas do jogo

**Response Esperado**:
```json
{
  "jogoId": 1,
  "formulas": {
    "modificadorAtributo": "(valorTotal - 10) / 2",
    "BBA": "nivel + modFOR",
    "BBM": "nivel + modINT",
    "impeto": "nivel + modDES",
    "vidaTotal": "vidaVigor + vidaOutros + (nivel * 5)",
    "manaTotal": "manaBase + (modINT * 2)"
  },
  "limites": {
    "maxAtributo": 30,
    "minAtributo": 1,
    "pontosAtributoPorNivel": 2
  }
}
```

**Justificativa**: Frontend pode fazer cálculos de preview usando fórmulas do backend

---

### 4. **Endpoint de Experiência (Apenas Mestre)** ⚠️ CRÍTICO

#### POST /api/fichas/{id}/dar-experiencia
**Descrição**: Mestre concede XP para uma ficha

**Request**:
```json
{
  "experiencia": 1000,
  "motivo": "Derrotar o dragão"
}
```

**Response**:
```json
{
  "fichaId": 123,
  "experienciaAnterior": 5000,
  "experienciaNova": 6000,
  "nivelAnterior": 5,
  "nivelNovo": 6,
  "subiu": true,
  "mensagem": "Parabéns! Você subiu para o nível 6!"
}
```

**Autorização**: Apenas usuários com role MESTRE

**Justificativa**: XP só pode ser dado pelo Mestre, não editável no form

---

### 5. **Validações que o Backend DEVE ter**

#### Validação de Pontos de Atributo
```java
// Backend deve validar:
int pontosDisponiveis = ficha.getProgressao().getPontosAtributo();
int pontosGastos = calcularPontosGastos(ficha.getAtributos());

if (pontosGastos > pontosDisponiveis) {
    throw new ValidationException(
        "Pontos de atributo insuficientes. " +
        "Disponível: " + pontosDisponiveis + 
        ", Gasto: " + pontosGastos
    );
}
```

#### Validação de Nível vs XP
```java
// Nível não pode ser editado manualmente
// Deve ser calculado baseado em tabela de XP
int nivelCalculado = calcularNivelPorXP(ficha.getProgressao().getExperiencia());
ficha.getProgressao().setNivel(nivelCalculado);
```

#### Validação de Campos Read-Only para Jogador
```java
// Apenas Mestre pode editar XP
if (!isMestre && fichaDTO.getProgressao().getExperiencia() != fichaExistente.getProgressao().getExperiencia()) {
    throw new ForbiddenException("Apenas o Mestre pode alterar XP");
}
```

---

### 6. **Cálculos que Backend DEVE Fazer** ✅ CRÍTICO

#### Ao Salvar Ficha (POST/PUT /api/fichas)
Backend DEVE recalcular:

1. **Atributos**:
   - `valorTotal = valorBase + valorNivel + valorOutros`
   - `modificador = (valorTotal - 10) / 2`

2. **Vida**:
   - `vidaTotal = vidaVigor + vidaOutros + vidaNivel`

3. **Mana** (se existir):
   - `manaTotal = manaBase + (modINT * multiplicador)`

4. **Valores Derivados** (FichaCalculados):
   - `BBA = aplicarFormula(config.formulaBBA, nivel, modFOR)`
   - `BBM = aplicarFormula(config.formulaBBM, nivel, modINT)`
   - `impeto = aplicarFormula(config.formulaImpeto, nivel, modDES)`
   - Etc.

5. **Nível**:
   - `nivel = calcularNivelPorXP(experiencia)`
   - `pontosAtributo = calcularPontosPorNivel(nivel)`

---

### 7. **Endpoints de Perícias, Equipamentos, Vantagens** ⏳ FUTURO

#### POST /api/fichas/{id}/pericias
**Descrição**: Adicionar perícia à ficha

**Request**:
```json
{
  "nome": "Furtividade",
  "pontosInvestidos": 5,
  "atributoBase": "DES"
}
```

#### POST /api/fichas/{id}/equipamentos
**Descrição**: Adicionar equipamento à ficha

**Request**:
```json
{
  "nome": "Espada Longa +1",
  "tipo": "ARMA",
  "bonusAtaque": 1,
  "dano": "1d8+1",
  "equipado": true
}
```

#### POST /api/fichas/{id}/vantagens
**Descrição**: Adicionar vantagem/desvantagem

**Request**:
```json
{
  "nome": "Visão no Escuro",
  "tipo": "VANTAGEM",
  "custo": 2,
  "descricao": "Enxerga no escuro até 18m"
}
```

---

## 📊 PRIORIZAÇÃO

### 🔴 CRÍTICO (Bloqueia implementação atual):
1. ✅ Campos `valorNivel` e `valorOutros` em FichaAtributo
2. ✅ Campos `pontosAtributo` e `pontosAtributoGastos` em FichaProgressao
3. ✅ Validação de pontos de atributo no backend
4. ✅ Cálculo automático de modificadores ao salvar
5. ✅ Endpoint `POST /api/fichas/{id}/dar-experiencia` (Mestre only)

### 🟡 IMPORTANTE (Melhora UX):
6. ✅ Endpoint `GET /api/fichas/{id}/calculados`
7. ✅ Endpoint `GET /api/jogos/{jogoId}/configuracoes`
8. ✅ Endpoint `POST /api/fichas/{id}/recalcular`

### 🟢 FUTURO (Pode ser depois):
9. ⏳ Endpoints de Perícias
10. ⏳ Endpoints de Equipamentos
11. ⏳ Endpoints de Vantagens/Desvantagens

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

Para cada débito, o backend deve:

- [ ] Criar/atualizar models (Entities)
- [ ] Criar DTOs (Request/Response)
- [ ] Criar Repository
- [ ] Criar Service com lógica de negócio
- [ ] Criar Controller com endpoints
- [ ] Adicionar validações (@Valid, custom validators)
- [ ] Adicionar testes unitários
- [ ] Adicionar autorização (Mestre vs Jogador)
- [ ] Documentar no Swagger
- [ ] Atualizar migrations SQL

---

**Última Atualização**: 2026-02-01  
**Responsável**: Frontend Team → Backend Team  
**Status**: 🔴 Aguardando implementação backend
