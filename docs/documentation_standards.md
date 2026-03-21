# Documentation Standards

Standards for creating and maintaining project documentation.

## General Rules

| # | Rule | Description |
|---|------|-------------|
| 1 | **Single Source of Truth** | Each concept documented in exactly one place; other files link to it |
| 2 | **No Code Blocks >5 Lines** | Documents describe contracts, not implementations; use tables/ASCII/links |
| 3 | **Tables Over Lists** | Use tables for parameters, config, alternatives; lists only for enumerations |
| 4 | **English Only** | All documentation and code identifiers in English |
| 5 | **Dimensions in mm** | All dimensional values in millimeters (integers) |

## Document Structure

Every document must include:

| Section | Purpose |
|---------|---------|
| Title (H1) | Document name |
| Purpose | Why this document exists (1-2 sentences) |
| Content | Main content organized by topic |
| Maintenance | When and how to update this document |

## Linking Conventions

| Pattern | Example |
|---------|---------|
| Cross-doc links | `[Architecture](project/architecture.md)` |
| Section anchors | `[Data Flow](project/architecture.md#data-flow)` |
| External links | Full URL with descriptive text |

## Maintenance

**Update when:** New documentation standard needed, existing standard unclear.
**Verify:** All docs follow these rules after bulk changes.
