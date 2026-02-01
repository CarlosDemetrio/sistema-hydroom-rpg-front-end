# Tasks: Testing & Deployment

**Phase**: 7 (Final)  
**Duration**: 3 days  
**Dependencies**: All features complete (Phases 1-6)

---

## Overview

Comprehensive testing, bug fixes, performance audit, documentation updates, deployment preparation.

**Deliverables**:
- ✅ Full test suite (70%+ coverage)
- ✅ Browser compatibility testing
- ✅ Performance audit (Lighthouse > 90)
- ✅ Bug fixes
- ✅ Documentation updates

---

## Tasks

### Section 1: Unit Testing (Day 1)

- [ ] TEST-001 Run full test suite
  - Command: `npm run test -- --coverage --watchAll=false`
  - Generate coverage report (HTML + terminal)
  - Identify gaps (files with <70% coverage)

- [ ] TEST-002 Write missing service tests
  - Focus on: JogosStateService, FichasStateService, ConfigStateService
  - Test: all CRUD methods, error handling, signal updates
  - Target: 70%+ coverage per service

- [ ] TEST-003 Write missing component tests
  - Priority: GameListComponent, SheetListComponent, SheetViewComponent
  - Test: critical user flows (view, edit, delete)
  - Use: @testing-library/angular, fireEvent, waitFor
  - Target: 50%+ coverage per component

- [ ] TEST-004 Write tests for CalculationService
  - Test: all formula calculations (BBA, BBM, Reflexo, etc.)
  - Test: parseFormula with valid/invalid inputs
  - Test: edge cases (division by zero, negative values)
  - Target: 100% coverage (formulas are critical)

- [ ] TEST-005 Write tests for pipes and guards
  - FormulaDisplayPipe: test transformations
  - UnsavedChangesGuard: test canDeactivate logic
  - AuthGuard, RoleGuard: test redirect logic

### Section 2: Integration Testing (Day 1 continued)

- [ ] TEST-006 Write integration test for auth flow
  - Test: Login → getCurrentUser → user signal updated → navigate to dashboard
  - Test: Logout → user signal cleared → navigate to login
  - Mock: HttpClient responses

- [ ] TEST-007 Write integration test for game creation flow
  - Test: Navigate to /jogos/novo → fill form → submit → navigate to /jogos → verify game in list
  - Mock: API responses

- [ ] TEST-008 Write integration test for character creation flow
  - Test: Navigate to /fichas/novo → complete wizard → submit → navigate to /fichas/:id → verify data
  - Mock: API responses

- [ ] TEST-009 Write integration test for participant approval flow
  - Test: Jogador requests join → Mestre approves → participant status updated
  - Mock: API responses, test both roles

### Section 3: Browser Compatibility Testing (Day 2)

- [ ] TEST-010 Test on Chrome (latest)
  - Test: all features work, no console errors
  - Test: responsive behavior (DevTools device mode)
  - Document: any issues in bug log

- [ ] TEST-011 Test on Firefox (latest)
  - Same tests as TEST-010
  - Focus on: CSS differences, form controls

- [ ] TEST-012 Test on Safari (latest)
  - Same tests as TEST-010
  - Focus on: iOS-specific issues, touch events

- [ ] TEST-013 Test on Edge (latest)
  - Same tests as TEST-010
  - Focus on: compatibility with Chrome (should be similar)

- [ ] TEST-014 Test on iOS Safari (real device or BrowserStack)
  - Test: all touch gestures work
  - Test: native inputs work (number keyboard)
  - Test: no zoom issues, viewport correct
  - Test: bottom nav doesn't block content

- [ ] TEST-015 Test on Android Chrome (real device or emulator)
  - Same tests as TEST-014
  - Focus on: Android-specific UI behaviors

### Section 4: Performance Audit (Day 2 continued)

- [ ] TEST-016 Run Lighthouse audit on all pages
  - Pages: Login, Dashboard, Game List, Game Detail, Sheet List, Sheet View, Sheet Edit, Config Dashboard
  - Metrics: Performance, Accessibility, Best Practices, SEO
  - Target: All scores > 90

- [ ] TEST-017 Optimize bundle size
  - Run: `npm run build -- --stats-json`
  - Analyze: `npx webpack-bundle-analyzer dist/*/stats.json`
  - Identify: large dependencies, duplicate modules
  - Optimize: lazy load, tree-shake, CDN for large libs
  - Target: Initial bundle < 500KB gzipped

- [ ] TEST-018 Optimize images and assets
  - Use: WebP format for images (if any)
  - Compress: all images with imagemin
  - Lazy load: images below the fold

- [ ] TEST-019 Test API response times
  - Use: Chrome DevTools Network tab
  - Measure: time to first byte (TTFB), total time
  - Target: 95th percentile < 2s (on staging server)
  - If slow: add loading states, optimize backend queries

- [ ] TEST-020 Add caching strategy
  - Cache: config data (5 min TTL) in ConfigStateService
  - Cache: user profile (session storage)
  - Use: HttpInterceptor with Cache-Control headers

### Section 5: Bug Fixes & Polish (Day 3)

- [ ] TEST-021 Create bug log spreadsheet
  - Columns: ID, Description, Severity (Critical/High/Medium/Low), Status, Assigned To
  - Document: all issues found during testing

