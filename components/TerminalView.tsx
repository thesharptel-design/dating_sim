import React from 'react';

interface TerminalViewProps {
  content: string | null;
}

const TerminalView: React.FC<TerminalViewProps> = ({ content }) => {
  if (!content) return null;

  // Split lines and remove empty ones to prevent vertical stretching
  const lines = content.split('\n').filter(line => line.trim() !== '');

  // Helper to colorize text segments
  const parseStatLine = (text: string) => {
    // Split by brackets to isolate [Tag]
    const parts = text.split(/(\[.*?\])/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('[') && part.endsWith(']')) {
        // Tag (e.g., [Health]) -> Cyan
        return <span key={index} className="text-cyan-400 font-semibold">{part}</span>;
      }
      
      // Process the rest: Numbers and Stat Changes (+/-)
      const subParts = part.split(/([+\-]?\d+(?:,\d{3})*(?:\.\d+)?(?:cm|kg|%|원|명)?)/g);
      
      return (
        <span key={index}>
          {subParts.map((sub, subIndex) => {
              // Stat Change (+5, -10)
              if (/^[+\-]\d+/.test(sub)) {
                   const isPos = sub.startsWith('+');
                   return (
                     <span key={subIndex} className={`font-bold text-xs ml-1 px-1 rounded ${isPos ? 'text-blue-300 bg-blue-900/40' : 'text-red-300 bg-red-900/40'}`}>
                       {sub}
                     </span>
                   );
              }
              // Normal Numbers
              if (/^\d/.test(sub)) {
                  return <span key={subIndex} className="text-green-400 font-mono font-bold">{sub}</span>
              }
              // Regular text
              return <span key={subIndex} className="text-gray-300">{sub}</span>
          })}
        </span>
      );
    });
  };

  return (
    <div className="w-full bg-[#151515] border border-gray-700 rounded-lg overflow-hidden shadow-2xl font-mono text-sm ring-1 ring-white/10">
      {/* Title Bar - Improved Contrast & Visibility */}
      <div className="bg-[#222] px-3 py-2 flex items-center justify-between border-b border-gray-700 select-none">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]"></div>
          </div>
          <span className="text-xs text-gray-200 font-bold tracking-wider font-mono opacity-80">
            System_Status.log
          </span>
        </div>
        <div className="flex items-center gap-2">
           <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
           <span className="text-[10px] text-green-500 font-bold tracking-widest">LIVE</span>
        </div>
      </div>

      {/* Content Area - Compact & Scrollable */}
      <div className="p-4 max-h-[60vh] overflow-y-auto custom-scrollbar bg-[#0f0f0f] leading-snug">
        {lines.map((line, index) => {
          const text = line.trim();
          
          // 1. Headers (Start with **)
          if (text.startsWith('**') || text.endsWith('**')) {
             return (
               <div key={index} className="mt-4 mb-2 pt-2 border-t border-gray-800 text-fuchsia-400 font-bold uppercase tracking-wider text-xs flex items-center gap-2">
                 <span className="text-fuchsia-700">#</span> {text.replace(/\*\*/g, '')}
               </div>
             );
          }

          // 2. Date/Location (Top info)
          if (text.startsWith('📅') || text.startsWith('📍')) {
             return (
               <div key={index} className="text-yellow-400 font-bold text-sm mb-1 pl-1 border-l-2 border-yellow-600">
                 {text}
               </div>
             );
          }

          // 3. Warning / Important
          if (text.includes('⚠️') || text.includes('[중요]')) {
             return (
               <div key={index} className="my-2 p-2 bg-red-950/20 border border-red-500/30 rounded text-red-300 font-bold text-xs flex items-center gap-2">
                 <span>⚠️</span> {text.replace('⚠️', '').replace('[중요]:', '').trim()}
               </div>
             );
          }

          // 4. Heroine List Items (e.g. "1. [Name]")
          if (/^\d+\./.test(text)) {
             return (
               <div key={index} className="mb-1 pl-2 text-gray-300 hover:bg-white/5 rounded px-1 transition-colors">
                  {parseStatLine(text)}
               </div>
             )
          }

          // 5. Default Lines (likely stats)
          return (
             <div key={index} className="text-gray-400 mb-1 pl-1 border-l border-transparent hover:border-gray-700">
               {parseStatLine(text)}
             </div>
          );
        })}
      </div>
    </div>
  );
};

export default TerminalView;