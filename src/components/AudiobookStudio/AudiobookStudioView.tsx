import React, { useState } from 'react';
import { AudiobookChapter, LanguageCode, AudioSettings } from '../../types/studio';
import { VOICES } from '../../data/voices';
import { audioEngine } from '../../services/audioEngine';
import { 
  BookOpen, 
  Play, 
  Square, 
  Sparkles, 
  Download, 
  Clock, 
  FileText, 
  CheckCircle2, 
  ListMusic, 
  Layers,
  ChevronRight,
  Headphones
} from 'lucide-react';

interface AudiobookStudioViewProps {
  language: LanguageCode;
  audioSettings: AudioSettings;
  onSpeakStatusChange: (isSpeaking: boolean) => void;
}

export const AudiobookStudioView: React.FC<AudiobookStudioViewProps> = ({
  language,
  audioSettings,
  onSpeakStatusChange
}) => {
  const [bookTitle, setBookTitle] = useState('Les Chroniques de la Singularité');
  const [author, setAuthor] = useState('Savio Intelligence Labs');
  const [selectedVoiceId, setSelectedVoiceId] = useState('dr-hamza-fusha');
  const [rawText, setRawText] = useState(
    `Chapitre 1 : Le Réveil Numérique.
Dans le silence feutré du laboratoire, les serveurs murmuraient les premiers fragments d'une conscience nouvelle. Les données affluaient comme un fleuve infini, tissant des connexions que nul esprit humain n'avait encore jamais imaginées. [pause 0.5s]

Chapitre 2 : La Voix et l'Écho.
Le premier son produit par la machine ne fut pas un bip métallique, mais un souffle chaud et vibrant, semblable à la voix d'un conteur ancien au coin du feu. L'humanité comprit alors que la technologie n'était plus un outil, mais un miroir.`
  );

  const [chapters, setChapters] = useState<AudiobookChapter[]>([
    {
      id: 'chap-1',
      number: 1,
      title: 'Le Réveil Numérique',
      script: "Dans le silence feutré du laboratoire, les serveurs murmuraient les premiers fragments d'une conscience nouvelle. Les données affluaient comme un fleuve infini, tissant des connexions que nul esprit humain n'avait encore jamais imaginées. [pause 0.5s] L'aube d'une ère nouvelle venait d'éclore.",
      wordCount: 38,
      estimatedMinutes: 1,
      voiceId: 'dr-hamza-fusha',
      status: 'synthesized'
    },
    {
      id: 'chap-2',
      number: 2,
      title: "La Voix et l'Écho",
      script: "Le premier son produit par la machine ne fut pas un bip métallique, mais un souffle chaud et vibrant, semblable à la voix d'un conteur ancien au coin du feu. [pause 0.8s] L'humanité comprit alors que la technologie n'était plus un simple outil, mais un miroir tendu vers l'âme.",
      wordCount: 46,
      estimatedMinutes: 1,
      voiceId: 'dr-hamza-fusha',
      status: 'draft'
    }
  ]);

  const [activeChapterIndex, setActiveChapterIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isProcessingAi, setIsProcessingAi] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);

  // Play a specific chapter
  const handlePlayChapter = (index: number) => {
    const chap = chapters[index];
    if (!chap) return;

    if (isPlaying && activeChapterIndex === index) {
      audioEngine.stopSpeaking();
      setIsPlaying(false);
      onSpeakStatusChange(false);
      return;
    }

    setActiveChapterIndex(index);
    setIsPlaying(true);
    onSpeakStatusChange(true);

    const voice = VOICES.find(v => v.id === chap.voiceId) || VOICES[0];

    audioEngine.speak(
      chap.script,
      voice,
      { ...audioSettings, rate: playbackSpeed },
      undefined,
      () => {
        setIsPlaying(false);
        onSpeakStatusChange(false);
      }
    );
  };

  // AI Audiobook Processing: Segment and Summarize
  const handleProcessAudiobook = async (mode: 'full-chapters' | 'summary-audio') => {
    setIsProcessingAi(true);
    try {
      const res = await fetch('/api/audiobook-process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText,
          title: bookTitle,
          targetMode: mode
        })
      });
      const data = await res.json();
      if (data.data?.chapters && data.data.chapters.length > 0) {
        const parsedChapters: AudiobookChapter[] = data.data.chapters.map((c: any, idx: number) => ({
          id: `chap-${Date.now()}-${idx}`,
          number: c.chapterNumber || idx + 1,
          title: c.chapterTitle || `Chapitre ${idx + 1}`,
          script: c.narrationScript || '',
          wordCount: (c.narrationScript || '').split(' ').length,
          estimatedMinutes: c.estimatedMinutes || 2,
          voiceId: selectedVoiceId,
          status: 'draft'
        }));
        setChapters(parsedChapters);
        setActiveChapterIndex(0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessingAi(false);
    }
  };

  // Download chapter WAV
  const handleDownloadChapterWav = (chap: AudiobookChapter) => {
    const voice = VOICES.find(v => v.id === chap.voiceId) || VOICES[0];
    const blob = audioEngine.generateWavFile(chap.script, voice, chap.wordCount * 0.4);
    if (!blob) { alert('Générez ce chapitre avant de l’exporter.'); return; }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `savio-audiobook-${bookTitle.replace(/\s+/g, '_')}-chap-${chap.number}.wav`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const currentChapter = chapters[activeChapterIndex] || chapters[0];

  return (
    <div className="space-y-6">
      {/* 1. Audiobook Master Header */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-purple-950 text-purple-400 border border-purple-800/60 shadow-inner">
              <BookOpen className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={bookTitle}
                  onChange={(e) => setBookTitle(e.target.value)}
                  className="bg-transparent text-base font-bold text-white border-b border-transparent hover:border-slate-700 focus:border-cyan-500 outline-none"
                />
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/50">
                  Audiobook Engine 2026
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {language === 'ar' ? 'تحويل الكتب والمستندات الطويلة إلى كتب صوتية احترافية مقسمة لفصول' : 'Conversion intelligente de longs textes et romans en livres audio chapitrés.'}
              </p>
            </div>
          </div>

          {/* AI Chapter Breakdown Trigger */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleProcessAudiobook('summary-audio')}
              disabled={isProcessingAi}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Résumé Audio Express</span>
            </button>

            <button
              onClick={() => handleProcessAudiobook('full-chapters')}
              disabled={isProcessingAi}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-purple-900/30 transition-all disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isProcessingAi ? 'animate-spin' : ''}`} />
              <span>{isProcessingAi ? 'Segmentation IA...' : 'Découper en Chapitres IA'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Workspace: Chapter Playlist (Left) & Chapter Studio Narration (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Playlist & Chapters Nav (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-md">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <ListMusic className="w-4 h-4 text-purple-400" />
                Table des Matières ({chapters.length})
              </span>
              <span className="text-xs font-mono text-slate-400">
                ~{chapters.reduce((acc, c) => acc + c.estimatedMinutes, 0)} min total
              </span>
            </div>

            <div className="space-y-2">
              {chapters.map((chap, idx) => {
                const isSelected = activeChapterIndex === idx;
                const isPlayingThis = isPlaying && isSelected;

                return (
                  <div
                    key={chap.id}
                    onClick={() => setActiveChapterIndex(idx)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-purple-950/60 border-purple-500/70 shadow-md ring-1 ring-purple-500/30'
                        : 'bg-slate-950/60 border-slate-800/70 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayChapter(idx);
                        }}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                          isPlayingThis
                            ? 'bg-rose-600 text-white animate-pulse'
                            : 'bg-slate-800 text-purple-400 hover:bg-purple-600 hover:text-white'
                        }`}
                      >
                        {isPlayingThis ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                      </button>

                      <div>
                        <div className="text-xs font-bold text-slate-200">
                          {chap.number}. {chap.title}
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>{chap.wordCount} mots</span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" /> ~{chap.estimatedMinutes}m
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadChapterWav(chap);
                      }}
                      className="p-1.5 rounded bg-slate-800 text-slate-400 hover:text-cyan-300"
                      title="Télécharger ce chapitre"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Book Import Raw Text Paste Zone */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-md">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">
              Texte Source Brut / Manuscrit
            </span>
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              rows={4}
              placeholder="Collez ici le texte complet ou un livre pour découpage automatique..."
              className="w-full bg-slate-950 text-slate-300 text-xs p-3 rounded-xl border border-slate-800 outline-none resize-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* Chapter Narration Studio Editor (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          {currentChapter && (
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md">
              {/* Chapter Header Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest">
                    Chapitre {currentChapter.number}
                  </span>
                  <input
                    type="text"
                    value={currentChapter.title}
                    onChange={(e) => {
                      const updated = [...chapters];
                      updated[activeChapterIndex].title = e.target.value;
                      setChapters(updated);
                    }}
                    className="bg-transparent text-base font-bold text-white block border-b border-transparent hover:border-slate-700 focus:border-purple-500 outline-none"
                  />
                </div>

                {/* Voice Narrator Casting */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Narrateur :</span>
                  <select
                    value={currentChapter.voiceId}
                    onChange={(e) => {
                      const updated = [...chapters];
                      updated[activeChapterIndex].voiceId = e.target.value;
                      setChapters(updated);
                    }}
                    className="bg-slate-950 text-xs text-purple-300 rounded-lg px-2.5 py-1.5 border border-slate-800 outline-none"
                  >
                    {VOICES.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.tag})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Chapter Script Textarea */}
              <div className="my-4">
                <textarea
                  value={currentChapter.script}
                  onChange={(e) => {
                    const updated = [...chapters];
                    updated[activeChapterIndex].script = e.target.value;
                    updated[activeChapterIndex].wordCount = e.target.value.split(/\s+/).length;
                    setChapters(updated);
                  }}
                  rows={10}
                  className="w-full bg-slate-950/90 text-slate-100 rounded-xl p-4 text-sm leading-relaxed border border-slate-800 focus:border-purple-500 outline-none resize-none font-serif"
                />
              </div>

              {/* Audiobook Playback Deck */}
              <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
                {/* Speed selector */}
                <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800 text-xs">
                  <span className="text-slate-500">Vitesse :</span>
                  {[0.85, 1.0, 1.25, 1.5].map((speed) => (
                    <button
                      key={speed}
                      onClick={() => setPlaybackSpeed(speed)}
                      className={`px-1.5 py-0.5 rounded font-mono ${
                        playbackSpeed === speed ? 'bg-purple-900/60 text-purple-300 font-bold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleDownloadChapterWav(currentChapter)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-purple-400" />
                    <span>WAV Chapitre</span>
                  </button>

                  <button
                    onClick={() => handlePlayChapter(activeChapterIndex)}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs tracking-wider transition-all shadow-lg ${
                      isPlaying
                        ? 'bg-rose-600 hover:bg-rose-500 text-white'
                        : 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-400 hover:to-indigo-400 shadow-purple-900/30'
                    }`}
                  >
                    {isPlaying ? (
                      <>
                        <Square className="w-4 h-4 fill-current" />
                        <span>PAUSE NARRATION</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-current" />
                        <span>ÉCOUTER CE CHAPITRE</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
