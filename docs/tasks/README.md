<!-- SCOPE: Task tracking system workflow and rules ONLY -->

# Task Management

## Workflow

| Status | Description | Transition |
|--------|-------------|-----------|
| Backlog | Planned, not started | → In Progress |
| In Progress | Actively being worked on | → To Review |
| To Review | Implementation complete, needs review | → Done / To Rework |
| To Rework | Review feedback to address | → To Review |
| Done | Accepted and complete | (terminal) |

## Structure

| Level | Description | Count |
|-------|-------------|-------|
| Epic | Business domain or infrastructure area | 5 (Epic 0-4) |
| Story | Vertical slice of user value (5-10 per Epic) | 25 total |
| Task | Implementation step within a Story | Created per-Story |

## Files

| File | Purpose |
|------|---------|
| [kanban_board.md](kanban_board.md) | Epic tracker with story counters |
| [epics/](epics/) | Epic and Story documents (5 epics, 25 stories) |

## Conventions

- Story IDs are sequential across Epics: US001-US025
- Epic 0 is reserved for infrastructure
- Stories follow INVEST criteria (Independent, Negotiable, Valuable, Estimable, Small, Testable)
- Each Story has acceptance criteria describing observable user behavior (not system internals)

## Maintenance

**Update when:** New Epic or Story created, workflow rules changed.
**Verify:** kanban_board.md counters match actual Story files.
