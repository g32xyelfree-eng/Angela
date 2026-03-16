import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { ENV } from '../config/env.js';
import fs from 'fs';
import path from 'path';

// Load service account from path defined in .env
const serviceAccountPath = path.resolve(process.cwd(), ENV.GOOGLE_APPLICATION_CREDENTIALS);

if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    initializeApp({
      credential: cert(serviceAccount)
    });
    console.log('[Memoria] Conectado a Firebase Firestore mediante Variables de Entorno (Vercel).');
  } catch (err) {
    console.error('[Error] Falló la inicialización de Firebase con Vercel:', err);
  }
} else if (!fs.existsSync(serviceAccountPath)) {
  console.warn(`[Advertencia] No se encontró el archivo de credenciales de Firebase en: ${serviceAccountPath}`);
  console.warn('Angela requiere "service-account.json" configurado para guardar memoria en la nube.');
} else {
  try {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    initializeApp({
      credential: cert(serviceAccount)
    });
    console.log('[Memoria] Conectado a Firebase Firestore exitosamente.');
  } catch (err) {
    console.error('[Error] Falló la inicialización de Firebase:', err);
  }
}

export const db = getFirestore();

export interface MessageRow {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  timestamp?: FieldValue;
}

export const Memory = {
  addMessage: async (userId: number, role: 'system' | 'user' | 'assistant' | 'tool', content: string) => {
    try {
      const messagesRef = db.collection('conversations').doc(userId.toString()).collection('messages');
      await messagesRef.add({
        role,
        content,
        timestamp: FieldValue.serverTimestamp()
      });
    } catch (e) {
      console.error('[Memoria] Error guardando mensaje en Firestore:', e);
    }
  },
  
  getMessages: async (userId: number, limit: number = 50): Promise<MessageRow[]> => {
    try {
      const messagesRef = db.collection('conversations').doc(userId.toString()).collection('messages');
      const snapshot = await messagesRef.orderBy('timestamp', 'asc').limitToLast(limit).get();
      
      const messages: MessageRow[] = [];
      snapshot.forEach(doc => {
        const data = doc.data() as MessageRow;
        messages.push({
          role: data.role,
          content: data.content
        });
      });
      return messages;
    } catch (e) {
      console.error('[Memoria] Error leyendo mensajes de Firestore:', e);
      return [];
    }
  },

  clearMemory: async (userId: number) => {
    try {
      const messagesRef = db.collection('conversations').doc(userId.toString()).collection('messages');
      const snapshot = await messagesRef.get();
      
      const batch = db.batch();
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      console.log(`[Memoria] Historial borrado para usuario ${userId}`);
    } catch (e) {
      console.error('[Memoria] Error limpiando memoria:', e);
    }
  }
};
