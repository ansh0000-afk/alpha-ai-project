import React, { useState } from 'react';
import { X, GraduationCap, Clock, Sparkles, CheckCircle2, Loader2 } from 'lucide-react';

interface StudyPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanGenerated: (planText: string) => void;
}

const ALL_SUBJECTS = [
  'Book-Keeping & Accountancy (BK)',
  'Economics (HSC)',
  'Organization of Commerce & Mgmt (OCM)',
  'Secretarial Practice (SP)',
  'Mathematics & Statistics (Commerce)',
  'Information Technology (IT)',
  'English (HSC)',
];

export const StudyPlanModal: React.FC<StudyPlanModalProps> = ({
  isOpen,
  onClose,
  onPlanGenerated,
}) => {
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(ALL_SUBJECTS.slice(0, 4));
  const [hours, setHours] = useState<number>(5);
  const [goal, setGoal] = useState<string>('Maharashtra HSC Board Exams 90%+ Score');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const toggleSubject = (sub: string) => {
    if (selectedSubjects.includes(sub)) {
      setSelectedSubjects(selectedSubjects.filter((s) => s !== sub));
    } else {
      setSelectedSubjects([...selectedSubjects, sub]);
    }
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/generate-study-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjects: selectedSubjects,
          availableHoursPerDay: hours,
          targetExamDate: goal,
        }),
      });

      const data = await res.json();
      if (data.plan) {
        onPlanGenerated(data.plan);
        onClose();
      } else {
        alert('Plan generate karne me dikkat aayi dost.');
      }
    } catch (e) {
      console.error(e);
      alert('Error fetching study plan.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl relative text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-600 text-white shadow-md">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">Class 12 HSC Study Plan Generator</h2>
            <p className="text-xs text-slate-400">Apne timetable aur revision hours ke according personalized schedule banao</p>
          </div>
        </div>

        <div className="space-y-4 my-5">
          {/* Subjects Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Select Subjects for HSC Board:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {ALL_SUBJECTS.map((sub) => {
                const isSelected = selectedSubjects.includes(sub);
                return (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => toggleSubject(sub)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs text-left transition-all ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-200'
                        : 'bg-slate-800/50 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <CheckCircle2 className={`w-4 h-4 ${isSelected ? 'text-amber-400' : 'text-slate-600'}`} />
                    <span className="truncate">{sub}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Daily Study Hours */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Daily Available Study Hours:
              </label>
              <span className="text-xs font-bold text-amber-400">{hours} Hours / Day</span>
            </div>
            <input
              type="range"
              min={2}
              max={10}
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
              className="w-full accent-amber-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
          </div>

          {/* Target Goal */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Target Exam Goal:
            </label>
            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g. Maharashtra HSC Board 90%+, MHT-CET, 1-Month Revision"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Generate CTA */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleGenerate}
            disabled={isLoading || selectedSubjects.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-semibold shadow-lg shadow-amber-600/20 disabled:opacity-50 transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating Schedule...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Banao HSC Timetable</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
