import React, { useEffect, useState } from 'react';
import { AlphabetChar, Language } from '../types';
import { generateAlphabet } from '../services/genAi';
import Loader from '../components/Loader';
import { speak } from '../utils/speech';

interface Props {
  targetLanguage: Language;
  nativeLanguage: Language;
}

const AlphabetView: React.FC<Props> = ({ targetLanguage, nativeLanguage }) => {
  const [data, setData] = useState<AlphabetChar[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const storageKey = `alphabet_${targetLanguage.code}_${nativeLanguage.code}`;
        const cached = localStorage.getItem(storageKey);
        if (cached) {
          setData(JSON.parse(cached));
          setLoading(false);
          return;
        }

        const result = await generateAlphabet(targetLanguage.name, nativeLanguage.name);
        if (result.length > 0) {
          setData(result);
          localStorage.setItem(storageKey, JSON.stringify(result));
        } else {
          setError("Failed to generate content. Please check API key.");
        }
      } catch (err) {
        setError("An error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [targetLanguage, nativeLanguage]);

  if (loading) return <Loader text={`Preparing ${targetLanguage.name} Alphabet for ${nativeLanguage.name} speakers...`} />;
  
  if (error) return (
    <div className="p-8 text-center text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl">
      {error}
    </div>
  );

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
        <h2 className="text-2xl font-bold mb-2">{targetLanguage.name} Alphabet</h2>
        <p className="opacity-90">Tap any card to hear the pronunciation.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {data.map((item, idx) => (
          <button
            key={idx}
            onClick={() => speak(item.char, targetLanguage.code)}
            className="group relative flex flex-col items-center p-6 bg-white dark:bg-card border-2 border-transparent hover:border-indigo-400 dark:border-slate-700 dark:hover:border-indigo-500 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300"
          >
            <span className="text-4xl font-bold text-slate-800 dark:text-white mb-2 group-hover:scale-110 transition-transform">
              {item.char} {item.lower && item.lower !== item.char ? ` ${item.lower}` : ''}
            </span>
            <span className="text-sm text-indigo-500 font-semibold bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full mb-2">
              /{item.pronunciation}/
            </span>
            <div className="text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400">e.g. {item.exampleWord}</p>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-300">({item.exampleMeaning})</p>
            </div>
            {item.note && (
              <div className="mt-2 text-[10px] text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded">
                {item.note}
              </div>
            )}
            
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AlphabetView;