import React, { useState, useEffect } from 'react';
import { SUPPORTED_LANGUAGES, Language, AppView } from './types';
import AlphabetView from './views/AlphabetView';
import GrammarView from './views/GrammarView';
import VocabView from './views/VocabView';
import QuizView from './views/QuizView';

const App: React.FC = () => {
  // Default Native: Hindi (common per request), Target: English
  const [nativeLang, setNativeLang] = useState<Language>(
    SUPPORTED_LANGUAGES.find(l => l.code === 'hi') || SUPPORTED_LANGUAGES[0]
  );
  const [targetLang, setTargetLang] = useState<Language>(
    SUPPORTED_LANGUAGES.find(l => l.code === 'en') || SUPPORTED_LANGUAGES[0]
  );
  
  const [currentView, setCurrentView] = useState<AppView>(AppView.ALPHABET);
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [totalScore, setTotalScore] = useState(0);

  useEffect(() => {
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
    const savedScore = localStorage.getItem('linguaSphere_total_score');
    if (savedScore) setTotalScore(parseInt(savedScore));
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Update score listener
  useEffect(() => {
    const checkScore = () => {
      const savedScore = localStorage.getItem('linguaSphere_total_score');
      if (savedScore) setTotalScore(parseInt(savedScore));
    };
    window.addEventListener('storage', checkScore);
    // Poll for score changes (since storage event only fires on other tabs)
    const interval = setInterval(checkScore, 2000);
    return () => {
      window.removeEventListener('storage', checkScore);
      clearInterval(interval);
    };
  }, []);

  const renderContent = () => {
    if (!process.env.API_KEY) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-md p-8 bg-red-50 rounded-xl text-red-800">
                    <h2 className="text-xl font-bold mb-2">Missing API Key</h2>
                    <p>Please set the <code>API_KEY</code> environment variable to use the Gemini API.</p>
                </div>
            </div>
        )
    }

    switch (currentView) {
      case AppView.ALPHABET:
        return <AlphabetView targetLanguage={targetLang} nativeLanguage={nativeLang} />;
      case AppView.GRAMMAR:
        return <GrammarView targetLanguage={targetLang} nativeLanguage={nativeLang} />;
      case AppView.VOCABULARY:
        return <VocabView targetLanguage={targetLang} nativeLanguage={nativeLang} />;
      case AppView.QUIZ:
        return <QuizView targetLanguage={targetLang} nativeLanguage={nativeLang} />;
      default:
        return <AlphabetView targetLanguage={targetLang} nativeLanguage={nativeLang} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-dark text-slate-900 dark:text-slate-100 font-sans">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static z-50 w-64 h-full bg-white dark:bg-card border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-300 ease-in-out flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-lg shadow-lg flex items-center justify-center text-white font-bold">L</div>
          <h1 className="text-xl font-bold tracking-tight">LanguageLearner</h1>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Learning Modules</p>
          
          <button
            onClick={() => { setCurrentView(AppView.ALPHABET); setSidebarOpen(false); }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${currentView === AppView.ALPHABET ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-300 font-semibold' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
          >
            <span>🔤</span> <span>Alphabet</span>
          </button>
          
          <button
            onClick={() => { setCurrentView(AppView.GRAMMAR); setSidebarOpen(false); }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${currentView === AppView.GRAMMAR ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-300 font-semibold' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
          >
            <span>📘</span> <span>Grammar</span>
          </button>

          <button
            onClick={() => { setCurrentView(AppView.VOCABULARY); setSidebarOpen(false); }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${currentView === AppView.VOCABULARY ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-300 font-semibold' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
          >
            <span>🧠</span> <span>Vocabulary</span>
          </button>

          <button
            onClick={() => { setCurrentView(AppView.QUIZ); setSidebarOpen(false); }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${currentView === AppView.QUIZ ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-300 font-semibold' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
          >
            <span>🎮</span> <span>Quiz & Puzzles</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
           <div className="bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20 p-4 rounded-xl mb-4">
              <p className="text-xs text-yellow-700 dark:text-yellow-500 font-bold uppercase">Total XP</p>
              <p className="text-2xl font-black text-yellow-800 dark:text-yellow-400">{totalScore}</p>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-dark/80 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between px-4 py-3 md:px-8 sticky top-0 z-30 gap-3">
          <div className="flex items-center justify-between w-full md:w-auto">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 text-slate-600">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                 </svg>
              </button>
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white hidden sm:block">
                Classroom
              </h2>
            </div>
            
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="md:hidden p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
            
            {/* Native Language Selector */}
            <div className="flex items-center gap-2 w-full md:w-auto">
               <span className="text-xs font-bold text-slate-500 uppercase whitespace-nowrap">I Speak:</span>
               <div className="relative group w-full">
                  <select 
                    className="w-full md:w-40 appearance-none bg-slate-100 dark:bg-slate-800 border-none rounded-lg py-2 pl-3 pr-8 text-sm font-medium focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    value={nativeLang.code}
                    onChange={(e) => {
                       const lang = SUPPORTED_LANGUAGES.find(l => l.code === e.target.value);
                       if(lang) setNativeLang(lang);
                    }}
                  >
                    {SUPPORTED_LANGUAGES.map(lang => (
                      <option key={lang.code} value={lang.code}>{lang.nativeName}</option>
                    ))}
                  </select>
               </div>
            </div>

            {/* Target Language Selector */}
            <div className="flex items-center gap-2 w-full md:w-auto">
               <span className="text-xs font-bold text-slate-500 uppercase whitespace-nowrap">I Learn:</span>
               <div className="relative group w-full">
                  <select 
                    className="w-full md:w-40 appearance-none bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border-none rounded-lg py-2 pl-3 pr-8 text-sm font-bold focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    value={targetLang.code}
                    onChange={(e) => {
                       const lang = SUPPORTED_LANGUAGES.find(l => l.code === e.target.value);
                       if(lang) setTargetLang(lang);
                    }}
                  >
                    {SUPPORTED_LANGUAGES.map(lang => (
                      <option key={lang.code} value={lang.code}>{lang.name}</option>
                    ))}
                  </select>
               </div>
            </div>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="hidden md:block p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </header>

        {/* View Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
           <div className="max-w-6xl mx-auto h-full">
              {renderContent()}
           </div>
        </div>
      </main>
    </div>
  );
};

export default App;