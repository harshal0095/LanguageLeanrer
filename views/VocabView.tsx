import React, { useEffect, useState } from 'react';
import { Language, VocabularyResponse } from '../types';
import { generateVocabulary } from '../services/genAi';
import Loader from '../components/Loader';
import { speak } from '../utils/speech';

interface Props {
  targetLanguage: Language;
  nativeLanguage: Language;
}

const CATEGORIES = [
  "Greetings",
  "Travel",
  "Food & Dining",
  "Numbers",
  "Family",
  "Emergency",
  "Shopping",
  "Time & Dates"
];

const VocabView: React.FC<Props> = ({ targetLanguage, nativeLanguage }) => {
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [data, setData] = useState<VocabularyResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchVocab = async () => {
      setLoading(true);
      setError(false);
      setData(null);
      
      const storageKey = `vocab_v2_${targetLanguage.code}_${nativeLanguage.code}_${category}`;
      const cached = localStorage.getItem(storageKey);

      if (cached) {
        setData(JSON.parse(cached));
        setLoading(false);
        return;
      }

      const result = await generateVocabulary(targetLanguage.name, nativeLanguage.name, category);
      if (result && result.words.length > 0) {
        setData(result);
        localStorage.setItem(storageKey, JSON.stringify(result));
      } else {
        setError(true);
      }
      setLoading(false);
    };
    fetchVocab();
  }, [targetLanguage, nativeLanguage, category]);

  return (
    <div className="flex flex-col space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* Header Section */}
      <div className="bg-gradient-to-r from-pink-500 to-rose-600 rounded-2xl p-6 text-white shadow-lg transition-all duration-300">
        <h2 className="text-2xl font-bold mb-2">{targetLanguage.name} Vocabulary</h2>
        <p className="opacity-90 min-h-[1.5em] leading-relaxed">
           {loading ? (
             <span className="animate-pulse">Loading description...</span>
           ) : data ? (
             data.description
           ) : (
             `Learn ${category} words in ${targetLanguage.name}`
           )}
        </p>
      </div>

      {/* Category Selection - Changed to flex-wrap for visibility */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
          Select Category
        </h3>
        <div className="flex flex-wrap gap-2 px-1">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border flex-shrink-0 ${
                category === c
                  ? 'bg-pink-600 border-pink-600 text-white shadow-lg shadow-pink-500/30 transform scale-105'
                  : 'bg-white dark:bg-card border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-pink-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Loader text={`Curating ${category} list in ${targetLanguage.name}...`} />
      ) : error || !data ? (
         <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-card rounded-2xl border border-slate-200 dark:border-slate-800 border-dashed animate-in fade-in">
            <div className="text-4xl mb-3">😕</div>
            <p className="text-slate-500 dark:text-slate-400 mb-4 font-medium">Could not generate {category} list.</p>
            <button 
              onClick={() => setCategory(c => c)} // Force re-render/fetch
              className="px-6 py-2 bg-pink-50 text-pink-600 rounded-full hover:bg-pink-100 transition-colors font-semibold"
            >
              Try Again
            </button>
         </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {data.words.map((item, idx) => (
            <div 
              key={idx} 
              className="group bg-white dark:bg-card p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-lg hover:border-pink-200 dark:hover:border-pink-900 transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-baseline gap-2 mb-2">
                   <h3 className="text-xl font-bold text-slate-800 dark:text-white truncate">{item.word}</h3>
                   <span className="text-xs font-mono text-pink-500 bg-pink-50 dark:bg-pink-900/20 px-2 py-0.5 rounded">/{item.pronunciation}/</span>
                </div>
                <p className="text-lg font-medium text-slate-600 dark:text-slate-300 mb-4">{item.meaning_native}</p>
                
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl text-sm border border-slate-100 dark:border-slate-700/50">
                  <p className="text-slate-800 dark:text-slate-200 font-medium mb-1">{item.example}</p>
                  <p className="text-slate-500 dark:text-slate-400 italic">{item.example_native}</p>
                </div>
              </div>

              <button
                onClick={() => speak(item.word, targetLanguage.code)}
                className="shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-pink-50 text-pink-500 hover:bg-pink-500 hover:text-white dark:bg-pink-900/20 dark:hover:bg-pink-600 transition-all shadow-sm hover:shadow-md hover:scale-110 active:scale-95 self-end sm:self-center"
                title="Listen"
                aria-label={`Listen to ${item.word}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VocabView;