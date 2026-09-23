import { VoicePersona, DialectOption, TonePreset, ClonedVoice } from '../types/studio';

export const DIALECTS: DialectOption[] = [
  {
    code: 'ar-SA',
    label: 'Arabie Saoudite / Golfe (السعودية - نجد وحجاز)',
    nativeLabel: 'اللهجة السعودية (نجدية / حجازية)',
    region: 'Riyadh, Jeddah, Golfe Arabique',
    flag: '🇸🇦',
    samplePhrase: 'هلا والله ومسهلا بكم في زد 12 فويس (Z12 Voice v0)، اليوم بنسوي شغل جبار بالذكاء الاصطناعي، طال عمرك كل شيء صار أسهل وأسرع وأبشر بالخير.',
    description: 'Ton prestigieux, chaleureux et respectueux, avec les expressions authentiques de Riyad et du Hedjaz.'
  },
  {
    code: 'ar-MA',
    label: 'Maroc / Darija (الدارجة المغربية الأصيلة)',
    nativeLabel: 'الدارجة المغربية (مراكش، كازا، فاس)',
    region: 'Maroc (Maghreb)',
    flag: '🇲🇦',
    samplePhrase: 'مرحبا بيكم كاملين معانا فـ زد 12 فويس (Z12 Voice v0). دابا بالذكاء الاصطناعي غادي تصنعو صوت واعر ومزيان بزاف بلا صداع الراس، صافي كلشي ساهل وتكايس غير بشوية!',
    description: 'La Darija marocaine authentique avec ses expressions uniques (دابا، بزاف، مزيان، صافي، واخا).'
  },
  {
    code: 'ar-DZ',
    label: 'Algérie / Darja (الدارجة الجزائرية)',
    nativeLabel: 'الدارجة الجزائرية (العاصمة ووهران)',
    region: 'Algérie',
    flag: '🇩🇿',
    samplePhrase: 'واش راكم خاوتنا؟ مرحبا بكم في زد 12 فويس (Z12 Voice v0)، اليوم رانا رايحين نكتشفو أصوات بالذكاء الاصطناعي قمة في الروعة، صحا بزاف وليامات الجايين كاين جديد كبير.',
    description: 'Rythme percutant, chaleureux et spontané avec les expressions algériennes populaires.'
  },
  {
    code: 'ar-TN',
    label: 'Tunisie / Darija (الدارجة التونسية)',
    nativeLabel: 'الدارجة التونسية (تونس العاصمة والساحل)',
    region: 'Tunisie',
    flag: '🇹🇳',
    samplePhrase: 'شنوّا أحوالكم يا جماعة؟ على سلامتكم في زد 12 فويس (Z12 Voice v0)، اليوم باش نعملو خدمة ممتازة وبرشا باهية بالصوت والذكاء الاصطناعي، يعيّشكم ونورتونا.',
    description: 'Mélodieuse, chantante et rapide avec le vocabulaire tunisien typique (شنوّا، برشا، يعيّشك، باهي).'
  },
  {
    code: 'ar-EG',
    label: 'Égypte / Masri (اللهجة المصرية القاهرية)',
    nativeLabel: 'اللهجة المصرية (القاهرة والإسكندرية)',
    region: 'Égypte & Médias Panarabes',
    flag: '🇪🇬',
    samplePhrase: 'أهلاً بيكم يا فندم في زد 12 فويس (Z12 Voice v0)، النهاردة هنعمل شغل عالي جداً وفوق الخيال بالذكاء الاصطناعي، كل حاجة محسوبة بالمللي وعايزين نسمعكم أحلى أداء.',
    description: 'Le dialecte populaire égyptien, universellement compris, idéal pour la publicité et le cinéma.'
  },
  {
    code: 'ar-SY',
    label: 'Levantin / Shami (اللهجة الشامية - سوريا ولبنان)',
    nativeLabel: 'اللهجة الشامية (دمشق، بيروت، عمّان)',
    region: 'Syrie, Liban, Jordanie',
    flag: '🇸🇾',
    samplePhrase: 'مية أهلاً وسهلاً فيكن معنا باستوديو زد 12 فويس (Z12 Voice v0)، كيفكن شو الأخبار؟ اليوم رح نقدم تجربة صوتية بتاخد العقل، كل شي صار بين إيديكن وتكرم عينكن.',
    description: 'Doux, poétique, mélodieux et très prisé dans le doublage et les séries dramatiques.'
  },
  {
    code: 'ar-MSA',
    label: 'Arabe Standard / Fusha (الفصحى بالتشكيل الكامل)',
    nativeLabel: 'العربية الفصحى المشكولة بالإعراب',
    region: 'Documentaires, Littérature & Médias Officiels',
    flag: '🏛️',
    samplePhrase: 'أهْلاً بِكُمْ فِي مَنَصَّةِ زِدْ 12 فُويْس (Z12 Voice v0)، حَيْثُ نَمْزُجُ سِحْرَ الصَّوْتِ بِقُوَّةِ الذَّكَاءِ الاصْطِنَاعِيِّ الفَائِقِ لِصِنَاعَةِ نَمَاذِجَ صَوْتِيَّةٍ عَالِيَةِ الدِّقَّةِ.',
    description: 'Élocution solennelle et académique avec diacritiques complets (Tashkeel) pour une prononciation sans faille.'
  },
  {
    code: 'fr-FR',
    label: 'Français (Studio Parisien)',
    nativeLabel: 'Français International',
    region: 'France, Europe, Afrique francophone',
    flag: '🇫🇷',
    samplePhrase: 'Bienvenue sur Z12 Voice v0. Donnez une voix ultra-réaliste à tous vos projets avec notre moteur de synthèse neuronale.',
    description: 'Clarté broadcast, texture chaleureuse, parfait pour publicités, documentaires et podcasts.'
  },
  {
    code: 'en-US',
    label: 'English (US Broadcast)',
    nativeLabel: 'American English',
    region: 'Global & North America',
    flag: '🇺🇸',
    samplePhrase: 'Welcome to Z12 Voice v0. The next generation of neural voice production and custom dialect modeling.',
    description: 'Crisp, commanding, and punchy sound for global product launches and commercial ads.'
  }
];

