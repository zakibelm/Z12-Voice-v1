import express from 'express';
import type { Response } from 'express';
import { generateJson, synthesize, GatewayError } from './openrouter.ts';

export const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));
app.use('/api', (_req, res, next) => { res.setHeader('Cache-Control', 'no-store'); next(); });

function sendError(res: Response, error: unknown) {
  res.status(error instanceof GatewayError ? error.status : 502).json({
    success: false, error: error instanceof GatewayError ? error.message : 'La génération a échoué. Réessayez.',
  });
}

app.get('/api/health', (_req, res) => {
  const missing = ['OPENROUTER_API_KEY', 'OPENROUTER_TEXT_MODEL', 'OPENROUTER_TTS_MODEL', 'OPENROUTER_TTS_VOICE']
    .filter(name => !process.env[name]?.trim());
  res.json({ success: true, provider: 'openrouter', configured: missing.length === 0, missing });
});

app.post('/api/tts', async (req, res) => {
  try {
    const { text, voiceName = 'warm' } = req.body || {};
    if (typeof text !== 'string' || !text.trim() || text.length > 12000 || typeof voiceName !== 'string') {
      return res.status(400).json({ success: false, error: 'Texte requis (12 000 caractères maximum).' });
    }
    const cleanText = text.replace(/\[pause\s*([0-9.]+)s?\]/gi, '... ')
      .replace(/\[[^\]]+\]/g, ' ').replace(/\s+/g, ' ').trim();
    if (!cleanText) return res.status(400).json({ success: false, error: 'Texte vide après nettoyage.' });
    res.json({ success: true, ...await synthesize(cleanText, voiceName) });
  } catch (error) { sendError(res, error); }
});

// API: Polish, Enhance or Generate Voice-Over Script
app.post('/api/generate-script', async (req, res) => {
  try {
    const { prompt, dialect, tone, style, targetDurationSeconds, language } = req.body;

    const systemInstruction = `You are Z12 Voice v0, an elite AI voice-over director and audio scriptwriter.
Your task is to write or polish a high-impact voice-over script tailored for text-to-speech synthesis.
Requirements:
1. Include natural breath and cadence cues using brackets: [pause 0.5s], [breath], [emphasis], [whisper], [upbeat].
2. Adapt vocabulary, rhythm, and phrasing precisely to the chosen dialect (${dialect || 'Modern Standard'}) and tone (${tone || 'Professional Narration'}).
3. Target duration is roughly ${targetDurationSeconds || 30} seconds (approx 130-150 words per minute).
4. Output valid JSON with keys:
   - "title": a catchy title
   - "script": the ready-to-voice text with acoustic cues
   - "cleanText": the raw text without bracketed cues
   - "notes": director notes regarding pitch, emotion, and pace
   - "estimatedDurationSeconds": estimated seconds to read`;

    const parsed = await generateJson(`Request: ${prompt || 'Write a compelling intro voiceover for Z12 Voice v0'}.
Language: ${language || 'French/Arabic/English'}.
Dialect: ${dialect || 'Masri/Standard'}.
Tone: ${tone || 'Cinematic Narration'}.
Style: ${style || 'Broadcast Commercial'}.`, systemInstruction);
    res.json({ success: true, data: parsed });
  } catch (error) { sendError(res, error); }
});

