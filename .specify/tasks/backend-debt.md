# Backend Implementation Requirements

**Document**: Backend Endpoints & Features Needed for Frontend  
**Date**: 2026-02-01  
**Purpose**: Track backend API requirements for frontend implementation

---

## Overview

This document lists all backend endpoints and features that need to be implemented or verified before the frontend can fully function. Coordinate with backend team to prioritize these items.

---

## Authentication Endpoints

### ✅ Already Implemented
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/logout` - End user session
- OAuth2 Google login flow

### ❓ Needs Verification
- [ ] BACKEND-001 Verify `/api/auth/me` returns user with roles array `['MESTRE', 'JOGADOR']`
  - **Expected Response**:
  ```json
  {
    "id": 1,
    "nome": "Carlos Demetrio",
    "email": "carlos@example.com",
    "avatarUrl": "https://lh3.googleusercontent.com/...",
    "roles": ["MESTRE", "JOGADOR"],
    "dataCriacao": "2026-01-15T10:30:00Z"
  }
  ```

- [ ] BACKEND-002 Verify httpOnly cookies work correctly (credentials: include in requests)
  - Cookie name: `JSESSIONID` or similar
  - HttpOnly: true, Secure: true (production), SameSite: Lax

- [ ] BACKEND-003 Verify CSRF token handling (XSRF-TOKEN cookie → X-XSRF-TOKEN header)
  - Response sets cookie: `XSRF-TOKEN=abc123...`
  - Frontend reads cookie and sends header: `X-XSRF-TOKEN: abc123...`
  - Required for: POST, PUT, DELETE, PATCH requests

### ⚠️ Missing Endpoints
- [ ] BACKEND-004 `PUT /api/users/me` - Update current user profile (nome, avatarUrl)
  - **Request**:
  ```json
  {
    "nome": "Carlos Demetrio Updated",
    "avatarUrl": "https://example.com/avatar.jpg"
  }
  ```
  - **Response** (200 OK):
  ```json
  {
    "id": 1,
    "nome": "Carlos Demetrio Updated",
    "email": "carlos@example.com",
    "avatarUrl": "https://example.com/avatar.jpg",
    "roles": ["MESTRE", "JOGADOR"],
    "dataCriacao": "2026-01-15T10:30:00Z"
  }
  ```
  - Validation: nome required, 3-50 chars

---

## Games (Jogos) Endpoints

### 🔨 To Implement

- [ ] BACKEND-005 `GET /api/jogos` - List all games
  - Query params: `?status=ATIVO&search=name` (optional filters)
  - Authorization: Mestre sees all, Jogador sees only games they participate in
  - **Expected Response** (200 OK):
  ```json
  [
    {
      "id": 1,
      "nome": "Campanha do Reino Perdido",
      "descricao": "Uma aventura épica medieval",
      "status": "ATIVO",
      "dataCriacao": "2026-01-20T14:00:00Z",
      "mestre": {
        "id": 1,
        "nome": "Carlos Demetrio",
        "email": "carlos@example.com",
        "avatarUrl": "https://..."
      },
      "participantes": [
        {
          "id": 10,
          "jogoId": 1,
          "jogadorId": 5,
          "fichaId": 20,
          "status": "APROVADO",
          "dataParticipacao": "2026-01-21T10:00:00Z",
          "jogador": {
            "id": 5,
            "nome": "João Silva",
            "email": "joao@example.com"
          }
        }
      ]
    }
  ]
  ```

- [ ] BACKEND-006 `POST /api/jogos` - Create new game
  - Authorization: Mestre only
  - Validation: nome required, unique per mestre, 3-100 chars
  - **Request**:
  ```json
  {
    "nome": "Nova Campanha",
    "descricao": "Descrição da campanha"
  }
  ```
  - **Response** (201 Created):
  ```json
  {
    "id": 2,
    "nome": "Nova Campanha",
    "descricao": "Descrição da campanha",
    "status": "ATIVO",
    "dataCriacao": "2026-02-01T15:30:00Z",
    "mestre": {
      "id": 1,
      "nome": "Carlos Demetrio",
      "email": "carlos@example.com"
    },
    "participantes": []
  }
  ```

- [ ] BACKEND-007 `GET /api/jogos/{id}` - Get game details
  - Authorization: Mestre (owner) or Jogador (participant) only
  - **Expected Response** (200 OK):
  ```json
  {
    "id": 1,
    "nome": "Campanha do Reino Perdido",
    "descricao": "Uma aventura épica medieval",
    "status": "ATIVO",
    "dataCriacao": "2026-01-20T14:00:00Z",
    "mestre": {
      "id": 1,
      "nome": "Carlos Demetrio",
      "email": "carlos@example.com",
      "avatarUrl": "https://..."
    },
    "participantes": [
      {
        "id": 10,
        "jogoId": 1,
        "jogadorId": 5,
        "fichaId": 20,
        "status": "APROVADO",
        "dataParticipacao": "2026-01-21T10:00:00Z",
        "jogador": {
          "id": 5,
          "nome": "João Silva",
          "email": "joao@example.com",
          "avatarUrl": "https://..."
        },
        "ficha": {
          "id": 20,
          "nome": "Aragorn",
          "nivel": 5,
          "jogadorId": 5
        }
      }
    ]
  }
  ```

- [ ] BACKEND-008 `PUT /api/jogos/{id}` - Update game
  - Authorization: Mestre (owner) only
  - Validation: status must be ATIVO | PAUSADO | FINALIZADO
  - **Request**:
  ```json
  {
    "nome": "Campanha Atualizada",
    "descricao": "Nova descrição",
    "status": "PAUSADO"
  }
  ```
  - **Response** (200 OK): Full Jogo object (same as GET)

- [ ] BACKEND-009 `DELETE /api/jogos/{id}` - Delete game
  - Authorization: Mestre (owner) only
  - Cascade: Delete all participantes, update fichas (set jogoId = null)
  - **Response** (204 No Content): Empty body

---

## Participants (Participantes) Endpoints

### 🔨 To Implement

- [ ] BACKEND-010 `GET /api/jogos/{jogoId}/participantes` - List participants
  - Authorization: Mestre (owner) or Jogador (participant)
  - **Expected Response** (200 OK):
  ```json
  [
    {
      "id": 10,
      "jogoId": 1,
      "jogadorId": 5,
      "fichaId": 20,
      "status": "APROVADO",
      "dataParticipacao": "2026-01-21T10:00:00Z",
      "jogador": {
        "id": 5,
        "nome": "João Silva",
        "email": "joao@example.com",
        "avatarUrl": "https://..."
      },
      "ficha": {
        "id": 20,
        "nome": "Aragorn",
        "nivel": 5,
        "jogadorId": 5
      }
    },
    {
      "id": 11,
      "jogoId": 1,
      "jogadorId": 6,
      "fichaId": 21,
      "status": "PENDENTE",
      "dataParticipacao": "2026-01-22T09:00:00Z",
      "jogador": {
        "id": 6,
        "nome": "Maria Santos",
        "email": "maria@example.com"
      },
      "ficha": {
        "id": 21,
        "nome": "Legolas",
        "nivel": 4,
        "jogadorId": 6
      }
    }
  ]
  ```

- [ ] BACKEND-011 `POST /api/jogos/{jogoId}/participantes` - Request to join game
  - Authorization: Jogador only
  - Validation: fichaId must belong to requesting user, not already participant
  - **Request**:
  ```json
  {
    "fichaId": 25
  }
  ```
  - **Response** (201 Created):
  ```json
  {
    "id": 12,
    "jogoId": 1,
    "jogadorId": 7,
    "fichaId": 25,
    "status": "PENDENTE",
    "dataParticipacao": "2026-02-01T16:00:00Z",
    "jogador": {
      "id": 7,
      "nome": "Pedro Costa",
      "email": "pedro@example.com"
    },
    "ficha": {
      "id": 25,
      "nome": "Gandalf",
      "nivel": 10,
      "jogadorId": 7
    }
  }
  ```

- [ ] BACKEND-012 `PUT /api/jogos/{jogoId}/participantes/{id}` - Approve/reject participant
  - Authorization: Mestre (owner) only
  - Validation: status must transition from PENDENTE to APROVADO or REJEITADO
  - **Request**:
  ```json
  {
    "status": "APROVADO"
  }
  ```
  - **Response** (200 OK):
  ```json
  {
    "id": 12,
    "jogoId": 1,
    "jogadorId": 7,
    "fichaId": 25,
    "status": "APROVADO",
    "dataParticipacao": "2026-02-01T16:00:00Z",
    "jogador": {
      "id": 7,
      "nome": "Pedro Costa",
      "email": "pedro@example.com"
    },
    "ficha": {
      "id": 25,
      "nome": "Gandalf",
      "nivel": 10,
      "jogadorId": 7
    }
  }
  ```

- [ ] BACKEND-013 `DELETE /api/jogos/{jogoId}/participantes/{id}` - Remove participant
  - Authorization: Mestre (owner) or Jogador (self only)
  - Note: If Jogador, can only delete own participant entry
  - **Response** (204 No Content): Empty body

---

## Character Sheets (Fichas) Endpoints

### 🔨 To Implement

- [ ] BACKEND-014 `GET /api/fichas` - List character sheets
  - Query params: `?jogoId=123&jogadorId=456` (optional filters)
  - Authorization: Mestre sees all, Jogador sees only own fichas
  - **Expected Response** (200 OK):
  ```json
  [
    {
      "id": 20,
      "nome": "Aragorn",
      "nivel": 5,
      "experiencia": 12500,
      "jogadorId": 5,
      "jogoId": 1,
      "dataCriacao": "2026-01-15T10:00:00Z",
      "dataAtualizacao": "2026-02-01T14:00:00Z",
      "jogador": {
        "id": 5,
        "nome": "João Silva",
        "email": "joao@example.com"
      },
      "jogo": {
        "id": 1,
        "nome": "Campanha do Reino Perdido"
      }
    }
  ]
  ```

- [ ] BACKEND-015 `POST /api/fichas` - Create character sheet
  - Authorization: Jogador only
  - Validation: nome required, 3-50 chars, unique per jogador
  - **IMPORTANT**: Backend MUST recalculate all derived stats before returning response
  - **Request** (Client sends base values only):
  ```json
  {
    "nome": "Klayrah",
    "jogadorId": 5,
    "jogoId": 1,
    "identificacao": {
      "origem": "Humano",
      "indole": "Neutro Bom",
      "linhagem": "Nobre",
      "presencaId": 1,
      "tipoHeroico": "Guerreiro"
    },
    "progressao": {
      "nivel": 1,
      "experiencia": 0,
      "limitadorId": null,
      "renascimento": 0,
      "insolitus": 0,
      "nvs": 0
    },
    "descricaoFisica": {
      "idade": 25,
      "altura": 180,
      "peso": 80,
      "olhos": "Castanho",
      "cabelo": "Preto"
    },
    "atributos": [
      { "atributoConfigId": 1, "base": 12, "nivel": 2, "outros": 1 },
      { "atributoConfigId": 2, "base": 10, "nivel": 1, "outros": 0 },
      { "atributoConfigId": 3, "base": 14, "nivel": 3, "outros": 2 }
    ],
    "vida": {
      "vidaVigor": 50,
      "vidaOutros": 10,
      "vidaNivel": 5,
      "sanguePercentual": 100,
      "membros": [
        { "membro": "CABECA", "integridade": 100 },
        { "membro": "TORSO", "integridade": 100 },
        { "membro": "BRACO_ESQ", "integridade": 100 },
        { "membro": "BRACO_DIR", "integridade": 100 },
        { "membro": "PERNA_ESQ", "integridade": 100 },
        { "membro": "PERNA_DIR", "integridade": 100 }
      ]
    },
    "aptidoes": [
      { "aptidaoConfigId": 1, "nivel": 3, "bonus": 2 },
      { "aptidaoConfigId": 2, "nivel": 2, "bonus": 1 }
    ],
    "equipamentos": [
      {
        "nome": "Espada Longa",
        "tipo": "ARMA",
        "dano": "1d8+3",
        "defesa": 0,
        "peso": 3.5,
        "descricao": "Espada de aço forjado"
      }
    ],
    "vantagens": [],
    "titulos": [],
    "runas": [],
    "anotacoes": "Personagem guerreiro focado em combate corpo a corpo"
  }
  ```
  - **Response** (201 Created - Backend RECALCULATED):
  ```json
  {
    "id": 30,
    "nome": "Klayrah",
    "jogadorId": 5,
    "jogoId": 1,
    "dataCriacao": "2026-02-01T16:30:00Z",
    "dataAtualizacao": "2026-02-01T16:30:00Z",
    "identificacao": {
      "id": 100,
      "fichaId": 30,
      "origem": "Humano",
      "indole": "Neutro Bom",
      "linhagem": "Nobre",
      "presencaId": 1,
      "tipoHeroico": "Guerreiro",
      "presenca": {
        "id": 1,
        "nome": "Aura Guerreira",
        "descricao": "+2 em intimidação"
      }
    },
    "progressao": {
      "id": 101,
      "fichaId": 30,
      "nivel": 1,
      "experiencia": 0,
      "limitadorId": null,
      "renascimento": 0,
      "insolitus": 0,
      "nvs": 0
    },
    "descricaoFisica": {
      "id": 102,
      "fichaId": 30,
      "idade": 25,
      "altura": 180,
      "peso": 80,
      "olhos": "Castanho",
      "cabelo": "Preto"
    },
    "atributos": [
      {
        "id": 200,
        "fichaId": 30,
        "atributoConfigId": 1,
        "base": 12,
        "nivel": 2,
        "outros": 1,
        "total": 15,
        "atributoConfig": {
          "id": 1,
          "nome": "Força",
          "abreviacao": "FOR",
          "ordem": 1,
          "formulaCalculo": null,
          "ativo": true
        }
      },
      {
        "id": 201,
        "fichaId": 30,
        "atributoConfigId": 2,
        "base": 10,
        "nivel": 1,
        "outros": 0,
        "total": 11,
        "atributoConfig": {
          "id": 2,
          "nome": "Agilidade",
          "abreviacao": "AGI",
          "ordem": 2,
          "formulaCalculo": null,
          "ativo": true
        }
      },
      {
        "id": 202,
        "fichaId": 30,
        "atributoConfigId": 3,
        "base": 14,
        "nivel": 3,
        "outros": 2,
        "total": 19,
        "atributoConfig": {
          "id": 3,
          "nome": "Vigor",
          "abreviacao": "VIG",
          "ordem": 3,
          "formulaCalculo": null,
          "ativo": true
        }
      }
    ],
    "calculados": {
      "bba": 8.67,
      "bbm": 7.33,
      "impeto": 75,
      "reflexo": 10.33,
      "bloqueio": 17.00,
      "percepcao": 9.00,
      "raciocinio": 8.50,
      "essencia": 16.50
    },
    "vida": {
      "id": 300,
      "fichaId": 30,
      "vidaVigor": 50,
      "vidaOutros": 10,
      "vidaNivel": 5,
      "vidaTotal": 65,
      "sanguePercentual": 100,
      "membros": [
        {
          "id": 400,
          "fichaVidaId": 300,
          "membro": "CABECA",
          "integridade": 100
        },
        {
          "id": 401,
          "fichaVidaId": 300,
          "membro": "TORSO",
          "integridade": 100
        },
        {
          "id": 402,
          "fichaVidaId": 300,
          "membro": "BRACO_ESQ",
          "integridade": 100
        },
        {
          "id": 403,
          "fichaVidaId": 300,
          "membro": "BRACO_DIR",
          "integridade": 100
        },
        {
          "id": 404,
          "fichaVidaId": 300,
          "membro": "PERNA_ESQ",
          "integridade": 100
        },
        {
          "id": 405,
          "fichaVidaId": 300,
          "membro": "PERNA_DIR",
          "integridade": 100
        }
      ]
    },
    "aptidoes": [
      {
        "id": 500,
        "fichaId": 30,
        "aptidaoConfigId": 1,
        "nivel": 3,
        "bonus": 2,
        "aptidaoConfig": {
          "id": 1,
          "nome": "Espadas",
          "tipoAptidaoId": 1,
          "ordem": 1,
          "ativo": true,
          "tipoAptidao": {
            "id": 1,
            "nome": "FISICO"
          }
        }
      },
      {
        "id": 501,
        "fichaId": 30,
        "aptidaoConfigId": 2,
        "nivel": 2,
        "bonus": 1,
        "aptidaoConfig": {
          "id": 2,
          "nome": "Atletismo",
          "tipoAptidaoId": 1,
          "ordem": 2,
          "ativo": true,
          "tipoAptidao": {
            "id": 1,
            "nome": "FISICO"
          }
        }
      }
    ],
    "equipamentos": [
      {
        "id": 600,
        "fichaId": 30,
        "nome": "Espada Longa",
        "tipo": "ARMA",
        "dano": "1d8+3",
        "defesa": 0,
        "peso": 3.5,
        "descricao": "Espada de aço forjado"
      }
    ],
    "vantagens": [],
    "titulos": [],
    "runas": [],
    "anotacoes": "Personagem guerreiro focado em combate corpo a corpo",
    "jogador": {
      "id": 5,
      "nome": "João Silva",
      "email": "joao@example.com"
    },
    "jogo": {
      "id": 1,
      "nome": "Campanha do Reino Perdido",
      "mestreId": 1
    }
  }
  ```

- [ ] BACKEND-016 `GET /api/fichas/{id}` - Get character sheet details
  - Authorization: Mestre or Jogador (owner) only
  - **IMPORTANT**: All calculated fields must reflect current formulas from config
  - **Expected Response** (200 OK): Same structure as POST response above

- [ ] BACKEND-017 `PUT /api/fichas/{id}` - Update character sheet
  - Authorization: Jogador (owner) or Mestre
  - Note: Support partial updates for auto-save
  - **IMPORTANT**: Backend MUST recalculate all derived stats after any change to base values
  - **Request** (Partial update example):
  ```json
  {
    "atributos": [
      { "id": 200, "atributoConfigId": 1, "base": 13, "nivel": 3, "outros": 1 }
    ]
  }
  ```
  - **Response** (200 OK): Full Ficha object with RECALCULATED values (same structure as POST/GET)

- [ ] BACKEND-018 `DELETE /api/fichas/{id}` - Delete character sheet
  - Authorization: Jogador (owner) only
  - Cascade: Remove from participantes if associated with game
  - **Response** (204 No Content): Empty body

### ⚠️ Optional (for Phase 3A - Wizard)

- [ ] BACKEND-019 `POST /api/fichas/draft` - Save draft character sheet
  - Request: Partial Ficha object (incomplete data OK)
  - Response: Created draft with draftId
  - Authorization: Jogador only
  - Note: Separate table or flag `isDraft: true`

- [ ] BACKEND-020 `PUT /api/fichas/draft/{draftId}` - Update draft
  - Request: Partial Ficha object
  - Response: Updated draft
  - Authorization: Jogador (owner) only

- [ ] BACKEND-021 `POST /api/fichas/draft/{draftId}/publish` - Convert draft to final ficha
  - Response: Created Ficha object (moves from draft to fichas table)
  - Validation: All required fields must be present

---

## Configuration Endpoints (Mestre Only)

### 🔨 To Implement

All config endpoints follow the same CRUD pattern:

#### Atributos (Attributes)
- [ ] BACKEND-022 `GET /api/config/atributos` - List all
  - **Expected Response** (200 OK):
  ```json
  [
    {
      "id": 1,
      "nome": "Força",
      "abreviacao": "FOR",
      "ordem": 1,
      "formulaCalculo": null,
      "ativo": true
    },
    {
      "id": 2,
      "nome": "Agilidade",
      "abreviacao": "AGI",
      "ordem": 2,
      "formulaCalculo": null,
      "ativo": true
    },
    {
      "id": 8,
      "nome": "Base Bonus Ataque",
      "abreviacao": "BBA",
      "ordem": 8,
      "formulaCalculo": "(FOR + AGI) / 3",
      "ativo": true
    }
  ]
  ```

- [ ] BACKEND-023 `POST /api/config/atributos` - Create
  - Authorization: Mestre only
  - Validation: nome unique, abreviacao unique (2-5 chars), ordem unique
  - **Request**:
  ```json
  {
    "nome": "Inteligência",
    "abreviacao": "INT",
    "ordem": 3,
    "formulaCalculo": null,
    "ativo": true
  }
  ```
  - **Response** (201 Created):
  ```json
  {
    "id": 10,
    "nome": "Inteligência",
    "abreviacao": "INT",
    "ordem": 3,
    "formulaCalculo": null,
    "ativo": true
  }
  ```

- [ ] BACKEND-024 `PUT /api/config/atributos/{id}` - Update
  - **Request**:
  ```json
  {
    "nome": "Inteligência Modificada",
    "formulaCalculo": "(SAB + INT) / 2"
  }
  ```
  - **Response** (200 OK): Updated AtributoConfig object

- [ ] BACKEND-025 `DELETE /api/config/atributos/{id}` - Delete
  - Soft delete if used in fichas (set ativo = false)
  - **Response** (204 No Content): Empty body
  - **Alternative Response** (400 Bad Request) if in use:
  ```json
  {
    "status": 400,
    "message": "Não é possível excluir atributo em uso. Use desativação.",
    "details": {
      "fichasUsando": 15
    }
  }
  ```

#### Aptidões (Skills)
- [ ] BACKEND-026 `GET /api/config/aptidoes` - List all with tipoAptidao nested
  - **Expected Response** (200 OK):
  ```json
  [
    {
      "id": 1,
      "nome": "Espadas",
      "tipoAptidaoId": 1,
      "ordem": 1,
      "ativo": true,
      "tipoAptidao": {
        "id": 1,
        "nome": "FISICO"
      }
    },
    {
      "id": 2,
      "nome": "Atletismo",
      "tipoAptidaoId": 1,
      "ordem": 2,
      "ativo": true,
      "tipoAptidao": {
        "id": 1,
        "nome": "FISICO"
      }
    },
    {
      "id": 15,
      "nome": "Conhecimento Arcano",
      "tipoAptidaoId": 2,
      "ordem": 15,
      "ativo": true,
      "tipoAptidao": {
        "id": 2,
        "nome": "MENTAL"
      }
    }
  ]
  ```

- [ ] BACKEND-027 `POST /api/config/aptidoes` - Create
  - **Request**:
  ```json
  {
    "nome": "Furtividade",
    "tipoAptidaoId": 1,
    "ordem": 8,
    "ativo": true
  }
  ```
  - **Response** (201 Created):
  ```json
  {
    "id": 25,
    "nome": "Furtividade",
    "tipoAptidaoId": 1,
    "ordem": 8,
    "ativo": true,
    "tipoAptidao": {
      "id": 1,
      "nome": "FISICO"
    }
  }
  ```

- [ ] BACKEND-028 `PUT /api/config/aptidoes/{id}` - Update
  - **Response** (200 OK): Updated AptidaoConfig with nested tipoAptidao

- [ ] BACKEND-029 `DELETE /api/config/aptidoes/{id}` - Delete
  - **Response** (204 No Content) or (400 Bad Request) if in use

#### Níveis (Levels)
- [ ] BACKEND-030 `GET /api/config/niveis` - List all
- [ ] BACKEND-031 `POST /api/config/niveis` - Create
  - Request: `{ nivel: number, xpMinimo: number, xpMaximo: number, bonusAtributo: number }`
  - Validation: nivel unique, xpMinimo < xpMaximo, no overlapping ranges
- [ ] BACKEND-032 `PUT /api/config/niveis/{id}` - Update
- [ ] BACKEND-033 `DELETE /api/config/niveis/{id}` - Delete

#### Limitadores (Limiters)
- [ ] BACKEND-034 `GET /api/config/limitadores` - List all
- [ ] BACKEND-035 `POST /api/config/limitadores` - Create
  - Request: `{ nome: string, descricao: string, penalidade: number }`
- [ ] BACKEND-036 `PUT /api/config/limitadores/{id}` - Update
- [ ] BACKEND-037 `DELETE /api/config/limitadores/{id}` - Delete

#### Classes (Character Classes)
- [ ] BACKEND-038 `GET /api/config/classes` - List all
- [ ] BACKEND-039 `POST /api/config/classes` - Create
  - Request: `{ nome: string, descricao: string, bonusAtributos: { [atributo: string]: number } }`
  - Example: `{ "FOR": 2, "VIG": 1 }`
- [ ] BACKEND-040 `PUT /api/config/classes/{id}` - Update
- [ ] BACKEND-041 `DELETE /api/config/classes/{id}` - Delete

#### Vantagens (Advantages)
- [ ] BACKEND-042 `GET /api/config/vantagens` - List all with categoriaVantagem nested
- [ ] BACKEND-043 `POST /api/config/vantagens` - Create
  - Request: `{ nome: string, categoriaVantagemId: number, custo: number, descricao: string, ativo: boolean }`
- [ ] BACKEND-044 `PUT /api/config/vantagens/{id}` - Update
- [ ] BACKEND-045 `DELETE /api/config/vantagens/{id}` - Delete

#### Raças (Races)
- [ ] BACKEND-046 `GET /api/config/racas` - List all
- [ ] BACKEND-047 `POST /api/config/racas` - Create
  - Request: `{ nome: string, descricao: string, bonusAtributos: { [atributo: string]: number } }`
- [ ] BACKEND-048 `PUT /api/config/racas/{id}` - Update
- [ ] BACKEND-049 `DELETE /api/config/racas/{id}` - Delete

#### Prospecção (Prospecting Dice)
- [ ] BACKEND-050 `GET /api/config/prospeccao` - List all
- [ ] BACKEND-051 `POST /api/config/prospeccao` - Create
  - Request: `{ tipoDado: string, regras: string }` (e.g., "D6", "Roll 1d6 for...")
- [ ] BACKEND-052 `PUT /api/config/prospeccao/{id}` - Update
- [ ] BACKEND-053 `DELETE /api/config/prospeccao/{id}` - Delete

#### Presenças (Presences/Auras)
- [ ] BACKEND-054 `GET /api/config/presencas` - List all
- [ ] BACKEND-055 `POST /api/config/presencas` - Create
  - Request: `{ nome: string, descricao: string, efeito: string }`
- [ ] BACKEND-056 `PUT /api/config/presencas/{id}` - Update
- [ ] BACKEND-057 `DELETE /api/config/presencas/{id}` - Delete

#### Gêneros (Genders)
- [ ] BACKEND-058 `GET /api/config/generos` - List all
- [ ] BACKEND-059 `POST /api/config/generos` - Create
  - Request: `{ nome: string, descricao?: string }`
- [ ] BACKEND-060 `PUT /api/config/generos/{id}` - Update
- [ ] BACKEND-061 `DELETE /api/config/generos/{id}` - Delete

---

## Additional Endpoints

### Tipos de Aptidão (Skill Types)
- [ ] BACKEND-062 `GET /api/config/tipos-aptidao` - List all (FISICO, MENTAL)
  - Response: `[{ id: 1, nome: 'FISICO' }, { id: 2, nome: 'MENTAL' }]`
  - Note: May be enum, but need endpoint for dropdowns

### Categorias de Vantagem (Advantage Categories)
- [ ] BACKEND-063 `GET /api/config/categorias-vantagem` - List all
- [ ] BACKEND-064 `POST /api/config/categorias-vantagem` - Create
  - Request: `{ nome: string }`
- [ ] BACKEND-065 `PUT /api/config/categorias-vantagem/{id}` - Update
- [ ] BACKEND-066 `DELETE /api/config/categorias-vantagem/{id}` - Delete

---

## Data Model Considerations

### Nested vs Flat Responses

**Question**: Should GET endpoints return nested objects or flat with IDs only?

**Example**:
```json
// Nested (preferred for frontend)
{
  "id": 1,
  "nome": "Klayrah",
  "jogador": {
    "id": 10,
    "nome": "Carlos",
    "email": "carlos@example.com"
  },
  "atributos": [
    {
      "id": 100,
      "atributoConfig": {
        "id": 1,
        "nome": "Força",
        "abreviacao": "FOR"
      },
      "base": 10,
      "nivel": 2,
      "outros": 1,
      "total": 13
    }
  ]
}

