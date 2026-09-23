import React, { useState } from 'react';
import { PodcastSpeaker, PodcastLine, LanguageCode, AudioSettings } from '../../types/studio';
import { VOICES } from '../../data/voices';
import { audioEngine } from '../../services/audioEngine';
import { 
  Users, 
  Play, 
  Square, 
  Plus, 
  Trash2, 
  Sparkles, 
  Download, 
  Music, 
  FileText, 
  Radio, 
  Volume2, 
  Smile,
  MessageSquare
} from 'lucide-react';

interface PodcastStudioViewProps {
  language: LanguageCode;
  audioSettings: AudioSettings;
  onSpeakStatusChange: (isSpeaking: boolean) => void;
}

export const PodcastStudioView: React.FC<PodcastStudioViewProps> = ({
  language,
  audioSettings,
  onSpeakStatusChange
}) => {
  // Preset default speakers
  const [speakers, setSpeakers] = useState<PodcastSpeaker[]>([
    {
      id: 'spk-1',
      name: 'Sami (Host)',
      role: 'Animateur Principal',
      voiceId: 'savio-prime',
      color: '#06b6d4'
    },
    {
      id: 'spk-2',
      name: 'Sarah (Co-Host)',
      role: 'Experte Tech',
      voiceId: 'layla-masri',
      color: '#10b981'
    },
    {
      id: 'spk-3',
      name: 'Saud (Invité 🇸🇦)',
      role: 'Expert Visionnaire Saoudien',
      voiceId: 'saud-riyadh',
      color: '#a855f7'
    },
    {
      id: 'spk-4',
      name: 'Fatima (Invitée 🇲🇦)',
      role: 'Créatrice Media Darija',
      voiceId: 'fatima-darija',
      color: '#f59e0b'
    }
  ]);

  // Dialogue lines
  const [lines, setLines] = useState<PodcastLine[]>([
    {
      id: 'line-1',
      speakerId: 'spk-1',
      text: 'Bienvenue dans ce nouvel épisode de Savio Podcast 2026 ! Aujourd\'hui, nous explorons comment la voix artificielle redéfinit notre façon de créer du contenu.',
      emotion: 'energetic',
      speed: 1.0,
      pauseAfter: 0.5
    },
    {
      id: 'line-2',
      speakerId: 'spk-2',
      text: 'Absolument Sami ! Ce qui m\'impressionne le plus cette année, c\'est la précision chirurgicale des dialectes et la restitution des émotions humaines.',
      emotion: 'thoughtful',
      speed: 1.02,
      pauseAfter: 0.6
    },
    {
      id: 'line-3',
      speakerId: 'spk-3',
      text: 'نعم بكل تأكيد يا سارة وسامي، أصبح بإمكان أي صانع محتوى في العالم العربي تحويل أفكاره إلى إنتاج صوتي هوليوودي في دقائق معدودة.',
      emotion: 'confident',
      speed: 0.98,
      pauseAfter: 0.8
    },
    {
      id: 'line-4',
      speakerId: 'spk-1',
      text: 'C\'est fascinant. Restez avec nous pour décortiquer les coulisses techniques de cette révolution !',
      emotion: 'excited',
      speed: 1.05,
      pauseAfter: 1.0
    }
  ]);

  const [topicPrompt, setTopicPrompt] = useState('L\'avenir des médias et de l\'IA audio en 2026');
  const [episodeTitle, setEpisodeTitle] = useState('Épisode 42 : L\'Ère de la Voix Neuronale');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlayingEpisode, setIsPlayingEpisode] = useState(false);
  const [currentActiveLineIndex, setCurrentActiveLineIndex] = useState<number | null>(null);

  // Play a single line
  const handlePlayLine = (line: PodcastLine, index: number) => {
    const speaker = speakers.find(s => s.id === line.speakerId);
    const voice = VOICES.find(v => v.id === speaker?.voiceId) || VOICES[0];
    
    setCurrentActiveLineIndex(index);
    onSpeakStatusChange(true);

    audioEngine.speak(
      line.text,
      voice,
      { ...audioSettings, rate: line.speed },
      undefined,
      () => {
        setCurrentActiveLineIndex(null);
        onSpeakStatusChange(false);
      }
    );
  };

  // Play entire episode sequentially
  const handlePlayFullEpisode = async () => {
    if (isPlayingEpisode) {
      audioEngine.stopSpeaking();
      setIsPlayingEpisode(false);
      setCurrentActiveLineIndex(null);
      onSpeakStatusChange(false);
      return;
    }

    setIsPlayingEpisode(true);
    onSpeakStatusChange(true);

    for (let i = 0; i < lines.length; i++) {
      if (!isPlayingEpisode && i > 0 && !audioEngine) break;
      const line = lines[i];
      setCurrentActiveLineIndex(i);

      const speaker = speakers.find(s => s.id === line.speakerId);
      const voice = VOICES.find(v => v.id === speaker?.voiceId) || VOICES[0];

      await new Promise<void>((resolve) => {
        audioEngine.speak(
          line.text,
          voice,
          { ...audioSettings, rate: line.speed },
          undefined,
          () => {
            setTimeout(resolve, (line.pauseAfter || 0.4) * 1000);
          }
        );
      });
    }

    setIsPlayingEpisode(false);
    setCurrentActiveLineIndex(null);
    onSpeakStatusChange(false);
  };

  // AI Podcast Generator
  const handleGenerateAiPodcast = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/podcast-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topicPrompt,
          episodeTitle,
          hostsCount: speakers.length,
          language: language === 'fr' ? 'French' : language === 'ar' ? 'Arabic' : 'English'
        })
      });
      const data = await res.json();
      if (data.data?.dialogue && data.data.dialogue.length > 0) {
        if (data.data.episodeTitle) setEpisodeTitle(data.data.episodeTitle);
        const newLines: PodcastLine[] = data.data.dialogue.map((d: any, idx: number) => {
          // map to existing speaker or round-robin
          const spk = speakers[idx % speakers.length];
          return {
            id: `line-gen-${Date.now()}-${idx}`,
            speakerId: spk.id,
            text: d.text,
            emotion: d.emotion || 'natural',
            speed: d.speed || 1.0,
            pauseAfter: 0.5
          };
        });
        setLines(newLines);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Add line
  const handleAddLine = () => {
    const newLine: PodcastLine = {
      id: `line-${Date.now()}`,
      speakerId: speakers[0].id,
      text: 'Nouvelle réplique de podcast...',
      emotion: 'natural',
      speed: 1.0,
      pauseAfter: 0.5
    };
    setLines([...lines, newLine]);
  };

  // Delete line
  const handleDeleteLine = (id: string) => {
    if (lines.length <= 1) return;
    setLines(lines.filter(l => l.id !== id));
  };

  // Export full podcast as WAV
  const handleDownloadFullPodcastWav = () => {
    const fullText = lines.map(l => l.text).join(' ');
    const blob = audioEngine.generateWavFile(fullText, VOICES[0], lines.length * 4);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `savio-podcast-episode-${Date.now()}.wav`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & AI Generation Bar */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                <Users className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  Podcast Studio 2026
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/50">
                    Multi-Speaker Dialogue
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  {language === 'ar' ? 'توليد حوارات تفاعلية متعددة الأصوات مع نغمات سينمائية وموسيقى تصويرية' : 'Créez des épisodes et débats multi-voix dynamiques avec transitions naturelles.'}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Play & Export buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePlayFullEpisode}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs tracking-wider transition-all shadow-lg ${
                isPlayingEpisode
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/30'
                  : 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 hover:from-cyan-400 hover:to-emerald-400 shadow-cyan-500/20'
              }`}
            >
              {isPlayingEpisode ? (
                <>
                  <Square className="w-4 h-4 fill-current" />
                  <span>ARRÊTER L'ÉPISODE</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>JOUER L'ÉPISODE ENTIER</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadFullPodcastWav}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
              title="Exporter l'épisode complet en WAV"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">Export Master WAV</span>
            </button>
          </div>
        </div>

        {/* AI Prompt Input Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-3 border-t border-slate-800">
          <input
            type="text"
            value={topicPrompt}
            onChange={(e) => setTopicPrompt(e.target.value)}
            placeholder="Sujet de l'épisode : ex. L'impact de l'IA vocale dans le cinéma en 2026..."
            className="flex-1 w-full bg-slate-950 text-slate-200 text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-slate-800 focus:border-cyan-500 outline-none placeholder:text-slate-600"
          />
          <button
            onClick={handleGenerateAiPodcast}
            disabled={isGenerating}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-purple-900/30 transition-all disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Génération IA en cours...' : 'Générer Dialogue IA'}</span>
          </button>
        </div>
      </div>

      {/* 2. Speaker Management Dock */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-md">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 block">
          Intervenants de l'Émission (Casting)
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {speakers.map((spk, idx) => {
            const assignedVoice = VOICES.find(v => v.id === spk.voiceId) || VOICES[0];
            return (
              <div
                key={spk.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-xs shadow-md"
                    style={{ backgroundColor: spk.color }}
                  >
                    {spk.name.charAt(0)}
                  </div>
                  <div>
                    <input
                      type="text"
                      value={spk.name}
                      onChange={(e) => {
                        const updated = [...speakers];
                        updated[idx].name = e.target.value;
                        setSpeakers(updated);
                      }}
                      className="bg-transparent text-xs font-bold text-white border-b border-transparent hover:border-slate-700 focus:border-cyan-500 outline-none w-28"
                    />
                    <select
                      value={spk.voiceId}
                      onChange={(e) => {
                        const updated = [...speakers];
                        updated[idx].voiceId = e.target.value;
                        setSpeakers(updated);
                      }}
                      className="bg-slate-900 text-[10px] text-cyan-300 rounded px-1.5 py-0.5 border border-slate-800 mt-1 block outline-none"
                    >
                      {VOICES.map(v => (
                        <option key={v.id} value={v.id}>
                          {v.name} ({v.dialect.split(' ')[0]})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <span className="text-[10px] font-mono text-slate-500 px-2 py-0.5 bg-slate-900 rounded">
                  Piste {idx + 1}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Conversation Timeline Lines */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-cyan-400" />
            Timeline des Répliques ({lines.length} blocs)
          </span>

          <button
            onClick={handleAddLine}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950 text-cyan-300 hover:bg-cyan-900 border border-cyan-800/60 text-xs font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ajouter Réplique</span>
          </button>
        </div>

        <div className="space-y-3 pt-2">
          {lines.map((line, index) => {
            const speaker = speakers.find(s => s.id === line.speakerId) || speakers[0];
            const isLineActive = currentActiveLineIndex === index;

            return (
              <div
                key={line.id}
                className={`p-4 rounded-xl border transition-all ${
                  isLineActive
                    ? 'bg-cyan-950/40 border-cyan-500 shadow-lg shadow-cyan-950/50 ring-1 ring-cyan-500/40'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-2.5">
                    {/* Speaker Selector Pill */}
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: speaker.color }}
                      />
                      <select
                        value={line.speakerId}
                        onChange={(e) => {
                          const updated = [...lines];
                          updated[index].speakerId = e.target.value;
                          setLines(updated);
                        }}
                        className="bg-transparent text-xs font-bold text-slate-200 outline-none cursor-pointer"
                      >
                        {speakers.map(s => (
                          <option key={s.id} value={s.id} className="bg-slate-950 text-slate-200">
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Speed Modifier */}
                    <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      Vitesse: {line.speed}x
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Play Line */}
                    <button
                      onClick={() => handlePlayLine(line, index)}
                      className={`p-2 rounded-lg transition-colors ${
                        isLineActive ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-cyan-400 hover:bg-slate-700'
                      }`}
                      title="Écouter cette réplique"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>

                    {/* Delete Line */}
                    <button
                      onClick={() => handleDeleteLine(line.id)}
                      className="p-2 rounded-lg bg-slate-800 text-slate-500 hover:text-rose-400 hover:bg-slate-700 transition-colors"
                      title="Supprimer la réplique"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Line text */}
                <textarea
                  value={line.text}
                  onChange={(e) => {
                    const updated = [...lines];
                    updated[index].text = e.target.value;
                    setLines(updated);
                  }}
                  rows={2}
                  className="w-full bg-slate-900/80 text-slate-100 rounded-lg p-3 text-xs sm:text-sm border border-slate-800 focus:border-cyan-500 outline-none resize-none leading-relaxed"
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
