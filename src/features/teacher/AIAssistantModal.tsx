import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { storageService } from '../../services/storageService';
import {
  Sparkles,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Edit3,
  X,
  Loader2,
  Send,
  Eye
} from 'lucide-react';

interface AIAssistantModalProps {
  onClose: () => void;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({ onClose }) => {
  const { t, language } = useLanguage();

  const [mode, setMode] = useState<'digitize' | 'generate'>('digitize');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDigitized, setIsDigitized] = useState(false);

  // AI Generation parameters
  const [genSubject, setGenSubject] = useState('Physics');
  const [genGrade, setGenGrade] = useState('Grade 11');
  const [genTopic, setGenTopic] = useState('Newtonian Gravitation & Orbital Motion');
  const [genDifficulty, setGenDifficulty] = useState('Medium');
  const [genCount, setGenCount] = useState(3);

  // Editable Draft Questions (Rule 15: AI must never auto-publish without review)
  const [questions, setQuestions] = useState([
    {
      id: 'q_ai_1',
      prompt: 'If the distance between two planetary masses is doubled, the gravitational force between them is:',
      choices: ['Doubled', 'Halved', 'Quartered (1/4)', 'Remains unchanged'],
      correctAnswer: 'Quartered (1/4)',
      points: 5
    },
    {
      id: 'q_ai_2',
      prompt: 'Calculate the orbital velocity of a satellite orbiting Earth at an altitude where g = 4.9 m/s² and orbital radius R = 8000 km.',
      choices: ['6.26 km/s', '7.92 km/s', '9.80 km/s', '11.2 km/s'],
      correctAnswer: '6.26 km/s',
      points: 5
    }
  ]);

  const [publishSuccess, setPublishSuccess] = useState(false);