// Flat (requires multiple API calls from frontend)
{
  "id": 1,
  "nome": "Klayrah",
  "jogadorId": 10,
  "atributos": [
    {
      "id": 100,
      "atributoConfigId": 1,
      "base": 10,
      "nivel": 2,
      "outros": 1,
      "total": 13
    }
  ]
}
```

**Recommendation**: Use nested for GET (read), flat for POST/PUT (write). Backend can use DTOs to handle both.

---

## Pagination Strategy

**Question**: Should lists be paginated server-side or return all items?

**Recommendation**:
- **Config endpoints**: Return all (usually < 100 items)
- **Jogos, Fichas**: Return all for now, add pagination later if needed
- **Future**: Support `?page=0&size=20&sort=dataCriacao,desc`

**Response format (if paginated)**:
```json
{
  "content": [...],
  "totalElements": 150,
  "totalPages": 8,
  "page": 0,
  "size": 20
}
```

---

## Formula Calculation: Frontend AND Backend

**Question**: Who calculates derived stats (BBA, BBM, Ímpeto, vidaTotal, etc.)?

**Strategy**: **HYBRID - Backend as Source of Truth**

### Approach:
1. **Frontend calculates TEMPORARILY**: For immediate visual feedback while user edits (before save)
   - Provides responsive UX - values update in real-time as user types
   - Uses `FichaCalculationService` with formulas from ConfigStore
   - **NOT PERSISTED** - only for display

2. **Backend RECALCULATES on save**: Official calculations when ficha is saved
   - POST/PUT `/api/fichas/*` must recalculate ALL derived stats server-side
   - Backend response includes recalculated values (source of truth)
   - Frontend REPLACES temporary values with backend response
   - Ensures consistency, prevents manipulation, centralizes business logic

### Implementation:
- [ ] **BACKEND-067** Implement calculation engine in backend
  - Service: `FichaCalculationService` (Java/Spring)
  - Parse formulas from `atributo_config.formulaCalculo`
  - Calculate all derived stats: BBA, BBM, Ímpeto, Reflexo, vidaTotal, etc.
  - Apply on every POST/PUT to `/api/fichas/{id}`
  - Return recalculated ficha in response

- [ ] **BACKEND-068** Validate formulas in config endpoints
  - When creating/updating AtributoConfig with `formulaCalculo`
  - Parse formula to ensure valid syntax before saving
  - Return validation error if formula invalid

### Benefits:
- **UX**: Instant feedback without server roundtrip
- **Security**: Backend validates and enforces correct calculations
- **Maintainability**: Single source of formula logic (backend)
- **Consistency**: All fichas have correct calculated values

### Frontend Implementation Note:
Frontend `FichaCalculationService` should DUPLICATE backend logic for preview only.
Always use backend-returned values after save as the official state.

---

## Error Response Format

**Standard format** (recommended):
```json
{
  "timestamp": "2026-02-01T12:34:56.789Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Nome é obrigatório",
  "path": "/api/jogos"
}
```

**Validation errors** (optional, better UX):
```json
{
  "status": 400,
  "message": "Erro de validação",
  "errors": {
    "nome": ["Nome é obrigatório", "Nome deve ter entre 3 e 50 caracteres"],
    "email": ["Email inválido"]
  }
}
```

---

## CORS Configuration

**Required headers** (if frontend and backend on different domains):
```
Access-Control-Allow-Origin: http://localhost:4200
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, X-XSRF-TOKEN
```

**Note**: Already configured in Spring Boot backend (verify working).

---

## Implementation Priority

### Week 1 (Critical for MVP)
1. ✅ `GET /api/auth/me` (already done)
2. `GET /api/jogos`, `POST /api/jogos`, `GET /api/jogos/{id}`
3. `GET /api/fichas`, `GET /api/fichas/{id}`

### Week 2 (Core Features)
4. `PUT /api/jogos/{id}`, `DELETE /api/jogos/{id}`
5. `POST /api/fichas`, `PUT /api/fichas/{id}`, `DELETE /api/fichas/{id}`
6. Participant endpoints (POST, PUT, DELETE)

### Week 3 (Configuration)
7. All `/api/config/*` endpoints (CRUD for 10 entity types)

### Week 4 (Optional/Nice-to-Have)
8. Draft endpoints (`/api/fichas/draft/*`)
9. Batch update for ordering (`PUT /api/config/atributos/batch`)
10. Export/import config endpoints

---

## Testing Recommendations

### Backend Team Should Test
- [ ] All endpoints with Postman or similar
- [ ] Authentication (valid/invalid tokens, expired sessions)
- [ ] Authorization (Mestre vs Jogador permissions)
- [ ] Validation (required fields, unique constraints, ranges)
- [ ] Error responses (400, 401, 403, 404, 500)
- [ ] CORS headers (if cross-domain)

### Integration Testing (Frontend + Backend)
- [ ] Frontend can call all endpoints successfully
- [ ] HttpOnly cookies work (credentials: include)
- [ ] CSRF tokens work (X-XSRF-TOKEN header)
- [ ] Nested objects returned correctly
- [ ] Error responses handled gracefully by frontend

---

## Communication Protocol

### How Frontend Team Communicates Needs
1. **This document**: Master list of all endpoints needed
2. **GitHub Issues**: Create issue per endpoint with acceptance criteria
3. **Slack/Discord**: Quick questions, blockers, status updates
4. **Weekly sync**: Review progress, adjust priorities

### How Backend Team Communicates Completion
1. **GitHub PR**: Tag frontend team for review
2. **Swagger/OpenAPI**: Update spec after implementation
3. **Staging deploy**: Deploy to staging server for frontend testing
4. **Notification**: Message frontend team when endpoint ready

---

## OpenAPI / Swagger Specification

**Request**: Backend team provide OpenAPI 3.0 spec for all endpoints.

**Benefits**:
- Frontend team can generate TypeScript interfaces automatically
- Both teams have single source of truth for API contracts
- Can use Swagger UI for testing

**Example** (partial):
```yaml
openapi: 3.0.0
info:
  title: Ficha Controlador API
  version: 1.0.0
paths:
  /api/jogos:
    get:
      summary: List all games
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Jogo'
components:
  schemas:
    Jogo:
      type: object
      properties:
        id:
          type: integer
        nome:
          type: string
        descricao:
          type: string
        # ... more fields
```

---

## ⚠️ Additional Missing Endpoints (Verificar Necessidade)

### Dashboard Statistics
- [ ] BACKEND-069 `GET /api/dashboard/mestre` - Get Mestre dashboard stats
  - **Expected Response**:
  ```json
  {
    "totalJogos": 5,
    "jogosAtivos": 3,
    "totalParticipantes": 15,
    "participantesPendentes": 3,
    "ultimaAtividade": "2026-02-01T15:00:00Z"
  }
  ```

- [ ] BACKEND-070 `GET /api/dashboard/jogador` - Get Jogador dashboard stats
  - **Expected Response**:
  ```json
  {
    "totalFichas": 8,
    "jogosParticipando": 2,
    "convitesPendentes": 1,
    "ultimaFichaEditada": {
      "id": 20,
      "nome": "Aragorn",
      "dataAtualizacao": "2026-02-01T14:00:00Z"
    }
  }
  ```

### Batch Operations
- [ ] BACKEND-071 `PUT /api/config/atributos/batch-reorder` - Batch update ordem
  - **Purpose**: Reorder multiple atributos at once (drag-and-drop)
  - **Request**:
  ```json
  {
    "updates": [
      { "id": 1, "ordem": 2 },
      { "id": 2, "ordem": 1 },
      { "id": 3, "ordem": 3 }
    ]
  }
  ```
  - **Response** (200 OK): Array of updated AtributoConfig

- [ ] BACKEND-072 `PUT /api/config/aptidoes/batch-reorder` - Batch update ordem aptidões
  - Similar to BACKEND-071

### Validation Endpoints
- [ ] BACKEND-073 `POST /api/config/atributos/validate-formula` - Validate formula syntax
  - **Purpose**: Check formula before saving config
  - **Request**:
  ```json
  {
    "formula": "(FOR + AGI) / 3"
  }
  ```
  - **Response** (200 OK):
  ```json
  {
    "valid": true,
    "message": "Fórmula válida"
  }
  ```
  - **Response** (400 Bad Request) if invalid:
  ```json
  {
    "valid": false,
    "message": "Atributo 'XYZ' não existe",
    "details": {
      "unknownAttributes": ["XYZ"]
    }
  }
  ```

---

## ✅ Validation Checklist

### General Requirements
- [ ] All endpoints return consistent error format (see Error Response Format section)
- [ ] All endpoints include proper HTTP status codes (200, 201, 204, 400, 401, 403, 404, 500)
- [ ] All POST/PUT endpoints validate input and return field-specific errors
- [ ] All endpoints that return nested objects include full object (not just IDs)
- [ ] All timestamps use ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ)
- [ ] All endpoints support CORS headers for cross-origin requests

### Authentication & Authorization
- [ ] All protected endpoints check authentication (401 if not authenticated)
- [ ] All endpoints check authorization (403 if user lacks permission)
- [ ] Mestre-only endpoints reject Jogador users
- [ ] Jogador endpoints only return own data (fichas, participantes)
- [ ] CSRF tokens validated on all mutating operations (POST, PUT, DELETE, PATCH)

### Data Integrity
- [ ] Unique constraints enforced (nome per mestre, abreviacao, ordem)
- [ ] Foreign key constraints validated (fichaId exists, jogoId exists)
- [ ] Cascade deletes handled correctly (delete jogo → delete participantes)
- [ ] Soft deletes used where appropriate (config items in use)

### Calculated Values
- [ ] POST /api/fichas returns RECALCULATED values
- [ ] PUT /api/fichas returns RECALCULATED values
- [ ] GET /api/fichas/{id} returns CURRENT calculated values (based on config formulas)
- [ ] Calculation engine handles division by zero, invalid formulas
- [ ] All 8 derived stats calculated: BBA, BBM, Ímpeto, Reflexo, Bloqueio, Percepção, Raciocínio, Essência

### Performance
- [ ] LIST endpoints use pagination if > 100 items (or document "no pagination needed")
- [ ] Nested objects use efficient queries (avoid N+1 problem)
- [ ] Config endpoints cache results (rarely change)

### Testing
- [ ] Postman/Swagger collection available for all endpoints
- [ ] Integration tests cover happy path and error cases
- [ ] Load tests verify performance under concurrent users

---

## 📊 Endpoint Summary

| Category | GET | POST | PUT | DELETE | Total |
|----------|-----|------|-----|--------|-------|
| Auth | 1 | 0 | 1 | 0 | 2 |
| Jogos | 2 | 1 | 1 | 1 | 5 |
| Participantes | 1 | 1 | 1 | 1 | 4 |
| Fichas | 2 | 2 | 2 | 1 | 7 |
| Config (10 types) | 10 | 10 | 10 | 10 | 40 |
| Misc (tipos, categorias) | 2 | 1 | 1 | 1 | 5 |
| Dashboard | 2 | 0 | 0 | 0 | 2 |
| Batch/Validation | 0 | 1 | 2 | 0 | 3 |
| **TOTAL** | **20** | **16** | **18** | **14** | **68** |

---

## Questions for Backend Team

1. **Nested objects**: ✅ YES - return nested mestre, participantes, fichas in responses (confirmed needed)
2. **Pagination**: NO for now - return all items (< 100 expected), add later if needed
3. **Formula calculation**: ✅ HYBRID - Backend recalculates on save (source of truth), frontend previews temporarily
4. **Draft fichas**: Optional - separate table or `isDraft: boolean` flag (Priority: LOW - Week 4)
5. **Soft delete**: ✅ YES - soft delete config items if in use (set `ativo: false`)
6. **Batch operations**: Optional - batch reorder for better UX (Priority: LOW - Week 4)
7. **File uploads**: NOT NOW - future feature for avatars (Phase 2+)
8. **WebSockets**: NOT NOW - future feature for real-time updates (Phase 2+)

---

**Next Steps**:
1. ✅ Backend team reviews this document (WITH EXAMPLES!)
2. Backend team creates implementation tasks (GitHub Issues) - 1 issue per endpoint or related group
3. Backend team provides timeline for each endpoint (see Implementation Priority section)
4. Backend team implements endpoints following expected response formats
5. Frontend team proceeds with mock services, swaps in real API as endpoints complete
6. Both teams test integration using examples in this document

---

**Contact**: Frontend Lead - Carlos Demetrio  
**Last Updated**: 2026-02-01 (With Complete Examples & Validation Checklist)
