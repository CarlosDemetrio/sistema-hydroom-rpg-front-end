# Constitution - Frontend RPG Ficha System

## Project Principles

### 1. Architecture Standards
- **Angular 21+**: Use latest features (Signals, Standalone Components, Control Flow Syntax)
- **TypeScript Strict Mode**: All code must pass strict type checking
- **Modular Design**: Clear separation between features, shared, and core modules
- **API-First**: All backend interactions via typed services

### 2. Code Quality Gates

#### MUST HAVE
- ✅ All components MUST be standalone
- ✅ All state MUST use Signals (signal, computed, effect)
- ✅ All DI MUST use inject() function (NEVER constructor)
- ✅ All templates MUST use Control Flow Syntax (@if, @for - NEVER *ngIf/*ngFor)
- ✅ All styling MUST use PrimeFlex classes (NEVER custom CSS/SCSS)
- ✅ All forms MUST use Reactive Forms with proper validation
- ✅ All HTTP calls MUST have error handling
- ✅ All routes MUST have appropriate guards

#### MUST NOT HAVE
- ❌ NO BehaviorSubject/ReplaySubject for local state
- ❌ NO Observable for component state (use toSignal() if needed)
- ❌ NO constructor injection
- ❌ NO CommonModule imports in standalone components
- ❌ NO custom CSS/SCSS files
- ❌ NO inline styles
- ❌ NO *ngIf/*ngFor directives

### 3. Security Requirements
- **XSS Protection**: Never use [innerHTML] without sanitization
- **CSRF Protection**: Handled by authInterceptor (XSRF-TOKEN)
- **Authentication**: All sensitive data in memory via Signals (NO localStorage)
- **Authorization**: Role-based guards for Mestre/Jogador routes
- **Session Management**: Idle timeout service (30 min)
- **Error Handling**: Global error handler (no stack traces to users)

### 4. UI/UX Principles
- **Mobile First**: Responsive design using PrimeFlex breakpoints
- **Accessibility**: ARIA labels, keyboard navigation
- **Performance**: Lazy loading, OnPush change detection where applicable
- **Consistency**: PrimeNG Aura theme throughout
- **User Feedback**: Loading states, success/error messages (PrimeNG Toast)

### 5. Testing Requirements
- **Unit Tests**: Jest for all services and critical component logic
- **Coverage**: Minimum 70% for services, 50% for components
- **Test Structure**: AAA pattern (Arrange-Act-Assert)
- **Mocking**: Use jest.fn() for dependencies

### 6. Performance Targets
- **Initial Load**: < 3s on 3G
- **Time to Interactive**: < 5s
- **Bundle Size**: < 500KB (initial), lazy load features
- **API Response**: Show loading states for calls > 200ms

### 7. Naming Conventions
- **Components**: kebab-case files, PascalCase class (user-profile.component.ts → UserProfileComponent)
- **Services**: kebab-case files, PascalCase class with Service suffix (auth.service.ts → AuthService)
- **Signals**: camelCase (userName, isLoading, currentUser)
- **Constants**: UPPER_SNAKE_CASE (API_BASE_URL, MAX_RETRIES)
- **Interfaces**: PascalCase with descriptive names (User, CharacterSheet, GameConfig)

### 8. Git Workflow
- **Branch Naming**: feature/description, fix/description, refactor/description
- **Commits**: Conventional commits (feat:, fix:, refactor:, docs:)
- **PR Requirements**: No direct push to main, all changes via PR

### 9. Documentation Requirements
- **README**: Setup instructions, architecture overview
- **Code Comments**: JSDoc for public APIs, inline for complex logic
- **CHANGELOG**: Track all significant changes
- **API Contracts**: Document expected backend responses

### 10. Dependencies Management
- **Core**: Angular 21+, PrimeNG 18+, PrimeFlex
- **Testing**: Jest, @testing-library/angular
- **Build**: Native Angular CLI (esbuild)
- **Updates**: Review monthly, update quarterly (with testing)

## Non-Negotiables

1. **No breaking changes to existing auth system**
2. **Maintain backward compatibility with backend API**
3. **PrimeNG Aura theme only (no custom themes)**
4. **All user-facing strings must be i18n-ready** (future requirement)
5. **Mobile optimization is mandatory, not optional**

## Decision Framework

When making technical decisions, prioritize:
1. **Security** - Always first priority
2. **User Experience** - Especially mobile
3. **Maintainability** - Code clarity over cleverness
4. **Performance** - Within reason (don't premature optimize)
5. **Developer Experience** - Consistent patterns

## Violation Handling

If a principle must be violated:
1. Document the reason in code comments
2. Add a TODO with ticket reference
3. Create a technical debt item
4. Get approval in PR review
