# CondoControl - Arquitectura Inicial

## Objetivo
Backoffice para control de rentas en condominios/propiedades con:
- Gestion de inquilinos y pagos
- Deteccion de pagos vencidos
- Recordatorios por email, WhatsApp y llamada
- Integracion bancaria para marcar pagos como liquidados

## Componentes
- `apps/api`: API de backoffice y orquestador de recordatorios
- `packages/shared-types`: tipos compartidos de dominio

## Flujo de Cobranza
1. Se crea/actualiza un `Payment` en estado `pending`.
2. El cron diario evalua pagos pendientes.
3. Se genera mensaje personalizado via OpenRouter (o fallback local).
4. Se envia por canal escalonado: email -> WhatsApp -> llamada (si esta `late`).
5. Banco confirma pago por webhook y se marca `settled`.
6. Al estar `settled`, deja de entrar al flujo de recordatorios.

## Integraciones Sugeridas
- OpenRouter: generacion de copy y clasificacion de riesgo de mora
- Twilio: WhatsApp oficial + voz saliente (produccion)
- Baileys: soporte operativo para escenarios internos/no oficiales
- ElevenLabs: TTS para llamadas automáticas de cobranza
- SendGrid: emails transaccionales

## Conexión Bancaria
Estrategia recomendada de 2 capas:
- Webhook primario: actualizaciones instantaneas del banco
- Poller de reconciliacion: job cada 15-30 minutos para confirmar eventos perdidos

Validaciones clave:
- Verificar firma HMAC del webhook
- Idempotencia por `externalPaymentId`
- Auditoria de cambios de estado (`pending` -> `settled`)

## Modelo de Datos Recomendado (siguiente fase)
- `Organization`
- `Property`
- `Unit`
- `Tenant`
- `Lease`
- `Payment`
- `ReminderAttempt`
- `BankEvent`

Todos los registros multi-tenant deben filtrar por `organizationId`.

## Riesgos y Mitigaciones
- Riesgo: falsos positivos de morosidad
  - Mitigacion: tolerancia por zona horaria + grace period configurable
- Riesgo: bloqueo de canales de mensajeria
  - Mitigacion: fallback multicanal + reintentos exponenciales
- Riesgo: cumplimiento legal en llamadas grabadas
  - Mitigacion: consentimiento y aviso legal por pais
