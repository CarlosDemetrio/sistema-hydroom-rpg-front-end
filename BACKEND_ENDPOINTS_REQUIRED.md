# 📋 BACKEND ENDPOINTS REQUIREMENTS

**Data**: 2026-02-01  
**Projeto**: ficha-controlador-front-end  
**Propósito**: Documentação completa de TODOS os endpoints esperados pelo frontend

---

## 🎯 SUMMARY

Este documento lista **TODOS** os endpoints HTTP que o frontend espera consumir, com:
- ✅ Request/Response esperados
- ✅ Autenticação/Autorização
- ✅ Validações necessárias
- ✅ Prioridade de implementação

---

## 🔐 AUTENTICAÇÃO

### Base
- **Método**: HttpOnly Cookie (JSESSIONID ou similar)
- **CSRF**: Token em header `X-XSRF-TOKEN` (lido de cookie `XSRF-TOKEN`)
- **Roles**: `MESTRE` | `JOGADOR`

---

## 1️⃣ FICHAS (Character Sheets)

### 📌 GET /api/fichas
**Lista fichas com filtro por role**

**Autorização**: Autenticado  
**Query Params**:
- `jogoId` (optional): number
- `jogadorId` (optional): number

**Regra de negócio**:
- MESTRE: vê TODAS as fichas (filtro opcional por jogoId)
- JOGADOR: vê APENAS suas próprias fichas

**Response 200**:
```json
[
  {
    "id": 1,
    "nome": "Aragorn",
    "jogoId": 1,
    "jogadorId": 5,
    "identificacao": {
      "origem": "Númenor",
      "indole": "Leal",
      "linhagem": "Humano"
    },
    "progressao": {
      "nivel": 5,
      "experiencia": 5000,
      "renascimento": 0,
      "insolitus": 2,
      "nvs": 1
    },
    "atributos": [
      {
        "nome": "FOR",
        "valorBase": 16,
        "valorNivel": 2,
        "valorOutros": 0,
        "valorTotal": 18,
        "modificador": 4
      }
    ],
    "vida": {
      "vidaVigor": 20,
      "vidaOutros": 5,
      "vidaNivel": 60,
      "vidaTotal": 85,
      "sanguePercentual": 100
    },
    "pericias": [
      {
        "nome": "Furtividade",
        "pontosInvestidos": 5,
        "atributoBase": "DES",
        "modificadorTotal": 8
      }
    ],
    "equipamentos": [
      {
        "nome": "Espada Longa +1",
        "tipo": "ARMA",
        "descricao": "+1 ataque, 1d8+1 dano",
        "equipado": true
      }
    ],
    "vantagens": [
      {
        "nome": "Reflexos Rápidos",
        "tipo": "VANTAGEM",
        "custo": 2,
        "descricao": "+2 em testes de iniciativa"
      }
    ],
    "titulosRunas": [
      {
        "nome": "Guerreiro Lendário",
        "tipo": "TITULO",
        "descricao": "Concede +5 de dano em combate corpo a corpo"
      }
    ]
  }
]
```

---

### 📌 GET /api/fichas/{id}
**Busca ficha por ID com TODOS os valores calculados**

**Autorização**: Autenticado  
**Regra de negócio**:
- MESTRE: pode ver qualquer ficha
- JOGADOR: pode ver apenas suas próprias fichas

**Response 200**: (mesmo formato do array acima, mas objeto único)

**Response 403**: Se jogador tentar acessar ficha de outro
**Response 404**: Se ficha não existir

---

### 📌 POST /api/fichas
**Cria nova ficha**

**Autorização**: Autenticado (Jogador ou Mestre)

**Request Body**:
```json
{
  "nome": "Aragorn",
  "jogoId": 1,
  "identificacao": {
    "origem": "Númenor",
    "indole": "Leal",
    "linhagem": "Humano"
  },
  "progressao": {
    "renascimento": 0,
    "insolitus": 2,
    "nvs": 1
  },
  "descricaoFisica": {
    "altura": 185,
    "peso": 80,
    "idade": 87,
    "olhos": "Cinza",
    "cabelo": "Preto",
    "pele": "Clara",
    "aparencia": "Alto e nobre"
  },
  "atributos": [
    { "nome": "FOR", "valorBase": 16 },
    { "nome": "DES", "valorBase": 14 },
    { "nome": "CON", "valorBase": 15 },
    { "nome": "INT", "valorBase": 13 },
    { "nome": "SAB", "valorBase": 14 },
    { "nome": "CAR", "valorBase": 16 }
  ],
  "vida": {
    "vidaVigor": 20,
    "vidaOutros": 5,
    "vidaNivel": 60,
    "sanguePercentual": 100
  },
  "pericias": [
    {
      "nome": "Furtividade",
      "pontosInvestidos": 5,
      "atributoBase": "DES"
    }
  ],
  "equipamentos": [
    {
      "nome": "Espada Longa +1",
      "tipo": "ARMA",
      "descricao": "+1 ataque, 1d8+1 dano",
      "equipado": true
    }
  ],
  "vantagens": [
    {
      "nome": "Reflexos Rápidos",
      "tipo": "VANTAGEM",
      "custo": 2,
      "descricao": "+2 em testes de iniciativa"
    }
  ],
  "titulosRunas": [
    {
      "nome": "Guerreiro Lendário",
      "tipo": "TITULO",
      "descricao": "Concede +5 de dano em combate corpo a corpo"
    }
  ],
  "observacoes": "Herdeiro de Isildur"
}
```

