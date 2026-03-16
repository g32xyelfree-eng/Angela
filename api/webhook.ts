import { bot } from '../src/bot/telegram.js';
import { webhookCallback } from 'grammy';

// Vercel serverless function entrypoint
// Export the Grammy webhook callback to handle incoming HTTP requests
export default webhookCallback(bot, "http");
