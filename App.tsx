import React, { useState, useEffect, useRef } from 'react';
import { initChat, sendMessage, setDynamicApiKey } from './services/geminiService';
import { Message, LoadingState, ParsedResponse } from './types';
import ChatMessage from './components/ChatMessage';
import InputArea from './components/InputArea';
import TerminalView from './components/TerminalView';
import ApiKeyModal from './components/ApiKeyModal';
import { parseResponse } from './utils/parser';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [lastParsedResponse, setLastParsedResponse] = useState<ParsedResponse | null>(null);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [hasKey, setHasKey] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loadingState]);

  const startGame = async () => {
    setLoadingState(LoadingState.LOADING);
    setMessages([]); // Clear previous messages on restart
    try {
      const initialText = await initChat();
      const parsed = parseResponse(initialText);
      setLastParsedResponse(parsed);
      
      setMessages([
        {
          id: 'init',
          role: 'model',
          text: initialText,
          timestamp: Date.now()
        }
      ]);
    } catch (e) {
      console.error(e);
      // If init fails, we show the error but DO NOT force the modal open again.
      // This prevents an infinite loop if the key is valid but the model is erroring.
      const errorMsg: Message = {
        id: 'error',
        role: 'model',
        text: "시스템 초기화 실패: 연결 상태를 확인하거나 API Key를 점검해주세요. 상단 'KEY' 버튼을 눌러 설정을 변경할 수 있습니다.",
        timestamp: Date.now()
      };
      setMessages([errorMsg]);
      // We do NOT setHasKey(false) here, to avoid trapping the user in the modal.
    } finally {
      setLoadingState(LoadingState.IDLE);
    }
  };

  // Initial Boot Logic
  useEffect(() => {
    const bootstrap = async () => {
      const savedKey = localStorage.getItem('harem_rpg_key');
      if (savedKey) {
        try {
          const key = atob(savedKey);
          setDynamicApiKey(key);
          setHasKey(true);
          await startGame();
        } catch (e) {
          console.error("Key load error", e);
          setHasKey(false);
          setIsKeyModalOpen(true);
        }
      } else {
        // Fallback to env key if available, otherwise open modal
        if (process.env.API_KEY) {
           setHasKey(true);
           await startGame();
        } else {
           setHasKey(false);
           setIsKeyModalOpen(true);
        }
      }
    };
    
    bootstrap();
  }, []);

  const handleSendMessage = async (text: string) => {
    if (loadingState === LoadingState.LOADING) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: text,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setLoadingState(LoadingState.LOADING);

    try {
      const responseText = await sendMessage(text);
      const parsed = parseResponse(responseText);
      setLastParsedResponse(parsed);

      const modelMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now() + 1
      };

      setMessages(prev => [...prev, modelMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "시스템 오류: 연결이 끊어졌거나 API가 응답하지 않습니다.",
        timestamp: Date.now() + 1
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoadingState(LoadingState.IDLE);
    }
  };

  const handleKeySave = (key: string) => {
    setDynamicApiKey(key);
    setHasKey(true);
    setIsKeyModalOpen(false);
    startGame(); // Restart game with new key
  };

  return (
    <div className="min-h-screen bg-rpg-black text-rpg-text font-sans">
      {/* Header */}
      <header className="fixed top-0 w-full bg-rpg-dark/90 backdrop-blur border-b border-rpg-gray z-40 h-14 flex items-center justify-between px-4">
        {/* API Key Button (Left) */}
        <button 
          onClick={() => setIsKeyModalOpen(true)}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-md border border-rpg-dim hover:border-rpg-accent bg-rpg-gray text-gray-300 hover:text-white transition-all duration-200"
          aria-label="API Settings"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
          </svg>
          <span className="hidden sm:inline text-xs font-bold">KEY</span>
        </button>

        <h1 className="text-rpg-accent font-bold tracking-widest uppercase text-sm sm:text-base absolute left-1/2 transform -translate-x-1/2">
          HaremRPG v5.0
        </h1>
        
        {/* Status Button (Right) */}
        <button 
          onClick={() => setIsStatusOpen(!isStatusOpen)}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-md border transition-all duration-200 ${
            isStatusOpen 
              ? 'bg-rpg-accent text-white border-rpg-accent' 
              : 'bg-rpg-gray text-gray-300 border-rpg-dim hover:border-rpg-accent hover:text-white'
          }`}
          aria-label="Toggle Status Window"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
          <span className="hidden sm:inline text-xs font-bold">STATUS</span>
        </button>
      </header>

      {/* Main Chat Container */}
      <main className="pt-20 pb-48 max-w-4xl mx-auto px-4 min-h-screen flex flex-col">
        {messages.length === 0 && loadingState === LoadingState.IDLE && (
           <div className="flex flex-col items-center justify-center h-[50vh] text-gray-500">
              <p>시스템 초기화 대기 중...</p>
           </div>
        )}

        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        
        {loadingState === LoadingState.LOADING && (
          <div className="flex justify-start mb-6 animate-pulse">
            <div className="bg-transparent rounded-lg p-4">
               <span className="text-rpg-accent">▋</span> GM이 시나리오를 생성중입니다...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Status Modal */}
      {isStatusOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setIsStatusOpen(false)}>
          <div className="w-full max-w-2xl transform transition-all" onClick={e => e.stopPropagation()}>
            <div className="flex justify-end mb-2">
              <button onClick={() => setIsStatusOpen(false)} className="text-gray-400 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {lastParsedResponse?.statusBlock ? (
              <TerminalView content={lastParsedResponse.statusBlock} />
            ) : (
               <div className="bg-rpg-black border border-rpg-gray p-8 text-center rounded-lg">
                 <p className="text-gray-500">데이터 수신 중...</p>
               </div>
            )}
          </div>
        </div>
      )}

      {/* API Key Modal */}
      <ApiKeyModal 
        isOpen={isKeyModalOpen} 
        onClose={() => setIsKeyModalOpen(false)}
        onSave={handleKeySave}
        isMandatory={!hasKey}
      />

      {/* Input / Action Area */}
      <InputArea 
        options={lastParsedResponse?.options || []} 
        onSend={handleSendMessage}
        isLoading={loadingState === LoadingState.LOADING}
        gameStarted={messages.length > 0}
      />
    </div>
  );
};

export default App;