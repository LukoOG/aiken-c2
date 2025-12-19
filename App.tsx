
import React, { useState, useCallback, useEffect, useRef } from 'react';
import Editor from './components/Editor';
import Sidebar from './components/Sidebar';
import { SourceLanguage, TranspilationResult, HistoryItem } from './types';
import { geminiService } from './services/geminiService';
import { DEFAULT_TS_CODE, DEFAULT_PY_CODE, MOCK_HISTORY, TEMPLATES } from './constants';

const NewFileModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSelect: (lang: SourceLanguage, templateKey: string) => void;
}> = ({ isOpen, onClose, onSelect }) => {
  const [selectedLang, setSelectedLang] = useState<SourceLanguage | null>(null);

  if (!isOpen) return null;

  const templatesList = [
    { id: 'basic', name: 'Basic Validator', desc: 'Minimal functional boilerplate' },
    { id: 'vesting', name: 'Vesting Logic', desc: 'Datum-based time locking' },
    { id: 'oracle', name: 'Oracle Client', desc: 'Price feed consumption logic' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-[#020617] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl shadow-indigo-500/10">
        <div className="p-6 border-b border-slate-800 bg-slate-950/50 flex justify-between items-center">
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-[0.2em]">Initialize New Logic</h2>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Select environment & blueprint</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="space-y-3">
            <h3 className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] px-1">1. Choose Language</h3>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setSelectedLang('typescript')}
                className={`flex flex-col items-center p-6 bg-slate-800/20 border transition-all group rounded-xl ${selectedLang === 'typescript' ? 'border-indigo-500 bg-indigo-500/5' : 'border-slate-800 hover:border-slate-700'}`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform font-black ${selectedLang === 'typescript' ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-500'}`}>TS</div>
                <span className={`text-xs font-bold uppercase tracking-widest ${selectedLang === 'typescript' ? 'text-indigo-400' : 'text-slate-500'}`}>TypeScript</span>
              </button>
              <button 
                onClick={() => setSelectedLang('python')}
                className={`flex flex-col items-center p-6 bg-slate-800/20 border transition-all group rounded-xl ${selectedLang === 'python' ? 'border-indigo-500 bg-indigo-500/5' : 'border-slate-800 hover:border-slate-700'}`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform font-black ${selectedLang === 'python' ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-500'}`}>PY</div>
                <span className={`text-xs font-bold uppercase tracking-widest ${selectedLang === 'python' ? 'text-indigo-400' : 'text-slate-500'}`}>Python</span>
              </button>
            </div>
          </div>

          <div className={`space-y-3 transition-all duration-500 ${selectedLang ? 'opacity-100' : 'opacity-20 pointer-events-none'}`}>
            <h3 className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] px-1">2. Choose Template</h3>
            <div className="space-y-2">
              {templatesList.map(t => (
                <button 
                  key={t.id}
                  onClick={() => selectedLang && onSelect(selectedLang, t.id)}
                  className="w-full flex items-center justify-between p-4 bg-slate-900/40 border border-slate-800 rounded-xl hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all text-left group"
                >
                  <div>
                    <div className="text-[11px] font-black text-slate-300 group-hover:text-indigo-400 transition-colors uppercase tracking-wider">{t.name}</div>
                    <div className="text-[9px] text-slate-600 font-mono mt-0.5">{t.desc}</div>
                  </div>
                  <div className="w-8 h-8 rounded-full border border-slate-800 flex items-center justify-center group-hover:border-indigo-500/50 group-hover:bg-indigo-500/10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-700 group-hover:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [sourceCode, setSourceCode] = useState(DEFAULT_TS_CODE);
  const [aikenResult, setAikenResult] = useState<TranspilationResult | null>(null);
  const [language, setLanguage] = useState<SourceLanguage>('typescript');
  const [isTranspiling, setIsTranspiling] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showExplanation, setShowExplanation] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('aiken_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history", e);
        setHistory(MOCK_HISTORY);
      }
    } else {
      setHistory(MOCK_HISTORY);
    }
  }, []);

  const saveToHistory = useCallback((item: HistoryItem) => {
    setHistory(prev => {
      const newHistory = [item, ...prev].slice(0, 50);
      localStorage.setItem('aiken_history', JSON.stringify(newHistory));
      return newHistory;
    });
  }, []);

  const handleTranspile = async () => {
    if (!sourceCode.trim()) return;
    
    setIsTranspiling(true);
    const result = await geminiService.transpile(sourceCode, language);
    setAikenResult(result);
    setIsTranspiling(false);

    if (result.aikenCode) {
      saveToHistory({
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        sourceLanguage: language,
        sourceCode: sourceCode,
        result: result
      });
    }
  };

  const handleLanguageChange = (lang: SourceLanguage) => {
    setLanguage(lang);
    if (lang === 'typescript') setSourceCode(DEFAULT_TS_CODE);
    else setSourceCode(DEFAULT_PY_CODE);
  };

  const handleSelectHistory = (item: HistoryItem) => {
    setLanguage(item.sourceLanguage);
    setSourceCode(item.sourceCode);
    setAikenResult(item.result);
  };

  const handleCopyCode = () => {
    if (aikenResult?.aikenCode) {
      navigator.clipboard.writeText(aikenResult.aikenCode);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleDownloadCode = () => {
    if (!aikenResult?.aikenCode) return;
    const blob = new Blob([aikenResult.aikenCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contract_${Date.now()}.ak`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setSourceCode(content);
      
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'py') setLanguage('python');
      else if (ext === 'ts' || ext === 'js') setLanguage('typescript');
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleInitializeNew = (lang: SourceLanguage, templateKey: string) => {
    const templateCode = (TEMPLATES as any)[lang][templateKey];
    setLanguage(lang);
    setSourceCode(templateCode || (lang === 'typescript' ? DEFAULT_TS_CODE : DEFAULT_PY_CODE));
    setAikenResult(null);
    setIsNewModalOpen(false);
  };

  const handlePasteSource = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setSourceCode(text);
    } catch (err) {
      console.error("Failed to read clipboard", err);
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('aiken_history');
  };

  return (
    <div className="flex h-screen w-full bg-[#020617] text-slate-200 overflow-hidden relative font-sans">
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#4f46e5 0.5px, transparent 0.5px), linear-gradient(to right, #ffffff05 1px, transparent 1px), linear-gradient(to bottom, #ffffff05 1px, transparent 1px)', backgroundSize: '60px 60px, 30px 30px, 30px 30px' }}>
      </div>

      <Sidebar 
        history={history} 
        onSelectHistory={handleSelectHistory} 
        onClearHistory={handleClearHistory}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <NewFileModal 
        isOpen={isNewModalOpen} 
        onClose={() => setIsNewModalOpen(false)} 
        onSelect={handleInitializeNew}
      />

      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative z-10">
        <header className="h-16 shrink-0 border-b border-slate-800/40 flex items-center justify-between px-4 sm:px-6 bg-slate-950/60 backdrop-blur-xl sticky top-0 z-50 shadow-2xl">
          <div className="flex items-center space-x-3 sm:space-x-6">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>

            <div className="flex items-center space-x-3 group cursor-default">
              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-tr from-indigo-500 to-emerald-500 rounded-lg blur-md opacity-20 group-hover:opacity-40 transition duration-500"></div>
                <div className="relative w-9 h-9 bg-slate-900 rounded-lg flex items-center justify-center border border-slate-700/50">
                  <span className="text-white font-black text-xl select-none">A</span>
                </div>
              </div>
              <div className="flex flex-col -space-y-0.5">
                <h1 className="text-sm font-black tracking-tighter text-slate-100 sm:text-base uppercase">Aiken<span className="text-indigo-500">Bridge</span></h1>
                <div className="flex items-center space-x-2">
                  <span className="text-[8px] text-emerald-500 font-bold uppercase tracking-[0.3em]">Neural Compiler</span>
                </div>
              </div>
            </div>

            <div className="hidden md:flex items-center p-0.5 bg-slate-900/80 rounded-lg border border-slate-800/50 ml-4">
              {['typescript', 'python'].map((lang) => (
                <button 
                  key={lang}
                  onClick={() => handleLanguageChange(lang as any)}
                  className={`relative px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded transition-all duration-300 ${
                    language === lang ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {language === lang && <div className="absolute inset-0 bg-indigo-600/80 rounded shadow-lg"></div>}
                  <span className="relative z-10">{lang === 'typescript' ? 'TS' : 'PY'}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <button 
              onClick={() => setIsNewModalOpen(true)}
              className="hidden sm:flex items-center space-x-2 px-4 py-2 rounded-xl text-[10px] font-black text-slate-400 border border-slate-800 hover:text-white hover:border-slate-600 transition-all uppercase tracking-widest"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              <span>New File</span>
            </button>

            <button 
              onClick={handleTranspile}
              disabled={isTranspiling}
              className={`group relative flex items-center space-x-3 px-6 py-2.5 rounded-xl text-xs font-black transition-all duration-500 disabled:opacity-50 overflow-hidden ${
                isTranspiling ? 'bg-slate-800 shadow-inner' : 'bg-white text-black hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]'
              }`}
            >
              {isTranspiling ? (
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="uppercase tracking-widest">Bridging...</span>
                </div>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  <span className="uppercase tracking-widest">Start Build</span>
                </>
              )}
            </button>
          </div>
        </header>

        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept=".ts,.js,.py" 
          onChange={handleFileUpload} 
        />

        <div className="flex-1 flex flex-col lg:flex-row p-6 gap-0 lg:gap-2 overflow-hidden bg-[#020617] [perspective:2000px]">
          
          <div className="flex-1 flex flex-col min-w-0 z-10">
            <div className="flex items-center justify-between mb-3 px-4">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">Input Stream</span>
                <span className="text-[8px] text-slate-700 font-mono">CHANNEL_ALPHA_01</span>
              </div>
              
              <div className="flex items-center space-x-2 bg-slate-900/50 p-1.5 rounded-xl border border-slate-800/50">
                <button 
                  onClick={() => setIsNewModalOpen(true)}
                  className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors group relative"
                  title="New File Wizard"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400 group-hover:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </button>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors group"
                  title="Import from Disk"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400 group-hover:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </button>
                <div className="w-px h-3 bg-slate-800 mx-0.5"></div>
                <button 
                  onClick={handlePasteSource}
                  className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors group"
                  title="Paste from Clipboard"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400 group-hover:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </button>
              </div>
            </div>
            <Editor 
              value={sourceCode} 
              onChange={setSourceCode} 
              language={language}
              themeColor="indigo"
              isProcessing={isTranspiling}
              side="left"
            />
          </div>

          <div className="hidden lg:flex flex-col items-center justify-center w-16 relative z-30">
            <div className="h-full w-[2px] bg-gradient-to-b from-transparent via-slate-800 to-transparent relative">
              {isTranspiling && (
                <div className="absolute inset-0 overflow-hidden">
                  <div className="particle-stream"></div>
                </div>
              )}
              <div className={`
                absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                w-12 h-14 bg-slate-950 border border-slate-800 flex items-center justify-center
                [clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)]
                transition-all duration-500
                ${isTranspiling ? 'border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.4)] rotate-90' : 'rotate-0'}
              `}>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-colors duration-500 ${isTranspiling ? 'text-white animate-pulse' : 'text-slate-700'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              {isTranspiling && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl animate-pulse"></div>
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col min-w-0 z-10">
            <div className="flex items-center justify-between mb-3 px-4">
              <div className="flex items-center space-x-2 bg-slate-900/50 p-1.5 rounded-xl border border-slate-800/50">
                <button 
                  onClick={handleCopyCode}
                  disabled={!aikenResult?.aikenCode}
                  className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors group disabled:opacity-30"
                  title="Copy Results"
                >
                  {copySuccess ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400 group-hover:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                  )}
                </button>
                <button 
                  onClick={handleDownloadCode}
                  disabled={!aikenResult?.aikenCode}
                  className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors group disabled:opacity-30"
                  title="Download .ak"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400 group-hover:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </button>
              </div>

              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em]">Target Output</span>
                <span className="text-[8px] text-slate-700 font-mono">GEN_SIG_BETA_V2</span>
              </div>
            </div>
            <Editor 
              value={aikenResult?.aikenCode || ''} 
              readOnly 
              language="aiken" 
              themeColor="emerald"
              side="right"
            />
          </div>
        </div>

        {showExplanation && (aikenResult?.explanation || aikenResult?.errors) && (
          <div className="h-48 shrink-0 bg-slate-950/90 border-t border-slate-800/60 p-6 overflow-y-auto animate-in slide-in-from-bottom-10 duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center space-x-3 mb-4 opacity-60">
                <div className={`w-1.5 h-1.5 rounded-full ${aikenResult?.errors ? 'bg-red-500' : 'bg-indigo-500'}`}></div>
                <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">System_Trace Log</h3>
              </div>
              <div className="font-mono text-xs leading-relaxed text-slate-400 bg-black/20 p-4 rounded-lg border border-slate-900">
                {aikenResult?.errors ? (
                  <span className="text-red-400/80">{aikenResult.errors}</span>
                ) : (
                  <>
                    <span className="text-indigo-500 mr-2">>>></span>
                    {aikenResult?.explanation}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .particle-stream {
          width: 100%;
          height: 100%;
          background: linear-gradient(to bottom, transparent 0%, rgba(99, 102, 241, 0.5) 50%, transparent 100%);
          background-size: 100% 20px;
          animation: flow-particles 0.8s linear infinite;
        }
        @keyframes flow-particles {
          0% { background-position: 0 0; }
          100% { background-position: 0 40px; }
        }
        .rotate-y-6 { transform: perspective(1000px) rotateY(6deg); }
        .-rotate-y-6 { transform: perspective(1000px) rotateY(-6deg); }
        .rotate-y-0 { transform: perspective(1000px) rotateY(0deg); }
      `}} />
    </div>
  );
};

export default App;
