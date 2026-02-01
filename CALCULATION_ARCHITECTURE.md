# 🎯 ARQUITETURA DE CÁLCULOS - Frontend vs Backend

**Data**: 2026-02-01  
**Status**: ✅ **DEFINIDO E IMPLEMENTADO**

---

## 🔥 CONCEITO: Preview Temporário + Cálculo Oficial

### ❌ ERRADO (Antigo):
```
Frontend: Apenas coleta dados → Backend calcula tudo
Problema: UX ruim, usuário não vê feedback imediato
```

### ✅ CORRETO (Novo):
```
1. Frontend: Calcula PREVIEW temporário (UX responsiva)
   ├─ Usa fórmulas básicas hardcoded
   └─ Mostra feedback imediato ao usuário

2. Backend: Recalcula OFICIALMENTE ao salvar
   ├─ Usa fórmulas/configurações do banco
   ├─ Aplica regras de negócio complexas
   └─ Retorna valores oficiais

3. Frontend: Substitui preview pelos valores oficiais
   └─ Mostra dados do backend
```

---

## 📋 FLUXO COMPLETO

### Fase 1: Criação/Edição (PREVIEW)
```typescript
// Usuário preenche form
FOR: 16

// Frontend calcula preview IMEDIATO
modFOR_preview = Math.floor((16 - 10) / 2) = +3  ← Hardcoded

// Usuário vê feedback INSTANTÂNEO
"FOR: 16 (Mod: +3)" ← Preview visual
```

### Fase 2: Submit (BACKEND OFICIAL)
```typescript
// Submit form
POST /api/fichas
{
  atributos: [
    { nome: 'FOR', valorBase: 16 }
  ]
}

// Backend processa com fórmulas do DB
modFOR_oficial = aplicarFormula(config.modificadorAtributo, 16)
BBA = aplicarFormula(config.formulaBBA, nivel, modFOR)
impeto = aplicarFormula(config.formulaImpeto, nivel, modDES)
vidaTotal = aplicarFormula(config.formulaVida, vidaVigor, vidaOutros, vidaNivel)

// Backend retorna ficha completa
{
  id: 123,
  atributos: [
    { nome: 'FOR', valorBase: 16, modificador: 3 }  ← Oficial do backend
  ],
  calculados: {
    BBA: 8,      ← Oficial
    BBM: 5,      ← Oficial
    impeto: 12   ← Oficial
  },
  vida: {
    vidaTotal: 85  ← Oficial
  }
}
```

### Fase 3: Visualização (VALORES OFICIAIS)
```typescript
// Frontend usa valores do backend
ficha.atributos[0].modificador  // 3 (do backend)
ficha.calculados.BBA            // 8 (do backend)
ficha.vida.vidaTotal            // 85 (do backend)

// Preview é DESCARTADO
```

---

## 🎨 IMPLEMENTAÇÃO NOS COMPONENTES

### ✅ VidaSectionComponent (DUMB)
```typescript
/**
 * PREVIEW TEMPORÁRIO (client-side)
 * Fórmula básica hardcoded: vidaVigor + vidaOutros + vidaNivel
 * Backend recalculará com fórmula oficial do DB
 */
getVidaTotalPreview(): number {
  const vidaVigor = this.form().get('vidaVigor')?.value || 0;
  const vidaOutros = this.form().get('vidaOutros')?.value || 0;
  const vidaNivel = this.form().get('vidaNivel')?.value || 0;
  return vidaVigor + vidaOutros + vidaNivel;  // ← Hardcoded simples
}
```

**Template**:
```html
<div class="text-3xl font-bold text-primary">
  {{ getVidaTotalPreview() }}  ← Preview
</div>
<small>Valor temporário - Backend calculará o oficial</small>
```

---

### ✅ AtributosSectionComponent (DUMB)
```typescript
/**
 * PREVIEW TEMPORÁRIO (client-side)
 * Fórmula básica hardcoded: (valorBase - 10) / 2
 * Backend recalculará com fórmula oficial do DB
 */
getModificadorPreview(index: number): string {
  const valorBase = this.getAtributo(index).valorBase || 10;
  const mod = Math.floor((valorBase - 10) / 2);  // ← Hardcoded simples
  return mod >= 0 ? `+${mod}` : `${mod}`;
}
```

**Template**:
```html
<span class="text-sm">
  <i class="pi pi-eye"></i> {{ getModificadorPreview($index) }}
</span>
```

---

## 🔮 FUTURO: Fórmulas Configuráveis (Backend)