export const DIALECT_EXPRESSIONS: Record<string, { label: string; insert: string; meaning: string }[]> = {
  'ar-SA': [
    { label: 'هلا والله', insert: 'هلا والله ومسهلا', meaning: 'Bienvenue chaleureuse' },
    { label: 'طال عمرك', insert: 'طال عمرك', meaning: 'Formule de déférence prestigieuse' },
    { label: 'أبشر بسعدك', insert: 'أبشر بسعدك', meaning: 'Avec grand plaisir / À vos ordres' },
    { label: 'شلونك', insert: 'شلونك عساك طيب', meaning: 'Comment vas-tu ?' },
    { label: 'يا بعد حيي', insert: 'يا بعد حيي', meaning: 'Marque d\'affection profonde' },
    { label: 'ما شاء الله', insert: 'ما شاء الله تبارك الرحمن', meaning: 'Bénédiction et admiration' },
    { label: 'ودنا نسولف', insert: 'ودنا نسولف معكم', meaning: 'On aimerait papoter ensemble' }
  ],
  'ar-MA': [
    { label: 'دابا', insert: 'دابا دابا', meaning: 'Maintenant / Tout de suite' },
    { label: 'بزاف', insert: 'بزاف مزيان', meaning: 'Beaucoup / Très bien' },
    { label: 'صافي واخا', insert: 'صافي واخا هكاك', meaning: 'C\'est d\'accord / Parfait' },
    { label: 'لاباس عليك', insert: 'كيدير لاباس عليك؟', meaning: 'Comment te portes-tu ?' },
    { label: 'تبارك الله', insert: 'تبارك الله عليك', meaning: 'Bravo / Chapeau' },
    { label: 'غير بشوية', insert: 'غير بشوية عليك', meaning: 'Doucement / Prends ton temps' },
    { label: 'كاين ما يدار', insert: 'كاين ما يدار اليوم', meaning: 'Il y a plein de choses à faire' },
    { label: 'واعر بزاف', insert: 'هاد الشي واعر بزاف', meaning: 'C\'est absolument génial' }
  ],
  'ar-DZ': [
    { label: 'واش راك', insert: 'واش راك خويا؟', meaning: 'Comment vas-tu mon frère ?' },
    { label: 'صحا بزاف', insert: 'صحا بزاف يعطيك الصحة', meaning: 'Merci beaucoup' },
    { label: 'لاباس', insert: 'لاباس الحمد لله', meaning: 'Ça va très bien' },
    { label: 'كاش جديد', insert: 'كاش جديد عندكم؟', meaning: 'Des nouvelles ?' },
    { label: 'راك فاهم', insert: 'راك فاهم ياك؟', meaning: 'Tu as compris n\'est-ce pas ?' }
  ],
  'ar-TN': [
    { label: 'شنوّا أحوالك', insert: 'شنوّا أحوالكم يا غاليين؟', meaning: 'Comment allez-vous les chers ?' },
    { label: 'برشا باهي', insert: 'برشا باهي والله', meaning: 'Vraiment très bon / Super' },
    { label: 'يعيّشك', insert: 'يعيّشك ويكثر خيرك', meaning: 'Que Dieu te garde / Merci' },
    { label: 'توّا توّا', insert: 'توّا توّا نحلوها', meaning: 'Immédiatement' }
  ],
  'ar-EG': [
    { label: 'إزيك يا باشا', insert: 'إزيك يا باشا عامل إيه؟', meaning: 'Comment vas-tu mon grand ?' },
    { label: 'كويس جداً', insert: 'كويس جداً وزي الفل', meaning: 'Très bien, comme une fleur' },
    { label: 'عايز أقلك', insert: 'عايز أقلك على سر مهم', meaning: 'Je veux te dire un truc' },
    { label: 'يا فندم', insert: 'يا فندم ده شغل عالي', meaning: 'Monsieur, c\'est du travail de haut vol' }
  ],
  'ar-SY': [
    { label: 'شو الأخبار', insert: 'شو الأخبار كيفكن اليوم؟', meaning: 'Quelles sont les nouvelles ?' },
    { label: 'كتير منيح', insert: 'كتير منيح وبياخد العقل', meaning: 'Très bien, à couper le souffle' },
    { label: 'تكرم عينك', insert: 'تكرم عينك من عيوني', meaning: 'À ton service avec plaisir' },
    { label: 'شو بدك', insert: 'شو بدك أحسن من هيك؟', meaning: 'Que veux-tu de mieux ?' }
  ],
  'ar-MSA': [
    { label: 'بِكُلِّ تَأْكِيدٍ', insert: 'بِكُلِّ تَأْكِيدٍ وَيَقِينٍ', meaning: 'Sans aucun doute' },
    { label: 'مِنَ الجَدِيرِ بِالذِّكْرِ', insert: 'مِنَ الجَدِيرِ بِالذِّكْرِ أَنَّ', meaning: 'Il convient de mentionner que' },
    { label: 'عَلَى كَافَّةِ الأَصْعِدَةِ', insert: 'عَلَى كَافَّةِ الأَصْعِدَةِ وَالمَسْتَوَيَاتِ', meaning: 'À tous les niveaux' }
  ]
};

