---
applyTo: "**/app/api/**/route.ts"
---

# API Routes

- Verificar autenticación antes de procesar requests (`verifyAuth` o equivalente)
- Usar helpers de roles con herencia (`hasRole`) — nunca comparación directa `role ===`
- En Next.js 14+, `params` es una Promise — siempre `await params`
- Mensajes de error al usuario final en español
- Forma consistente de errores: `{ error: string }`
- Incluir `organizationId` en queries Prisma para modelos multi-tenant
- Usar Prisma `select` para limitar campos retornados — nunca retornar filas completas
- Considerar rate limiting en endpoints de autenticación y sensibles
- Nunca exponer IDs auto-increment — usar UUID o `cuid()`
- Usar `try/catch` con respuestas de error apropiadas (400, 401, 403, 404, 500)
