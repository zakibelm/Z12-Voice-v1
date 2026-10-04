import React, { useState, useEffect } from 'react';
import { VoicePersona, DialectOption, TonePreset, AudioSettings, LanguageCode, ClonedVoice } from '../../types/studio';
import { VOICES, DIALECTS, TONE_PRESETS, DIALECT_EXPRESSIONS } from '../../data/voices';
import { audioEngine, AudioEngineStatusEvent } from '../../services/audioEngine';
import { 
  Play, 
  Square, 
  Download, 
  Sparkles, 
  Wand2, 
  Volume2, 
  Gauge, 
  Check, 
  Copy, 
  FileDown, 
  RefreshCw,
  SlidersHorizontal,
  Flame,
  Languages,
  Dna,
  BookOpen,
  ArrowRight,
  Plus,
  Cpu,
  Mic2
} from 'lucide-react';

interface StudioVOViewProps {
  language: LanguageCode;
  audioSettings: AudioSettings;
  onUpdateAudioSettings: (newSettings: Partial<AudioSettings>) => void;
  onSpeakStatusChange: (isSpeaking: boolean) => void;
  clonedVoices?: ClonedVoice[];
  onNavigateToClone?: () => void;
  selectedVoiceIdOverride?: string | null;
}

export const StudioVOView: React.FC<StudioVOViewProps> = ({
  language,
  audioSettings,
  onUpdateAudioSettings,
  onSpeakStatusChange,
  clonedVoices = [],
  onNavigateToClone,
  selectedVoiceIdOverride
}) => {
  const [selectedDialect, setSelectedDialect] = useState<DialectOption>(DIALECTS[0]); // default Saudi ar-SA
  const [selectedVoice, setSelectedVoice] = useState<VoicePersona>(VOICES[0]);
  const [selectedTone, setSelectedTone] = useState<TonePreset>(TONE_PRESETS[0]);
  const [voiceFilterTab, setVoiceFilterTab] = useState<'all' | 'dialect' | 'clones'>('all');
  
  const [scriptText, setScriptText] = useState<string>(
    "هلا والله ومسهلا بكم في زد 12 فويس (Z12 Voice v0). [pause 0.5s] أقوى منظومة صوتية بالذكاء الاصطناعي مع تحكم فائق في اللهجات الإقليمية من السعودية والدارجة المغربية والمصرية. [emphasis] صوتك المستقبلي يبدأ هنا."
  );
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [speechProgress, setSpeechProgress] = useState(0);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [isAdaptingDialect, setIsAdaptingDialect] = useState(false);
  const [isVocalizingTashkeel, setIsVocalizingTashkeel] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showAcousticPanel, setShowAcousticPanel] = useState(true);
  const [showDialectTransmuter, setShowDialectTransmuter] = useState(false);

  // Neural Engine status and Timbre Override
  const [engineEvent, setEngineEvent] = useState<AudioEngineStatusEvent>({
    status: 'idle',
    engine: 'openrouter'
  });
  const [selectedNeuralTimbre, setSelectedNeuralTimbre] = useState<'default' | 'baritone' | 'warm' | 'energetic' | 'textured' | 'bright'>('default');

  // Subscribe to audio engine status
  useEffect(() => {
    const unsub = audioEngine.subscribeStatus((ev) => {
      setEngineEvent(ev);
    });
    return unsub;
  }, []);

  // If a cloned voice is selected from outside, set it
  React.useEffect(() => {
    if (selectedVoiceIdOverride) {
      const foundClone = clonedVoices.find(c => c.id === selectedVoiceIdOverride);
      if (foundClone) {
        const persona: VoicePersona = {
          id: foundClone.id,
          name: foundClone.name,
          nativeName: foundClone.name,
          gender: foundClone.gender,
          language: foundClone.dialectLabel,
          languageCode: foundClone.dialectCode,
          dialect: foundClone.dialectLabel,
          dialectCode: foundClone.dialectCode,
          countryFlag: foundClone.countryFlag,
          tag: 'Clone IA',
          description: foundClone.toneQuality,
          defaultPitch: foundClone.gender === 'female' ? 1.08 : 0.94,
          defaultRate: 1.0,
          avatarColor: 'from-cyan-500 to-indigo-600',
          accentBadge: `${foundClone.countryFlag} Clone`,
          sampleText: foundClone.sampleText,
          isCloned: true,
          clonedVoiceData: foundClone
        };
        setSelectedVoice(persona);
        const matchingDialect = DIALECTS.find(d => d.code === foundClone.dialectCode);
        if (matchingDialect) setSelectedDialect(matchingDialect);
      }
    }
  }, [selectedVoiceIdOverride, clonedVoices]);

  // Combine standard VOICES with Cloned Voices as personas
  const allPersonas: VoicePersona[] = [
    ...VOICES,
    ...clonedVoices.map(c => ({
      id: c.id,
      name: c.name,
      nativeName: c.name,
      gender: c.gender,
      language: c.dialectLabel,
      languageCode: c.dialectCode,
      dialect: c.dialectLabel,
      dialectCode: c.dialectCode,
      countryFlag: c.countryFlag,
      tag: 'Clone IA Perso',
      description: `${c.toneQuality} • F0: ${c.f0FundamentalPitch}Hz`,
      defaultPitch: c.gender === 'female' ? 1.06 : 0.94,
      defaultRate: 1.0,
      avatarColor: 'from-cyan-400 via-emerald-500 to-indigo-700',
      accentBadge: `${c.countryFlag} Clone`,
      sampleText: c.sampleText,
      isCloned: true,
      clonedVoiceData: c
    }))
  ];

  // Filter voices based on tab and dialect
  const filteredVoices = allPersonas.filter(v => {
    if (voiceFilterTab === 'clones') return v.isCloned;
    if (voiceFilterTab === 'dialect') {
      if (selectedDialect.code === 'ar-SA') return v.languageCode === 'ar-SA';
      if (selectedDialect.code === 'ar-MA') return v.languageCode === 'ar-MA';
      if (selectedDialect.code === 'ar-DZ') return v.languageCode === 'ar-DZ';
      if (selectedDialect.code === 'ar-TN') return v.languageCode === 'ar-TN';
      if (selectedDialect.code === 'ar-EG') return v.languageCode === 'ar-EG';
      if (selectedDialect.code === 'ar-SY') return v.languageCode === 'ar-SY';
      if (selectedDialect.code === 'ar-MSA') return v.languageCode === 'ar-MSA';
      if (selectedDialect.code.startsWith('fr')) return v.languageCode.startsWith('fr');
      if (selectedDialect.code.startsWith('en')) return v.languageCode.startsWith('en');
    }
    return true;
  });

  const activeVoices = filteredVoices.length > 0 ? filteredVoices : allPersonas;

  // Handle Play/Stop Synthesis with Neural Voice Timbre
  const handleTogglePlay = async () => {
    if (isPlaying) {
      audioEngine.stopSpeaking();
      setIsPlaying(false);
      onSpeakStatusChange(false);
      setSpeechProgress(0);
      return;
    }

    if (!scriptText.trim()) return;

    setIsPlaying(true);
    onSpeakStatusChange(true);

    const effectiveVoice: VoicePersona = {
      ...selectedVoice,
      neuralVoice: selectedNeuralTimbre === 'default' 
        ? selectedVoice.neuralVoice 
        : selectedNeuralTimbre
    };

    await audioEngine.speak(
      scriptText,
      effectiveVoice,
      audioSettings,
      (progress) => {
        setSpeechProgress(progress);
      },
      () => {
        setIsPlaying(false);
        onSpeakStatusChange(false);
        setSpeechProgress(0);
      }
    );
  };

  // Preview Voice Sample
  const handleAuditionVoice = (voice: VoicePersona, e: React.MouseEvent) => {
    e.stopPropagation();
    const effectiveVoice: VoicePersona = {
      ...voice,
      neuralVoice: selectedNeuralTimbre === 'default' 
        ? voice.neuralVoice 
        : selectedNeuralTimbre
    };
    audioEngine.speak(voice.sampleText, effectiveVoice, audioSettings);
  };

  // Insert Acoustic Cue tag
  const insertCue = (cue: string) => {
    setScriptText(prev => prev + ' ' + cue + ' ');
  };

  // Insert Dialect phrase
  const insertDialectPhrase = (phrase: string) => {
    setScriptText(prev => prev + ' ' + phrase + ' ');
  };

  // AI Script Polish
  const handleAiPolishScript = async () => {
    setIsGeneratingAi(true);
    try {
      const res = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: scriptText,
          dialect: selectedDialect.label,
          tone: selectedTone.label,
          language: language === 'fr' ? 'French' : language === 'ar' ? 'Arabic' : 'English'
        })
      });
      const data = await res.json();
      if (data.data?.script) {
        setScriptText(data.data.script);
      } else if (data.fallback?.script) {
        setScriptText(data.fallback.script);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // AI Automatic Tashkeel (Diacritics)
  const handleApplyTashkeel = async () => {
    setIsVocalizingTashkeel(true);
    try {
      const res = await fetch('/api/tashkeel-vocalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: scriptText })
      });
      const data = await res.json();
      if (data.data?.vocalizedText) {
        setScriptText(data.data.vocalizedText);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsVocalizingTashkeel(false);
    }
  };

  // AI Dialect Transmutation
  const handleTransmuteToDialect = async (dialect: DialectOption) => {
    setSelectedDialect(dialect);
    setIsAdaptingDialect(true);
    setShowDialectTransmuter(false);
    try {
      const res = await fetch('/api/dialect-adapt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: scriptText,
          targetDialect: dialect.label
        })
      });
      const data = await res.json();
      if (data.data?.adaptedText) {
        setScriptText(data.data.adaptedText);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAdaptingDialect(false);
    }
  };

  // Export WAV file
  const handleDownloadWav = () => {
    const lastBlob = audioEngine.getLastAudioBlob();
    const estDuration = Math.max(3, Math.round((scriptText.split(/\s+/).length / 2.5)));
    const effectiveVoice = { ...selectedVoice, neuralVoice: selectedNeuralTimbre === 'default' ? selectedVoice.neuralVoice : selectedNeuralTimbre };
    const blob = audioEngine.generateWavFile(scriptText, effectiveVoice, estDuration);
    if (!blob) { alert('Générez cet audio avant de l’exporter.'); return; }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `z12-voice-v0-${selectedVoice.id}-${Date.now()}.wav`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export Subtitles SRT
  const handleDownloadSRT = () => {
    const words = scriptText.split(/\s+/);
    const chunkLength = 8;
    const lines = [];
    for (let i = 0; i < words.length; i += chunkLength) {
      const chunk = words.slice(i, i + chunkLength).join(' ');
      lines.push({
        text: chunk,
        durationSec: Math.max(2, chunk.split(' ').length * 0.4)
      });
    }
    const srtContent = audioEngine.generateSRT(lines);
    const blob = new Blob([srtContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `z12-voice-subtitles-${Date.now()}.srt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(scriptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Word count & Duration stats
  const wordCount = scriptText.trim() ? scriptText.trim().split(/\s+/).length : 0;
  const estimatedSeconds = Math.round(wordCount / (2.2 * audioSettings.rate));

  const currentDialectExpressions = DIALECT_EXPRESSIONS[selectedDialect.code] || [];

  return (
    <div className="space-y-6">
      {/* 1. Regional Dialect Selector with Distinct Arab Countries */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Languages className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
              {language === 'ar' ? 'منظومة اللهجات العربية والإقليمية 2026' : 'Dialectes Régionaux & Accents Authentiques 2026'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDialectTransmuter(!showDialectTransmuter)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/40 hover:from-amber-500/30 hover:to-orange-500/30 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === 'ar' ? 'تحويل النص إلى لهجة أخرى' : 'Convertir en Dialecte'}</span>
            </button>
            <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/80 px-2.5 py-1 rounded-lg border border-cyan-800/60 font-semibold">
              {selectedDialect.flag} {selectedDialect.label.split('(')[0]}
            </span>
          </div>
        </div>

        {/* Dialect Selector Buttons Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-9 gap-2">
          {DIALECTS.map((dialect) => {
            const isSelected = selectedDialect.code === dialect.code;
            return (
              <button
                key={dialect.code}
                onClick={() => {
                  setSelectedDialect(dialect);
                  // also select a matching voice if exists
                  const matchingVoice = allPersonas.find(v => v.dialectCode === dialect.code);
                  if (matchingVoice) setSelectedVoice(matchingVoice);
                }}
                className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-gradient-to-b from-cyan-950/80 to-slate-900 border-cyan-500/80 shadow-md shadow-cyan-500/10'
                    : 'bg-slate-950/60 border-slate-800/70 hover:border-slate-700 hover:bg-slate-800/40 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-lg">{dialect.flag}</span>
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>}
                </div>
                <span className={`text-xs font-bold truncate w-full ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                  {dialect.code === 'ar-SA' ? 'السعودية 🇸🇦' : 
                   dialect.code === 'ar-MA' ? 'المغرب 🇲🇦' : 
                   dialect.code === 'ar-DZ' ? 'الجزائر 🇩🇿' :
                   dialect.code === 'ar-TN' ? 'تونس 🇹🇳' :
                   dialect.code === 'ar-EG' ? 'مصر 🇪🇬' :
                   dialect.code === 'ar-SY' ? 'الشام 🇸🇾' :
                   dialect.code === 'ar-MSA' ? 'الفصحى 🏛️' :
                   dialect.label.split(' ')[0]}
                </span>
                <span className="text-[10px] text-slate-500 truncate w-full font-mono">
                  {dialect.region.split(',')[0]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Quick Dialect Vocabulary Injection Bar */}
        {currentDialectExpressions.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-400 font-mono text-[11px] shrink-0 flex items-center gap-1">
              <span>{selectedDialect.flag}</span>
              <span>{language === 'ar' ? 'تعابير محلية سريعة:' : 'Expressions clés :'}</span>
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              {currentDialectExpressions.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => insertDialectPhrase(item.insert)}
                  title={`${item.meaning} - Cliquer pour insérer dans le script`}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 text-cyan-300 border border-cyan-900/60 hover:border-cyan-500 hover:bg-cyan-950/80 text-xs font-arabic transition-all whitespace-nowrap"
                >
                  + {item.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Dialect Transmuter Panel */}
        {showDialectTransmuter && (
          <div className="mt-3 p-4 rounded-xl bg-slate-950 border border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                {language === 'ar' ? 'محوّل اللهجات الفوري بالذكاء الاصطناعي (Dialect Transmuter)' : 'Transmutateur de Dialecte IA'}
              </span>
              <button
                onClick={() => setShowDialectTransmuter(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Fermer
              </button>
            </div>
            <p className="text-xs text-slate-400">
              {language === 'ar'
                ? 'حوّل نص السيناريو الحالي إلى لهجة عربية أصيلة بمفرداتها وإيقاعها الخاص في ثانية واحدة:'
                : 'Convertissez instantanément ce script dans le dialecte de votre choix avec son lexique natif authentique :'}
            </p>
            <div className="flex flex-wrap gap-2">
              {DIALECTS.filter(d => d.code.startsWith('ar')).map((d) => (
                <button
                  key={d.code}
                  onClick={() => handleTransmuteToDialect(d)}
                  disabled={isAdaptingDialect}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-medium transition-all"
                >
                  <span>{d.flag}</span>
                  <span>{d.label.split('(')[0]}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2. Main Studio Workspace: Voices Casting (Left) & Script Studio (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Voice Personas & Clones (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 backdrop-blur-md">
            {/* Filter Tabs Header */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-400" />
                {language === 'ar' ? 'كاستينغ الأصوات' : 'Casting Voix & Clones'}
              </span>

              {onNavigateToClone && (
                <button
                  onClick={onNavigateToClone}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 text-xs font-medium transition-all"
                >
                  <Plus className="w-3 h-3" />
                  <span>{language === 'ar' ? 'استنساخ صوت' : 'Cloner'}</span>
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs mb-3">
              <button
                onClick={() => setVoiceFilterTab('all')}
                className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
                  voiceFilterTab === 'all' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {language === 'ar' ? 'الكل' : 'Toutes'} ({allPersonas.length})
              </button>
              <button
                onClick={() => setVoiceFilterTab('dialect')}
                className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
                  voiceFilterTab === 'dialect' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {selectedDialect.flag} {language === 'ar' ? 'اللهجة' : 'Dialecte'}
              </button>
              <button
                onClick={() => setVoiceFilterTab('clones')}
                className={`flex-1 py-1.5 rounded-lg font-medium transition-all flex items-center justify-center gap-1 ${
                  voiceFilterTab === 'clones' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Dna className="w-3 h-3" />
                <span>Clones ({clonedVoices.length})</span>
              </button>
            </div>

            {/* Voice Cards Scroll Area */}
            <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
              {activeVoices.map((voice) => {
                const isSelected = selectedVoice.id === voice.id;
                return (
                  <div
                    key={voice.id}
                    onClick={() => setSelectedVoice(voice)}
                    className={`group relative p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-cyan-950/70 via-slate-900 to-slate-900 border-cyan-500/80 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-500/30'
                        : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${voice.avatarColor} p-0.5 shadow-md shrink-0`}>
                          <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center font-bold text-xs text-white">
                            {voice.countryFlag || voice.name.charAt(0)}
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                              {voice.name}
                            </span>
                            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                              voice.isCloned 
                                ? 'bg-indigo-950 text-indigo-300 border-indigo-700/60' 
                                : 'bg-slate-800 text-slate-300 border-slate-700'
                            }`}>
                              {voice.accentBadge}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                            {voice.description}
                          </p>
                        </div>
                      </div>

                      {/* Audition Play Button */}
                      <button
                        onClick={(e) => handleAuditionVoice(voice, e)}
                        title="Écouter l'échantillon"
                        className="p-2 rounded-lg bg-slate-800/80 text-cyan-400 hover:bg-cyan-500 hover:text-slate-950 transition-all shrink-0"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </button>
                    </div>

                    {/* Pro Feature Badges & Keywords */}
                    <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-slate-800/60 flex-wrap">
                      {voice.isCloned ? (
                        <span className="text-[9px] font-mono text-cyan-300 bg-cyan-950/70 px-1.5 py-0.5 rounded border border-cyan-800/40">
                          🧬 Neural Voice Clone Active
                        </span>
                      ) : (
                        voice.proFeatures?.slice(0, 2).map((feat, idx) => (
                          <span key={idx} className="text-[9px] font-mono text-cyan-300/80 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/30">
                            {feat}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tone & Emotion Presets */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 backdrop-blur-md">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 block">
              {language === 'ar' ? 'النبرة والتأثير الدرامي' : 'Intention & Émotion Vocale'}
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {TONE_PRESETS.map((tone) => {
                const isSelected = selectedTone.id === tone.id;
                return (
                  <button
                    key={tone.id}
                    onClick={() => {
                      setSelectedTone(tone);
                      onUpdateAudioSettings({
                        pitch: 1.0 + tone.pitchOffset,
                        rate: 1.0 + tone.rateOffset,
                        reverb: tone.reverbBoost,
                        stability: tone.stability
                      });
                    }}
                    className={`p-2 rounded-xl text-left border transition-all ${
                      isSelected
                        ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/70 font-semibold'
                        : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <span className="text-xs block font-medium truncate">{tone.label}</span>
                    <span className="text-[10px] text-slate-500 block truncate">{tone.description}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Script Editor & Workstation Console (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-md flex flex-col justify-between">
            {/* Script Header Tools */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  {language === 'ar' ? 'محرر السيناريو الصوتي' : 'Console de Script Voix-Off'}
                </span>
                <span className="text-xs font-mono text-cyan-400 bg-cyan-950/70 px-2 py-0.5 rounded border border-cyan-800/50">
                  {wordCount} mots • ~{estimatedSeconds}s
                </span>
              </div>

              {/* Acoustic Cue Insert Pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => insertCue('[pause 0.5s]')}
                  className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-300 hover:bg-cyan-950 hover:text-cyan-300 border border-slate-700 transition-colors"
                >
                  + pause 0.5s
                </button>
                <button
                  onClick={() => insertCue('[breath]')}
                  className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-300 hover:bg-cyan-950 hover:text-cyan-300 border border-slate-700 transition-colors"
                >
                  + souffle
                </button>
                <button
                  onClick={() => insertCue('[emphasis]')}
                  className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-300 hover:bg-cyan-950 hover:text-cyan-300 border border-slate-700 transition-colors"
                >
                  + emphase
                </button>
                <button
                  onClick={() => insertCue('[whisper]')}
                  className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-300 hover:bg-cyan-950 hover:text-cyan-300 border border-slate-700 transition-colors"
                >
                  + chuchoté
                </button>
              </div>
            </div>

            {/* Main Textarea */}
            <div className="relative my-3">
              <textarea
                value={scriptText}
                onChange={(e) => setScriptText(e.target.value)}
                rows={9}
                dir={selectedDialect.code.startsWith('ar') ? 'rtl' : 'ltr'}
                placeholder="Tapez ou collez votre script voix-off ici..."
                className="w-full bg-slate-950/90 text-slate-100 rounded-xl p-4 font-sans text-sm sm:text-base leading-relaxed border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/40 outline-none resize-none transition-all placeholder:text-slate-600 font-arabic"
              />

              {/* Progress Bar during synthesis */}
              {isPlaying && (
                <div className="absolute bottom-2 left-2 right-2 h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-150"
                    style={{ width: `${speechProgress}%` }}
                  />
                </div>
              )}
            </div>

            {/* AI Assistant Actions Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Polish script with AI */}
                <button
                  onClick={handleAiPolishScript}
                  disabled={isGeneratingAi}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-indigo-900/60 to-purple-900/60 text-purple-300 border border-purple-700/60 hover:from-indigo-800 hover:to-purple-800 transition-all disabled:opacity-50"
                >
                  <Sparkles className={`w-3.5 h-3.5 text-purple-400 ${isGeneratingAi ? 'animate-spin' : ''}`} />
                  <span>{isGeneratingAi ? 'Optimisation IA...' : 'Polir le Script'}</span>
                </button>

                {/* Auto Tashkeel Button for Arabic */}
                <button
                  onClick={handleApplyTashkeel}
                  disabled={isVocalizingTashkeel}
                  title="Ajoute les voyelles diacritiques (Tashkeel) complètes pour une prononciation irréprochable"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-950/70 text-emerald-300 border border-emerald-700/60 hover:bg-emerald-900 transition-all disabled:opacity-50 font-arabic"
                >
                  <BookOpen className={`w-3.5 h-3.5 text-emerald-400 ${isVocalizingTashkeel ? 'animate-spin' : ''}`} />
                  <span>{isVocalizingTashkeel ? 'تشكيل النص...' : 'تشكيل آلي (Tashkeel)'}</span>
                </button>

                {/* Acoustic DSP toggle */}
                <button
                  onClick={() => setShowAcousticPanel(!showAcousticPanel)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    showAcousticPanel ? 'bg-cyan-950/70 text-cyan-300 border-cyan-700' : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Acoustique DSP</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyScript}
                  className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                  title="Copier le texte"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>

                <button
                  onClick={handleDownloadSRT}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-mono transition-colors"
                  title="Télécharger les sous-titres .SRT"
                >
                  <FileDown className="w-3.5 h-3.5 text-cyan-400" />
                  <span>SRT</span>
                </button>

                <button
                  onClick={handleDownloadWav}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/80 text-emerald-300 hover:bg-emerald-900 border border-emerald-800 text-xs font-medium transition-colors"
                  title="Télécharger le fichier audio Master WAV"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>WAV Master</span>
                </button>
              </div>
            </div>

            {/* Acoustic Sliders & Neural DSP Panel (collapsible) */}
            {showAcousticPanel && (
              <div className="mt-4 p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-4">
                {/* Neural Voice Timbre Engine Selector */}
                <div className="pb-3 border-b border-slate-850">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                      {language === 'ar' ? 'نموذج النبرة العصبية (OpenRouter Neural Engine)' : 'Modèle de Timbre Neuronal IA (OpenRouter 2026)'}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Studio 24kHz • Zéro Robotisation
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'default', label: 'Auto (Profil)', desc: selectedVoice.gender === 'female' ? 'warm / bright' : 'baritone / energetic' },
                      { id: 'baritone', label: 'baritone', desc: 'Baryton profond & posé (Docu / Spots)' },
                      { id: 'warm', label: 'warm', desc: 'Chaleureuse & douce (Récits / Darija)' },
                      { id: 'energetic', label: 'energetic', desc: 'Dynamique & vivant (Pub / Tech)' },
                      { id: 'textured', label: 'textured', desc: 'Texturé & puissant (Cinéma / Radio)' },
                      { id: 'bright', label: 'bright', desc: 'Lumineuse & claire (Podcast)' },
                    ].map((timbre) => {
                      const isSel = selectedNeuralTimbre === timbre.id;
                      return (
                        <button
                          key={timbre.id}
                          onClick={() => setSelectedNeuralTimbre(timbre.id as any)}
                          className={`p-2 rounded-lg text-left border transition-all ${
                            isSel 
                              ? 'bg-cyan-950/80 border-cyan-500/80 text-cyan-300 shadow-sm shadow-cyan-500/20' 
                              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs font-bold">
                            <span>{timbre.label}</span>
                            {isSel && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate">{timbre.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Acoustic Sliders: Speed, Pitch, Volume, Bass, Treble */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Speed Slider */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Cadence / Vitesse</span>
                      <span className="font-mono text-cyan-400">{audioSettings.rate.toFixed(2)}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.6"
                      max="1.8"
                      step="0.05"
                      value={audioSettings.rate}
                      onChange={(e) => onUpdateAudioSettings({ rate: parseFloat(e.target.value) })}
                      className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Pitch Slider */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Hauteur (Pitch)</span>
                      <span className="font-mono text-cyan-400">{audioSettings.pitch.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0.6"
                      max="1.5"
                      step="0.05"
                      value={audioSettings.pitch}
                      onChange={(e) => onUpdateAudioSettings({ pitch: parseFloat(e.target.value) })}
                      className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Volume Slider */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Volume Master</span>
                      <span className="font-mono text-cyan-400">{Math.round(audioSettings.volume * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="1.0"
                      step="0.05"
                      value={audioSettings.volume}
                      onChange={(e) => onUpdateAudioSettings({ volume: parseFloat(e.target.value) })}
                      className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                {/* EQ Bass & Treble Air */}
                <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-850">
                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Chaleur Graves (EQ Bass)</span>
                      <span className="font-mono text-cyan-400">{audioSettings.eqBass || 0} dB</span>
                    </div>
                    <input
                      type="range"
                      min="-6"
                      max="10"
                      step="1"
                      value={audioSettings.eqBass || 0}
                      onChange={(e) => onUpdateAudioSettings({ eqBass: parseInt(e.target.value) })}
                      className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Présence & Air (EQ Treble)</span>
                      <span className="font-mono text-cyan-400">{audioSettings.eqTreble || 0} dB</span>
                    </div>
                    <input
                      type="range"
                      min="-6"
                      max="10"
                      step="1"
                      value={audioSettings.eqTreble || 0}
                      onChange={(e) => onUpdateAudioSettings({ eqTreble: parseInt(e.target.value) })}
                      className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Master Play / Stop Trigger */}
            <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  engineEvent.status === 'synthesizing' 
                    ? 'bg-amber-400 animate-ping' 
                    : isPlaying 
                    ? 'bg-emerald-400 animate-ping' 
                    : 'bg-slate-700'
                }`} />
                <div className="flex flex-col">
                  <span className="text-xs text-slate-200 font-medium">
                    {engineEvent.status === 'error' ? engineEvent.error : engineEvent.status === 'synthesizing' ? (
                      <span className="text-amber-300 flex items-center gap-1.5 font-semibold">
                        <Sparkles className="w-3.5 h-3.5 animate-spin text-amber-400" />
                        Génération neuronale OpenRouter en cours...
                      </span>
                    ) : isPlaying ? (
                      <span className="text-emerald-300 font-semibold">
                        Lecture Studio HD (24kHz DSP) en cours...
                      </span>
                    ) : (
                      `Prêt • Voix : ${selectedVoice.name} (${selectedNeuralTimbre === 'default' ? (selectedVoice.neuralVoice || 'Auto') : selectedNeuralTimbre})`
                    )}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Moteur : {engineEvent.engine === 'openrouter' ? '✨ Synthèse Neuronale Studio' : 'Navigateur Local'}
                  </span>
                </div>
              </div>

              <button
                onClick={handleTogglePlay}
                disabled={engineEvent.status === 'synthesizing'}
                className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg active:scale-95 disabled:opacity-50 ${
                  isPlaying
                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/30'
                    : engineEvent.status === 'synthesizing'
                    ? 'bg-amber-500 text-slate-950 shadow-amber-500/25'
                    : 'bg-gradient-to-r from-cyan-400 via-emerald-400 to-teal-400 hover:opacity-95 text-slate-950 shadow-cyan-500/25'
                }`}
              >
                {engineEvent.status === 'synthesizing' ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Génération IA...</span>
                  </>
                ) : isPlaying ? (
                  <>
                    <Square className="w-4 h-4 fill-current" />
                    <span>Arrêter</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Synthétiser & Lire</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
