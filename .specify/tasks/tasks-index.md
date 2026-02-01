# Tasks Index: RPG Character Sheet Frontend

**Project**: ficha-controlador-front-end  
**Feature**: Complete Frontend Implementation  
**Date**: 2026-02-01

---

## Overview

This document provides the master index for all implementation tasks, showing dependencies, recommended order, and parallel execution opportunities.

## Task Files Organization

| File | Focus Area | Task Count | Dependencies |
|------|-----------|------------|--------------|
| **tasks-core-infrastructure.md** | Models, API services, shared components, layout | ~30 | None (START HERE) |
| **tasks-dashboard-games.md** | Dashboard and Games CRUD functionality | ~25 | Core Infrastructure |
| **tasks-character-sheets-view.md** | Character sheet list and view components | ~20 | Core Infrastructure |
| **tasks-character-sheets-create.md** | Character sheet wizard (8 steps) | ~15 | Character Sheets View |
| **tasks-character-sheets-edit.md** | Character sheet edit and calculations | ~18 | Character Sheets Create |
| **tasks-configuration.md** | Configuration panel for Mestre (all config entities) | ~35 | Core Infrastructure |
| **tasks-mobile-optimization.md** | Mobile UX, bottom nav, responsive design | ~12 | Dashboard, Character Sheets |
| **tasks-profile-polish.md** | Profile, toasts, empty states, accessibility | ~15 | Core Infrastructure |
| **tasks-testing-deployment.md** | Testing, bug fixes, documentation | ~20 | All Features Complete |
| **backend-debt.md** | Backend endpoints that need implementation/verification | N/A | Backend Team |

**Total Tasks**: ~190 tasks

---

## Implementation Phases

### Phase 0: Research & Setup (OPTIONAL - 2 days)
**Goal**: Clarify unknowns before starting implementation

**Tasks**:
- Review backend API contracts (OpenAPI/Swagger if available)
- Decide formula calculation strategy (frontend vs backend)
- Choose pagination pattern for tables
- Research PrimeNG mobile best practices

**Output**: Research document with decisions documented

---

### Phase 1: Core Infrastructure (5 days) ⭐ START HERE
**File**: `tasks-core-infrastructure.md`

**Goal**: Build foundational components that all features depend on

**Key Deliverables**:
- ✅ TypeScript models for all 20+ entities
- ✅ API services (JogosApiService, FichasApiService, ConfigApiService)
- ✅ SignalStores (@ngrx/signals) for state management (JogosStore, FichasStore, ConfigStore)
- ✅ Business Services for rules/calculations (FichaCalculationService, ParticipanteBusinessService)
- ✅ Shared UI components - DUMB ONLY (Loading, ConfirmDialog, EmptyState, FormFieldError)
- ✅ Layout components (Header with role switcher, Sidebar)
- ✅ Routing structure with lazy-loaded modules
- ✅ Unit tests for all services and stores (70%+ coverage)

**Dependencies**: None (blocking for all other phases)

**Parallel Opportunities**:
- Models can be created in parallel with API services
- Shared components can be built in parallel
- Layout components independent of each other

---

### Phase 2A: Dashboard & Games (5 days)
**File**: `tasks-dashboard-games.md`

**Goal**: Complete Mestre and Jogador dashboards, Games CRUD

**Key Deliverables**:
- ✅ Dashboard (Mestre and Jogador variants)
- ✅ Game List with filters (p-table)
- ✅ Game Form (create/edit with p-dialog)
- ✅ Game Detail (tabs: info, participants, sheets)
- ✅ Participant Manager (approve/reject UI)

**Dependencies**: Phase 1 (Core Infrastructure)

**Parallel with**: Phase 2B (Character Sheets View)

---

### Phase 2B: Character Sheets View (5 days)
**File**: `tasks-character-sheets-view.md`

**Goal**: Display and navigate character sheets (read-only)

**Key Deliverables**:
- ✅ Character Sheet List (p-dataView with cards)
- ✅ Character Sheet View (read-only with accordion sections)
- ✅ Section components (Attributes, Skills, Health, Equipment, Advantages, Titles/Runes, Notes)

**Dependencies**: Phase 1 (Core Infrastructure)

**Parallel with**: Phase 2A (Dashboard & Games)

---

### Phase 3A: Character Sheet Wizard (5 days)
**File**: `tasks-character-sheets-create.md`

**Goal**: 8-step wizard for creating new characters

