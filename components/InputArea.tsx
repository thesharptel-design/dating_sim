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
  };

  // Filter out the "Free Action" option if it's generic, 
  // but keep specific options. Usually the last option is free action.
  const clickableOptions = options.filter(opt => !opt.text.includes("자유 행동") && !opt.label.includes("자유 행동"));

  return (
    <div className="fixed bottom-0 left-0 w-full bg-rpg-dark/95 backdrop-blur-sm border-t border-rpg-gray p-4 z-50 pb-safe">
      <div className="max-w-4xl mx-auto flex flex-col gap-3">
        {/* Quick Options */}
        {clickableOptions.length > 0 && !isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2 max-h-32 overflow-y-auto">
            {clickableOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => onSend(opt.text)}
                className="text-left px-4 py-3 bg-rpg-gray hover:bg-rpg-accent/20 border border-rpg-dim/30 hover:border-rpg-accent rounded transition-colors duration-200 text-sm group"
              >
                <span className="text-rpg-accent font-bold mr-2 group-hover:text-white">[{opt.id}]</span>
                <span className="text-gray-300 group-hover:text-white">{opt.text}</span>
              </button>
            ))}
          </div>
        )}

        {/* Text Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isLoading ? "GM이 상황을 계산중입니다..." : "행동을 입력하세요..."}
            disabled={isLoading}
            className="flex-1 bg-rpg-black border border-rpg-gray text-rpg-text rounded px-4 py-3 focus:outline-none focus:border-rpg-accent disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !inputText.trim()}
            className="bg-rpg-accent hover:bg-red-600 text-white font-bold py-2 px-6 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? '...' : '전송'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InputArea;