// API: Dialect Adaptation (e.g. Saudi Khaliji, Moroccan Darija, Algerian, Tunisian, Egyptian, Shami, Fusha)
app.post('/api/dialect-adapt', async (req, res) => {
  try {
    const { text, targetDialect, sourceLanguage } = req.body;

    const systemInstruction = `You are Z12 Voice v0's elite dialectologist and native phonetic master.
Your goal is to faithfully convert the user's text into the authentic TARGET DIALECT.
Distinguish strictly between Arabic regional dialects:
1. Moroccan Darija (الدارجة المغربية):
   - Use authentic Moroccan words: "دابا" (now), "بزاف" (a lot/very), "مزيان" (good), "صافي" (alright/finish), "واخا" (ok), "كيدير لاباس" (how are you), "كاين" (there is), "غير بشوية" (slowly), "تبارك الله عليك".
2. Saudi Arabic / Khaliji (اللهجة السعودية النجدية والحجازية):
   - Use authentic Saudi phrasing: "هلا والله ومسهلا", "طال عمرك", "أبشر بسعدك", "شلونك عساك طيب", "يا بعد حيي", "ودنا نسولف", "ما شاء الله تبارك الرحمن".
3. Algerian Darja (الدارجة الجزائرية):
   - Use authentic Algerian words: "واش راك خويا", "صحا بزاف", "لاباس الحمد لله", "كاش جديد", "راك فاهم".
4. Tunisian Darija (الدارجة التونسية):
   - Use authentic Tunisian words: "شنوّا أحوالك", "برشا باهي", "يعيّشك يا غالي", "توّا توّا", "على كيف كيفك".
5. Egyptian Masri (اللهجة المصرية):
   - Use authentic Egyptian words: "إزيك يا باشا", "عامل إيه", "كويس جداً", "عايز أقلك", "يا فندم ده شغل عالي".
6. Levantine / Shami (اللهجة الشامية):
   - Use authentic Shami words: "شو الأخبار", "كيفك شو عامل", "كتير منيح", "تكرم عينك", "يسلموا إيديك".
7. Modern Standard Arabic with Tashkeel (العربية الفصحى بالتشكيل الكامل):
   - Add full grammatical diacritics (Harakat) for classical eloquence.

Output JSON with keys:
- "adaptedText": the text written natively in the target dialect with acoustic cues like [pause 0.5s]
- "cleanText": the dialect text without cues
- "phoneticText": phonetic transliteration guide
- "dialectLabel": human readable dialect name
- "culturalNotes": explanation of regional vocabulary choices used`;

    const parsed = await generateJson(`Adapt this text into ${targetDialect}:
Original Text: "${text}"`, systemInstruction);
    res.json({ success: true, data: parsed });
  } catch (error) { sendError(res, error); }
});

// API: Automatic Arabic Tashkeel (Diacritization)
app.post('/api/tashkeel-vocalize', async (req, res) => {
  try {
    const { text } = req.body;

    const systemInstruction = `You are an expert Arabic grammarian and phonetician for Z12 Voice v0.
Add accurate Arabic vowel diacritics (Tashkeel: Fatha, Damma, Kasra, Sukun, Shadda, Tanwin) to the input Arabic text according to classical grammar (Nahw and Sarf).
Ensure accurate end-of-word grammatical cases (I'rab) so text-to-speech engines pronounce every syllable flawlessly.
Output JSON:
{
  "vocalizedText": "النَّصُّ المَشْكُولُ كَامِلاً مَعَ الحَرَكَاتِ",
  "diacriticsCount": 42,
  "accuracyRating": "100% Classical Nahw"
}`;

    const parsed = await generateJson(`Add full Tashkeel (harakat) to this Arabic text:\n"${text}"`, systemInstruction);
    res.json({ success: true, data: parsed });
  } catch (error) { sendError(res, error); }
});

// API: Voice Cloning Acoustic Analysis
app.post('/api/voice-clone-analyze', async (req, res) => {
  try {
    const { voiceName, dialectCode, dialectLabel, gender, sampleText, durationSeconds } = req.body;

    const systemInstruction = `You are Z12 Voice v0's Neural Voice Cloning Acoustic Director.
Analyze this voice sample profile and generate an acoustic neural fingerprint description with realistic acoustic parameters.
Dialect: ${dialectLabel} (${dialectCode}). Gender: ${gender}. Sample Text: "${sampleText || ''}".
Output JSON:
{
  "voiceId": "clone-${Date.now()}",
  "name": "${voiceName || 'Custom Voice Clone'}",
  "f0FundamentalPitch": 125,
  "resonance": 88,
  "accentStrength": 95,
  "timbreDescription": "Warm, resonant vocal cords with distinct regional harmonic formants",
  "acousticProfile": {
    "formantF1": "550 Hz",
    "formantF2": "1750 Hz",
    "nasalRatio": "12%",
    "vocalFry": "Subtle low-end",
    "breathiness": "8%",
    "stability": 92
  },
  "recommendedSettings": {
    "pitch": 1.0,
    "rate": 1.0,
    "reverb": 0.08
  },
  "directorNotes": "Excellent harmonic density for broadcast synthesis."
}`;

    const parsed = await generateJson(`Generate acoustic voice clone profile for ${voiceName || 'New Voice'} in dialect ${dialectLabel}.`, systemInstruction);
    res.json({ success: true, data: parsed });
  } catch (error) { sendError(res, error); }
});

