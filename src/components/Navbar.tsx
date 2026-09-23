import React from 'react';
import { StudioTab, LanguageCode } from '../types/studio';
import { 
  Mic2, 
  Users, 
  BookOpen, 
  FileText, 
  Sliders, 
  Music, 
  Sparkles, 
  Globe,
  Radio,
  Dna
} from 'lucide-react';

interface NavbarProps {
  currentTab: StudioTab;
  onTabChange: (tab: StudioTab) => void;
  language: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  isBgmActive: boolean;
  onToggleBgm: () => void;
  bgmTrackName: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  language,
  onLanguageChange,
  isBgmActive,
  onToggleBgm,
  bgmTrackName,
}) => {
  const tabs = [
    {
      id: 'studio-vo' as StudioTab,
      labelFr: 'Studio VO',
      labelEn: 'Studio VO',
      labelAr: 'ستوديو فويس أوفر',
      icon: Mic2,
      badge: 'IA 2026'
    },
    {
      id: 'voice-clone' as StudioTab,
      labelFr: 'Clonage Vocal',
      labelEn: 'Voice Cloning',
      labelAr: 'استنساخ الأصوات',
      icon: Dna,
      badge: 'Instant Clone'
    },
    {
      id: 'podcast' as StudioTab,
      labelFr: 'Podcast Studio',
      labelEn: 'Podcast Studio',
      labelAr: 'ستوديو البودكاست',
      icon: Users,
      badge: 'Multi-Voix'
    },
    {
      id: 'audiobook' as StudioTab,
      labelFr: 'Audiobook Studio',
      labelEn: 'Audiobook Studio',
      labelAr: 'ستوديو الكتب الصوتية',
      icon: BookOpen,
      badge: 'Smart Recap'
    },
    {
      id: 'transcript' as StudioTab,
      labelFr: 'Transcript Studio',
      labelEn: 'Transcript Studio',
      labelAr: 'ستوديو التفريغ الذكي',
      icon: FileText,
      badge: 'STT & Repurpose'
    },
    {
      id: 'mixer' as StudioTab,
      labelFr: 'Master Mixer',
      labelEn: 'Master Mixer',
      labelAr: 'المكسر الصوتي',
      icon: Sliders,
      badge: 'DSP FX'
    }
  ];

  const getTabLabel = (t: typeof tabs[0]) => {
    if (language === 'ar') return t.labelAr;
    if (language === 'en') return t.labelEn;
    return t.labelFr;
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 px-4 lg:px-6 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="relative group cursor-pointer" onClick={() => onTabChange('studio-vo')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-emerald-500 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1">
                Z12 <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">VOICE</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-semibold tracking-wider">
                v0 PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              {language === 'ar' ? 'منظومة الإنتاج الصوتي والهندسة الذكية' : 'AI Voice & Multi-Track Audio Suite'}
            </p>
          </div>
        </div>

        {/* Center Tabs Navigation */}
        <nav className="hidden md:flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all relative ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{getTabLabel(tab)}</span>
                {tab.badge && (
                  <span className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                    isActive ? 'bg-cyan-500/30 text-cyan-200' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Action Tools */}
        <div className="flex items-center gap-2.5">
          {/* Ambient BGM Quick Toggle */}
          <button
            onClick={onToggleBgm}
            title="Ambiance Studio BGM"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all border ${
              isBgmActive
                ? 'bg-indigo-950/80 text-indigo-300 border-indigo-700/70 shadow-sm shadow-indigo-500/20'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Music className={`w-3.5 h-3.5 ${isBgmActive ? 'text-indigo-400 animate-bounce' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">
              {isBgmActive ? bgmTrackName : 'BGM Off'}
            </span>
          </button>

          {/* Language Selector Dropdown */}
          <div className="flex items-center gap-1 bg-slate-900/90 rounded-lg p-1 border border-slate-800 text-xs">
            <Globe className="w-3.5 h-3.5 text-slate-400 ml-1" />
            <button
              onClick={() => onLanguageChange('fr')}
              className={`px-1.5 py-0.5 rounded font-medium transition-colors ${
                language === 'fr' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              FR
            </button>
            <button
              onClick={() => onLanguageChange('ar')}
              className={`px-1.5 py-0.5 rounded font-medium transition-colors ${
                language === 'ar' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              عربي
            </button>
            <button
              onClick={() => onLanguageChange('en')}
              className={`px-1.5 py-0.5 rounded font-medium transition-colors ${
                language === 'en' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              EN
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Tab Navigation */}
      <div className="md:hidden flex items-center justify-between gap-1 overflow-x-auto pt-2 pb-1 border-t border-slate-800/60 mt-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs whitespace-nowrap ${
                isActive ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{getTabLabel(tab)}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
