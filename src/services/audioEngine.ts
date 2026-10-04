// Z12 Voice v0 - High-Fidelity Neural Audio Workstation Engine
// Powered by OpenRouter Speech + Web Audio API 24kHz Studio DSP

import type { AudioSettings, VoicePersona } from '../types/studio';
import { encodeWav } from './wav.ts';

export type SynthesisEngineStatus = 'idle' | 'synthesizing' | 'playing' | 'paused' | 'fallback' | 'error';

export interface AudioEngineStatusEvent {
  status: SynthesisEngineStatus;
  engine: 'openrouter' | 'browser-speech-fallback';
  voiceName?: string;
  duration?: number;
  error?: string;
}

class AudioEngineService {
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private bgmGainNode: GainNode | null = null;
  private voiceGainNode: GainNode | null = null;
  private masterGainNode: GainNode | null = null;
  private bassFilter: BiquadFilterNode | null = null;
  private trebleFilter: BiquadFilterNode | null = null;

  // Active playback state
  private currentSourceNode: AudioBufferSourceNode | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeaking: boolean = false;
  private isBgmPlaying: boolean = false;
  private bgmIntervalId: any = null;
  private playbackStartTime: number = 0;
  private playbackDuration: number = 0;
  private progressIntervalId: any = null;
  private activeStatus: SynthesisEngineStatus = 'idle';

  // Last synthesized real audio asset
  private lastAudioBlob: Blob | null = null;
  private lastAudioUrl: string | null = null;

  // In-memory cache for ultra-fast instant playback: key = `${voiceId}_${cleanText}_${rate}_${pitch}`
  private cache = new Map<string, { buffer: AudioBuffer; blob: Blob; url: string; duration: number }>();

  // Visualizer callbacks
  private onVisualizerUpdateCallbacks: ((freqData: Uint8Array, timeData: Uint8Array) => void)[] = [];
  private onStatusChangeCallbacks: ((status: AudioEngineStatusEvent) => void)[] = [];
  private animationFrameId: number | null = null;