  const handleSimulateScan = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsDigitized(true);
    }, 1200);
  };

  const handleGenerateAI = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsDigitized(true);
      setQuestions([
        {
          id: `q_ai_${Date.now()}_1`,
          prompt: `According to Kepler's Third Law in ${genTopic}, the square of the orbital period is proportional to:`,
          choices: ['The cube of the semi-major axis', 'The square root of orbital speed', 'The radius directly', 'Inverse square of mass'],
          correctAnswer: 'The cube of the semi-major axis',
          points: 5
        },
        {
          id: `q_ai_${Date.now()}_2`,
          prompt: 'Which physical quantity remains conserved during elliptical planetary orbit around the Sun?',
          choices: ['Linear momentum', 'Angular momentum', 'Kinetic energy alone', 'Gravitational potential alone'],
          correctAnswer: 'Angular momentum',
          points: 5
        }
      ]);
    }, 1400);
  };

  const handleAddQuestion = () => {
    setQuestions(prev => [
      ...prev,
      {
        id: `q_user_${Date.now()}`,
        prompt: 'New Question: Enter problem statement here...',
        choices: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: 'Option A',
        points: 5
      }
    ]);
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  const handleUpdatePrompt = (id: string, text: string) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, prompt: text } : q));
  };

  const handleUpdateChoice = (id: string, choiceIdx: number, val: string) => {
    setQuestions(prev => prev.map(q => {
      if (q.id !== id) return q;
      const updated = [...q.choices];
      updated[choiceIdx] = val;
      return { ...q, choices: updated };
    }));
  };

  const handlePublish = () => {
    storageService.addHomework({
      id: `hw_${Date.now()}`,
      teacherId: 'user_teacher_1',
      teacherName: 'Mr. Ahmed Hassan',
      centerId: 'center_kayedu',
      assignedDate: '2026-09-08',
      status: 'PUBLISHED',
      title: 'Physics Gravitation & Orbital Motion Quiz (AI Digitized)',
      subject: genSubject,
      grade: genGrade,
      dueDate: '2026-09-18 23:59',
      instructions: 'Solve all questions. AI parsed and teacher verified.',
      questionsCount: questions.length,
      questions: questions as any
    });
    setPublishSuccess(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                {t('aiAssistant')}
              </h3>
              <p className="text-[11px] text-slate-500">
                OCR Assessment Digitizer & Smart Generator
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold">
          <button
            onClick={() => { setMode('digitize'); setIsDigitized(false); }}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              mode === 'digitize'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {t('digitizeWithAI')} (Upload Paper / PDF)
          </button>
          <button
            onClick={() => { setMode('generate'); setIsDigitized(false); }}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              mode === 'generate'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            AI Question Generator
          </button>
        </div>

        {/* Mode 1: Digitize upload */}
        {mode === 'digitize' && !isDigitized && (
          <div className="space-y-3">
            <div
              onClick={handleSimulateScan}
              className="border-2 border-dashed border-indigo-300 dark:border-indigo-800 rounded-3xl p-6 text-center cursor-pointer hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 transition-all space-y-3"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 mx-auto flex items-center justify-center">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Drop paper exam worksheet or click to scan
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Supports camera photos, scanned PDFs, or typed docs
                </p>
              </div>
              <button
                type="button"
                className="py-2 px-4 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-md"
              >
                Simulate OCR Scanning
              </button>
            </div>
          </div>
        )}

        {/* Mode 2: Generate config */}
        {mode === 'generate' && !isDigitized && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Subject</label>
                <input
                  type="text"
                  value={genSubject}
                  onChange={e => setGenSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Grade</label>
                <input
                  type="text"
                  value={genGrade}
                  onChange={e => setGenGrade(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 text-xs">Curriculum Topic</label>
              <input
                type="text"
                value={genTopic}
                onChange={e => setGenTopic(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Difficulty</label>
                <select
                  value={genDifficulty}
                  onChange={e => setGenDifficulty(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                >
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                  <option>Thanaweya Amma Exam Level</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Question Count</label>
                <input
                  type="number"
                  value={genCount}
                  onChange={e => setGenCount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleGenerateAI}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate Questions with KAYEDU AI</span>
            </button>
          </div>
        )}

        {/* Loading spinner */}
        {isProcessing && (
          <div className="text-center py-8 space-y-2">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
              KAYEDU AI is structuring question draft...
            </p>
          </div>
        )}

        {/* Review & Edit Screen (Rule 15: Mandatory Teacher Review) */}
        {isDigitized && !isProcessing && (
          <div className="space-y-4 animate-in fade-in">
            {publishSuccess ? (
              <div className="text-center py-6 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Assessment Published Successfully!
                </h4>
                <p className="text-xs text-slate-500">
                  Students enrolled in your Grade 11 Physics groups have been notified.
                </p>
                <button
                  onClick={onClose}
                  className="py-2 px-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-amber-800 dark:text-amber-300 text-[11px]">
                    <strong>Mandatory Teacher Review:</strong> Please review and adjust the AI-parsed questions, options, and points before publishing.
                  </p>
                </div>

                <div className="space-y-3">
                  {questions.map((q, idx) => (
                    <div
                      key={q.id}
                      className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          Q{idx + 1} ({q.points} pts)
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="text-rose-500 hover:text-rose-700 p-1"
                          title="Delete question"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <textarea
                        value={q.prompt}
                        onChange={e => handleUpdatePrompt(q.id, e.target.value)}
                        rows={2}
                        className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs"
                      />

                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Options (Select radio for correct answer):
                        </span>
                        {q.choices.map((c, cIdx) => (
                          <div key={cIdx} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`correct_${q.id}`}
                              checked={q.correctAnswer === c}
                              onChange={() => {
                                setQuestions(prev => prev.map(item => item.id === q.id ? { ...item, correctAnswer: c } : item));
                              }}
                              className="text-indigo-600"
                            />
                            <input
                              type="text"
                              value={c}
                              onChange={e => handleUpdateChoice(q.id, cIdx, e.target.value)}
                              className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="px-3 py-1.5 rounded-xl border border-indigo-200 text-indigo-600 dark:border-indigo-800 dark:text-indigo-400 text-xs font-bold flex items-center gap-1 hover:bg-indigo-50"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Question</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePublish}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Approve & Publish to Students</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
