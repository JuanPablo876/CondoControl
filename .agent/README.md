# Agent Memory System

Esta carpeta contiene conocimiento persistente para asistentes de IA.

## Cómo Funciona

`MEMORY.md` es un **canvas en blanco** que el agente llena conforme trabaja en el proyecto. Comienza vacío y crece con cada sesión de trabajo.

## Qué Va Aquí

**SÍ:**
- Contexto del proyecto descubierto (qué hace, estructura, stack)
- Patrones de código que vale la pena repetir
- Convenciones no documentadas en CLAUDE.md
- Gotchas — errores que no eran obvios y podrían repetirse
- Integraciones y servicios externos
- Archivos clave por app/paquete

**NO:**
- Bug fixes individuales o cambios rutinarios
- Información que ya está en CLAUDE.md o copilot-instructions.md
- Logs de cambios o historial de sesiones
- Datos sensibles (tokens, secrets, API keys)

## Quién Lo Modifica

- **El agente** escribe libremente en `MEMORY.md` — es su espacio
- **El usuario** puede editarlo o limpiarlo en cualquier momento
- **Nadie** debería modificar `CLAUDE.md` o `copilot-instructions.md` automáticamente — solo el usuario

## Para Proyectos Nuevos

Copiar esta carpeta `.agent/` al proyecto nuevo. El `MEMORY.md` llega vacío y el agente lo va llenando conforme explora y trabaja.
