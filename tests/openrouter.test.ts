import assert from 'node:assert/strict';
import { test } from 'node:test';
import { app } from '../backend/app.ts';
import { generateJson, synthesize, resolveVoice } from '../backend/openrouter.ts';
import { encodeWav } from '../src/services/wav.ts';

test('OpenRouter routes and failure handling', async t => {
  const originalFetch = globalThis.fetch;
  const keys = ['OPENROUTER_API_KEY', 'OPENROUTER_TEXT_MODEL', 'OPENROUTER_TTS_MODEL', 'OPENROUTER_TTS_VOICE', 'OPENROUTER_VOICE_MAP'];
  const saved = Object.fromEntries(keys.map(k => [k, process.env[k]]));
  Object.assign(process.env, { OPENROUTER_API_KEY: 'test-secret', OPENROUTER_TEXT_MODEL: 'test/text', OPENROUTER_TTS_MODEL: 'test/speech', OPENROUTER_TTS_VOICE: 'test-voice', OPENROUTER_VOICE_MAP: '{"warm":"warm-id"}' });
  const requests: Array<{ url: string; body: any }> = [];
  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server.once('listening', resolve));
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  const base = `http://127.0.0.1:${address.port}`;
  try {
    globalThis.fetch = async (input, init) => {
      assert.equal((init?.headers as Record<string, string>).Authorization, 'Bearer test-secret');
      assert.equal(init?.redirect, 'error');
      assert.ok(init?.signal);
      requests.push({ url: String(input), body: JSON.parse(String(init?.body)) });
      if (String(input).endsWith('/audio/speech')) return new Response(new Uint8Array([73, 68, 51, 1, 2]), { headers: { 'content-type': 'audio/mpeg' } });
      return Response.json({ choices: [{ finish_reason: 'stop', message: { content: '{"script":"bonjour"}' } }] });
    };
    await t.test('all seven text routes use configured model and preserve response envelope', async () => {
      for (const route of ['generate-script', 'dialect-adapt', 'tashkeel-vocalize', 'voice-clone-analyze', 'podcast-generate', 'audiobook-process', 'transcribe-refine']) {
        const response = await originalFetch(`${base}/api/${route}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: 'bonjour', transcript: 'bonjour', prompt: 'bonjour' }) });
        assert.equal(response.status, 200, route);
        assert.deepEqual(await response.json(), { success: true, data: { script: 'bonjour' } });
        assert.equal(requests.at(-1)!.url, 'https://openrouter.ai/api/v1/chat/completions');
        assert.equal(requests.at(-1)!.body.model, 'test/text');
        assert.equal(requests.at(-1)!.body.response_format.type, 'json_object');
      }
    });
    await t.test('speech maps profiles and preserves MP3 bytes without assumed sample rate', async () => {
      const response = await originalFetch(`${base}/api/tts`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: 'Bonjour [pause 0.5s] ami', voiceName: 'warm' }) });
      const result = await response.json();
      assert.equal(response.status, 200);
      assert.equal(result.mimeType, 'audio/mpeg');
      assert.deepEqual([...Buffer.from(result.audioBase64, 'base64')], [73, 68, 51, 1, 2]);
      assert.equal(result.sampleRate, undefined);
      assert.deepEqual(requests.at(-1), { url: 'https://openrouter.ai/api/v1/audio/speech', body: { model: 'test/speech', input: 'Bonjour ... ami', voice: 'warm-id', response_format: 'mp3' } });
      assert.equal(resolveVoice('baritone'), 'test-voice');
      assert.equal(resolveVoice('__proto__'), 'test-voice');
    });
    await t.test('missing model returns 503 without provider call or fake success', async () => {
      delete process.env.OPENROUTER_TEXT_MODEL;
      const before = requests.length;
      const response = await originalFetch(`${base}/api/generate-script`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
      assert.equal(response.status, 503);
      assert.equal((await response.json()).success, false);
      assert.equal(requests.length, before);
      process.env.OPENROUTER_TEXT_MODEL = 'test/text';
      assert.ok(!(await (await originalFetch(`${base}/api/health`)).text()).includes('test-secret'));
    });
    await t.test('provider errors, truncated JSON and non-audio responses are rejected', async () => {
      globalThis.fetch = async () => new Response('test-secret private details', { status: 401 });
      await assert.rejects(generateJson('hi'), e => e instanceof Error && /HTTP 401/.test(e.message) && !/secret/.test(e.message));
      globalThis.fetch = async () => Response.json({ choices: [{ finish_reason: 'length', message: { content: '{}' } }] });
      await assert.rejects(generateJson('hi'), /incomplète/);
      globalThis.fetch = async () => Response.json({ error: { message: 'bad audio' } });
      await assert.rejects(synthesize('hi', 'warm'), /MP3/);
    });
    await t.test('empty and oversized speech are rejected', async () => {
      globalThis.fetch = async () => new Response(new Uint8Array(), { headers: { 'content-type': 'audio/mpeg' } });
      await assert.rejects(synthesize('hi', 'warm'), /vide/);
      globalThis.fetch = async () => new Response(new Uint8Array(3_000_001), { headers: { 'content-type': 'audio/mpeg' } });
      await assert.rejects(synthesize('hi', 'warm'), /volumineux/);
    });
  } finally {
    globalThis.fetch = originalFetch;
    for (const key of keys) { if (saved[key] === undefined) delete process.env[key]; else process.env[key] = saved[key]; }
    await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }
});

test('WAV export keeps actual sample rate, channels and sample data', async () => {
  const blob = encodeWav({ numberOfChannels: 2, sampleRate: 48000, length: 2,
    getChannelData: i => new Float32Array(i ? [0.5, -0.5] : [1, -1]) });
  const bytes = Buffer.from(await blob.arrayBuffer());
  assert.equal(blob.type, 'audio/wav');
  assert.equal(bytes.readUInt32LE(24), 48000);
  assert.equal(bytes.readUInt16LE(22), 2);
  assert.equal(bytes.readUInt32LE(40), 8);
  assert.equal(bytes.readInt16LE(44), 32767);
  assert.equal(bytes.readInt16LE(48), -32768);
});
