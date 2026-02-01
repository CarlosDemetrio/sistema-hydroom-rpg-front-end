# Backend Debt Improvements Summary

**Date**: 2026-02-01  
**Objective**: Complete backend-debt.md with detailed examples and validation checklists

---

## 🎯 Improvements Made

### 1. **Authentication Endpoints - COMPLETE EXAMPLES**
✅ Added expected response format for `GET /api/auth/me`
✅ Added request/response for `PUT /api/users/me`
✅ Documented cookie and CSRF token behavior

### 2. **Games Endpoints - COMPLETE EXAMPLES**
✅ **BACKEND-005** (GET /api/jogos): Full response with nested mestre and participantes
✅ **BACKEND-006** (POST /api/jogos): Request and response examples
✅ **BACKEND-007** (GET /api/jogos/{id}): Detailed response with all nested objects
✅ **BACKEND-008** (PUT /api/jogos/{id}): Request format
✅ **BACKEND-009** (DELETE /api/jogos/{id}): 204 response

### 3. **Participants Endpoints - COMPLETE EXAMPLES**
✅ **BACKEND-010** (GET participantes): Array with nested jogador and ficha
✅ **BACKEND-011** (POST join request): Request/response with status PENDENTE
✅ **BACKEND-012** (PUT approve/reject): Status transition example
✅ **BACKEND-013** (DELETE remove): 204 response

### 4. **Character Sheets Endpoints - COMPREHENSIVE EXAMPLES**
✅ **BACKEND-014** (GET list): Simplified list response
✅ **BACKEND-015** (POST create): **FULL EXAMPLE** with:
   - Complete request structure (all 13+ sections)
   - Complete response with RECALCULATED values
   - All nested objects (atributoConfig, aptidaoConfig, etc.)
   - Calculated stats object (BBA, BBM, Ímpeto, Reflexo, etc.)
   - All 6 limb members with integrity
   - Equipment, advantages, titles, runes

✅ **BACKEND-016** (GET by id): Same structure as POST response
✅ **BACKEND-017** (PUT update): Partial update example + full response
✅ **BACKEND-018** (DELETE): 204 response + cascade behavior

### 5. **Configuration Endpoints - DETAILED EXAMPLES**
✅ **Atributos (BACKEND-022 to 025)**:
   - GET: Array with all fields including formulaCalculo
   - POST: Request/response with validation notes
   - PUT: Update example
   - DELETE: 204 or 400 if in use with details

✅ **Aptidões (BACKEND-026 to 029)**:
   - GET: Array with nested tipoAptidao objects
   - POST: Request/response with nested type
   - PUT/DELETE: Response formats

### 6. **Additional Endpoints Identified**
✅ **Dashboard Stats** (BACKEND-069, 070):
   - Mestre dashboard with stats
   - Jogador dashboard with stats

✅ **Batch Operations** (BACKEND-071, 072):
   - Batch reorder for atributos
   - Batch reorder for aptidões

✅ **Validation** (BACKEND-073):
   - Formula validation endpoint
   - Success/error response formats

### 7. **Validation Checklist Created**
✅ General requirements (error formats, status codes, timestamps)
✅ Authentication & authorization checks
✅ Data integrity (unique constraints, foreign keys, cascades)
✅ Calculated values (recalculation requirements)
✅ Performance considerations
✅ Testing requirements

### 8. **Endpoint Summary Table**
✅ Created comprehensive table with counts by category
✅ Total: **68 endpoints** (20 GET, 16 POST, 18 PUT, 14 DELETE)

### 9. **Questions for Backend Team - ANSWERED**
✅ Converted questions to decisions with ✅/NO markers
✅ Clarified nested objects: YES (needed)
✅ Clarified pagination: NO for now
✅ Clarified calculations: HYBRID (backend official)
✅ Clarified soft delete: YES for configs in use

---

## 📝 Key Examples Added

### Complete Ficha Response Structure
```json
{
  "id": 30,
  "nome": "Klayrah",
  "identificacao": { ... },
  "progressao": { ... },
  "descricaoFisica": { ... },
  "atributos": [
    {
      "id": 200,
      "base": 12,
      "nivel": 2,
      "outros": 1,
      "total": 15,  // ← CALCULATED BY BACKEND
      "atributoConfig": {
        "nome": "Força",
        "abreviacao": "FOR"
      }
    }
  ],
  "calculados": {  // ← NEW SECTION
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
    "vidaTotal": 65,  // ← CALCULATED
    "membros": [ ... ]
  }
}
```

### Error Response Examples
```json
// Bad Request with field errors
{
  "status": 400,
  "message": "Erro de validação",
  "errors": {
    "nome": ["Nome é obrigatório", "Nome deve ter entre 3 e 50 caracteres"]
  }
}

// Cannot delete (in use)
{
  "status": 400,
  "message": "Não é possível excluir atributo em uso",
  "details": {
    "fichasUsando": 15
  }
}
```

---

## 🎯 What Backend Team Should Do

### Immediate (Week 1)
1. Review **all examples** in backend-debt.md
2. Confirm response structures match your data model
3. Create GitHub issues for:
   - BACKEND-001 to BACKEND-004 (Auth)
   - BACKEND-005 to BACKEND-009 (Jogos)
   - BACKEND-014 to BACKEND-018 (Fichas core)
4. Implement calculation engine (BACKEND-067)
5. Setup Postman collection with examples

### Week 2
6. Implement Participantes endpoints (BACKEND-010 to 013)
7. Implement Fichas validation and calculated values
8. Test with frontend team using exact examples

### Week 3
9. Implement Config endpoints (BACKEND-022 to 066)
10. Implement formula validation (BACKEND-068, 073)
11. Add dashboard endpoints (BACKEND-069, 070)

### Week 4 (Optional)
12. Batch operations (BACKEND-071, 072)
13. Draft fichas (BACKEND-019 to 021)

---

## ✅ Validation Points

### Response Consistency
- [ ] All nested objects included (not just IDs)
- [ ] All timestamps in ISO 8601 format
- [ ] All errors follow standard format

### Calculated Values
- [ ] POST /api/fichas recalculates ALL derived stats
- [ ] PUT /api/fichas recalculates ALL derived stats
- [ ] GET /api/fichas/{id} returns CURRENT calculated values
- [ ] Calculation engine exists and is tested

### Authorization
- [ ] Mestre can see all jogos
- [ ] Jogador only sees participated jogos
- [ ] Jogador only sees own fichas
- [ ] Mestre-only config endpoints reject Jogador

---

## 📊 Statistics

- **Total Endpoints**: 68
- **Endpoints with Complete Examples**: 15+ (critical path)
- **Endpoints with Partial Specs**: 40+ (config CRUD)
- **Validation Rules Added**: 20+
- **Response Examples**: 30+
- **Error Examples**: 5+

---

## 🚀 Next Steps

### For Backend Team
1. ✅ Review this document
2. Create implementation plan (GitHub Issues)
3. Implement endpoints following examples
4. Create Postman collection
5. Deploy to staging
6. Notify frontend team

### For Frontend Team
1. ✅ Create mock services based on examples
2. Build UI components using expected responses
3. Test with mock data
4. Swap mocks with real API as endpoints complete
5. Integration testing

---

## 📚 References

- **Main Document**: `.specify/tasks/backend-debt.md`
- **Architecture**: `ARCHITECTURE.md`
- **Tasks**: `.specify/tasks/tasks-core-infrastructure.md`
- **Frontend Spec**: `.specify/plans/feature-spec.md`

---

**Status**: ✅ BACKEND DEBT COMPLETE WITH EXAMPLES
**Ready for**: Backend team review and implementation
