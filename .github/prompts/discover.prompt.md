---
mode: "agent"
description: "Explore a new project and fill .agent/MEMORY.md with discovered context"
---

# Discover

Explorar el proyecto y llenar `.agent/MEMORY.md` con contexto descubierto.

**Importante**: Si `MEMORY.md` ya tiene contenido, **mergear** — no sobrescribir. Preservar gotchas, patrones y convenciones existentes.

## Paso 1: Qué Hace Esta App

1. Buscar `README.md` en la raíz y en cada app
2. Leer landing pages o componentes principales para entender el propósito
3. Llenar la sección "Qué Hace Esta App" en MEMORY.md

## Paso 2: Estructura

1. Escanear la estructura de directorios (sin node_modules, .next, dist)
2. Identificar si es monorepo (buscar `turbo.json`, `pnpm-workspace.yaml`)
3. Mapear cada app/paquete y su rol
4. Llenar la sección "Estructura" con un árbol simplificado

## Paso 3: Stack & Versiones

1. Leer `package.json` en raíz y cada app/paquete
2. Anotar versiones reales de: framework, React, TypeScript, ORM, UI library, etc.
3. Llenar la tabla "Stack & Versiones"

## Paso 4: Comandos

1. Leer `scripts` de cada `package.json`
2. Identificar comandos de dev, build, test, lint, typecheck
3. Llenar la tabla "Comandos"

## Paso 5: Patrones

1. Buscar archivos de auth (`**/lib/auth.*`, `**/middleware.*`)
2. Buscar patrones de API routes (`**/app/api/**/route.ts`)
3. Buscar componentes UI para identificar librería de iconos, animación, styling
4. Buscar configuración del ORM (`**/prisma/schema.prisma`)
5. Anotar patrones recurrentes en la sección "Patrones"

## Paso 6: Integraciones

1. Buscar referencias a API keys en `.env.example` o `.env.local.example`
2. Buscar imports de SDKs third-party (AWS, Stripe, SendGrid, etc.)
3. Buscar webhooks o callbacks
4. Llenar sección "Integraciones"

## Paso 7: Archivos Clave

1. Mapear archivos importantes por app/paquete:
   - Entry points, config files, auth, middleware, database schema, shared types
2. Llenar sección "Archivos Clave"

## Paso 8: Resumen

Imprimir un resumen de lo descubierto al usuario:

```
## Descubrimiento Completado

PROYECTO: <nombre>
TIPO: monorepo / single-app
APPS: <lista>
FRAMEWORK: <name> <version>
ORM: <name> <version>
INTEGRACIONES: <lista>

SECCIONES ACTUALIZADAS EN MEMORY.MD:
- [lista de secciones que se llenaron o actualizaron]
```
