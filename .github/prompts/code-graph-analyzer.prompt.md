---
agent: "agent"
description: "Analyze dependency graph — trace connections, blast radius, and detect code smells"
---

# Code Graph Analyzer

## Setup

1. Look for `code_graph.json` (or similar dependency graph file) in the project root
2. If no graph file exists, analyze imports manually by scanning source files
3. Read `.agent/MEMORY.md` for project structure context

## Capabilities

### 1. Trace Dependencies
Find all files connected to the target file via imports, db_read, db_write, and api_call edges.

### 2. Blast Radius
Report which files will break if the target is modified. Include direct dependents (files importing this one) and indirect dependents (files importing those).

### 3. Detect Code Smells
- **God files**: 15+ connections — should be split
- **Circular dependencies**: A imports B imports A
- **Orphan files**: 0 imports — potentially dead code
- **Overcoupled modules**: High fan-in + high fan-out

### 4. Health Score
Rate the codebase 0-100 based on modularity, coupling, and file sizes.

## When Modifying Code

- Always check the graph FIRST
- Report blast radius BEFORE making changes
- Update ALL affected files, not just the target
- Flag if a change would increase coupling or create cycles
- In monorepos, changes to shared packages affect multiple apps — check all consumers
