export type StudioTab = 'studio-vo' | 'voice-clone' | 'podcast' | 'audiobook' | 'transcript' | 'mixer';

export type LanguageCode = 'fr' | 'ar' | 'en';

export interface ClonedVoice {
  id: string;
  name: string;
  sourceType: 'microphone' | 'upload';
  audioSampleUrl?: string;
  sampleDuration: number;
  dialectCode: string;
  dialectLabel: string;
  countryFlag: string;
  gender: 'male' | 'female' | 'neutral';
  toneQuality: string;
  f0FundamentalPitch: number; // in Hz or relative
  resonance: number;          // 0 to 100
  accentStrength: number;     // 0 to 100
  sampleText: string;
  createdAt: string;
  isCustomClone: boolean;
}

export interface VoicePersona {
  id: string;
  name: string;
  nativeName?: string;
  gender: 'male' | 'female' | 'neutral';
  language: string;
  languageCode: string;
  dialect: string;
  dialectCode: string;
  tag: string;
  description: string;
  defaultPitch: number;
  defaultRate: number;
  avatarColor: string;
  accentBadge: string;
  sampleText: string;
  proFeatures?: string[];
  isCloned?: boolean;
  clonedVoiceData?: ClonedVoice;
  countryFlag?: string;
  dialectKeywords?: string[];
  neuralVoice?: 'energetic' | 'baritone' | 'warm' | 'textured' | 'bright';
}

export interface DialectOption {
  code: string;
  label: string;
  nativeLabel: string;
  region: string;
  flag: string;
  samplePhrase: string;
  description: string;
}

export interface TonePreset {
  id: string;
  label: string;
  iconName: string;
  description: string;
  pitchOffset: number;
  rateOffset: number;
  reverbBoost: number;
  stability: number;
}

export interface PodcastSpeaker {
  id: string;
  name: string;
  role: string;
  voiceId: string;
  color: string;
}

export interface PodcastLine {
  id: string;
  speakerId: string;
  text: string;
  emotion: string;
  speed: number;
  pauseAfter: number;
}

export interface AudiobookChapter {
  id: string;
  number: number;
  title: string;
  script: string;
  wordCount: number;
  estimatedMinutes: number;
  voiceId: string;
  status: 'draft' | 'synthesized' | 'rendering';
}

export interface AudioSettings {
  rate: number;          // 0.5 to 2.0
  pitch: number;         // -10 to +10 (or 0.5 to 1.5)
  volume: number;        // 0 to 1
  stability: number;     // 0 to 100
  expressiveness: number;// 0 to 100
  reverb: number;        // 0 to 1
  eqBass: number;        // -10 to +10 dB
  eqTreble: number;      // -10 to +10 dB
  bgmTrack: string;      // 'none' | 'lofi' | 'ambient' | 'tech' | 'lounge'
  bgmVolume: number;     // 0 to 1
  ducking: number;       // 0.1 to 0.9 (ducking factor when voice speaks)
}

export interface TranscriptEntry {
  id: string;
  start: string;
  end: string;
  speaker: string;
  text: string;
}
