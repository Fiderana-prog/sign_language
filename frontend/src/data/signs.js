export const SIGNS = [
  { id: 1, key: 'baby', animation: 'WORD_BABY', word: 'Bébé', category: 'Personnes', level: 'Débutant', description: 'Signe ASL correspondant au mot anglais “baby”.' },
  { id: 2, key: 'eat', animation: 'WORD_EAT', word: 'Manger', category: 'Actions', level: 'Débutant', description: 'Signe ASL correspondant au mot anglais “eat”.' },
  { id: 3, key: 'father', animation: 'WORD_FATHER', word: 'Père', category: 'Famille', level: 'Débutant', description: 'Signe ASL correspondant au mot anglais “father”.' },
  { id: 4, key: 'finish', animation: 'WORD_FINISH', word: 'Terminer', category: 'Actions', level: 'Débutant', description: 'Signe ASL correspondant au mot anglais “finish”.' },
  { id: 5, key: 'good', animation: 'WORD_GOOD', word: 'Bien', category: 'Expressions', level: 'Débutant', description: 'Signe ASL correspondant au mot anglais “good”.' },
  { id: 6, key: 'happy', animation: 'WORD_HAPPY', word: 'Heureux', category: 'Émotions', level: 'Débutant', description: 'Signe ASL correspondant au mot anglais “happy”.' },
  { id: 7, key: 'hear', animation: 'WORD_HEAR', word: 'Entendre', category: 'Actions', level: 'Intermédiaire', description: 'Signe ASL correspondant au mot anglais “hear”.' },
  { id: 8, key: 'house', animation: 'WORD_HOUSE', word: 'Maison', category: 'Lieux', level: 'Débutant', description: 'Signe ASL correspondant au mot anglais “house”.' },
  { id: 9, key: 'important', animation: 'WORD_IMPORTANT', word: 'Important', category: 'Expressions', level: 'Intermédiaire', description: 'Signe ASL correspondant au mot anglais “important”.' },
  { id: 10, key: 'love', animation: 'WORD_LOVE', word: 'Aimer', category: 'Émotions', level: 'Débutant', description: 'Signe ASL correspondant au mot anglais “love”.' },
  { id: 11, key: 'mall', animation: 'WORD_MALL', word: 'Centre commercial', category: 'Lieux', level: 'Intermédiaire', description: 'Signe ASL correspondant au mot anglais “mall”.' },
  { id: 12, key: 'me', animation: 'WORD_ME', word: 'Moi', category: 'Personnes', level: 'Débutant', description: 'Signe ASL correspondant au mot anglais “me”.' },
  { id: 13, key: 'mosque', animation: 'WORD_MOSQUE', word: 'Mosquée', category: 'Lieux', level: 'Intermédiaire', description: 'Signe ASL correspondant au mot anglais “mosque”.' },
  { id: 14, key: 'mother', animation: 'WORD_MOTHER', word: 'Mère', category: 'Famille', level: 'Débutant', description: 'Signe ASL correspondant au mot anglais “mother”.' },
  { id: 15, key: 'normal', animation: 'WORD_NORMAL', word: 'Normal', category: 'Expressions', level: 'Débutant', description: 'Signe ASL correspondant au mot anglais “normal”.' },
  { id: 16, key: 'sad', animation: 'WORD_SAD', word: 'Triste', category: 'Émotions', level: 'Débutant', description: 'Signe ASL correspondant au mot anglais “sad”.' },
  { id: 17, key: 'stop', animation: 'WORD_STOP', word: 'Arrêter', category: 'Actions', level: 'Débutant', description: 'Signe ASL correspondant au mot anglais “stop”.' },
  { id: 18, key: 'thanks', animation: 'WORD_THANKS', word: 'Merci', category: 'Expressions', level: 'Débutant', description: 'Signe ASL correspondant au mot anglais “thanks”.' },
  { id: 19, key: 'thinking', animation: 'WORD_THINKING', word: 'Penser', category: 'Actions', level: 'Intermédiaire', description: 'Signe ASL correspondant au mot anglais “thinking”.' },
  { id: 20, key: 'worry', animation: 'WORD_WORRY', word: 'S’inquiéter', category: 'Émotions', level: 'Intermédiaire', description: 'Signe ASL correspondant au mot anglais “worry”.' },
];

export const CATEGORIES = [
  'Tous',
  'Actions',
  'Émotions',
  'Expressions',
  'Famille',
  'Lieux',
  'Personnes',
];

export const QUIZ = [
  { sign: 'Merci', animation: 'WORD_THANKS', answers: ['Merci', 'Maison', 'Père'] },
  { sign: 'Manger', animation: 'WORD_EAT', answers: ['Penser', 'Manger', 'Triste'] },
  { sign: 'Mère', animation: 'WORD_MOTHER', answers: ['Mère', 'Important', 'Arrêter'] },
  { sign: 'Heureux', animation: 'WORD_HAPPY', answers: ['Mosquée', 'Heureux', 'Moi'] },
  { sign: 'Maison', animation: 'WORD_HOUSE', answers: ['Maison', 'Bébé', 'Normal'] },
];
