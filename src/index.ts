import { startBot } from './bot/telegram.js';
import { ENV } from './config/env.js';
import { db } from './memory/db.js';

async function main() {
  console.log('Iniciando sistema Angela...');
  
  // No se requiere verificación de SQLite ya que se migró a Firestore
  console.log(`[Config] Creado por y para usuarios permitidos: ${ENV.TELEGRAM_ALLOWED_USER_IDS.join(', ')}`);
  
  // Iniciar la escucha del bot
  startBot();
}

main().catch((error) => {
  console.error('[Error Fatal] Fallo en la aplicación:', error);
});
