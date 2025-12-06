import React from 'react';

const Loader: React.FC<{ text?: string }> = ({ text = "Generating AI Content..." }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-4 animate-in fade-in duration-500">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <div className="absolute inset-3 border-4 border-pink-200 border-b-pink-500 rounded-full animate-spin reverse-spin duration-700"></div>
      </div>
      <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">
        {text}
      </p>
    </div>
  );
};

export default Loader;