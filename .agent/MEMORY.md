# Agent Memory

> Este archivo es un canvas en blanco. El agente lo llena conforme trabaja en el proyecto.
> Las instrucciones generales están en `CLAUDE.md`. Este archivo es solo para contexto específico del proyecto.

## Qué Hace Esta App

<!-- El agente llena esta sección al explorar el proyecto por primera vez -->

Backoffice API para control de rentas con recordatorios multicanal (email, WhatsApp, llamada), y reconciliacion bancaria por webhook para marcar pagos como liquidados.

## Estructura

<!-- Layout del proyecto, qué hace cada directorio/app/paquete -->

```
<!-- El agente documenta la estructura aquí -->

apps/api                # API Express, cron de recordatorios, integraciones
packages/shared-types   # Tipos compartidos de dominio
docs/architecture.md    # Documento de arquitectura inicial
```

## Stack & Versiones

<!-- Versiones específicas descubiertas del package.json -->

| Dependencia | Versión | Notas |
|-------------|---------|-------|
| Node.js | >= 22 recomendado | Usa modulo node:sqlite para SQLite local |
| pnpm | 8.x | workspace + turbo |
| turbo | 2.9.6 | orquestacion monorepo |
| express | 4.21.x | API backoffice |
| pg | 8.13.x | Postgres local o Supabase |

## Comandos

<!-- Scripts de desarrollo, build, test descubiertos -->

| Comando | Qué hace |
|---------|----------|
| pnpm install | instala dependencias del monorepo |
| pnpm --filter @condocontrol/api dev | levanta API local |
| pnpm build | build de todos los paquetes |
| pnpm typecheck | typecheck de workspace |

## Patrones

<!-- Patrones de código que el agente descubre y que vale la pena repetir -->
<!-- Ej: "Auth siempre en lib/auth.ts por app", "Storage usa presigned URLs" -->

- `tenantRepository` usa selector por `DB_PROVIDER` para alternar `memory`, `sqlite` y `postgres` sin cambiar codigo de dominio.
- Seed inicial automatico en cada adapter para demo funcional inmediata.

## Convenciones

<!-- Convenciones específicas del proyecto no documentadas en CLAUDE.md -->
<!-- Ej: "Nombres de enum en español", "Componentes usan barrel exports" -->

- Blueprints_skills ahora es fuente de verdad complementaria para UX, seguridad y auditoria de dependencias.
- Seguridad por defecto: validar input con esquema, rate limiting por ruta/usuario/IP, idempotencia en writes sensibles y firmas HMAC para webhooks/pagos.
- Arquitectura UI/UX: mobile-first ergonomico (thumb zone, safe areas, targets 44-48), con adaptacion explicita portrait/landscape.
- Operacion: integrar checks de dependencias (audit + workflows CI) y mantener enfoque de defense-in-depth.

## Gotchas

<!-- Errores descubiertos durante el trabajo. El agente agrega aquí cada vez que algo falla inesperadamente -->
<!-- Formato: ### Título breve \n Qué pasó, por qué, cómo evitarlo -->

## Integraciones

<!-- APIs externas, servicios third-party, webhooks descubiertos -->

- OpenRouter (generacion de mensajes)
- Twilio/Baileys (WhatsApp + llamadas)
- ElevenLabs (voz para llamadas)
- Webhook bancario en `/api/payments/webhooks/payment-settled`

## Archivos Clave

<!-- Mapa de archivos importantes descubiertos por app/paquete -->

---
*El agente actualiza este archivo conforme trabaja. No registrar cambios individuales o bug fixes — solo patrones y conocimiento reutilizable.*
