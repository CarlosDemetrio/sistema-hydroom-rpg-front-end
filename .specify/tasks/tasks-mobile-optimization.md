# Tasks: Mobile Optimization

**Phase**: 5  
**Duration**: 3 days  
**Dependencies**: Dashboard & Games (Phase 2A), Character Sheets View & Edit (Phase 2B, 4)

---

## Overview

Optimize all features for mobile devices with bottom navigation, touch gestures, responsive layouts.

**Deliverables**:
- ✅ Bottom navigation bar (sticky, 4 main routes)
- ✅ Mobile-optimized character sheet (collapsible sections, large tap targets)
- ✅ Touch gestures (swipe to delete)
- ✅ Pull-to-refresh on lists
- ✅ Cross-browser testing (iOS Safari, Android Chrome)

---

## Tasks

### Section 1: Bottom Navigation (Day 1)

- [ ] MOBILE-001 Create BottomNavComponent in `src/app/shared/layout/bottom-nav/bottom-nav.component.ts`
  - Standalone, imports ButtonModule (PrimeNG)
  - 4 buttons: Dashboard, Jogos, Fichas, Perfil
  - Each button: Icon + label, routerLink, active state
  - Sticky at bottom (position: fixed, bottom: 0, z-index: 1000)
  - Style: PrimeFlex (flex, justify-content-around, p-3, surface-card, shadow-8)

- [ ] MOBILE-002 Add bottom nav to app.component.ts
  - Show only on mobile (screen width < 768px)
  - Hide sidebar on mobile, show bottom nav instead
  - Use @media query or responsive signal

- [ ] MOBILE-003 Adjust content padding for bottom nav
  - Add `pb-6` (padding-bottom) to router-outlet container when bottom nav visible
  - Prevent content from being hidden behind nav

### Section 2: Character Sheet Mobile Optimizations (Day 1 continued)

- [ ] MOBILE-004 Optimize SheetViewComponent for mobile
  - Accordion sections: expand only one at a time on mobile (multiple: false)
  - Increase tap target sizes for action buttons (min 48x48px)
  - Stack header elements vertically on mobile

- [ ] MOBILE-005 Optimize AttributesSectionComponent for mobile
  - Table: horizontal scroll on mobile (overflow-x: auto)
  - Alternative: Cards instead of table on mobile
  - Derived stats: stack cards (col-6 on mobile)

- [ ] MOBILE-006 Optimize SkillsSectionComponent for mobile
  - Tabs: full-width buttons on mobile
  - Table: horizontal scroll or card layout
  - Larger font size for readability

- [ ] MOBILE-007 Optimize SheetEditComponent for mobile
  - Tabs: scrollable horizontal tabs (p-tabView scrollable)
  - Form inputs: use native mobile keyboards (type="number", inputmode="numeric")
  - Larger input fields (p-4 instead of p-2)

### Section 3: Touch Gestures (Day 2)

- [ ] MOBILE-008 Add swipe-to-delete to SheetListComponent
  - Use hammer.js or native touch events
  - Swipe left on card → reveal [Excluir] button
  - Swipe right → close action buttons
  - Show visual feedback (card slide animation)

- [ ] MOBILE-009 Add swipe-to-delete to GameListComponent
  - Same as MOBILE-008 for game cards
  - Mestre only (check permissions)

- [ ] MOBILE-010 Add pull-to-refresh to SheetListComponent
  - Listen for pull gesture at top of list
  - Show loading spinner during refresh
  - Call fichasState.loadFichas() on pull
  - Use PrimeNG p-scroller or custom implementation

- [ ] MOBILE-011 Add pull-to-refresh to GameListComponent
  - Same as MOBILE-010 for games list

### Section 4: Responsive Layouts (Day 3)

- [ ] MOBILE-012 Optimize Dashboard for mobile
  - Stats cards: stack vertically (col-12 on mobile)
  - Recent games: list view only on mobile (no grid)
  - Quick actions: full-width buttons

- [ ] MOBILE-013 Optimize GameFormComponent for mobile
  - Full-screen dialog on mobile
  - Larger input fields
  - Buttons: full-width on mobile

- [ ] MOBILE-014 Optimize ParticipantManagerComponent for mobile
  - Table: horizontal scroll or card layout
  - Actions: dropdown menu instead of inline buttons
  - Larger status badges

- [ ] MOBILE-015 Optimize WizardComponent for mobile
  - Steps: horizontal scroll with indicators (dots)
  - Step titles: hide on mobile, show only icons
  - Form: full-width inputs

### Section 5: Testing & Polish (Day 3 continued)

- [ ] MOBILE-016 Test on iOS Safari
  - Real device or BrowserStack
  - Test: all gestures work (swipe, pull-to-refresh)
  - Test: native inputs work (number keyboard)
  - Test: no horizontal scroll issues
  - Test: bottom nav doesn't block content

- [ ] MOBILE-017 Test on Android Chrome
  - Real device or emulator
  - Same tests as MOBILE-016
  - Test: viewport meta tag correct
  - Test: no zoom issues on input focus

- [ ] MOBILE-018 Fix responsive issues
  - Use Chrome DevTools device mode
  - Test breakpoints: 320px, 375px, 414px (iPhone), 768px (tablet)
  - Fix any overflows, misalignments, tiny text
  - Ensure all tap targets >= 48x48px

---

## Acceptance Criteria

- ✅ Bottom nav shows on mobile (<768px), hides on desktop
- ✅ Bottom nav sticky at bottom, doesn't block content
- ✅ Character sheet accordion optimized (one section open on mobile)
- ✅ All tap targets >= 48x48px
- ✅ Swipe-to-delete works on lists
- ✅ Pull-to-refresh works on lists
- ✅ All forms use native mobile keyboards
- ✅ No horizontal scroll issues
- ✅ Tested on iOS Safari (works correctly)
- ✅ Tested on Android Chrome (works correctly)
- ✅ All responsive breakpoints work (320px, 375px, 414px, 768px)

---

**Next**: Proceed to `tasks-profile-polish.md` (Phase 6)
