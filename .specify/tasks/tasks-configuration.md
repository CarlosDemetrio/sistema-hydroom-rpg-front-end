# Tasks: Configuration Panel (Mestre Only)

**Phase**: 3B (Parallel with 3A)  
**Duration**: 5 days  
**Dependencies**: Core Infrastructure (Phase 1)  
**Parallel with**: Character Sheet Wizard (Phase 3A)

---

## Overview

Complete CRUD interface for all 10 configuration entity types. Mestre can configure game system mechanics.

**Deliverables**:
- ✅ Config Dashboard (overview of all config types)
- ✅ 10 CRUD interfaces (Attributes, Skills, Levels, Limiters, Classes, Advantages, Races, Prospecting, Presences, Genders)
- ✅ Drag-and-drop ordering (p-orderList)
- ✅ Import/Export config (JSON)
- ✅ Formula validation for attributes

---

## Tasks

### Section 1: Config Dashboard (Day 1)

- [ ] CONFIG-001 Create ConfigDashboardComponent in `src/app/features/configuration/config-dashboard/config-dashboard.component.ts`
  - Standalone, imports CardModule, ButtonModule (PrimeNG)
  - Grid of cards, each representing a config type
  - Each card: Icon, title, count, [Gerenciar] button → navigate to specific config page
  - Style: PrimeFlex (grid, col-12, md:col-6, lg:col-4, gap-4)

- [ ] CONFIG-002 Add config type cards to ConfigDashboardComponent
  - Card 1: Atributos (icon: pi pi-chart-bar)
  - Card 2: Aptidões (icon: pi pi-star)
  - Card 3: Níveis (icon: pi pi-arrow-up)
  - Card 4: Limitadores (icon: pi pi-lock)
  - Card 5: Classes (icon: pi pi-shield)
  - Card 6: Vantagens (icon: pi pi-plus-circle)
  - Card 7: Raças (icon: pi pi-users)
  - Card 8: Prospecção (icon: pi pi-box)
  - Card 9: Presenças (icon: pi pi-sparkles)
  - Card 10: Gêneros (icon: pi pi-user)

### Section 2: Generic CRUD Component (Day 1 continued)

- [ ] CONFIG-003 Create GenericConfigCrudComponent in `src/app/features/configuration/shared/generic-config-crud/generic-config-crud.component.ts`
  - Standalone, imports TableModule, DialogModule, ButtonModule, InputTextModule
  - Input: `entityType = input.required<string>()` (e.g., 'atributos')
  - Input: `columns = input.required<Column[]>()` (define table columns)
  - Inject: configState
  - Signal: `items = signal<any[]>([])`, `editItem = signal<any | null>(null)`, `dialogVisible = signal<boolean>(false)`
  - Template: p-table with [+ Novo], [Editar], [Excluir] buttons, p-dialog for form
  - Load items from configState based on entityType

- [ ] CONFIG-004 Implement CRUD methods in GenericConfigCrudComponent
  - Method: `async loadItems()` calls configState.loadXXX() based on entityType
  - Method: `openCreateDialog()` opens dialog with empty form
  - Method: `openEditDialog(item)` opens dialog with prefilled form
  - Method: `async save()` calls configState.createXXX() or updateXXX()
  - Method: `async delete(id)` shows confirm, calls configState.deleteXXX()

### Section 3: Specific Config Components (Days 2-3)

- [ ] CONFIG-005 [P] Create AttributesConfigComponent in `src/app/features/configuration/attributes-config/attributes-config.component.ts`
  - Use GenericConfigCrudComponent with columns: Nome, Abreviação, Ordem, Fórmula, Ativo
  - Add drag-and-drop ordering (p-orderList)
  - Validate formula field (must be valid expression)

- [ ] CONFIG-006 [P] Create SkillsConfigComponent in `src/app/features/configuration/skills-config/skills-config.component.ts`
  - Use GenericConfigCrudComponent with columns: Nome, Tipo (Físico/Mental), Ordem, Ativo
  - Group by Tipo in table

