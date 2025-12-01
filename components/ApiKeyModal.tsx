import React, { useState, useEffect } from 'react';
import { testConnection } from '../services/geminiService';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (key: string) => void;
  isMandatory?: boolean;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onSave, isMandatory = false }) => {
  const [key, setKey] = useState('');
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('harem_rpg_key');
    if (saved) {
      try {
        setKey(atob(saved));
      } catch (e) { 
        console.error("Failed to decode key", e); 
      }
    }
  }, []);

  const handleTest = async () => {
    if (!key) return false;
    setStatus('testing');
    const success = await testConnection(key);
    setStatus(success ? 'success' : 'error');
    return success;
  };

  const handleSave = async () => {
    if (!key || isSaving) return;
    setIsSaving(true);
    
    // If not already tested successfully, test it now before allowing start
    if (status !== 'success') {
        setStatus('testing');
        const isValid = await testConnection(key);
        if (!isValid) {
            setStatus('error');
            setIsSaving(false);
            return;
        }
        setStatus('success');
    }

    // Simple Base64 encoding for local storage "encryption"
    localStorage.setItem('harem_rpg_key', btoa(key));
    
    // Brief delay to visually confirm success before transition
    setTimeout(() => {
      onSave(key);
      setIsSaving(false);
    }, 500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-rpg-gray border border-rpg-dim rounded-lg p-6 w-full max-w-md shadow-2xl relative">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-rpg-accent">
            {isMandatory ? 'SYSTEM INITIALIZATION' : 'API KEY CONFIGURATION'}
          </h2>
          <div className="w-2 h-2 rounded-full bg-rpg-accent animate-pulse"></div>
        </div>
        
        <p className="text-xs text-gray-400 mb-6 leading-relaxed">
          {isMandatory 
            ? "게임 시스템을 가동하기 위해 Google Gemini API 키가 필요합니다." 
            : "Google Gemini API 키를 수정합니다."}
          <br/>
          입력된 키는 Base64로 암호화되어 로컬 스토리지에 저장됩니다.
        </p>
        
        <div className="space-y-4">
          <div>
            <label className="text-xs text-rpg-dim font-mono mb-1 block">GOOGLE_GEN_AI_KEY</label>
            <input 
              type="password" 
              value={key}
              onChange={(e) => { setKey(e.target.value); setStatus('idle'); }}
              onKeyDown={handleKeyDown}
              className="w-full bg-rpg-black border border-rpg-dim rounded px-3 py-3 text-white focus:border-rpg-accent outline-none font-mono text-sm transition-colors"
              placeholder="AIzaSy..."
            />
          </div>

          <div className="flex justify-between items-center pt-2">
            <button 
              onClick={() => handleTest()}
              disabled={status === 'testing' || !key || isSaving}
              className={`text-xs px-3 py-1.5 rounded border transition-colors flex items-center gap-2 ${
                  status === 'success' ? 'border-green-500 text-green-500 bg-green-500/10' :
                  status === 'error' ? 'border-red-500 text-red-500 bg-red-500/10' :
                  'border-gray-600 text-gray-400 hover:border-gray-400 hover:text-white'
              }`}
            >
              {status === 'testing' && <span className="animate-spin">⟳</span>}
              {status === 'testing' ? '연결 확인 중...' : 
               status === 'success' ? '연결 성공 (OK)' : 
               status === 'error' ? '연결 실패 (FAIL)' : '연결 테스트'}
            </button>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3 border-t border-rpg-dim/30 pt-4">
          {!isMandatory && (
            <button 
              onClick={onClose} 
              disabled={isSaving}
              className="px-4 py-2 text-gray-500 hover:text-white text-sm transition-colors"
            >
              닫기
            </button>
          )}
          <button 
            onClick={handleSave}
            disabled={!key || isSaving}
            className="px-6 py-2 bg-rpg-accent hover:bg-red-600 text-white font-bold rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-red-900/20 flex items-center gap-2"
          >
            {isSaving && <span className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full"></span>}
            {isMandatory ? '게임 시작' : '저장 및 적용'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;