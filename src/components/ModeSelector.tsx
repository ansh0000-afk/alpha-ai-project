import React from 'react';
import { ModeType } from '../types';
import { Sparkles, GraduationCap, Code, Youtube, Globe, CheckSquare } from 'lucide-react';

interface ModeSelectorProps {
  currentMode: ModeType;
  onModeChange: (mode: ModeType) => void;
}

interface ModeConfig {
  id: ModeType;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  activeColor: string;
  badge: string;
}

export const MODES: ModeConfig[] = [
  {
    id: 'general',
    label: 'Alpha AI All-Rounder',
    sublabel: 'General Chat & Daily Help',
    icon: <Sparkles className="w-4 h-4" />,
    activeColor: 'from-indigo-600 to-purple-600 border-indigo-500',
    badge: 'Hinglish AI',
  },
  {
    id: 'mh-board',
    label: 'HSC 12th Commerce',
    sublabel: 'BK & Acc, Eco, OCM, SP, Maths & IT',
    icon: <GraduationCap className="w-4 h-4" />,
    activeColor: 'from-amber-600 to-orange-600 border-amber-500',
    badge: 'Commerce HSC',
  },
  {
    id: 'coding',
    label: 'Coding & Debugging',
    sublabel: 'Web Dev, Python, React, C++',
    icon: <Code className="w-4 h-4" />,
    activeColor: 'from-cyan-600 to-blue-600 border-cyan-500',
    badge: 'Code Step-by-Step',
  },
  {
    id: 'youtube',
    label: 'YouTube Creator',
    sublabel: 'Ideas, Scripts, Titles & Tags',
    icon: <Youtube className="w-4 h-4" />,
    activeColor: 'from-red-600 to-rose-600 border-red-500',
    badge: 'YT Growth',
  },
  {
    id: 'website',
    label: 'Website Builder',
    sublabel: 'HTML/CSS, React & Deploy',
    icon: <Globe className="w-4 h-4" />,
    activeColor: 'from-emerald-600 to-teal-600 border-emerald-500',
    badge: 'Web Architecture',
  },
  {
    id: 'tasks',
    label: 'Daily Tasks & Planner',
    sublabel: 'Routine, Timetable & Reminders',
    icon: <CheckSquare className="w-4 h-4" />,
    activeColor: 'from-violet-600 to-purple-600 border-violet-500',
    badge: 'Task Master',
  },
];

export const ModeSelector: React.FC<ModeSelectorProps> = ({ currentMode, onModeChange }) => {
  return (
    <div className="w-full bg-slate-900/60 border-b border-slate-800 p-2 overflow-x-auto no-scrollbar">
      <div className="max-w-7xl mx-auto flex items-center gap-2 min-w-max px-2">
        {MODES.map((mode) => {
          const isActive = currentMode === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => onModeChange(mode.id)}
              className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-left transition-all ${
                isActive
                  ? `bg-gradient-to-r ${mode.activeColor} text-white shadow-lg border`
                  : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/50'
              }`}
            >
              <div className={`p-1.5 rounded-lg ${isActive ? 'bg-white/20' : 'bg-slate-700 text-slate-300'}`}>
                {mode.icon}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold">{mode.label}</span>
                  {isActive && (
                    <span className="text-[10px] bg-white/20 text-white font-medium px-1.5 py-0.2 rounded-full">
                      {mode.badge}
                    </span>
                  )}
                </div>
                <p className={`text-[10px] ${isActive ? 'text-white/80' : 'text-slate-400'}`}>
                  {mode.sublabel}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
