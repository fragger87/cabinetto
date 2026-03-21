# US025: Enable Print-to-PDF Export

**Status:** Backlog
**Epic:** Epic 4 — Report & Visualization
**Created:** 2026-03-20
**INVEST Score:** 5/6

---

## User Story

As a user, I want to print the report as a PDF so that I can take it to the workshop.

## Acceptance Criteria

1. Print button triggers browser print dialog
2. Print layout shows one board per page with no cut-off elements
3. Print CSS hides interactive elements (buttons, tooltips)

## Technical Notes

- Print button: `window.print()` trigger
- Separate print stylesheet: `@media print` rules
- Page breaks: `page-break-before: always` on each board SVG container
- Hide: navigation, buttons, hover tooltips, non-essential UI chrome
- Ensure SVG diagrams render correctly in print (test Chrome + Firefox)

### orchestratorBrief

```
tech: Angular, CSS (@media print)
keyFiles: src/styles/print.scss, src/app/components/report-page/
approach: Print stylesheet with page-break rules and element hiding
complexity: Low (CSS-only, no logic changes)
```

## Test Strategy

(Planned later by test planner)

## Dependencies

- US023 (cutting layout SVGs must exist to print)
