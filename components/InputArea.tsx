import React, { useState, useEffect } from 'react';
import { GameOption } from '../types';

interface InputAreaProps {
  options: GameOption[];
  onSend: (text: string) => void;
  isLoading: boolean;
  gameStarted: boolean;
}

const InputArea: React.FC<InputAreaProps> = ({ options, onSend, isLoading, gameStarted }) => {
  const [inputText, setInputText] = useState('');
  // Changed default to false (collapsed)
  const [isExpanded, setIsExpanded] = useState(false);

  // Filter out generic "Free Action" options
  const clickableOptions = options.filter(opt => !opt.text.includes("자유 행동") && !opt.label.includes("자유 행동"));
  const hasOptions = clickableOptions.length > 0;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (!inputText.trim() || isLoading) return;
    onSend(inputText);
    setInputText('');
    setIsExpanded(false); // Auto-collapse after sending
  };

  // Optional: Auto-expand only on very first game start, otherwise respect default closed
  useEffect(() => {
    if (!gameStarted && hasOptions) {
      setIsExpanded(true);
    }
  }, [gameStarted, hasOptions]);

  return (
    <div className={`fixed bottom-0 left-0 w-full z-50 transition-all duration-500 ease-in-out`}>
      
      {/* Container Background (Glassmorphism) */}
      <div className={`bg-rpg-dark/95 backdrop-blur-md border-t border-rpg-gray shadow-[0_-5px_20px_rgba(0,0,0,0.5)] transition-all duration-500 ${isExpanded ? 'translate-y-0' : 'translate-y-[calc(100%-60px)]'}`}>
        
        {/* Toggle Handle / Status Bar */}
        <div 
          className="w-full h-[60px] flex items-center justify-between px-4 cursor-pointer hover:bg-white/5 transition-colors border-b border-rpg-gray/50"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center space-x-3">
             <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]'}`} />
             <span className="text-sm font-mono text-gray-400 uppercase tracking-widest">
               {isLoading ? "PROCESSING..." : isExpanded ? "COMMAND CENTER" : "WAITING FOR INPUT"}
             </span>
          </div>

          <div className="flex items-center space-x-4">
            {!isExpanded && hasOptions && !isLoading && (
               <span className="text-xs text-rpg-accent font-bold animate-pulse">
                 {clickableOptions.length} OPTIONS AVAILABLE
               </span>
            )}
            <div className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'rotate-0'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
              </svg>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="max-w-4xl mx-auto flex flex-col gap-4 p-4 pb-8 sm:pb-6">
          
          {/* Quick Options Grid */}
          {hasOptions && !isLoading && (
            <div className="grid grid-cols-1 gap-2 max-h-[40vh] overflow-y-auto pr-1 custom-scrollbar">
              {clickableOptions.map((opt, index) => (
                <button
                  key={`${opt.id}-${index}`}
                  onClick={() => { onSend(opt.text); setIsExpanded(false); }}
                  className="group relative w-full text-left px-5 py-4 bg-rpg-black border border-rpg-dim hover:border-rpg-accent rounded-lg transition-all duration-200 hover:shadow-[0_0_15px_rgba(239,68,68,0.15)] flex items-center"
                >
                  <span className="absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover:bg-rpg-accent rounded-l-lg transition-colors duration-200" />
                  <span className="font-mono text-rpg-accent font-bold mr-4 text-lg opacity-70 group-hover:opacity-100 transition-opacity">
                    {(index + 1).toString().padStart(2, '0')}
                  </span>
                  <span className="text-gray-300 group-hover:text-white text-base font-medium leading-relaxed">
                    {opt.text}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Text Input */}
          <div className="flex gap-2 items-center bg-rpg-black border border-rpg-dim rounded-lg p-1 focus-within:border-rpg-accent transition-colors">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isLoading ? "시스템 연산 중..." : "선택지 외의 행동을 자유롭게 입력하세요..."}
              disabled={isLoading}
              className="flex-1 bg-transparent text-gray-200 px-4 py-3 focus:outline-none placeholder-gray-600 font-mono text-sm"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !inputText.trim()}
              className="bg-rpg-gray hover:bg-rpg-accent text-white p-3 rounded-md disabled:opacity-30 disabled:hover:bg-rpg-gray transition-all duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InputArea;