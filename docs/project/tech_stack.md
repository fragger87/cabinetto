# Tech Stack

## Runtime

| Technology | Version | Purpose |
|-----------|---------|---------|
| Angular | 21.2.0 | Frontend framework (standalone components, signals) |
| TypeScript | 5.9.2 | Language (strict mode enabled) |
| Node.js | 24.x (local), 22.x (CI/Docker) | Build tooling runtime |
| RxJS | 7.8.x | Angular peer dependency (unused directly — signals preferred) |

## Build & Tooling

| Tool | Version | Purpose |
|------|---------|---------|
| Angular CLI | 21.2.3 | Project scaffold, build, serve |
| Vitest | 4.0.8 | Unit test framework (Angular 21 default) |
| ESLint | 10.0.3 | Linting with angular-eslint 21.3.1 |
| Prettier | 3.8.1 | Code formatting |
| eslint-config-prettier | 10.1.8 | Prevents ESLint/Prettier conflicts |
| @vitest/coverage-v8 | 4.1.0 | Code coverage reporting |
| Playwright | 1.58.2 | End-to-end testing |
| Husky | 9.1.7 | Git hooks (pre-commit) |
| lint-staged | 16.4.0 | Run linters on staged files |

## CI/CD

| Tool | Config | Purpose |
|------|--------|---------|
| GitHub Actions | `.github/workflows/ci.yml` | Build + test + lint on push/PR to main |

## Architecture Decisions

See [Development Principles](../principles.md#architecture-decisions) for architecture decision rationale.

## Maintenance

**Update when:** Dependency version changed or new tool added.
**Verify:** Run `npm outdated` to check for updates.
