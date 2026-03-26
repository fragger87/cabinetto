# US004: Configure CI/CD Pipeline

**Status:** Done
**Epic:** Epic 0 — Infrastructure & Project Setup
**Created:** 2026-03-20
**INVEST Score:** 5/6

---

## User Story

As a developer, I want automated build, test, and lint checks on push so that broken code is caught before merge.

## Acceptance Criteria

1. GitHub Actions workflow file exists and triggers on push to main branch
2. Pipeline runs `ng build`, `ng test`, and `npm run lint` sequentially
3. Pipeline fails visibly if any step fails
4. Pipeline completes in under 5 minutes for a clean build

## Technical Notes

- Workflow file: `.github/workflows/ci.yml`
- Use `actions/setup-node` with Node.js LTS version
- Cache `node_modules` via `actions/cache` for faster runs
- Vitest runs in jsdom — no browser needed for unit tests
- Consider adding `--no-progress` to ng build/test for cleaner CI output

### orchestratorBrief

```
tech: GitHub Actions, Node.js LTS
keyFiles: .github/workflows/ci.yml
approach: Create workflow with setup-node, npm ci, build, test, lint steps
complexity: Low (standard CI setup)
```

## Test Strategy

(Planned later by test planner)

## Dependencies

- US001 (project must build)
- US002 (lint script must exist)
- US003 (test runner must work)
