import React, { useEffect, useState } from 'react';
import { Language, QuizQuestion } from '../types';
import { generateQuiz } from '../services/genAi';
import Loader from '../components/Loader';

interface Props {
  targetLanguage: Language;
  nativeLanguage: Language;
}

const QuizView: React.FC<Props> = ({ targetLanguage, nativeLanguage }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [difficulty, setDifficulty] = useState('Beginner');

  useEffect(() => {
    startQuiz();
  }, [targetLanguage, nativeLanguage, difficulty]);

  const startQuiz = async () => {
    setLoading(true);
    setScore(0);
    setCurrentIdx(0);
    setShowResult(false);
    setIsCorrect(null);
    setSelectedAnswer('');
    
    // Don't cache quizzes heavily to allow freshness, or simple session cache
    const result = await generateQuiz(targetLanguage.name, nativeLanguage.name, difficulty);
    setQuestions(result);
    setLoading(false);
  };

  const handleAnswer = (answer: string) => {
    if (isCorrect !== null) return; // Prevent multiple clicks

    const currentQ = questions[currentIdx];
    // Simple normalization for text inputs
    const correct = answer.trim().toLowerCase() === currentQ.correctAnswer.trim().toLowerCase();
    
    setIsCorrect(correct);
    setSelectedAnswer(answer);
    
    if (correct) {
      setScore(s => s + 1);
      // Save progress
      const totalScoreKey = 'linguaSphere_total_score';
      const currentTotal = parseInt(localStorage.getItem(totalScoreKey) || '0');
      localStorage.setItem(totalScoreKey, (currentTotal + 10).toString());
    }
  };

  const nextQuestion = () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(p => p + 1);
      setIsCorrect(null);
      setSelectedAnswer('');
    } else {
      setShowResult(true);
    }
  };

  if (loading) return <Loader text={`Preparing ${difficulty} Quiz in ${nativeLanguage.name}...`} />;

  if (showResult) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-in zoom-in duration-300">
        <div className="bg-white dark:bg-card p-10 rounded-3xl shadow-2xl max-w-md w-full">
          <div className="w-24 h-24 bg-gradient-to-tr from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-lg">
            🏆
          </div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Quiz Complete!</h2>
          <p className="text-slate-500 mb-6">You scored</p>
          <div className="text-6xl font-black text-indigo-600 dark:text-indigo-400 mb-8">
            {score} / {questions.length}
          </div>
          <button 
            onClick={startQuiz}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg transition-transform hover:scale-105"
          >
            Play Again
          </button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) return <div className="text-center p-10 opacity-50">No questions available. Try reloading.</div>;

  const currentQ = questions[currentIdx];

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
           <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Question {currentIdx + 1} of {questions.length}</span>
           <div className="w-32 h-2 bg-slate-200 dark:bg-slate-700 rounded-full mt-1 overflow-hidden">
             <div 
               className="h-full bg-indigo-500 transition-all duration-500 ease-out" 
               style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
             ></div>
           </div>
        </div>
        <select 
          value={difficulty} 
          onChange={(e) => setDifficulty(e.target.value)}
          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm px-3 py-1"
        >
          <option>Beginner</option>
          <option>Intermediate</option>
          <option>Advanced</option>
        </select>
      </div>

      {/* Question Card */}
      <div className="bg-white dark:bg-card p-8 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
        
        <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 relative z-10">
          {currentQ.question}
        </h3>

        <div className="space-y-3 relative z-10">
          {currentQ.type === 'multiple-choice' && currentQ.options ? (
            currentQ.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(opt)}
                disabled={isCorrect !== null}
                className={`w-full p-4 text-left rounded-xl border-2 transition-all font-medium ${
                  isCorrect !== null
                    ? opt === currentQ.correctAnswer
                      ? 'bg-green-100 border-green-500 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                      : opt === selectedAnswer
                      ? 'bg-red-100 border-red-500 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                      : 'border-slate-100 dark:border-slate-700 opacity-50'
                    : 'border-slate-100 dark:border-slate-700 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/10'
                }`}
              >
                {opt}
              </button>
            ))
          ) : (
             <div className="space-y-4">
               <input 
                 type="text" 
                 placeholder="Type your answer..."
                 disabled={isCorrect !== null}
                 className="w-full p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-transparent focus:border-indigo-500 outline-none"
                 onKeyDown={(e) => {
                   if(e.key === 'Enter') handleAnswer((e.target as HTMLInputElement).value);
                 }}
               />
               {isCorrect === null && (
                  <button 
                  onClick={(e) => {
                     const input = (e.currentTarget.previousSibling as HTMLInputElement).value;
                     handleAnswer(input);
                  }}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg"
                  >Submit</button>
               )}
             </div>
          )}
        </div>

        {/* Feedback Section */}
        {isCorrect !== null && (
          <div className={`mt-6 p-4 rounded-xl animate-in slide-in-from-bottom-2 ${isCorrect ? 'bg-green-50 dark:bg-green-900/20 text-green-700' : 'bg-red-50 dark:bg-red-900/20 text-red-700'}`}>
            <div className="flex items-center gap-2 font-bold mb-1">
              {isCorrect ? (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                  Correct!
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/></svg>
                  Incorrect
                </>
              )}
            </div>
            <p className="text-sm opacity-90">{currentQ.explanation}</p>
            {!isCorrect && <p className="text-sm font-bold mt-2">Correct Answer: {currentQ.correctAnswer}</p>}
            
            <button 
              onClick={nextQuestion}
              className="mt-4 bg-slate-800 dark:bg-white text-white dark:text-slate-900 px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              {currentIdx + 1 === questions.length ? 'Finish Quiz' : 'Next Question'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizView;