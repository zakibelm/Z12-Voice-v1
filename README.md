# Z12 Voice v0 - Next-Gen AI Voice & Audio Workstation

Suite professionnelle de production vocale et audio IA : Text-to-Speech multilingue et dialectal arabe (Maroc/Darija, Saoudien, Égyptien, Algérien, Tunisien, Syrien, Fusha), clonage vocal instantané, Podcast Studio multi-speakers, Audiobook Studio et Master Mixer 24kHz.

## 🚀 Fonctionnalités Clés

- **Moteur Vocal Neuronal Haute-Fidélité (2026 Engine)** : Synthèse naturelle 24kHz linéaire sans robotisation ni artefacts, restituant respiration, émotions et prosodie authentique.
- **Timbres Neuronaux Spécialisés** :
  - `Charon` : Baryton profond et posé (documentaires, voix prestige).
  - `Kore` : Chaleur humaine et douceur naturelle (récits, Darija, contes).
  - `Puck` : Dynamique, percutant et vivant (spots publicitaires, tech, réseaux sociaux).
  - `Fenrir` : Texturé, grave et percutant (cinéma, radio).
  - `Zephyr` : Lumineux, articulé et moderne (podcasts, chroniques).
- **Couverture Dialectale & Multilingue** :
  - Maroc (الدارجة المغربية)
  - Arabie Saoudite (اللهجة السعودية النجدية والحجازية)
  - Égypte (اللهجة المصرية)
  - Algérie & Tunisie (الدراجة المغاربية)
  - Levant (الشامية) & Arabe Classique avec Tashkeel complet
  - Français et Anglais Broadcast
- **Clonage Vocal Instantané** : Profilage acoustique, empreinte neurale et enregistrement microphone.
- **Podcast Studio Multi-Speakers** : Génération de dialogues avec alternance d'intervenants et gestion des transitions.
- **Audiobook Studio & Master Mixer** : Découpage par chapitres, sous-titres `.srt`, égaliseur basse/aigu (EQ) et export `.wav` HD.

## 🛠️ Installation & Lancement

```bash
# 1. Cloner le dépôt
git clone <URL_DU_REPO>
cd z12-voice-v0

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env
# Renseigner votre GEMINI_API_KEY dans le fichier .env

# 4. Lancer le serveur de développement
npm run dev
```

L'application démarre sur `http://localhost:3000`.

## 📦 Stack Technique

- **Frontend** : React 19, TypeScript, Tailwind CSS, Lucide Icons
- **Audio DSP** : Web Audio API 24kHz, AnalyserNode temps réel, filtres Biquad (Low-shelf & High-shelf)
- **Backend** : Express.js, TypeScript (`server.ts`)
- **Moteur IA** : `@google/genai` (modèles Gemini TTS et Gemini Flash)
