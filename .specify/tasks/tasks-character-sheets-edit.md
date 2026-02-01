# Tasks: Character Sheets - Edit & Calculations

**Phase**: 4  
**Duration**: 5 days  
**Dependencies**: Character Sheet Wizard (Phase 3A)  

---

## Overview

Tabbed edit interface with auto-calculated derived stats using formulas. Implements calculation service with formula parsing and computed signals.

**Deliverables**:
- ✅ Edit component with p-tabView (7 tabs matching sections)
- ✅ Calculation service (formula parsing, evaluation)
- ✅ Auto-save (debounced every 5 seconds)
- ✅ Discard changes confirmation
- ✅ Formula display pipe (shows formula on hover)

---

## Tasks

### Section 1: Edit Component Structure (Day 1)

- [ ] EDIT-001 Create SheetEditComponent in `src/app/features/character-sheets/edit/sheet-edit.component.ts`
  - Standalone, imports TabViewModule, ReactiveFormsModule
  - Inject: fichasState, route, authService, calculationService
  - Signal: `ficha = signal<Ficha | null>(null)`, `form = signal<FormGroup>(this.buildForm())`, `pristineForm = signal<any>(null)`
  - Effect: Load ficha from route params, patch form
  - Template: 7 tabs (Identificação, Atributos, Vida, Aptidões, Equipamentos, Vantagens, Títulos/Runas/Notas)

- [ ] EDIT-002 Implement form builder in SheetEditComponent
  - Method: `buildForm()` creates FormGroup with all sections (same as wizard)
  - Store pristine form state for discard comparison
  - Enable all fields (readonly = false on section components)

- [ ] EDIT-003 Add auto-save to SheetEditComponent
  - Effect: `effect(() => { if (form.dirty) scheduleAutoSave(); })`
  - Use debounceTime(5000) to delay save
  - Method: `async autoSave()` calls fichasState.updateFicha(), shows toast "Auto-salvo"
  - Disable during manual save

### Section 2: Calculation Service (Day 2)

- [ ] EDIT-004 Create CalculationService in `src/app/core/services/calculation.service.ts`
  - Injectable: providedIn: 'root'
  - Method: `parseFormula(formula: string, atributos: Map<string, number>): number`
  - Supported formulas: "(FOR + AGI) / 3", "VIG * 5", "(SAB + INT) / 2"
  - Use regex to extract attribute names, replace with values, evaluate with Function()

- [ ] EDIT-005 Add derived stats calculations to CalculationService
  - Method: `calculateBBA(for: number, agi: number): number` → (for + agi) / 3
  - Method: `calculateBBM(sab: number, int: number): number` → (sab + int) / 3
  - Method: `calculateReflexo(agi: number, ast: number): number` → (agi + ast) / 3
  - Method: `calculateBloqueio(for: number, vig: number): number` → (for + vig) / 3
  - Method: `calculatePercepcao(int: number, intu: number): number` → (int + intu) / 3
  - Method: `calculateRaciocinio(int: number, ast: number): number` → (int + ast) / 3
  - Method: `calculateEssencia(vig: number, sab: number): number` → (vig + sab) / 2
  - Method: `calculateImpeto(for: number): number` → for * 5

- [ ] EDIT-006 Write unit tests for CalculationService
  - Test: parseFormula with valid formulas returns correct result
  - Test: parseFormula with invalid formula throws error
  - Test: each calculateXXX method with sample values
  - Coverage: 100% (formulas are critical)

### Section 3: Reactive Calculations (Day 3)

- [ ] EDIT-007 Add computed signals for derived stats in SheetEditComponent
  - Computed: `atributosMap = computed(() => build map from form.atributos array)`
  - Computed: `bba = computed(() => calculationService.calculateBBA(atributosMap().get('FOR'), atributosMap().get('AGI')))`
  - Similar computed for all 8 derived stats
  - Update view whenever atributos change

- [ ] EDIT-008 Display derived stats in AttributesSection (edit mode)
  - Add section below attributes table showing calculated bonuses
  - Each bonus: Label, value (read-only), formula tooltip
  - Style: PrimeFlex cards (grid, col-6, md:col-4, lg:col-3, gap-2)