  public initAudioContext(): AudioContext {
    if (!this.audioCtx || this.audioCtx.state === 'closed') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioContextClass();

      // Master Gain
      this.masterGainNode = this.audioCtx.createGain();
      this.masterGainNode.gain.setValueAtTime(1.0, this.audioCtx.currentTime);

      // Voice Gain
      this.voiceGainNode = this.audioCtx.createGain();
      this.voiceGainNode.gain.setValueAtTime(1.0, this.audioCtx.currentTime);

      // EQ: Low Shelf (Bass warmth)
      this.bassFilter = this.audioCtx.createBiquadFilter();
      this.bassFilter.type = 'lowshelf';
      this.bassFilter.frequency.setValueAtTime(220, this.audioCtx.currentTime);
      this.bassFilter.gain.setValueAtTime(0, this.audioCtx.currentTime);

      // EQ: High Shelf (Treble / air clarity)
      this.trebleFilter = this.audioCtx.createBiquadFilter();
      this.trebleFilter.type = 'highshelf';
      this.trebleFilter.frequency.setValueAtTime(3800, this.audioCtx.currentTime);
      this.trebleFilter.gain.setValueAtTime(0, this.audioCtx.currentTime);

      // BGM Gain
      this.bgmGainNode = this.audioCtx.createGain();
      this.bgmGainNode.gain.setValueAtTime(0.25, this.audioCtx.currentTime);

      // Analyser Node for Real-time Waveform and Frequency Bars
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;

      // Audio Graph routing:
      // Voice: VoiceSource -> Bass Filter -> Treble Filter -> Voice Gain -> Master Gain -> Analyser -> Destination
      this.bassFilter.connect(this.trebleFilter);
      this.trebleFilter.connect(this.voiceGainNode);
      this.voiceGainNode.connect(this.masterGainNode);

      // BGM: BGM Gain -> Master Gain
      this.bgmGainNode.connect(this.masterGainNode);

      // Master out
      this.masterGainNode.connect(this.analyser);
      this.analyser.connect(this.audioCtx.destination);

      this.startVisualizerLoop();
    }

    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    return this.audioCtx;
  }

  public getAnalyser(): AnalyserNode | null {
    if (!this.analyser) {
      this.initAudioContext();
    }
    return this.analyser;
  }

  public subscribeVisualizer(cb: (freqData: Uint8Array, timeData: Uint8Array) => void): () => void {
    this.onVisualizerUpdateCallbacks.push(cb);
    return () => {
      this.onVisualizerUpdateCallbacks = this.onVisualizerUpdateCallbacks.filter(c => c !== cb);
    };
  }

  public subscribeStatus(cb: (status: AudioEngineStatusEvent) => void): () => void {
    this.onStatusChangeCallbacks.push(cb);
    return () => {
      this.onStatusChangeCallbacks = this.onStatusChangeCallbacks.filter(c => c !== cb);
    };
  }

  private notifyStatus(event: AudioEngineStatusEvent) {
    this.activeStatus = event.status;
    for (const cb of this.onStatusChangeCallbacks) {
      cb(event);
    }
  }

  private startVisualizerLoop() {
    if (this.animationFrameId) return;

    const render = () => {
      if (this.analyser) {
        const bufferLength = this.analyser.frequencyBinCount;
        const freqData = new Uint8Array(bufferLength);
        const timeData = new Uint8Array(bufferLength);
        this.analyser.getByteFrequencyData(freqData);
        this.analyser.getByteTimeDomainData(timeData);

        for (const cb of this.onVisualizerUpdateCallbacks) {
          cb(freqData, timeData);
        }
      }
      this.animationFrameId = requestAnimationFrame(render);
    };

    render();
  }

  // --- Procedural Studio BGM Synthesizer ---
  public setBGM(trackId: string, volume: number = 0.3) {
    this.stopBGM();
    if (trackId === 'none') return;

    const ctx = this.initAudioContext();
    if (this.bgmGainNode) {
      this.bgmGainNode.gain.setValueAtTime(volume, ctx.currentTime);
    }

    this.isBgmPlaying = true;

    let chordFreqs: number[][] = [];
    let tempoMs = 1200;

    if (trackId === 'lofi') {
      chordFreqs = [
        [174.61, 220.0, 261.63, 329.63], // Fmaj7
        [220.0, 261.63, 329.63, 392.0],  // Am7
        [146.83, 220.0, 261.63, 329.63], // Dm7
        [196.0, 246.94, 293.66, 349.23]  // G7
      ];
      tempoMs = 1800;
    } else if (trackId === 'ambient') {
      chordFreqs = [
        [130.81, 196.0, 261.63, 392.0],
        [164.81, 246.94, 329.63, 493.88],
        [110.0, 164.81, 220.0, 329.63]
      ];
      tempoMs = 2800;
    } else if (trackId === 'tech') {
      chordFreqs = [
        [110.0, 220.0, 277.18, 329.63],
        [123.47, 246.94, 293.66, 369.99],
        [98.0, 196.0, 246.94, 293.66]
      ];
      tempoMs = 1100;
    } else {
      chordFreqs = [
        [146.83, 174.61, 220.0, 261.63],
        [164.81, 196.0, 246.94, 293.66],
        [130.81, 164.81, 196.0, 261.63]
      ];
      tempoMs = 1600;
    }

    let chordIdx = 0;

    const playChord = () => {
      if (!this.isBgmPlaying || !this.audioCtx || !this.bgmGainNode) return;
      const notes = chordFreqs[chordIdx % chordFreqs.length];
      chordIdx++;

      notes.forEach((freq) => {
        try {
          const osc = ctx.createOscillator();
          const noteGain = ctx.createGain();
          const filter = ctx.createBiquadFilter();

          osc.type = trackId === 'ambient' ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(trackId === 'ambient' ? 650 : 1200, ctx.currentTime);

          const dur = tempoMs / 1000;
          noteGain.gain.setValueAtTime(0.001, ctx.currentTime);
          noteGain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + dur * 0.2);
          noteGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur * 0.95);

          osc.connect(filter);
          filter.connect(noteGain);
          noteGain.connect(this.bgmGainNode!);

          osc.start();
          osc.stop(ctx.currentTime + dur);
        } catch {
          // ignore
        }
      });
    };

    playChord();
    this.bgmIntervalId = setInterval(playChord, tempoMs);
  }

  public stopBGM() {
    this.isBgmPlaying = false;
    if (this.bgmIntervalId) {
      clearInterval(this.bgmIntervalId);
      this.bgmIntervalId = null;
    }
  }

  public setBGMVolume(vol: number) {
    if (this.bgmGainNode && this.audioCtx) {
      this.bgmGainNode.gain.setValueAtTime(vol, this.audioCtx.currentTime);
    }
  }

  // --- Voice Synthesis Engine ---
  public cleanAcousticCues(text: string): string {
    return text.replace(/\[[^\]]+\]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  /**
   * Main synthesis method:
   * 1. Uses OpenRouter Speech API for lifelike, natural human speech.
   * 2. Routes decoded provider audio through Web Audio DSP (EQ, Compressor, Analyser).
   * 3. Reports provider errors without substituting a different voice.
   */
  public async speak(
    text: string,
    voice: VoicePersona,
    settings: AudioSettings,
    onProgress?: (progress: number, charIndex: number) => void,
    onEnd?: () => void
  ): Promise<void> {
    this.stopSpeaking();
    this.lastAudioBlob = null;
    this.lastAudioUrl = null;
    const ctx = this.initAudioContext();

    const cleanText = this.cleanAcousticCues(text);
    if (!cleanText) {
      if (onEnd) onEnd();
      return;
    }

    // Determine target neural voice: 'baritone', 'warm', 'energetic', 'textured', 'bright'
    const neuralVoiceName = voice.neuralVoice || (voice.gender === 'female' ? 'warm' : 'baritone');
    const cacheKey = `${voice.id}_${neuralVoiceName}_${cleanText}`;

    // Apply EQ and Volume settings to Web Audio graph
    if (this.bassFilter) {
      this.bassFilter.gain.setValueAtTime(settings.eqBass || 0, ctx.currentTime);
    }
    if (this.trebleFilter) {
      this.trebleFilter.gain.setValueAtTime(settings.eqTreble || 0, ctx.currentTime);
    }
    if (this.voiceGainNode) {
      this.voiceGainNode.gain.setValueAtTime(settings.volume ?? 1.0, ctx.currentTime);
    }

    // Attempt neural synthesis
    try {
      this.notifyStatus({
        status: 'synthesizing',
        engine: 'openrouter',
        voiceName: neuralVoiceName
      });

      let audioData = this.cache.get(cacheKey);

      if (!audioData) {
        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: cleanText,
            voiceName: neuralVoiceName,
            dialectCode: voice.dialectCode,
            languageCode: voice.languageCode,
            tone: 'natural'
          })
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `Server returned ${response.status}`);
        }

        const data = await response.json();
        if (!data.success || !data.audioBase64) {
          throw new Error(data.error || 'Failed to synthesize audio');
        }

        // Decode the provider MP3 and export the actual audio as WAV
        const binaryString = atob(data.audioBase64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        const audioBuffer = await ctx.decodeAudioData(bytes.buffer.slice(0));
        const audioBlob = encodeWav(audioBuffer);
        const audioUrl = URL.createObjectURL(audioBlob);

        audioData = {
          buffer: audioBuffer,
          blob: audioBlob,
          url: audioUrl,
          duration: audioBuffer.duration
        };

        this.cache.set(cacheKey, audioData);
      }

      // Store current active audio asset for downloads
      this.lastAudioBlob = audioData.blob;
      this.lastAudioUrl = audioData.url;

      this.notifyStatus({
        status: 'playing',
        engine: 'openrouter',
        voiceName: neuralVoiceName,
        duration: audioData.duration
      });
      await this.playAudioBuffer(audioData.buffer, settings, cleanText, onProgress, onEnd);

    } catch (err: any) {
      this.notifyStatus({ status: 'error', engine: 'openrouter', error: err?.message || 'Synthèse indisponible.' });
      if (onEnd) onEnd();
    }
  }

  private playAudioBuffer(
    buffer: AudioBuffer,
    settings: AudioSettings,
    cleanText: string,
    onProgress?: (progress: number, charIndex: number) => void,
    onEnd?: () => void
  ): Promise<void> {
    return new Promise((resolve) => {
      const ctx = this.initAudioContext();

      // Duck BGM
      if (this.isBgmPlaying && this.bgmGainNode && this.audioCtx) {
        const duckedVol = (settings.bgmVolume || 0.3) * (1 - (settings.ducking || 0.6));
        this.bgmGainNode.gain.setTargetAtTime(duckedVol, ctx.currentTime, 0.2);
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.playbackRate.setValueAtTime(settings.rate || 1.0, ctx.currentTime);

      // Connect source to Bass Filter (the start of our voice DSP chain)
      if (this.bassFilter) {
        source.connect(this.bassFilter);
      } else if (this.masterGainNode) {
        source.connect(this.masterGainNode);
      } else {
        source.connect(ctx.destination);
      }

      this.currentSourceNode = source;
      this.isSpeaking = true;
      this.playbackStartTime = ctx.currentTime;
      this.playbackDuration = buffer.duration / (settings.rate || 1.0);

      // Real-time progress updater
      if (this.progressIntervalId) clearInterval(this.progressIntervalId);
      this.progressIntervalId = setInterval(() => {
        if (!this.isSpeaking || !this.audioCtx) return;
        const elapsed = this.audioCtx.currentTime - this.playbackStartTime;
        const pct = Math.min(100, Math.round((elapsed / this.playbackDuration) * 100));
        const estimatedChar = Math.min(cleanText.length, Math.floor((pct / 100) * cleanText.length));

        if (onProgress) {
          onProgress(pct, estimatedChar);
        }
      }, 50);

      source.onended = () => {
        if (this.progressIntervalId) {
          clearInterval(this.progressIntervalId);
          this.progressIntervalId = null;
        }
        this.isSpeaking = false;
        this.currentSourceNode = null;

        // Restore BGM volume
        if (this.isBgmPlaying && this.bgmGainNode && this.audioCtx) {
          this.bgmGainNode.gain.setTargetAtTime(settings.bgmVolume || 0.3, this.audioCtx.currentTime, 0.4);
        }

        this.notifyStatus({ status: 'idle', engine: 'openrouter' });

        if (onProgress) {
          onProgress(100, cleanText.length);
        }
        if (onEnd) {
          onEnd();
        }
        resolve();
      };

      source.start(0);
    });
  }

  private speakWithBrowserFallback(
    cleanText: string,
    voice: VoicePersona,
    settings: AudioSettings,
    onProgress?: (progress: number, charIndex: number) => void,
    onEnd?: () => void
  ) {
    if (!('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }

    // Duck BGM
    if (this.isBgmPlaying && this.bgmGainNode && this.audioCtx) {
      const duckedVol = (settings.bgmVolume || 0.3) * (1 - (settings.ducking || 0.6));
      this.bgmGainNode.gain.setTargetAtTime(duckedVol, this.audioCtx.currentTime, 0.2);
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    this.currentUtterance = utterance;
    this.isSpeaking = true;

    utterance.rate = Math.max(0.6, Math.min(1.8, (voice.defaultRate || 1.0) * (settings.rate || 1.0)));
    utterance.pitch = Math.max(0.6, Math.min(1.6, (voice.defaultPitch || 1.0) * (settings.pitch || 1.0)));
    utterance.volume = settings.volume || 1.0;

    const availableVoices = window.speechSynthesis.getVoices();
    const matchedVoice = this.pickMatchingVoice(availableVoices, voice);
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onboundary = (e) => {
      if (onProgress && cleanText.length > 0) {
        const pct = Math.min(100, Math.round((e.charIndex / cleanText.length) * 100));
        onProgress(pct, e.charIndex);
      }
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.currentUtterance = null;
      if (this.isBgmPlaying && this.bgmGainNode && this.audioCtx) {
        this.bgmGainNode.gain.setTargetAtTime(settings.bgmVolume || 0.3, this.audioCtx.currentTime, 0.4);
      }
      this.notifyStatus({ status: 'idle', engine: 'browser-speech-fallback' });
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      this.currentUtterance = null;
      this.notifyStatus({ status: 'idle', engine: 'browser-speech-fallback' });
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
  }

  public stopSpeaking() {
    if (this.progressIntervalId) {
      clearInterval(this.progressIntervalId);
      this.progressIntervalId = null;
    }

    if (this.currentSourceNode) {
      try {
        this.currentSourceNode.stop();
        this.currentSourceNode.disconnect();
      } catch {
        // ignore
      }
      this.currentSourceNode = null;
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    this.isSpeaking = false;
    this.currentUtterance = null;
    this.notifyStatus({ status: 'idle', engine: 'openrouter' });

    // Restore BGM volume if ducked
    if (this.isBgmPlaying && this.bgmGainNode && this.audioCtx) {
      this.bgmGainNode.gain.setTargetAtTime(0.25, this.audioCtx.currentTime, 0.2);
    }
  }

  public pauseSpeaking() {
    if (this.audioCtx && this.currentSourceNode && this.audioCtx.state === 'running') {
      this.audioCtx.suspend();
      this.notifyStatus({ status: 'paused', engine: 'openrouter' });
    } else if ('speechSynthesis' in window && this.isSpeaking) {
      window.speechSynthesis.pause();
    }
  }

  public resumeSpeaking() {
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
      this.notifyStatus({ status: 'playing', engine: 'openrouter' });
    } else if ('speechSynthesis' in window) {
      window.speechSynthesis.resume();
    }
  }

  public getLastAudioBlob(): Blob | null {
    return this.lastAudioBlob;
  }

  public getLastAudioUrl(): string | null {
    return this.lastAudioUrl;
  }

  private pickMatchingVoice(
    voices: SpeechSynthesisVoice[],
    persona: VoicePersona
  ): SpeechSynthesisVoice | null {
    if (!voices || voices.length === 0) return null;

    const exactLang = voices.filter(v => v.lang.toLowerCase() === persona.languageCode.toLowerCase());
    if (exactLang.length > 0) {
      if (persona.gender === 'female') {
        const f = exactLang.find(v => /female|layla|nour|amira|chloe|elena|claire/i.test(v.name));
        if (f) return f;
      } else if (persona.gender === 'male') {
        const m = exactLang.find(v => /male|ahmed|tarek|yacine|antoine|marcus|david/i.test(v.name));
        if (m) return m;
      }
      return exactLang[0];
    }

    const langPrefix = persona.languageCode.split('-')[0].toLowerCase();
    const prefixMatches = voices.filter(v => v.lang.toLowerCase().startsWith(langPrefix));
    if (prefixMatches.length > 0) {
      return prefixMatches[0];
    }

    return voices.find(v => v.default) || voices[0] || null;
  }

  // Export only the audio matching the requested text and voice.
  public generateWavFile(text: string, voice: VoicePersona, _durationSec = 5): Blob | null {
    const timbre = voice.neuralVoice || (voice.gender === 'female' ? 'warm' : 'baritone');
    return this.cache.get(`${voice.id}_${timbre}_${this.cleanAcousticCues(text)}`)?.blob || null;
  }

  // --- Subtitles Exporter (SRT format) ---
  public generateSRT(lines: { text: string; durationSec: number }[]): string {
    let srt = '';
    let currentTimeSec = 0;

    lines.forEach((item, index) => {
      const startSec = currentTimeSec;
      const endSec = currentTimeSec + item.durationSec;
      currentTimeSec = endSec + 0.2;

      const formatTime = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        const millis = Math.floor((seconds % 1) * 1000);
        return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(millis).padStart(3, '0')}`;
      };

      srt += `${index + 1}\n`;
      srt += `${formatTime(startSec)} --> ${formatTime(endSec)}\n`;
      srt += `${this.cleanAcousticCues(item.text)}\n\n`;
    });

    return srt;
  }
}

export const audioEngine = new AudioEngineService();
