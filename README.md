# Agent Setup Template

Template de configuración para asistentes de IA (GitHub Copilot, Claude Code, etc.) con instrucciones, prompts y memoria de agente.

## Cómo Usar

1. Copiar los archivos a tu proyecto:
   ```bash
   # Desde la raíz de tu nuevo proyecto:
   cp -r /path/to/agent-setup-template/.github .
   cp -r /path/to/agent-setup-template/.agent .
   cp -r /path/to/agent-setup-template/.vscode .
   cp /path/to/agent-setup-template/CLAUDE.md .
   cp /path/to/agent-setup-template/.gitignore .  # solo si no tienes uno
   ```

2. Personalizar `CLAUDE.md` si necesitas cambiar el stack o convenciones

3. En VS Code, abrir Copilot Chat y correr `/discover` para que el agente explore y llene `.agent/MEMORY.md`

## Estructura

```
├── CLAUDE.md                          # Preferencias generales de IA
├── .agent/
│   ├── README.md                      # Explica el sistema de memoria
│   └── MEMORY.md                      # Canvas en blanco — el agente lo llena
├── .github/
│   ├── copilot-instructions.md        # Instrucciones para GitHub Copilot
│   ├── instructions/                  # Instrucciones por tipo de archivo
│   │   ├── api-routes.instructions.md       # → **/app/api/**/route.ts
│   │   ├── react-components.instructions.md # → **/*.tsx
│   │   ├── prisma-schema.instructions.md    # → **/prisma/schema.prisma
│   │   └── middleware.instructions.md       # → **/middleware.ts
│   └── prompts/                       # Prompts ejecutables (/nombre)
│       ├── discover.prompt.md         # Explorar proyecto, llenar MEMORY.md
│       ├── feedback-loop.prompt.md    # Verificar cambios + aprender
│       ├── pr-review.prompt.md        # Self-review antes de crear PR
│       ├── code-graph-analyzer.prompt.md  # Analizar dependencias
│       ├── quick-optimizer.prompt.md  # Encontrar optimizaciones rápidas
│       └── security-hardener.prompt.md    # Auditoría de seguridad
└── .vscode/
    └── settings.json                  # Wiring de Copilot
```

## Qué Incluye

### Instrucciones por Archivo (`.github/instructions/`)
Se aplican automáticamente cuando Copilot trabaja en archivos que coinciden con el patrón `applyTo`. No necesitas invocarlos manualmente.

### Prompts Ejecutables (`.github/prompts/`)
Se invocan desde Copilot Chat escribiendo `/nombre-del-prompt`:

| Prompt | Qué Hace |
|--------|----------|
| `/discover` | Explora el proyecto y llena MEMORY.md |
| `/feedback-loop` | Verifica cambios (build, lint, test) y registra aprendizajes |
| `/pr-review` | Self-review estructurado antes de crear un PR |
| `/code-graph-analyzer` | Analiza grafo de dependencias y blast radius |
| `/quick-optimizer` | Encuentra dead code, duplicados, N+1 queries |
| `/security-hardener` | Auditoría de seguridad enfocada |

### Memoria del Agente (`.agent/`)
Canvas en blanco que el agente llena conforme trabaja. Persiste entre sesiones. No incluye datos del template — solo del proyecto donde se usa.

## Compatibilidad

- **GitHub Copilot** (VS Code): Lee `.github/copilot-instructions.md`, `instructions/`, `prompts/`, y `CLAUDE.md` via `settings.json`
- **Claude Code**: Lee `CLAUDE.md` y `.agent/MEMORY.md`
- **Otros agentes**: Pueden leer `CLAUDE.md` como instrucciones generales

## Personalización

- Editar `CLAUDE.md` para cambiar stack, convenciones, o preferencias de idioma
- Agregar más archivos `.instructions.md` para otros tipos de archivo
- Agregar más archivos `.prompt.md` para nuevos workflows
- `.agent/MEMORY.md` se llena solo — no editarlo manualmente (a menos que quieras limpiarlo)
