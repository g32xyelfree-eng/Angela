import { getCurrentTimeTool, getCurrentTimeDefinition } from './time.js';
import { clearMemoryTool, getClearMemoryDefinition } from './memory.js';

// Interfaz para la definición completa de una herramienta
export interface Tool {
  definition: ToolDefinition;
  execute: (args: any) => Promise<string> | string;
}

// Registro de todas las herramientas disponibles
export const toolsRegistry: Record<string, Tool> = {
  get_current_time: {
    definition: getCurrentTimeDefinition(),
    execute: getCurrentTimeTool
  },
  clear_memory: {
    definition: getClearMemoryDefinition(),
    execute: clearMemoryTool
  }
};

// Función para obtener todas las definiciones de herramientas para enviar al LLM
export function getAvailableToolsDefinitions(): ToolDefinition[] {
  return Object.values(toolsRegistry).map(t => t.definition);
}

// Función para ejecutar una herramienta por su nombre
export async function executeTool(name: string, argsStr: string): Promise<string> {
  const tool = toolsRegistry[name];
  
  if (!tool) {
    return `Error: Herramienta '${name}' no encontrada.`;
  }

  try {
    const args = argsStr ? JSON.parse(argsStr) : {};
    console.log(`[Herramienta] Ejecutando: ${name} con args:`, args);
    const result = await tool.execute(args);
    return result;
  } catch (error: any) {
    console.error(`[Herramienta] Error ejecutando ${name}:`, error);
    return `Error ejecutando la herramienta: ${error.message}`;
  }
}
