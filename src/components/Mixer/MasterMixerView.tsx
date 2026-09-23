import React from 'react';
import { AudioSettings, LanguageCode } from '../../types/studio';
import { BGM_TRACKS } from '../../data/voices';
import { audioEngine } from '../../services/audioEngine';
import { 
  Sliders, 
  Music, 
  Volume2, 
  Radio, 
  Sparkles, 
  Play, 
  Square,
  ShieldAlert,
  Headphones,
  Gauge
} from 'lucide-react';

interface MasterMixerViewProps {
  language: LanguageCode;
  audioSettings: AudioSettings;
  onUpdateAudioSettings: (newSettings: Partial<AudioSettings>) => void;
  isBgmActive: boolean;
  onToggleBgm: () => void;
}

export const MasterMixerView: React.FC<MasterMixerViewProps> = ({
  language,
  audioSettings,
  onUpdateAudioSettings,
  isBgmActive,
  onToggleBgm,
}) => {
  const acousticPresets = [
    {
      id: 'dry-booth',
      name: 'Cabine Broadcast Insonorisée',
      desc: 'Son sec, chaud, ultra-précis sans réverbération.',
      reverb: 0.02,
      bass: 2,
      treble: 1
    },
    {
      id: 'intimate-lounge',
      name: 'Studio Intimiste Proximité',
      desc: 'Effet de proximité chaleureux avec micro à ruban.',
      reverb: 0.12,
      bass: 4,
      treble: 0
    },
    {
      id: 'cinema-hall',
      name: 'Grand Hall Cinéma & Épopée',
      desc: 'Réverbération spacieuse pour trailers et documentaires.',
      reverb: 0.45,
      bass: 1,
      treble: 3
    },
    {
      id: 'radio-vintage',
      name: 'Radio AM / Vintage Transistor',
      desc: 'Filtre passe-bande rétro et compression vintage.',
      reverb: 0.05,
      bass: -4,
      treble: 5
    }
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800/60 shadow-inner">
            <Sliders className="w-5 h-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">
                Master Audio Mixer & DSP Studio 2026
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/50">
                Acoustic Modeling
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {language === 'ar' ? 'معالجة الإشارات الصوتية (DSP)، الموسيقى التصويرية، وخفض الصوت التلقائي' : 'Mastering, traitement de pièce acoustique, musique de fond et ducking automatique.'}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Mixer Controls: BGM Deck (Left) & Room Acoustics + EQ (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Ambient Music & Ducking Engine (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Music className="w-4 h-4 text-indigo-400" />
                Musique de Fond (BGM Deck)
              </span>

              <button
                onClick={onToggleBgm}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isBgmActive
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-900/30'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                {isBgmActive ? (
                  <>
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>STOP BGM</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>LANCER BGM</span>
                  </>
                )}
              </button>
            </div>

            {/* BGM Track Selector */}
            <div className="space-y-2.5 my-4">
              {BGM_TRACKS.map((track) => {
                const isSelected = audioSettings.bgmTrack === track.id;
                return (
                  <div
                    key={track.id}
                    onClick={() => {
                      onUpdateAudioSettings({ bgmTrack: track.id });
                      if (isBgmActive) {
                        audioEngine.setBGM(track.id, audioSettings.bgmVolume);
                      }
                    }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-indigo-950/60 border-indigo-500/70 shadow-md ring-1 ring-indigo-500/30'
                        : 'bg-slate-950/60 border-slate-800/70 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-200">{track.label}</div>
                      <div className="text-[10px] text-slate-500">{track.genre} • {track.tempo > 0 ? `${track.tempo} BPM` : 'Solo'}</div>
                    </div>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* BGM Volume & Ducking Sliders */}
            <div className="space-y-4 pt-3 border-t border-slate-800">
              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Volume Musique BGM</span>
                  <span className="font-mono text-indigo-400">{Math.round(audioSettings.bgmVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={audioSettings.bgmVolume}
                  onChange={(e) => {
                    const vol = parseFloat(e.target.value);
                    onUpdateAudioSettings({ bgmVolume: vol });
                    audioEngine.setBGMVolume(vol);
                  }}
                  className="w-full accent-indigo-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span className="flex items-center gap-1.5">
                    <span>Ducking Vocal Automatique</span>
                    <span className="text-[10px] text-slate-500">(Atténuation de la musique quand la voix parle)</span>
                  </span>
                  <span className="font-mono text-cyan-400">-{Math.round(audioSettings.ducking * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.9"
                  step="0.05"
                  value={audioSettings.ducking}
                  onChange={(e) => onUpdateAudioSettings({ ducking: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Room Acoustics & Equalizer (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-3 pb-3 border-b border-slate-800">
              Simulation Acoustique de la Pièce (Room Modeler)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-5">
              {acousticPresets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => {
                    onUpdateAudioSettings({
                      reverb: preset.reverb,
                      eqBass: preset.bass,
                      eqTreble: preset.treble
                    });
                  }}
                  className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900/60 text-left transition-all"
                >
                  <span className="text-xs font-bold text-white block mb-0.5">{preset.name}</span>
                  <span className="text-[10px] text-slate-500 block leading-tight">{preset.desc}</span>
                </button>
              ))}
            </div>

            {/* EQ Sliders */}
            <div className="space-y-4 pt-3 border-t border-slate-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Égaliseur Vocal Master (EQ 2-Bandes)
              </span>

              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Chaleur & Graves (Bass Boost)</span>
                  <span className="font-mono text-cyan-400">{audioSettings.eqBass > 0 ? `+${audioSettings.eqBass}` : audioSettings.eqBass} dB</span>
                </div>
                <input
                  type="range"
                  min="-8"
                  max="8"
                  step="1"
                  value={audioSettings.eqBass}
                  onChange={(e) => onUpdateAudioSettings({ eqBass: parseInt(e.target.value) })}
                  className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Air & Clarté Aiguë (Presence / Treble)</span>
                  <span className="font-mono text-emerald-400">{audioSettings.eqTreble > 0 ? `+${audioSettings.eqTreble}` : audioSettings.eqTreble} dB</span>
                </div>
                <input
                  type="range"
                  min="-8"
                  max="8"
                  step="1"
                  value={audioSettings.eqTreble}
                  onChange={(e) => onUpdateAudioSettings({ eqTreble: parseInt(e.target.value) })}
                  className="w-full accent-emerald-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
