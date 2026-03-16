import { bot } from '../src/bot/telegram.js';
import { webhookCallback } from 'grammy';

const handleUpdate = webhookCallback(bot, "http");

export default async (req: any, res: any) => {
  if (req.method !== 'POST') {
    console.log(`[Webhook] Recibida petición ${req.method}. Angela solo responde a POST desde Telegram.`);
    return res.status(200).send('Angela está activa. Por favor, usa POST para actualizaciones.');
  }
  
  try {
    return await handleUpdate(req, res);
  } catch (err) {
    console.error('[Webhook Error]', err);
    return res.status(500).send('Error interno en el Webhook');
  }
};