// API: Podcast Studio Multi-Speaker Generator
app.post('/api/podcast-generate', async (req, res) => {
  try {
    const { topic, episodeTitle, hostsCount, language, tone, durationMinutes } = req.body;

    const systemInstruction = `You are Z12 Voice v0's Master Podcast Producer.
Generate an engaging, natural multi-speaker podcast script for ${hostsCount || 2} distinct personalities:
Host 1 (e.g. Sami - Main interviewer, energetic, inquisitive)
Host 2 (e.g. Sarah - Deep domain expert, thoughtful, tech-savvy)
[Optional Guest/Host 3 (e.g. Dr. Omar - Visionary analyst)]

Requirements:
- Dialogue should feel authentic with interjections, conversational laughter cues like [laughs], brief agreements like [agree], and natural pauses.
- Output JSON format:
{
  "episodeTitle": "...",
  "summary": "...",
  "speakers": [
    { "id": "speaker-1", "name": "Sami", "role": "Host", "voicePersona": "Zaki Energetic", "avatarColor": "#06b6d4" },
    { "id": "speaker-2", "name": "Sarah", "role": "Co-host", "voicePersona": "Layla Warm", "avatarColor": "#10b981" }
  ],
  "dialogue": [
    { "speakerId": "speaker-1", "speakerName": "Sami", "text": "...", "emotion": "excited", "speed": 1.05 },
    { "speakerId": "speaker-2", "speakerName": "Sarah", "text": "...", "emotion": "thoughtful", "speed": 0.98 }
  ]
}`;

    const parsed = await generateJson(`Generate a podcast episode on topic: "${topic || 'The Future of AI Voice in 2026'}".
Episode Title: "${episodeTitle || 'Tech Horizon 2026'}".
Language: ${language || 'French / Arabic / English'}.
Tone: ${tone || 'Dynamic & Insightful'}.`, systemInstruction);
    res.json({ success: true, data: parsed });
  } catch (error) { sendError(res, error); }
});

// API: Audiobook Studio Analyzer & Summarizer
app.post('/api/audiobook-process', async (req, res) => {
  try {
    const { rawText, title, targetMode } = req.body; // targetMode: 'full-chapters' | 'summary-audio' | 'dramatic-adaptation'

    const systemInstruction = `You are Savio Studio-VO's Audiobook Director.
Analyze the provided text/book content and prepare it for audiobook narration.
Break into structured chapters, calculate word counts, provide a narrator mood/tone guide, and format with spoken-word cadence cues.
Output JSON:
{
  "bookTitle": "...",
  "authorOrSource": "...",
  "overallTone": "...",
  "suggestedVoice": "...",
  "summaryAudio": "...",
  "chapters": [
    {
      "chapterNumber": 1,
      "chapterTitle": "...",
      "narrationScript": "...",
      "pacing": "Moderate & reflective",
      "estimatedMinutes": 3
    }
  ]
}`;

    const parsed = await generateJson(`Process this text for Audiobook Studio (${targetMode || 'summary-audio'}):
Title: ${title || 'Document'}
Content:
${rawText?.slice(0, 12000) || 'Sample Chapter 1: The AI Renaissance of 2026.'}`, systemInstruction);
    res.json({ success: true, data: parsed });
  } catch (error) { sendError(res, error); }
});

// API: Transcript Studio Refinement
app.post('/api/transcribe-refine', async (req, res) => {
  try {
    const { transcript, outputFormat } = req.body; // 'podcast-script' | 'audiobook-chapter' | 'social-reels' | 'clean-article'

    const prompt = `You are Savio Studio-VO's Transcript Studio Engine.
Take this raw transcript and transform it into high-production ${outputFormat || 'podcast-script'}.
Raw Transcript:
"""${transcript}"""

Output JSON:
{
  "originalWordCount": ${transcript ? transcript.split(' ').length : 0},
  "refinedTitle": "...",
  "repurposedContent": "...",
  "highlights": ["point 1", "point 2"],
  "socialHook": "...",
  "formattedSubtitles": [
    { "start": "00:00:01", "end": "00:00:04", "text": "..." }
  ]
}`;

    const parsed = await generateJson(prompt);
    res.json({ success: true, data: parsed });
  } catch (error) { sendError(res, error); }
});


app.use('/api', (_req, res) => res.status(404).json({ success: false, error: 'Route inconnue.' }));
export default app;
