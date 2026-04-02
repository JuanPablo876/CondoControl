---
mode: "agent"
description: "Find quick performance wins and code cleanup opportunities"
---

# Quick Optimizer

## Setup

1. Read `package.json` to identify the framework and its version
2. If a dependency graph file exists (`code_graph.json`), use it for orphan detection
3. Read `.agent/MEMORY.md` for project-specific patterns

## Checks

### 1. Dead Code
Files with 0 imports (check dependency graph for orphan nodes). Unused exports, unreachable branches.

### 2. Large Files
Files over 300 LOC that should be split into focused modules.

### 3. Duplicate Logic
Similar patterns across apps or directories that should be extracted to shared packages.

### 4. Bundle Size
Unnecessary dependencies, missing dynamic imports in Next.js pages, heavy libraries that have lighter alternatives.

### 5. Missing Memoization
React components that re-render unnecessarily. Expensive computations without `useMemo`/`useCallback`.

### 6. N+1 Queries
ORM/database queries inside loops. Missing `include`/`select` causing extra round-trips.

## Guidelines

- Focus on changes that are safe, fast, and high-impact
- Always check blast radius before refactoring
- Prefer moving code to shared packages over duplicating fixes
