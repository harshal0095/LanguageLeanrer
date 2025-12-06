import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AlphabetChar, GrammarRule, VocabularyResponse, QuizQuestion } from "../types";

const apiKey = process.env.API_KEY || '';
// Note: In a real production app, handle missing API key gracefully via UI context
const ai = new GoogleGenAI({ apiKey });

const modelName = 'gemini-2.5-flash';

// --- Schemas ---

const alphabetSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      char: { type: Type.STRING },
      upper: { type: Type.STRING },
      lower: { type: Type.STRING },
      pronunciation: { type: Type.STRING },
      exampleWord: { type: Type.STRING },
      exampleMeaning: { type: Type.STRING },
      note: { type: Type.STRING },
    },
    required: ['char', 'pronunciation', 'exampleWord', 'exampleMeaning'],
  },
};

const grammarSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      level: { type: Type.STRING, enum: ['Basic', 'Intermediate', 'Advanced'] },
      explanation: { type: Type.STRING },
      note: { type: Type.STRING },
      examples: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            original: { type: Type.STRING },
            translated: { type: Type.STRING },
            note: { type: Type.STRING },
          },
        },
      },
      tableData: {
        type: Type.OBJECT,
        properties: {
          headers: { type: Type.ARRAY, items: { type: Type.STRING } },
          rows: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
        },
      },
    },
    required: ['title', 'level', 'explanation', 'examples'],
  },
};

const vocabSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    category: { type: Type.STRING },
    description: { type: Type.STRING },
    words: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          word: { type: Type.STRING },
          meaning_native: { type: Type.STRING },
          pronunciation: { type: Type.STRING },
          example: { type: Type.STRING },
          example_native: { type: Type.STRING },
        },
        required: ['word', 'meaning_native', 'pronunciation', 'example', 'example_native'],
      },
    },
  },
  required: ['category', 'description', 'words'],
};

const quizSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.STRING },
      type: { type: Type.STRING, enum: ['multiple-choice', 'translate', 'fill-blank'] },
      question: { type: Type.STRING },
      options: { type: Type.ARRAY, items: { type: Type.STRING } },
      correctAnswer: { type: Type.STRING },
      explanation: { type: Type.STRING },
    },
    required: ['id', 'type', 'question', 'correctAnswer', 'explanation'],
  },
};

// --- Generators ---

export const generateAlphabet = async (targetLang: string, nativeLang: string): Promise<AlphabetChar[]> => {
  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: `You are 'PolyGlot Teacher AI'. Your student speaks ${nativeLang} and wants to learn ${targetLang}.
      
      Task: Generate a comprehensive alphabet list for learning ${targetLang}.
      
      Rules:
      1. 'exampleMeaning' must be in ${nativeLang}.
      2. 'note' should explain pronunciation nuances using ${nativeLang} comparisons.
      3. For non-Latin scripts, provide the main characters.
      
      Output JSON only.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: alphabetSchema,
        temperature: 0.2, 
      },
    });
    const text = response.text || "[]";
    return JSON.parse(text) as AlphabetChar[];
  } catch (error) {
    console.error("Gemini Alphabet Error:", error);
    return [];
  }
};

export const generateGrammar = async (targetLang: string, nativeLang: string, level: 'Basic' | 'Intermediate' | 'Advanced'): Promise<GrammarRule[]> => {
  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: `You are 'PolyGlot Teacher AI', a friendly and patient language tutor.
      Student's Native Language: ${nativeLang}
      Target Language: ${targetLang}
      Level: ${level}
      
      Task: Generate 3 key grammar rules for ${targetLang}.

      Style Guide:
      1. ALL 'explanation' text MUST be in ${nativeLang}. Do not use ${targetLang} for explanations.
      2. 'examples.translated' MUST be in ${nativeLang}.
      3. 'note' fields should be in ${nativeLang} and provide helpful tips or common mistake warnings.
      4. Keep explanations simple, A1/beginner-friendly even for Advanced topics.
      5. Use tables where helpful.
      
      Topics:
      - Basic: Nouns, Pronouns, To Be.
      - Intermediate: Tenses, Conjugations.
      - Advanced: Complex Structures.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: grammarSchema,
        temperature: 0.3,
      },
    });
    const text = response.text || "[]";
    return JSON.parse(text) as GrammarRule[];
  } catch (error) {
    console.error("Gemini Grammar Error:", error);
    return [];
  }
};

export const generateVocabulary = async (targetLang: string, nativeLang: string, category: string): Promise<VocabularyResponse | null> => {
  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: `You are a multilingual Vocabulary Category Generator AI.

      Target Language: ${targetLang}
      Native Language Explanation: ${nativeLang}
      Selected Category: "${category}"

      RULES (VERY IMPORTANT):
      1. NEVER return empty or missing data.
      2. "category" MUST be "${category}".
      3. "description" MUST NOT be empty and must be in ${nativeLang}.
      4. "words" MUST contain at least 8 useful vocabulary items.
      5. "meaning_native" and "example_native" MUST be in ${nativeLang}.
      
      Example structure:
      {
        "category": "Greetings",
        "description": "Useful greeting phrases for beginners.",
        "words": [
          {
            "word": "Hello",
            "meaning_native": "नमस्ते",
            "pronunciation": "/हेलो/",
            "example": "Hello, how are you?",
            "example_native": "नमस्ते, आप कैसे हैं?"
          }
        ]
      }`,
      config: {
        responseMimeType: "application/json",
        responseSchema: vocabSchema,
        temperature: 0.4,
      },
    });
    const text = response.text || "{}";
    return JSON.parse(text) as VocabularyResponse;
  } catch (error) {
    console.error("Gemini Vocab Error:", error);
    return null;
  }
};

export const generateQuiz = async (targetLang: string, nativeLang: string, difficulty: string): Promise<QuizQuestion[]> => {
  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: `You are 'PolyGlot Teacher AI'.
      Create a quiz for ${targetLang} (Level: ${difficulty}).
      The student speaks ${nativeLang}.
      
      Rules:
      1. The 'question' can be in ${targetLang} or ask for a translation from ${nativeLang}.
      2. The 'explanation' for the answer MUST be in ${nativeLang}.
      3. Ensure questions are suitable for the difficulty level.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: quizSchema,
        temperature: 0.7,
      },
    });
    const text = response.text || "[]";
    return JSON.parse(text) as QuizQuestion[];
  } catch (error) {
    console.error("Gemini Quiz Error:", error);
    return [];
  }
};