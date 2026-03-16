// Implementación de la herramienta
export function getCurrentTimeTool(_args) {
    const now = new Date();
    // Formateamos la hora para que sea clara y localizada
    const timeString = now.toLocaleString('es-ES', {
        timeZoneName: 'short',
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    return `La hora actual del sistema es: ${timeString}`;
}
// Definición para el LLM
export function getCurrentTimeDefinition() {
    return {
        type: 'function',
        function: {
            name: 'get_current_time',
            description: 'Obtiene la fecha y hora actual local del sistema. Úsalo siempre que el usuario pregunte por la hora o fecha actual.',
            parameters: {
                type: 'object',
                properties: {},
                required: []
            }
        }
    };
}
