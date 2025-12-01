import React from 'react';

interface TerminalViewProps {
  content: string | null;
}

const TerminalView: React.FC<TerminalViewProps> = ({ content }) => {
  if (!content) return null;

  return (
    <div className="w-full bg-rpg-black border border-rpg-gray rounded-md overflow-hidden shadow-lg">
      <div className="bg-rpg-gray px-3 py-1 flex items-center space-x-2">
        <div className="w-3 h-3 rounded-full bg-red-500"></div>
        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
        <div className="w-3 h-3 rounded-full bg-green-500"></div>
        <span className="text-xs text-gray-400 font-mono ml-2">SYSTEM_STATUS_WINDOW_v5.0.exe</span>
      </div>
      <div className="p-4 overflow-x-auto max-h-[70vh] overflow-y-auto">
        <pre className="font-mono text-xs sm:text-sm text-green-500 whitespace-pre leading-relaxed">
          {content}
        </pre>
      </div>
    </div>
  );
};

export default TerminalView;