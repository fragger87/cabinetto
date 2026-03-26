# Infrastructure

## Environments

| Environment | Type | Description |
|-------------|------|-------------|
| Development | Local | `ng serve` on localhost:4200 |
| CI | GitHub Actions | Build + test + lint on push/PR |
| Production | Static hosting | `dist/cabinet-calculator/` deployed to CDN/GitHub Pages |

## Build Pipeline

| Step | Command | Output |
|------|---------|--------|
| Install | `npm ci` | node_modules/ |
| Build | `ng build --configuration=production` | dist/cabinet-calculator/ (~310 KB) |
| Test | `ng test` | Vitest results (57 unit tests) |
| Coverage | `ng test --coverage` | V8 coverage report |
| Lint | `ng lint` | ESLint results |
| Format | `npm run format` | Prettier auto-fix |

## CI/CD Configuration

GitHub Actions workflow: `.github/workflows/ci.yml`

| Trigger | Jobs | Node Version |
|---------|------|-------------|
| Push to main | build-test-lint | 22 |
| PR to main | build-test-lint | 22 |

## Deployment

Static SPA — deploy `dist/cabinet-calculator/` to any static hosting:

| Option | Cost | Setup |
|--------|------|-------|
| GitHub Pages | Free | `ng deploy` or manual |
| Netlify | Free tier | Connect repo, build command = `ng build` |
| Any CDN | Varies | Upload dist/ contents |

No server, database, or container infrastructure needed.

## Maintenance

**Update when:** CI config changed, new deployment target added.
**Verify:** CI pipeline passes after infrastructure changes.