- [ ] TEST-022 Fix critical bugs
  - Priority: app crashes, data loss, security issues
  - Test: each fix, ensure no regressions

- [ ] TEST-023 Fix high severity bugs
  - Priority: major features broken, poor UX
  - Test: each fix

- [ ] TEST-024 Fix medium severity bugs (if time permits)
  - Priority: minor UX issues, edge cases
  - Defer low severity to future releases

- [ ] TEST-025 Final smoke test
  - Test: all critical user flows end-to-end
  - Flows:
    1. Mestre creates game → Jogador requests join → Mestre approves
    2. Jogador creates character → associates with game
    3. Mestre configures attributes → Jogador sees new attributes in wizard
  - Document: any remaining issues (defer to backlog)

### Section 6: Documentation Updates (Day 3 continued)

- [ ] TEST-026 Update README.md
  - Sections: Project Description, Features, Tech Stack, Setup Instructions, Build/Deploy
  - Add: screenshots or GIFs of key features
  - Add: link to USER_GUIDE.md

- [ ] TEST-027 Update QUICK_START.md
  - Sections: Prerequisites, Installation, Running Locally, Running Tests, Troubleshooting
  - Add: common issues and solutions
  - Add: link to ARCHITECTURE.md

- [ ] TEST-028 Update ARCHITECTURE.md
  - Sections: Project Structure, Design Decisions, State Management, Routing, Security
  - Add: component tree diagram (text or image)
  - Add: data flow diagram

- [ ] TEST-029 Create USER_GUIDE.md
  - Sections: Introduction, Mestre Workflows, Jogador Workflows, FAQ
  - Add: step-by-step guides with screenshots
  - Add: tips for mobile usage

- [ ] TEST-030 Create CHANGELOG.md
  - Sections: [Unreleased], [1.0.0] - YYYY-MM-DD
  - Subsections: Added, Changed, Fixed, Removed
  - Document: all features and fixes from this implementation

### Section 7: Deployment Preparation (Day 3 continued)

- [ ] TEST-031 Verify Dockerfile
  - Build: `docker build -t ficha-controlador-frontend .`
  - Run: `docker run -p 80:80 ficha-controlador-frontend`
  - Test: app loads, connects to backend (via proxy or env var)

- [ ] TEST-032 Verify docker-compose.yml
  - Services: frontend (nginx), backend (spring boot)
  - Networks: frontend can reach backend
  - Test: `docker-compose up`, verify full stack works

- [ ] TEST-033 Update nginx.conf
  - Proxy: /api requests to backend
  - CORS: headers if backend on different domain
  - Gzip: compression enabled
  - Cache: static assets cached (1 year)

- [ ] TEST-034 Create .env.example
  - Variables: API_BASE_URL, OAUTH_CLIENT_ID, etc.
  - Document: how to set each variable
  - Note: DO NOT commit .env (add to .gitignore)

- [ ] TEST-035 Verify CI/CD pipeline
  - GitHub Actions: .github/workflows/ci.yml
  - Steps: Install, Lint, Test, Build, Deploy (optional)
  - Trigger: on push to main, pull requests
  - Test: push commit, verify CI passes

---

## Acceptance Criteria

### Testing
- ✅ Test suite runs without errors
- ✅ Services: 70%+ coverage
- ✅ Components: 50%+ coverage (critical paths)
- ✅ CalculationService: 100% coverage
- ✅ Integration tests pass (auth, game, character flows)

### Browser Compatibility
- ✅ Works on Chrome, Firefox, Safari, Edge (latest)
- ✅ Works on iOS Safari (iPhone 12+)
- ✅ Works on Android Chrome (Pixel 5+)
- ✅ No console errors in any browser

### Performance
- ✅ Lighthouse Performance > 90 on all pages
- ✅ Lighthouse Accessibility > 90
- ✅ Lighthouse Best Practices > 90
- ✅ Initial bundle < 500KB gzipped
- ✅ API response times < 2s (95th percentile)

### Bug Fixes
- ✅ All critical bugs fixed
- ✅ All high severity bugs fixed
- ✅ Medium/low bugs documented in backlog
- ✅ No known data loss or security issues

### Documentation
- ✅ README.md updated with features and setup
- ✅ QUICK_START.md updated with dev guide
- ✅ ARCHITECTURE.md updated with design decisions
- ✅ USER_GUIDE.md created with user workflows
- ✅ CHANGELOG.md created with all changes

### Deployment
- ✅ Dockerfile builds and runs successfully
- ✅ docker-compose.yml works with backend
- ✅ nginx.conf configured correctly
- ✅ .env.example created with all variables
- ✅ CI/CD pipeline passes

---

## Final Checklist

- [ ] All tasks from Phases 1-7 completed
- [ ] All acceptance criteria met
- [ ] Constitution compliance verified (Signals, inject(), PrimeFlex only)
- [ ] No ESLint errors or warnings
- [ ] No TypeScript errors
- [ ] No console errors in production build
- [ ] Performance budget met
- [ ] Accessibility audit passed
- [ ] Pilot users tested and satisfied (4/5 rating)
- [ ] Ready for production deployment

---

**Congratulations!** 🎉 Project complete. Ready for deployment.
