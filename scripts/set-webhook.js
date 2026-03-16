import fetch from 'node-fetch';
import { config } from 'dotenv';
import { resolve } from 'path';

// Cargar variables del .env local
config({ path: resolve(process.cwd(), '.env') });

const token = process.env.TELEGRAM_BOT_TOKEN;
const vercelUrl = process.argv[2].replace(/\/$/, "");

if (!token || !vercelUrl) {
  console.error('Uso: node scripts/set-webhook.js <URL_DE_VERCEL>');
  console.error('Ejemplo: node scripts/set-webhook.js https://angela-bot.vercel.app');
  process.exit(1);
}

const webhookUrl = `${vercelUrl}/api/webhook`;

async function setWebhook() {
  console.log(`Configurando webhook para: ${webhookUrl}...`);
  
  const response = await fetch(`https://api.telegram.org/bot${token}/setWebhook?url=${webhookUrl}`);
  const data = await response.json();
  
  if (data.ok) {
    console.log('¡Éxito! Webhook configurado correctamente.');
    console.log('Tu bot ahora está escuchando en Vercel.');
  } else {
    console.error('Error configurando el webhook:', data.description);
  }
}

setWebhook();
