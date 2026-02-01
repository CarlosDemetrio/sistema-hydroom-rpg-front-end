# Tasks: Profile & Polish

**Phase**: 6  
**Duration**: 3 days  
**Dependencies**: Core Infrastructure (Phase 1)  
**Can Start**: After Phase 1, in parallel with other phases

---

## Overview

User profile management, toast notifications, skeleton loaders, empty states, accessibility audit.

**Deliverables**:
- ✅ Profile view and edit
- ✅ Toast notifications throughout app
- ✅ Skeleton loaders on all lists
- ✅ Empty states with friendly messages
- ✅ Accessibility audit (ARIA labels, keyboard nav)

---

## Tasks

### Section 1: Profile Components (Day 1)

- [ ] PROFILE-001 Create ProfileViewComponent in `src/app/features/profile/profile-view/profile-view.component.ts`
  - Standalone, imports CardModule, AvatarModule, ButtonModule (PrimeNG)
  - Inject: authService
  - Display: user avatar (large), nome, email, roles (badges), dataCriacao
  - Actions: [Editar Perfil] button → navigate to '/perfil/editar'
  - Style: PrimeFlex (surface-card, p-5, border-round, max-w-30rem, mx-auto)

- [ ] PROFILE-002 Create ProfileEditComponent in `src/app/features/profile/profile-edit/profile-edit.component.ts`
  - Standalone, imports ReactiveFormsModule, InputTextModule, ButtonModule
  - Form: nome (required, 3-50 chars), email (readonly)
  - Avatar selection: grid of predefined avatars (icons)
  - Actions: [Salvar], [Cancelar]
  - Method: `async onSave()` calls backend PUT /api/users/me, updates authService.currentUser

- [ ] PROFILE-003 Add avatar selection to ProfileEditComponent
  - Signal: `availableAvatars = signal<string[]>(['pi pi-user', 'pi pi-heart', 'pi pi-star', ...])`
  - Signal: `selectedAvatar = signal<string>(currentUser.avatarUrl)`
  - Template: Grid of clickable avatar icons, highlight selected
  - Style: PrimeFlex (grid, col-3, gap-2, p-2, cursor-pointer)

### Section 2: Toast Service Integration (Day 1 continued)

- [ ] PROFILE-004 Create ToastService in `src/app/core/services/toast.service.ts`
  - Injectable: providedIn: 'root'
  - Inject: MessageService (PrimeNG)
  - Method: `success(summary: string, detail?: string)` shows success toast
  - Method: `error(summary: string, detail?: string)` shows error toast
  - Method: `info(summary: string, detail?: string)` shows info toast
  - Method: `warning(summary: string, detail?: string)` shows warning toast

- [ ] PROFILE-005 Add toast to app.component.ts template
  - Add `<p-toast position="top-right" [life]="5000" />`
  - Inject: MessageService in app.component.ts providers

- [ ] PROFILE-006 Replace console.log/alert with ToastService throughout app
  - In JogosStateService: success toasts for CRUD operations
  - In FichasStateService: success toasts for CRUD operations
  - In ConfigStateService: success toasts for CRUD operations
  - In all components: error toasts for API failures

### Section 3: Skeleton Loaders (Day 2)

- [ ] PROFILE-007 Add skeleton loader to GameListComponent
  - `@if (loading()) { <p-skeleton shape="rectangle" height="300px" /> }`
  - Show skeleton table rows while loading

- [ ] PROFILE-008 Add skeleton loader to SheetListComponent
  - Show skeleton cards (3-6 cards) while loading
  - Use p-skeleton with shape="rectangle"

- [ ] PROFILE-009 Add skeleton loader to SheetViewComponent
  - Show skeleton for header and accordion while loading ficha
  - Use p-skeleton for text lines, rectangles for sections

- [ ] PROFILE-010 Add skeleton loader to ConfigDashboardComponent
  - Show skeleton cards while loading config counts

### Section 4: Empty States (Day 2 continued)