**⚠️ IMPORTANTE - Backend DEVE**:
1. Calcular `nivel` baseado em XP (inicialmente nível 1, XP 0)
2. Calcular `valorTotal` e `modificador` de TODOS os atributos
3. Calcular `vidaTotal` com base na fórmula do jogo
4. Calcular `modificadorTotal` de TODAS as perícias
5. Aplicar bônus de equipamentos equipados
6. Validar pontos de atributo (se houver limite)
7. Validar pontos de vantagens (se houver sistema de pontos)

**Response 201**:
```json
{
  "id": 123,
  "nome": "Aragorn",
  ...campos enviados...,
  "progressao": {
    "nivel": 1,  // ← Calculado!
    "experiencia": 0,
    "renascimento": 0,
    "insolitus": 2,
    "nvs": 1
  },
  "atributos": [
    {
      "nome": "FOR",
      "valorBase": 16,
      "valorNivel": 0,  // ← Calculado!
      "valorOutros": 0,  // ← Calculado!
      "valorTotal": 16,  // ← Calculado!
      "modificador": 3   // ← Calculado!
    }
  ],
  "vida": {
    "vidaVigor": 20,
    "vidaOutros": 5,
    "vidaNivel": 60,
    "vidaTotal": 85  // ← Calculado!
  },
  "pericias": [
    {
      "nome": "Furtividade",
      "pontosInvestidos": 5,
      "atributoBase": "DES",
      "modificadorTotal": 8  // ← Calculado! (5 + mod DES + outros)
    }
  ]
}
```

**Response 400**: Validação falhou
**Response 403**: Jogador tentando criar ficha para outro jogador

---

### 📌 PUT /api/fichas/{id}
**Atualiza ficha existente**

**Autorização**: Autenticado  
**Regra de negócio**:
- MESTRE: pode editar qualquer ficha
- JOGADOR: pode editar apenas suas próprias fichas

**Request Body**: (suporta atualização PARCIAL)
```json
{
  "atributos": [
    { "nome": "FOR", "valorBase": 18 }
  ]
}
```

**⚠️ IMPORTANTE - Backend DEVE**:
1. Recalcular TODOS os valores derivados após update
2. Verificar se nível mudou (caso XP tenha sido alterado por Mestre)
3. Recalcular bônus de equipamentos

**Response 200**: Ficha completa atualizada (mesma estrutura do POST)

**Response 403**: Jogador tentando editar ficha de outro
**Response 404**: Ficha não existe

---

### 📌 DELETE /api/fichas/{id}
**Deleta ficha**

**Autorização**: Autenticado  
**Regra de negócio**:
- MESTRE: pode deletar qualquer ficha
- JOGADOR: pode deletar apenas suas próprias fichas

**⚠️ IMPORTANTE - Backend DEVE**:
- Remover ficha de participantes do jogo (se associada)
- Cascade delete de todos os relacionamentos

**Response 204**: Sucesso (sem body)
**Response 403**: Jogador tentando deletar ficha de outro
**Response 404**: Ficha não existe

---

### 📌 GET /api/fichas/{id}/calculados
**Retorna APENAS valores calculados**

**Autorização**: Autenticado  
**Uso**: Refresh de stats sem carregar ficha completa

**Response 200**:
```json
{
  "fichaId": 123,
  "BBA": 8,
  "BBM": 5,
  "impeto": 12,
  "vidaTotal": 85,
  "manaTotal": 60
}
```

**Prioridade**: BAIXA (pode ser implementado depois)

---

### 📌 POST /api/fichas/{id}/recalcular
**Força recálculo de TODOS os valores derivados**

**Autorização**: MESTRE only  
**Uso**: Quando Mestre altera fórmulas do jogo

**Request Body**: (vazio)

**Response 200**: Ficha completa recalculada

**Prioridade**: BAIXA (pode ser implementado depois)

---

