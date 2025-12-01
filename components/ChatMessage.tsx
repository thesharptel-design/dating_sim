import React from 'react';
import { Message } from '../types';
import ReactMarkdown from 'react-markdown';
import { parseResponse } from '../utils/parser';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  
  // If model, parse to separate status block, but only render narrative here
  const parsed = !isUser ? parseResponse(message.text) : null;

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[95%] sm:max-w-[85%] ${isUser ? 'bg-rpg-gray border border-rpg-dim' : 'bg-transparent'} rounded-lg p-4`}>
        {isUser ? (
          <p className="text-rpg-text whitespace-pre-wrap">{message.text}</p>
        ) : (
          <div className="prose prose-invert prose-p:text-rpg-text prose-headings:text-rpg-text max-w-none text-sm sm:text-base leading-relaxed">
            <ReactMarkdown>{parsed?.narrative || ''}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;