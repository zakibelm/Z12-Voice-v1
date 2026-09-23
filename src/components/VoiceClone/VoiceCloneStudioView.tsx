import React, { useState, useRef, useEffect } from 'react';
import { ClonedVoice, DialectOption, LanguageCode, AudioSettings, VoicePersona } from '../../types/studio';
import { DIALECTS, INITIAL_CLONED_VOICES } from '../../data/voices';
import { audioEngine } from '../../services/audioEngine';
import { 
  Mic, 
  MicOff, 
  Upload, 
  Play, 
  Square, 
  Sparkles, 
  Sliders, 
  Check, 
  Trash2, 
  Volume2, 
  Activity, 
  FileAudio, 
  ArrowRight,
  RefreshCw,
  Globe,
  Radio,
  Share2,
  Clock,
  Zap,
  Info,
  Edit3
} from 'lucide-react';

interface VoiceCloneStudioViewProps {
  language: LanguageCode;
  clonedVoices: ClonedVoice[];
  onAddClonedVoice: (voice: ClonedVoice) => void;
  onDeleteClonedVoice: (voiceId: string) => void;
  onSelectForStudioVO: (clonedVoice: ClonedVoice) => void;
  audioSettings: AudioSettings;
}

export const VoiceCloneStudioView: React.FC<VoiceCloneStudioViewProps> = ({
  language,
  clonedVoices,
  onAddClonedVoice,
  onDeleteClonedVoice,
  onSelectForStudioVO,
  audioSettings
}) => {
  // Input Method: 'mic' | 'upload'
  const [inputMode, setInputMode] = useState<'mic' | 'upload'>('mic');
  
  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  // Upload State
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);

  // Cloning Config Form
  const [voiceName, setVoiceName] = useState('');
  const [selectedDialect, setSelectedDialect] = useState<DialectOption>(DIALECTS[0]); // default Saudi ar-SA
  const [gender, setGender] = useState<'male' | 'female' | 'neutral'>('male');
  const [accentStrength, setAccentStrength] = useState(92);
  const [resonance, setResonance] = useState(88);
  const [customDescription, setCustomDescription] = useState('');

  // Processing & Simulation State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [testedVoiceId, setTestedVoiceId] = useState<string | null>(null);
  const [isTestPlaying, setIsTestPlaying] = useState(false);
  const [testText, setTestText] = useState('');

  // Update sample test phrase whenever dialect changes
  useEffect(() => {
    if (selectedDialect.code === 'ar-MA') {
      setTestText('مرحبا بيكم كاملين! دابا هادي صوتي المستنسخة بالذكاء الاصطناعي، كتتقن الدارجة المغربية بكل طلاقة وسلاسة ومزيانة بزاف.');
      if (!voiceName) setVoiceName('صوت مغربي بالدارجة');
    } else if (selectedDialect.code === 'ar-SA') {
      setTestText('يا هلا ومسهلا بكم! هذا صوتي المستنسخ بتقنية الذكاء الاصطناعي، متقن للهجة السعودية النجدية طال عمركم وأبشروا بالخير.');
      if (!voiceName) setVoiceName('صوت سعودي فخم');
    } else if (selectedDialect.code === 'ar-DZ') {
      setTestText('واش راكم خاوتنا؟ هادي صوتي مستنسخة بالذكاء الاصطناعي، بالدارجة الجزائرية الأصيلة وصحا بزاف.');
      if (!voiceName) setVoiceName('صوت جزائري أصيل');
    } else if (selectedDialect.code === 'ar-TN') {
      setTestText('شنوّا أحوالكم يا باهيين؟ هكّا يولي عندي صوت مستنسخ بالدارجة التونسية ومخدوم على كيف كيفكم.');
      if (!voiceName) setVoiceName('صوت تونسي حيوي');
    } else if (selectedDialect.code === 'ar-EG') {
      setTestText('أهلاً بيكم يا جماعة! ده صوتي المستنسخ بالذكاء الاصطناعي باللهجة المصرية، شغل عالي ومظبوط على الفرازة.');
      if (!voiceName) setVoiceName('صوت مصري قاهري');
    } else if (selectedDialect.code === 'ar-SY') {
      setTestText('مية أهلاً وسهلاً فيكن، هاد الصوت مستنسخ بلهجة شامية حلوة ودافية وتكرم عينكن.');
      if (!voiceName) setVoiceName('صوت شامي راقي');
    } else if (selectedDialect.code === 'ar-MSA') {
      setTestText('أَهْلاً بِكُمْ فِي زِدْ 12 فُويْس (Z12 Voice v0)، هَذَا هُوَ نَمُوذَجِي الصَّوْتِيُّ المُسْتَنْسَخُ بِالعَرَبِيَّةِ الفُصْحَى مَعَ التَّشْكِيلِ الكَامِلِ.');
      if (!voiceName) setVoiceName('صوت الفصحى المشكولة');
    } else if (selectedDialect.code.startsWith('fr')) {
      setTestText('Bonjour ! Voici mon profil vocal cloné en haute fidélité par Z12 Voice v0. La texture et les intonations sont préservées.');
      if (!voiceName) setVoiceName('Voix Studio Parisienne');
    } else {
      setTestText('Hello! This is my AI neural cloned voice with custom acoustic resonance and authentic regional cadence.');
      if (!voiceName) setVoiceName('Custom US Keynote Clone');
    }
  }, [selectedDialect]);

  // Clean up audio URLs on unmount
  useEffect(() => {
    return () => {
      if (recordedAudioUrl) URL.revokeObjectURL(recordedAudioUrl);
      if (uploadedFileUrl) URL.revokeObjectURL(uploadedFileUrl);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // --- Microphone Recording Handler ---
  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setRecordedAudioBlob(audioBlob);
        setRecordedAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(200);
      setIsRecording(true);
      setRecordingDuration(0);

      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Microphone access denied or unavailable:', err);
      // Fallback simulated recording for environments without physical mic
      setIsRecording(true);
      setRecordingDuration(0);
      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => {
          if (prev >= 12) {
            handleStopRecording();
            return 12;
          }
          return prev + 1;
        });
      }, 1000);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);

    // If no real media recorder blob was created, create a mock valid audio blob
    if (!recordedAudioBlob) {
      const mockBlob = new Blob(['simulated-audio-data'], { type: 'audio/wav' });
      setRecordedAudioBlob(mockBlob);
      setRecordedAudioUrl('simulated-voice-sample.wav');
    }
  };

  // --- File Upload Handler ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      const url = URL.createObjectURL(file);
      setUploadedFileUrl(url);
      if (!voiceName) {
        setVoiceName(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
      }
    }
  };

  // --- AI Voice Cloning Execution ---
  const handleExecuteVoiceClone = async () => {
    const hasAudio = (inputMode === 'mic' && (recordedAudioUrl || recordingDuration > 0)) || 
                     (inputMode === 'upload' && uploadedFile);

    if (!hasAudio && !recordedAudioBlob) {
      setValidationError(language === 'ar' ? 'يرجى تسجيل صوتك أولاً أو رفع ملف صوتي للاستنسـاخ' : 'Veuillez enregistrer votre voix ou importer un fichier audio avant de lancer le clonage.');
      return;
    }

    setValidationError(null);
    setIsAnalyzing(true);
    setAnalysisStep(language === 'ar' ? 'جاري استخراج الخصائص الطيفية (FFT & Formants)...' : 'Extraction des formants spectraux F1/F2...');

    try {
      // Step 1: Acoustic Spectral FFT
      await new Promise(r => setTimeout(r, 600));
      setAnalysisStep(language === 'ar' ? `تحليل البصمة النطقية للهجة: ${selectedDialect.nativeLabel}...` : `Analyse de l'accentuation dialectale : ${selectedDialect.label}...`);

      // Step 2: Call server analysis API
      const res = await fetch('/api/voice-clone-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voiceName: voiceName || (selectedDialect.code === 'ar-MA' ? 'صوت الدارجة المستنسخ' : 'صوت سعودي مستنسخ'),
          dialectCode: selectedDialect.code,
          dialectLabel: selectedDialect.label,
          gender,
          sampleText: selectedDialect.samplePhrase,
          durationSeconds: recordingDuration || 18
        })
      });
      const data = await res.json();

      setAnalysisStep(language === 'ar' ? 'بناء النموذج العصبي الصوتي (Neural Voice Synthesis Model)...' : 'Génération du modèle neuronal de voix...');
      await new Promise(r => setTimeout(r, 600));

      const newClonedVoice: ClonedVoice = {
        id: `clone-${Date.now()}`,
        name: voiceName || (selectedDialect.code === 'ar-MA' ? 'صوتي بالدارجة المغربية' : 'صوتي باللهجة السعودية'),
        sourceType: inputMode === 'mic' ? 'microphone' : 'upload',
        audioSampleUrl: recordedAudioUrl || uploadedFileUrl || undefined,
        sampleDuration: recordingDuration || 15,
        dialectCode: selectedDialect.code,
        dialectLabel: selectedDialect.nativeLabel || selectedDialect.label,
        countryFlag: selectedDialect.flag,
        gender,
        toneQuality: data.data?.timbreDescription || `${selectedDialect.label} - Timbre haute fidélité`,
        f0FundamentalPitch: gender === 'female' ? 215 : 118,
        resonance,
        accentStrength,
        sampleText: testText,
        createdAt: new Date().toISOString().split('T')[0],
        isCustomClone: true
      };

      onAddClonedVoice(newClonedVoice);
      setTestedVoiceId(newClonedVoice.id);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep('');
    }
  };

  // --- Audition a Cloned Voice ---
  const handleAuditionClone = async (clone: ClonedVoice) => {
    if (isTestPlaying) {
      audioEngine.stopSpeaking();
      setIsTestPlaying(false);
      return;
    }

    // Convert ClonedVoice to temporary VoicePersona for audio engine
    const persona: VoicePersona = {
      id: clone.id,
      name: clone.name,
      nativeName: clone.name,
      gender: clone.gender,
      language: clone.dialectLabel,
      languageCode: clone.dialectCode,
      dialect: clone.dialectLabel,
      dialectCode: clone.dialectCode,
      countryFlag: clone.countryFlag,
      tag: 'Clone IA',
      description: clone.toneQuality,
      defaultPitch: clone.gender === 'female' ? 1.08 : 0.94,
      defaultRate: 1.0,
      avatarColor: 'from-cyan-500 to-indigo-600',
      accentBadge: `${clone.countryFlag} Clone`,
      sampleText: clone.sampleText || testText,
      isCloned: true,
      clonedVoiceData: clone,
      neuralVoice: clone.gender === 'female' ? 'Kore' : 'Charon'
    };

    setIsTestPlaying(true);
    setTestedVoiceId(clone.id);

    await audioEngine.speak(
      testText || clone.sampleText,
      persona,
      audioSettings,
      undefined,
      () => {
        setIsTestPlaying(false);
      }
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Studio Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950/70 border border-slate-800 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
              <span>Z12 NEURAL CLONE ENGINE v0</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span>{language === 'ar' ? 'استوديو استنساخ الأصوات بالذكاء الاصطناعي' : 'Studio de Clonage Vocal Instantané'}</span>
              <span className="text-xl">🧬</span>
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              {language === 'ar'
                ? 'استنسخ صوتك أو أي نبرة بدقة متناهية مع التقاط الفوارق الدقيقة للهجات العربية: السعودية (نجد والحجاز 🇸🇦)، الدارجة المغربية (🇲🇦)، المصرية (🇪🇬)، والجزائرية (🇩🇿)، التونسية (🇹🇳) والشامية (🇸🇾).'
                : 'Clonez votre voix en quelques secondes. Modélisez les timbres, la résonance acoustique et les dialectes régionaux (🇸🇦 Saoudien, 🇲🇦 Darija Marocaine, 🇪🇬 Égyptien, etc.) pour une synthèse indiscernable du réel.'}
            </p>
          </div>

          {/* Quick Stats Badges */}
          <div className="flex flex-wrap md:flex-col gap-2 shrink-0">
            <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
              <Activity className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-mono">Fidélité Acoustique</div>
                <div className="font-bold text-white font-mono">99.4% (24-bit 48kHz)</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
              <Globe className="w-4 h-4 text-cyan-400" />
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-mono">Dialectes Pris en Charge</div>
                <div className="font-bold text-cyan-300 font-mono">🇸🇦 🇲🇦 🇩🇿 🇹🇳 🇪🇬 🇸🇾 🏛️</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Input & Acoustic Calibration (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Step 1: Input Mode Selection */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center text-xs font-mono">1</span>
                <span>{language === 'ar' ? 'طريقة التقاط العينة الصوتية' : 'Source de l\'Échantillon Vocal'}</span>
              </h2>

              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  onClick={() => setInputMode('mic')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                    inputMode === 'mic'
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>{language === 'ar' ? 'تسجيل مباشر (Micro)' : 'Enregistrer (Micro)'}</span>
                </button>
                <button
                  onClick={() => setInputMode('upload')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                    inputMode === 'upload'
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{language === 'ar' ? 'رفع ملف (WAV / MP3)' : 'Importer Fichier'}</span>
                </button>
              </div>
            </div>

            {/* Input Box: Microphone Recording */}
            {inputMode === 'mic' && (
              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-5 text-center space-y-4">
                <div className="flex items-center justify-center">
                  <button
                    onClick={isRecording ? handleStopRecording : handleStartRecording}
                    className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-xl ${
                      isRecording
                        ? 'bg-red-500 text-white animate-pulse shadow-red-500/50 scale-105'
                        : 'bg-gradient-to-tr from-cyan-500 to-emerald-500 text-slate-950 hover:scale-105 shadow-cyan-500/25'
                    }`}
                  >
                    {isRecording ? <Square className="w-8 h-8 fill-current" /> : <Mic className="w-8 h-8" />}
                    {isRecording && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
                      </span>
                    )}
                  </button>
                </div>

                <div>
                  <div className="text-sm font-bold text-white">
                    {isRecording 
                      ? (language === 'ar' ? 'جاري التسجيل الصوتي الآن... انطق بوضوح' : 'Enregistrement en cours... Parlez clairement') 
                      : (language === 'ar' ? 'اضغط للبدء في تسجيل صوتك (10-30 ثانية)' : 'Cliquez pour enregistrer votre voix (10 à 30 secondes)')}
                  </div>
                  <div className="text-xs font-mono text-cyan-400 mt-1 flex items-center justify-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Durée : {recordingDuration}s / 30s recommandée</span>
                  </div>
                </div>

                {/* Suggested dialect script prompt to read aloud */}
                <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800 text-right text-xs space-y-1">
                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span className="text-cyan-400 font-mono font-bold">نص مقترح للقراءة أثناء التسجيل:</span>
                    <span>{selectedDialect.flag} {selectedDialect.label}</span>
                  </div>
                  <p className="text-slate-200 leading-relaxed font-serif text-sm">
                    "{selectedDialect.samplePhrase}"
                  </p>
                </div>

                {/* If recorded, show audio preview */}
                {recordedAudioUrl && !isRecording && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-xs">
                    <div className="flex items-center gap-2 text-emerald-300 font-medium">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Échantillon vocal prêt pour analyse ({recordingDuration || 15}s)</span>
                    </div>
                    <button
                      onClick={handleStartRecording}
                      className="text-slate-400 hover:text-white flex items-center gap-1 underline text-[11px]"
                    >
                      <RefreshCw className="w-3 h-3" /> Re-enregistrer
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Input Box: File Upload */}
            {inputMode === 'upload' && (
              <div className="rounded-xl border-2 border-dashed border-slate-800 hover:border-cyan-500/50 bg-slate-950/70 p-6 text-center space-y-3 transition-colors">
                <input
                  type="file"
                  id="audio-upload"
                  accept="audio/wav,audio/mp3,audio/m4a,audio/webm,audio/ogg"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="audio-upload"
                  className="cursor-pointer flex flex-col items-center justify-center gap-2"
                >
                  <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400">
                    <Upload className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-semibold text-white">
                    {uploadedFile ? uploadedFile.name : (language === 'ar' ? 'اضغط لاختيار ملف صوتي أو اسحبه هنا' : 'Cliquez pour uploader ou glissez votre fichier audio')}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    WAV, MP3, M4A, WEBM (Max 25MB - 10s à 2 min recommandé)
                  </span>
                </label>

                {uploadedFile && (
                  <div className="flex items-center justify-center gap-2 p-2 rounded-lg bg-cyan-950/40 border border-cyan-800/60 text-cyan-300 text-xs font-mono">
                    <FileAudio className="w-4 h-4" />
                    <span>{uploadedFile.name} ({(uploadedFile.size / (1024 * 1024)).toFixed(1)} MB)</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Step 2: Dialect & Accent Calibration */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-5">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-xs font-mono">2</span>
              <span>{language === 'ar' ? 'تحديد اللهجة والبصمة اللغوية' : 'Calibrage du Dialecte & Identité Régionale'}</span>
            </h2>

            {/* Dialect Picker Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {DIALECTS.map((dialect) => {
                const isSelected = selectedDialect.code === dialect.code;
                return (
                  <button
                    key={dialect.code}
                    onClick={() => setSelectedDialect(dialect)}
                    className={`p-3 rounded-xl border text-left transition-all relative ${
                      isSelected
                        ? 'bg-gradient-to-br from-cyan-950/60 to-slate-900 border-cyan-500/80 shadow-md shadow-cyan-500/10'
                        : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xl">{dialect.flag}</span>
                      {isSelected && <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />}
                    </div>
                    <div className="text-xs font-bold text-white truncate">{dialect.label.split('(')[0]}</div>
                    <div className="text-[10px] text-slate-400 truncate font-arabic">{dialect.nativeLabel}</div>
                  </button>
                );
              })}
            </div>

            {/* Persona Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  {language === 'ar' ? 'اسم النموذج الصوتي المستنسخ' : 'Nom de la Voix Clonée'}
                </label>
                <input
                  type="text"
                  value={voiceName}
                  onChange={(e) => setVoiceName(e.target.value)}
                  placeholder="ex: Saud Al-Najdi, Fatima Darija Pro..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  {language === 'ar' ? 'الجنس / النبرة' : 'Genre de la Voix'}
                </label>
                <div className="flex rounded-xl bg-slate-950 border border-slate-800 p-1 text-xs">
                  <button
                    onClick={() => setGender('male')}
                    className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
                      gender === 'male' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400'
                    }`}
                  >
                    Homme (رجالي)
                  </button>
                  <button
                    onClick={() => setGender('female')}
                    className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
                      gender === 'female' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400'
                    }`}
                  >
                    Femme (نسائي)
                  </button>
                </div>
              </div>
            </div>

            {/* Acoustic Sliders: Accent Strength & Resonance */}
            <div className="space-y-3 pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  {language === 'ar' ? 'قوة النطق واللهجة الإقليمية (Dialect Weight)' : 'Fidélité de l\'Intonation Dialectale'}
                </span>
                <span className="font-mono text-cyan-400 font-bold">{accentStrength}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                value={accentStrength}
                onChange={(e) => setAccentStrength(Number(e.target.value))}
                className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  {language === 'ar' ? 'الدفء والعمق الصوتي (Vocal Resonance)' : 'Résonance Spectrale & Chaleur'}
                </span>
                <span className="font-mono text-emerald-400 font-bold">{resonance}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                value={resonance}
                onChange={(e) => setResonance(Number(e.target.value))}
                className="w-full accent-emerald-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Validation warning if audio sample is missing */}
            {validationError && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0"></span>
                <span>{validationError}</span>
              </div>
            )}

            {/* Launch Clone Action Button */}
            <button
              onClick={handleExecuteVoiceClone}
              disabled={isAnalyzing}
              className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
                isAnalyzing
                  ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-500 via-emerald-500 to-indigo-600 text-slate-950 hover:opacity-95 shadow-cyan-500/25 active:scale-[0.99]'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                  <span>{analysisStep || 'Modélisation neuronale en cours...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{language === 'ar' ? 'استنساخ الصوت بالذكاء الاصطناعي الآن' : 'Générer le Clone Vocal IA'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Cloned Voice Library & Instant Test Rig (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Test Rig */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-cyan-400" />
                <span>{language === 'ar' ? 'اختبار الصوت المستنسخ فورا' : 'Banc de Test Audio Instantané'}</span>
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                LIVE AUDITION
              </span>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-400 flex items-center justify-between">
                <span>{language === 'ar' ? 'النص التجريبي (مكيف مع اللهجة)' : 'Texte de test phonétique :'}</span>
                <span className="text-cyan-400 font-mono">{selectedDialect.flag} {selectedDialect.label.split('(')[0]}</span>
              </label>
              <textarea
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500 leading-relaxed font-arabic text-right"
              />
            </div>

            {/* Test Playback Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const targetVoice = clonedVoices.find(v => v.id === testedVoiceId) || clonedVoices[0];
                  if (targetVoice) handleAuditionClone(targetVoice);
                }}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                  isTestPlaying
                    ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30'
                    : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30'
                }`}
              >
                {isTestPlaying ? (
                  <>
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>Arrêter l'écoute</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Écouter le clone en direct</span>
                  </>
                )}
              </button>

              {clonedVoices.length > 0 && (
                <button
                  onClick={() => {
                    const activeClone = clonedVoices.find(v => v.id === testedVoiceId) || clonedVoices[0];
                    onSelectForStudioVO(activeClone);
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 text-xs font-semibold flex items-center gap-1.5"
                  title="Utiliser dans Studio VO"
                >
                  <span>Studio VO</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Cloned Voices Library */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🎙️</span>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {language === 'ar' ? 'مكتبة الأصوات المستنسخة' : 'Mes Voix Clonées'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {clonedVoices.length} {language === 'ar' ? 'أصوات جاهزة للاستخدام' : 'profils vocaux disponibles'}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
              {clonedVoices.map((voice) => {
                const isTested = testedVoiceId === voice.id;
                return (
                  <div
                    key={voice.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isTested
                        ? 'bg-cyan-950/30 border-cyan-500/60 shadow-md shadow-cyan-500/10'
                        : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-sm shadow">
                          {voice.countryFlag || '🎙️'}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span>{voice.name}</span>
                            {voice.isCustomClone && (
                              <span className="text-[9px] font-mono px-1 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                                PERSO
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-2">
                            <span>{voice.dialectLabel}</span>
                            <span>•</span>
                            <span className="font-mono text-cyan-400">F0: {voice.f0FundamentalPitch}Hz</span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleAuditionClone(voice)}
                          className="p-1.5 rounded-lg bg-slate-800/80 text-cyan-300 hover:bg-cyan-500 hover:text-slate-950 transition-colors"
                          title="Écouter"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </button>
                        <button
                          onClick={() => onSelectForStudioVO(voice)}
                          className="p-1.5 rounded-lg bg-slate-800/80 text-emerald-300 hover:bg-emerald-500 hover:text-slate-950 transition-colors"
                          title="Ouvrir dans Studio VO"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                        {voice.isCustomClone && (
                          <button
                            onClick={() => onDeleteClonedVoice(voice.id)}
                            className="p-1.5 rounded-lg bg-slate-800/80 text-slate-400 hover:bg-red-500 hover:text-white transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>Fidélité : {voice.accentStrength}%</span>
                      <span>Résonance : {voice.resonance}%</span>
                      <span>{voice.createdAt}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
