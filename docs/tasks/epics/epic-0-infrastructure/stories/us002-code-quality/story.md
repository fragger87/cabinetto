# US002: Configure Code Quality Tooling

**Status:** Done
**Epic:** Epic 0 — Infrastructure & Project Setup
**Created:** 2026-03-20
**INVEST Score:** 5/6

---

## User Story

As a developer, I want automated linting and formatting so that code style stays consistent across the project.

## Acceptance Criteria

1. ESLint configured with Angular-recommended rules; `npm run lint` passes on all generated files
2. Prettier configured; `npm run format` auto-fixes formatting
3. ESLint and Prettier rules do not conflict (integrated via eslint-config-prettier)

## Technical Notes

- Use `@angular-eslint/schematics` for ESLint Angular integration
- Prettier config: `.prettierrc` with single quotes, trailing commas, 100 char line width (adjust to team preference)
- Add `eslint-config-prettier` to disable ESLint rules that conflict with Prettier
- Add npm scripts: `"lint": "ng lint"`, `"format": "prettier --write \"src/**/*.{ts,html,scss}\""`

### orchestratorBrief

```
tech: ESLint, Prettier, @angular-eslint
keyFiles: .eslintrc.json, .prettierrc, package.json
approach: ng add @angular-eslint, install prettier + eslint-config-prettier, add npm scripts
complexity: Low (standard tooling)
```

## Test Strategy

(Planned later by test planner)

## Dependencies

- US001 (Angular project must exist)
