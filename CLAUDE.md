# CLAUDE.md - Guía para IA

> Preferencias generales de desarrollo. Aplica a todos mis proyectos.
> Detalles específicos de cada proyecto van en `.agent/MEMORY.md`.

---

## Idioma

- **UI**: Todo en español (botones, labels, mensajes, placeholders, errores, tooltips)
- **Código**: Variables, funciones y nombres de archivo en inglés
- **Comentarios**: Pueden ser en español o inglés
- **API responses**: Mensajes de error en español cuando el usuario final los ve

---

## Discovery Protocol

Antes de escribir o modificar código, orientarse en el proyecto:

1. Leer `package.json` para identificar framework, dependencias y scripts
2. Escanear la estructura de directorios para entender el layout
3. Leer `.agent/MEMORY.md` si existe — contiene contexto específico del proyecto
4. Buscar archivos similares al que vas a crear/modificar para seguir patrones existentes
5. Si existe `code_graph.json`, usarlo para trazar dependencias antes de modificar archivos
6. Verificar la versión real del framework — nunca asumir

---

## Stack Preferido

| Capa | Tecnología | Notas |
|------|-----------|-------|
| Monorepo | Turborepo + pnpm workspaces | Siempre pnpm, nunca npm/yarn |
| Frontend | Next.js (App Router), React, TailwindCSS | Preferir App Router sobre Pages |
| UI | TailwindCSS, Framer Motion, Lucide React | No Material UI, no Chakra |
| Backend | Next.js API Routes o Express.js | Preferir API Routes cuando sea posible |
| Base de datos | PostgreSQL + Prisma ORM | Neon para hosting |
| Almacenamiento | Cloudflare R2 (compatible S3) | Presigned URLs para uploads |
| Auth | JWT + bcryptjs | Soporte 2FA con TOTP cuando aplique |
| Email | SendGrid | — |
| Deploy | Vercel | Variables de entorno por proyecto y branch |
| Package manager | pnpm | `shamefully-hoist=true` en .npmrc |

---

## Principios de Monorepo

1. Código compartido va en `packages/` — nunca duplicar entre apps
2. Acceso a DB solo a través del paquete de base de datos compartido — sin SQL raw en app code
3. Tipos compartidos entre apps van en un paquete dedicado de tipos
4. Al modificar un paquete compartido, verificar impacto en TODAS las apps consumidoras
5. Validar builds con `pnpm turbo build`

---

## Convenciones de Código

### Roles de Usuario
Siempre usar una función helper (`hasRole()` o equivalente) que herede permisos hacia arriba:

```typescript
// CORRECTO — el helper maneja herencia
if (!hasRole(user, ['ADMIN', 'REVIEWER'])) return forbidden();

// INCORRECTO — bloquea roles superiores
if (user.role !== 'ADMIN') return forbidden();
```

**Regla**: SUPER_ADMIN siempre hereda todos los permisos de ADMIN.

### Multi-tenancy
- Toda entidad principal pertenece a una `Organization` via `organizationId`
- Siempre filtrar queries por organización cuando aplique
- API keys: NUNCA en texto plano — usar hash SHA-256, mostrar solo el prefix en UI

### Seguridad
- **API Keys**: SHA-256 hash para almacenar, prefix para mostrar
- **Webhooks**: Firmar payloads con HMAC-SHA256
- **Presigned URLs (R2)**: Usar `unsignableHeaders` para excluir headers CRC32
- **Auth headers**: Soportar `Authorization: Bearer <key>` y `X-API-Key: <key>`
- **Secrets**: Nunca en código, siempre en variables de entorno

### Next.js API Routes (App Router)
```typescript
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await verifyAuth(request);
  if (!authResult.success) return unauthorizedResponse(authResult.error);
  if (!hasRole(authResult.user!, ['ADMIN'])) {
    return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
  }
  const { id } = await params; // Next.js 14+ requiere await
  // ... lógica
}
```

### Prisma
- Siempre usar `select` para limitar campos retornados
- Incluir `organizationId` en filtros cuando sea multi-tenant
- Usar `upsert` para operaciones idempotentes
- Migraciones en Neon: preferir SQL directo sobre `prisma migrate`

### Errores Comunes a Evitar
- `params` en Next.js 14+ es una Promise — siempre hacer `await params`
- Presigned URLs en R2 necesitan `unsignableHeaders: new Set(["x-amz-checksum-crc32"])`
- SendGrid requiere dominio verificado en producción
- IDs de entidad: usar formato `prefix_<slug>` o UUID — nunca auto-increment expuesto
- Base de datos: NUNCA resetear/recrear la DB para agregar un campo — usar `ALTER TABLE` o `prisma db push` sin --force-reset

---

## Feedback Loop

Después de completar un cambio, verificar automáticamente:

1. **Build**: Correr `pnpm turbo build --filter=<app afectada>` — si falla, corregir antes de continuar
2. **Lint**: Correr linter si existe — corregir errores, no ignorarlos
3. **Test**: Correr tests relacionados si existen — no romper tests existentes
4. **Revisar output**: Leer errores/warnings del build — a menudo revelan problemas que el editor no muestra

### Aprendizaje Continuo

Si durante la verificación descubriste algo importante:

- **Error repetible** (ej: "olvidé await params", "faltó organizationId en query") → Agregar a `.agent/MEMORY.md` en la sección de Gotchas
- **Patrón exitoso** (ej: "esta estructura de componente funciona bien", "este helper es reutilizable") → Agregar a `.agent/MEMORY.md` en Patrones
- **Convención del proyecto** que no estaba documentada → Agregarla a `.agent/MEMORY.md` en Convenciones
- **Error en las instrucciones** (algo en CLAUDE.md o copilot-instructions que causó un mal resultado) → Señalarlo al usuario para que lo corrija

**Regla**: Solo el usuario modifica `CLAUDE.md` y `copilot-instructions.md`. El agente escribe libremente en `.agent/MEMORY.md`.

---

## Quality Checklist

Antes de considerar terminado un cambio:

- [ ] Build pasa (`pnpm turbo build`)
- [ ] No hay secrets hardcodeados
- [ ] Textos de UI están en español
- [ ] Se siguen los patrones existentes del proyecto
- [ ] Cambios en paquetes compartidos verificados en todas las apps consumidoras
- [ ] Feedback loop ejecutado (build + lint + test)
- [ ] `.agent/MEMORY.md` actualizado si se descubrió algo nuevo

---

## Deployment

- **Vercel**: cada app del monorepo como proyecto separado
- **Base de datos**: Neon PostgreSQL
- **Variables de entorno**: configurar en Vercel dashboard por proyecto y branch
- **Build command**: `pnpm turbo build --filter=<app>`

---

## Notas del Proyecto

Ver `.agent/MEMORY.md` para comandos, estructura y detalles específicos de este proyecto.
