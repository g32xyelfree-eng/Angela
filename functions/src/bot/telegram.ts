import { Bot, Context, NextFunction, webhookCallback, InputFile } from 'grammy';
import { ENV } from '../config/env.js';
import { processUserMessage } from '../agent/loop.js';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { transcribeAudio, synthesizeVoice } from '../agent/audio.js';

// Inicializar el bot de Telegram
export const bot = new Bot(ENV.TELEGRAM_BOT_TOKEN);

// Middleware estricto para Whitelist: Solo permite mensajes de los IDs autorizados
const whitelistMiddleware = async (ctx: Context, next: NextFunction) => {
  const userId = ctx.from?.id;
  
  if (!userId) {
    return;
  }

  if (!ENV.TELEGRAM_ALLOWED_USER_IDS.includes(userId)) {
    console.warn(`[Seguridad] Usuario no autorizado intentó usar el bot (ID: ${userId})`);
    // Opcionalmente podemos responder, pero es más seguro ignorar silenciosamente
    // await ctx.reply("No estás autorizado para usar este bot.");
    return;
  }

  // Usuario autorizado, continuar
  await next();
};

bot.use(whitelistMiddleware);

bot.command('start', async (ctx) => {
  await ctx.reply('¡Hola! Soy Angela, tu agente de IA personal. ¿En qué puedo ayudarte hoy?');
});

bot.on('message:text', async (ctx) => {
  const userId = ctx.from.id;
  const userText = ctx.message.text;

  // Mostramos indicador de que está "escribiendo..."
  await ctx.replyWithChatAction('typing');
  
  try {
    // Procesar el mensaje a través del Agent Loop
    const responseText = await processUserMessage(userId, userText);
    
    // Responder en Telegram
    await ctx.reply(responseText);
  } catch (error) {
    console.error('[Bot] Error procesando el mensaje:', error);
    await ctx.reply('Lo siento, ha ocurrido un error al procesar tu mensaje.');
  }
});

bot.on(['message:voice', 'message:audio'], async (ctx) => {
  const userId = ctx.from.id;
  
  // Mostramos indicador de que está "grabando un audio..."
  await ctx.replyWithChatAction('record_voice');

  try {
    const fileId = ctx.message.voice ? ctx.message.voice.file_id : ctx.message.audio?.file_id;
    if (!fileId) throw new Error('No audio file found');

    const file = await ctx.api.getFile(fileId);
    if (!file.file_path) throw new Error('Could not retrieve file path from Telegram');

    // Construir la URL de descarga de Telegram
    const fileUrl = `https://api.telegram.org/file/bot${ENV.TELEGRAM_BOT_TOKEN}/${file.file_path}`;
    
    // Generar un archivo temporal
    const tempFilePath = path.join(os.tmpdir(), `${fileId}.ogg`);
    
    // Descargar el archivo usando fetch
    const response = await fetch(fileUrl);
    if (!response.ok) throw new Error(`Failed to download audio: ${response.statusText}`);
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(tempFilePath, buffer);

    console.log(`[Audio] Audio downloaded to ${tempFilePath}, transcribing...`);

    // Transcribir el audio usando Groq
    const transcribedText = await transcribeAudio(tempFilePath);
    
    // Borrar el archivo temporal
    if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);

    // Mostramos el indicador de que está "grabando un audio..." la respuesta
    await ctx.replyWithChatAction('record_voice');

    // Procesar la transcripción como si fuera un mensaje de texto normal
    const responseText = await processUserMessage(userId, transcribedText);
    
    // Generar la respuesta de voz
    const voiceBuffer = await synthesizeVoice(responseText);
    
    // Responder con la nota de voz nativa de Telegram (añadimos nombre de archivo para compatibilidad)
    await ctx.replyWithVoice(new InputFile(voiceBuffer, 'respuesta.mp3'));
    
    // También enviamos el texto de la respuesta por si el usuario no puede escuchar el audio en el momento
    await ctx.reply(responseText);
    
  } catch (error) {
    console.error('[Bot] Error procesando la nota de voz:', error);
    await ctx.reply('Lo siento, tuve problemas para escuchar o entender tu nota de voz.');
  }
});

export const telegramWebhookCallback = webhookCallback(bot, "express");
