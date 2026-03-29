---
agent: "agent"
description: "Pre-submit self-review — audit changes before creating a PR"
---

# PR Review

Revisar los cambios actuales contra los estándares de calidad antes de crear un PR.

## Paso 1: Entender el Scope

1. Correr `git diff --stat` para ver archivos modificados
2. Correr `git diff` para ver cambios detallados
3. Identificar qué apps/paquetes son afectados

## Paso 2: Checklist de Calidad

Evaluar cada punto. Reportar PASS / FAIL / N/A:

### Seguridad
- [ ] No hay secrets hardcodeados (API keys, tokens, passwords en código)
- [ ] Rutas sensibles tienen verificación de auth
- [ ] Inputs del usuario son validados (Zod o equivalente)
- [ ] Prisma usa `select` — no retorna filas completas con datos sensibles
- [ ] `organizationId` incluido en queries multi-tenant

### UI/UX
- [ ] Textos visibles al usuario están en español
- [ ] Mobile-first responsive design
- [ ] No hay console.log olvidados
- [ ] No hay TODO/FIXME/HACK sin resolver

### Código
- [ ] Se siguen los patrones existentes del proyecto
- [ ] No hay `any` en TypeScript (excepto con justificación)
- [ ] No hay `as` casts innecesarios
- [ ] Imports no crean dependencias circulares
- [ ] Archivos nuevos están en la ubicación correcta según la estructura del proyecto

### Base de Datos
- [ ] No se usa `--force-reset`, `migrate reset`, o `DROP TABLE`
- [ ] Cambios al schema son aditivos (agregar, no destruir)
- [ ] Campos nuevos tienen defaults o son nullable si la tabla tiene datos

### Monorepo
- [ ] Cambios en paquetes compartidos son compatibles con TODAS las apps consumidoras
- [ ] No se duplica lógica que debería estar en un paquete compartido

## Paso 3: Blast Radius

1. Si existe `code_graph.json`, trazar dependencias de archivos modificados
2. Si no, escanear imports manualmente
3. Listar archivos que podrían ser afectados indirectamente

## Paso 4: Verificar

1. **Build**: `pnpm turbo build --filter=<apps afectadas>`
2. **Lint**: Correr linter si existe
3. **Types**: `npx tsc --noEmit` o `pnpm turbo typecheck`
4. **Tests**: Correr tests relacionados

## Paso 5: Reporte Final

```
## PR Review

SCOPE: <archivos modificados> across <apps/paquetes>

### Checklist
SEGURIDAD:    ✅ / ❌ <detalles si falló>
UI/UX:        ✅ / ❌ <detalles si falló>
CÓDIGO:       ✅ / ❌ <detalles si falló>
BASE DE DATOS: ✅ / ❌ / N/A
MONOREPO:     ✅ / ❌ / N/A

### Verificación
BUILD: ✅ / ❌
LINT:  ✅ / ❌ / ⏭️
TYPES: ✅ / ❌
TESTS: ✅ / ❌ / ⏭️

### Blast Radius
<archivos afectados directa e indirectamente>

### Recomendación
READY TO MERGE / NEEDS FIXES <lista de fixes>
```