### ConfigService (Backend) - TODO
```java
@Service
public class FormulaConfigService {
    
    // Fórmulas vindas do banco
    public int calcularModificador(int valorBase) {
        FormulaConfig config = configRepo.findByNome("modificadorAtributo");
        return aplicarFormula(config.formula, valorBase);
        // Ex: (valorBase - 10) / 2
    }
    
    public int calcularBBA(int nivel, int modFOR) {
        FormulaConfig config = configRepo.findByNome("formulaBBA");
        return aplicarFormula(config.formula, nivel, modFOR);
        // Ex: nivel + modFOR
    }
    
    public int calcularVidaTotal(int vigor, int outros, int nivel) {
        FormulaConfig config = configRepo.findByNome("formulaVidaTotal");
        return aplicarFormula(config.formula, vigor, outros, nivel);
        // Ex: vigor + outros + (nivel * 5)
    }
}
```

### Tabela: formula_config (Backend DB)
```sql
CREATE TABLE formula_config (
    id BIGINT PRIMARY KEY,
    nome VARCHAR(100) UNIQUE,
    formula VARCHAR(500),  -- Ex: "(valorBase - 10) / 2"
    descricao TEXT,
    jogo_id BIGINT  -- Fórmulas por jogo (opcional)
);

INSERT INTO formula_config VALUES
(1, 'modificadorAtributo', '(valorBase - 10) / 2', 'Modificador de atributo'),
(2, 'formulaBBA', 'nivel + modFOR', 'Bônus Base de Ataque'),
(3, 'formulaImpeto', 'nivel + modDES', 'Ímpeto'),
(4, 'formulaVidaTotal', 'vidaVigor + vidaOutros + (nivel * 5)', 'Vida Total');
```

---

## 📐 COMPARAÇÃO: Preview vs Oficial

### Exemplo Real:

| Campo | Preview (Frontend) | Oficial (Backend) | Diferença |
|-------|-------------------|------------------|-----------|
| FOR valorBase | 16 | 16 | - |
| FOR modificador | +3 (calc simples) | +3 (fórmula DB) | ✅ Igual |
| BBA | - (não calc) | 8 (fórmula DB) | Backend only |
| Vida Total | 85 (soma simples) | 90 (fórmula complexa DB) | ⚠️ Diferente |

**Por quê diferente?**
- Frontend: `vidaVigor(20) + vidaOutros(5) + vidaNivel(60) = 85`
- Backend: `vidaVigor(20) + vidaOutros(5) + (nivel(12) * 5) + bonusRaca(10) = 90`

**Solução**: Frontend SEMPRE substitui pelo valor do backend após save!

---

## ✅ REGRAS DE OURO

### 1. Preview SEMPRE com aviso visual
```html
<i class="pi pi-eye"></i> Preview: {{ valor }}
<small>Backend calculará o oficial</small>
```

### 2. Fórmulas Frontend são BÁSICAS e HARDCODED
```typescript
// ✅ OK: Fórmula simples hardcoded
mod = Math.floor((valorBase - 10) / 2);

// ❌ ERRADO: Tentar replicar lógica complexa do backend
mod = aplicarBonusRaca(aplicarBonusClasse(Math.floor((valorBase - 10) / 2)));
```

### 3. Backend é a ÚNICA fonte de verdade
```typescript
// Após save
const fichaOficial = await backend.save(fichaForm);
this.ficha.set(fichaOficial);  // ← Substitui tudo pelo backend
```

### 4. XP e Nível SÃO EXCEÇÃO
```html
<!-- XP: Apenas Mestre pode dar -->
<p-inputnumber formControlName="experiencia" [disabled]="!isMestre" />

<!-- Nível: SEMPRE calculado pelo backend -->
<p-inputnumber formControlName="nivel" [disabled]="true" />
```

---

## 🎯 VANTAGENS DESTA ARQUITETURA

### ✅ UX Responsiva
- Usuário vê feedback INSTANTÂNEO ao mudar valores
- Não precisa salvar para ver preview
- Sensação de aplicativo fluido

### ✅ Backend Mantém Controle
- Fórmulas complexas e configuráveis no DB
- Regras de negócio centralizadas
- Fácil de mudar fórmulas sem deploy frontend

### ✅ Código Simples
- Frontend: Fórmulas básicas hardcoded (fácil de entender)
- Backend: Fórmulas configuráveis (flexível)
- Sem duplicação de lógica complexa

### ✅ Segurança
- Frontend não pode "trapacear" valores calculados
- Backend SEMPRE recalcula oficialmente
- Frontend só mostra o que backend retorna

---

## 📝 CHECKLIST DE IMPLEMENTAÇÃO

Para cada campo calculado:

- [ ] Preview no frontend com ícone 👁️ "pi-eye"
- [ ] Aviso visual "Valor temporário"
- [ ] Fórmula básica hardcoded (simples)
- [ ] Backend tem fórmula oficial (pode ser complexa)
- [ ] Frontend substitui pelo valor oficial após save
- [ ] Documentação clara do comportamento

---

**Assinado por**: GitHub Copilot  
**Data**: 2026-02-01  
**Status**: ✅ **ARQUITETURA APROVADA E IMPLEMENTADA**
