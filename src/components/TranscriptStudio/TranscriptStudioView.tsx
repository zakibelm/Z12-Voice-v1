import React, { useState, useRef, useEffect } from 'react';
import { LanguageCode } from '../../types/studio';
import { 
  FileText, 
  Mic, 
  Square, 
  Upload, 
  Sparkles, 
  Download, 
  Copy, 
  Check, 
  Share2, 
  Video, 
  Users, 
  BookOpen, 
  Flame,
  ArrowRight
} from 'lucide-react';

interface TranscriptStudioViewProps {
  language: LanguageCode;
  onSendToPodcast?: (script: string) => void;
  onSendToStudioVO?: (text: string) => void;
}

export const TranscriptStudioView: React.FC<TranscriptStudioViewProps> = ({
  language,
  onSendToPodcast,
  onSendToStudioVO
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcriptText, setTranscriptText] = useState<string>(
    "Aujourd'hui, nous constatons que la voix synthétique ne se contente plus de lire du texte plat. Elle capture les inflexions, l'humour, la spontanéité d'un soupir et la musicalité propre à chaque dialecte arabe ou international. C'est le début d'une nouvelle ère pour les créateurs de contenu."
  );
  const [isRefining, setIsRefining] = useState(false);
  const [refinedResult, setRefinedResult] = useState<{
    refinedTitle?: string;
    repurposedContent?: string;
    socialHook?: string;
    highlights?: string[];
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition if supported
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language === 'ar' ? 'ar-EG' : language === 'fr' ? 'fr-FR' : 'en-US';

      recognition.onresult = (event: any) => {
        let current = '';
        for (let i = 0; i < event.results.length; i++) {
          current += event.results[i][0].transcript + ' ';
        }
        setTranscriptText(current);
      };

      recognition.onerror = (e: any) => {
        console.warn('SpeechRecognition error:', e);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, [language]);

  // Toggle Microphone recording
  const handleToggleRecord = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
    } else {
      setTranscriptText('');
      setRefinedResult(null);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsRecording(true);
        } catch {
          simulateDictation();
        }
      } else {
        simulateDictation();
      }
    }
  };

  // Fallback simulated dictation if SpeechRecognition API is disabled/unsupported
  const simulateDictation = () => {
    setIsRecording(true);
    const demoPhrases = [
      "Bienvenue dans l'enregistrement direct de Transcript Studio...",
      " Le système analyse le spectre vocal et isole chaque mot avec précision...",
      " Conversion automatique prête pour publication sur toutes les plateformes !"
    ];
    let idx = 0;
    const interval = setInterval(() => {
      if (idx < demoPhrases.length) {
        setTranscriptText(prev => prev + demoPhrases[idx]);
        idx++;
      } else {
        clearInterval(interval);
        setIsRecording(false);
      }
    }, 1500);
  };

  // AI Re-purposing
  const handleRepurpose = async (format: 'podcast-script' | 'social-reels' | 'audiobook-chapter') => {
    setIsRefining(true);
    try {
      const res = await fetch('/api/transcribe-refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: transcriptText,
          outputFormat: format
        })
      });
      const data = await res.json();
      if (data.data) {
        setRefinedResult(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRefining(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(refinedResult?.repurposedContent || transcriptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download Transcript TXT
  const handleDownloadTxt = () => {
    const textToSave = refinedResult?.repurposedContent || transcriptText;
    const blob = new Blob([textToSave], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `savio-transcript-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-teal-950 text-teal-400 border border-teal-800/60 shadow-inner">
              <FileText className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  Transcript Studio 2026
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800/50">
                  AI Speech-to-Text & Transmutation
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {language === 'ar' ? 'تفريغ فوري عالي الدقة وإعادة تدوير المحتوى الصوتي إلى بودكاست ومقاطع وفصول' : 'Transcription vocale haute précision et reconversion instantanée en podcasts, livres ou scripts viraux.'}
              </p>
            </div>
          </div>

          {/* Live Mic Action */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleRecord}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs tracking-wider transition-all shadow-lg ${
                isRecording
                  ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse shadow-rose-900/40'
                  : 'bg-teal-600 hover:bg-teal-500 text-slate-950 shadow-teal-950/40'
              }`}
            >
              {isRecording ? (
                <>
                  <Square className="w-4 h-4 fill-current" />
                  <span>ARRÊTER MICRO LIVE</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 fill-current" />
                  <span>ENREGISTRER EN DIRECT</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Workspace: Raw Transcript (Left) & Transmuted Output (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Raw Transcript Input / Live Dictation (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Mic className="w-4 h-4 text-teal-400" />
                Transcription Brute / Audio Capté
              </span>
              <span className="text-xs font-mono text-slate-400">
                {transcriptText.trim().split(/\s+/).length} mots
              </span>
            </div>

            <div className="my-3">
              <textarea
                value={transcriptText}
                onChange={(e) => setTranscriptText(e.target.value)}
                rows={11}
                placeholder="Parlez dans le micro ou collez votre transcription ici..."
                className="w-full bg-slate-950/90 text-slate-100 rounded-xl p-4 text-sm leading-relaxed border border-slate-800 focus:border-teal-500 outline-none resize-none font-sans"
              />
            </div>

            {/* Transmutation Action Buttons */}
            <div className="pt-2 border-t border-slate-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Reconvertir en 1 Clic vers :
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  onClick={() => handleRepurpose('podcast-script')}
                  disabled={isRefining}
                  className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-medium transition-all"
                >
                  <Users className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Script Podcast</span>
                </button>

                <button
                  onClick={() => handleRepurpose('social-reels')}
                  disabled={isRefining}
                  className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-pink-300 border border-slate-700 text-xs font-medium transition-all"
                >
                  <Flame className="w-3.5 h-3.5 text-pink-400" />
                  <span>Reel / TikTok</span>
                </button>

                <button
                  onClick={() => handleRepurpose('audiobook-chapter')}
                  disabled={isRefining}
                  className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 border border-slate-700 text-xs font-medium transition-all"
                >
                  <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                  <span>Livre Audio</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Re-purposed Master Content (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-teal-400" />
                Format Reconverti & Optimisé IA
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleCopy}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                  title="Copier"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={handleDownloadTxt}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-mono"
                  title="Télécharger TXT"
                >
                  <Download className="w-3 h-3 text-teal-400" />
                  <span>TXT</span>
                </button>
              </div>
            </div>

            {/* Display Transmuted Result */}
            {isRefining ? (
              <div className="h-[280px] flex flex-col items-center justify-center gap-3 text-slate-400">
                <Sparkles className="w-8 h-8 text-teal-400 animate-spin" />
                <span className="text-xs font-mono">Transformation IA en cours...</span>
              </div>
            ) : refinedResult ? (
              <div className="space-y-3 my-3">
                {refinedResult.refinedTitle && (
                  <div className="p-2.5 rounded-xl bg-teal-950/40 border border-teal-800/50">
                    <span className="text-[10px] font-mono uppercase text-teal-400 block mb-0.5">Titre optimisé</span>
                    <span className="text-sm font-bold text-white">{refinedResult.refinedTitle}</span>
                  </div>
                )}

                {refinedResult.socialHook && (
                  <div className="p-2.5 rounded-xl bg-pink-950/40 border border-pink-800/50">
                    <span className="text-[10px] font-mono uppercase text-pink-400 block mb-0.5">Accroche / Hook Viral</span>
                    <span className="text-xs font-medium text-pink-200">{refinedResult.socialHook}</span>
                  </div>
                )}

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 max-h-[220px] overflow-y-auto">
                  <pre className="text-xs text-slate-200 font-sans whitespace-pre-wrap leading-relaxed">
                    {refinedResult.repurposedContent}
                  </pre>
                </div>

                {/* Transfer to Studio VO */}
                {onSendToStudioVO && refinedResult.repurposedContent && (
                  <button
                    onClick={() => onSendToStudioVO(refinedResult.repurposedContent!)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold text-xs tracking-wider transition-all shadow-md"
                  >
                    <span>ENVOYER VERS LE STUDIO VO (SYNTHÈSE)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <div className="h-[280px] flex flex-col items-center justify-center gap-2 text-slate-500 p-6 text-center">
                <Sparkles className="w-8 h-8 text-slate-600 mb-1" />
                <p className="text-xs">
                  Choisissez une option de reconversion à gauche (Podcast, Réseaux Sociaux, Livre Audio) pour générer une version enrichie avec mise en scène et timecodes.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
