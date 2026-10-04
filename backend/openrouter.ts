const API = 'https://openrouter.ai/api/v1';

export class GatewayError extends Error {
  status: number;
  constructor(message: string, status = 502) { super(message); this.status = status; }
}

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new GatewayError(`Configuration requise : ${name}.`, 503);
  return value;
}

async function request(path: string, body: unknown): Promise<Response> {
  const key = required('OPENROUTER_API_KEY');
  let response: Response;
  try {
    response = await fetch(`${API}/${path}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json',
        'X-OpenRouter-Title': 'Z12 Voice' },
      body: JSON.stringify(body), signal: AbortSignal.timeout(50_000), redirect: 'error',
    });
  } catch {
    throw new GatewayError('OpenRouter est indisponible ou le délai est dépassé.', 504);
  }
  if (!response.ok) {
    // Provider error bodies can contain user text or credentials. Never relay them.
    await response.body?.cancel();
    throw new GatewayError(`OpenRouter a refusé la requête (HTTP ${response.status}).`, response.status === 429 ? 429 : 502);
  }
  return response;
}

export async function generateJson(content: string, system?: string) {
  const model = required('OPENROUTER_TEXT_MODEL');
  const response = await request('chat/completions', {
    model, messages: [...(system ? [{ role: 'system', content: system }] : []), { role: 'user', content }],
    response_format: { type: 'json_object' }, stream: false,
  });
  try {
    const result = await response.json();
    if (result.error || result.choices?.[0]?.finish_reason !== 'stop') throw new Error();
    const value = JSON.parse(result.choices[0].message.content);
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error();
    return value;
  } catch { throw new GatewayError('OpenRouter a renvoyé une réponse JSON incomplète ou invalide.'); }
}

export function resolveVoice(profile: string): string {
  let voices: Record<string, string> = {};
  try {
    voices = JSON.parse(process.env.OPENROUTER_VOICE_MAP || '{}');
    if (!voices || typeof voices !== 'object' || Array.isArray(voices) ||
        Object.values(voices).some(v => typeof v !== 'string' || !v.trim())) throw new Error();
  } catch { throw new GatewayError('OPENROUTER_VOICE_MAP doit être un objet JSON de timbres.', 503); }
  if (Object.hasOwn(voices, profile)) return voices[profile];
  return required('OPENROUTER_TTS_VOICE');
}

export async function synthesize(text: string, profile: string) {
  const model = required('OPENROUTER_TTS_MODEL');
  const voice = resolveVoice(profile);
  const response = await request('audio/speech', { model, input: text, voice, response_format: 'mp3' });
  if (!/^audio\/(mpeg|mp3)(;|$)/i.test(response.headers.get('content-type') || '')) {
    await response.body?.cancel();
    throw new GatewayError('Le fournisseur n’a pas renvoyé le format MP3 demandé.');
  }
  // Stay below Vercel's function response limit after base64 JSON encoding.
  const reader = response.body?.getReader();
  if (!reader) throw new GatewayError('Réponse audio vide.');
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > 3_000_000) {
        await reader.cancel();
        throw new GatewayError('Audio trop volumineux : découpez le texte en segments.', 413);
      }
      chunks.push(value);
    }
  } catch (error) {
    if (error instanceof GatewayError) throw error;
    throw new GatewayError('Le transfert audio OpenRouter a été interrompu.', 504);
  }
  if (!size) throw new GatewayError('Réponse audio vide.');
  return { audioBase64: Buffer.concat(chunks).toString('base64'), mimeType: 'audio/mpeg', voiceUsed: voice, model, engine: 'openrouter' };
}
