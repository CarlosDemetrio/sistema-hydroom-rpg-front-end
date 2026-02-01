# Tasks: Character Sheets - Create (Wizard)

**Phase**: 3A (Parallel with 3B)  
**Duration**: 5 days  
**Dependencies**: Character Sheets View (Phase 2B) - reuses section components  
**Parallel with**: Configuration Panel (Phase 3B)

---

## Overview

8-step wizard for creating new character sheets using PrimeNG p-steps. Reuses section components from Phase 2B in edit mode.

**Deliverables**:
- ✅ Wizard wrapper with p-steps navigation
- ✅ 8 step components with reactive forms
- ✅ Form validation per step
- ✅ Save draft functionality
- ✅ Preview before final submit

---

## Tasks

### Section 1: Wizard Wrapper (Day 1)

- [ ] CREATE-001 Create SheetWizardComponent in `src/app/features/character-sheets/wizard/sheet-wizard.component.ts`
  - Standalone, imports StepsModule (PrimeNG), ReactiveFormsModule
  - Signal: `activeStep = signal<number>(0)`, `form = signal<FormGroup>(this.buildForm())`
  - Method: `buildForm()` creates FormGroup with all 8 sections
  - Template: `<p-steps [model]="steps" [(activeIndex)]="activeStep" />`, router-outlet for step components
  - Actions: [Anterior], [Próximo], [Salvar Rascunho], [Finalizar]

- [ ] CREATE-002 Implement step navigation in SheetWizardComponent
  - Method: `next()` validates current step, advances if valid
  - Method: `previous()` goes back without validation
  - Method: `goToStep(index: number)` validates all previous steps
  - Disable [Próximo] if current step invalid

- [ ] CREATE-003 Implement save draft in SheetWizardComponent  
  - Method: `async saveDraft()` saves partial ficha to backend (new endpoint: POST /api/fichas/draft)
  - Store draftId in component signal, use for updates
  - Show toast: "Rascunho salvo"

- [ ] CREATE-004 Implement final submit in SheetWizardComponent
  - Method: `async submit()` validates all steps, calls fichasState.createFicha()
  - Navigate to `/fichas/:id` on success
  - Show toast: "Ficha criada com sucesso!"

### Section 2: Wizard Steps 1-3 (Day 2)

- [ ] CREATE-005 Create Step1IdentificationComponent
  - Form fields: nome (required), origem, indole, linhagem, presencaId (dropdown), tipoHeroico
  - Reuse IdentificationSectionComponent with `readonly = false`
  - Validators: nome (required, minLength 3)

- [ ] CREATE-006 Create Step2ProgressionComponent
  - Form fields: nivel (default 1), experiencia (default 0), limitadorId (dropdown), renascimento, insolitus, nvs
  - Reuse ProgressionSectionComponent with `readonly = false`
  - Validators: nivel (required, min 1, max 100)

- [ ] CREATE-007 Create Step3PhysicalDescriptionComponent
  - Form fields: idade, altura (cm), peso (kg), olhos, cabelo
  - Use p-inputNumber for numeric fields
  - All optional

### Section 3: Wizard Steps 4-6 (Day 3)

- [ ] CREATE-008 Create Step4AttributesComponent
  - Load atributos from ConfigStateService
  - Create FormArray with controls for each atributo: { atributoConfigId, base (default 10), nivel (default 0), outros (default 0) }
  - Show table with inputs, display calculated total
  - Reuse AttributesSectionComponent table layout

- [ ] CREATE-009 Create Step5HealthComponent
  - Form fields: vidaVigor, vidaOutros, vidaNivel, sanguePercentual (default 100)
  - FormArray for membros (6 items): { membro (enum), integridade (default 100) }
  - Show calculated vidaTotal
  - Validators: sanguePercentual (min 0, max 100)

- [ ] CREATE-010 Create Step6SkillsComponent
  - Load aptidoes from ConfigStateService
  - Create FormArray with controls for each aptidao: { aptidaoConfigId, nivel (default 0), bonus (default 0) }
  - Show table with inputs (Físicas and Mentais tabs)
  - Validators: nivel (min 0, max 10)

### Section 4: Wizard Steps 7-8 (Day 4)

- [ ] CREATE-011 Create Step7EquipmentComponent
  - FormArray for equipamentos: { nome, tipo (dropdown: ARMA/ARMADURA/OUTRO), dano, defesa, peso, descricao }
  - [+ Adicionar Item] button to add new equipment
  - [Remover] button per item
  - Show calculated defesaTotal, pesoTotal

- [ ] CREATE-012 Create Step8SummaryComponent
  - Display read-only summary of all sections
  - Use section components in readonly mode
  - [Editar Seção] button jumps back to specific step
  - Show "Tudo pronto!" message, [Finalizar Criação] button

### Section 5: Form Validation & Error Handling (Day 5)

- [ ] CREATE-013 Add per-step validation messages
  - Each step shows validation summary at top if invalid
  - Use FormFieldErrorComponent for each field
  - Highlight invalid fields with red border

- [ ] CREATE-014 Add save draft error handling
  - Catch API errors, show toast: "Erro ao salvar rascunho"
  - Retry mechanism (button to try again)

- [ ] CREATE-015 Add final submit error handling
  - Catch API errors, show detailed error message
  - Keep user on wizard, allow corrections

---

## Acceptance Criteria

- ✅ All 8 steps accessible via p-steps navigation
- ✅ Can navigate forward only if current step valid
- ✅ Can navigate backward without validation
- ✅ Save draft works, can resume later (optional)
- ✅ Final submit creates character, navigates to view
- ✅ All form validations work, show error messages
- ✅ Wizard responsive on mobile (steps collapse)

---

**Next**: Proceed to `tasks-character-sheets-edit.md` (Phase 4)
