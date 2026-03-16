import fetch from 'node-fetch';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env') });

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  console.error('Falta TELEGRAM_BOT_TOKEN en el .env');
  process.exit(1);
}

async function checkWebhook() {
  const response = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`);
  const data = await response.json();
  console.log('Información del Webhook actual:', JSON.stringify(data, null, 2));
}

checkWebhook();
