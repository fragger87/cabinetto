# Design Guidelines

## Color Scheme

Wood-tone palette reflecting the woodworking domain.

| Token | Value | Usage |
|-------|-------|-------|
| `--color-primary` | `#8B4513` (SaddleBrown) | Headers, legends, accents |
| `--color-accent` | `#b8860b` (DarkGoldenrod) | Buttons, highlights |
| `--color-bg` | `#faf8f5` | Page background |
| `--color-surface` | `#fff` | Cards, fieldsets |
| `--color-border` | `#d4c5a9` | Borders, dividers |
| `--color-error` | `#c0392b` | Validation errors |
| `--color-success` | `#27ae60` | Success messages |

## Cutting Layout Colors

| Piece Type | Color | CSS |
|-----------|-------|-----|
| Side panels | Brown | `rgba(139,69,19,0.7)` |
| Bottom panels | Green | `rgba(34,139,34,0.6)` |
| Rails | Blue | `rgba(70,130,180,0.7)` |
| Drawer parts | Orange | `rgba(255,140,0,0.7)` |
| Back panels | Gray | `rgba(150,150,150,0.5)` |

## Layout

| Breakpoint | Layout |
|-----------|--------|
| 1024px+ | Full layout, all columns visible |
| Print | Input panel hidden, one board per page |

## Form Patterns

| Pattern | Usage |
|---------|-------|
| Fieldset + Legend | Group related inputs (Board Spec, Project Settings) |
| Progressive Disclosure | Drawer config hidden until enabled; advanced settings in `<details>` |
| Polymorphic Field | Toggle between fixed value and min/max range |
| Inline Validation | Error messages next to invalid fields |

## SVG Conventions

| Property | Value |
|----------|-------|
| Scale | 0.2 px/mm for cutting layouts, 0.15 px/mm for cabinet blocks |
| Label threshold | Show text only if piece > 40x20 px after scaling |
| Tooltips | SVG `<title>` element with piece name + dimensions |

## Maintenance

**Update when:** Color scheme, layout breakpoints, or SVG conventions change.
**Source of truth:** CSS custom properties in `src/styles.scss`.
