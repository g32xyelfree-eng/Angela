import { Memory } from '../../memory/db.js';
import { ToolDefinition } from '../llm.js';

/**
 * Tool to clear conversation history.
 */
export async function clearMemoryTool(args: { userId: number }): Promise<string> {
  try {
    const { userId } = args;
    await Memory.clearMemory(userId);
    return "Tu historial de conversación ha sido borrado exitosamente. He olvidado todo lo que hablamos anteriormente.";
  } catch (error: any) {
    console.error('[Herramienta: Memory] Error:', error);
    return `Error al intentar borrar la memoria: ${error.message}`;
  }
}

export function getClearMemoryDefinition(): ToolDefinition {
  return {
    type: 'function',
    function: {
      name: 'clear_memory',
      description: 'Borra todo el historial de conversación del usuario actual. Úsala cuando el usuario pida explícitamente olvidar todo, empezar de cero o limpiar el chat.',
      parameters: {
        type: 'object',
        properties: {
          userId: {
            type: 'number',
            description: 'El ID de Telegram del usuario.'
          }
        },
        required: ['userId']
      }
    }
  };
}
