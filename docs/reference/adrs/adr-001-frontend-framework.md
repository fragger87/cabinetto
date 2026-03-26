# ADR-001: Frontend Framework Selection

## Status

Accepted

## Date

2026-03-24

## Context

Cabinet Calculator is a client-side-only SPA that performs parametric optimization (guillotine bin packing, depth/leg sweep) and renders SVG cutting layouts. The framework must handle reactive forms, computed SVG rendering, and zero-backend architecture. No SSR or SEO requirements.

## Decision

Angular 21 (latest LTS) with TypeScript.

## Rationale

| Factor | Angular | Why It Fits |
|--------|---------|-------------|
| Reactive Forms | Built-in `@angular/forms` | Complex polymorphic inputs (range vs fixed) with validation |
| Standalone Components | Default in Angular 17+ | No NgModule boilerplate; each component self-contained |
| TypeScript-first | Native TS support | Domain model (BoardSpec, Cabinet, DrawerConfig) benefits from strict typing |
| CLI tooling | `ng generate`, `ng test`, `ng build` | Consistent project structure, integrated Vitest/ESLint/Prettier |
| Zero dependencies | Angular core only | No additional runtime libs needed for forms, routing, or DI |

## Alternatives Considered

| Framework | Pros | Cons | Verdict |
|-----------|------|------|---------|
| React 19 | Largest ecosystem, flexible | No built-in forms (need Formik/react-hook-form), manual DI | Viable but more wiring |
| Vue 3 | Simpler learning curve, good reactivity | Smaller TypeScript ecosystem, less opinionated structure | Viable but less structure |
| Svelte 5 | Minimal bundle, no virtual DOM | Younger ecosystem, fewer enterprise patterns, no built-in DI | Too early for production tooling needs |

## Consequences

- Project uses Angular CLI for scaffolding, testing, and building
- Components are standalone (no NgModules)
- Reactive forms handle all user input including polymorphic fields
- Pure TypeScript services (no Angular DI needed) for computation — testable with Vitest directly
- i18n handled via custom service (not Angular i18n package) for simplicity

## Maintenance

**Update when:** Major Angular version upgrade or framework migration considered.
**Verify:** Angular version in package.json matches this ADR.