- [ ] EDIT-009 Add formula tooltips to derived stats
  - Use pTooltip directive from PrimeNG
  - Tooltip text: "BBA = (Força + Agilidade) / 3"
  - Triggered on hover

### Section 4: Formula Display Pipe (Day 3 continued)

- [ ] EDIT-010 Create FormulaDisplayPipe in `src/app/shared/pipes/formula-display.pipe.ts`
  - Input: formula string (e.g., "(FOR + AGI) / 3")
  - Output: human-readable formula (e.g., "(Força + Agilidade) / 3")
  - Map attribute abbreviations to full names
  - Use in tooltips

- [ ] EDIT-011 Write unit tests for FormulaDisplayPipe
  - Test: transforms "(FOR + AGI) / 3" to "(Força + Agilidade) / 3"
  - Test: handles unknown abbreviations gracefully
  - Coverage: 90%+

### Section 5: Save & Discard Logic (Day 4)

- [ ] EDIT-012 Implement manual save in SheetEditComponent
  - Method: `async onSave()` validates form, calls fichasState.updateFicha()
  - **IMPORTANT**: Backend response includes RECALCULATED values (official)
  - Frontend MUST replace temporary calculated values with backend response
  - Update ficha signal with backend response: `ficha.set(updatedFichaFromBackend)`
  - Update pristineForm to current form state (mark as not dirty)
  - Show toast: "Ficha atualizada com sucesso!"
  - Button: [Salvar Alterações] (disabled if form invalid or pristine)

- [ ] EDIT-012A Update auto-save to use backend values
  - After auto-save, update ficha signal with backend response
  - Ensure displayed values match backend (not client-side calculations)
  - **FLOW**: User edits → temp preview → auto-save → backend recalculates → update display

- [ ] EDIT-013 Implement discard changes in SheetEditComponent
  - Method: `onDiscard()` checks if form dirty, shows confirm dialog
  - Confirm dialog: "Descartar todas as alterações?"
  - On confirm: Reset form to pristineForm state (which has backend official values)
  - Button: [Descartar Alterações] (disabled if form pristine)

- [ ] EDIT-014 Add unsaved changes guard
  - Create CanDeactivateGuard in `src/app/core/guards/unsaved-changes.guard.ts`
  - Check if form dirty before navigation
  - Show confirm dialog: "Você tem alterações não salvas. Deseja sair sem salvar?"
  - Apply guard to edit route

### Section 6: Section Components Edit Mode (Day 5)

- [ ] EDIT-015 Update IdentificationSectionComponent for edit mode
  - Add form inputs when `readonly = false`
  - Use p-inputText, p-dropdown for fields
  - Bind to FormGroup passed as input

- [ ] EDIT-016 Update AttributesSectionComponent for edit mode
  - Replace static table with input fields (p-inputNumber)
  - Show total as computed (read-only)
  - Update on value changes

- [ ] EDIT-017 Update HealthSectionComponent for edit mode
  - Input fields for vida breakdowns
  - Input fields for limb integrity (sliders or p-inputNumber)
  - Show calculated vidaTotal

- [ ] EDIT-018 Update SkillsSectionComponent for edit mode
  - Input fields for nivel and bonus (p-inputNumber)
  - Tabs for Físicas and Mentais

---

## Acceptance Criteria

- ✅ Edit component loads existing ficha, patches form
- ✅ All 7 tabs work, can edit each section
- ✅ Derived stats recalculate on attribute changes
- ✅ Formula tooltips show on hover
- ✅ Auto-save works every 5 seconds if form dirty
- ✅ Manual save validates and updates ficha
- ✅ Discard changes resets form to pristine state
- ✅ Unsaved changes guard prevents navigation without confirmation
- ✅ All validations work, show error messages
- ✅ Calculation service unit tests pass (100% coverage)

---

**Next**: Proceed to `tasks-mobile-optimization.md` (Phase 5)
