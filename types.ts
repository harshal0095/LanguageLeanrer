export enum AppView {
  ALPHABET = 'ALPHABET',
  GRAMMAR = 'GRAMMAR',
  VOCABULARY = 'VOCABULARY',
  QUIZ = 'QUIZ',
}

export interface Language {
  code: string;
  name: string;
  nativeName: string;
}

export interface AlphabetChar {
  char: string;
  upper?: string;
  lower?: string;
  pronunciation: string;
  exampleWord: string;
  exampleMeaning: string;
  note?: string; // For things like German Ä, Ö
}

export interface GrammarRule {
  title: string;
  level: 'Basic' | 'Intermediate' | 'Advanced';
  explanation: string;
  note?: string;
  examples: {
    original: string;
    translated: string;
    note?: string;
  }[];
  tableData?: {
    headers: string[];
    rows: string[][];
  };
}

export interface VocabularyItem {
  word: string;
  meaning_native: string;
  pronunciation: string;
  example: string;
  example_native: string;
}

export interface VocabularyResponse {
  category: string;
  description: string;
  words: VocabularyItem[];
}

export interface QuizQuestion {
  id: string;
  type: 'multiple-choice' | 'translate' | 'fill-blank';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
];