### 📌 POST /api/fichas/{id}/dar-experiencia
**Concede XP a uma ficha (MESTRE ONLY)**

**Autorização**: MESTRE only

**Request Body**:
```json
{
  "experiencia": 1000,
  "motivo": "Derrotar o dragão"
}
```

**⚠️ IMPORTANTE - Backend DEVE**:
1. Adicionar XP à ficha
2. Verificar se atingiu threshold de level up
3. Se sim, aumentar `nivel` automaticamente
4. Recalcular todos os valores derivados

**Response 200** (com level up):
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

**Response 200** (sem level up):
```json
{
  "fichaId": 123,
  "experienciaAnterior": 5000,
  "experienciaNova": 5500,
  "nivelAnterior": 5,
  "nivelNovo": 5,
  "subiu": false,
  "mensagem": "Faltam 500 XP para o próximo nível"
}
```

**Response 403**: Não é mestre
**Response 404**: Ficha não existe

**Prioridade**: ALTA (feature essencial para Mestres)

---

## 2️⃣ JOGOS (Games)

### 📌 GET /api/jogos
**Lista jogos**

**Autorização**: Autenticado  
**Regra de negócio**:
- MESTRE: vê TODOS os jogos (filtro opcional)
- JOGADOR: vê apenas jogos onde é participante

**Query Params**:
- `status` (optional): ATIVO | PAUSADO | FINALIZADO

**Response 200**:
```json
[
  {
    "id": 1,
    "nome": "A Saga do Anel",
    "descricao": "Aventura épica na Terra Média",
    "mestreId": 10,
    "status": "ATIVO",
    "dataCriacao": "2026-01-01T10:00:00Z",
    "participantes": [
      {
        "id": 1,
        "jogadorId": 5,
        "fichaId": 123,
        "status": "APROVADO",
        "dataEntrada": "2026-01-02T14:00:00Z"
      }
    ]
  }
]
```

---

### 📌 POST /api/jogos
**Cria novo jogo (MESTRE ONLY)**

**Autorização**: MESTRE only

**Request Body**:
```json
{
  "nome": "A Saga do Anel",
  "descricao": "Aventura épica na Terra Média",
  "status": "ATIVO"
}
```

**⚠️ IMPORTANTE - Backend DEVE**:
- Definir `mestreId` = userId do mestre autenticado
- Definir `dataCriacao` = now()

**Response 201**: Jogo criado

---

### 📌 PUT /api/jogos/{id}
**Atualiza jogo (MESTRE ONLY)**

**Autorização**: MESTRE only (apenas o mestre dono do jogo)

**Request Body**: (parcial)
```json
{
  "nome": "Novo Nome",
  "status": "PAUSADO"
}
```

**Response 200**: Jogo atualizado
**Response 403**: Não é o mestre dono do jogo

---

### 📌 DELETE /api/jogos/{id}
**Deleta jogo (MESTRE ONLY)**

**Autorização**: MESTRE only (apenas o mestre dono do jogo)

**⚠️ IMPORTANTE - Backend DEVE**:
- Cascade delete de participantes
- NÃO deletar fichas (apenas desassociar)

**Response 204**: Sucesso
**Response 403**: Não é o mestre dono do jogo

---

## 3️⃣ PARTICIPANTES (Game Participants)

### 📌 GET /api/jogos/{jogoId}/participantes
**Lista participantes de um jogo**

**Autorização**: Autenticado (Mestre ou participante do jogo)

**Response 200**:
```json
[
  {
    "id": 1,
    "jogadorId": 5,
    "fichaId": 123,
    "status": "APROVADO",
    "dataEntrada": "2026-01-02T14:00:00Z"
  }
]
```

---

### 📌 POST /api/jogos/{jogoId}/participantes
**Solicita participação em jogo (JOGADOR)**

**Autorização**: Autenticado (Jogador)

**Request Body**:
```json
{
  "fichaId": 123
}
```

**⚠️ IMPORTANTE - Backend DEVE**:
- Definir `jogadorId` = userId do jogador autenticado
- Definir `status` = PENDENTE (aguardando aprovação do Mestre)
- Definir `dataEntrada` = now()

**Response 201**: Solicitação criada (status PENDENTE)
**Response 400**: Jogador já é participante deste jogo

---

### 📌 PUT /api/jogos/{jogoId}/participantes/{participanteId}/aprovar
**Aprova participação (MESTRE ONLY)**

**Autorização**: MESTRE only (apenas o mestre dono do jogo)

**⚠️ IMPORTANTE - Backend DEVE**:
- Alterar `status` = APROVADO

**Response 200**: Participante aprovado

---

### 📌 PUT /api/jogos/{jogoId}/participantes/{participanteId}/rejeitar
**Rejeita participação (MESTRE ONLY)**

