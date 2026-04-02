---
mode: "agent"
description: "Verify recent changes — build, lint, test — and update agent memory with learnings"
---

# Feedback Loop

Verificar los cambios recientes y aprender de ellos.

## Paso 1: Identificar Cambios

1. Revisar `git diff` o `git status` para entender qué archivos fueron modificados
2. Identificar qué apps/paquetes del monorepo fueron afectados

## Paso 2: Verificar

Correr en orden, deteniéndose si algo falla:

1. **Build**: `pnpm turbo build --filter=<app afectada>` (o `pnpm turbo build` si múltiples apps)
2. **Lint**: Correr linter si existe en los scripts del proyecto
3. **Tests**: Correr tests relacionados a los archivos modificados
4. **Type check**: `pnpm turbo typecheck` si existe, o `npx tsc --noEmit`

Si algo falla:
- Diagnosticar el error
- Proponer un fix
- Después del fix, correr la verificación de nuevo

## Paso 3: Aprender

Revisar `.agent/MEMORY.md` y actualizarlo si se descubrió algo nuevo:

- **Gotcha nuevo**: Un error que no era obvio y podría repetirse → agregar a sección Gotchas
- **Patrón exitoso**: Una solución elegante que debería repetirse → agregar a sección Patrones
- **Convención no documentada**: Un patrón del proyecto que no estaba en las instrucciones → agregar a Convenciones
- **Archivo clave**: Un archivo importante que no estaba mapeado → agregar a Archivos Clave

## Paso 4: Reportar

Dar un resumen al usuario:

```
## Verificación Completada

BUILD: ✅ / ❌ (detalles si falló)
LINT:  ✅ / ❌ / ⏭️ (no configurado)
TESTS: ✅ / ❌ / ⏭️ (no encontrados)
TYPES: ✅ / ❌

APRENDIZAJES:
- [qué se agregó a MEMORY.md, si algo]

ARCHIVOS VERIFICADOS:
- [lista de archivos que cambiaron]
```
