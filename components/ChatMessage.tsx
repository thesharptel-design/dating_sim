
import React from 'react';
import { Message } from '../types';
import ReactMarkdown, { Components } from 'react-markdown';
import { parseResponse } from '../utils/parser';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  
  // If model, parse to separate status block, but only render narrative here
  const parsed = !isUser ? parseResponse(message.text) : null;
  
  let content = isUser ? message.text : (parsed?.narrative || '');

  // Pre-process Narrative to style Day/Time and Location tags specifically
  // Converts "[Date/Time]" and "[Location]" at start of lines into custom Markdown headers (###)
  if (!isUser) {
    content = content.replace(/^(\[[^\]\n]+\])/gm, '### $1');
  }

  // Helper to safely extract text content for condition checking
  const getNodeText = (children: React.ReactNode): string => {
    if (typeof children === 'string') return children;
    if (Array.isArray(children)) return children.map(getNodeText).join('');
    return '';
  };

  // Custom Markdown Components for RPG aesthetics
  const markdownComponents: Components = {
    // Emphasis / Impact
    strong: ({node, ...props}) => <span className="text-red-400 font-bold drop-shadow-sm" {...props} />,
    
    // Inner thought / Atmosphere
    em: ({node, ...props}) => <span className="text-purple-300 italic opacity-90" {...props} />,
    
    // H1/H2 for Story Titles
    h1: ({node, ...props}) => <h1 className="text-xl sm:text-2xl font-bold text-white mt-6 mb-3 border-b border-red-900/50 pb-2 tracking-wide" {...props} />,
    h2: ({node, ...props}) => <h2 className="text-lg sm:text-xl font-bold text-gray-100 mt-5 mb-2 flex items-center gap-2" {...props} />,
    
    // H3 -> Specifically used for [Date/Time] and [Location] tags via pre-processing
    h3: ({node, ...props}) => {
      const text = getNodeText(props.children);
      const isTime = text.includes('/') || text.includes('일차') || text.includes('시간');
      
      const Icon = isTime ? (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-amber-400">
          <path d="M12.75 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM7.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM8.25 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM9.75 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM10.5 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM12.75 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM14.25 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 13.5a.75.75 0 100-1.5.75.75 0 000 1.5z" />
          <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zm13.5 9a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-rose-400">
          <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
        </svg>
      );

      return (
        <div className={`flex items-center gap-3 mb-2 w-fit px-4 py-2 rounded-lg border-l-4 shadow-sm backdrop-blur-sm transition-all hover:scale-[1.02] ${
           isTime 
            ? 'bg-gradient-to-r from-amber-950/40 to-transparent border-amber-500/80' 
            : 'bg-gradient-to-r from-rose-950/40 to-transparent border-rose-500/80'
        }`}>
           {Icon}
           <span className={`text-sm font-bold font-mono tracking-wide ${
             isTime ? 'text-amber-100' : 'text-rose-100'
           }`}>
             {props.children}
           </span>
        </div>
      );
    },

    // Blockquotes (System messages or flashbacks)
    blockquote: ({node, ...props}) => (
      <blockquote className="border-l-2 border-rpg-dim pl-4 py-2 my-4 text-gray-400 italic bg-white/5 rounded-r-md text-xs sm:text-sm" {...props} />
    ),

    // Lists
    ul: ({node, ...props}) => <ul className="list-disc pl-5 my-3 text-gray-300 space-y-1 text-sm sm:text-base" {...props} />,
    ol: ({node, ...props}) => <ol className="list-decimal pl-5 my-3 text-gray-300 space-y-1 text-sm sm:text-base" {...props} />,
    
    // Paragraph spacing - Reduced font size for mobile
    p: ({node, ...props}) => <p className="mb-4 leading-7 text-gray-200/90 text-sm sm:text-base" {...props} />,
    
    // Code for stats (inline)
    code: ({node, ...props}) => <span className="font-mono text-[10px] sm:text-xs bg-black/40 px-1 py-0.5 rounded text-green-400 border border-green-900/30" {...props} />,
  };

  return (
    <div className={`flex w-full mb-6 animate-fade-in-up ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div 
        className={`relative max-w-[95%] sm:max-w-[90%] rounded-xl p-4 sm:p-6 shadow-lg transition-all duration-300 ${
          isUser 
            ? 'bg-rpg-gray border border-rpg-dim/50 rounded-tr-none' 
            : 'bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border-l-2 border-rpg-accent/60 rounded-tl-none'
        }`}
      >
        {/* Role Label */}
        <div className="absolute -top-3 left-4 px-2 py-0.5 bg-black/80 border border-gray-800 rounded text-[10px] font-mono tracking-widest text-gray-500 uppercase">
          {isUser ? 'PLAYER' : 'GAME MASTER'}
        </div>

        {isUser ? (
          <p className="text-gray-200 whitespace-pre-wrap leading-relaxed text-sm sm:text-base font-medium">
            {content}
          </p>
        ) : (
          <div className="text-sm sm:text-base text-rpg-text">
            <ReactMarkdown components={markdownComponents}>
              {content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