export const INITIAL_CLONED_VOICES: ClonedVoice[] = [
  {
    id: 'clone-saud-khaliji',
    name: 'Saud Al-Najdi (Clone IA)',
    sourceType: 'upload',
    sampleDuration: 24,
    dialectCode: 'ar-SA',
    dialectLabel: 'Arabie Saoudite (Najd)',
    countryFlag: '🇸🇦',
    gender: 'male',
    toneQuality: 'Profond, solennel avec timbre guttural chaleureux',
    f0FundamentalPitch: 108,
    resonance: 92,
    accentStrength: 95,
    sampleText: 'طال عمرك، هذا النموذج الصوتي مستنسخ من جلسة تسجيل في الرياض بدقة 24-بت.',
    createdAt: '2026-09-15',
    isCustomClone: false
  },
  {
    id: 'clone-fatima-darija',
    name: 'Fatima El-Fassi (Clone Darija)',
    sourceType: 'microphone',
    sampleDuration: 30,
    dialectCode: 'ar-MA',
    dialectLabel: 'Maroc (Darija Fès/Casa)',
    countryFlag: '🇲🇦',
    gender: 'female',
    toneQuality: 'Mélodique, spontané et chaleureux avec cadences marocaines',
    f0FundamentalPitch: 220,
    resonance: 88,
    accentStrength: 98,
    sampleText: 'دابا هاد الصوت مستنسخ بالذكاء الاصطناعي، كيتقن الدارجة المغربية بكل دقة وسلاسة.',
    createdAt: '2026-09-18',
    isCustomClone: false
  }
];

