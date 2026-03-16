import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
try {
  // En Cloud Functions, initializeApp() usa automáticamente las credenciales de servicio predeterminadas.
  initializeApp();
  console.log('[Memoria] Conectado a Firebase Firestore (Cloud Functions).');
} catch (err) {
  console.error('[Error] Falló la inicialización de Firebase:', err);
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
