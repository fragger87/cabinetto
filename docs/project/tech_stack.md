# Tech Stack

## Runtime

| Technology | Version | Purpose |
|-----------|---------|---------|
| Angular | 21.2.0 | Frontend framework (standalone components, signals) |
| TypeScript | 5.9.2 | Language (strict mode enabled) |
| Node.js | 24.14.0 | Build tooling runtime |
| RxJS | 7.8.x | Reactive utilities (minimal usage — signals preferred) |

## Build & Tooling

| Tool | Version | Purpose |
|------|---------|---------|
| Angular CLI | 21.2.3 | Project scaffold, build, serve |
| Vitest | 4.0.8 | Unit test framework (Angular 21 default) |
| ESLint | 10.0.3 | Linting with angular-eslint 21.3.1 |
| Prettier | 3.8.1 | Code formatting |
| eslint-config-prettier | 10.1.8 | Prevents ESLint/Prettier conflicts |
| @vitest/coverage-v8 | 4.1.0 | Code coverage reporting |

## CI/CD

| Tool | Config | Purpose |
|------|--------|---------|
| GitHub Actions | `.github/workflows/ci.yml` | Build + test + lint on push/PR to main |

## Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| No backend | Algorithms O(N) per sweep, <500ms client-side; no persistent storage needed |
| No external math libs | Standard JS Math sufficient for integer mm arithmetic |
| Signals over RxJS | Angular 21 signals are synchronous, no subscription management |
| Vitest over Karma | Angular 21 default; faster startup, better watch mode |
| SCSS | Angular default style preprocessor |

## Maintenance

**Update when:** Dependency version changed or new tool added.
**Verify:** Run `npm outdated` to check for updates.