export const VOICES: VoicePersona[] = [
  // 1. Arabie Saoudite & Golfe (ar-SA)
  {
    id: 'saud-riyadh',
    name: 'Saud Al-Riyadh (الماستر السعودي)',
    nativeName: 'سعود الرياض (فخامة نجدية)',
    gender: 'male',
    language: 'Arabe Saoudien',
    languageCode: 'ar-SA',
    dialect: 'Saoudien Najdi & Corporate',
    dialectCode: 'ar-SA',
    countryFlag: '🇸🇦',
    neuralVoice: 'Charon',
    tag: 'Prestige & National',
    description: 'Voix majestueuse saoudienne, profonde et solennelle pour les spots premium, vision 2030 et keynotes.',
    defaultPitch: 0.94,
    defaultRate: 0.97,
    avatarColor: 'from-emerald-600 to-green-900',
    accentBadge: '🇸🇦 Saoudien',
    sampleText: 'يا هلا ومسهلا بكم في زد اثنا عشر فويس، نبتكر اليوم أحدث التجارب الصوتية الذكية طال عمركم.',
    proFeatures: ['Najdi Cadence', 'Sub-Bass Resonance', 'Corporate Gravitas'],
    dialectKeywords: ['هلا والله', 'طال عمرك', 'أبشر بسعدك', 'شلونك']
  },
  {
    id: 'reem-hijaz',
    name: 'Reem Al-Hijaz (ريم الحجازية)',
    nativeName: 'ريم الحجازية (لطافة الحجاز)',
    gender: 'female',
    language: 'Arabe Saoudien',
    languageCode: 'ar-SA',
    dialect: 'Saoudien Hejazi & Moderne',
    dialectCode: 'ar-SA',
    countryFlag: '🇸🇦',
    neuralVoice: 'Kore',
    tag: 'Chaleureuse & Podcast',
    description: 'Douceur et élégance du dialecte hedjazi (Djeddah/Médine), parfait pour les récits, podcasts et marques.',
    defaultPitch: 1.05,
    defaultRate: 1.0,
    avatarColor: 'from-teal-500 to-emerald-700',
    accentBadge: '🇸🇦 Hejazi',
    sampleText: 'أهلاً بكم من قلب جدة التاريخية، تعالوا نستكشف مع بعض كيف الذكاء الاصطناعي بيغير كل شيء.',
    proFeatures: ['Hejazi Softness', 'Natural Laughs', 'Lifestyle Flow'],
    dialectKeywords: ['يا هلا', 'عساكم بخير', 'ما شاء الله']
  },

  // 2. Maroc & Darija (ar-MA)
  {
    id: 'yassine-casawi',
    name: 'Yassine El-Casawi (ياسين البيضاوي)',
    nativeName: 'ياسين البيضاوي (طاقة الدارجة)',
    gender: 'male',
    language: 'Darija Marocaine',
    languageCode: 'ar-MA',
    dialect: 'Darija Marocaine Urbaine',
    dialectCode: 'ar-MA',
    countryFlag: '🇲🇦',
    neuralVoice: 'Puck',
    tag: 'Urbain & Viraux',
    description: 'Énergie jeune et communicative de Casablanca, parfait pour les créateurs de contenu TikTok, YouTube et podcasts.',
    defaultPitch: 1.02,
    defaultRate: 1.06,
    avatarColor: 'from-red-600 to-rose-700',
    accentBadge: '🇲🇦 Darija',
    sampleText: 'واش راك واجد لتجربة صوتية جديدة؟ دابا زد اثنا عشر فويس كيبدل قواعد اللعبة تماماً وبلا صداع الراس!',
    proFeatures: ['Moroccan Slang Capable', 'Bilingual Darija/FR', 'High Energy Punch'],
    dialectKeywords: ['دابا', 'بزاف', 'مزيان', 'صافي واخا']
  },
  {
    id: 'fatima-marrakchia',
    name: 'Fatima Zahra (فاطمة الزهراء)',
    nativeName: 'فاطمة الزهراء المراكشية',
    gender: 'female',
    language: 'Darija Marocaine',
    languageCode: 'ar-MA',
    dialect: 'Darija Marocaine Storytelling',
    dialectCode: 'ar-MA',
    countryFlag: '🇲🇦',
    neuralVoice: 'Zephyr',
    tag: 'Conteuse & Voix Douce',
    description: 'Chaleur marocaine authentique avec intonations chantantes de Marrakech et Fès, idéale pour documentaires et pubs familiales.',
    defaultPitch: 1.06,
    defaultRate: 0.98,
    avatarColor: 'from-amber-500 to-red-600',
    accentBadge: '🇲🇦 Darija',
    sampleText: 'مرحبا بيكم معانا، اليوم غادي نحكي ليكم حكاية خاصة بالدارجة ديالنا الزوينة، تبعو معايا غير بشوية.',
    proFeatures: ['Traditional Lilt', 'Emotional Warmth', 'Proximity Mic'],
    dialectKeywords: ['غير بشوية', 'تبارك الله', 'كاين ما يدار']
  },

  // 3. Algérie & Darja (ar-DZ)
  {
    id: 'karim-jazaïri',
    name: 'Karim Al-Jazaïri (كريم العاصمي)',
    nativeName: 'كريم العاصمي (الجزائر)',
    gender: 'male',
    language: 'Darja Algérienne',
    languageCode: 'ar-DZ',
    dialect: 'Darja Algéroise & Oranaise',
    dialectCode: 'ar-DZ',
    countryFlag: '🇩🇿',
    neuralVoice: 'Fenrir',
    tag: 'Rythme & Authenticité',
    description: 'Voix franche, dynamique et chaleureuse avec l\'accent typique de la baie d\'Alger et d\'Oran.',
    defaultPitch: 0.98,
    defaultRate: 1.04,
    avatarColor: 'from-emerald-600 to-teal-800',
    accentBadge: '🇩🇿 Algérien',
    sampleText: 'واش راكم خاوتنا؟ اليوم رانا فرحانين بزاف باش نقدمو هاد المنظومة الصوتية الخارقة في بلادنا.',
    proFeatures: ['Algerian Dialect Phonology', 'Punchy Cadence', 'Sub-Mid Boost'],
    dialectKeywords: ['واش راك خويا', 'صحا بزاف', 'لاباس', 'كاش جديد']
  },

  // 4. Tunisie & Darija (ar-TN)
  {
    id: 'syrine-tunis',
    name: 'Syrine Tunisienne (سيرين التونسية)',
    nativeName: 'سيرين التونسية (تونس)',
    gender: 'female',
    language: 'Darija Tunisienne',
    languageCode: 'ar-TN',
    dialect: 'Darija Tunisienne Chantante',
    dialectCode: 'ar-TN',
    countryFlag: '🇹🇳',
    neuralVoice: 'Zephyr',
    tag: 'Pétillante & Radio',
    description: 'Voix dynamique et expressive typique de Tunis et Sousse, parfaite pour la radio et les pubs télévisées.',
    defaultPitch: 1.08,
    defaultRate: 1.05,
    avatarColor: 'from-red-500 to-indigo-700',
    accentBadge: '🇹🇳 Tunisien',
    sampleText: 'شنوّا أحوالكم يا باهيين؟ نرحب بيكم برشا في زد اثنا عشر فويس، اليوم الخدمة مخدومة على كيف كيفكم.',
    proFeatures: ['Tunisian Musicality', 'Fast Flow', 'Warm Highs'],
    dialectKeywords: ['شنوّا أحوالك', 'برشا باهي', 'يعيّشك', 'توّا توّا']
  },

  // 5. Égypte & Masri (ar-EG)
  {
    id: 'savio-prime',
    name: 'Ahmed Masri (أحمد القاهري)',
    nativeName: 'أحمد القاهري (ماستر مصر)',
    gender: 'male',
    language: 'Arabe Égyptien',
    languageCode: 'ar-EG',
    dialect: 'Égyptien Masri & Fusha',
    dialectCode: 'ar-EG',
    countryFlag: '🇪🇬',
    neuralVoice: 'Puck',
    tag: 'Signature Pro',
    description: 'La voix emblématique égyptienne : timbre engageant, percutant, ultra-précis et universel.',
    defaultPitch: 1.0,
    defaultRate: 1.0,
    avatarColor: 'from-cyan-500 to-blue-600',
    accentBadge: '🇪🇬 Masri',
    sampleText: 'أهلاً بيكم في زد اثنا عشر فويس، قمة الإبداع الصوتي بتقنيات الذكاء الاصطناعي المتقدمة.',
    proFeatures: ['Neural Dialect Engine', 'Dynamic Breath Control', 'Extreme Resonance'],
    dialectKeywords: ['إزيك يا باشا', 'كويس جداً', 'ده شغل عالي']
  },
  {
    id: 'layla-masri',
    name: 'Layla El-Masria (ليلى المصرية)',
    nativeName: 'ليلى المصرية (طاقة السينما)',
    gender: 'female',
    language: 'Arabe Égyptien',
    languageCode: 'ar-EG',
    dialect: 'Égyptien Masri Médias',
    dialectCode: 'ar-EG',
    countryFlag: '🇪🇬',
    neuralVoice: 'Kore',
    tag: 'Storytelling & Émotion',
    description: 'Chaleureuse, empathique et rythmée, idéale pour les podcasts et les récits immersifs.',
    defaultPitch: 1.08,
    defaultRate: 1.02,
    avatarColor: 'from-amber-400 to-rose-500',
    accentBadge: '🇪🇬 Masri',
    sampleText: 'يا هلا بيكم، تعالوا نسمع القصة من الأول ونعيش كل تفصيلة فيها مع بعض.',
    proFeatures: ['Emotional Flow', 'Natural Laughs', 'Micro-Cadence'],
    dialectKeywords: ['يا فندم', 'عامل إيه', 'عايز أقلك']
  },

  // 6. Levant / Shami (ar-SY)
  {
    id: 'nour-shami',
    name: 'Nour Al-Sham (نور الشام)',
    nativeName: 'نور الشام (رقة دمشقية)',
    gender: 'female',
    language: 'Arabe Levantin',
    languageCode: 'ar-SY',
    dialect: 'Levantin Syro-Libanais',
    dialectCode: 'ar-SY',
    countryFlag: '🇸🇾',
    neuralVoice: 'Kore',
    tag: 'Doux & Poétique',
    description: 'Mélodie douce et captivante, idéale pour les livres audio, la poésie et les séries doublées.',
    defaultPitch: 1.05,
    defaultRate: 0.96,
    avatarColor: 'from-purple-500 to-indigo-600',
    accentBadge: '🇸🇾 Shami',
    sampleText: 'بين سطور الحكاية وألحان الذاكرة، نلتقي لنروي تفاصيل لا تُنسى في كل لحظة.',
    proFeatures: ['Poetic Cadence', 'Levantine Lilt', 'Whisper Mode'],
    dialectKeywords: ['شو الأخبار', 'كتير منيح', 'تكرم عينك']
  },

  // 7. Arabe Standard & Fusha (ar-MSA)
  {
    id: 'amira-fusha',
    name: 'Dr. Amira Al-Fusha (د. أميرة)',
    nativeName: 'د. أميرة (الفصحى المشكولة)',
    gender: 'female',
    language: 'Arabe Standard',
    languageCode: 'ar-MSA',
    dialect: 'Arabe Classique (Tashkeel)',
    dialectCode: 'ar-MSA',
    countryFlag: '🏛️',
    neuralVoice: 'Kore',
    tag: 'Documentaire & Savoir',
    description: 'Élocution savante et respectueuse de la grammaire arabe avec contrôle strict des voyelles courtes.',
    defaultPitch: 1.0,
    defaultRate: 0.94,
    avatarColor: 'from-blue-600 to-violet-700',
    accentBadge: '🏛️ Fusha',
    sampleText: 'إنَّ المَعْرِفَةَ هِيَ النُّورُ الَّذِي يُبَدِّدُ ظُلُمَاتِ الجَهْلِ، وَمِنْ هُنَا تَبْدَأُ رِحْلَةُ الاسْتِكْشَافِ.',
    proFeatures: ['Strict Tashkeel Support', 'Classical Phrasing', 'Academic Gravitas'],
    dialectKeywords: ['بِكُلِّ تَأْكِيدٍ', 'مِنَ الجَدِيرِ بِالذِّكْرِ']
  },
  {
    id: 'dr-hamza-fusha',
    name: 'Dr. Hamza Al-Fusha (د. حمزة)',
    nativeName: 'د. حمزة (صوت وثائقي وقور)',
    gender: 'male',
    language: 'Arabe Standard',
    languageCode: 'ar-MSA',
    dialect: 'Arabe Classique Solennel',
    dialectCode: 'ar-MSA',
    countryFlag: '🏛️',
    neuralVoice: 'Charon',
    tag: 'Documentaire & Narration',
    description: 'Grave profond et solennel, diction académique parfaite pour les livres audio et documentaires scientifiques.',
    defaultPitch: 0.92,
    defaultRate: 0.93,
    avatarColor: 'from-slate-700 to-blue-900',
    accentBadge: '🏛️ Fusha Baritone',
    sampleText: 'فِي هَذَا الفَصْلِ، نَسْتَعْرِضُ تَارِيخَ العُلُومِ وَالفَلَسَفَةِ عَبْرَ العُصُورِ الإِسْلَامِيَّةِ الذَّهَبِيَّةِ.',
    proFeatures: ['Baritone Timbre', 'Full Tashkeel Diction', 'Cinema Air']
  },

  // 8. Français & International
  {
    id: 'antoine-paris',
    name: 'Antoine Prestige (Paris)',
    nativeName: 'Antoine (Studio Paris)',
    gender: 'male',
    language: 'Français',
    languageCode: 'fr-FR',
    dialect: 'Français Standard Broadcast',
    dialectCode: 'fr-FR',
    countryFlag: '🇫🇷',
    neuralVoice: 'Fenrir',
    tag: 'Luxe & Publicité',
    description: 'Grave velouté, diction impeccable, l\'élégance parisienne pour le haut de gamme.',
    defaultPitch: 0.92,
    defaultRate: 0.96,
    avatarColor: 'from-amber-500 to-stone-700',
    accentBadge: '🇫🇷 Paris',
    sampleText: 'L\'élégance n\'est pas une question d\'artifice, mais d\'harmonie parfaite. Bienvenue dans l\'exception.',
    proFeatures: ['Studio Air Texture', 'Luxury Compression', 'Deep Warmth']
  },
  {
    id: 'chloe-paris',
    name: 'Chloé Élégance (Paris)',
    nativeName: 'Chloé (Voix Douce Studio)',
    gender: 'female',
    language: 'Français',
    languageCode: 'fr-FR',
    dialect: 'Français Naturel & Chaleureux',
    dialectCode: 'fr-FR',
    countryFlag: '🇫🇷',
    neuralVoice: 'Kore',
    tag: 'Douceur & Narration',
    description: 'Timbre cristallin, doux et naturel pour livres audio, documentaires et tutoriels.',
    defaultPitch: 1.04,
    defaultRate: 0.98,
    avatarColor: 'from-pink-500 to-rose-700',
    accentBadge: '🇫🇷 Paris',
    sampleText: 'Prenez le temps d\'écouter la texture de chaque mot. Une voix vivante et humaine pour vos créations.',
    proFeatures: ['Intimate Tone', 'Smooth Sibilants', 'Audiobook Depth']
  },
  {
    id: 'marcus-tech',
    name: 'Marcus Silicon (US)',
    nativeName: 'Marcus (Tech & Keynote US)',
    gender: 'male',
    language: 'English',
    languageCode: 'en-US',
    dialect: 'American Broadcast Keynote',
    dialectCode: 'en-US',
    countryFlag: '🇺🇸',
    neuralVoice: 'Puck',
    tag: 'Tech & Keynote',
    description: 'Voix percutante de présentation keynote, dynamique et persuasive pour les startups.',
    defaultPitch: 0.98,
    defaultRate: 1.05,
    avatarColor: 'from-cyan-400 to-blue-700',
    accentBadge: '🇺🇸 Keynote',
    sampleText: 'Welcome to the cutting edge of AI voice innovation. Speed, clarity, and limitless scale.',
    proFeatures: ['Keynote Punch', 'Crisp High-End', 'Modern Cadence']
  },
  {
    id: 'elena-global',
    name: 'Elena Global (US)',
    nativeName: 'Elena (Global Podcast)',
    gender: 'female',
    language: 'English',
    languageCode: 'en-US',
    dialect: 'American Warm & Conversational',
    dialectCode: 'en-US',
    countryFlag: '🇺🇸',
    neuralVoice: 'Zephyr',
    tag: 'Podcast & Host',
    description: 'Chaleureuse, amicale et articulée, idéale pour animer des podcasts et contenus éducatifs.',
    defaultPitch: 1.03,
    defaultRate: 1.0,
    avatarColor: 'from-emerald-400 to-teal-700',
    accentBadge: '🇺🇸 Host',
    sampleText: 'Welcome everyone! Today we are exploring the future of artificial intelligence in audio production.',
    proFeatures: ['Warm Midrange', 'Natural Breathing', 'Engaging Dynamic']
  }
];

