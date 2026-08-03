import React from 'react';
import { ModeType } from '../types';
import { QUICK_PROMPTS } from '../data/quickPrompts';
import { Atom, FlaskConical, Calculator, GraduationCap, Code, Server, Terminal, Youtube, Video, Globe, Calendar, ArrowRight } from 'lucide-react';

interface QuickPromptsProps {
  currentMode: ModeType;
  onSelectPrompt: (promptText: string) => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Atom: <Atom className="w-4 h-4 text-amber-400" />,
  FlaskConical: <FlaskConical className="w-4 h-4 text-emerald-400" />,
  Calculator: <Calculator className="w-4 h-4 text-blue-400" />,
  GraduationCap: <GraduationCap className="w-4 h-4 text-purple-400" />,
  Code: <Code className="w-4 h-4 text-cyan-400" />,
  Server: <Server className="w-4 h-4 text-indigo-400" />,
  Terminal: <Terminal className="w-4 h-4 text-green-400" />,
  Youtube: <Youtube className="w-4 h-4 text-red-400" />,
  Video: <Video className="w-4 h-4 text-rose-400" />,
  Globe: <Globe className="w-4 h-4 text-teal-400" />,
  Calendar: <Calendar className="w-4 h-4 text-violet-400" />,
};

export const QuickPrompts: React.FC<QuickPromptsProps> = ({ currentMode, onSelectPrompt }) => {
  const filteredPrompts = QUICK_PROMPTS.filter(
    (p) => currentMode === 'general' || p.mode === currentMode
  );

  return (
    <div className="w-full my-4">
      <div className="flex items-center justify-between mb-2 px-1">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <span>⚡ Quick Hinglish Help Ideas</span>
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {filteredPrompts.slice(0, 4).map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectPrompt(item.prompt)}
            className="group flex flex-col justify-between p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 text-left transition-all hover:shadow-lg hover:-translate-y-0.5"
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="p-1.5 rounded-lg bg-slate-800 border border-slate-700">
                  {ICON_MAP[item.icon] || <Atom className="w-4 h-4 text-indigo-400" />}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
              </div>
              <h4 className="text-xs font-bold text-slate-200 group-hover:text-white mb-1">
                {item.title}
              </h4>
              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                {item.prompt}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