**Autorização**: MESTRE only (apenas o mestre dono do jogo)

**⚠️ IMPORTANTE - Backend DEVE**:
- Alterar `status` = REJEITADO

**Response 200**: Participante rejeitado

---

### 📌 DELETE /api/jogos/{jogoId}/participantes/{participanteId}
**Remove participante (MESTRE ou próprio JOGADOR)**

**Autorização**:
- MESTRE: pode remover qualquer participante
- JOGADOR: pode remover apenas a si mesmo

**Response 204**: Sucesso
**Response 403**: Jogador tentando remover outro jogador

---

## 4️⃣ CONFIGURAÇÕES (System Config)

### 📌 GET /api/config/atributos
**Lista configurações de atributos**

**Autorização**: Autenticado

**Response 200**:
```json
[
  {
    "id": 1,
    "nomeAtributo": "FOR",
    "descricao": "Força",
    "pontosPorNivel": 1
  }
]
```

**Prioridade**: MÉDIA (pode usar valores hardcoded no frontend por enquanto)

---

### 📌 GET /api/config/pericias
**Lista perícias disponíveis**

**Autorização**: Autenticado

**Response 200**:
```json
[
  {
    "id": 1,
    "nome": "Furtividade",
    "atributoPadrao": "DES",
    "descricao": "Habilidade de se mover sem ser notado"
  }
]
```

**Prioridade**: MÉDIA

---

### 📌 GET /api/config/racas
**Lista raças disponíveis**

**Autorização**: Autenticado

**Response 200**:
```json
[
  {
    "id": 1,
    "nome": "Humano",
    "bonusAtributos": { "CAR": 1 },
    "descricao": "Versáteis e adaptáveis"
  }
]
```

**Prioridade**: BAIXA (frontend aceita texto livre por enquanto)

---

### 📌 GET /api/config/classes
**Lista classes disponíveis**

**Autorização**: Autenticado

**Response 200**:
```json
[
  {
    "id": 1,
    "nome": "Guerreiro",
    "vidaPorNivel": 10,
    "descricao": "Mestre em combate"
  }
]
```

**Prioridade**: BAIXA

---

## 5️⃣ AUTENTICAÇÃO

### 📌 POST /login
**Login via formulário (Spring Security padrão)**

**Request Body** (form-urlencoded):
```
username=aragorn
password=senha123
```

**Response 200**: Redireciona para /
**Response 401**: Credenciais inválidas

---

### 📌 GET /oauth2/authorization/google
**Inicia fluxo OAuth2 com Google**

**Response 302**: Redireciona para Google OAuth

---

### 📌 GET /api/users/me
**Retorna usuário autenticado**

**Autorização**: Autenticado

**Response 200**:
```json
{
  "id": "5",
  "name": "Aragorn",
  "email": "aragorn@middle-earth.com",
  "roles": ["JOGADOR"],
  "avatarUrl": "https://..."
}
```

---

### 📌 POST /logout
**Logout (Spring Security padrão)**

**Response 200**: Sucesso

---

## 📊 PRIORIDADES DE IMPLEMENTAÇÃO

### 🔴 CRÍTICO (Bloqueiam MVP)
1. ✅ POST /api/fichas (criar ficha)
2. ✅ GET /api/fichas (listar fichas)
3. ✅ GET /api/fichas/{id} (detalhe ficha)
4. ✅ PUT /api/fichas/{id} (editar ficha)
5. ✅ DELETE /api/fichas/{id} (deletar ficha)
6. ✅ POST /api/jogos (criar jogo)
7. ✅ GET /api/jogos (listar jogos)
8. ✅ POST /api/jogos/{id}/participantes (solicitar participação)
9. ✅ GET /api/users/me (usuário autenticado)

### 🟡 IMPORTANTE (Features essenciais)
10. ✅ POST /api/fichas/{id}/dar-experiencia (Mestre dar XP)
11. ✅ PUT /api/jogos/{id}/participantes/{id}/aprovar (Mestre aprovar)
12. ✅ PUT /api/jogos/{id}/participantes/{id}/rejeitar (Mestre rejeitar)
13. ✅ DELETE /api/jogos/{id}/participantes/{id} (Remover participante)

### 🟢 DESEJÁVEL (Melhoram UX)
14. GET /api/config/pericias (lista perícias)
15. GET /api/config/racas (lista raças)
16. GET /api/config/classes (lista classes)
17. GET /api/fichas/{id}/calculados (apenas valores calculados)
18. POST /api/fichas/{id}/recalcular (forçar recálculo)

---

**Última Atualização**: 2026-02-01 20:40  
**Status**: ✅ Documentação completa de TODOS os endpoints necessários
