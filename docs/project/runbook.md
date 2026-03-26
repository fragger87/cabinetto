# Runbook

Operations guide for building, running, and deploying Cabinet Calculator.

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 22+ | Development runtime |
| npm | 11+ | Package manager |
| Docker | 24+ | Container builds (optional) |

## Development

| Task | Command | Notes |
|------|---------|-------|
| Install dependencies | `npm ci` | Clean install from lockfile |
| Start dev server | `npm start` | Serves at localhost:4200 with hot reload |
| Run tests | `npm test` | Vitest unit tests |
| Run tests with coverage | `npm run test:coverage` | V8 coverage report |
| Lint | `npm run lint` | ESLint with Angular rules |
| Format | `npm run format` | Prettier auto-fix on src/ |
| E2E tests | `npm run e2e` | Playwright browser tests |

## Docker Build & Run

| Task | Command | Notes |
|------|---------|-------|
| Build image | `docker compose build` | Multi-stage: Node 22 build + nginx serve |
| Start container | `docker compose up -d` | Serves at localhost:8080 |
| Stop container | `docker compose down` | Removes container |
| View logs | `docker compose logs -f app` | Follow container output |
| Rebuild after changes | `docker compose up -d --build` | Rebuild and restart |

## Production Build

| Step | Command | Output |
|------|---------|--------|
| Build for production | `ng build --configuration=production` | `dist/cabinet-calculator/browser/` |
| Verify output | `ls -la dist/cabinet-calculator/browser/` | ~310 KB total |

The production build outputs a static SPA that can be served by any web server or CDN. See [Infrastructure](infrastructure.md) for deployment options.

## Troubleshooting

| Symptom | Cause | Resolution |
|---------|-------|------------|
| `ng serve` port conflict | Port 4200 in use | Use `ng serve --port 4201` |
| Docker build fails at `npm ci` | Lockfile mismatch | Run `npm install` locally, commit updated lockfile |
| Tests fail with module errors | Stale node_modules | Delete `node_modules/`, run `npm ci` |
| E2E tests fail | Missing browsers | Run `npx playwright install` |

## Maintenance

**Update when:** Build process changes, new Docker config, new deployment steps added.
**Verify:** Commands in this document match actual project scripts in `package.json`.
