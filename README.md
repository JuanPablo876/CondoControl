# CondoControl

Plataforma de backoffice para administracion de renta en condominios y propiedades.

## Estado actual

Este repositorio ya incluye un scaffold funcional de monorepo con:
- API para salud, recordatorios y recepcion de pagos bancarios
- Orquestador de recordatorios por email, WhatsApp y llamadas
- Integracion base para OpenRouter, Twilio, Baileys y ElevenLabs
- Tipos de dominio compartidos en paquete reutilizable
- Repositorio de datos configurable: memoria, SQLite local o Postgres/Supabase

## Estructura

```
.
├── apps/
│   └── api/                        # API de backoffice + motores de recordatorio
│   └── web/                        # App Next.js para login, dashboard y settings
├── packages/
│   └── shared-types/               # Tipos de dominio compartidos
├── docs/
│   └── architecture.md             # Arquitectura y recomendaciones de integracion
├── .env.example                    # Variables de entorno base
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

## Requisitos

- Node.js 20+
- pnpm 8+

## Inicio rapido

```bash
pnpm install
cp .env.example .env
pnpm dev
```

API disponible en `http://localhost:4000`.
Web disponible en `http://localhost:3000`.

## Si aparece error con npm install

Este monorepo usa `pnpm` (no `npm`).

Usa siempre:

```bash
pnpm install
```

Si ya corriste `npm install` y quedo en estado inconsistente, limpia e instala de nuevo con pnpm:

```bash
Remove-Item -Recurse -Force node_modules
pnpm install
```

## Modos de base de datos

### 1) Demo instantaneo (sin DB)
```bash
DB_PROVIDER=memory
```

### 2) Local SQLite (persistencia local)
```bash
DB_PROVIDER=sqlite
SQLITE_FILE_PATH=./data/condocontrol.sqlite
```

### 3) Local Postgres o Supabase (recomendado)
```bash
DB_PROVIDER=postgres
DATABASE_URL=postgres://postgres:postgres@localhost:5432/condocontrol
# o usar directamente Supabase
SUPABASE_DB_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
```

## Endpoints actuales

- `GET /health`
- `POST /api/reminders/run-due-check`
- `POST /api/payments/:paymentId/bind-external`
- `POST /api/payments/webhooks/payment-settled`

Ejemplo webhook de banco:

```json
{
    "externalPaymentId": "bank_tx_001",
    "settledAt": "2026-04-12T10:30:00.000Z"
}
```

## Flujo funcional

1. Detectar pagos pendientes.
2. Redactar mensaje con OpenRouter (o fallback local).
3. Enviar por email y WhatsApp.
4. Si el pago esta en mora, escalar a llamada automatizada.
5. Al llegar webhook bancario, marcar `settled` y evitar nuevos recordatorios.

## Siguiente fase recomendada

- Reemplazar repositorio en memoria por PostgreSQL + Prisma.
- Implementar backoffice web en Next.js App Router.
- Agregar auth RBAC con herencia de roles (`hasRole`).
- Implementar idempotencia y firma HMAC en webhooks bancarios.
- Persistir intentos de recordatorio para trazabilidad y reporting.
