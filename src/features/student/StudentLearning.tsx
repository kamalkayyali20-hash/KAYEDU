import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { storageService } from '../../services/storageService';
import { Homework, Exam, MaterialItem } from '../../types';
import {
  BookOpen,
  FileCheck,
  FileText,
  TrendingUp,
  Download,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
  X,
  Sparkles,
  ArrowRight,
  HelpCircle
} from 'lucide-react';

export const StudentLearning: React.FC = () => {
  const { t, language } = useLanguage();

  const [activeTab, setActiveTab] = useState<'materials' | 'homework' | 'exams' | 'progress'>('materials');

  const materials = storageService.getMaterials ? storageService.getMaterials() : (storageService as any).getMaterials?.() || [
    {
      id: 'mat_1',
      title: 'Physics Chapter 1 Summary — Vectors & Motion Notes (PDF)',
      subject: 'Physics',
      grade: 'Grade 11',
      teacherName: 'Mr. Ahmed Hassan',
      type: 'pdf',
      fileSize: '4.2 MB',
      url: '#',
      date: '2026-09-05'
    },
    {
      id: 'mat_2',
      title: 'Comprehensive Organic Chemistry Formulas & Functional Groups',
      subject: 'Chemistry',
      grade: 'Grade 11',
      teacherName: 'Dr. Mona El-Sayed',
      type: 'pdf',
      fileSize: '3.1 MB',
      url: '#',
      date: '2026-09-06'
    }
  ] as MaterialItem[];

  const homeworkList = storageService.getHomework();
  const exams = storageService.getExams();

  // Homework interactive submission state
  const [selectedHw, setSelectedHw] = useState<Homework | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isHwSubmitted, setIsHwSubmitted] = useState(false);

  // Exam taking interactive state
  const [activeExam, setActiveExam] = useState<Exam | null>(null);
  const [examAnswers, setExamAnswers] = useState<Record<string, string>>({});
  const [examSubmittedScore, setExamSubmittedScore] = useState<{ score: number; total: number; pct: number } | null>(null);

  const handleSelectExamAnswer = (questionId: string, choice: string) => {
    setExamAnswers(prev => ({ ...prev, [questionId]: choice }));
  };

  const handleFinishExam = () => {
    if (!activeExam) return;
    let earned = 0;
    activeExam.questions.forEach(q => {
      if (examAnswers[q.id] === q.correctAnswer) {
        earned += q.points;
      }
    });
    const pct = Math.round((earned / activeExam.totalPoints) * 100);
    setExamSubmittedScore({ score: earned, total: activeExam.totalPoints, pct });
  };

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* Title */}
      <div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
          {t('navLearning')}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {language === 'ar'
            ? 'المواد والمذكرات والواجبات والاختبارات الأسبوعية'
            : 'Access worksheets, submit assignments, and take scheduled assessments.'}
        </p>
      </div>

      {/* Sub-Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-200 dark:bg-slate-800 rounded-2xl text-xs font-bold">
        {[
          { id: 'materials', label: t('materials'), icon: FileText },
          { id: 'homework', label: t('homework'), icon: BookOpen },
          { id: 'exams', label: t('exams'), icon: FileCheck },
          { id: 'progress', label: t('navProgress'), icon: TrendingUp },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-2 px-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: MATERIALS */}
      {activeTab === 'materials' && (
        <div className="space-y-3">
          {materials.map(mat => (
            <div
              key={mat.id}
              className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shadow-sm hover:border-indigo-400 transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                  PDF
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {mat.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {mat.subject} • {mat.teacherName} • {mat.fileSize || '3.5 MB'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => alert(`Downloading: ${mat.title}`)}
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-indigo-600 hover:text-white transition-colors shrink-0"
                title="Download Material"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: HOMEWORK */}
      {activeTab === 'homework' && (
        <div className="space-y-3">
          {homeworkList.map(hw => (
            <div
              key={hw.id}
              className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                    {hw.subject} • {hw.grade}
                  </span>
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mt-1.5">
                    {hw.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {hw.instructions}
                  </p>
                </div>
                <div className="text-end shrink-0">
                  <span className="text-[10px] text-slate-400 block font-mono">
                    Due: {hw.dueDate.split(' ')[0]}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  {hw.questionsCount} Questions • 10 Points Total
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedHw(hw);
                    setIsHwSubmitted(false);
                    setAnswers({});
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors shadow-sm"
                >
                  {t('submitHomework')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: EXAMS */}
      {activeTab === 'exams' && (
        <div className="space-y-3">
          {exams.map(ex => (
            <div
              key={ex.id}
              className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                    {ex.subject} Assessment
                  </span>
                  <span className="text-xs text-slate-400">
                    {ex.durationMinutes} Minutes
                  </span>
                </div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mt-1.5">
                  {ex.title}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {ex.questions.length} Questions • {ex.totalPoints} Points Total
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setActiveExam(ex);
                  setExamAnswers({});
                  setExamSubmittedScore(null);
                }}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-colors self-start sm:self-auto"
              >
                {t('takeExam')}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: STUDENT PROGRESS (Section 27) */}
      {activeTab === 'progress' && (
        <div className="space-y-4">
          {/* Standing Card */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">
                  {t('performanceStatus')}
                </span>
                <h3 className="text-xl font-black text-amber-600 dark:text-amber-400 mt-0.5">
                  Needs Attention
                </h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>

            {/* Clear Transparent Reasons (as required by Section 27!) */}
            <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-xs space-y-2">
              <span className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4" />
                {t('statusReasons')}:
              </span>
              <ul className="list-disc ps-5 space-y-1 text-slate-700 dark:text-slate-300">
                <li>Attendance decreased to 72% over the last two weeks (1 unexcused absence).</li>
                <li>2 physics homework assignments are currently missing or submitted late.</li>
                <li>Physics quiz average decreased by 8% in the latest mechanics assessment.</li>
              </ul>
            </div>
          </div>

          {/* Detailed metrics breakdown */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 font-bold">Attendance Rate</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">88.5%</p>
              <p className="text-[11px] text-slate-400 mt-0.5">14 attended of 16 sessions</p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 font-bold">Homework Completion</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">83%</p>
              <p className="text-[11px] text-slate-400 mt-0.5">5 submitted of 6 assignments</p>
            </div>
          </div>
        </div>
      )}

      {/* Homework Submission Modal */}
      {selectedHw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {selectedHw.title}
                </h3>
                <p className="text-xs text-slate-500">{selectedHw.subject} Assignment</p>
              </div>
              <button
                onClick={() => setSelectedHw(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isHwSubmitted ? (
              <div className="text-center py-6 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Homework Submitted Successfully!
                </h4>
                <p className="text-xs text-slate-500">
                  Recorded timestamp: {new Date().toLocaleTimeString()}
                </p>
                <button
                  onClick={() => setSelectedHw(null)}
                  className="py-2 px-6 bg-indigo-600 text-white rounded-xl text-xs font-bold"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedHw.questions?.map((q, idx) => (
                  <div key={q.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-xs space-y-2">
                    <p className="font-bold text-slate-800 dark:text-slate-200">
                      Q{idx + 1}. {q.prompt} ({q.points} pts)
                    </p>
                    {q.choices ? (
                      <div className="space-y-1">
                        {q.choices.map(c => (
                          <label key={c} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 cursor-pointer">
                            <input
                              type="radio"
                              name={q.id}
                              value={c}
                              checked={answers[q.id] === c}
                              onChange={() => setAnswers(prev => ({ ...prev, [q.id]: c }))}
                              className="text-indigo-600"
                            />
                            <span>{c}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <input
                        type="text"
                        placeholder="Type answer formula..."
                        value={answers[q.id] || ''}
                        onChange={e => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs"
                      />
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => setIsHwSubmitted(true)}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Assignment</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Interactive Exam Modal (Section 26) */}
      {activeExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {activeExam.title}
                </h3>
                <span className="text-xs text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> 42:15 Remaining
                </span>
              </div>
              <button
                onClick={() => setActiveExam(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {examSubmittedScore ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-slate-900 dark:text-white">
                    Assessment Completed!
                  </h4>
                  <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono mt-1">
                    {examSubmittedScore.score} / {examSubmittedScore.total} ({examSubmittedScore.pct}%)
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Teacher Feedback: "Excellent conceptual understanding in circular motion!"
                  </p>
                </div>
                <button
                  onClick={() => setActiveExam(null)}
                  className="py-2.5 px-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold"
                >
                  Close Exam
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {activeExam.questions.map((q, idx) => (
                  <div key={q.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                    <p className="font-bold text-slate-900 dark:text-white text-sm">
                      Question {idx + 1}: {q.prompt}
                    </p>
                    <div className="space-y-1.5 pt-1">
                      {q.choices?.map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => handleSelectExamAnswer(q.id, c)}
                          className={`w-full text-start p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                            examAnswers[q.id] === c
                              ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-500'
                              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleFinishExam}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  Submit & Finish Assessment
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
