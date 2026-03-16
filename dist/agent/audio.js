import { groq } from './llm.js';
import fs from 'fs';
/**
 * Transcribes an audio file using Groq's whisper-large-v3 model.
 *
 * @param filePath The absolute path to the downloaded audio file
 * @returns The transcribed text
 */
export async function transcribeAudio(filePath) {
    try {
        const transcription = await groq.audio.transcriptions.create({
            file: fs.createReadStream(filePath),
            model: 'whisper-large-v3',
            prompt: 'El usuario está hablando en español.',
            response_format: 'json',
            language: 'es',
            temperature: 0.0
        });
        return transcription.text;
    }
    catch (error) {
        console.error('[Audio] Error transcribing audio with Groq:', error);
        throw new Error('No pude entender el mensaje de voz debido a un error de transcripción.');
    }
}