export const TONE_PRESETS: TonePreset[] = [
  {
    id: 'cinematic',
    label: 'Cinématique & Bande-Annonce',
    iconName: 'Clapperboard',
    description: 'Grave profond, réverbération subtile et projection dramatique.',
    pitchOffset: -0.08,
    rateOffset: -0.08,
    reverbBoost: 0.25,
    stability: 85
  },
  {
    id: 'commercial',
    label: 'Publicité & Commercial',
    iconName: 'Sparkles',
    description: 'Énergique, punchy, compressé pour percer le mix audio.',
    pitchOffset: 0.04,
    rateOffset: 0.08,
    reverbBoost: 0.05,
    stability: 75
  },
  {
    id: 'podcast',
    label: 'Podcast & Conversation',
    iconName: 'Mic',
    description: 'Chaleureux, micro de proximité, intime et naturel.',
    pitchOffset: 0.0,
    rateOffset: 0.02,
    reverbBoost: 0.02,
    stability: 65
  },
  {
    id: 'documentary',
    label: 'Documentaire & Savoir',
    iconName: 'BookOpen',
    description: 'Posé, réfléchi, articulé, inspirant confiance et respect.',
    pitchOffset: -0.04,
    rateOffset: -0.06,
    reverbBoost: 0.12,
    stability: 90
  },
  {
    id: 'news',
    label: 'Journal & Flash Info',
    iconName: 'Radio',
    description: 'Rapide, incisif, direct avec une diction infaillible.',
    pitchOffset: 0.02,
    rateOffset: 0.14,
    reverbBoost: 0.0,
    stability: 95
  },
  {
    id: 'meditation',
    label: 'Méditation & Calme',
    iconName: 'Moon',
    description: 'Lent, murmuré, enveloppant pour la relaxation.',
    pitchOffset: -0.06,
    rateOffset: -0.22,
    reverbBoost: 0.35,
    stability: 90
  }
];

export const BGM_TRACKS = [
  { id: 'none', label: 'Aucune musique (Voix Pure)', tempo: 0, genre: 'A Cappella' },
  { id: 'lofi', label: 'Chill Studio Lo-Fi Beats', tempo: 82, genre: 'Lo-Fi / Hip-Hop' },
  { id: 'ambient', label: 'Deep Cyber Ambient Drone', tempo: 60, genre: 'Cinématique' },
  { id: 'tech', label: 'Silicon Valley Pulse Tech', tempo: 110, genre: 'Corporate Tech' },
  { id: 'lounge', label: 'Warm Midnight Coffee Lounge', tempo: 75, genre: 'Jazz / Neo-Soul' }
];
