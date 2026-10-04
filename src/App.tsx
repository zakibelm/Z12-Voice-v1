/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { StudioTab, LanguageCode, AudioSettings, ClonedVoice } from './types/studio';
import { BGM_TRACKS, INITIAL_CLONED_VOICES } from './data/voices';
import { audioEngine } from './services/audioEngine';
import { Navbar } from './components/Navbar';
import { WaveformVisualizer } from './components/WaveformVisualizer';
import { StudioVOView } from './components/StudioVO/StudioVOView';
import { VoiceCloneStudioView } from './components/VoiceClone/VoiceCloneStudioView';
import { PodcastStudioView } from './components/PodcastStudio/PodcastStudioView';
import { AudiobookStudioView } from './components/AudiobookStudio/AudiobookStudioView';
import { TranscriptStudioView } from './components/TranscriptStudio/TranscriptStudioView';
import { MasterMixerView } from './components/Mixer/MasterMixerView';
import { Sparkles, Radio, ShieldCheck, Heart } from 'lucide-react';

export default function App() {
  const [aiReady, setAiReady] = useState<boolean | null>(null);
  useEffect(() => {
    let active = true;
    fetch('/api/health').then(r => r.ok ? r.json() : Promise.reject())
      .then(data => { if (active) setAiReady(data.configured === true); })
      .catch(() => { if (active) setAiReady(false); });
    return () => { active = false; };
  }, []);
  const [currentTab, setCurrentTab] = useState<StudioTab>('studio-vo');
  const [language, setLanguage] = useState<LanguageCode>('fr');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isBgmActive, setIsBgmActive] = useState(false);
  const [selectedVoiceOverride, setSelectedVoiceOverride] = useState<string | null>(null);

  // Cloned Voices with persistence in localStorage
  const [clonedVoices, setClonedVoices] = useState<ClonedVoice[]>(() => {
    try {
      const saved = localStorage.getItem('savio_cloned_voices');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_CLONED_VOICES;
  });

  useEffect(() => {
    try {
      localStorage.setItem('savio_cloned_voices', JSON.stringify(clonedVoices));
    } catch {
      // ignore
    }
  }, [clonedVoices]);

  const handleAddClonedVoice = (newVoice: ClonedVoice) => {
    setClonedVoices(prev => [newVoice, ...prev]);
  };

  const handleDeleteClonedVoice = (voiceId: string) => {
    setClonedVoices(prev => prev.filter(v => v.id !== voiceId));
  };

  const handleSelectCloneForStudioVO = (clone: ClonedVoice) => {
    setSelectedVoiceOverride(clone.id);
    setCurrentTab('studio-vo');
  };

  const [audioSettings, setAudioSettings] = useState<AudioSettings>({
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0,
    stability: 85,
    expressiveness: 80,
    reverb: 0.1,
    eqBass: 2,
    eqTreble: 1,
    bgmTrack: 'lofi',
    bgmVolume: 0.25,
    ducking: 0.65
  });

  const handleUpdateAudioSettings = (newSettings: Partial<AudioSettings>) => {
    setAudioSettings(prev => ({ ...prev, ...newSettings }));
  };

  const handleToggleBgm = () => {
    if (isBgmActive) {
      audioEngine.stopBGM();
      setIsBgmActive(false);
    } else {
      audioEngine.setBGM(audioSettings.bgmTrack, audioSettings.bgmVolume);
      setIsBgmActive(true);
    }
  };

  const currentBgmTrack = BGM_TRACKS.find(t => t.id === audioSettings.bgmTrack) || BGM_TRACKS[1];

  return (
    <div
      dir={language === 'ar' ? 'rtl' : 'ltr'}
      className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950"
    >
      {/* Top Professional Navbar */}
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        language={language}
        onLanguageChange={setLanguage}
        isBgmActive={isBgmActive}
        onToggleBgm={handleToggleBgm}
        bgmTrackName={currentBgmTrack.label.split(' ')[0]}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {aiReady === false && (
          <p role="status" className="rounded-xl border border-amber-700 bg-amber-950/40 p-4 text-sm text-amber-200">
            Prévisualisation : la génération IA attend la configuration OpenRouter et le choix des modèles et voix.
          </p>
        )}
        
        {/* Real-time Oscilloscope & Frequency Visualizer */}
        <section aria-label="Audio Visualizer">
          <WaveformVisualizer isPlaying={isSpeaking || isBgmActive} />
        </section>

        {/* Dynamic Studio Tab Content */}
        <section>
          {currentTab === 'studio-vo' && (
            <StudioVOView
              language={language}
              audioSettings={audioSettings}
              onUpdateAudioSettings={handleUpdateAudioSettings}
              onSpeakStatusChange={setIsSpeaking}
              clonedVoices={clonedVoices}
              onNavigateToClone={() => setCurrentTab('voice-clone')}
              selectedVoiceIdOverride={selectedVoiceOverride}
            />
          )}

          {currentTab === 'voice-clone' && (
            <VoiceCloneStudioView
              language={language}
              clonedVoices={clonedVoices}
              onAddClonedVoice={handleAddClonedVoice}
              onDeleteClonedVoice={handleDeleteClonedVoice}
              onSelectForStudioVO={handleSelectCloneForStudioVO}
              audioSettings={audioSettings}
            />
          )}

          {currentTab === 'podcast' && (
            <PodcastStudioView
              language={language}
              audioSettings={audioSettings}
              onSpeakStatusChange={setIsSpeaking}
            />
          )}

          {currentTab === 'audiobook' && (
            <AudiobookStudioView
              language={language}
              audioSettings={audioSettings}
              onSpeakStatusChange={setIsSpeaking}
            />
          )}

          {currentTab === 'transcript' && (
            <TranscriptStudioView
              language={language}
              onSendToStudioVO={(text) => {
                setCurrentTab('studio-vo');
              }}
            />
          )}

          {currentTab === 'mixer' && (
            <MasterMixerView
              language={language}
              audioSettings={audioSettings}
              onUpdateAudioSettings={handleUpdateAudioSettings}
              isBgmActive={isBgmActive}
              onToggleBgm={handleToggleBgm}
            />
          )}
        </section>
      </main>

      {/* Studio Master Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-md py-4 px-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">Z12 Voice v0</span>
            <span>•</span>
            <span>Architecture Sonore Neuronale & Dialectale</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              DSP 24-bit Flottant
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-cyan-400">Zero Audio Latency</span>
            <span className="text-slate-600">|</span>
            <span>v0.1.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
