import { groq } from './llm.js';
import fs from 'fs';
import * as googleTTS from 'google-tts-api';

/**
 * Transcribes an audio file using Groq's whisper-large-v3 model.
 * 
 * @param filePath The absolute path to the downloaded audio file
 * @returns The transcribed text
 */
export async function transcribeAudio(filePath: string): Promise<string> {
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
  } catch (error) {
    console.error('[Audio] Error transcribing audio with Groq:', error);
    throw new Error('No pude entender el mensaje de voz debido a un error de transcripción.');
  }
}

/**
 * Synthesizes text into a voice buffer using Google TTS.
 * 
 * @param text The text to convert to speech
 * @returns A Buffer containing the audio data (mp3)
 */
export async function synthesizeVoice(text: string): Promise<Buffer> {
  try {
    // google-tts-api limits each request to 200 characters.
    // We use getAllAudioBase64 to handle longer texts automatically.
    const results = await googleTTS.getAllAudioBase64(text, {
      lang: 'es',
      slow: false,
      host: 'https://translate.google.com',
    });

    // Combine all chunks into a single buffer
    const buffers = results.map(result => Buffer.from(result.base64, 'base64'));
    return Buffer.concat(buffers);
  } catch (error) {
    console.error('[Audio] Error synthesizing voice with Google TTS:', error);
    throw new Error('No pude generar la respuesta de voz.');
  }
}
