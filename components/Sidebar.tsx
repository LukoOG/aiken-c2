
import React from 'react';
import { HistoryItem } from '../types';

interface SidebarProps {
  history: HistoryItem[];
  onSelectHistory: (item: HistoryItem) => void;
  onClearHistory: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ history, onSelectHistory, onClearHistory, isOpen, onClose }) => {
  return (
    <>
      {/* Mobile Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-40 transition-opacity duration-300 lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      {/* Sidebar Container */}
      <div className={`
        fixed inset-y-0 left-0 w-80 border-r border-slate-800/50 bg-[#020617] flex flex-col h-full z-50 transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) lg:relative lg:translate-x-0
        ${isOpen ? 'translate-x-0 shadow-[20px_0_50px_rgba(0,0,0,0.5)]' : '-translate-x-full'}
      `}>
        {/* Sidebar Header */}
        <div className="p-5 border-b border-slate-800/60 flex justify-between items-center h-16 shrink-0 bg-slate-950/40">
          <div className="flex items-center space-x-2.5">
            <div className="w-1.5 h-4 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
            <h2 className="text-[11px] font-black text-slate-100 uppercase tracking-[0.25em]">Workspace</h2>
          </div>
          <div className="flex items-center space-x-3">
            {history.length > 0 && (
              <button 
                onClick={onClearHistory}
                className="group relative px-2 py-1"
              >
                <span className="text-[10px] text-slate-500 group-hover:text-red-400 transition-colors uppercase font-bold">Clear</span>
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-red-500 transition-all group-hover:w-full"></span>
              </button>
            )}
            <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* History List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-gradient-to-b from-transparent to-slate-950/20">
          <div className="flex items-center justify-between mb-4 px-1">
            <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Recent Compilations</span>
            <span className="text-[9px] font-mono text-slate-700">{history.length}/50</span>
          </div>

          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-indigo-500/10 blur-xl rounded-full"></div>
                <svg xmlns="http://www.w3.org/2000/svg" className="relative h-10 w-10 text-slate-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <p className="text-slate-500 text-xs font-medium leading-relaxed">No history items yet.<br/><span className="text-slate-700">Compile logic to see them here.</span></p>
            </div>
          ) : (
            history.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onSelectHistory(item);
                  if (window.innerWidth < 1024) onClose();
                }}
                className="w-full text-left p-4 rounded-xl bg-slate-900/20 hover:bg-slate-900/60 transition-all border border-slate-800/40 hover:border-slate-700 group relative overflow-hidden"
              >
                <div className="flex justify-between items-center mb-2.5">
                  <div className="flex items-center space-x-2">
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-tighter ${
                      item.sourceLanguage === 'typescript' 
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                        : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                    }`}>
                      {item.sourceLanguage === 'typescript' ? 'TS' : 'PY'}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="h-1 w-1 rounded-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_0_5px_indigo]"></div>
                </div>
                <div className="text-[11px] text-slate-400 font-mono leading-relaxed truncate opacity-70 group-hover:opacity-100 transition-opacity">
                  {item.sourceCode.replace(/\s+/g, ' ').trim()}
                </div>
                
                {/* Glow bar */}
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-indigo-500 scale-y-0 group-hover:scale-y-100 transition-transform duration-300 shadow-[2px_0_8px_rgba(99,102,241,0.5)]" />
              </button>
            ))
          )}
        </div>
        
        {/* Status Bar */}
        <div className="p-4 bg-slate-950 border-t border-slate-800/80">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center space-x-3">
              <div className="relative flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <div className="absolute w-2 h-2 rounded-full bg-emerald-500 animate-ping opacity-40"></div>
              </div>
              <div className="flex flex-col -space-y-0.5">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Compiler Online</span>
                <span className="text-[8px] text-slate-600 font-medium">GEMINI-3-PRO-LATEST</span>
              </div>
            </div>
            <div className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
              <span className="text-[8px] font-mono text-indigo-500 font-bold tracking-widest">TLS 1.3</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
