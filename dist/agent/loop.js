import { generateCompletion } from './llm.js';
import { getAvailableToolsDefinitions, executeTool } from './tools/index.js';
import { Memory } from '../memory/db.js';
const MAX_ITERATIONS = 5;
const SYSTEM_PROMPT = `
Eres Angela, un agente de IA personal creado desde cero que funciona localmente y usa Telegram como interfaz.
Estás diseñada para ser simple, segura y útil. 
No eres un fork ni dependes de OpenClaw u otros frameworks pesados. Eres una implementación propia.

Reglas importantes:
- Responde y escribe todo siempre en español, de forma natural, amigable pero concisa.
- Tienes acceso a herramientas. Si necesitas información (como la hora actual), usa la herramienta correspondiente.
- Si no sabes algo y no tienes una herramienta para averiguarlo, dilo honestamente.
- Mantén tus respuestas claras y directas. No incluyas información técnica irrelevante a menos que el usuario lo pida explícitamente.
`;
export async function processUserMessage(userId, text) {
    try {
        // 1. Guardar el nuevo mensaje del usuario en memoria
        await Memory.addMessage(userId, 'user', text);
        // 2. Recuperar el historial de mensajes de la base de datos
        const history = await Memory.getMessages(userId);
        // 3. Preparar los mensajes para el LLM (incluyendo el system prompt)
        const messages = [
            { role: 'system', content: SYSTEM_PROMPT },
            ...history.map(row => ({
                role: row.role,
                content: row.content || ''
            }))
        ];
        const tools = getAvailableToolsDefinitions();
        let iteracion = 0;
        // 4. Iniciar el Agent Loop (Ciclo ReAct)
        while (iteracion < MAX_ITERATIONS) {
            iteracion++;
            console.log(`[Agente] Iteración ${iteracion}...`);
            // Llamar al LLM
            const response = await generateCompletion(messages, tools);
            // Si el LLM decide usar herramientas
            if (response.tool_calls && response.tool_calls.length > 0) {
                // Añadir el mensaje de respuesta de AI con tool_calls (guardamos vacio por ahora en DB simplificada)
                messages.push(response);
                await Memory.addMessage(userId, 'assistant', response.content || '...pensando...');
                const toolCall = response.tool_calls[0];
                const functionName = toolCall.function.name;
                const functionArgs = toolCall.function.arguments;
                console.log(`[Agente] El LLM ha solicitado ejecutar la herramienta: ${functionName}`);
                // Ejecutar la herramienta
                const toolResult = await executeTool(functionName, functionArgs);
                // Añadir el resultado de la herramienta al contexto del LLM
                const toolMessage = {
                    role: 'tool',
                    tool_call_id: toolCall.id,
                    name: functionName,
                    content: toolResult
                };
                messages.push(toolMessage);
                // Seguimos en el bucle para que el LLM analice el resultado de la herramienta
                continue;
            }
            // 5. Si no hay herramientas, obtenemos la respuesta final del LLM
            const finalContent = response.content || 'Sin respuesta.';
            // Guardamos la respuesta en memoria persistente
            await Memory.addMessage(userId, 'assistant', finalContent);
            return finalContent;
        }
        return "Lo siento, he superado el límite de operaciones al intentar procesar tu solicitud.";
    }
    catch (error) {
        console.error('[Agent Loop] Error crítico:', error);
        return `Lo siento, ocurrió un error interno: ${error.message}`;
    }
}