**Key Deliverables**:
- ✅ Wizard wrapper (p-steps)
- ✅ 8 step components (Identification, Progression, Physical, Attributes, Health, Skills, Equipment, Summary)
- ✅ Form validation per step
- ✅ Save draft functionality
- ✅ Step navigation (back/next/finish)

**Dependencies**: Phase 2B (Character Sheets View - reuse section components)

**Parallel with**: Phase 3B (Configuration Panel)

---

### Phase 3B: Configuration Panel (5 days)
**File**: `tasks-configuration.md`

**Goal**: Mestre can configure all game system entities

**Key Deliverables**:
- ✅ Config Dashboard
- ✅ 10 config CRUD interfaces (Attributes, Skills, Levels, Limiters, Classes, Advantages, Races, Prospecting, Presences, Genders)
- ✅ Drag-and-drop ordering
- ✅ Import/Export config (JSON)

**Dependencies**: Phase 1 (Core Infrastructure)

**Parallel with**: Phase 3A (Character Sheet Wizard)

---

### Phase 4: Character Sheet Edit & Calculations (5 days)
**File**: `tasks-character-sheets-edit.md`

**Goal**: Tabbed edit interface with auto-calculated derived stats

**Key Deliverables**:
- ✅ Edit component (p-tabView)
- ✅ Calculation service (formula parsing, computed signals)
- ✅ Formula display pipe (show formula on hover)
- ✅ Auto-save (debounced)
- ✅ Discard changes confirmation

**Dependencies**: Phase 3A (Character Sheet Wizard)

---

### Phase 5: Mobile Optimization (3 days)
**File**: `tasks-mobile-optimization.md`

**Goal**: Perfect mobile UX for all features

**Key Deliverables**:
- ✅ Bottom navigation bar
- ✅ Mobile-optimized character sheet (collapsible sections, large tap targets)
- ✅ Touch gestures (swipe to delete)
- ✅ Pull-to-refresh on lists
- ✅ Cross-browser testing (iOS Safari, Android Chrome)

**Dependencies**: Phase 2A, Phase 2B, Phase 4 (Dashboard, Games, Character Sheets implemented)

---

### Phase 6: Profile & Polish (3 days)
**File**: `tasks-profile-polish.md`

**Goal**: User profile, final polish, accessibility

**Key Deliverables**:
- ✅ Profile view/edit
- ✅ Toast notifications throughout app
- ✅ Skeleton loaders on all lists
- ✅ Empty states with friendly messages
- ✅ Accessibility audit (ARIA labels, keyboard nav)

**Dependencies**: Phase 1 (Core Infrastructure)

**Can Start**: After Phase 1, in parallel with other phases

---

### Phase 7: Testing & Deployment (3 days)
**File**: `tasks-testing-deployment.md`

**Goal**: Comprehensive testing, bug fixes, documentation

**Key Deliverables**:
- ✅ Full test suite (70%+ coverage)
- ✅ Browser compatibility testing
- ✅ Performance audit (Lighthouse)
- ✅ Bug fixes
- ✅ Documentation updates

**Dependencies**: All features complete

---

## Dependency Graph

```
Phase 1: Core Infrastructure
    ├── Phase 2A: Dashboard & Games (parallel)
    ├── Phase 2B: Character Sheets View (parallel)
    ├── Phase 3B: Configuration Panel (parallel with 3A)
    └── Phase 6: Profile & Polish (can start early)
    
Phase 2B: Character Sheets View
    └── Phase 3A: Character Sheet Wizard
        └── Phase 4: Character Sheet Edit & Calculations

Phase 2A + Phase 2B + Phase 4
    └── Phase 5: Mobile Optimization

All Phases
    └── Phase 7: Testing & Deployment
```

---

## Recommended Implementation Order

### Week 1: Foundation
**Days 1-5**: Phase 1 (Core Infrastructure)
- Focus: Build models, services, shared components
- Milestone: Can make API calls, have layout structure

### Week 2: Features (Parallel Development)
**Days 6-10**: 
- Track A: Phase 2A (Dashboard & Games)
- Track B: Phase 2B (Character Sheets View)
- Milestone: Mestre can manage games, users can view character sheets

### Week 3: Advanced Features (Parallel Development)
**Days 11-15**:
- Track A: Phase 3A (Character Sheet Wizard)
- Track B: Phase 3B (Configuration Panel)
- Milestone: Jogador can create characters, Mestre can configure system

### Week 4: Editing & Calculations
**Days 16-20**: Phase 4 (Character Sheet Edit)
- Focus: Edit UI, calculation engine, formulas
- Milestone: Full character lifecycle (create, view, edit, delete)

