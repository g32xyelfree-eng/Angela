import { onRequest } from "firebase-functions/v2/https";
import { telegramWebhookCallback } from './bot/telegram.js';

export const angelaWebhook = onRequest(
  telegramWebhookCallback
);

