# Copilot Instructions

> Instrucciones suplementarias para GitHub Copilot. Preferencias completas en `CLAUDE.md`.

---

## Discovery-First Approach

Antes de modificar cualquier archivo:

1. Leer `CLAUDE.md` para preferencias generales de desarrollo
2. Leer `.agent/MEMORY.md` para contexto específico del proyecto
3. Buscar archivos similares para seguir patrones existentes
4. Si existe un archivo de grafo de dependencias, consultarlo primero

---

## Code Graph Protocol

Si el proyecto tiene un archivo `code_graph.json` (o similar), es **obligatorio** consultarlo antes de modificar cualquier archivo.

### Pasos Pre-Modificación

1. **Cargar el grafo**: Leer `code_graph.json`
2. **Encontrar el nodo**: Localizar el archivo por su `id` (ruta relativa)
3. **Trazar TODAS las aristas** que apuntan hacia/desde ese nodo
4. **Evaluar blast radius**: Contar dependientes directos + indirectos
5. **Planificar cambios en TODOS los archivos afectados**
6. **Reportar el blast radius** antes de hacer cambios

### Formato del Reporte

```
## Blast Radius: <archivo modificado>

DEPENDENCIAS DIRECTAS (se romperán):
├── <archivo> → <razón>
└── <archivo> → <razón>

DEPENDENCIAS INDIRECTAS (pueden ser afectadas):
├── <archivo> → <razón>
└── <archivo> → <razón>

IMPACTO EN BASE DE DATOS:
└── <colección> → READ/WRITE

RIESGO ESTIMADO: LOW / MEDIUM / HIGH
```

### Tipos de Nodo

`route` · `component` · `service` · `utility` · `middleware` · `config` · `model` · `context` · `type` · `collection` · `endpoint` · `external_api`

### Tipos de Arista

`imports` · `db_read` · `db_write` · `api_call` · `defines` · `event`

---

## Monorepo

En proyectos monorepo, cambios en paquetes compartidos afectan múltiples apps. Siempre verificar todos los consumidores antes de modificar un paquete compartido.

---

## Feedback Loop

Después de completar cambios, el agente debe:

1. **Verificar**: Correr build, lint y tests relacionados
2. **Aprender**: Si encuentra un patrón (error recurrente, buena práctica, convención no documentada), registrarlo en `.agent/MEMORY.md`
3. **No repetir errores**: Antes de empezar una tarea, revisar la sección de Gotchas en `.agent/MEMORY.md`

**Importante**: El agente escribe libremente en `.agent/MEMORY.md`. Solo el usuario modifica `CLAUDE.md` y `copilot-instructions.md`.
