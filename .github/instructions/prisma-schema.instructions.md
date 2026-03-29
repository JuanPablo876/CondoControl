---
applyTo: "**/prisma/schema.prisma"
---

# Prisma Schema

- Primary keys: usar `@id @default(cuid())` — nunca exponer auto-increment integers
- Agregar `organizationId String` con `@relation` en modelos multi-tenant
- Incluir `createdAt DateTime @default(now())` y `updatedAt DateTime @updatedAt` en todos los modelos
- Usar enums para campos de estado — nombres de dominio en español son aceptables
- Indexar foreign keys y campos de filtro frecuentes
- Preferir `upsert` para operaciones idempotentes
- Migraciones en Neon: preferir SQL directo sobre `prisma migrate` en producción
- Al agregar campos, considerar: ¿necesita default? ¿Es nullable? ¿Necesita índice?

## Migraciones — Reglas de Seguridad

- **NUNCA** usar `prisma db push --force-reset`, `prisma migrate reset`, o `DROP TABLE` para agregar campos/tablas
- Cambios a la base de datos deben ser **aditivos**: agregar columnas, tablas, índices
- Para agregar un campo: modificar `schema.prisma` → `prisma db push` (sin --force-reset) o escribir SQL `ALTER TABLE ADD COLUMN`
- Para renombrar un campo: crear nuevo campo → migrar datos → eliminar viejo (en pasos separados)
- Para eliminar un campo: confirmar con el usuario ANTES de ejecutar — datos se pierden permanentemente
- En producción (Neon): siempre usar SQL directo (`ALTER TABLE`), nunca `prisma migrate` ni `db push`
- Si `db push` falla por conflicto de schema, diagnosticar el error — NO resetear como atajo
