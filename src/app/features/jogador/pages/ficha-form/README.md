# FichaFormComponent - Arquitetura Modular

**Data**: 2026-02-01  
**Status**: ✅ **MVP IMPLEMENTADO** (2/6 seções)

---

## 🎯 ARQUITETURA: Componentização Modular

### Problema Resolvido:
- ❌ Antes: Form gigante de 500+ linhas (inviável de manter)
- ✅ Agora: **Componentes modulares por seção** (fácil de testar e manter)

### Estrutura de Arquivos:
```
ficha-form/
├── ficha-form.component.ts       ← SMART (orquestra)
├── ficha-form.component.html     ← Template principal
├── sections/                     ← DUMB Components
│   ├── index.ts                  ← Exports
│   ├── identificacao-section.component.ts
│   ├── progressao-section.component.ts
│   ├── descricao-fisica-section.component.ts (TODO)
│   ├── atributos-section.component.ts (TODO)
│   ├── vida-section.component.ts (TODO)
│   └── ... (mais seções)
```

---

## 📦 COMPONENTES IMPLEMENTADOS

### 1️⃣ FichaFormComponent (SMART) ✅
**Arquivo**: `ficha-form.component.ts`

**Responsabilidades**:
- Orquestra FormBuilder reativo
- Cria FormGroups para cada seção
- Gerencia submit (create/update)
- Integra com FichaBusinessService
- Integra com CurrentGameService (jogo atual)
- Navegação e validações gerais

**Form Structure**:
```typescript
fichaForm
├── identificacao: FormGroup
│   ├── nome (required, 3-100 chars)
│   ├── origem
│   ├── indole
│   └── linhagem
├── progressao: FormGroup
│   ├── nivel (required, 1-20)
│   ├── experiencia
│   ├── renascimento
│   ├── insolitus
│   └── nvs
└── ... (mais seções)
```

**Fluxo**:
```
1. ngOnInit()
   ├── Verifica se tem jogo selecionado (redirect se não)
   ├── buildForm() - cria FormGroups
   └── Se edit mode: loadFicha(id)

2. onSubmit()
   ├── Valida form (markAsTouched em todos)
   ├── Monta fichaData
   ├── isEditMode? updateFicha() : createFicha()
   └── Success: Toast + navigate to /jogador/fichas

3. onCancel()
   └── Navigate back to /jogador/fichas
```

---

### 2️⃣ IdentificacaoSectionComponent (DUMB) ✅
**Arquivo**: `sections/identificacao-section.component.ts`

**Input**: `form: FormGroup` (required)  
**Output**: `changed: void` (opcional)

**Campos**:
- Nome (required, 3-100 chars)
- Origem
- Índole
- Linhagem

**Template**: Inline (p-card com grid de inputs)

---

### 3️⃣ ProgressaoSectionComponent (DUMB) ✅
**Arquivo**: `sections/progressao-section.component.ts`

**Input**: `form: FormGroup` (required)

**Campos**:
- Nível (required, 1-20, p-inputnumber com buttons)
- Experiência (XP)
- Renascimento
- Insolitus
- NVS

**Template**: Inline (p-card com grid de p-inputnumber)

---

## 🔧 BOAS PRÁTICAS APLICADAS

### ✅ Signals + Reactive Forms
```typescript
// State management
isEditMode = signal(false);
isSaving = signal(false);
loading = signal(false);

// Reactive Forms
fichaForm!: FormGroup;
identificacaoForm!: FormGroup;
progressaoForm!: FormGroup;
```

### ✅ DUMB Components (input/output)
```typescript
@Component({
  selector: 'app-identificacao-section',
  ...
})
export class IdentificacaoSectionComponent {
  form = input.required<FormGroup>();  // ← Signal input
  changed = output<void>();            // ← Signal output
}
```

### ✅ Template Separado
```typescript
@Component({
  ...
  templateUrl: './ficha-form.component.html'  // ← HTML separado
})
```

### ✅ Validações Centralizadas
```typescript
private buildForm() {
  this.identificacaoForm = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    // ...
  });
}
```

### ✅ Toast Messages UX
```typescript
this.messageService.add({
  severity: 'success',
  summary: 'Sucesso',
  detail: 'Ficha criada com sucesso!'
});
```

