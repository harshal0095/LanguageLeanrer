import React, { useEffect, useState } from 'react';
import { GrammarRule, Language } from '../types';
import { generateGrammar } from '../services/genAi';
import Loader from '../components/Loader';
import { speak } from '../utils/speech';

// Sub-component to manage individual rule state (like collapsible notes)
const GrammarRuleCard: React.FC<{ rule: GrammarRule; targetLang: Language; nativeLang: Language; index: number }> = ({ rule, targetLang, nativeLang, index }) => {
  const [isNoteOpen, setIsNoteOpen] = useState(false);

  return (
    <div className="bg-white dark:bg-card rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden animate-in slide-in-from-bottom-8 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center">
        <h3 className="text-xl font-bold text-slate-800 dark:text-white">{rule.title}</h3>
      </div>
      
      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{rule.explanation}</p>
          <button 
             onClick={() => speak(rule.explanation, nativeLang.code)}
             className="shrink-0 p-2 text-indigo-600 hover:bg-indigo-50 rounded-full dark:hover:bg-indigo-900/30 transition-colors"
             title={`Listen in ${nativeLang.name}`}
             aria-label="Listen to explanation"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
               <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {rule.note && (
          <div className="rounded-xl border border-blue-100 dark:border-blue-900/30 overflow-hidden bg-blue-50 dark:bg-blue-900/20">
            <button 
              onClick={() => setIsNoteOpen(!isNoteOpen)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
              aria-expanded={isNoteOpen}
            >
              <h4 className="text-xs font-bold text-blue-800 dark:text-blue-400 uppercase tracking-wide flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Teacher's Note ({nativeLang.name})
              </h4>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`h-5 w-5 text-blue-600 dark:text-blue-400 transform transition-transform duration-200 ${isNoteOpen ? 'rotate-180' : ''}`} 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            {isNoteOpen && (
              <div className="px-4 pb-4 pt-1 text-slate-700 dark:text-slate-300 text-sm animate-in slide-in-from-top-1">
                {rule.note}
              </div>
            )}
          </div>
        )}

        {rule.tableData && (
          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
            <table 
              className="w-full text-sm text-left" 
              role="table" 
              aria-label={`${rule.title} conjugation table`}
            >
              <thead className="bg-slate-50 dark:bg-slate-700/50" role="rowgroup">
                <tr role="row">
                  {rule.tableData.headers.map((h, i) => (
                    <th 
                      key={i} 
                      role="columnheader" 
                      scope="col"
                      className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-200"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody role="rowgroup">
                {rule.tableData.rows.map((row, rIdx) => (
                  <tr key={rIdx} className="border-t border-slate-200 dark:border-slate-700" role="row">
                    {row.map((cell, cIdx) => (
                      <td 
                        key={cIdx} 
                        className="px-4 py-2 text-slate-600 dark:text-slate-400"
                        role="cell"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-100 dark:border-amber-900/30">
          <h4 className="text-sm font-bold text-amber-800 dark:text-amber-400 mb-2 uppercase tracking-wide">Examples</h4>
          <div className="space-y-3">
            {rule.examples.map((ex, exIdx) => (
              <div key={exIdx} className="flex items-start justify-between group">
                <div>
                  <p className="text-lg font-medium text-slate-800 dark:text-slate-200">{ex.original}</p>
                  <p className="text-slate-500 dark:text-slate-400 italic">{ex.translated}</p>
                </div>
                <button 
                  onClick={() => speak(ex.original, targetLang.code)}
                  className="text-amber-500 hover:text-amber-600 opacity-60 group-hover:opacity-100 transition-opacity"
                  aria-label="Listen to example"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

interface Props {
  targetLanguage: Language;
  nativeLanguage: Language;
}

const GrammarView: React.FC<Props> = ({ targetLanguage, nativeLanguage }) => {
  const [level, setLevel] = useState<'Basic' | 'Intermediate' | 'Advanced'>('Basic');
  const [rules, setRules] = useState<GrammarRule[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchGrammar = async () => {
      setLoading(true);
      const storageKey = `grammar_${targetLanguage.code}_${nativeLanguage.code}_${level}`;
      const cached = localStorage.getItem(storageKey);
      
      if (cached) {
        setRules(JSON.parse(cached));
        setLoading(false);
        return;
      }

      const result = await generateGrammar(targetLanguage.name, nativeLanguage.name, level);
      if (result.length > 0) {
        setRules(result);
        localStorage.setItem(storageKey, JSON.stringify(result));
      }
      setLoading(false);
    };
    fetchGrammar();
  }, [targetLanguage, nativeLanguage, level]);

  return (
    <div className="space-y-6">
      <div className="flex space-x-2 bg-white dark:bg-card p-2 rounded-xl shadow-sm overflow-x-auto">
        {(['Basic', 'Intermediate', 'Advanced'] as const).map((l) => (
          <button
            key={l}
            onClick={() => setLevel(l)}
            className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
              level === l
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {l} Grammar
          </button>
        ))}
      </div>

      {loading ? (
        <Loader text={`Asking PolyGlot AI to explain ${targetLanguage.name} in ${nativeLanguage.name}...`} />
      ) : (
        <div className="grid gap-6">
          {rules.map((rule, idx) => (
            <GrammarRuleCard 
                key={idx} 
                rule={rule} 
                targetLang={targetLanguage} 
                nativeLang={nativeLanguage} 
                index={idx} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default GrammarView;