- [ ] PROFILE-011 Add empty state to GameListComponent
  - `@if (filteredJogos().length === 0 && !loading())`
  - Icon: pi pi-globe, title: "Nenhum jogo encontrado"
  - Message: "Crie seu primeiro jogo para começar" (Mestre) or "Aguarde convites de mestres" (Jogador)
  - Action: [+ Novo Jogo] (Mestre only)

- [ ] PROFILE-012 Add empty state to SheetListComponent
  - Icon: pi pi-book, title: "Nenhuma ficha encontrada"
  - Message: "Crie sua primeira ficha de personagem" (Jogador) or "Aguarde jogadores criarem fichas" (Mestre)
  - Action: [+ Nova Ficha] (Jogador only)

- [ ] PROFILE-013 Add empty states to all config components
  - Icon: pi pi-cog, title: "Nenhuma configuração cadastrada"
  - Message: "Adicione configurações para personalizar seu sistema"
  - Action: [+ Adicionar] button

- [ ] PROFILE-014 Add empty state to ParticipantManagerComponent
  - Icon: pi pi-users, title: "Nenhum participante"
  - Message: "Aguarde jogadores solicitarem participação"

### Section 5: Accessibility Audit (Day 3)

- [ ] PROFILE-015 Install axe DevTools
  - Chrome extension or npm package (@axe-core/cli)
  - Run on all pages, generate report

- [ ] PROFILE-016 Add ARIA labels to interactive elements
  - All buttons without text: aria-label
  - All icons: aria-hidden="true" (if decorative) or aria-label
  - All form inputs: aria-labelledby or aria-label
  - All dialogs: aria-labelledby, role="dialog"

- [ ] PROFILE-017 Test keyboard navigation
  - Tab through all interactive elements (correct order)
  - Enter/Space activates buttons
  - Escape closes dialogs
  - Focus visible (outline or highlight)
  - No keyboard traps

- [ ] PROFILE-018 Verify color contrast
  - Use axe DevTools or manual check
  - All text: contrast ratio >= 4.5:1 (WCAG AA)
  - Fix any violations (adjust colors, font weight)

- [ ] PROFILE-019 Add focus management
  - After dialog open: focus first input
  - After dialog close: return focus to trigger button
  - After navigation: focus main heading
  - Use @ViewChild to set focus programmatically

- [ ] PROFILE-020 Test with screen reader
  - Use NVDA (Windows) or VoiceOver (Mac)
  - Navigate app, ensure all content announced correctly
  - Fix any issues (missing labels, incorrect roles)

---

## Acceptance Criteria

### Profile
- ✅ Profile view shows user info (nome, email, roles, avatar)
- ✅ Profile edit allows changing nome and avatar
- ✅ Avatar selection shows grid of icons
- ✅ Save updates user profile, shows success toast
- ✅ Cancel returns to view without saving

### Toasts
- ✅ Success toasts shown after CRUD operations
- ✅ Error toasts shown on API failures
- ✅ Toasts auto-dismiss after 5 seconds
- ✅ Toasts positioned at top-right
- ✅ Multiple toasts stack correctly

### Skeleton Loaders
- ✅ All lists show skeleton while loading
- ✅ Skeleton matches final layout (cards, table rows)
- ✅ Skeleton disappears when data loaded

### Empty States
- ✅ All lists show empty state when no items
- ✅ Empty states have friendly message and icon
- ✅ Empty states offer action (create button) when appropriate
- ✅ Empty states don't show while loading

### Accessibility
- ✅ No axe DevTools violations (0 critical/serious)
- ✅ All interactive elements have ARIA labels
- ✅ Keyboard navigation works (Tab, Enter, Escape)
- ✅ Focus visible on all interactive elements
- ✅ Color contrast >= 4.5:1 for all text
- ✅ Focus management works (dialogs, navigation)
- ✅ Screen reader announces content correctly

---

**Next**: Proceed to `tasks-testing-deployment.md` (Phase 7)
