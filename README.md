# Z12 Voice — OpenRouter

React/Vite voice workstation with an Express API. All eight AI routes use
server-side OpenRouter HTTPS calls. No provider SDK or browser API key.
Model selection is deliberately deferred.

## Setup

Node 22.18+ or 24. Run pnpm install --frozen-lockfile, copy .env.example to .env,
then set OPENROUTER_API_KEY, OPENROUTER_TEXT_MODEL, OPENROUTER_TTS_MODEL and
OPENROUTER_TTS_VOICE. Choose a JSON-capable text model and a Speech API model
supporting MP3 output. OPENROUTER_VOICE_MAP optionally maps the neutral profiles
baritone, warm, energetic, textured and bright to supported provider voice IDs.
Unmapped profiles use the default voice; they do not imply distinct timbres.

Run pnpm dev. Verify with pnpm lint, pnpm test and pnpm build.
GET /api/health reports missing configuration names, never secret values.
Unconfigured AI operations return 503; no model is silently chosen.

## Vercel Preview

Import this branch into Vercel using the Vite preset, or run vercel deploy.
vercel.json builds dist, while api/[...path].ts serves the Express API.
Configure the environment variables for Preview and redeploy after changes.
Keep Vercel Deployment Protection enabled for this test preview: this application
has no account authentication. No API key belongs in Git, the browser or chat.
The UI is testable without models; real generation requires their configuration.

## Audio and limits

Speech arrives as MP3, decoded by the browser and exported as real PCM16 WAV
with the decoded sample rate/channels. No fixed sample-rate assumption or
fabricated waveform. No automatic browser voice substitution on API failure.
WAV export requires matching generated audio. Combined podcast export needs
an actual full render; exporting its last spoken line as a full episode is blocked.

Personas and dialect samples are presets, not measured quality results. Accuracy,
accent and emotion depend on the model/voice and need listening tests.
The existing voice-profile screen generates text suggestions from metadata;
it does not train or clone a voice from the recording. Transcript Studio refines
supplied text; no audio STT endpoint is implemented.

References:
- https://openrouter.ai/docs/guides/overview/multimodal/tts
- https://vercel.com/docs/functions