- [ ] CONFIG-007 [P] Create LevelsConfigComponent in `src/app/features/configuration/levels-config/levels-config.component.ts`
  - Columns: Nível, XP Mínimo, XP Máximo, Bônus Atributo
  - Validate: xpMinimo < xpMaximo, no overlapping ranges

- [ ] CONFIG-008 [P] Create LimitersConfigComponent in `src/app/features/configuration/limiters-config/limiters-config.component.ts`
  - Columns: Nome, Descrição, Penalidade
  - Textarea for descrição

- [ ] CONFIG-009 [P] Create ClassesConfigComponent in `src/app/features/configuration/classes-config/classes-config.component.ts`
  - Columns: Nome, Descrição, Bônus Atributos (JSON object)
  - Input for bonusAtributos (key-value pairs)

- [ ] CONFIG-010 [P] Create AdvantagesConfigComponent in `src/app/features/configuration/advantages-config/advantages-config.component.ts`
  - Columns: Nome, Categoria, Custo (XP), Descrição, Ativo
  - Dropdown for categoria (load from CategoriaVantagem)

- [ ] CONFIG-011 [P] Create RacesConfigComponent in `src/app/features/configuration/races-config/races-config.component.ts`
  - Columns: Nome, Descrição, Bônus Atributos (JSON object)
  - Similar to Classes

- [ ] CONFIG-012 [P] Create ProspectingConfigComponent in `src/app/features/configuration/prospecting-config/prospecting-config.component.ts`
  - Columns: Tipo Dado (D4, D6, D8, D10, D12), Regras (texto)
  - Textarea for regras

- [ ] CONFIG-013 [P] Create PresencesConfigComponent in `src/app/features/configuration/presences-config/presences-config.component.ts`
  - Columns: Nome, Descrição, Efeito
  - Textarea for efeito

- [ ] CONFIG-014 [P] Create GendersConfigComponent in `src/app/features/configuration/genders-config/genders-config.component.ts`
  - Columns: Nome, Descrição
  - Simple CRUD

### Section 4: Import/Export (Day 4)

- [ ] CONFIG-015 Add export config button to ConfigDashboardComponent
  - Button: [Exportar Todas Configurações]
  - Method: `exportAll()` fetches all config types, generates JSON file, triggers download
  - Filename: `config-export-${timestamp}.json`

- [ ] CONFIG-016 Add import config button to ConfigDashboardComponent
  - Button: [Importar Configurações]
  - File input: accepts JSON only
  - Method: `async importAll(file)` reads JSON, validates structure, calls configState.createXXX() for each item
  - Show progress dialog during import
  - Show success toast with count imported

- [ ] CONFIG-017 Add validation for import
  - Check JSON structure matches expected format
  - Validate required fields
  - Show error if invalid format
  - Skip duplicates (by nome or unique constraint)

### Section 5: Ordering & Polish (Day 5)

- [ ] CONFIG-018 Add drag-and-drop ordering to AttributesConfigComponent
  - Use p-orderList to reorder attributes
  - Update `ordem` field on backend when order changes
  - Method: `async updateOrder(orderedItems)` calls backend batch update

- [ ] CONFIG-019 Add formula validator to AttributesConfigComponent
  - Custom validator: checks if formula is valid expression
  - Test formula with sample values
  - Show error: "Fórmula inválida. Use atributos como FOR, AGI, etc."

- [ ] CONFIG-020 Add search/filter to all config components
  - Search input above table
  - Filter by nome (case-insensitive)

---

## Acceptance Criteria

- ✅ Config dashboard shows all 10 config types with counts
- ✅ Can navigate to each config CRUD page
- ✅ All CRUD operations work (create, read, update, delete)
- ✅ Validation works (required fields, unique constraints, formulas)
- ✅ Drag-and-drop ordering works for attributes
- ✅ Export downloads JSON file with all config
- ✅ Import uploads JSON, creates all config items
- ✅ Confirm dialogs work for delete
- ✅ Success toasts shown after operations
- ✅ Search/filter works on all tables
- ✅ Only accessible to Mestre (roleGuard enforced)

---

**Next**: Proceed to `tasks-mobile-optimization.md` (Phase 5) after Phases 3A and 4