### Week 5: Polish
**Days 21-23**: Phase 5 (Mobile Optimization)
**Days 24-25**: Phase 6 (Profile & Polish)
- Milestone: Production-ready UX

### Week 6: Quality Assurance
**Days 26-28**: Phase 7 (Testing & Deployment)
- Focus: Testing, bug fixes, documentation
- Milestone: Release candidate ready

---

## Parallel Execution Opportunities

### High Parallelization (2-3 developers)
1. **After Phase 1**:
   - Dev 1: Dashboard & Games (Phase 2A)
   - Dev 2: Character Sheets View (Phase 2B)
   - Dev 3: Configuration Panel (Phase 3B)

2. **After Phase 2**:
   - Dev 1: Character Sheet Wizard (Phase 3A)
   - Dev 2: Continue Configuration Panel (Phase 3B)
   - Dev 3: Profile & Polish (Phase 6)

### Medium Parallelization (2 developers)
1. **After Phase 1**:
   - Dev 1: Dashboard & Games (Phase 2A)
   - Dev 2: Character Sheets View (Phase 2B)

2. **After Phase 2**:
   - Dev 1: Character Sheet Wizard (Phase 3A)
   - Dev 2: Configuration Panel (Phase 3B)

### Single Developer (Sequential)
Follow the week-by-week order above, focusing on one phase at a time.

---

## Backend Coordination

**See**: `backend-debt.md` for endpoints that need backend implementation or verification.

**Critical Path**: Ensure backend implements these endpoints before frontend needs them:
1. **Week 1**: `/api/auth/me` (already implemented)
2. **Week 2**: `/api/jogos/*`, `/api/jogos/{id}/participantes/*`
3. **Week 2-3**: `/api/fichas/*`
4. **Week 3**: `/api/config/*` (all 10 entities)

**Mitigation**: Use mock services during frontend development, swap in real API calls as backend completes.

---

## MVP Scope (Minimum Viable Product)

If time is constrained, prioritize these features for MVP launch:

### MVP Phase 1 (Must Have - 2 weeks)
- ✅ Core Infrastructure (models, services, layout)
- ✅ Dashboard (basic, both roles)
- ✅ Games CRUD (Mestre)
- ✅ Character Sheets View (read-only)
- ✅ Character Sheet Wizard (create only, no edit)

### MVP Phase 2 (Should Have - 1 week)
- ✅ Character Sheet Edit (basic, no complex calculations)
- ✅ Participant Management (approve/reject)
- ✅ Mobile responsive (basic, no bottom nav)

### Post-MVP (Can Wait)
- Configuration Panel (use default/hardcoded configs initially)
- Advanced mobile features (swipe gestures, pull-to-refresh)
- Profile management (can edit via admin panel)
- Advanced polish (skeleton loaders, empty states)

---

## Success Criteria

### Per Phase
Each phase has specific acceptance criteria in its task file. Generally:
- ✅ All tasks completed and checked off
- ✅ No ESLint errors or warnings
- ✅ Unit tests pass (70%+ coverage on services)
- ✅ Manual testing confirms functionality works
- ✅ Code reviewed (if team workflow requires)

### Overall Project
- ✅ All functional requirements from feature-spec.md implemented
- ✅ Constitution compliance (Signals, Standalone, inject(), PrimeFlex only)
- ✅ Mobile responsive (tested on iOS Safari, Android Chrome)
- ✅ Performance: Lighthouse score > 90
- ✅ Accessibility: axe DevTools 0 violations
- ✅ Security: No sensitive data in localStorage, CSRF protection active
- ✅ User satisfaction: Pilot users rate 4/5+

---

## How to Use This Index

1. **Start**: Read `tasks-core-infrastructure.md` and begin Phase 1
2. **Track Progress**: Check off tasks as completed in each file
3. **Coordinate**: If multiple developers, assign phases based on dependencies
4. **Review**: At end of each phase, verify acceptance criteria met before proceeding
5. **Adapt**: If priorities change, adjust phase order (but respect dependencies)

---

## Questions or Issues?

- **Unclear task**: Check implementation-plan.md for detailed context
- **Backend API question**: Check backend-debt.md or coordinate with backend team
- **Architecture question**: Check ARCHITECTURE.md or constitution (.github/copilot-instructions.md)
- **Technical blocker**: Document in research.md and discuss with team

---

**Next Step**: Open `tasks-core-infrastructure.md` and start Phase 1! 🚀
