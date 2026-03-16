import Groq from 'groq-sdk';
import { ENV } from '../config/env.js';

// Inicializar cliente Groq
export const groq = new Groq({
  apiKey: ENV.GROQ_API_KEY,
});

// Tipos para los mensajes
export type Role = 'system' | 'user' | 'assistant' | 'tool';

export interface Message {
  role: Role;
  content: string;
  name?: string;
  tool_call_id?: string;
  tool_calls?: any[];
}

export interface ToolDefinition {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: {
      type: 'object';
      properties: Record<string, any>;
      required?: string[];
    };
  };
}

// Función principal para llamar al LLM
export async function generateCompletion(messages: Message[], tools?: ToolDefinition[]) {
  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: messages as any,
      tools: tools as any,
      tool_choice: tools ? 'auto' : 'none',
      temperature: 0.7,
      max_tokens: 1024,
    });

    return response.choices[0].message;
  } catch (error) {
    console.error('Error al comunicarse con Groq:', error);
    
    // Fallback opcional a OpenRouter si se configura y Groq falla
    if (ENV.OPENROUTER_API_KEY) {
      console.log('Intentando fallback a OpenRouter...');
      return generateOpenRouterCompletion(messages, tools);
    }
    
    throw error;
  }
}

// Fallback a OpenRouter
export async function generateOpenRouterCompletion(messages: Message[], tools?: ToolDefinition[]) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ENV.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://github.com/angelabot',
      'X-Title': 'Angela AI Agent'
    },
    body: JSON.stringify({
      model: ENV.OPENROUTER_MODEL,
      messages: messages,
      tools: tools,
      tool_choice: tools ? 'auto' : 'none',
    })
  });

  if (!response.ok) {
    throw new Error(`Error en OpenRouter: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message;
}
