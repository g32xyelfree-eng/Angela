# Angela AI Agent

Angela es un agente de IA personal creado desde cero, diseñado para ejecutarse localmente y comunicarse de forma segura a través de Telegram.

## Características Principales

- **Arquitectura Modular**: Código escrito puramente en TypeScript (ES Modules).
- **Backend LLM**: Integración principal con Groq (Llama 3.3 70B) para respuestas ultrarrápidas, con soporte de fallback a OpenRouter.
- **Memoria Persistente**: Historial de conversaciones almacenado localmente usando SQLite (`better-sqlite3`).
- **Seguridad Primero**: Incorpora un sistema de lista blanca (Whitelist) por ID de Telegram, por lo que solo tú puedes interactuar con tu bot.
- **Sistema de Herramientas (Tools)**: Incluye herramientas de base como `get_current_time` e infraestructura preparada para conectar APIs de terceros.
- **Agent Loop (ReAct)**: Capacidad intrínseca de pensar iterativamente y utilizar varias herramientas encadenadas antes de responder.

## Requisitos

- Node.js (v18+)
- Una clave de API de Groq
- Un token de Bot de Telegram (obtenido a través de BotFather)
- Tu ID de usuario de Telegram

## Instalación y Ejecución

1. Clona o descarga el proyecto.
2. Copia el archivo `.env.example` y renómbralo a `.env`:
   \`\`\`bash
   cp .env.example .env
   \`\`\`
3. Edita el archivo `.env` rellenando tus credenciales obligatorias (`TELEGRAM_BOT_TOKEN`, `TELEGRAM_ALLOWED_USER_IDS`, `GROQ_API_KEY`).
4. Instala las dependencias:
   \`\`\`bash
   npm install
   \`\`\`
5. Ejecuta el agente en modo desarrollo:
   \`\`\`bash
   npm run dev
   \`\`\`

## Escalabilidad Futura

El proyecto está diseñado pensando en la simplicidad y en ser fácilmente ampliable:
- **Nube**: Se puede reemplazar el módulo de SQLite (`src/memory/db.ts`) por Firebase/Supabase u otro para despliegues.
- **Voz**: Integración sencilla de Whisper o ElevenLabs analizando `ctx.message.voice` en `src/bot/telegram.ts`.
- **Nuevas Habilidades**: Agrega nuevas herramientas creando archivos en `src/agent/tools/` y registrándolas en `toolsRegistry`.
