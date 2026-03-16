import { getCurrentTimeTool, getCurrentTimeDefinition } from './time.js';
// Registro de todas las herramientas disponibles
export const toolsRegistry = {
    get_current_time: {
        definition: getCurrentTimeDefinition(),
        execute: getCurrentTimeTool
    }
};
// Función para obtener todas las definiciones de herramientas para enviar al LLM
export function getAvailableToolsDefinitions() {
    return Object.values(toolsRegistry).map(t => t.definition);
}
// Función para ejecutar una herramienta por su nombre
export async function executeTool(name, argsStr) {
    const tool = toolsRegistry[name];
    if (!tool) {
        return `Error: Herramienta '${name}' no encontrada.`;
    }
    try {
        const args = argsStr ? JSON.parse(argsStr) : {};
        console.log(`[Herramienta] Ejecutando: ${name} con args:`, args);
        const result = await tool.execute(args);
        return result;
    }
    catch (error) {
        console.error(`[Herramienta] Error ejecutando ${name}:`, error);
        return `Error ejecutando la herramienta: ${error.message}`;
    }
}
