
import React from 'react';

interface EditorProps {
  value: string;
  onChange?: (val: string) => void;
  language: string;
  readOnly?: boolean;
  placeholder?: string;
  isProcessing?: boolean;
  themeColor?: 'indigo' | 'emerald';
  side?: 'left' | 'right';
}

const Editor: React.FC<EditorProps> = ({ 
  value, 
  onChange, 
  language, 
  readOnly = false, 
  placeholder,
  isProcessing = false,
  themeColor = 'indigo',
  side = 'left'
}) => {
  const lineCount = value.split('\n').length;
  const charCount = value.length;
  
  const colors = {
    indigo: {
      border: 'border-indigo-500/30',
      text: 'text-indigo-400',
      bg: 'bg-indigo-950/10',
      accent: 'bg-indigo-500',
      glow: 'group-hover:shadow-[0_0_30px_rgba(99,102,241,0.15)]',
      rotation: 'lg:rotate-y-6',
    },
    emerald: {
      border: 'border-emerald-500/30',
      text: 'text-emerald-400',
      bg: 'bg-emerald-950/10',
      accent: 'bg-emerald-500',
      glow: 'group-hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]',
      rotation: 'lg:-rotate-y-6',
    }
  };

  const theme = colors[themeColor];

  return (
    <div className={`
      flex-1 flex flex-col relative group transition-all duration-700 ease-out
      [perspective:1000px]
    `}>
      {/* 3D Perspective Wrapper */}
      <div className={`
        flex-1 flex overflow-hidden bg-slate-950/40 backdrop-blur-md border ${theme.border} rounded-2xl 
        relative transition-all duration-500
        ${theme.rotation} hover:rotate-y-0 hover:scale-[1.02] hover:z-20
        ${theme.glow}
      `}>
        
        {/* Tactical HUD: Brackets */}
        <div className={`absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 ${theme.border} rounded-tl-lg z-10 opacity-50`}></div>
        <div className={`absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 ${theme.border} rounded-tr-lg z-10 opacity-50`}></div>
        <div className={`absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 ${theme.border} rounded-bl-lg z-10 opacity-50`}></div>
        <div className={`absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 ${theme.border} rounded-br-lg z-10 opacity-50`}></div>

        {/* HUD: Status LCDs */}
        <div className="absolute top-3 left-14 flex space-x-2 z-10 pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity">
          <div className={`px-1.5 py-0.5 rounded-sm bg-black/40 border border-slate-800 flex items-center space-x-1`}>
            <div className={`w-1 h-1 rounded-full ${theme.accent} animate-pulse`}></div>
            <span className="text-[7px] font-mono text-slate-400 uppercase tracking-tighter">Line:{lineCount}</span>
          </div>
          <div className={`px-1.5 py-0.5 rounded-sm bg-black/40 border border-slate-800`}>
            <span className="text-[7px] font-mono text-slate-400 uppercase tracking-tighter">Size:{charCount}b</span>
          </div>
        </div>

        {/* Line Numbers Column */}
        <div className={`
          hidden sm:flex flex-col items-end min-w-[3.5rem] p-4 pt-10
          border-r ${theme.border} bg-black/20 
          code-font text-[10px] leading-6 select-none ${theme.text} opacity-20
        `}>
          {Array.from({ length: Math.max(lineCount, 1) }).map((_, i) => (
            <div key={i} className="h-6">{i + 1}</div>
          ))}
        </div>

        {/* Text Area Container */}
        <div className="relative flex-1 pt-10">
          <textarea
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            readOnly={readOnly}
            placeholder={placeholder}
            spellCheck={false}
            className={`
              w-full h-full p-4 bg-transparent text-slate-200 outline-none resize-none 
              code-font text-[13px] leading-6 custom-scrollbar
              ${readOnly ? 'cursor-default' : 'cursor-text font-medium'}
            `}
            style={{ whiteSpace: 'pre', overflowWrap: 'normal' }}
          />

          {/* Processing Overlay */}
          {isProcessing && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center animate-in fade-in duration-500">
              <div className="relative mb-6 scale-150">
                <div className={`w-10 h-10 border-2 ${theme.border} border-t-white rounded-full animate-spin`}></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`w-4 h-4 ${theme.accent} rounded-full animate-ping opacity-40`}></div>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <span className={`text-[9px] font-black ${theme.text} uppercase tracking-[0.4em] mb-1`}>Logic Mapping</span>
                <div className="w-32 h-[1px] bg-slate-800 overflow-hidden">
                  <div className={`w-full h-full ${theme.accent} animate-[progress_1.5s_ease-in-out_infinite]`}></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes progress {
          0% { transform: translateX(-100%) }
          100% { transform: translateX(100%) }
        }
        .rotate-y-6 { transform: rotateY(6deg); }
        .-rotate-y-6 { transform: rotateY(-6deg); }
      `}} />
    </div>
  );
};

export default Editor;
