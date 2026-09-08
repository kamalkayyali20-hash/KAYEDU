import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { storageService } from '../../services/storageService';
import { X, Plus, Trash2, Send, BookOpen } from 'lucide-react';

interface CreateHomeworkModalProps {
  onClose: () => void;
  onPublished: () => void;
}

export const CreateHomeworkModal: React.FC<CreateHomeworkModalProps> = ({ onClose, onPublished }) => {
  const { t, language } = useLanguage();

  const [title, setTitle] = useState('Physics Weekly Review — Forces & Circular Motion');
  const [subject, setSubject] = useState('Physics');
  const [grade, setGrade] = useState('Grade 11');
  const [dueDate, setDueDate] = useState('2026-09-15 23:59');
  const [instructions, setInstructions] = useState('Answer all questions. Show working formulas.');

  const [questions, setQuestions] = useState([
    {
      id: 'q_1',
      prompt: 'State Newton’s First Law of Motion and provide a real-world example.',
      points: 5
    },
    {
      id: 'q_2',
      prompt: 'A car moves along a circular path of radius 50m with velocity 15m/s. Calculate centripetal acceleration.',
      points: 5
    }
  ]);

  const handleAddQuestion = () => {
    setQuestions(prev => [
      ...prev,
      {
        id: `q_${Date.now()}`,
        prompt: 'New Question Prompt...',
        points: 5
      }
    ]);
  };

  const handlePublish = () => {
    storageService.addHomework({
      id: `hw_manual_${Date.now()}`,
      teacherId: 'user_teacher_1',
      teacherName: 'Mr. Ahmed Hassan',
      centerId: 'center_kayedu',
      assignedDate: '2026-09-08',
      status: 'PUBLISHED',
      title,
      subject,
      grade,
      dueDate,
      instructions,
      questionsCount: questions.length,
      questions: questions as any
    });
    onPublished();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              Create New Homework Assignment
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Grade</label>
              <input
                type="text"
                value={grade}
                onChange={e => setGrade(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Due Date</label>
            <input
              type="text"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Instructions</label>
            <textarea
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
              rows={2}
              className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
            />
          </div>

          {/* Question Builder */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700 dark:text-slate-300">Questions ({questions.length})</span>
              <button
                type="button"
                onClick={handleAddQuestion}
                className="text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Question</span>
              </button>
            </div>

            {questions.map((q, idx) => (
              <div key={q.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-600 font-mono">Q{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => setQuestions(prev => prev.filter(item => item.id !== q.id))}
                    className="text-rose-500 hover:text-rose-700 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <input
                  type="text"
                  value={q.prompt}
                  onChange={e => {
                    const text = e.target.value;
                    setQuestions(prev => prev.map(item => item.id === q.id ? { ...item, prompt: text } : item));
                  }}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            onClick={handlePublish}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5"
          >
            <Send className="w-4 h-4" />
            <span>Publish Assignment</span>
          </button>
        </div>
      </div>
    </div>
  );
};