### ✅ Loading States
```html
@if (loading()) {
  <app-loading-spinner message="Carregando ficha..."></app-loading-spinner>
} @else {
  <form>...</form>
}
```

---

## 🚧 TODO: Seções Faltantes

### 4️⃣ DescricaoFisicaSectionComponent ⏳
**Campos**: Altura, peso, idade, olhos, cabelo, pele, aparência

### 5️⃣ AtributosSectionComponent ⏳
**Campos**: FOR, DES, CON, INT, SAB, CAR (FormArray dinâmico)

### 6️⃣ VidaSectionComponent ⏳
**Campos**: vidaVigor, vidaOutros, vidaNivel, sanguePercentual, membros (FormArray)

### 7️⃣ PericiasSectionComponent ⏳
**Campos**: Lista de perícias (FormArray dinâmico)

### 8️⃣ EquipamentosSectionComponent ⏳
**Campos**: Itens, armas, armaduras (FormArray)

### 9️⃣ VantagensSectionComponent ⏳
**Campos**: Vantagens/desvantagens (FormArray)

### 🔟 TitulosRunasSectionComponent ⏳
**Campos**: Títulos, runas (FormArray)

---

## 📋 COMO ADICIONAR NOVA SEÇÃO

### Passo 1: Criar Component (DUMB)
```bash
# Criar arquivo
touch sections/nova-secao-section.component.ts
```

```typescript
import { Component, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-nova-secao-section',
  standalone: true,
  imports: [ReactiveFormsModule, CardModule, ...],
  template: `
    <p-card>
      <ng-template #header>
        <div class="flex align-items-center gap-2 p-3">
          <i class="pi pi-ICON text-primary text-xl"></i>
          <h3 class="text-xl font-bold m-0">Nova Seção</h3>
        </div>
      </ng-template>

      <div [formGroup]="form()" class="grid">
        <!-- Seus campos aqui -->
      </div>
    </p-card>
  `
})
export class NovaSecaoSectionComponent {
  form = input.required<FormGroup>();
}
```

### Passo 2: Export no index.ts
```typescript
// sections/index.ts
export * from './nova-secao-section.component';
```

### Passo 3: Adicionar no ficha-form.component.ts
```typescript
// Import
import { NovaSecaoSectionComponent } from './sections';

// Imports array
imports: [..., NovaSecaoSectionComponent],

// buildForm()
this.novaSecaoForm = this.fb.group({
  campo1: ['', Validators.required],
  // ...
});

this.fichaForm = this.fb.group({
  ...
  novaSecao: this.novaSecaoForm
});
```

### Passo 4: Adicionar no template HTML
```html
<!-- ficha-form.component.html -->
<div class="col-12">
  <app-nova-secao-section [form]="novaSecaoForm"></app-nova-secao-section>
</div>
```

### Passo 5: Incluir no onSubmit()
```typescript
const fichaData = {
  ...
  novaSecao: formValue.novaSecao
};
```

---

## ✅ BENEFÍCIOS DA ARQUITETURA

1. **Manutenibilidade**: Cada seção é independente
2. **Testabilidade**: Testar seções isoladamente
3. **Reusabilidade**: Seções podem ser usadas em outros forms
4. **Legibilidade**: Arquivos pequenos (< 150 linhas)
5. **Escalabilidade**: Adicionar novas seções é trivial
6. **Performance**: Lazy loading potencial (futuro)

---

## 🎯 STATUS ATUAL

**Implementado**: 2/9 seções (22%)
- ✅ Identificação
- ✅ Progressão
- ⏳ Descrição Física
- ⏳ Atributos
- ⏳ Vida
- ⏳ Perícias
- ⏳ Equipamentos
- ⏳ Vantagens
- ⏳ Títulos/Runas

**Funcionalidades**:
- ✅ Criar ficha (apenas seções implementadas)
- ✅ Editar ficha (load + patch form)
- ✅ Validações
- ✅ Toast messages
- ✅ Loading states
- ✅ Integração com CurrentGameService
- ✅ Template HTML separado
- ⏳ Cálculos automáticos (client-side preview)

---

**Próximo Passo**: Implementar seções restantes conforme necessário

**Assinado por**: GitHub Copilot  
**Data**: 2026-02-01
